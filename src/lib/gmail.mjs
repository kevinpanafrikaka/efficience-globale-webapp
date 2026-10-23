import { emailAttachments } from "./email-attachments.mjs";
// Server-side only: never import this module from a client component.
export const GMAIL_OWNER = "kevinkandet05@gmail.com";
export const GMAIL_RECIPIENT = "oumar.camara@efficienceglobale.com";
export const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.send";
export const CALLBACK_PATH = "/api/email/google/callback";
export const OAUTH_COOKIE = "__Host-eg_gmail_oauth";
const encoder = new TextEncoder();

export function base64url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

async function encryptionKey(env) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`eg-gmail-v1:${env.GOOGLE_CLIENT_SECRET}`));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function seal(value, env) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await encryptionKey(env), encoder.encode(JSON.stringify(value)));
  return `${base64url(iv)}.${base64url(new Uint8Array(data))}`;
}

export async function unseal(value, env) {
  const parts = value.split(".");
  if (parts.length !== 2 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part) || base64url(Buffer.from(part, "base64url")) !== part)) throw new Error("Invalid encrypted value");
  const [iv, ciphertext] = parts;
  const data = await crypto.subtle.decrypt({ name: "AES-GCM", iv: Buffer.from(iv, "base64url") }, await encryptionKey(env), Buffer.from(ciphertext, "base64url"));
  return JSON.parse(new TextDecoder().decode(data));
}

export function configured(env) {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

export function redirectUri(request) {
  return new URL(CALLBACK_PATH, new URL(request.url).origin).href;
}

export async function googleToken(params) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params), signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) {
    const error = new Error("Gmail authorization failed");
    // Conserver uniquement un code standard connu, jamais la réponse Google,
    // ses descriptions, les identifiants, codes d'autorisation ou jetons.
    const allowed = ["invalid_client", "invalid_grant", "invalid_request", "unauthorized_client", "deleted_client"];
    if (allowed.includes(result.error)) error.oauthCode = result.error;
    throw error;
  }
  return result;
}

export async function saveConnection(env, refreshToken) {
  const encrypted = await seal({ refreshToken }, env);
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS gmail_connection (id INTEGER PRIMARY KEY CHECK (id = 1), token TEXT NOT NULL)").run();
  await env.DB.prepare("INSERT INTO gmail_connection (id, token) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET token = excluded.token").bind(encrypted).run();
}

async function connection(env) {
  const table = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'gmail_connection'").first();
  if (!table) return null;
  return env.DB.prepare("SELECT token FROM gmail_connection WHERE id = 1").first();
}

export async function isGmailConnected(env) {
  return configured(env) && Boolean(await connection(env));
}

export function buildMime({ nom, email, sujet, message, attachments = [] }) {
  // All user content in headers is encoded or strictly validated against CR/LF.
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new Error("Invalid reply address");
  const subject = sujet ? `Nouveau message : ${sujet}` : "Nouveau message depuis le site";
  const chunks = [""];
  for (const character of subject) {
    if (Buffer.byteLength(chunks.at(-1) + character, "utf8") > 30) chunks.push("");
    chunks[chunks.length - 1] += character;
  }
  const encodedSubject = chunks.map(part => `=?UTF-8?B?${Buffer.from(part, "utf8").toString("base64")}?=`).join("\r\n ");
  const body = Buffer.from(`De : ${nom} (${email})\n\n${message}`, "utf8").toString("base64").match(/.{1,76}/g).join("\r\n");
  const files = emailAttachments(attachments);
  const headers = [
    `From: Site Efficience Globale <${GMAIL_OWNER}>`,
    `To: ${GMAIL_RECIPIENT}`, `Reply-To: ${email}`,
    `Subject: ${encodedSubject}`, "MIME-Version: 1.0",
  ];
  if (!files.length) return [...headers, "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", body].join("\r\n");
  const boundary = `eg_${crypto.randomUUID()}`;
  return [...headers, `Content-Type: multipart/mixed; boundary="${boundary}"`, "",
    `--${boundary}`, "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", body,
    ...files.flatMap(file => [`--${boundary}`, `Content-Type: application/pdf; name="${file.name}"`,
      `Content-Disposition: attachment; filename="${file.name}"`, "Content-Transfer-Encoding: base64", "", file.content.match(/.{1,76}/g).join("\r\n")]),
    `--${boundary}--`, "",
  ].join("\r\n");
}

export async function sendGmail(env, message) {
  const row = await connection(env);
  if (!row) throw new Error("Gmail is not connected");
  const { refreshToken } = await unseal(row.token, env);
  const token = await googleToken({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, grant_type: "refresh_token", refresh_token: refreshToken });
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST", headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: base64url(encoder.encode(buildMime(message))) }), signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Gmail delivery failed");
  const result = await response.json();
  if (!result.id) throw new Error("Gmail delivery not confirmed");
  return result.id;
}

