import { publicationDocumentUrl } from "@/lib/publication-documents.mjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { getUsedMediaUrls } from "@/lib/db";
import { getMediaLibrary } from "@/lib/media-library.mjs";

export async function GET(request) {
  const { env } = await getCloudflareContext({ async: true });
  const headers = { "Cache-Control": "no-store" };
  if (!(await isAdminRequest(request, env))) return Response.json({ error: "Non autorisé." }, { status: 401, headers });
  try { return Response.json({ items: await getMediaLibrary(env) }, { headers }); }
  catch { return Response.json({ error: "La médiathèque est momentanément indisponible. Réessayez." }, { status: 503, headers }); }
}

// Supprime un média du bucket R2, sauf s'il est encore référencé en base.
export async function DELETE(request) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Origine refusée." }, { status: 403 });

  let data;
  try { data = await request.json(); } catch { return Response.json({ error: "Demande JSON invalide." }, { status: 400 }); }
  const key = data?.key;
  if (!key || typeof key !== "string" || (!/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif|webp)$/.test(key) && !publicationDocumentUrl(key))) {
    return Response.json({ error: "Clé manquante." }, { status: 400 });
  }

  const documentUrl=publicationDocumentUrl(key);
  if (!env.UPLOADS) return Response.json({ error: "Stockage des images indisponible." }, { status: 503 });
  let used;
  try { used = await getUsedMediaUrls({ strict: true }); }
  catch { return Response.json({ error: "Impossible de vérifier où cette image est utilisée. Aucune suppression effectuée." }, { status: 503 }); }
  if (used.has(documentUrl||`/uploads/${key}`)) {
    return Response.json({ error: "Ce fichier est encore utilisé sur le site." }, { status: 409 });
  }

  await env.UPLOADS.delete(key);
  return Response.json({ success: true });
}
