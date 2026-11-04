"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AdminImage from "@/components/admin/AdminImage";
import PartnerOptions from "./PartnerOptions";
import { partnerProjectsHref } from "@/lib/partner-projects.mjs";
import "./admin-projects.css";
import "./admin-partners.css";

const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export function partnerWebsite(value) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? { href: url.href, label: url.hostname.replace(/^www\./, "") } : null; }
  catch { return null; }
}

export default function AdminPartenairesGrid({ partenaires }) {
  const [status, setStatus] = useState("all"), [query, setQuery] = useState(""), [searchOpen, setSearchOpen] = useState(false);
  const input = useRef(null), searchButton = useRef(null), restore = useRef(false);
  useEffect(() => {
    if (searchOpen) input.current?.focus();
    else if (restore.current) { searchButton.current?.focus(); restore.current = false; }
  }, [searchOpen]);
  function closeSearch() { restore.current = true; setQuery(""); setSearchOpen(false); }
  const filtered = partenaires.filter(p => (status === "all" || p.statut === status) && normalize(`${p.nom} ${p.site_web || ""}`).includes(normalize(query)));
  return <div className="admin-projects admin-partners">
    <div className="projects-toolbar">
      <div className="projects-browse" hidden={searchOpen}>
        <div className="projects-filter-window"><div className="projects-filters" role="group" aria-label="Filtrer les partenaires par statut">
          {[["all", "Tous"], ["publie", "Publiés"], ["brouillon", "Brouillons"]].map(([key, label]) => <button key={key} type="button" className="eg-button eg-button--filter eg-button--compact" aria-pressed={status === key} aria-controls="partner-results" onClick={() => setStatus(key)}>{label}</button>)}
        </div></div>
        <button type="button" ref={searchButton} className="eg-button eg-button--secondary eg-button--icon projects-search-toggle" aria-label="Rechercher un partenaire" aria-expanded={searchOpen} aria-controls="partner-search" onClick={() => setSearchOpen(true)}><svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg></button>
      </div>
      <div id="partner-search" className="projects-search" hidden={!searchOpen}><label className="sr-only" htmlFor="partner-query">Rechercher un partenaire par nom ou site web</label><div><input id="partner-query" ref={input} type="search" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Escape") closeSearch(); }} placeholder="Nom ou site web…" /><button type="button" className="eg-button eg-button--secondary eg-button--compact" onClick={closeSearch}>Fermer</button></div></div>
    </div>
    <div id="partner-results">{filtered.length ? <div className="partner-grid">{filtered.map(p => {
      const index = partenaires.findIndex(item => item.id === p.id), website = partnerWebsite(p.site_web);
      return <article key={p.id} className="partner-card">
        <div className="partner-logo">{p.logo_url ? <AdminImage src={p.logo_url} alt={`Logo de ${p.nom}`} className="partner-logo-image" /> : <span className="partner-logo-empty">{p.nom}</span>}</div>
        <div className="partner-card-body">
          <h2>{p.nom}</h2>
          <div className="partner-metadata"><span>{p.statut === "publie" ? "Publié" : "Brouillon"}</span>{p.projectCount > 0 && (p.statut === "publie" ? <Link href={partnerProjectsHref(p)} target="_blank" rel="noopener noreferrer" aria-label={`Voir ${p.projectCount} réalisation${p.projectCount > 1 ? "s" : ""} de ${p.nom} sur le site public`}>{p.projectCount} réalisation{p.projectCount > 1 ? "s" : ""}</Link> : <span className="partner-project-count">{p.projectCount} réalisation{p.projectCount > 1 ? "s" : ""}</span>)}</div>
          {website && <a className="partner-website" href={website.href} target="_blank" rel="noopener noreferrer">{website.label}</a>}
          <div className="partner-actions"><Link href={`/admin/partenaires/${p.id}/modifier`} className="eg-button eg-button--secondary eg-button--compact">Modifier</Link><PartnerOptions partenaire={p} prevId={partenaires[index - 1]?.id} nextId={partenaires[index + 1]?.id} /></div>
        </div>
      </article>;
    })}</div> : <div className="admin-empty" role="status"><h2>{partenaires.length ? "Aucun partenaire correspondant" : "Aucun partenaire"}</h2>{partenaires.length > 0 ? <button type="button" className="eg-button eg-button--secondary" onClick={() => { setStatus("all"); setQuery(""); }}>Réinitialiser les filtres</button> : <Link href="/admin/partenaires/nouveau" className="eg-button eg-button--primary">Nouveau partenaire</Link>}</div>}</div>
  </div>;
}
