import Image from "next/image";
import Link from "next/link";
import SectionHead from "@/components/SectionHead";
import DomainCard from "@/components/DomainCard";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import { getProjetBySlug, getMembres } from "@/lib/db";
import { IconBulb, IconChart, IconTrend } from "@/components/icons";

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
      {/* HERO — photo plein cadre en fond, stats intégrées en bas */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/img/hero-conakry.jpg" alt="" fill className="object-cover" priority />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(13,19,14,0.65) 0%, rgba(13,19,14,0.3) 42%, rgba(13,19,14,0.1) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(13,19,14,0.05) 0%, rgba(13,19,14,0.1) 55%, rgba(10,15,11,0.85) 100%)" }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-16 pb-14 md:pt-28 md:pb-0">
          <div className="max-w-xl">
            <h1 className="text-[40px] leading-[1.02] md:text-[60px] md:leading-[1.0] tracking-[-0.02em] text-white mb-7">
              Des solutions <span className="text-lime italic">stratégiques</span> pour un impact durable en Afrique de l&apos;Ouest
            </h1>
            <p className="text-[16px] md:text-[17.5px] leading-relaxed text-[#d3ddce] mb-9 max-w-md">
              Nous accompagnons institutions publiques, bailleurs internationaux et entreprises en Guinée à travers la
              gouvernance, la digitalisation et l&apos;intelligence artificielle.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/realisations"
                className="inline-flex items-center rounded bg-lime px-7 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2"
              >
                Découvrir nos réalisations
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded border-[1.5px] border-white/40 px-7 py-3.5 text-[15px] font-semibold text-white backdrop-blur-sm active:scale-[0.97] transition-transform hover:border-white hover:bg-white/10"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="relative border-t border-white/15 mt-14 md:mt-16">
          <div className="max-w-6xl mx-auto px-5 md:px-8 grid grid-cols-2 md:grid-cols-4">
            {[
              ["17+", "Projets réalisés depuis 2022"],
              ["200+", "Acteurs formés sur le terrain"],
              ["8", "Régions administratives couvertes"],
              ["10+", "Partenaires institutionnels et bailleurs"],
            ].map(([num, label], i) => (
              <div
                key={label}
                className={`py-7 md:py-9 ${i % 2 === 1 ? "pl-5" : "pr-5"} ${i >= 2 ? "border-t border-white/15 md:border-t-0" : ""} ${i > 0 ? "md:pl-8 md:border-l md:border-white/15" : ""}`}
              >
                <div className="text-[34px] md:text-[42px] leading-none tracking-[-0.02em] font-extrabold text-white tabular-nums">
                  {num}
                </div>
                <div className="text-[13px] text-[#c7d1c2] mt-2">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A PROPOS (résumé) */}
      <section className="bg-white max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-12 gap-10 md:gap-0">
          <Reveal className="md:col-span-5">
            <div className="text-[12px] font-bold tracking-[0.14em] text-lime mb-4">QUI SOMMES-NOUS</div>
            <h2 className="text-[32px] md:text-[42px] leading-[1.1] tracking-[-0.02em] text-dark mb-5">
              Une <span className="text-lime italic">conviction</span>, un cabinet
            </h2>
            <p className="text-[16px] leading-relaxed text-ink-soft max-w-sm">
              Fondée en <span className="italic text-lime">juillet 2022</span> à Conakry par Oumar Camara,
              Efficience Globale est votre partenaire stratégique pour un impact durable en Afrique de
              l&apos;Ouest.
            </p>
          </Reveal>

          <Reveal index={1} className="md:col-span-7 md:pl-14 md:border-l border-line">
            <div className="flex flex-col gap-8">
              {[
                [
                  <IconBulb key="i" stroke="var(--lime)" width="24" height="24" />,
                  <>
                    Efficience Globale se distingue par son{" "}
                    <span className="text-lime font-semibold">approche innovante</span> et sa profonde
                    connaissance des dynamiques locales et régionales de l&apos;Afrique de l&apos;Ouest.
                  </>,
                ],
                [
                  <IconChart key="i" stroke="var(--lime)" width="24" height="24" />,
                  <>
                    Notre mission est de développer et d&apos;implémenter des{" "}
                    <span className="text-lime font-semibold">solutions sur mesure</span> qui s&apos;inscrivent
                    parfaitement dans le contexte local de l&apos;Afrique de l&apos;Ouest, particulièrement en
                    Guinée.
                  </>,
                ],
                [
                  <IconTrend key="i" stroke="var(--lime)" width="24" height="24" />,
                  <>
                    Notre ambition est de créer un <span className="text-lime font-semibold">impact durable</span>{" "}
                    sur les communautés que nous servons, en alliant connaissances locales et meilleures
                    pratiques internationales.
                  </>,
                ],
              ].map(([icon, texte], i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">{icon}</div>
                  <p className="text-[15.5px] leading-relaxed text-ink-soft">{texte}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* DOMAINES */}
      <section className="bg-darker py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <SectionHead
            eyebrow="DOMAINES D'INTERVENTION"
            title={
              <>
                Quatre domaines, une même <span className="text-lime-2 italic">exigence</span>
              </>
            }
            dark
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { titre: "Santé Globale", description: "Renforcer les systèmes de santé publique, de la vaccination à la nutrition, pour des services plus accessibles et mieux pilotés.", photo: "/img/domaines/sante-afrique.jpg", tint: "rgba(61,83,71,0.82)" },
              { titre: "Éducation", description: "Moderniser les pratiques pédagogiques et renforcer les compétences des enseignants comme des apprenants.", photo: "/img/domaines/education-afrique.jpg", tint: "rgba(124,179,66,0.82)" },
              { titre: "Industrie", description: "Structurer les chaînes de valeur locales et accompagner la mise aux normes des filières agro-industrielles.", photo: "/img/domaines/industrie-afrique.jpg", tint: "rgba(183,194,51,0.82)" },
              { titre: "TIC & IA", description: "Déployer des outils numériques et des agents IA au service d'une décision publique plus rapide et plus fiable.", photo: "/img/domaines/tic-afrique.jpg", tint: "rgba(0,137,123,0.82)" },
            ].map((d, i) => (
              <Reveal key={d.titre} index={i} className={i % 2 === 1 ? "md:mt-10" : ""}>
                <DomainCard {...d} />
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/domaines" className="text-[14.5px] font-semibold text-lime-2">
              En savoir plus sur nos domaines →
            </Link>
          </div>
        </div>
      </section>

      {/* CONVICTIONS */}
      <section className="bg-darker py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <SectionHead eyebrow="NOS CONVICTIONS" title="Ce qui nous caractérise" dark />
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              ["01", "Transparence", "Une honnêteté et une ouverture qui renforcent la confiance de nos partenaires et clients."],
              ["02", "Innovation", "Nous cultivons la pensée innovante pour rester à l'avant-garde des solutions stratégiques."],
              ["03", "Durabilité", "Des stratégies qui servent les intérêts actuels sans compromettre ceux des générations futures."],
              ["04", "Efficience", "Une optimisation constante pour offrir la meilleure valeur à nos clients."],
            ].map(([num, titre, desc], i) => (
              <Reveal
                key={titre}
                index={i}
                className={`py-6 md:py-0 md:pb-2 ${i >= 2 ? "border-t border-white/10 md:border-t-0" : ""} ${i > 0 ? "md:pl-8 md:border-l md:border-white/10" : ""} ${i % 2 === 1 ? "pl-6" : "pr-6 md:pr-8"}`}
              >
                <div className="text-[46px] leading-none font-extrabold text-white/10 mb-4 tabular-nums">{num}</div>
                <h4 className="text-white text-[18px] mb-2">{titre}</h4>
                <p className="text-[13.5px] leading-relaxed text-[#b9c4b4]">{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <SectionHead eyebrow="SERVICES" title="Ce que nous faisons concrètement" />
          <div>
            {[
              ["01", "Diagnostic stratégique approfondi", "Identification des blocages et des leviers d'action pertinents."],
              ["02", "Structuration des cadres opérationnels", "Mise en place d'outils et corpus documentaires — politiques, stratégies, procédures."],
              ["03", "Optimisation par les nouvelles technologies", "Tableaux de bord interactifs, intégration de l'IA, suivi en temps réel."],
              ["04", "Renforcement des capacités", "Formations ciblées et coaching pour garantir la durabilité des résultats."],
            ].map(([num, titre, desc], i, arr) => (
              <Reveal
                key={titre}
                index={i}
                className={`flex items-start gap-6 py-7 ${i < arr.length - 1 ? "border-b border-line" : ""}`}
              >
                <div className="text-[15px] font-extrabold text-lime tabular-nums pt-0.5">{num}</div>
                <div>
                  <h3 className="text-[18px] mb-1.5 tracking-[-0.01em]">{titre}</h3>
                  <p className="text-[14.5px] text-ink-soft leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Link href="/services" className="inline-block mt-8 text-[14.5px] font-semibold text-dark-2 border-b-2 border-lime pb-0.5">
            Découvrir notre méthode en détail →
          </Link>
        </div>
      </section>

      {/* REALISATIONS */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <SectionHead
          eyebrow="RÉALISATIONS"
          title="Des résultats concrets, mesurables"
          lead="Un aperçu de nos projets menés avec des bailleurs et institutions de référence entre 2022 et 2025."
        />
        <div className="grid md:grid-cols-3 gap-x-5 gap-y-9">
          {projetsPhares.map((p, i) => (
            <Reveal key={p.slug} index={i}>
              <ProjectCard projet={p} />
            </Reveal>
          ))}
        </div>
        <div className="mt-12">
          <Link href="/realisations" className="inline-flex items-center text-[15px] font-semibold text-dark-2 border-b-2 border-dark-2 pb-0.5">
            Voir les 17 projets et partenariats →
          </Link>
        </div>
      </section>

      {/* EQUIPE (teaser) */}
      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <SectionHead eyebrow="NOTRE ÉQUIPE" title="Une équipe pluridisciplinaire de 15 personnes" />
          {fondateur && (
            <Reveal className="flex flex-col md:flex-row gap-7 md:items-start max-w-2xl border-t border-line pt-8">
              <Image
                src={fondateur.photo_url}
                alt={fondateur.nom}
                width={88}
                height={88}
                className="object-cover h-[88px] w-[88px] flex-shrink-0 grayscale"
              />
              <div>
                <h3 className="text-[20px] mb-1 tracking-[-0.01em]">{fondateur.nom}</h3>
                <div className="text-[13.5px] font-semibold text-lime mb-4">{fondateur.role}</div>
                <p className="text-[14.5px] leading-relaxed text-ink-soft">{fondateur.bio}</p>
              </div>
            </Reveal>
          )}
          <Link href="/equipe" className="inline-block mt-8 text-[14.5px] font-semibold text-dark-2 border-b-2 border-lime pb-0.5">
            Voir toute l&apos;équipe →
          </Link>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <SectionHead eyebrow="PARTENAIRES" title="Ils nous font confiance" />
        <div className="grid grid-cols-2 md:grid-cols-4">
          {PARTENAIRES.map((p, i) => (
            <Reveal
              key={p.nom}
              index={i}
              className={`h-[90px] flex items-center px-4 md:px-6 ${i % 2 === 1 ? "border-l border-line" : ""} ${i >= 2 ? "border-t border-line" : ""} ${i % 4 !== 0 ? "md:border-l" : "md:border-l-0"} ${i >= 4 ? "md:border-t" : "md:border-t-0"}`}
            >
              <Image
                src={`/img/${p.logo}`}
                alt={p.nom}
                width={120}
                height={46}
                className="max-h-[42px] w-auto object-contain grayscale opacity-80"
              />
            </Reveal>
          ))}
        </div>
        <Link href="/partenaires" className="inline-block mt-8 text-[14.5px] font-semibold text-dark-2 border-b-2 border-lime pb-0.5">
          Voir tous nos partenaires →
        </Link>
      </section>

      {/* CTA */}
      <section className="bg-darker py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="max-w-2xl">
            <h2 className="text-white text-[32px] md:text-[48px] leading-[1.08] tracking-[-0.02em] mb-5">
              Discutons de votre prochain projet
            </h2>
            <p className="text-[#d3ddce] text-[16px] md:text-[17px] leading-relaxed max-w-lg mb-9">
              Gouvernance, digitalisation, intelligence artificielle ou renforcement de capacités — parlons de vos
              objectifs.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center rounded bg-lime px-7 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform"
            >
              Nous écrire
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
