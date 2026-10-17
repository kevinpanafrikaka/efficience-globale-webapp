import PageHero from "@/components/PageHero";
import RealisationsGrid from "@/components/RealisationsGrid";
import { getProjets } from "@/lib/db";

export const metadata = {
  title: "Réalisations",
  description:
    "Les projets et les partenariats stratégiques menés par Efficience Globale depuis 2022, avec Gavi, UNICEF, la Banque Mondiale, Expertise France, Enabel et bien d'autres.",
};

// Dynamique : lit D1 à chaque requête, pour refléter les publications
// de l'admin sans avoir besoin de redéployer.
export const dynamic = "force-dynamic";

export default async function RealisationsPage() {
  const projets = await getProjets();

  return (
    <>
      <PageHero image="/img/hero-realisations.jpg"
        title={<>Nos projets et <span className="text-lime-2 italic">partenariats</span> stratégiques</>}
        description="Depuis 2022, Efficience Globale a conduit des interventions dans la santé publique, l’intelligence artificielle, l’éducation, la gouvernance et le développement local, aux côtés de bailleurs et institutions de référence." />

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        {projets.length === 0 ? (
          <p className="text-center text-ink-soft py-14">Aucun projet publié pour le moment.</p>
        ) : (
          <RealisationsGrid projets={projets} />
        )}
      </section>
    </>
  );
}
