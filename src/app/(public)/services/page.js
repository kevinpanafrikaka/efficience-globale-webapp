import PageHero from "@/components/PageHero";
import Link from "next/link";
import { PageIntro } from "@/components/PublicEditorial";
import { IconSearch, IconDocs, IconChart, IconTeam, IconSparkle, IconCheck } from "@/components/icons";

export const metadata = {
  title: "Services",
  description: "Les cinq axes d’accompagnement d’Efficience Globale : capacités institutionnelles, optimisation des ressources, mobilisation financière, innovation digitale et assistance technique.",
};

const SERVICES = [
  {
    id: "capacites-institutionnelles", court: "Capacités institutionnelles", titre: "Renforcer les capacités institutionnelles", Icon: IconTeam,
    description: "Donner aux institutions les moyens de coordonner leurs projets et de piloter leurs interventions à partir de données probantes.",
    prestations: [
      ["Delivery units", "Mettre en place des unités dédiées à la coordination et au suivi des projets."],
      ["Politiques et stratégies", "Formuler des réponses aux défis complexes en s’appuyant sur les données et le contexte d’intervention."],
      ["Études d’impact et évaluation", "Mesurer l’efficacité des interventions et apprécier leurs effets."],
    ],
  },
  {
    id: "optimisation-ressources", court: "Optimisation des ressources", titre: "Optimiser les ressources disponibles", Icon: IconChart,
    description: "Mieux connaître les ressources mobilisables et organiser leur utilisation au service des objectifs du projet.",
    prestations: [
      ["Cartographie des ressources", "Utiliser les systèmes d’information géographique (SIG) et les bases de données centralisées pour identifier et structurer les ressources."],
      ["Gouvernance, suivi et évaluation", "Définir des indicateurs clés de performance (KPI) et mettre en place des audits réguliers pour suivre les résultats."],
    ],
  },
  {
    id: "mobilisation-financiere", court: "Mobilisation financière", titre: "Mobiliser les ressources financières", Icon: IconDocs,
    description: "Accompagner les collaborations et l’accès aux mécanismes de financement adaptés aux projets de développement.",
    prestations: [
      ["Partenariats public-privé (PPP)", "Faciliter les collaborations stratégiques et la répartition des risques entre acteurs publics et privés."],
      ["Financements internationaux", "Accompagner les démarches de mobilisation de ressources auprès des institutions financières internationales et des banques régionales de développement."],
    ],
  },
  {
    id: "innovation-digitale", court: "Innovation digitale", titre: "Faire du numérique un levier d’action", Icon: IconSparkle,
    description: "Développer des outils qui améliorent les processus de travail et soutiennent la décision.",
    prestations: [
      ["Outils de productivité", "Développer des applications adaptées aux processus et aux besoins des organisations."],
      ["Automatisation et intelligence artificielle", "Optimiser les processus de gestion et de décision grâce à l’automatisation et à l’IA."],
    ],
  },
  {
    id: "assistance-technique", court: "Assistance technique", titre: "Apporter une assistance technique ciblée", Icon: IconSearch,
    description: "Renforcer les outils d’analyse et d’aide à la décision pour répondre aux besoins opérationnels des organisations.",
    prestations: [
      ["Risques et développement de politiques", "Mettre en place des systèmes d’aide à la décision pour la gestion des risques et l’élaboration de politiques."],
      ["Collecte et analyse de données", "Améliorer la collecte, l’analyse et l’utilisation des données pour éclairer les décisions."],
    ],
  },
];

const PHASES_IA = [
  { titre: "Analyse des besoins", Icon: IconSearch, desc: "Identifier les usages pertinents avant de choisir un outil.", points: ["Évaluation des processus et de l’environnement de travail.", "Définition des objectifs : productivité, qualité et aide à la décision."] },
  { titre: "Personnalisation", Icon: IconSparkle, desc: "Adapter les solutions aux besoins de l’organisation.", points: ["Développement ou personnalisation de solutions fondées sur les grands modèles de langage (LLM).", "Intégration aux systèmes existants et prise en compte de la protection des données."] },
  { titre: "Déploiement et formation", Icon: IconTeam, desc: "Accompagner les équipes dans la prise en main.", points: ["Formation des utilisateurs et renforcement des capacités.", "Accompagnement pour un usage efficace et éthique des outils."] },
  { titre: "Support et adoption", Icon: IconCheck, desc: "Soutenir l’appropriation des nouveaux usages.", points: ["Communication auprès des parties prenantes.", "Appui technique et accompagnement de l’adoption dans la durée."] },
];

export default function ServicesPage() {
  return <div className="eg-page eg-services">
    <PageHero image="/img/hero-services.jpg" title={<>Des expertises au service de votre <span className="text-lime-2 italic">action</span></>} description="Renforcer vos institutions, optimiser vos ressources et accompagner vos transformations : un appui sur mesure pour répondre à vos défis." />
    <section className="eg-container eg-section" aria-labelledby="services-heading">
      <PageIntro id="services-heading" label="L’accompagnement" title={<>Cinq leviers.<br /><em>Un cap : votre projet.</em></>} description="De la structuration institutionnelle à l’innovation digitale, nous relions les expertises dont votre organisation a besoin." />
      <div className="eg-services-layout"><nav className="eg-service-nav" aria-label="Explorer nos cinq axes de services"><p className="eg-eyebrow">Votre parcours</p>{SERVICES.map((service) => <a key={service.id} href={`#${service.id}`}><service.Icon width="20" height="20" /><span>{service.court}</span></a>)}<a href="#accompagnement-ia" className="eg-service-nav-focus">Notre démarche IA</a></nav>
        <div className="eg-service-dossiers">{SERVICES.map((service) => <article className="eg-service-dossier" key={service.id} id={service.id} aria-labelledby={`${service.id}-title`}><header><span className="eg-service-icon"><service.Icon width="26" height="26" /></span><div><h3 id={`${service.id}-title`}>{service.titre}</h3><p>{service.description}</p></div></header><ul className="eg-service-offers">{service.prestations.map(([title, detail]) => <li key={title}><h4>{title}</h4><p>{detail}</p></li>)}</ul></article>)}</div>
      </div>
    </section>
    <section id="accompagnement-ia" className="eg-container eg-section eg-ai-section" aria-labelledby="ia-heading"><div className="eg-page-intro"><div><p className="eg-eyebrow">Des usages qui durent</p><h2 id="ia-heading">De l’opportunité<br />à l’<em>adoption.</em></h2><p className="eg-lead">L’intégration de l’IA générative commence par les besoins de vos équipes. Notre démarche associe solutions techniques, formation et accompagnement du changement.</p></div></div><ol className="eg-ai-phases">{PHASES_IA.map((phase) => <li key={phase.titre}><span className="eg-service-icon"><phase.Icon width="24" height="24" /></span><h3>{phase.titre}</h3><p>{phase.desc}</p><ul>{phase.points.map((point) => <li key={point}>{point}</li>)}</ul></li>)}</ol><div className="eg-services-contact"><div><h2>Quel sera votre<br /><em>prochain pas ?</em></h2><p className="eg-lead">Commençons par vos besoins et construisons un accompagnement qui vous ressemble.</p></div><Link href="/contact" className="eg-button eg-button--primary">Discutons de vos besoins</Link></div></section>
  </div>;
}
