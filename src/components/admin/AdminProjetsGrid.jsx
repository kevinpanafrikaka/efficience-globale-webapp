"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AdminImage from "@/components/admin/AdminImage";
import DeleteButton from "@/components/admin/DeleteButton";
import "./admin-projects.css";

const FILTERS = [["all", "Tous les secteurs"], ["sante", "Santé publique"], ["ia", "Intelligence Artificielle"], ["education", "Éducation"], ["gouvernance", "Gouvernance"], ["local", "Développement local"], ["partenariat", "Partenariat"]];
function normalize(value) { return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

function ProjectOptions({ project }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null), trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    const outside = e => { if (!root.current?.contains(e.target)) setOpen(false); };
    const escape = e => { if (e.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="project-options" ref={root}>
    <button type="button" ref={trigger} className="eg-button eg-button--secondary eg-button--icon" aria-label={`Options pour ${project.titre}`} aria-expanded={open} onClick={() => setOpen(!open)}>···</button>
    {open && <div className="project-options-panel" role="group" aria-label="Actions du projet">
      <DeleteButton endpoint={`/api/admin/projets/${project.id}`} confirmMessage={`Supprimer « ${project.titre} » définitivement ?`} />
    </div>}
  </div>;
}

export default function AdminProjetsGrid({ projets, secteurs }) {
  const [sector, setSector] = useState("all"), [query, setQuery] = useState(""), [searchOpen, setSearchOpen] = useState(false);
  const input = useRef(null), searchButton = useRef(null), restoreSearchFocus = useRef(false);
  useEffect(() => {
    if (searchOpen) input.current?.focus();
    else if (restoreSearchFocus.current) { searchButton.current?.focus(); restoreSearchFocus.current = false; }
  }, [searchOpen]);
  const filtered = projets.filter(p => (sector === "all" || p.secteur === sector) && normalize(`${p.titre} ${p.client || ""} ${secteurs[p.secteur]?.label || p.secteur}`).includes(normalize(query).trim()));
  function closeSearch() { restoreSearchFocus.current = true; setSearchOpen(false); setQuery(""); }
  return <div className="admin-projects">
    <div className="projects-toolbar">
      <div className="projects-browse" hidden={searchOpen}>
      <div className="projects-filter-window"><div className="projects-filters" role="group" aria-label="Filtrer par secteur">
        {FILTERS.map(([key, label]) => <button key={key} type="button" className="eg-button eg-button--filter eg-button--compact" aria-pressed={sector === key} onClick={e => { setSector(key); e.currentTarget.scrollIntoView?.({ block: "nearest", inline: "nearest" }); }}>{label}</button>)}
      </div></div>
      <button ref={searchButton} type="button" className="eg-button eg-button--secondary eg-button--icon projects-search-toggle" aria-label={searchOpen ? "Fermer la recherche" : "Rechercher un projet"} aria-expanded={searchOpen} aria-controls="projects-search" onClick={() => searchOpen ? closeSearch() : setSearchOpen(true)}>
        <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
      </button>
      </div>
    <div id="projects-search" hidden={!searchOpen} className="projects-search">
      <label className="sr-only" htmlFor="project-query">Rechercher par titre, client ou secteur</label>
      <div><input id="project-query" ref={input} type="search" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Escape") closeSearch(); }} placeholder="Rechercher un projet…" /><button type="button" className="eg-button eg-button--secondary eg-button--compact" onClick={closeSearch}>Fermer</button></div>
    </div>
    </div>
    {filtered.length === 0 ? <div className="admin-empty" role="status"><h2>{projets.length ? "Aucun projet correspondant" : "Votre première réalisation"}</h2><p>{projets.length ? "Essayez un autre secteur ou une autre recherche." : "Ajoutez un projet pour présenter les réalisations du cabinet."}</p>{projets.length > 0 && <button type="button" className="eg-button eg-button--secondary" onClick={() => { setSector("all"); setQuery(""); }}>Réinitialiser les filtres</button>}</div> : <div className="projects-grid">
      {filtered.map(p => {
        return <article key={p.id} className="project-card">
          <div className="project-photo">{p.photo_url ? <AdminImage src={p.photo_url} alt="" className="project-photo-image" /> : <div className="project-photo-empty">Aucune image</div>}</div>
          <div className="project-card-body">
            <div className="project-metadata"><span className={`project-status ${p.statut === "publie" ? "is-published" : "is-draft"}`}>{p.statut === "publie" ? "Publié" : "Brouillon"}</span><span>{secteurs[p.secteur]?.label || p.secteur}</span>{p.client && <span className="project-client">{p.client}</span>}</div>
            <h2>{p.titre}</h2>
            <div className="project-card-actions"><Link href={`/admin/projets/${p.id}/modifier`} className="eg-button eg-button--secondary eg-button--compact">Modifier</Link><ProjectOptions project={p} /></div>
          </div>
        </article>;
      })}
    </div>}
  </div>;
}
