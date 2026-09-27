import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { updateProjet, deleteProjet } from "@/lib/db";

export async function PUT(request, { params }) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const data = await request.json();
  if (!data.titre || !data.secteur) {
    return Response.json({ error: "Titre et secteur sont requis." }, { status: 400 });
  }

  await updateProjet(id, data);
  return Response.json({ success: true });
}

export async function DELETE(request, { params }) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  await deleteProjet(id);
  return Response.json({ success: true });
}
