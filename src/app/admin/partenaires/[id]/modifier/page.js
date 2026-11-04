import { adminPageAllowed } from "@/lib/admin-page";
import { notFound } from "next/navigation";
import { getPartenaireById } from "@/lib/db";
import PartenaireForm from "@/components/admin/PartenaireForm";

export default async function AdminModifierPartenairePage({ params }) {
  if (!(await adminPageAllowed())) return null;
  const { id } = await params;
  const partenaire = await getPartenaireById(id);
  if (!partenaire) notFound();

  return <PartenaireForm partenaire={partenaire} />;
}
