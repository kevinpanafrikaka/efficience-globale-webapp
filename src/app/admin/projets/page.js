import Link from "next/link";
import { getAllProjets, secteurs } from "@/lib/db";
import AdminProjetsGrid from "@/components/admin/AdminProjetsGrid";

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
        <AdminProjetsGrid projets={projets} secteurs={secteurs} />
      )}
    </div>
  );
}
