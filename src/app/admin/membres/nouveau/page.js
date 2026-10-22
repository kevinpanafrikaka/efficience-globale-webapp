import { adminPageAllowed } from "@/lib/admin-page";
import MembreForm from "@/components/admin/MembreForm";

export default async function AdminNouveauMembrePage() {
  if (!(await adminPageAllowed())) return null;
  return <MembreForm />;
}
