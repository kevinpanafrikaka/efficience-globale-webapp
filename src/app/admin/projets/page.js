import { adminPageAllowed } from "@/lib/admin-page";
import { getAllProjets, secteurs } from "@/lib/db";
import AdminProjetsGrid from "@/components/admin/AdminProjetsGrid";

export default async function AdminProjetsPage() {
  if (!(await adminPageAllowed())) return null;
  const projets = await getAllProjets();
  return <AdminProjetsGrid projets={projets} secteurs={secteurs} />;
}
