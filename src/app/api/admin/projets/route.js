import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { createProjet } from "@/lib/db";

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const data = await request.json();
  if (!data.titre || !data.secteur) {
    return Response.json({ error: "Titre et secteur sont requis." }, { status: 400 });
  }

  const id = await createProjet(data);
  return Response.json({ success: true, id });
}
