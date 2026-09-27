import Link from "next/link";
import { getAllMembres } from "@/lib/db";
import DeleteButton from "@/components/admin/DeleteButton";

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
        <div className="border border-line rounded-lg overflow-hidden">
          {membres.map((m, i) => (
            <div
              key={m.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[14.5px] font-semibold text-dark truncate">{m.nom}</span>
                  <span
                    className={`text-[10.5px] font-bold tracking-wide px-1.5 py-0.5 rounded shrink-0 ${
                      m.statut === "publie" ? "bg-lime/20 text-dark-2" : "bg-cream text-ink-faint"
                    }`}
                  >
                    {m.statut === "publie" ? "PUBLIÉ" : "BROUILLON"}
                  </span>
                </div>
                <div className="text-[12.5px] text-ink-faint">{m.role || "—"}</div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <Link
                  href={`/admin/membres/${m.id}/modifier`}
                  className="text-[12.5px] font-semibold text-dark-2 hover:text-lime transition-colors"
                >
                  Modifier
                </Link>
                <DeleteButton endpoint={`/api/admin/membres/${m.id}`} confirmMessage={`Supprimer "${m.nom}" ?`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
