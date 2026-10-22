import { adminPageAllowed } from "@/lib/admin-page";
import { getAllMembres } from "@/lib/db";
import AdminMembresGrid from "@/components/admin/AdminMembresGrid";

export default async function AdminMembresPage() {
  if (!(await adminPageAllowed())) return null;
  const membres = await getAllMembres();
  return <AdminMembresGrid membres={membres} />;
}
