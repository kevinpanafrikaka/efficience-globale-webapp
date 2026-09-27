"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";

const SECTEUR_FILTERS = [
  { key: "all", label: "Tous les secteurs" },
  { key: "sante", label: "Santé publique" },
  { key: "ia", label: "Intelligence Artificielle" },
  { key: "education", label: "Éducation" },
  { key: "gouvernance", label: "Gouvernance" },
  { key: "local", label: "Développement local" },
  { key: "partenariat", label: "Partenariat" },
];

const STATUT_FILTERS = [
  { key: "all", label: "Tous" },
  { key: "publie", label: "Publiés" },
  { key: "brouillon", label: "Brouillons" },
];

function FilterRow({ options, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`rounded-full border text-[13px] font-semibold px-3.5 py-1.5 transition-colors active:scale-[0.97] ${
            active === o.key
              ? "bg-dark-2 border-dark-2 text-white"
              : "bg-white border-line text-ink-soft hover:border-lime hover:text-lime"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminProjetsGrid({ projets, secteurs }) {
  const [statutFilter, setStatutFilter] = useState("all");
  const [secteurFilter, setSecteurFilter] = useState("all");

  const filtered = projets.filter(
    (p) =>
      (statutFilter === "all" || p.statut === statutFilter) &&
      (secteurFilter === "all" || p.secteur === secteurFilter)
  );

  return (
    <div>
      <div className="flex flex-col gap-2.5 mb-6">
        <FilterRow options={STATUT_FILTERS} active={statutFilter} onChange={setStatutFilter} />
        <FilterRow options={SECTEUR_FILTERS} active={secteurFilter} onChange={setSecteurFilter} />
      </div>

      {filtered.length === 0 ? (
        <p className="text-[14.5px] text-ink-soft">Aucun projet ne correspond à ce filtre.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <div key={p.id} className="border border-line rounded-lg overflow-hidden flex flex-col bg-white">
              <div className="relative h-36 bg-cream">
                {p.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[12px] text-ink-faint">
                    Aucune image
                  </div>
                )}
                <span
                  className={`absolute top-2 left-2 text-[10.5px] font-bold tracking-wide px-1.5 py-0.5 rounded ${
                    p.statut === "publie" ? "bg-lime text-ink" : "bg-white text-ink-faint"
                  }`}
                >
                  {p.statut === "publie" ? "PUBLIÉ" : "BROUILLON"}
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1.5 flex-1">
                <div className="text-[11px] font-bold text-lime tracking-wide">
                  {secteurs[p.secteur]?.label || p.secteur}
                </div>
                <h3 className="text-[15px] font-semibold text-dark leading-snug">{p.titre}</h3>
                <div className="text-[12.5px] text-ink-faint">{p.client || "—"}</div>
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-line">
                  <Link
                    href={`/admin/projets/${p.id}/modifier`}
                    className="text-[12.5px] font-semibold text-dark-2 hover:text-lime transition-colors"
                  >
                    Modifier
                  </Link>
                  <DeleteButton endpoint={`/api/admin/projets/${p.id}`} confirmMessage={`Supprimer "${p.titre}" ?`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
