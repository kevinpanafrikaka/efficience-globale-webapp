import { adminPageAllowed } from "@/lib/admin-page";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getMediaLibrary } from "@/lib/media-library.mjs";
import MediaLibrary from "@/components/admin/MediaLibrary";

export const dynamic = "force-dynamic";

export default async function AdminMediasPage() {
  if (!(await adminPageAllowed())) return null;
  const { env } = await getCloudflareContext({ async: true });
  try { return <MediaLibrary items={await getMediaLibrary(env)}/>; }
  catch { return <div className="media-empty" role="alert"><p>La médiathèque est momentanément indisponible.</p><a href="/admin/medias" className="eg-button eg-button--secondary eg-button--compact">Réessayer</a></div>; }
}
