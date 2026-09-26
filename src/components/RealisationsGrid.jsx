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

  return (
    <div>
      <div className="flex flex-wrap gap-2.5 mb-9">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded text-[13.5px] font-semibold px-5 py-2.5 active:scale-[0.97] transition-transform ${
              filter === f.key
                ? "bg-lime text-ink"
                : "border border-line bg-white text-ink-soft hover:border-lime hover:text-lime"
            }`}
          >
            {f.label}
            {f.key === "all" ? ` (${projets.length})` : ""}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {projets
          .filter((p) => filter === "all" || filter === p.secteur)
          .map((p) => (
            <div key={`${filter}-${p.slug}`} className="project-card-enter">
              <ProjectCard projet={p} />
            </div>
          ))}
      </div>
    </div>
  );
}
