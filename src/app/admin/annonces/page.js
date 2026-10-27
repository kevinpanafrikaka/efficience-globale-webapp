import { adminPageAllowed } from "@/lib/admin-page";
import { getAllAnnonces } from "@/lib/db";
import AdminAnnoncesGrid from "@/components/admin/AdminAnnoncesGrid";
export default async function AdminAnnoncesPage({searchParams} = {}){if(!(await adminPageAllowed()))return null;const query=await searchParams||{};return <AdminAnnoncesGrid annonces={await getAllAnnonces()} initialType={typeof query.type==="string"?query.type:"all"}/>;}
