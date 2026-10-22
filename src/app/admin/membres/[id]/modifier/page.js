import { adminPageAllowed } from "@/lib/admin-page";
import { notFound } from "next/navigation";
import { getMembreById } from "@/lib/db";
import MembreForm from "@/components/admin/MembreForm";

export default async function AdminModifierMembrePage({ params }) {
  if (!(await adminPageAllowed())) return null;
  const { id } = await params;
  const membre = await getMembreById(id);
  if (!membre) notFound();

  return <MembreForm membre={membre} />;
}
