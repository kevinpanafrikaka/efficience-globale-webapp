import { adminPageAllowed } from "@/lib/admin-page";
import ProjetForm from "@/components/admin/ProjetForm";

export default async function AdminNouveauProjetPage() {
  if (!(await adminPageAllowed())) return null;
  return <ProjetForm />;
}
