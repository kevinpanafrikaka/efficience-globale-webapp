import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { updateMembre, deleteMembre } from "@/lib/db";

export async function PUT(request, { params }) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const data = await request.json();
  if (!data.nom) {
    return Response.json({ error: "Le nom est requis." }, { status: 400 });
  }

  await updateMembre(id, data);
  return Response.json({ success: true });
}

export async function DELETE(request, { params }) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  await deleteMembre(id);
  return Response.json({ success: true });
}
