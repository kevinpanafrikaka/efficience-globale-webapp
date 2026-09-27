import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { updateAnnonce, deleteAnnonce } from "@/lib/db";

export async function PUT(request, { params }) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const data = await request.json();
  if (!data.titre || !data.texte || !data.date) {
    return Response.json({ error: "Titre, texte et date sont requis." }, { status: 400 });
  }

  await updateAnnonce(id, data);
  return Response.json({ success: true });
}

export async function DELETE(request, { params }) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  await deleteAnnonce(id);
  return Response.json({ success: true });
}
