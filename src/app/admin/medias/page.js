import { publicationDocumentUrl } from "@/lib/publication-documents.mjs";
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
    objects.push(...page.objects.filter(object => !object.key.startsWith("private-applications/")));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  objects.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));

  const used = await getUsedMediaUrls();
  const inutilises = objects.filter((o) => !used.has(publicationDocumentUrl(o.key)||`/uploads/${o.key}`)).length;

  return (
    <div>
      <h1 className="text-[24px] mb-2">Médias</h1>
      <p className="text-[14px] text-ink-soft mb-6">
        {objects.length} fichier{objects.length > 1 ? "s" : ""} envoyé{objects.length > 1 ? "s" : ""}
        {inutilises > 0 && ` · ${inutilises} inutilisé${inutilises > 1 ? "s" : ""}`}
      </p>

      <MediaUpload />
      {objects.length === 0 ? (
        <p className="text-[14.5px] text-ink-soft">Aucun fichier envoyé pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {objects.map((o) => {
            const isUsed = used.has(publicationDocumentUrl(o.key)||`/uploads/${o.key}`);
            return (
              <div key={o.key} className="border border-line rounded-lg overflow-hidden bg-white flex flex-col">
                <div className="relative h-32 bg-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {publicationDocumentUrl(o.key)?<a href={publicationDocumentUrl(o.key)} className="flex items-center justify-center w-full h-full font-semibold" target="_blank" rel="noopener noreferrer">Document PDF</a>:<AdminImage src={`/uploads/${o.key}`} alt="" className="w-full h-full object-cover" />}
                  <span
                    className={`absolute top-2 left-2 text-[10.5px] font-bold tracking-wide px-1.5 py-0.5 rounded ${
                      isUsed ? "bg-lime text-ink" : "bg-white text-ink-faint"
                    }`}
                  >
                    {isUsed ? "UTILISÉ" : "INUTILISÉ"}
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
