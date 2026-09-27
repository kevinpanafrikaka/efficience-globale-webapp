import { notFound } from "next/navigation";
import { getAnnonceById } from "@/lib/db";
import AnnonceForm from "@/components/admin/AnnonceForm";

export default async function AdminModifierAnnoncePage({ params }) {
  const { id } = await params;
  const annonce = await getAnnonceById(id);
  if (!annonce) notFound();

  return (
    <div>
      <h1 className="text-[24px] mb-6">Modifier : {annonce.titre}</h1>
      <AnnonceForm annonce={annonce} />
    </div>
  );
}
