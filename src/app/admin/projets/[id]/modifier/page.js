import { adminPageAllowed } from "@/lib/admin-page";
import { notFound } from "next/navigation";
import { getProjetById } from "@/lib/db";
import ProjetForm from "@/components/admin/ProjetForm";

export default async function AdminModifierProjetPage({ params }) {
  if (!(await adminPageAllowed())) return null;
  const { id } = await params;
  const projet = await getProjetById(id);
  if (!projet) notFound();

  return (
    <div>
      <h1 className="text-[24px] mb-6">Modifier : {projet.titre}</h1>
      <ProjetForm projet={projet} />
    </div>
  );
}
