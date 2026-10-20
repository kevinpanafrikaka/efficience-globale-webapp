import { adminPageAllowed } from "@/lib/admin-page";
import AnnonceForm from "@/components/admin/AnnonceForm";

export default async function AdminNouvelleAnnoncePage() {
  if (!(await adminPageAllowed())) return null;
  return (
    <div>
      <h1 className="text-[24px] mb-6">Nouvelle annonce</h1>
      <AnnonceForm />
    </div>
  );
}
