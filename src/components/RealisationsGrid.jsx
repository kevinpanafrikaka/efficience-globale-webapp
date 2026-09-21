"use client";

import { useState } from "react";
import Image from "next/image";
import ProjectCard from "@/components/ProjectCard";
import { secteurs } from "@/data/projects";

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "sante", label: "Santé publique & Nutrition" },
  { key: "ia", label: "Intelligence Artificielle" },
  { key: "education", label: "Éducation" },
  { key: "gouvernance", label: "Gouvernance & Leadership" },
  { key: "local", label: "Développement local" },
  { key: "partenariat", label: "Partenariats stratégiques" },
];

export default function RealisationsGrid({ projets, partenariats }) {
  const [filter, setFilter] = useState("all");
  const total = projets.length + partenariats.length;

  return (
    <div>
      <div className="flex flex-wrap gap-2.5 mb-9">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border text-[13.5px] font-semibold px-4.5 py-2 transition-colors active:scale-[0.97] ${
              filter === f.key ? "bg-dark-2 border-dark-2 text-white" : "bg-white border-line text-ink-soft"
            }`}
          >
            {f.label}
            {f.key === "all" ? ` (${total})` : ""}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {projets.map((p) => (
          <div key={p.slug} hidden={filter !== "all" && filter !== p.secteur}>
            <ProjectCard projet={p} />
          </div>
        ))}
        {partenariats.map((p) => (
          <div key={p.slug} hidden={filter !== "all" && filter !== "partenariat"}>
            <div className="flex flex-col rounded-xl border border-line bg-white overflow-hidden">
              <div className="relative h-40 bg-dark-2">
                <Image src={`/img/realisations/${p.photo}`} alt="" fill sizes="33vw" className="object-cover" />
              </div>
              <div className="flex flex-col gap-2.5 p-5 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-full text-[#6b4ea6]" style={{ backgroundColor: "#6b4ea61a" }}>
                    PARTENARIAT
                  </span>
                  <span className="text-[12px] text-ink-faint">{p.client}</span>
                </div>
                <h3 className="text-[16.5px] font-bold text-dark leading-snug">{p.titre}</h3>
                <p className="text-[13.5px] text-ink-soft leading-relaxed flex-1">{p.resume}</p>
                <div className="text-[12px] text-ink-faint border-t border-line pt-3">{p.periode}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
