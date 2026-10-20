import { adminPageAllowed } from "@/lib/admin-page";
import MembreForm from "@/components/admin/MembreForm";

export default async function AdminNouveauMembrePage() {
  if (!(await adminPageAllowed())) return null;
  return (
    <div>
      <h1 className="text-[24px] mb-6">Nouveau membre</h1>
      <MembreForm />
    </div>
  );
}
