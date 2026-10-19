import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { GMAIL_OWNER, GMAIL_SCOPE, OAUTH_COOKIE, base64url, configured, isGmailConnected, redirectUri, seal } from "@/lib/gmail.mjs";

const HEADERS = { "Cache-Control": "no-store", "Referrer-Policy": "same-origin", "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src 'none'; form-action 'self' https://accounts.google.com; frame-ancestors 'none'; base-uri 'none'" };

export async function GET(request) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) return new Response("Connectez-vous à l’administration du site, puis rouvrez ce lien.", { status: 401, headers: HEADERS });
  if (!configured(env)) return new Response("Ajoutez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET aux secrets du Worker portfolio dans Cloudflare, puis rouvrez ce lien.", { status: 503, headers: HEADERS });
  const connected = await isGmailConnected(env);
  return new Response(`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Connexion Gmail</title><body><h1>Notifications du formulaire</h1><p>${connected ? "Gmail est connecté. Les nouvelles notifications sont destinées à oumar.camara@efficienceglobale.com." : "Autorisez le site à envoyer les notifications depuis votre compte Gmail vers oumar.camara@efficienceglobale.com."}</p><form method="post"><button type="submit">${connected ? "Renouveler l’autorisation Google" : "Connecter Gmail"}</button></form></body></html>`, { headers: HEADERS });
}

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) return new Response("Non autorisé", { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return new Response("Origine refusée", { status: 403 });
  if (!configured(env)) return new Response("Configuration Google manquante", { status: 503 });
  const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
  const cookie = await seal({ state, verifier, expires: Date.now() + 600000 }, env);
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: redirectUri(request), response_type: "code", scope: `openid email ${GMAIL_SCOPE}`, access_type: "offline", prompt: "consent", login_hint: GMAIL_OWNER, state, code_challenge: challenge, code_challenge_method: "S256" }).toString();
  return new Response(null, { status: 303, headers: { Location: url.href, "Cache-Control": "no-store", "Set-Cookie": `${OAUTH_COOKIE}=${cookie}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600` } });
}
