import Image from "next/image";
import { getMembres } from "@/lib/db";
import { IconEye, IconSparkle, IconDrop, IconTarget } from "@/components/icons";

export const metadata = {
  title: "À propos",
  description: "Vision, mission et positionnement d'Efficience Globale, cabinet de conseil en stratégie fondé en 2022 à Conakry.",
};

export const dynamic = "force-dynamic";

export default async function AProposPage() {
  const membres = await getMembres();
  const fondateur = membres[0];

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/img/hero-a-propos.jpg" alt="" fill className="object-cover" priority />
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
          <h1 className="text-white text-[36px] md:text-[56px] leading-[1.05] tracking-[-0.02em] max-w-2xl mb-6">
            Pourquoi nous <span className="text-lime italic">existons</span> ?
          </h1>
          <p className="text-[#d3ddce] text-[16px] md:text-[17px] leading-relaxed max-w-lg">
            Efficience Globale est née d&apos;une conviction simple : l&apos;Afrique de l&apos;Ouest a besoin d&apos;une
            expertise qui comprend son contexte autant que ses standards internationaux.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-10 md:gap-14 mb-16 md:mb-20">
          <div className="flex flex-col gap-6">
            <p className="text-[18px] md:text-[20px] leading-[1.5] tracking-[-0.01em] text-dark">
              Efficience Globale (EG), fondée le 27 juillet 2022 à Conakry, est une société de conseil en stratégie
              et gestion, qui a vocation à développer et implémenter des solutions sur mesure qui s&apos;inscrivent
              parfaitement dans le contexte local de l&apos;Afrique de l&apos;Ouest, particulièrement en Guinée.
            </p>
            {fondateur && (
              <div className="flex items-start gap-5 pt-2">
                <Image
                  src={fondateur.photo_url}
                  alt={fondateur.nom}
                  width={110}
                  height={110}
                  className="object-cover h-[110px] w-[110px] flex-shrink-0"
                />
                <div>
                  <p className="text-[15.5px] leading-relaxed text-ink-soft">
                    Fondée par <span className="text-dark-2 font-bold">{fondateur.nom}</span>, fort d&apos;une
                    décennie d&apos;expérience en gouvernance, finance, planification stratégique, engagement des
                    parties prenantes et suivi-évaluation chez PwC, EY et Accenture à Paris, le cabinet allie
                    expertise technique internationale et forte implication des acteurs locaux.
                  </p>
                  <div className="text-[13px] font-semibold text-lime mt-2">{fondateur.role}</div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-7">
            {[
              ["Vision", "Devenir un acteur de référence en conseil stratégique et opérationnel en Afrique de l'Ouest."],
              ["Mission", "Accompagner les organisations à adresser efficacement les défis de développement structurel."],
              ["Positionnement", "Expertise locale, standards internationaux : le meilleur des deux mondes au service de nos partenaires."],
            ].map(([titre, texte]) => (
              <div key={titre} className="border-l-2 border-lime pl-5">
                <h2 className="text-[13px] font-bold tracking-[0.1em] text-ink-faint mb-1.5">{titre.toUpperCase()}</h2>
                <p className="text-[14.5px] leading-relaxed text-ink-soft">{texte}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-line pt-12 md:pt-16">
          <h2 className="text-[26px] md:text-[32px] tracking-[-0.01em] mb-10">Nos convictions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { titre: "Transparence", desc: "Une honnêteté et une ouverture qui renforcent la confiance de nos partenaires et clients.", icon: <IconEye /> },
              { titre: "Innovation", desc: "Nous cultivons la pensée innovante pour rester à l'avant-garde des solutions stratégiques.", icon: <IconSparkle /> },
              { titre: "Durabilité", desc: "Des stratégies qui servent les intérêts actuels sans compromettre ceux des générations futures.", icon: <IconDrop /> },
              { titre: "Efficience", desc: "Une optimisation constante pour offrir la meilleure valeur à nos clients.", icon: <IconTarget /> },
            ].map((v) => (
              <div key={v.titre} className="conviction-card bg-white rounded-xl p-4 sm:p-5 border border-line">
                <div className="flex items-center gap-3 mb-3">
                  <div className="conviction-icon w-9 h-9 rounded-lg bg-cream border border-line flex items-center justify-center text-lime shrink-0">
                    {v.icon}
                  </div>
                  <h3 className="text-[16px] sm:text-[17px] tracking-[-0.01em] leading-tight">{v.titre}</h3>
                </div>
                <p className="text-[13.5px] text-ink-soft leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
