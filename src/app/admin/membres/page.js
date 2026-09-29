import Link from "next/link";
import { getAllMembres } from "@/lib/db";
import DeleteButton from "@/components/admin/DeleteButton";
import ReorderButtons from "@/components/admin/ReorderButtons";

export default async function AdminMembresPage() {
  const membres = await getAllMembres();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px]">Membres</h1>
        <Link
          href="/admin/membres/nouveau"
          className="inline-flex items-center rounded bg-lime px-5 py-2.5 text-[14px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2"
        >
          + Nouveau membre
        </Link>
      </div>

      {membres.length === 0 ? (
        <p className="text-[14.5px] text-ink-soft">Aucun membre pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {membres.map((m, i) => (
            <div key={m.id} className="border border-line rounded-lg overflow-hidden flex flex-col bg-white">
              <div className="relative h-44 bg-cream">
                {m.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[12px] text-ink-faint">
                    Aucune image
                  </div>
                )}
                <span
                  className={`absolute top-2 left-2 text-[10.5px] font-bold tracking-wide px-1.5 py-0.5 rounded ${
                    m.statut === "publie" ? "bg-lime text-ink" : "bg-white text-ink-faint"
                  }`}
                >
                  {m.statut === "publie" ? "PUBLIÉ" : "BROUILLON"}
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1.5 flex-1">
                <h3 className="text-[15px] font-semibold text-dark leading-snug">{m.nom}</h3>
                <div className="text-[12.5px] text-ink-faint">{m.role || "—"}</div>
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-line">
                  <ReorderButtons table="membres" id={m.id} prevId={membres[i - 1]?.id} nextId={membres[i + 1]?.id} />
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/membres/${m.id}/modifier`}
                      className="text-[12.5px] font-semibold text-dark-2 hover:text-lime transition-colors"
                    >
                      Modifier
                    </Link>
                    <DeleteButton endpoint={`/api/admin/membres/${m.id}`} confirmMessage={`Supprimer "${m.nom}" ?`} />
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
