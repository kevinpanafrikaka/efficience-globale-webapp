import { DEFAULT_NOTIFICATION_RECIPIENTS, readNotificationRecipients, validateNotificationRecipients } from "./notification-recipients.mjs";
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
    error.mailStage = "authorization"; error.httpStatus = response.status;
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

// Check only the saved Google authorization; never send an email or return tokens.
export async function verifyGmailAuthorization(env) {
  const checkedAt = new Date().toISOString();
  if (!configured(env)) return { status: "unconfigured", checkedAt, message: "La configuration Google doit être complétée." };
  try {
    const row = await connection(env);
    if (!row) return { status: "disconnected", checkedAt, message: "Connectez le compte Gmail pour activer les envois." };
    let saved;
    try { saved = await unseal(row.token, env); }
    catch { return { status: "invalid", checkedAt, message: "L’autorisation enregistrée ne peut plus être lue. Reconnectez Gmail." }; }
    if (typeof saved?.refreshToken !== "string" || !saved.refreshToken) return { status: "invalid", checkedAt, message: "L’autorisation est incomplète. Reconnectez Gmail." };
    await googleToken({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, grant_type: "refresh_token", refresh_token: saved.refreshToken });
    return { status: "verified", checkedAt, message: "Google a validé l’autorisation. Aucun email de test n’a été envoyé." };
  } catch (error) {
    if (error?.oauthCode === "invalid_grant") return { status: "invalid", checkedAt, message: "L’autorisation Google n’est plus valide. Reconnectez Gmail." };
    return { status: "unavailable", checkedAt, message: "L’autorisation n’a pas pu être vérifiée. Réessayez ou consultez la connexion Gmail." };
  }
}

export function buildMime({ nom, email, sujet, message, attachments = [], recipients = DEFAULT_NOTIFICATION_RECIPIENTS }) {
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
    `To: ${validateNotificationRecipients(recipients).join(", ")}`, `Reply-To: ${email}`,
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
  let recipients;
  try { recipients = await readNotificationRecipients(env); }
  catch (error) { error.mailStage="recipients"; throw error; }
  const id = await sendRawGmail(env, buildMime({ ...message, recipients }));
  return { id, sender: GMAIL_OWNER, recipients };
}

async function sendRawGmail(env, mime) {
  const row = await connection(env);
  if (!row) throw Object.assign(new Error("Gmail is not connected"),{mailStage:"connection"});
  let refreshToken,token;
  try { ({refreshToken}=await unseal(row.token,env)); }
  catch(error){error.mailStage="credentials";throw error;}
  try { token = await googleToken({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, grant_type: "refresh_token", refresh_token: refreshToken }); }
  catch(error){error.mailStage="authorization";throw error;}
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST", headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: base64url(encoder.encode(mime)) }), signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw Object.assign(new Error("Gmail delivery failed"),{mailStage:"sending",httpStatus:response.status});
  const result = await response.json();
  if (!result.id) throw Object.assign(new Error("Gmail delivery not confirmed"),{mailStage:"confirmation"});
  return result.id;
}


// Replies go only to the original visitor. Future replies return to the cabinet.
export function buildReplyMime({ recipient, subject, text, replyTo }) {
  const to = validateNotificationRecipients([recipient])[0];
  const returnAddresses = validateNotificationRecipients(replyTo);
  if (typeof subject !== "string" || !subject.trim() || subject.length > 200 || /[\r\n]/.test(subject)) throw new Error("Invalid subject");
  if (typeof text !== "string" || !text.trim() || text.length > 20000) throw new Error("Invalid reply");
  const parts = [""];
  for (const char of subject) {
    if (Buffer.byteLength(parts.at(-1) + char, "utf8") > 30) parts.push("");
    parts[parts.length - 1] += char;
  }
  return [
    `From: Efficience Globale <${GMAIL_OWNER}>`, `To: ${to}`,
    `Reply-To: ${returnAddresses.join(", ")}`,
    `Subject: ${parts.map(part => `=?UTF-8?B?${Buffer.from(part).toString("base64")}?=`).join("\r\n ")}`,
    "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "",
    Buffer.from(text, "utf8").toString("base64").match(/.{1,76}/g).join("\r\n"),
  ].join("\r\n");
}

export async function sendGmailReply(env, message) {
  return sendRawGmail(env, buildReplyMime(message));
}
