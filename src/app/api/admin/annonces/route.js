import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { createAnnonce } from "@/lib/db";

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const data = await request.json();
  if (!data.titre || !data.texte || !data.date) {
    return Response.json({ error: "Titre, texte et date sont requis." }, { status: 400 });
  }

  const id = await createAnnonce(data);
  return Response.json({ success: true, id });
}
