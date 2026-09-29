import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { getUsedMediaUrls } from "@/lib/db";

// Supprime un média du bucket R2, sauf s'il est encore référencé en base.
export async function DELETE(request) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { key } = await request.json();
  if (!key || typeof key !== "string") {
    return Response.json({ error: "Clé manquante." }, { status: 400 });
  }

  const used = await getUsedMediaUrls();
  if (used.has(`/uploads/${key}`)) {
    return Response.json({ error: "Cette image est encore utilisée sur le site." }, { status: 409 });
  }

  await env.UPLOADS.delete(key);
  return Response.json({ success: true });
}
