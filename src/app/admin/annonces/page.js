import { adminPageAllowed } from "@/lib/admin-page";
import Link from "next/link";
import { getAllAnnonces } from "@/lib/db";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminAnnoncesPage() {
  if (!(await adminPageAllowed())) return null;
  const annonces = await getAllAnnonces();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px]">Annonces</h1>
        <Link
          href="/admin/annonces/nouveau"
          className="eg-button eg-button--primary"
        >
          + Nouvelle annonce
        </Link>
      </div>

      {annonces.length === 0 ? (
        <p className="text-[14.5px] text-ink-soft">Aucune annonce pour le moment.</p>
      ) : (
        <div className="border border-line rounded-lg overflow-hidden">
          {annonces.map((a, i) => (
            <div
              key={a.id}
              className={`admin-list-row flex items-center justify-between gap-4 px-4 py-3 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[14.5px] font-semibold text-dark truncate">{a.titre}</span>
                  <span
                    className={`text-[10.5px] font-bold tracking-wide px-1.5 py-0.5 rounded shrink-0 ${
                      a.statut === "publie" ? "bg-lime/20 text-dark-2" : "bg-cream text-ink-faint"
                    }`}
                  >
                    {a.statut === "publie" ? "PUBLIÉ" : "BROUILLON"}
                  </span>
                </div>
                <div className="text-[12.5px] text-ink-faint">{a.date}</div>
              </div>
              <div className="admin-action-group">
                <Link
                  href={`/admin/annonces/${a.id}/modifier`}
                  className="eg-button eg-button--secondary eg-button--compact"
                >
                  Modifier
                </Link>
                <DeleteButton endpoint={`/api/admin/annonces/${a.id}`} confirmMessage={`Supprimer "${a.titre}" ?`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
