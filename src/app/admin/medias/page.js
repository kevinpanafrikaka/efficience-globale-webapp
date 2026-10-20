import AdminImage from "@/components/admin/AdminImage";
import { adminPageAllowed } from "@/lib/admin-page";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getUsedMediaUrls } from "@/lib/db";
import MediaDeleteButton from "@/components/admin/MediaDeleteButton";
import MediaUpload from "@/components/admin/MediaUpload";

export const dynamic = "force-dynamic";

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default async function AdminMediasPage() {
  if (!(await adminPageAllowed())) return null;
  const { env } = await getCloudflareContext({ async: true });

  const objects = [];
  let cursor;
  do {
    const page = await env.UPLOADS.list({ cursor, limit: 500 });
    objects.push(...page.objects);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  objects.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));

  const used = await getUsedMediaUrls();
  const inutilises = objects.filter((o) => !used.has(`/uploads/${o.key}`)).length;

  return (
    <div>
      <h1 className="text-[24px] mb-2">Médias</h1>
      <p className="text-[14px] text-ink-soft mb-6">
        {objects.length} image{objects.length > 1 ? "s" : ""} envoyée{objects.length > 1 ? "s" : ""}
        {inutilises > 0 && ` · ${inutilises} inutilisée${inutilises > 1 ? "s" : ""} (supprimables)`}. Les images du
        dossier du projet (logos, héros) ne sont pas listées ici.
      </p>

      <MediaUpload />
      {objects.length === 0 ? (
        <p className="text-[14.5px] text-ink-soft">Aucune image envoyée pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {objects.map((o) => {
            const isUsed = used.has(`/uploads/${o.key}`);
            return (
              <div key={o.key} className="border border-line rounded-lg overflow-hidden bg-white flex flex-col">
                <div className="relative h-32 bg-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <AdminImage src={`/uploads/${o.key}`} alt="" className="w-full h-full object-cover" />
                  <span
                    className={`absolute top-2 left-2 text-[10.5px] font-bold tracking-wide px-1.5 py-0.5 rounded ${
                      isUsed ? "bg-lime text-ink" : "bg-white text-ink-faint"
                    }`}
                  >
                    {isUsed ? "UTILISÉE" : "INUTILISÉE"}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <span className="text-[12px] text-ink-faint">{formatSize(o.size)}</span>
                  {!isUsed && <MediaDeleteButton mediaKey={o.key} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
