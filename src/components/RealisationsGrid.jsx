"use client";

import { useState } from "react";
import ProjectCard from "@/components/ProjectCard";

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "sante", label: "Santé publique" },
  { key: "ia", label: "IA" },
  { key: "education", label: "Éducation" },
  { key: "gouvernance", label: "Gouvernance" },
  { key: "local", label: "Local" },
  { key: "partenariat", label: "Partenariats" },
];

export default function RealisationsGrid({ projets }) {
  const [filter, setFilter] = useState("all");
  const filtered = projets.filter((projet) => filter === "all" || projet.secteur === filter);
  const reset = () => setFilter("all");

  return (
    <div>
      <div role="group" aria-label="Filtrer par domaine" className="flex flex-wrap gap-2.5 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            aria-controls="project-results"
            onClick={() => setFilter(f.key)}
            className={`rounded text-[13.5px] font-semibold px-5 py-2.5 active:scale-[0.97] transition-transform ${
              filter === f.key
                ? "bg-lime text-ink"
                : "border border-line bg-white text-ink-soft hover:border-lime hover:text-lime"
            }`}
          >
            {f.label}
            {` (${f.key === "all" ? projets.length : projets.filter((p) => p.secteur === f.key).length})`}
          </button>
        ))}
      </div>

      <div id="project-results" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {filtered.map((p) => (
          <div key={`${filter}-${p.slug}`} className="project-card-enter">
            <ProjectCard projet={p} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-lg bg-cream border border-line p-8 text-center">
            <h2 className="text-2xl mb-3">Aucune réalisation trouvée</h2>
            <p className="text-ink-soft mb-5">Sélectionnez un autre domaine pour découvrir nos réalisations.</p>
            <button type="button" onClick={reset} className="rounded bg-dark text-white px-5 py-3 font-semibold">Voir toutes les réalisations</button>
          </div>
        )}
      </div>
    </div>
  );
}
