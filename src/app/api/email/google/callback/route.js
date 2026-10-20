import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest, safeEqual } from "@/lib/adminAuth";
import { GMAIL_OWNER, GMAIL_SCOPE, OAUTH_COOKIE, configured, googleToken, redirectUri, saveConnection, unseal } from "@/lib/gmail.mjs";

const FAILURES = {
  cookie_missing: "Le témoin de connexion est absent. Gardez le même navigateur et autorisez les cookies du site.",
  cookie_invalid: "Le témoin de connexion ne peut plus être vérifié. Recommencez après toute modification des secrets Google.",
  state_expired: "La tentative de connexion a expiré après dix minutes. Recommencez la connexion.",
  state_invalid: "La tentative ne correspond pas à celle de ce navigateur. Fermez les anciennes tentatives et recommencez.",
  authorization_denied: "L’autorisation Google n’a pas été accordée. Acceptez l’autorisation d’envoyer des emails.",
  token_exchange: "L’échange avec Google a échoué. Recommencez ; si le problème persiste, vérifiez la configuration Google.",
  invalid_client: "Google refuse les identifiants de l’application. Vérifiez que GOOGLE_CLIENT_SECRET est le secret actif du même client Web que GOOGLE_CLIENT_ID.",
  deleted_client: "Le client Google a été supprimé. Configurez un client Web actif et son secret correspondant.",
  invalid_grant: "Google refuse le code de cette tentative. Ne rechargez pas cette page de retour : recommencez la connexion depuis le début.",
  invalid_request: "Google refuse la demande d’échange. La configuration de la connexion doit être vérifiée.",
  unauthorized_client: "Ce client Google n’est pas autorisé à utiliser ce type de connexion. Vérifiez qu’il s’agit d’une application Web.",
  scope_missing: "L’autorisation Gmail d’envoyer des emails manque. Recommencez et cochez cette autorisation sur l’écran Google.",
  refresh_missing: "Google n’a pas fourni l’autorisation de connexion durable. Recommencez et acceptez toutes les autorisations demandées.",
  account_verification: "Le site n’a pas pu vérifier le compte auprès de Google. Réessayez la connexion.",
  wrong_account: "Le compte autorisé doit être kevinkandet05@gmail.com. Recommencez avec ce compte.",
  storage: "L’autorisation a été obtenue, mais son enregistrement dans le site a échoué. La base de données doit être vérifiée.",
};

export async function GET(request) {
  const { env } = await getCloudflareContext({ async: true });
  const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "Set-Cookie": `${OAUTH_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` };
  if (!(await isAdminRequest(request, env))) return new Response("Session administrateur requise. Reconnectez-vous puis recommencez.", { status: 401, headers });
  if (!configured(env)) return new Response("Configuration Google manquante", { status: 503, headers });
  let stage = "cookie_missing";
  try {
    const url = new URL(request.url);
    const cookie = (request.headers.get("cookie") || "").split(";").map(x => x.trim()).find(x => x.startsWith(`${OAUTH_COOKIE}=`))?.slice(OAUTH_COOKIE.length + 1);
    if (!cookie) throw new Error("Missing state");
    stage = "cookie_invalid";
    const state = await unseal(cookie, env);
    stage = "state_expired";
    if (!Number.isFinite(state.expires) || state.expires < Date.now()) throw new Error("Expired state");
    stage = "state_invalid";
    if (!state.state || !state.verifier || !url.searchParams.get("state") || !safeEqual(state.state, url.searchParams.get("state"))) throw new Error("Invalid state");
    stage = "authorization_denied";
    const code = url.searchParams.get("code");
    if (!code || url.searchParams.has("error")) throw new Error("Authorization declined");
    stage = "token_exchange";
    const token = await googleToken({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri(request), grant_type: "authorization_code", code, code_verifier: state.verifier });
    stage = "scope_missing";
    if (!token.scope?.split(" ").includes(GMAIL_SCOPE)) throw new Error("Missing Gmail permission");
    stage = "refresh_missing";
    if (!token.refresh_token) throw new Error("Missing refresh token");
    stage = "account_verification";
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error("Account verification failed");
    const user = await response.json();
    stage = "wrong_account";
    if (!user.email_verified || user.email?.toLowerCase() !== GMAIL_OWNER) throw new Error("Wrong account");
    stage = "storage";
    await saveConnection(env, token.refresh_token);
    return new Response(null, { status: 303, headers: { ...headers, Location: "/api/email/google" } });
  } catch (error) {
    const code = stage === "token_exchange" && Object.hasOwn(FAILURES, error?.oauthCode) ? error.oauthCode : stage;
    // Messages fixes seulement : aucun paramètre de requête ni réponse Google.
    return new Response(`Connexion non finalisée (${code}). ${FAILURES[code]} Recommencez depuis /api/email/google.`, { status: 400, headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" } });
  }
}
