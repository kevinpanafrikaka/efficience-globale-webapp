import { adminPageAllowed } from "@/lib/admin-page";
import { getAllPartenaires } from "@/lib/db";
import PartenaireForm from "@/components/admin/PartenaireForm";

export default async function AdminNouveauPartenairePage() {
  if (!(await adminPageAllowed())) return null;
  const partenaires = await getAllPartenaires();
  const initialOrder = Math.min(100000, Math.max(-1, ...partenaires.map(p => Number(p.ordre_affichage) || 0)) + 1);
  return <PartenaireForm initialOrder={initialOrder} />;
}
