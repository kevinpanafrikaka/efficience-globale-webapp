export const metadata = {
  title: "À propos",
  description: "Vision, mission et positionnement d'Efficience Globale, cabinet de conseil en stratégie fondé en 2022 à Conakry.",
};

export default function AProposPage() {
  return (
    <>
      <section className="py-14 md:py-16" style={{ background: "linear-gradient(120deg, #2e3f32 0%, #16211a 100%)" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-lime-2 text-[12.5px] font-bold tracking-wide mb-3.5">À PROPOS</div>
          <h1 className="text-white text-[28px] md:text-[42px] leading-tight">Pourquoi Efficience Globale existe</h1>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 md:px-8 py-14 md:py-16">
        <p className="text-[16px] leading-relaxed text-ink-soft mb-6">
          Efficience Globale (EG), fondée le 27 juillet 2022 à Conakry, est une société de conseil en stratégie et
          gestion, qui a vocation à développer et implémenter des solutions sur mesure qui s&apos;inscrivent
          parfaitement dans le contexte local de l&apos;Afrique de l&apos;Ouest, particulièrement en Guinée.
        </p>
        <p className="text-[16px] leading-relaxed text-ink-soft mb-12">
          Fondée par Oumar Camara — fort d&apos;une décennie d&apos;expérience en gouvernance, finance, planification
          stratégique, engagement des parties prenantes et suivi-évaluation chez PwC, EY et Accenture à Paris — le
          cabinet allie expertise technique internationale et forte implication des acteurs locaux.
        </p>

        <div className="grid gap-5 mb-12">
          <div className="bg-cream rounded-xl p-7">
            <h2 className="text-[18px] mb-2.5">Vision</h2>
            <p className="text-[14.5px] leading-relaxed text-ink-soft italic">
              « Devenir un acteur de référence en conseil stratégique et opérationnel en Afrique de l&apos;Ouest. »
            </p>
          </div>
          <div className="bg-cream rounded-xl p-7">
            <h2 className="text-[18px] mb-2.5">Mission</h2>
            <p className="text-[14.5px] leading-relaxed text-ink-soft italic">
              « Accompagner les organisations à adresser efficacement les défis de développement structurel. »
            </p>
          </div>
          <div className="bg-cream rounded-xl p-7">
            <h2 className="text-[18px] mb-2.5">Positionnement</h2>
            <p className="text-[14.5px] leading-relaxed text-ink-soft">
              Expertise locale, standards internationaux — le meilleur des deux mondes au service de nos partenaires.
            </p>
          </div>
        </div>

        <h2 className="text-[20px] mb-5">Nos convictions</h2>
        <div className="grid grid-cols-2 gap-6">
          {[
            ["Transparence", "Une honnêteté et une ouverture qui renforcent la confiance de nos partenaires et clients."],
            ["Innovation", "Nous cultivons la pensée innovante pour rester à l'avant-garde des solutions stratégiques."],
            ["Durabilité", "Des stratégies qui servent les intérêts actuels sans compromettre ceux des générations futures."],
            ["Efficience", "Une optimisation constante pour offrir la meilleure valeur à nos clients."],
          ].map(([titre, desc]) => (
            <div key={titre}>
              <h3 className="text-[16px] mb-1.5">{titre}</h3>
              <p className="text-[14px] leading-relaxed text-ink-soft">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
