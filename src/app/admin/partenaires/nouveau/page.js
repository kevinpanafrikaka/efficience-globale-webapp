import { adminPageAllowed } from "@/lib/admin-page";
import PartenaireForm from "@/components/admin/PartenaireForm";

export default async function AdminNouveauPartenairePage() {
  if (!(await adminPageAllowed())) return null;
  return (
    <div>
      <h1 className="text-[24px] mb-6">Nouveau partenaire</h1>
      <PartenaireForm />
    </div>
  );
}
