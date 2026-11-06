"use client";
import { useState } from "react";
import AdminImage from "./AdminImage";
import { filterMedia, formatMediaSize } from "@/lib/media-files.mjs";
import "./media-library.css";

export function MediaPreview({ item }) {
  return item.type === "pdf" ? <span className="media-pdf-preview"><svg viewBox="0 0 32 40" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 1h14l8 8v29H5zM19 1v9h8M10 20h12M10 25h12"/></svg><span>PDF</span></span> : <AdminImage src={item.url} alt="" className="media-image"/>;
}
export default function MediaBrowser({ items, onChoose, selectedKeys = [], picker = false, type = "all", excludeUrls = [], summary, action }) {
  const [query, setQuery] = useState(""), [usage, setUsage] = useState("all"), [fileType, setFileType] = useState("all"), [page, setPage] = useState(0);
  const available = filterMedia(items, { type, excludeUrls });
  const filtered = filterMedia(available, { query, usage, type: fileType });
  const last = Math.max(0, Math.ceil(filtered.length / 30) - 1), current = Math.min(page, last);
  const filters = [{ id: "all", label: "Tous", count: available.length }, { id: "used", label: "Utilisés", count: available.filter(file => file.usages.length).length }, { id: "unused", label: "Inutilisés", count: available.filter(file => !file.usages.length).length }];
  return <div className="media-browser">
    <div className={`media-browser-tools${summary ? " media-library-toolbar" : ""}`}>{summary && <div className="media-toolbar-summary">{summary}</div>}<div className="media-usage-filters" role="group" aria-label="Utilisation des fichiers">{filters.map(filter => <button key={filter.id} type="button" aria-pressed={usage === filter.id} onClick={() => { setUsage(filter.id); setPage(0); }}>{filter.label}<span>{filter.count}</span></button>)}</div>
      <label className="media-search"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg><span className="sr-only">Rechercher un fichier ou un contenu</span><input type="search" placeholder="Rechercher un fichier…" value={query} onChange={event => { setQuery(event.target.value); setPage(0); }}/></label>
      {action && <div className="media-toolbar-action">{action}</div>}
    </div>
    <div className="media-results-bar"><span role="status">{filtered.length} fichier{filtered.length > 1 ? "s" : ""}{query.trim() ? " trouvé" + (filtered.length > 1 ? "s" : "") : ""}</span>{type === "all" && <div role="group" aria-label="Type de fichier" className="media-type-filters">{[["all", "Tous les formats"], ["image", "Images"], ["pdf", "PDF"]].map(([id, label]) => <button key={id} type="button" aria-pressed={fileType === id} onClick={() => { setFileType(id); setPage(0); }}>{label}</button>)}</div>}</div>
    {filtered.length ? <div className="media-grid">{filtered.slice(current * 30, (current + 1) * 30).map(item => <button key={item.key} type="button" className="media-card" aria-label={`${picker ? "Sélectionner" : "Ouvrir"} ${item.name}`} aria-pressed={picker ? selectedKeys.includes(item.key) : undefined} onClick={() => onChoose(item)}>
      <span className="media-card-preview"><MediaPreview item={item}/><span className="media-use-badge" data-used={item.usages.length > 0}>{item.usages.length ? "Utilisé" : "Inutilisé"}</span>{picker && <span className="media-select-mark" aria-hidden="true">{selectedKeys.includes(item.key) ? "✓" : ""}</span>}</span>
      <span className="media-card-caption"><strong title={item.name}>{item.name}</strong><span>{formatMediaSize(item.size)}<span aria-hidden="true"> · </span>{item.type === "pdf" ? "PDF" : item.key.split(".").at(-1).toUpperCase()}</span><span className="media-card-use">{item.usages.length ? `${item.usages.length} emplacement${item.usages.length > 1 ? "s" : ""}` : "Aucun contenu associé"}</span></span>
    </button>)}</div> : <div className="media-empty" role="status"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.5"/><path d="m4 17 5-5 4 4 3-3 5 5"/></svg><p>{query.trim() ? "Aucun fichier ne correspond à votre recherche." : usage === "unused" ? "Tous les fichiers de cette sélection sont utilisés." : usage === "used" ? "Aucun fichier de cette sélection n’est encore utilisé." : "Aucun fichier disponible dans cette sélection."}</p></div>}
    {last > 0 && <nav className="media-pagination" aria-label="Pages de la médiathèque"><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={!current} onClick={() => setPage(current - 1)}>Précédent</button><span>{current + 1} / {last + 1}</span><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={current === last} onClick={() => setPage(current + 1)}>Suivant</button></nav>}
  </div>;
}
