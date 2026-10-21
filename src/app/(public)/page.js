import Image from "@/components/PublicImage";
import HeroImage from "@/components/HeroImage";
import Link from "next/link";
import HomePartnerCard from "@/components/HomePartnerCard";
import HomeTeamRail from "@/components/HomeTeamRail";
import { projectsForPartner } from "@/lib/partner-projects.mjs";
import { getProjetsRecents, countProjets, getMembres, getPartenaires, getReglages, getProjets, secteurs } from "@/lib/db";
import "./home.css";

export const dynamic = "force-dynamic";

const DOMAINES = [
  { titre: "Santé Globale", secteur: "sante", photo: "/img/domaines/sante-afrique.jpg", detail: "Des systèmes de santé plus accessibles, mieux pilotés, plus durables.", tag: "Gouvernance · Santé publique" },
  { titre: "Éducation", secteur: "education", photo: "/img/domaines/education-afrique.jpg", detail: "Des pratiques pédagogiques renouvelées et des compétences qui grandissent.", tag: "Apprentissage · Formation" },
  { titre: "Industrie", secteur: "local", photo: "/img/domaines/industrie-afrique.jpg", detail: "Des filières locales structurées et des chaînes de valeur renforcées.", tag: "Structuration · Développement local" },
  { titre: "TIC & IA", secteur: "ia", photo: "/img/domaines/tic-afrique.jpg", detail: "Des outils numériques pour éclairer les décisions et simplifier l’action.", tag: "Digitalisation · Intelligence artificielle" },
];
const METHODE = [
  { titre: "Comprendre", detail: "Écouter les acteurs, analyser le contexte et identifier les vrais leviers d’action.", mot: "Diagnostic" },
  { titre: "Co-construire", detail: "Transformer les constats en une stratégie et des outils adaptés à votre réalité.", mot: "Stratégie" },
  { titre: "Déployer", detail: "Accompagner la mise en œuvre avec des méthodes et des solutions opérationnelles.", mot: "Action" },
  { titre: "Transmettre", detail: "Former les équipes et ancrer les compétences pour faire durer les résultats.", mot: "Autonomie" },
];

function Arrow({ className = "" }) {
  return <span aria-hidden="true" className={`home-arrow ${className}`}>↗</span>;
}
function Heading({ label, title, detail, children }) {
  return <div className="home-section-heading"><div><p className="home-eyebrow">{label}</p><h2>{title}</h2>{detail && <p className="home-section-lead">{detail}</p>}</div>{children}</div>;
}
function Project({ projet, featured = false }) {
  const label = secteurs[projet.secteur]?.label || "Réalisation";
  return <Link href={`/realisations/${projet.slug}`} className={featured ? "home-project home-project-featured" : "home-project"}>
    <div className="home-project-photo"><Image src={projet.photo_url} alt="" fill sizes={featured ? "(min-width: 900px) 58vw, 100vw" : "(min-width: 768px) 33vw, 100vw"} className="home-project-image object-cover" /></div>
    <div className="home-project-copy"><p className="home-project-category">{label}{projet.periode && <span> · {projet.periode}</span>}</p><h3>{projet.titre}</h3>{projet.client && <p className="home-project-client">{projet.client}</p>}{featured && projet.resume && <p className="home-project-summary">{projet.resume}</p>}{featured && projet.resultats?.[0] && <p className="home-project-result">{projet.resultats[0]}</p>}</div>
  </Link>;
}

