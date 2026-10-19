import PageHero from "@/components/PageHero";
import RealisationsGrid from "@/components/RealisationsGrid";
import { getProjets, getPartenaires } from "@/lib/db";
import { projectsForPartner } from "@/lib/partner-projects.mjs";

export const metadata = {
  title: "Réalisations",
  description:
    "Les projets et les partenariats stratégiques menés par Efficience Globale depuis 2022, avec Gavi, UNICEF, la Banque Mondiale, Expertise France, Enabel et bien d'autres.",
};

// Dynamique : lit D1 à chaque requête, pour refléter les publications
// de l'admin sans avoir besoin de redéployer.
export const dynamic = "force-dynamic";

export default async function RealisationsPage({ searchParams }) {
  const query = await searchParams;
  const partnerId = typeof query?.partenaire === "string" ? query.partenaire : null;
  const [tousLesProjets, partenaires] = await Promise.all([getProjets(), partnerId ? getPartenaires() : []]);
  const partenaire = partenaires.find((partner) => partner.id === partnerId);
  const projets = partnerId ? (partenaire ? projectsForPartner(partenaire, tousLesProjets) : []) : tousLesProjets;

  return (
    <>
      <PageHero image="/img/hero-realisations.jpg"
        title={<>Nos projets et <span className="text-lime-2 italic">partenariats</span> stratégiques</>}
        description="Depuis 2022, Efficience Globale a conduit des interventions dans la santé publique, l’intelligence artificielle, l’éducation, la gouvernance et le développement local, aux côtés de bailleurs et institutions de référence." />

      <section id="projets" className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24 scroll-mt-24">
        {partnerId && !partenaire && (
          <div className="mb-8 rounded-xl border border-line bg-cream p-5 sm:p-6">
            <h2 className="text-[24px] mb-3">Organisation introuvable</h2>
            <a href="/realisations#projets" className="inline-flex min-h-11 items-center text-[13px] font-semibold text-dark-2">Voir toutes les réalisations</a>
          </div>
        )}
        {partenaire && (
          <div className="mb-8 rounded-xl border border-line bg-cream p-5 sm:p-6">
            <p className="text-[11px] font-semibold tracking-[0.1em] text-ink-soft mb-2">RÉALISATIONS AVEC</p>
            <h2 className="text-[24px] md:text-[28px] leading-tight mb-3">{partenaire.nom}</h2>
            <a href="/realisations#projets" className="inline-flex min-h-11 items-center text-[13px] font-semibold text-dark-2">Voir toutes les réalisations <span aria-hidden="true" className="ml-2">↗</span></a>
          </div>
        )}
        {projets.length === 0 ? (
          <p className="text-center text-ink-soft py-14">Aucun projet publié pour le moment.</p>
        ) : (
          <RealisationsGrid projets={projets} />
        )}
      </section>
    </>
  );
}
