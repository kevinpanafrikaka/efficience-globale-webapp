import PageHero from "@/components/PageHero";
import Image from "next/image";
import Link from "next/link";
import { getProjets } from "@/lib/db";
import { IconHealth, IconEducation, IconIndustry, IconTic } from "@/components/icons";

export const metadata = {
  title: "Domaines d'intervention",
  description: "Les quatre domaines d'intervention d'Efficience Globale : Santé Globale, Éducation, Industrie, TIC & IA.",
};

export const dynamic = "force-dynamic";

const DOMAINES = [
  {
    titre: "Santé Globale",
    photo: "/img/domaines/sante-afrique.jpg",
    tint: "rgba(61,83,71,0.82)",
    Icon: IconHealth,
    description:
      "Renforcement de la gouvernance des programmes de santé, suivi-évaluation et digitalisation, de la vaccination à la nutrition.",
    interventions: [
      "Diagnostics institutionnels",
      "Appui à la coordination multi-niveaux",
      "Élaboration et actualisation de procédures (SOP)",
      "Tableaux de bord et cartographies interactives (SIG)",
      "Amélioration de la qualité des données (DHIS2)",
      "Formation des équipes",
    ],
    effets: "Meilleures performances des programmes, redevabilité accrue, décisions fondées sur les preuves.",
    secteur: "sante",
  },
  {
    titre: "Éducation",
    photo: "/img/domaines/education-afrique.jpg",
    tint: "rgba(124,179,66,0.82)",
    Icon: IconEducation,
    description: "Innovation pédagogique, formation et transfert de compétences durable.",
    interventions: [
      "Ingénierie de formation (curricula, modules, guides)",
      "Pédagogie augmentée par le numérique et l'IA",
      "Ateliers pratiques",
      "Coaching post-formation",
      "Certification interne",
    ],
    effets: "Montée en compétences durable des apprenants et formateurs, diffusion de pratiques pédagogiques actives et inclusives.",
    secteur: "education",
  },
  {
    titre: "Industrie",
    photo: "/img/domaines/industrie-afrique.jpg",
    tint: "rgba(183,194,51,0.82)",
    Icon: IconIndustry,
    description: "Restructuration agro-industrielle et renforcement des chaînes d'approvisionnement locales.",
    interventions: [
      "Diagnostics organisationnels et techniques",
      "Plans de restructuration",
      "Mise en conformité aux normes internationales (ISO)",
      "Professionnalisation des processus",
      "Tableaux de bord de production",
    ],
    effets: "Viabilité économique renforcée, création d'emplois locaux, résilience des chaînes d'approvisionnement.",
    secteur: "local",
  },
  {
    titre: "TIC & IA",
    photo: "/img/domaines/tic-afrique.jpg",
    tint: "rgba(0,137,123,0.82)",
    Icon: IconTic,
    description: "Outils numériques, IA responsable et systèmes de suivi interactifs au service de la décision publique.",
    interventions: [
      "Conception de plateformes web (cartographies, registres)",
      "Développement d'agents virtuels et assistants IA",
      "Automatisation de processus (workflows, reporting)",
      "Interopérabilité des données",
      "Cadres éthiques et de sécurité",
    ],
    effets: "Efficacité opérationnelle, transparence, accessibilité des services, amélioration mesurable de la prise de décision.",
    secteur: "ia",
  },
];

export default async function DomainesPage() {
  const projetsParSecteur = await Promise.all(DOMAINES.map((d) => getProjets({ secteur: d.secteur })));

  return (
    <>
      <PageHero image="/img/hero-domaines.jpg"
        title={<>Où nous créons de la <span className="text-lime-2 italic">valeur</span></>}
        description="Quatre domaines, une même approche : diagnostic rigoureux, co-construction avec les acteurs locaux, et transfert de compétences pour ancrer les résultats dans la durée.">
          <nav aria-label="Accéder à un domaine" className="domain-shortcuts">
            {DOMAINES.map((d) => (
              <a
                key={d.secteur}
                href={`#${d.secteur}`}
                className="domain-shortcut"
              >
                {d.titre}
              </a>
            ))}
          </nav>
      </PageHero>

      <section className="max-w-6xl mx-auto px-5 md:px-8">
        {DOMAINES.map((d, i) => (
          <div
            key={d.titre}
            id={d.secteur}
            className={`grid md:grid-cols-2 gap-8 md:gap-14 items-start py-14 md:py-20 scroll-mt-24 ${i > 0 ? "border-t border-line" : ""}`}
          >
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <div className="relative h-64 md:h-80 overflow-hidden rounded-xl mb-6 md:mb-0">
                <Image src={d.photo} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                <div className="absolute inset-0" style={{ backgroundColor: d.tint, mixBlendMode: "multiply" }} />
              </div>
            </div>
            <div className={i % 2 === 1 ? "md:order-1" : ""}>
              <h2 className="text-[24px] md:text-[28px] tracking-[-0.01em] mb-5">{d.titre}</h2>
              <p className="text-[15.5px] text-ink-soft leading-relaxed mb-7">{d.description}</p>

              <div className="text-[12px] font-bold text-lime tracking-[0.1em] mb-3.5">INTERVENTIONS TYPES</div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 mb-7">
                {d.interventions.map((it) => (
                  <li key={it} className="text-[13.5px] text-ink-soft leading-relaxed flex items-start gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-lime mt-[3px] shrink-0"
                    >
                      <path d="M5 12.5l4.5 4.5L19 7" />
                    </svg>
                    {it}
                  </li>
                ))}
              </ul>

              <div className="border-l-2 border-lime pl-5 mb-7">
                <div className="text-[12px] font-bold text-lime tracking-[0.1em] mb-1.5">EFFETS RECHERCHÉS</div>
                <p className="text-[14.5px] text-ink-soft leading-relaxed">{d.effets}</p>
              </div>

              {projetsParSecteur[i].length > 0 && (
                <div>
                  <div className="text-[12px] font-bold text-lime tracking-[0.1em] mb-2">PROJETS RÉALISÉS</div>
                  <div className="flex flex-col gap-1.5">
                    {projetsParSecteur[i].slice(0, 3).map((p) => (
                      <Link
                        key={p.slug}
                        href={`/realisations/${p.slug}`}
                        className="inline-flex items-center min-h-11 py-2 text-[14px] font-medium text-dark-2 border-b border-line hoverable w-fit"
                      >
                        {p.titre}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
