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
    icon: <IconHealth />,
    description:
      "Renforcement de la gouvernance des programmes de santé, suivi-évaluation et digitalisation — de la vaccination à la nutrition.",
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
    icon: <IconEducation />,
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
    icon: <IconIndustry />,
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
    icon: <IconTic />,
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
      <section className="py-14 md:py-16" style={{ background: "linear-gradient(120deg, #2e3f32 0%, #16211a 100%)" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-lime-2 text-[12.5px] font-bold tracking-wide mb-3.5">DOMAINES D&apos;INTERVENTION</div>
          <h1 className="text-white text-[28px] md:text-[42px] leading-tight mb-4">Où nous créons de la valeur</h1>
          <p className="text-[#d3ddce] text-[16px] max-w-2xl">
            Quatre domaines, une même approche : diagnostic rigoureux, co-construction avec les acteurs locaux, et
            transfert de compétences pour ancrer les résultats dans la durée.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-16 space-y-16">
        {DOMAINES.map((d, i) => (
          <div key={d.titre} className="grid md:grid-cols-2 gap-8 items-start">
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <div className="relative h-64 rounded-2xl overflow-hidden mb-6 md:mb-0">
                <Image src={d.photo} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                <div className="absolute inset-0" style={{ backgroundColor: d.tint, mixBlendMode: "multiply" }} />
                <div className="absolute top-5 left-5">{d.icon}</div>
              </div>
            </div>
            <div className={i % 2 === 1 ? "md:order-1" : ""}>
              <h2 className="text-[24px] mb-3">{d.titre}</h2>
              <p className="text-[15.5px] text-ink-soft leading-relaxed mb-5">{d.description}</p>

              <div className="text-[13px] font-bold text-lime tracking-wide mb-2.5">INTERVENTIONS TYPES</div>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-5">
                {d.interventions.map((it) => (
                  <li key={it} className="text-[13.5px] text-ink-soft flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-lime flex-shrink-0" />
                    {it}
                  </li>
                ))}
              </ul>

              <div className="text-[13px] font-bold text-lime tracking-wide mb-2">EFFETS RECHERCHÉS</div>
              <p className="text-[13.5px] text-ink-soft leading-relaxed mb-5">{d.effets}</p>

              {projetsParSecteur[i].length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {projetsParSecteur[i].slice(0, 3).map((p) => (
                    <Link
                      key={p.slug}
                      href={`/realisations/${p.slug}`}
                      className="text-[12.5px] font-medium text-dark-2 border border-line rounded-full px-3 py-1.5 hoverable"
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
