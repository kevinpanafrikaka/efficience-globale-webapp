import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { setMessageLu, deleteMessage } from "@/lib/db";

export async function PUT(request, { params }) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const { lu } = await request.json();
  await setMessageLu(id, !!lu);
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
