import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { createPartenaire } from "@/lib/db";

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const data = await request.json();
  if (!data.nom) {
    return Response.json({ error: "Le nom est requis." }, { status: 400 });
  }

  const id = await createPartenaire(data);
  return Response.json({ success: true, id });
}
