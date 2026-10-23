import { adminPageAllowed } from "@/lib/admin-page";
import AnnonceForm from "@/components/admin/AnnonceForm";

export default async function AdminNouvelleAnnoncePage() {
  if (!(await adminPageAllowed())) return null;
  return <AnnonceForm />;
}
