"use client";
import { useEffect,useRef,useState } from "react";
import AdminAnnouncementCard from "./AdminAnnouncementCard";
import { ANNOUNCEMENT_TYPES,announcementType,announcementCategory } from "@/lib/announcements.mjs";
import "./project-editor.css";
import "./admin-projects.css";
import "./admin-announcements.css";
const normalize=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
export default function AdminAnnoncesGrid({ annonces, initialType = "all" }) {
  const validType = ANNOUNCEMENT_TYPES.some(t=>t.value===initialType) ? initialType : "all";
  const [status,setStatus]=useState("all"),[type,setType]=useState(validType),[query,setQuery]=useState(""),[searchOpen,setSearchOpen]=useState(false);
  useEffect(()=>{setType(validType);},[validType]);
  const input=useRef(null),searchButton=useRef(null),restore=useRef(false);
  useEffect(()=>{if(searchOpen)input.current?.focus();else if(restore.current){searchButton.current?.focus();restore.current=false;}},[searchOpen]);
  function close(){restore.current=true;setQuery("");setSearchOpen(false);}
  const filtered=annonces.filter(a=>(status==="all"||a.statut===status)&&(type==="all"||announcementCategory(a.categorie)===type)&&normalize(`${a.titre} ${a.resume||""} ${a.texte} ${announcementType(a.categorie).label}`).includes(normalize(query).trim()));
  return <div className="admin-projects admin-announcements project-editor"><div className="projects-toolbar"><div className="projects-browse" hidden={searchOpen}>
    <div className="projects-filter-window"><div className="announcements-type-tabs" role="group" aria-label="Filtrer les annonces par type">{[{value:"all",label:"Tous les types"},...ANNOUNCEMENT_TYPES].map(t=><button key={t.value} type="button" className="eg-button eg-button--filter eg-button--compact" aria-pressed={type===t.value} aria-controls="admin-announcement-results" onClick={e=>{setType(t.value);e.currentTarget.scrollIntoView?.({block:"nearest",inline:"nearest"});}}>{t.label}</button>)}</div></div>
    <button type="button" ref={searchButton} className="eg-button eg-button--secondary eg-button--icon projects-search-toggle" aria-label="Rechercher une annonce" aria-expanded={searchOpen} aria-controls="announcements-search" onClick={()=>setSearchOpen(true)}><svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button>
    </div><div id="announcements-search" className="projects-search" hidden={!searchOpen}><label className="sr-only" htmlFor="announcements-query">Rechercher une annonce</label><div><input id="announcements-query" ref={input} type="search" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Escape")close();}} placeholder="Titre, type ou contenu…"/><button type="button" className="eg-button eg-button--secondary eg-button--compact" onClick={close}>Fermer</button></div></div></div>
    <div className="announcements-status-row"><div className="announcements-status-filters" role="group" aria-label="Filtrer les annonces par statut">{[["all","Tous les statuts"],["publie","Publiées"],["brouillon","Brouillons"]].map(([key,label])=><button key={key} type="button" className="announcement-status-button" aria-pressed={status===key} aria-controls="admin-announcement-results" onClick={e=>{setStatus(key);e.currentTarget.scrollIntoView?.({block:"nearest",inline:"nearest"});}}>{label}</button>)}</div></div>
    <div id="admin-announcement-results">{filtered.length?<div className="projects-grid">{filtered.map(a=><AdminAnnouncementCard key={a.id} annonce={a}/>)}</div>:<div className="admin-empty" role="status"><h2>{annonces.length?"Aucune annonce correspondante":"Aucune annonce"}</h2>{annonces.length>0&&<button type="button" className="eg-button eg-button--secondary" onClick={()=>{setStatus("all");setType("all");setQuery("");}}>Réinitialiser les filtres</button>}</div>}</div>
  </div>;
}
