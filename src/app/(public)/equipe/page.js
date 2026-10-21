import PageHero from "@/components/PageHero";
import TeamGallery from "@/components/TeamGallery";
import { getMembres } from "@/lib/db";

export const metadata = {
  title: "Équipe",
  description: "Découvrez les visages et les expertises d’Efficience Globale, au service de la gouvernance, de la digitalisation et de l’intelligence artificielle en Guinée.",
};

export const dynamic = "force-dynamic";

export default async function EquipePage({ searchParams } = {}) {
  const query = await searchParams;
  const initialMemberId = typeof query?.membre === "string" ? query.membre : undefined;
  const membres = await getMembres();
  return (
    <>
      <PageHero image="/img/hero-equipe.webp"
        title={<>Les visages de notre <span className="text-lime-2 italic">impact</span></>}
        description="Des parcours complémentaires, une connaissance du terrain et une même ambition : faire avancer vos projets." />
      <section aria-label="Les membres du cabinet" className="team-gallery-body bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-8 md:pb-12">
          <TeamGallery key={initialMemberId || "all"} members={membres} initialMemberId={initialMemberId} />
        </div>
      </section>
    </>
  );
}
