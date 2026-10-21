import PageHero from "@/components/PageHero";
import Image from "@/components/PublicImage";
import { PageIntro, PageCTA } from "@/components/PublicEditorial";
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
  return <div className="eg-page eg-domains">
    <PageHero image="/img/hero-domaines.jpg" label="Nos domaines" title={<>Où nous créons de la <span className="text-lime-2 italic">valeur</span></>} description="Quatre domaines, une même approche : diagnostic rigoureux, co-construction avec les acteurs locaux, et transfert de compétences pour ancrer les résultats dans la durée.">
      <nav aria-label="Accéder à un domaine" className="domain-shortcuts">{DOMAINES.map((d) => <a key={d.secteur} href={`#${d.secteur}`} className="domain-shortcut">{d.titre}</a>)}</nav>
    </PageHero>
    <section className="eg-container eg-section">
      <PageIntro label="Nos terrains d’action" title={<>Des enjeux différents.<br /><em>La même exigence d’impact.</em></>} description="Explorez les interventions concrètes que nous mobilisons dans chaque domaine." />
      <div className="eg-domain-dossiers">{DOMAINES.map((d, i) => <article key={d.secteur} id={d.secteur} className="eg-domain-dossier" aria-labelledby={`domain-${d.secteur}`}>
        <div className="eg-domain-cover"><Image src={d.photo} alt="" fill sizes="(min-width: 768px) 42vw, 100vw" className="object-cover" /><div className="eg-domain-cover-shade" /><div className="eg-domain-cover-copy"><span className="eg-domain-icon"><d.Icon /></span><h2 id={`domain-${d.secteur}`}>{d.titre}</h2><p>{d.description}</p></div></div>
        <div className="eg-domain-detail"><h3 className="eg-eyebrow">Comment nous intervenons</h3><ul className="eg-intervention-list">{d.interventions.map((it) => <li key={it}>{it}</li>)}</ul><div className="eg-domain-outcome"><h3>Ce que nous cherchons à faire évoluer</h3><p>{d.effets}</p></div>
          {projetsParSecteur[i].length > 0 && <div className="eg-domain-projects"><h3 className="eg-eyebrow">Sur le terrain</h3>{projetsParSecteur[i].slice(0, 3).map((p) => <Link key={p.slug} href={`/realisations/${p.slug}`}>{p.titre}</Link>)}</div>}
        </div>
      </article>)}</div>
    </section>
    <PageCTA title={<>Votre enjeu dépasse<br /><em>un seul domaine ?</em></>} description="Nos expertises se croisent pour construire un accompagnement adapté à votre contexte." />
  </div>;
}
