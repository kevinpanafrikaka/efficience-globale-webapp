import { adminPageAllowed } from "@/lib/admin-page";
import { getAllAnnonces } from "@/lib/db";
import AdminAnnoncesGrid from "@/components/admin/AdminAnnoncesGrid";
export default async function AdminAnnoncesPage(){if(!(await adminPageAllowed()))return null;return <AdminAnnoncesGrid annonces={await getAllAnnonces()}/>;}
