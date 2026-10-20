import { adminPageAllowed } from "@/lib/admin-page";
import ProjetForm from "@/components/admin/ProjetForm";

export default async function AdminNouveauProjetPage() {
  if (!(await adminPageAllowed())) return null;
  return (
    <div>
      <h1 className="text-[24px] mb-6">Nouveau projet</h1>
      <ProjetForm />
    </div>
  );
}
