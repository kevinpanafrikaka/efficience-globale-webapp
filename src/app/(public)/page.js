import Image from "next/image";
import Link from "next/link";
import SectionHead from "@/components/SectionHead";
import DomainCard from "@/components/DomainCard";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import { getProjetBySlug, getMembres } from "@/lib/db";
import {
  IconHealth,
  IconEducation,
  IconIndustry,
  IconTic,
  IconCheck,
  IconBulb,
  IconLeaf,
  IconTrend,
  IconSearch,
  IconDocs,
  IconChart,
  IconTeam,
} from "@/components/icons";

const PROJETS_PHARES_SLUGS = [
  "gouvernance-pev-lmc",
  "chaine-froid-pev",
  "cartographie-nutrition-eu4sun",
  "guichet-vbg-enabel",
  "restructuration-sydam",
  "agents-ia-osc",
];

const PARTENAIRES = [
  { nom: "Gavi", logo: "partners/gavi-logo.png" },
  { nom: "UNICEF", logo: "partners/unicef-logo.png" },
  { nom: "Expertise France", logo: "partners/expertise-france-logo.png" },
  { nom: "Banque Mondiale", logo: "partners/world-bank-logo.png" },
  { nom: "Institut Français de Guinée", logo: "partners/institut-francais-logo.png" },
  { nom: "Université Kofi Annan", logo: "partners/kofi-annan-logo.png" },
  { nom: "AGUIPEL", logo: "partners/aguipel-logo.png" },
  { nom: "Ministère de la Santé", logo: "partners/ministere-sante-logo.png" },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [projetsPhares, membres] = await Promise.all([
    Promise.all(PROJETS_PHARES_SLUGS.map(getProjetBySlug)).then((list) => list.filter(Boolean)),
    getMembres(),
  ]);
  const fondateur = membres[0];

  return (
    <>
      {/* HERO */}
      <section
        className="relative overflow-hidden pt-16 pb-16 md:pt-24 md:pb-24"
        style={{ background: "linear-gradient(120deg, #2e3f32 0%, #16211a 100%)" }}
      >
        <div className="absolute inset-0 opacity-40">
          <Image src="/img/background_eg.png" alt="" fill className="object-cover" priority />
        </div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(46,63,50,0.92) 0%, rgba(22,33,26,0.94) 60%)" }} />
        <div className="relative max-w-6xl mx-auto px-5 md:px-8">
          <div className="max-w-xl">
            <div className="inline-block px-4 py-2 rounded-full bg-white/10 text-lime text-[12px] font-semibold tracking-wide mb-6">
              CABINET DE CONSEIL — CONAKRY, GUINÉE
            </div>
            <h1 className="text-[34px] leading-[1.15] md:text-[52px] md:leading-[1.15] text-white mb-5">
              Des solutions <span className="text-lime">stratégiques</span> pour un impact durable en Afrique de l&apos;Ouest
            </h1>
            <p className="text-[16px] md:text-[17px] leading-relaxed text-[#d3ddce] mb-8 max-w-md">
              Depuis 2022, nous accompagnons institutions publiques, bailleurs internationaux et entreprises en Guinée à
              travers la gouvernance, la digitalisation et l&apos;intelligence artificielle.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <Link
                href="/realisations"
                className="inline-flex items-center rounded-lg bg-lime px-6 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform"
              >
                Découvrir nos réalisations
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-lg border-[1.5px] border-white/35 px-6 py-3.5 text-[15px] font-semibold text-white active:scale-[0.97] transition-transform"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-9 grid grid-cols-2 md:grid-cols-4 gap-y-6 border-b border-line">
        {[
          ["17+", "Projets réalisés depuis 2022"],
          ["200+", "Acteurs formés sur le terrain"],
          ["8", "Régions administratives couvertes"],
          ["10+", "Partenaires institutionnels et bailleurs"],
        ].map(([num, label], i) => (
          <div key={label} className={`px-5 md:px-6 ${i > 0 ? "md:border-l md:border-line" : ""} ${i % 2 === 1 ? "border-l border-line" : ""}`}>
            <div className="text-[28px] md:text-[30px] font-extrabold text-dark-2" style={{ fontFamily: "var(--font-head)" }}>
              {num}
            </div>
            <div className="text-[13px] text-ink-soft mt-1">{label}</div>
          </div>
        ))}
      </section>

      {/* A PROPOS (résumé) */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <SectionHead
          eyebrow="QUI SOMMES-NOUS"
          title="Pourquoi Efficience Globale existe"
        />
        <p className="text-[16px] leading-relaxed text-ink-soft max-w-2xl -mt-6 mb-9">
          Fondée le 27 juillet 2022 à Conakry par Oumar Camara — fort d&apos;une décennie d&apos;expérience chez PwC, EY et
          Accenture — Efficience Globale développe et implémente des solutions sur mesure qui s&apos;inscrivent dans le
          contexte local de l&apos;Afrique de l&apos;Ouest, en particulier en Guinée.
        </p>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            ["Vision", "« Devenir un acteur de référence en conseil stratégique et opérationnel en Afrique de l'Ouest. »", true],
            ["Mission", "« Accompagner les organisations à adresser efficacement les défis de développement structurel. »", true],
            ["Positionnement", "Expertise locale, standards internationaux — le meilleur des deux mondes au service de nos partenaires.", false],
          ].map(([titre, texte, italic]) => (
            <div key={titre} className="bg-cream rounded-xl p-7">
              <h3 className="text-[18px] mb-2.5">{titre}</h3>
              <p className={`text-[14.5px] leading-relaxed text-ink-soft ${italic ? "italic" : ""}`}>{texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DOMAINES */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-4 md:py-8 pb-16 md:pb-20">
        <SectionHead eyebrow="DOMAINES D'INTERVENTION" title="Où nous créons de la valeur" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-6">
          {[
            { titre: "Santé Globale", desc: "Des solutions innovantes aux défis de la santé publique, centrées sur l'accessibilité et l'efficacité des services.", photo: "/img/domaines/sante-afrique.jpg", tint: "rgba(61,83,71,0.82)", icon: <IconHealth /> },
            { titre: "Éducation", desc: "Des stratégies pour révolutionner les méthodes pédagogiques et améliorer l'expérience d'apprentissage.", photo: "/img/domaines/education-afrique.jpg", tint: "rgba(124,179,66,0.82)", icon: <IconEducation /> },
            { titre: "Industrie", desc: "Stimuler la croissance industrielle : transformation des ressources locales et chaînes d'approvisionnement.", photo: "/img/domaines/industrie-afrique.jpg", tint: "rgba(183,194,51,0.82)", icon: <IconIndustry /> },
            { titre: "TIC & IA", desc: "L'IA et les nouvelles technologies au service de systèmes de gestion plus intelligents et efficaces.", photo: "/img/domaines/tic-afrique.jpg", tint: "rgba(0,137,123,0.82)", icon: <IconTic /> },
          ].map((d, i) => (
            <Reveal key={d.titre} index={i}>
              <DomainCard {...d} />
            </Reveal>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/domaines" className="text-[14.5px] font-semibold text-dark-2">
            En savoir plus sur nos domaines →
          </Link>
        </div>
      </section>

      {/* CONVICTIONS */}
      <section className="bg-darker py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <SectionHead eyebrow="NOS CONVICTIONS" title="Ce qui nous caractérise" dark />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 -mt-6">
            {[
              ["01", <IconCheck key="i" />, "Transparence", "Une honnêteté et une ouverture qui renforcent la confiance de nos partenaires et clients."],
              ["02", <IconBulb key="i" />, "Innovation", "Nous cultivons la pensée innovante pour rester à l'avant-garde des solutions stratégiques."],
              ["03", <IconLeaf key="i" />, "Durabilité", "Des stratégies qui servent les intérêts actuels sans compromettre ceux des générations futures."],
              ["04", <IconTrend key="i" />, "Efficience", "Une optimisation constante pour offrir la meilleure valeur à nos clients."],
            ].map(([num, icon, titre, desc]) => (
              <div key={titre}>
                <div className="text-[15px] font-extrabold text-lime-2 mb-4">{num}</div>
                <div className="mb-3.5">{icon}</div>
                <h4 className="text-white text-[17px] mb-2">{titre}</h4>
                <p className="text-[13.5px] leading-relaxed text-[#b9c4b4]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-cream py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <SectionHead eyebrow="SERVICES" title="Ce que nous faisons concrètement" />
          <div className="-mt-6">
            {[
              [<IconSearch key="i" />, "Diagnostic stratégique approfondi", "Identification des blocages et des leviers d'action pertinents."],
              [<IconDocs key="i" />, "Structuration des cadres opérationnels", "Mise en place d'outils et corpus documentaires — politiques, stratégies, procédures."],
              [<IconChart key="i" />, "Optimisation par les nouvelles technologies", "Tableaux de bord interactifs, intégration de l'IA, suivi en temps réel."],
              [<IconTeam key="i" />, "Renforcement des capacités", "Formations ciblées et coaching pour garantir la durabilité des résultats."],
            ].map(([icon, titre, desc], i, arr) => (
              <div key={titre} className={`flex items-start gap-5 py-5 ${i < arr.length - 1 ? "border-b border-line" : ""}`}>
                <div className="w-[52px] h-[52px] min-w-[52px] rounded-full bg-white border-[1.5px] border-lime flex items-center justify-center">
                  {icon}
                </div>
                <div>
                  <h3 className="text-[17px] mb-1">{titre}</h3>
                  <p className="text-[14.5px] text-ink-soft">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/services" className="inline-block mt-6 text-[14.5px] font-semibold text-dark-2">
            Découvrir notre méthode en détail →
          </Link>
        </div>
      </section>

      {/* REALISATIONS */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <SectionHead
          eyebrow="RÉALISATIONS"
          title="Des résultats concrets, mesurables"
          lead="Un aperçu de nos projets menés avec des bailleurs et institutions de référence entre 2022 et 2025."
        />
        <div className="grid md:grid-cols-3 gap-5 -mt-4">
          {projetsPhares.map((p, i) => (
            <Reveal key={p.slug} index={i}>
              <ProjectCard projet={p} />
            </Reveal>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/realisations"
            className="inline-flex items-center rounded-lg border-[1.5px] border-dark-2 text-dark-2 px-6 py-3.5 text-[15px] font-semibold active:scale-[0.97] transition-transform"
          >
            Voir les 17 projets et partenariats
          </Link>
        </div>
      </section>

      {/* EQUIPE (teaser) */}
      <section className="bg-cream py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <SectionHead eyebrow="NOTRE ÉQUIPE" title="Une équipe pluridisciplinaire de 15 personnes" />
          {fondateur && (
            <div className="bg-white rounded-xl p-7 max-w-lg -mt-4">
              <Image
                src={fondateur.photo_url}
                alt={fondateur.nom}
                width={72}
                height={72}
                className="rounded-full object-cover mb-5 h-[72px] w-[72px]"
              />
              <h3 className="text-[19px] mb-1">{fondateur.nom}</h3>
              <div className="text-[13.5px] font-semibold text-lime mb-4">{fondateur.role}</div>
              <p className="text-[14px] leading-relaxed text-ink-soft">{fondateur.bio}</p>
            </div>
          )}
          <Link href="/equipe" className="inline-block mt-6 text-[14.5px] font-semibold text-dark-2">
            Voir toute l&apos;équipe →
          </Link>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20 text-center">
        <div className="text-[12.5px] font-bold tracking-wide text-lime mb-3.5">PARTENAIRES</div>
        <h2 className="text-[28px] md:text-[34px] mb-9">Ils nous font confiance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PARTENAIRES.map((p) => (
            <div key={p.nom} className="border border-line rounded-xl h-[84px] flex items-center justify-center px-4">
              <Image
                src={`/img/${p.logo}`}
                alt={p.nom}
                width={120}
                height={46}
                className="max-h-[46px] w-auto object-contain grayscale opacity-90"
              />
            </div>
          ))}
        </div>
        <Link href="/partenaires" className="inline-block mt-8 text-[14.5px] font-semibold text-dark-2">
          Voir tous nos partenaires →
        </Link>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, #3D5347 0%, #16211A 100%)" }} className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8 text-center">
          <h2 className="text-white text-[28px] md:text-[36px] mb-4">Discutons de votre prochain projet</h2>
          <p className="text-[#d3ddce] text-[16px] max-w-lg mx-auto mb-8">
            Gouvernance, digitalisation, intelligence artificielle ou renforcement de capacités — parlons de vos
            objectifs.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-lg bg-lime px-7 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform"
          >
            Nous écrire
          </Link>
        </div>
      </section>
    </>
  );
}
