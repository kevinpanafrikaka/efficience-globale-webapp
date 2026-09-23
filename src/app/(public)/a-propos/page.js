export const metadata = {
  title: "À propos",
  description: "Vision, mission et positionnement d'Efficience Globale, cabinet de conseil en stratégie fondé en 2022 à Conakry.",
};

export default function AProposPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-darker">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-white/15 w-fit">
            <span className="text-[12px] font-bold tracking-[0.14em] text-lime-2">À PROPOS</span>
          </div>
          <h1 className="text-white text-[36px] md:text-[56px] leading-[1.05] tracking-[-0.02em] max-w-2xl">
            Pourquoi Efficience Globale existe
          </h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-10 md:gap-14 mb-16 md:mb-20">
          <div className="flex flex-col gap-5">
            <p className="text-[18px] md:text-[20px] leading-[1.5] tracking-[-0.01em] text-dark">
              Efficience Globale (EG), fondée le 27 juillet 2022 à Conakry, est une société de conseil en stratégie
              et gestion, qui a vocation à développer et implémenter des solutions sur mesure qui s&apos;inscrivent
              parfaitement dans le contexte local de l&apos;Afrique de l&apos;Ouest, particulièrement en Guinée.
            </p>
            <p className="text-[15.5px] leading-relaxed text-ink-soft">
              Fondée par Oumar Camara — fort d&apos;une décennie d&apos;expérience en gouvernance, finance,
              planification stratégique, engagement des parties prenantes et suivi-évaluation chez PwC, EY et
              Accenture à Paris — le cabinet allie expertise technique internationale et forte implication des
              acteurs locaux.
            </p>
          </div>
          <div className="flex flex-col gap-7">
            {[
              ["Vision", "Devenir un acteur de référence en conseil stratégique et opérationnel en Afrique de l'Ouest."],
              ["Mission", "Accompagner les organisations à adresser efficacement les défis de développement structurel."],
              ["Positionnement", "Expertise locale, standards internationaux — le meilleur des deux mondes au service de nos partenaires."],
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
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              ["01", "Transparence", "Une honnêteté et une ouverture qui renforcent la confiance de nos partenaires et clients."],
              ["02", "Innovation", "Nous cultivons la pensée innovante pour rester à l'avant-garde des solutions stratégiques."],
              ["03", "Durabilité", "Des stratégies qui servent les intérêts actuels sans compromettre ceux des générations futures."],
              ["04", "Efficience", "Une optimisation constante pour offrir la meilleure valeur à nos clients."],
            ].map(([num, titre, desc], i) => (
              <div
                key={titre}
                className={`py-6 md:py-0 ${i >= 2 ? "border-t border-line md:border-t-0" : ""} ${i > 0 ? "md:pl-8 md:border-l md:border-line" : ""} ${i % 2 === 1 ? "pl-6" : "pr-6 md:pr-8"}`}
              >
                <div className="text-[34px] leading-none font-extrabold text-line mb-3 tabular-nums">{num}</div>
                <h3 className="text-[16px] mb-1.5">{titre}</h3>
                <p className="text-[13.5px] leading-relaxed text-ink-soft">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
