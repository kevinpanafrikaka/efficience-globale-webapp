import { adminPageAllowed } from "@/lib/admin-page";
import { getAllPartenaires } from "@/lib/db";
import ProjetForm from "@/components/admin/ProjetForm";

export default async function AdminNouveauProjetPage() {
  if (!(await adminPageAllowed())) return null;
  const partenaires = await getAllPartenaires();
  return <ProjetForm partenaires={partenaires} />;
}
