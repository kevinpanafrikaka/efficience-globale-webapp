import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { setMessageLu, deleteMessage } from "@/lib/db";

export async function PUT(request, { params }) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  let data;
  try { data = await request.json(); } catch { return Response.json({ error: "Demande JSON invalide." }, { status: 400 }); }
  if (typeof data?.lu !== "boolean") return Response.json({ error: "Le statut lu doit être vrai ou faux." }, { status: 400 });
  await setMessageLu(id, data.lu);
  return Response.json({ success: true });
}

export async function DELETE(request, { params }) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  await deleteMessage(id);
  return Response.json({ success: true });
}
