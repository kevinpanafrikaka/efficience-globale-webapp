import { COOKIE_NAME } from "@/lib/adminAuth";

export async function POST() {
  const headers = new Headers();
  headers.append("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  return Response.json({ success: true }, { headers });
}
