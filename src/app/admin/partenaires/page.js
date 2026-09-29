import Link from "next/link";
import { getAllPartenaires } from "@/lib/db";
import DeleteButton from "@/components/admin/DeleteButton";
import ReorderButtons from "@/components/admin/ReorderButtons";

export default async function AdminPartenairesPage() {
  let partenaires = [];
  let migrationManquante = false;
  try {
    partenaires = await getAllPartenaires();
  } catch {
    migrationManquante = true;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px]">Partenaires</h1>
        <Link
          href="/admin/partenaires/nouveau"
          className="inline-flex items-center rounded bg-lime px-5 py-2.5 text-[14px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2"
        >
          + Nouveau partenaire
        </Link>
      </div>

      {migrationManquante ? (
        <p className="text-[14.5px] text-red-600">
          La table « partenaires » n&apos;existe pas encore. Appliquez la migration
          <code className="mx-1">migrations/001_admin_completion.sql</code> sur la base D1.
        </p>
      ) : partenaires.length === 0 ? (
        <p className="text-[14.5px] text-ink-soft">Aucun partenaire pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {partenaires.map((p, i) => (
            <div key={p.id} className="border border-line rounded-lg overflow-hidden flex flex-col bg-white">
              <div className="relative h-32 bg-cream flex items-center justify-center px-6">
                {p.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo_url} alt={p.nom} className="max-h-20 max-w-full object-contain" />
                ) : (
                  <span className="text-[14px] font-bold text-dark-2 text-center">{p.nom}</span>
                )}
                <span
                  className={`absolute top-2 left-2 text-[10.5px] font-bold tracking-wide px-1.5 py-0.5 rounded ${
                    p.statut === "publie" ? "bg-lime text-ink" : "bg-white text-ink-faint"
                  }`}
                >
                  {p.statut === "publie" ? "PUBLIÉ" : "BROUILLON"}
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1.5 flex-1">
                <h3 className="text-[15px] font-semibold text-dark leading-snug">{p.nom}</h3>
                <div className="text-[12.5px] text-ink-faint truncate">{p.site_web || "—"}</div>
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-line">
                  <ReorderButtons
                    table="partenaires"
                    id={p.id}
                    prevId={partenaires[i - 1]?.id}
                    nextId={partenaires[i + 1]?.id}
                  />
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/partenaires/${p.id}/modifier`}
                      className="text-[12.5px] font-semibold text-dark-2 hover:text-lime transition-colors"
                    >
                      Modifier
                    </Link>
                    <DeleteButton endpoint={`/api/admin/partenaires/${p.id}`} confirmMessage={`Supprimer "${p.nom}" ?`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
