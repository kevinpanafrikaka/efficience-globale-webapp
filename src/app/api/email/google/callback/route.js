import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest, safeEqual } from "@/lib/adminAuth";
import { GMAIL_OWNER, GMAIL_SCOPE, OAUTH_COOKIE, configured, googleToken, redirectUri, saveConnection, unseal } from "@/lib/gmail.mjs";

export async function GET(request) {
  const { env } = await getCloudflareContext({ async: true });
  const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "Set-Cookie": `${OAUTH_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` };
  if (!(await isAdminRequest(request, env))) return new Response("Session administrateur requise. Reconnectez-vous puis recommencez.", { status: 401, headers });
  if (!configured(env)) return new Response("Configuration Google manquante", { status: 503, headers });
  try {
    const url = new URL(request.url);
    const cookie = (request.headers.get("cookie") || "").split("; ").find(x => x.startsWith(`${OAUTH_COOKIE}=`))?.slice(OAUTH_COOKIE.length + 1);
    if (!cookie) throw new Error("Missing state");
    const state = await unseal(cookie, env);
    if (state.expires < Date.now() || !url.searchParams.get("state") || !safeEqual(state.state, url.searchParams.get("state"))) throw new Error("Invalid state");
    const code = url.searchParams.get("code");
    if (!code || url.searchParams.has("error")) throw new Error("Authorization declined");
    const token = await googleToken({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri(request), grant_type: "authorization_code", code, code_verifier: state.verifier });
    if (!token.refresh_token || !token.scope?.split(" ").includes(GMAIL_SCOPE)) throw new Error("Incomplete authorization");
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error("Account verification failed");
    const user = await response.json();
    if (!user.email_verified || user.email?.toLowerCase() !== GMAIL_OWNER) throw new Error("Wrong account");
    await saveConnection(env, token.refresh_token);
    return new Response(null, { status: 303, headers: { ...headers, Location: "/api/email/google" } });
  } catch {
    // Do not expose or log Google responses, authorization codes or tokens.
    return new Response("Connexion non finalisée. Utilisez le compte kevinkandet05@gmail.com et accordez l’autorisation d’envoyer des emails. Recommencez depuis /api/email/google.", { status: 400, headers });
  }
}
