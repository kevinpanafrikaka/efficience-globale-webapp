import Image from "next/image";
import Link from "next/link";
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
  return (
    <>
      <section className="relative overflow-hidden bg-darker">
        <div className="absolute inset-0">
          <Image src="/img/hero-services.jpg" alt="" fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(13,19,14,0.88) 0%, rgba(13,19,14,0.55) 45%, rgba(13,19,14,0.3) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(10,15,11,0.55) 0%, rgba(10,15,11,0.1) 40%)" }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-28">
          <h1 className="text-white text-[36px] md:text-[56px] leading-[1.05] tracking-[-0.02em] mb-5 max-w-2xl">
            Des expertises au service de votre <span className="text-lime italic">action</span>
          </h1>
          <p className="text-[#d3ddce] text-[16px] md:text-[17px] leading-relaxed max-w-xl">
            Renforcer vos institutions, optimiser vos ressources et accompagner vos transformations : un appui sur mesure pour répondre à vos défis.
          </p>
        </div>
      </section>

      <section aria-labelledby="services-heading" className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <div className="mb-10 md:mb-14 max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-ink-soft mb-4">NOS SERVICES</p>
          <h2 id="services-heading" className="text-[30px] md:text-[40px] leading-[1.15] mb-5">Cinq leviers pour faire avancer vos projets.</h2>
          <p className="text-base leading-relaxed text-ink-soft">De la structuration institutionnelle à l’innovation digitale, notre accompagnement s’adapte à vos enjeux et à votre environnement.</p>
        </div>
        <div className="grid lg:grid-cols-[250px_1fr] gap-9 lg:gap-14 items-start">
          <nav aria-label="Explorer nos cinq axes de services" className="lg:sticky lg:top-28 bg-cream rounded-xl border border-line p-5">
            <p className="text-xs font-semibold text-dark mb-4">VOTRE ACCOMPAGNEMENT</p>
            <ol className="space-y-1">
              {SERVICES.map((service, index) => <li key={service.id}>
                <a href={`#${service.id}`} className="flex items-start gap-3 rounded-lg px-2 py-3 text-sm text-ink-soft hover:bg-white hover:text-dark transition-colors">
                  <span className="text-xs text-lime font-semibold pt-0.5" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span>{service.court}</span>
                </a>
              </li>)}
            </ol>
            <a href="#accompagnement-ia" className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-line text-sm font-semibold text-dark">Notre démarche IA <span aria-hidden="true">↓</span></a>
          </nav>
          <div>
            {SERVICES.map((service, index) => <article id={service.id} key={service.id} aria-labelledby={`${service.id}-title`} className={`scroll-mt-28 ${index ? "mt-10 pt-10 border-t border-line" : ""}`}>
              <div className="flex gap-4 items-start mb-5">
                <span className="text-[40px] md:text-[48px] leading-none font-head text-[#c6d5bb] tabular-nums" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 id={`${service.id}-title`} className="text-[23px] md:text-[28px] leading-tight mb-3">{service.titre}</h3>
                  <p className="text-[15px] leading-relaxed text-ink-soft">{service.description}</p>
                </div>
                <span className="hidden sm:grid shrink-0 place-items-center bg-cream rounded-xl w-11 h-11 text-dark-2"><service.Icon width="22" height="22" stroke="currentColor" /></span>
              </div>
              <ul className="rounded-xl bg-cream border border-line px-5 md:px-6 divide-y divide-line">
                {service.prestations.map(([titre, detail]) => <li key={titre} className="py-5">
                  <h4 className="font-body font-semibold text-[15px] text-dark mb-1.5">{titre}</h4>
                  <p className="text-[14.5px] text-ink-soft leading-relaxed">{detail}</p>
                </li>)}
              </ul>
            </article>)}
          </div>
        </div>
      </section>

      <section id="accompagnement-ia" aria-labelledby="ia-heading" className="scroll-mt-24 bg-white border-t border-line py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="max-w-2xl mb-10">
            <h2 id="ia-heading" className="text-dark text-[30px] md:text-[40px] leading-[1.15] mb-5">De l’opportunité à l’<span className="italic text-dark-2">adoption</span>.</h2>
            <p className="text-ink-soft text-base leading-relaxed">L’intégration de l’IA générative commence par les besoins de vos équipes. Notre démarche en quatre phases associe solutions techniques, formation et accompagnement du changement.</p>
          </div>
          <ol className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {PHASES_IA.map((phase) => <li key={phase.titre} className="rounded-xl border border-line bg-white p-6">
              <div className="flex items-center justify-between mb-6 text-dark-2"><phase.Icon width="23" height="23" stroke="currentColor" /></div>
              <h3 className="text-dark text-xl leading-tight mb-3">{phase.titre}</h3>
              <p className="text-ink-soft text-sm leading-relaxed mb-5">{phase.desc}</p>
              <ul className="space-y-3 border-t border-line pt-5">
                {phase.points.map((point) => <li key={point} className="flex gap-2 text-[13.5px] leading-relaxed text-ink-soft"><span aria-hidden="true" className="text-dark-2">•</span><span>{point}</span></li>)}
              </ul>
            </li>)}
          </ol>
          <div className="mt-10"><Link href="/contact" className="inline-flex items-center gap-4 rounded bg-lime px-6 py-3.5 font-semibold text-sm text-ink hover:bg-lime-2 transition-colors">Discutons de vos besoins <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>
    </>
  );
}
