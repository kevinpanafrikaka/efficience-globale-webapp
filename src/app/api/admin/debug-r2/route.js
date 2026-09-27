import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";

export async function GET(request) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const hasBinding = !!env.UPLOADS;
  let listing = null;
  let listError = null;
  try {
    const result = await env.UPLOADS.list();
    listing = result.objects.map((o) => ({ key: o.key, size: o.size, uploaded: o.uploaded }));
  } catch (e) {
    listError = String(e);
  }

  return Response.json({ hasBinding, listing, listError });
}
