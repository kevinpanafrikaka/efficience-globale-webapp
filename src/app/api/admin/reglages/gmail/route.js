import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { verifyGmailAuthorization } from "@/lib/gmail.mjs";

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  const headers = { "Cache-Control": "no-store" };
  if (!(await isAdminRequest(request, env))) return Response.json({ error: "Non autorisé." }, { status: 401, headers });
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Origine refusée." }, { status: 403, headers });
  return Response.json(await verifyGmailAuthorization(env), { headers });
}
