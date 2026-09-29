import { cookies } from "next/headers";

const COOKIE_NAME = "eg_admin_session";
const SESSION_HOURS = 12;

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(sig);
}

// Comparaison en temps constant (évite de deviner une signature caractère par caractère).
export function safeEqual(a, b) {
  const enc = new TextEncoder();
  const x = enc.encode(String(a));
  const y = enc.encode(String(b));
  let diff = x.length ^ y.length;
  const len = Math.max(x.length, y.length);
  for (let i = 0; i < len; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export async function createSessionCookieValue(env) {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = `admin.${expires}`;
  const sig = await sign(payload, env.ADMIN_PASSWORD);
  return `${payload}.${sig}`;
}

async function verifyToken(token, env) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expires, sig] = parts;
  if (role !== "admin") return false;
  if (Date.now() > Number(expires)) return false;
  const expectedSig = await sign(`${role}.${expires}`, env.ADMIN_PASSWORD);
  return safeEqual(sig, expectedSig);
}

export async function isAdminAuthenticated(env) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifyToken(token, env);
}

export async function isAdminRequest(request, env) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const token = match ? decodeURIComponent(match[1]) : null;
  return verifyToken(token, env);
}

export { COOKIE_NAME };
