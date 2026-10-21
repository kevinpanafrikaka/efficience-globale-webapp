import PageHero from "@/components/PageHero";
import Image from "@/components/PublicImage";
import { PageIntro, PageCTA } from "@/components/PublicEditorial";
import { getMembres } from "@/lib/db";
import { IconEye, IconSparkle, IconDrop, IconTarget } from "@/components/icons";

export const metadata = { title: "À propos", description: "Vision, mission et positionnement d'Efficience Globale, cabinet de conseil en stratégie fondé en 2022 à Conakry." };
export const dynamic = "force-dynamic";
const CONVICTIONS = [
  { titre: "Transparence", desc: "Une honnêteté et une ouverture qui renforcent la confiance de nos partenaires et clients.", Icon: IconEye },
  { titre: "Innovation", desc: "Des approches renouvelées pour apporter des réponses adaptées aux défis de nos partenaires.", Icon: IconSparkle },
  { titre: "Durabilité", desc: "Des stratégies qui servent les intérêts actuels sans compromettre ceux des générations futures.", Icon: IconDrop },
  { titre: "Efficience", desc: "Une optimisation constante pour offrir la meilleure valeur à nos clients.", Icon: IconTarget },
];
export default async function AProposPage() {
  const membres = await getMembres();
  const fondateur = membres.find((m) => /\boumar\b/i.test(m.nom));
  return <div className="eg-page eg-about">
    <PageHero image="/img/hero-a-propos.jpg" label="Le cabinet" title={<>Pourquoi nous <span className="text-lime-2 italic">existons</span> ?</>} description="Efficience Globale est née d’une conviction simple : l’Afrique de l’Ouest a besoin d’une expertise qui comprend son contexte autant que ses standards internationaux." />
    <section className="eg-container eg-section">
      <PageIntro label="Notre histoire" title={<>Ancrés ici.<br /><em>Ouverts sur le monde.</em></>} />
      <div className="eg-story-grid">
        <div className="eg-story-origin"><span className="eg-origin-year">2022</span><span className="eg-origin-caption">27 juillet · Conakry, Guinée</span><p>Un cabinet né sur le terrain, tourné vers les défis de l’Afrique de l’Ouest.</p></div>
        <div className="eg-story-copy"><p className="eg-lead">Efficience Globale est une société de conseil en stratégie et gestion. Nous développons et mettons en œuvre des solutions sur mesure, adaptées aux réalités locales et aux ambitions de nos partenaires.</p>
          {fondateur && <div className="eg-founder">{fondateur.photo_url && <Image src={fondateur.photo_url} alt={fondateur.nom} width={110} height={110} className="eg-founder-photo" />}<div><h3>{fondateur.nom}</h3>{fondateur.role && <p className="eg-founder-role">{fondateur.role}</p>}<p>{fondateur.bio || "Une expertise mise au service du développement en Afrique de l’Ouest."}</p></div></div>}
        </div>
      </div>
      <div className="eg-direction-grid">{[
        ["Vision", "Devenir un acteur de référence en conseil stratégique et opérationnel en Afrique de l’Ouest."],
        ["Mission", "Accompagner les organisations pour répondre efficacement aux défis du développement structurel."],
        ["Positionnement", "Une expertise locale et des standards internationaux au service de nos partenaires."],
      ].map(([title, text]) => <article key={title}><span className="eg-section-dot" aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>
    <section className="eg-soft-section"><div className="eg-container eg-section"><PageIntro label="Nos convictions" title={<>Ce qui guide<br /><em>chaque intervention.</em></>} description="Des principes qui prennent leur sens dans notre manière de travailler, de décider et de transmettre." /><div className="eg-values-grid">{CONVICTIONS.map(({ titre, desc, Icon }) => <article className="eg-value" key={titre}><span className="eg-value-icon"><Icon /></span><h3>{titre}</h3><p>{desc}</p></article>)}</div></div></section>
    <PageCTA />
  </div>;
}
