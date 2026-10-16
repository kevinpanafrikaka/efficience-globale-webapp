import Image from "@/components/SiteImage";
import Link from "next/link";
import SectionHead from "@/components/SectionHead";
import DomainCard from "@/components/DomainCard";
import RealisationTeaser from "@/components/RealisationTeaser";
import Reveal from "@/components/Reveal";
import { getProjetsRecents, countProjets, getMembres, getPartenaires, getEquipeStats } from "@/lib/db";
import PartnerCard from "@/components/PartnerCard";
import {
  IconBulb,
  IconChart,
  IconTrend,
  IconEye,
  IconSparkle,
  IconDrop,
  IconTarget,
  IconSearch,
  IconDocs,
  IconTeam,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [projetsRecents, nbProjets, membres, partenaires, equipeStats] = await Promise.all([
    getProjetsRecents(6),
    countProjets(),
    getMembres(),
    getPartenaires(),
    getEquipeStats(),
  ]);
  const fondateur = membres[0];

  return (
    <>
      {/* HERO — photo plein cadre en fond, stats intégrées en bas */}
      <section className="home-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/img/hero-conakry.jpg" alt="" fill className="object-cover object-right" priority />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(13,19,14,0.9) 0%, rgba(13,19,14,0.65) 55%, rgba(13,19,14,0.25) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(13,19,14,0.05) 0%, rgba(13,19,14,0.1) 55%, rgba(10,15,11,0.85) 100%)" }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-16 pb-14 md:pt-28 md:pb-0">
          <div className="max-w-2xl">
            <h1 className="text-[40px] leading-[1.08] md:text-[64px] md:leading-[1.06] tracking-[-0.02em] text-white mb-7">
              Des solutions <span className="text-lime-2 italic">stratégiques</span> pour un impact durable en Afrique de l&apos;Ouest
            </h1>
            <p className="text-[16px] md:text-[17.5px] leading-relaxed text-[#d3ddce] mb-9 max-w-md">
              Nous accompagnons institutions publiques, bailleurs internationaux et entreprises en Guinée et dans la
              sous-région ouest-africaine à travers la gouvernance, la digitalisation et l&apos;intelligence
              artificielle.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/realisations"
                className="inline-flex items-center rounded bg-lime px-7 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2"
              >
                Découvrir nos réalisations <span aria-hidden="true" className="ml-3">↗</span>
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
              [`${nbProjets.realises}+`, "Projets réalisés depuis 2022"],
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
            <span className="inline-flex items-center border-[1.5px] border-lime text-[11px] font-bold tracking-[0.1em] px-3 py-1.5 text-lime mb-4">
              QUI SOMMES-NOUS
            </span>
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
            <Link
              href="/domaines"
              className="inline-flex items-center rounded bg-lime px-7 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2"
            >
              En savoir plus sur nos domaines →
            </Link>
          </div>
        </div>
      </section>

      {/* CONVICTIONS */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <SectionHead
            eyebrow="NOS CONVICTIONS"
            title={
              <>
                Ce qui guide chaque <span className="text-lime italic">mission</span>
              </>
            }
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { titre: "Transparence", desc: "Une honnêteté et une ouverture qui renforcent la confiance de nos partenaires et clients.", icon: <IconEye /> },
              { titre: "Innovation", desc: "Nous cultivons la pensée innovante pour rester à l'avant-garde des solutions stratégiques.", icon: <IconSparkle /> },
              { titre: "Durabilité", desc: "Des stratégies qui servent les intérêts actuels sans compromettre ceux des générations futures.", icon: <IconDrop /> },
              { titre: "Efficience", desc: "Une optimisation constante pour offrir la meilleure valeur à nos clients.", icon: <IconTarget /> },
            ].map((v, i) => (
              <Reveal key={v.titre} index={i} className="conviction-card group bg-white rounded-xl p-4 sm:p-5 border border-line">
                <div className="flex items-center gap-3 mb-3">
                  <div className="conviction-icon w-9 h-9 rounded-lg bg-cream border border-line flex items-center justify-center text-lime shrink-0">
                    {v.icon}
                  </div>
                  <h3 className="text-[16px] sm:text-[17px] tracking-[-0.01em] leading-tight">{v.titre}</h3>
                </div>
                <p className="text-[13.5px] text-ink-soft leading-relaxed">{v.desc}</p>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-line text-center">
            <p className="italic text-[16px] md:text-[17px] text-ink-soft max-w-2xl mx-auto" style={{ fontFamily: "var(--font-head)" }}>
              En somme nous unissons nos forces pour façonner aujourd&apos;hui les solutions qui feront grandir le
              monde de demain.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-darker py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <SectionHead
            eyebrow="SERVICES"
            title={
              <>
                Ce que nous <span className="text-lime-2 italic">faisons</span> concrètement
              </>
            }
            dark
          />
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
            {[
              { titre: "Diagnostic stratégique approfondi", desc: "Identification des blocages et des leviers d'action pertinents.", icon: <IconSearch stroke="var(--lime-2)" width="18" height="18" /> },
              { titre: "Structuration des cadres opérationnels", desc: "Mise en place d'outils et corpus documentaires : politiques, stratégies, procédures.", icon: <IconDocs stroke="var(--lime-2)" width="18" height="18" /> },
              { titre: "Optimisation par les nouvelles technologies", desc: "Tableaux de bord interactifs, intégration de l'IA, suivi en temps réel.", icon: <IconChart stroke="var(--lime-2)" width="18" height="18" /> },
              { titre: "Renforcement des capacités", desc: "Formations ciblées et coaching pour garantir la durabilité des résultats.", icon: <IconTeam stroke="var(--lime-2)" width="18" height="18" /> },
            ].map((s, i) => (
              <Reveal key={s.titre} index={i} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <div>
                  <h3 className="text-white text-[16.5px] mb-1 tracking-[-0.01em]">{s.titre}</h3>
                  <p className="text-[13.5px] text-[#b9c4b4] leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Link
            href="/services"
            className="inline-flex items-center rounded bg-lime mt-8 px-7 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2"
          >
            Découvrir notre méthode en détail →
          </Link>
        </div>
      </section>

      {/* REALISATIONS */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <SectionHead
          eyebrow="RÉALISATIONS"
          title={
            <>
              Des résultats <span className="text-lime italic">concrets</span> et mesurables
            </>
          }
          lead="Un aperçu de nos projets menés avec des bailleurs et institutions de référence."
        />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {projetsRecents.map((p, i) => (
            <Reveal key={p.slug} index={i}>
              <RealisationTeaser projet={p} />
            </Reveal>
          ))}
        </div>
        <div className="mt-12">
          <Link
            href="/realisations"
            className="inline-flex items-center rounded bg-lime px-7 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2"
          >
            Voir les {nbProjets.total} projets et partenariats →
          </Link>
        </div>
      </section>

      {/* EQUIPE (teaser) */}
      <section className="bg-darker py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <SectionHead
            eyebrow="NOTRE ÉQUIPE"
            title={
              <>
                Une équipe <span className="text-lime-2 italic">pluridisciplinaire</span>
              </>
            }
            dark
          />
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 border-t border-white/10 pt-8">
            {fondateur && (
              <Reveal className="md:col-span-6 flex gap-6 items-start">
                <Image
                  src={fondateur.photo_url}
                  alt={fondateur.nom}
                  width={104}
                  height={104}
                  className="object-cover h-[104px] w-[104px] flex-shrink-0"
                />
                <div>
                  <h3 className="text-white text-[20px] mb-1 tracking-[-0.01em]">{fondateur.nom}</h3>
                  <div className="text-[13.5px] font-semibold text-lime-2 mb-3">{fondateur.role}</div>
                  <p className="text-[14px] leading-relaxed text-[#b9c4b4]">{fondateur.bio}</p>
                </div>
              </Reveal>
            )}
            <Reveal index={1} className="md:col-span-6 md:border-l md:border-white/10 md:pl-14">
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {equipeStats.map((s) => (
                  <div key={s.label}>
                    <div
                      className="text-[32px] leading-none font-extrabold text-white tabular-nums mb-1.5"
                      style={{ fontFamily: "var(--font-head)" }}
                    >
                      {s.nombre}
                    </div>
                    <p className="text-[12.5px] text-[#b9c4b4] leading-snug">{s.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <Link
            href="/equipe"
            className="inline-flex items-center rounded bg-lime mt-8 px-7 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2"
          >
            Voir toute l&apos;équipe →
          </Link>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section className="py-16 md:py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <SectionHead
            eyebrow="PARTENAIRES"
            title={
              <>
                Ils nous font déjà <span className="text-lime italic">confiance</span>
              </>
            }
            lead="Des institutions et organisations de premier plan nous ont accordé leur confiance pour mener à bien leurs projets à travers l'Afrique de l'Ouest."
          />
        </div>

        <div className="partner-marquee-wrap">
          <div className="partner-marquee flex items-stretch gap-4 px-5 md:px-8">
            {[...partenaires, ...partenaires].map((p, i) => (
              <PartnerCard key={i} partenaire={p} className="flex-shrink-0 w-[190px]" />
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-5 md:px-8 mt-10">
          <Link
            href="/partenaires"
            className="inline-flex items-center rounded bg-lime px-7 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2"
          >
            Voir tous nos partenaires →
          </Link>
        </div>
      </section>

      {/* CONTACT */}
      <section className="border-t border-line py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <SectionHead
            eyebrow="CONTACT"
            title={
              <>
                Discutons de votre prochain <span className="text-lime italic">projet</span>
              </>
            }
            lead="Gouvernance, digitalisation, intelligence artificielle ou renforcement de capacités : parlons de vos objectifs."
            className="mb-0"
          />
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-9">
            <Link
              href="/contact"
              className="inline-flex items-center rounded bg-lime px-7 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2"
            >
              Nous contacter
            </Link>
            <a
              href="tel:+224626852951"
              className="text-[14.5px] font-semibold text-dark-2 border-b-2 border-lime pb-0.5"
            >
              ou appelez-nous : +224 626 852 951
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
