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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/img/hero-domaines.jpg" alt="" fill className="object-cover" priority />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(13,19,14,0.88) 0%, rgba(13,19,14,0.55) 45%, rgba(13,19,14,0.3) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(0deg, rgba(10,15,11,0.55) 0%, rgba(10,15,11,0.1) 40%)" }}
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-28">
          <h1 className="text-white text-[36px] md:text-[56px] leading-[1.05] tracking-[-0.02em] mb-5 max-w-2xl">
            Où nous créons de la <span className="text-lime italic">valeur</span>
          </h1>
          <p className="text-[#d3ddce] text-[16px] md:text-[17px] leading-relaxed max-w-xl">
            Quatre domaines, une même approche : diagnostic rigoureux, co-construction avec les acteurs locaux, et
            transfert de compétences pour ancrer les résultats dans la durée.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex flex-wrap gap-2.5 py-10 md:py-12">
          {DOMAINES.map((d) => (
            <a
              key={d.secteur}
              href={`#${d.secteur}`}
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-dark-2 transition-colors hover:border-lime hover:text-lime"
            >
              <d.Icon stroke="currentColor" width="16" height="16" />
              {d.titre}
            </a>
          ))}
        </div>

        {DOMAINES.map((d, i) => (
          <div
            key={d.titre}
            id={d.secteur}
            className={`grid md:grid-cols-2 gap-8 md:gap-14 items-start py-14 md:py-20 scroll-mt-24 ${i > 0 ? "border-t border-line" : ""}`}
          >
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <div className="relative h-64 md:h-80 overflow-hidden mb-6 md:mb-0">
                <Image src={d.photo} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                <div className="absolute inset-0" style={{ backgroundColor: d.tint, mixBlendMode: "multiply" }} />
              </div>
            </div>
            <div className={i % 2 === 1 ? "md:order-1" : ""}>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-lg bg-cream border border-line flex items-center justify-center text-lime shrink-0">
                  <d.Icon stroke="currentColor" width="22" height="22" />
                </div>
                <h2 className="text-[24px] md:text-[28px] tracking-[-0.01em]">{d.titre}</h2>
              </div>
              <p className="text-[15.5px] text-ink-soft leading-relaxed mb-7">{d.description}</p>

              <div className="text-[12px] font-bold text-lime tracking-[0.1em] mb-3.5">INTERVENTIONS TYPES</div>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-7">
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
                <div className="flex flex-col gap-1.5">
                  {projetsParSecteur[i].slice(0, 3).map((p) => (
                    <Link
                      key={p.slug}
                      href={`/realisations/${p.slug}`}
                      className="text-[13px] font-medium text-dark-2 border-b border-line hoverable w-fit"
                    >
                      {p.titre}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
