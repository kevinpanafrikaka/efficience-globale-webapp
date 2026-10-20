import PageHero from "@/components/PageHero";
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
    <>
      <PageHero image="/img/hero-partenaires.jpg"
        title={<>Ils nous font <span className="text-lime-2 italic">confiance</span></>}
        description="Bailleurs, institutions académiques et organisations de la société civile : des partenaires de premier plan qui nous accordent leur confiance à travers l’Afrique de l’Ouest." />

      <section aria-labelledby="institutions-heading" className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-2xl mb-9 md:mb-12">
          <h2 id="institutions-heading" className="text-[28px] md:text-[38px] leading-tight tracking-[-0.01em] mb-4">Des partenaires, des actions <span className="text-lime italic">concrètes</span></h2>
          <p className="text-[15.5px] text-ink-soft leading-relaxed">Découvrez les réalisations menées avec les organisations qui nous font confiance.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {bailleurs.map((partner) => (
            <PartnerDirectoryCard key={partner.id} partner={partner} projectCount={projectsForPartner(partner, projets).length} />
          ))}
        </div>
      </section>

      {partenariats.length > 0 && (
        <section aria-labelledby="partnerships-heading" className="bg-cream py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="max-w-2xl mb-9 md:mb-12">
              <h2 id="partnerships-heading" className="text-[28px] md:text-[38px] leading-tight tracking-[-0.01em] mb-4">Des <span className="text-lime italic">collaborations</span> de long terme</h2>
              <p className="text-[15.5px] text-ink-soft leading-relaxed">Des accords-cadres et protocoles d&apos;entente qui structurent notre collaboration avec des institutions académiques, associatives et internationales.</p>
            </div>
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
                      <span className="inline-flex min-h-11 items-center gap-3 text-[13px] font-semibold text-dark">Voir la fiche <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-cream text-lg">↗</span></span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
