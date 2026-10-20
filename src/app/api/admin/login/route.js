import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSessionCookieValue, safeEqual, COOKIE_NAME } from "@/lib/adminAuth";
import { isLoginBlocked, recordFailedLogin, clearFailedLogins } from "@/lib/loginThrottle";

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "inconnue";

  if (await isLoginBlocked(ip)) {
    return Response.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429, headers: { "Retry-After": "900" } }
    );
  }

  let data;
  try { data = await request.json(); } catch { return Response.json({ error: "Demande de connexion invalide." }, { status: 400 }); }
  const password = data?.password;

  if (typeof password !== "string" || !password || !env.ADMIN_PASSWORD || !safeEqual(password, env.ADMIN_PASSWORD)) {
    await recordFailedLogin(ip);
    return Response.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  await clearFailedLogins(ip);
  const value = await createSessionCookieValue(env);
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${12 * 60 * 60}`
  );

  return Response.json({ success: true }, { headers });
}
