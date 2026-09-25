import Image from "next/image";
import { IconSearch, IconDocs, IconChart, IconTeam, IconSparkle, IconCheck } from "@/components/icons";

export const metadata = {
  title: "Services",
  description: "Ce que fait Efficience Globale concrètement : diagnostic, structuration, digitalisation, renforcement des capacités.",
};

const SERVICES = [
  {
    titre: "Diagnostic stratégique approfondi",
    desc: "Identification des blocages et des leviers d'action pertinents.",
    Icon: IconSearch,
  },
  {
    titre: "Structuration des cadres opérationnels",
    desc: "Mise en place d'outils et corpus documentaires : politiques, stratégies, procédures.",
    Icon: IconDocs,
  },
  {
    titre: "Optimisation par les nouvelles technologies",
    desc: "Tableaux de bord interactifs, intégration de l'IA, suivi en temps réel.",
    Icon: IconChart,
  },
  {
    titre: "Renforcement des capacités",
    desc: "Formations ciblées et coaching pour garantir la durabilité des résultats.",
    Icon: IconTeam,
  },
];

const PHASES_IA = [
  {
    titre: "Analyse des besoins",
    desc: "Évaluation des processus actuels pour identifier où l'IA générative aurait l'impact le plus significatif, et définition d'objectifs clairs (productivité, qualité, prise de décision).",
    Icon: IconSearch,
  },
  {
    titre: "Personnalisation",
    desc: "Création de modèles d'IA sur mesure, intégration fluide avec les systèmes existants, garantie de la protection des données.",
    Icon: IconSparkle,
  },
  {
    titre: "Déploiement et formation",
    desc: "Sessions de formation pour les utilisateurs clés, centrées sur l'utilisation efficace et éthique, avec un soutien technique régulier.",
    Icon: IconTeam,
  },
  {
    titre: "Support et adoption",
    desc: "Stratégie de communication pour informer toutes les parties prenantes, et accompagnement de la collaboration pour soutenir la mise à l'échelle.",
    Icon: IconCheck,
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/img/hero-services.jpg" alt="" fill className="object-cover" priority />
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
          <h1 className="text-white text-[36px] md:text-[56px] leading-[1.05] tracking-[-0.02em] mb-5 max-w-2xl">
            Ce que nous faisons <span className="text-lime italic">concrètement</span>
          </h1>
          <p className="text-[#d3ddce] text-[16px] md:text-[17px] leading-relaxed max-w-xl">
            Une méthode en quatre volets, appliquée à chaque mission : diagnostiquer, structurer, digitaliser et
            transmettre les compétences pour ancrer les résultats dans la durée.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="grid sm:grid-cols-2 gap-6">
          {SERVICES.map((s) => (
            <div key={s.titre} className="conviction-card bg-white rounded-xl p-5 sm:p-6 border border-line">
              <div className="flex items-center gap-3 mb-3.5">
                <div className="conviction-icon w-10 h-10 rounded-lg bg-cream border border-line flex items-center justify-center text-lime shrink-0">
                  <s.Icon stroke="currentColor" width="20" height="20" />
                </div>
                <h3 className="text-[18px] tracking-[-0.01em]">{s.titre}</h3>
              </div>
              <p className="text-[14.5px] text-ink-soft leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
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
              <div key={p.titre} className={`py-6 md:py-0 ${i > 0 ? "border-t md:border-t-0 md:border-l border-line md:pl-8" : ""}`}>
                <div className="w-11 h-11 rounded-lg bg-white border border-line flex items-center justify-center text-lime mb-4">
                  <p.Icon stroke="currentColor" width="20" height="20" />
                </div>
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
