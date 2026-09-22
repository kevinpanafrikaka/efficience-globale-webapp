import { IconSearch, IconDocs, IconChart, IconTeam } from "@/components/icons";

export const metadata = {
  title: "Services",
  description: "Ce que fait Efficience Globale concrètement : diagnostic, structuration, digitalisation, renforcement des capacités.",
};

const SERVICES = [
  {
    icon: <IconSearch />,
    titre: "Diagnostic stratégique approfondi",
    desc: "Identification des blocages et des leviers d'action pertinents.",
  },
  {
    icon: <IconDocs />,
    titre: "Structuration des cadres opérationnels",
    desc: "Mise en place d'outils et corpus documentaires — politiques, stratégies, procédures.",
  },
  {
    icon: <IconChart />,
    titre: "Optimisation par les nouvelles technologies",
    desc: "Tableaux de bord interactifs, intégration de l'IA, suivi en temps réel.",
  },
  {
    icon: <IconTeam />,
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
      <section className="py-14 md:py-16" style={{ background: "linear-gradient(120deg, #2e3f32 0%, #16211a 100%)" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-lime-2 text-[12.5px] font-bold tracking-wide mb-3.5">SERVICES</div>
          <h1 className="text-white text-[28px] md:text-[42px] leading-tight">Ce que nous faisons concrètement</h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-16">
        {SERVICES.map((s, i, arr) => (
          <div key={s.titre} className={`flex items-start gap-5 py-6 ${i < arr.length - 1 ? "border-b border-line" : ""}`}>
            <div className="w-[52px] h-[52px] min-w-[52px] rounded-full bg-cream border-[1.5px] border-lime flex items-center justify-center">
              {s.icon}
            </div>
            <div>
              <h3 className="text-[18px] mb-1.5">{s.titre}</h3>
              <p className="text-[15px] text-ink-soft">{s.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-cream py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-[12.5px] font-bold tracking-wide text-lime mb-3.5">POUR ALLER PLUS LOIN</div>
          <h2 className="text-[26px] md:text-[32px] mb-3">Notre accompagnement IA en 4 phases</h2>
          <p className="text-[15px] text-ink-soft max-w-2xl mb-10">
            Quand un projet implique l&apos;intégration de l&apos;intelligence artificielle générative, nous suivons une
            méthode structurée pour maximiser la productivité et la qualité des interventions.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {PHASES_IA.map((p) => (
              <div key={p.num} className="bg-white rounded-xl p-6">
                <div className="text-[13px] font-extrabold text-white bg-dark-2 w-7 h-7 rounded-full flex items-center justify-center mb-4">
                  {p.num}
                </div>
                <h3 className="text-[15.5px] mb-2">{p.titre}</h3>
                <p className="text-[13px] text-ink-soft leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
