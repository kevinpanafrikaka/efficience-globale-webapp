import Link from "next/link";
import { getAllProjets, secteurs } from "@/lib/db";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminProjetsPage() {
  const projets = await getAllProjets();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px]">Projets</h1>
        <Link
          href="/admin/projets/nouveau"
          className="inline-flex items-center rounded bg-lime px-5 py-2.5 text-[14px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2"
        >
          + Nouveau projet
        </Link>
      </div>

      {projets.length === 0 ? (
        <p className="text-[14.5px] text-ink-soft">Aucun projet pour le moment.</p>
      ) : (
        <div className="border border-line rounded-lg overflow-hidden">
          {projets.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[14.5px] font-semibold text-dark truncate">{p.titre}</span>
                  <span
                    className={`text-[10.5px] font-bold tracking-wide px-1.5 py-0.5 rounded shrink-0 ${
                      p.statut === "publie" ? "bg-lime/20 text-dark-2" : "bg-cream text-ink-faint"
                    }`}
                  >
                    {p.statut === "publie" ? "PUBLIÉ" : "BROUILLON"}
                  </span>
                </div>
                <div className="text-[12.5px] text-ink-faint">
                  {secteurs[p.secteur]?.label || p.secteur} · {p.client || "—"}
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <Link
                  href={`/admin/projets/${p.id}/modifier`}
                  className="text-[12.5px] font-semibold text-dark-2 hover:text-lime transition-colors"
                >
                  Modifier
                </Link>
                <DeleteButton
                  endpoint={`/api/admin/projets/${p.id}`}
                  confirmMessage={`Supprimer "${p.titre}" ?`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
