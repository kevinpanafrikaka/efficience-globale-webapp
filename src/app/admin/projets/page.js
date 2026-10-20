import { adminPageAllowed } from "@/lib/admin-page";
import Link from "next/link";
import { getAllProjets, secteurs } from "@/lib/db";
import AdminProjetsGrid from "@/components/admin/AdminProjetsGrid";

export default async function AdminProjetsPage() {
  if (!(await adminPageAllowed())) return null;
  const projets = await getAllProjets();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px]">Projets</h1>
        <Link
          href="/admin/projets/nouveau"
          className="eg-button eg-button--primary"
        >
          + Nouveau projet
        </Link>
      </div>

      {projets.length === 0 ? (
        <p className="text-[14.5px] text-ink-soft">Aucun projet pour le moment.</p>
      ) : (
        <AdminProjetsGrid projets={projets} secteurs={secteurs} />
      )}
    </div>
  );
}
