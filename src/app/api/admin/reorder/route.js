import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { moveItem } from "@/lib/db";

const TABLES = ["projets", "membres", "partenaires"];

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  let data;
  try { data = await request.json(); } catch { return Response.json({ error: "Demande JSON invalide." }, { status: 400 }); }
  const { table, id, targetId } = data || {};
  if (!TABLES.includes(table) || typeof id !== "string" || typeof targetId !== "string" || !id || !targetId) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  await moveItem(table, id, targetId);
  return Response.json({ success: true });
}