export default async function HomePage() {
  const [projets, nbProjets, membres, partenaires, reglages, tousProjets] = await Promise.all([
    getProjetsRecents(4), countProjets(), getMembres(), getPartenaires(), getReglages(), getProjets(),
  ]);
  const telephone = reglages.telephone?.trim();
  const telHref = telephone ? `tel:${telephone.replace(/[^\d+]/g, "")}` : null;
  const [featured, ...autres] = projets;

  return <div className="home-page">
    <section className="home-hero" aria-labelledby="home-heading">
      <div className="home-hero-stage">
        <div className="home-hero-visual"><HeroImage src="/img/hero-conakry.jpg" className="object-right" /></div>
        <div className="home-wrap home-hero-copy"><div>
          <h1 id="home-heading">Des solutions <em>stratégiques.</em><br />Un impact durable.</h1>
          <p>Depuis Conakry, nous accompagnons les institutions, les entreprises et les acteurs du développement en Guinée et en Afrique de l’Ouest.</p>
          <div className="home-actions"><Link href="/realisations" className="public-cta eg-button eg-button--primary">Découvrir nos réalisations <Arrow /></Link><Link href="/contact" className="public-cta eg-button eg-button--inverse">Parlons de votre projet</Link></div>
          <a href="#nos-domaines" className="home-explore">Explorer nos expertises </a>
        </div></div>
      </div>
      <div className="home-metrics"><dl className="home-wrap">
        {[[String(nbProjets.realises), "Projets réalisés"], ["200+", "Acteurs formés sur le terrain"], ["8", "Régions administratives couvertes"], [String(partenaires.length), "Partenaires présentés"]].map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl></div>
    </section>

    <section className="home-wrap home-section home-intro" aria-labelledby="home-cabinet-heading">
      <div><p className="home-eyebrow">Le cabinet</p><h2 id="home-cabinet-heading">La connaissance du terrain.<br /><em>La force du collectif.</em></h2><p className="home-section-lead">Fondée à Conakry en juillet 2022 par Oumar Camara, Efficience Globale réunit expertise locale et méthodes internationales pour faire avancer vos projets.</p><Link href="/a-propos" className="home-text-link">Découvrir notre cabinet</Link></div>
      <div className="home-principles">
        <div><div><h3>Partir de votre réalité</h3><p>Une écoute attentive et une compréhension des dynamiques locales et régionales.</p></div></div>
        <div><div><h3>Construire à vos côtés</h3><p>Des solutions sur mesure, pensées avec les acteurs qui les feront vivre.</p></div></div>
        <div><div><h3>Faire durer les résultats</h3><p>Le transfert de compétences, la transparence et le suivi au cœur de chaque mission.</p></div></div>
      </div>
    </section>

    <section id="nos-domaines" className="home-domains home-section" aria-label="Domaines d’intervention"><div className="home-wrap">
      <Heading label="Nos domaines d’intervention" title={<>Quatre terrains d’action.<br /><em>Une même exigence.</em></>} detail="De la santé au numérique, nous relions les expertises pour répondre aux défis de votre organisation." />
      <div className="home-domain-grid">{DOMAINES.map((d) => <Link key={d.secteur} href={`/domaines#${d.secteur}`} className="home-domain">
        <Image src={d.photo} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="home-domain-photo object-cover" />
        <div className="home-domain-shade" /><span className="home-domain-tag">{d.tag}</span><div className="home-domain-copy"><h3>{d.titre}</h3><p>{d.detail}</p></div>
      </Link>)}</div>
    </div></section>

    <section className="home-wrap home-section home-projects" aria-label="Réalisations récentes">
      <Heading label="Sur le terrain" title={<>L’impact se construit.<br /><em>Il se voit aussi.</em></>} detail="Découvrez nos dernières réalisations, menées aux côtés d’institutions et d’organisations partenaires."><Link href="/realisations" className="eg-button eg-button--secondary">Toutes les réalisations</Link></Heading>
      {featured ? <><Project projet={featured} featured />{autres.length > 0 && <div className="home-project-grid">{autres.map((p) => <Project key={p.slug} projet={p} />)}</div>}</> : <div className="home-project-empty"><p>Découvrez nos domaines d’intervention et notre approche.</p><Link href="/domaines" className="home-text-link">Explorer nos domaines</Link></div>}
    </section>

    <section className="home-method home-section" aria-label="Notre méthode"><div className="home-wrap">
      <Heading label="Comment nous avançons" title={<>De la première question<br /><em>à l’autonomie de vos équipes.</em></>} detail="Une démarche qui relie la réflexion stratégique, l’action et la transmission." />
      <ol className="home-method-steps">{METHODE.map((step) => <li key={step.titre}><span className="home-method-dot" aria-hidden="true" /><p className="home-method-word">{step.mot}</p><h3>{step.titre}</h3><p>{step.detail}</p></li>)}</ol>
      <Link href="/services" className="eg-button eg-button--primary">Découvrir nos services <Arrow /></Link>
    </div></section>

    <section className="home-wrap home-section home-team" aria-labelledby="home-team-heading">
      <div className="home-team-intro"><p className="home-eyebrow">Les personnes derrière les projets</p><h2 id="home-team-heading">Un cabinet.<br /><em>Tout un collectif.</em></h2><p className="home-section-lead">Des parcours complémentaires et un même engagement : accompagner vos équipes et faire avancer vos projets.</p>
        {membres.length > 0 && <p className="home-team-count"><strong>{membres.length}</strong><span>membre{membres.length > 1 ? "s" : ""} du cabinet</span></p>}
        <HomeTeamRail members={membres} />
        <Link href="/equipe" className="eg-button eg-button--secondary home-team-all">Découvrir toute l’équipe</Link>
      </div>
    </section>

    {partenaires.length > 0 && <section className="home-partners home-section" aria-label="Nos partenaires"><div className="home-wrap">
      <Heading label="À nos côtés" title={<>La confiance se construit.<br /><em>Projet après projet.</em></>} detail="Découvrez les organisations qui nous accompagnent et les réalisations menées ensemble."><Link href="/partenaires" className="home-text-link">Tous nos partenaires</Link></Heading>
      <div className="home-partners-grid">{partenaires.map((p) => <HomePartnerCard key={p.id || p.nom} partner={p} projectCount={projectsForPartner(p, tousProjets).length} />)}</div>
    </div></section>}

    <section className="home-wrap home-section" aria-labelledby="home-contact-heading"><div className="home-contact">
      <div><p className="home-eyebrow">Et si nous en parlions ?</p><h2 id="home-contact-heading">Votre prochain projet<br />commence <em>par un échange.</em></h2><p>Un besoin à clarifier, une stratégie à construire ou des équipes à former : partagez-nous votre défi.</p></div>
      <div className="home-contact-actions"><Link href="/contact" className="eg-button eg-button--primary">Discutons de votre projet <Arrow /></Link>{telHref && <a href={telHref} className="home-text-link">{telephone}</a>}<span className="home-contact-location">Conakry, Guinée · Afrique de l’Ouest</span></div>
    </div></section>
  </div>;
}
