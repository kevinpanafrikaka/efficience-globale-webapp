import { adminPageAllowed } from "@/lib/admin-page";
import { getAllPartenaires, getProjets } from "@/lib/db";
import { projectsForPartner } from "@/lib/partner-projects.mjs";
import AdminPartenairesGrid from "@/components/admin/AdminPartenairesGrid";

export default async function AdminPartenairesPage() {
  if (!(await adminPageAllowed())) return null;
  let partenaires;
  try { partenaires = await getAllPartenaires(); }
  catch { return <p role="alert">Les partenaires n’ont pas pu être chargés. Réessayez dans quelques instants.</p>; }
  const projets = await getProjets();
  return <AdminPartenairesGrid partenaires={partenaires.map(p => ({ ...p, projectCount: projectsForPartner(p, projets).length }))} />;
}
