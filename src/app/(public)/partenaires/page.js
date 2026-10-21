import PageHero from "@/components/PageHero";
import { PageIntro, PageCTA } from "@/components/PublicEditorial";
import Image from "@/components/PublicImage";
import PartnerDirectoryCard from "@/components/PartnerDirectoryCard";
import { getProjets, getPartenaires } from "@/lib/db";
import { projectsForPartner } from "@/lib/partner-projects.mjs";

export const metadata = {
  title: "Partenaires",
  description: "Les bailleurs, institutions et partenaires stratégiques d'Efficience Globale.",
};

export const dynamic = "force-dynamic";

export default async function PartenairesPage() {
  const [projets, bailleurs] = await Promise.all([getProjets(), getPartenaires()]);
  const partenariats = projets.filter((project) => project.secteur === "partenariat");

  return (
    <div className="eg-page eg-partners">
      <PageHero image="/img/hero-partenaires.jpg" label="Nos partenaires"
        title={<>Ils nous font <span className="text-lime-2 italic">confiance</span></>}
        description="Bailleurs, institutions académiques et organisations de la société civile : des partenaires de premier plan qui nous accordent leur confiance à travers l’Afrique de l’Ouest." />

      <section aria-labelledby="institutions-heading" className="eg-container eg-section">
        <PageIntro id="institutions-heading" title={<>La confiance se construit.<br /><em>L’action la fait grandir.</em></>} description="Institutions, organisations et acteurs du terrain : découvrez les collaborations qui donnent corps à nos interventions." />
        <div className="eg-partner-directory">
          {bailleurs.map((partner) => (
            <PartnerDirectoryCard key={partner.id} partner={partner} projectCount={projectsForPartner(partner, projets).length} />
          ))}
        </div>
      </section>

      {partenariats.length > 0 && (
        <section aria-labelledby="partnerships-heading" className="eg-soft-section eg-section">
          <div className="eg-container">
            <PageIntro id="partnerships-heading" title={<>Des collaborations<br /><em>qui s’inscrivent dans la durée.</em></>} description="Des accords-cadres et protocoles d’entente qui structurent notre travail avec les institutions académiques, associatives et internationales." />
            <div className="grid md:grid-cols-2 gap-6">
              {partenariats.map((project) => (
                <a key={project.slug} href={`/realisations/${project.slug}`} className="strategic-partner-card group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white">
                  <div className="relative aspect-[16/9] overflow-hidden bg-line">
                    <Image src={project.photo_url} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="pointer-events-none object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-7">
                    <p className="text-[12px] font-semibold text-dark-2 mb-3">{project.client}</p>
                    <h3 className="text-[21px] md:text-[24px] leading-tight mb-3">{project.titre}</h3>
                    <p className="text-[14px] leading-relaxed text-ink-soft mb-6">{project.resume || project.description}</p>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                      {project.periode && <span className="text-[12px] text-ink-faint">{project.periode}</span>}
                      <span className="inline-flex min-h-11 items-center gap-3 text-[13px] font-semibold text-dark">Voir la fiche</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
      <PageCTA title={<>Et si nous faisions<br /><em>équipe ?</em></>} description="Partagez votre vision et explorons les projets que nous pourrions construire ensemble." label="Parlons partenariat" />
    </div>
  );
}
