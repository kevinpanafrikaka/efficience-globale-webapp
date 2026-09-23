export const metadata = {
  title: "Services",
  description: "Ce que fait Efficience Globale concrètement : diagnostic, structuration, digitalisation, renforcement des capacités.",
};

const SERVICES = [
  {
    titre: "Diagnostic stratégique approfondi",
    desc: "Identification des blocages et des leviers d'action pertinents.",
  },
  {
    titre: "Structuration des cadres opérationnels",
    desc: "Mise en place d'outils et corpus documentaires — politiques, stratégies, procédures.",
  },
  {
    titre: "Optimisation par les nouvelles technologies",
    desc: "Tableaux de bord interactifs, intégration de l'IA, suivi en temps réel.",
  },
  {
    titre: "Renforcement des capacités",
    desc: "Formations ciblées et coaching pour garantir la durabilité des résultats.",
  },
];

const PHASES_IA = [
  {
    num: "1",
    titre: "Analyse des besoins",
    desc: "Évaluation des processus actuels pour identifier où l'IA générative aurait l'impact le plus significatif, et définition d'objectifs clairs (productivité, qualité, prise de décision).",
  },
  {
    num: "2",
    titre: "Personnalisation",
    desc: "Création de modèles d'IA sur mesure, intégration fluide avec les systèmes existants, garantie de la protection des données.",
  },
  {
    num: "3",
    titre: "Déploiement et formation",
    desc: "Sessions de formation pour les utilisateurs clés, centrées sur l'utilisation efficace et éthique, avec un soutien technique régulier.",
  },
  {
    num: "4",
    titre: "Support et adoption",
    desc: "Stratégie de communication pour informer toutes les parties prenantes, et accompagnement de la collaboration pour soutenir la mise à l'échelle.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-darker">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-white/15 w-fit">
            <span className="text-[12px] font-bold tracking-[0.14em] text-lime-2">SERVICES</span>
          </div>
          <h1 className="text-white text-[36px] md:text-[56px] leading-[1.05] tracking-[-0.02em] max-w-2xl">
            Ce que nous faisons concrètement
          </h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        {SERVICES.map((s, i, arr) => (
          <div key={s.titre} className={`flex items-start gap-6 py-8 ${i < arr.length - 1 ? "border-b border-line" : ""}`}>
            <div className="text-[16px] font-extrabold text-lime tabular-nums pt-0.5">0{i + 1}</div>
            <div>
              <h3 className="text-[19px] mb-1.5 tracking-[-0.01em]">{s.titre}</h3>
              <p className="text-[15px] text-ink-soft leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-[12px] font-bold tracking-[0.1em] text-lime mb-3.5">POUR ALLER PLUS LOIN</div>
          <h2 className="text-[28px] md:text-[38px] tracking-[-0.01em] mb-4">Notre accompagnement IA en 4 phases</h2>
          <p className="text-[15.5px] text-ink-soft leading-relaxed max-w-2xl mb-12">
            Quand un projet implique l&apos;intégration de l&apos;intelligence artificielle générative, nous suivons une
            méthode structurée pour maximiser la productivité et la qualité des interventions.
          </p>
          <div className="grid md:grid-cols-4">
            {PHASES_IA.map((p, i) => (
              <div key={p.num} className={`py-6 md:py-0 ${i > 0 ? "border-t md:border-t-0 md:border-l border-line md:pl-8" : ""}`}>
                <div className="text-[34px] leading-none font-extrabold text-line mb-4 tabular-nums">{p.num}</div>
                <h3 className="text-[16px] mb-2 tracking-[-0.01em]">{p.titre}</h3>
                <p className="text-[13.5px] text-ink-soft leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
