"use client";

import { useState } from "react";
import ProjectCard from "@/components/ProjectCard";

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "sante", label: "Santé publique & Nutrition" },
  { key: "ia", label: "Intelligence Artificielle" },
  { key: "education", label: "Éducation" },
  { key: "gouvernance", label: "Gouvernance & Leadership" },
  { key: "local", label: "Développement local" },
  { key: "partenariat", label: "Partenariats stratégiques" },
];

export default function RealisationsGrid({ projets }) {
  const [filter, setFilter] = useState("all");

  return (
    <div>
      <div className="flex flex-wrap gap-2.5 mb-9">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border text-[13.5px] font-semibold px-4.5 py-2 transition-colors active:scale-[0.97] ${
              filter === f.key
                ? "bg-dark-2 border-dark-2 text-white"
                : "bg-white border-line text-ink-soft hover:border-lime hover:text-lime"
            }`}
          >
            {f.label}
            {f.key === "all" ? ` (${projets.length})` : ""}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {projets.map((p) => (
          <div key={p.slug} hidden={filter !== "all" && filter !== p.secteur}>
            <ProjectCard projet={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
