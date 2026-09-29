import { getReglages, parseStatsEquipe } from "@/lib/db";
import ReglagesForm from "@/components/admin/ReglagesForm";

export const dynamic = "force-dynamic";

export default async function AdminReglagesPage() {
  const reglages = await getReglages();

  return (
    <div>
      <h1 className="text-[24px] mb-2">Réglages du site</h1>
      <p className="text-[14px] text-ink-soft mb-6">
        Coordonnées, réseaux sociaux et chiffres affichés sur le site public.
      </p>
      <ReglagesForm reglages={reglages} stats={parseStatsEquipe(reglages)} />
    </div>
  );
}
