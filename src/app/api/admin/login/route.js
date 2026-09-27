import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSessionCookieValue, COOKIE_NAME } from "@/lib/adminAuth";

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  const { password } = await request.json();

  if (!password || password !== env.ADMIN_PASSWORD) {
    return Response.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  const value = await createSessionCookieValue(env);
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${12 * 60 * 60}`
  );

  return Response.json({ success: true }, { headers });
}
