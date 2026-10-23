import { adminPageAllowed } from "@/lib/admin-page";
import { notFound } from "next/navigation";
import { getAnnonceById } from "@/lib/db";
import AnnonceForm from "@/components/admin/AnnonceForm";

export default async function AdminModifierAnnoncePage({ params }) {
  if (!(await adminPageAllowed())) return null;
  const { id } = await params;
  const annonce = await getAnnonceById(id);
  if (!annonce) notFound();

  return <AnnonceForm annonce={annonce} />;
}
