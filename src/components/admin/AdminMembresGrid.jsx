"use client";
import { useEffect, useRef, useState } from "react";
import MemberCard from "./MemberCard";
import "./admin-projects.css";
import "./admin-team.css";

const FILTERS = [["all", "Tous les profils"], ["publie", "Publiés"], ["brouillon", "Brouillons"]];
const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function AdminMembresGrid({ membres }) {
  const [status, setStatus] = useState("all"), [query, setQuery] = useState(""), [searchOpen, setSearchOpen] = useState(false);
  const input = useRef(null), searchButton = useRef(null), restoreFocus = useRef(false);
  useEffect(() => {
    if (searchOpen) input.current?.focus();
    else if (restoreFocus.current) { searchButton.current?.focus(); restoreFocus.current = false; }
  }, [searchOpen]);
  function closeSearch() { restoreFocus.current = true; setQuery(""); setSearchOpen(false); }
  const filtered = membres.filter(m => (status === "all" || m.statut === status) && normalize(`${m.nom} ${m.role || ""} ${m.expertises || ""}`).includes(normalize(query).trim()));
  return <div className="admin-projects admin-team">
    <div className="projects-toolbar">
      <div className="projects-browse" hidden={searchOpen}>
        <div className="projects-filter-window"><div className="projects-filters" role="group" aria-label="Filtrer les profils par statut">{FILTERS.map(([key,label]) => <button key={key} type="button" className="eg-button eg-button--filter eg-button--compact" aria-pressed={status === key} onClick={e => { setStatus(key); e.currentTarget.scrollIntoView?.({ block: "nearest", inline: "nearest" }); }}>{label}</button>)}</div></div>
        <button type="button" ref={searchButton} className="eg-button eg-button--secondary eg-button--icon projects-search-toggle" aria-label="Rechercher un membre" aria-expanded={searchOpen} aria-controls="team-search" onClick={() => setSearchOpen(true)}><svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg></button>
      </div>
      <div id="team-search" className="projects-search" hidden={!searchOpen}><label className="sr-only" htmlFor="team-query">Rechercher par nom, fonction ou expertise</label><div><input id="team-query" ref={input} type="search" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Escape") closeSearch(); }} placeholder="Nom, fonction ou expertise…" /><button type="button" className="eg-button eg-button--secondary eg-button--compact" onClick={closeSearch}>Fermer</button></div></div>
    </div>
    {!filtered.length ? <div className="admin-empty" role="status"><h2>{membres.length ? "Aucun profil correspondant" : "Votre équipe prend place ici"}</h2><p>{membres.length ? "Essayez un autre statut ou une autre recherche." : "Ajoutez un premier membre pour présenter l’équipe du cabinet."}</p>{membres.length > 0 && <button type="button" className="eg-button eg-button--secondary" onClick={() => { setStatus("all"); setQuery(""); }}>Réinitialiser les filtres</button>}</div> : <div className="team-grid">{filtered.map(m => { const index = membres.findIndex(item => item.id === m.id); return <MemberCard key={m.id} membre={m} prevId={membres[index - 1]?.id} nextId={membres[index + 1]?.id} />; })}</div>}
  </div>;
}
