"use client";
import { useState } from "react";
import Link from "next/link";
import AnnouncementCard from "./AnnouncementCard";
import { ANNOUNCEMENT_TYPES,announcementCategory } from "@/lib/announcements.mjs";
export default function AnnouncementsGrid({ annonces }) {
  const [type, setType] = useState("all");
  const filtered = annonces.filter(a => type === "all" || announcementCategory(a.categorie) === type);
  return <div>
    <div className="announcement-filters" role="group" aria-label="Filtrer les annonces par type">{[{ value: "all", label: "Toutes" }, ...ANNOUNCEMENT_TYPES].map(t => <button key={t.value} type="button" className="eg-button eg-button--filter eg-button--compact" aria-pressed={type === t.value} aria-controls="announcement-results" onClick={e => { setType(t.value); e.currentTarget.scrollIntoView?.({ block: "nearest", inline: "nearest" }); }}>{t.label}</button>)}</div>
    <div id="announcement-results">{filtered.length ? <div className="eg-news-grid">{filtered.map(a => <AnnouncementCard key={a.id} annonce={a} />)}</div> : <div className="eg-news-empty" role="status"><span className="eg-news-seal" aria-hidden="true">EG</span><div><h2>{annonces.length ? "Aucune annonce dans cette catégorie" : "Les prochaines nouvelles se préparent."}</h2><p>{annonces.length ? "Découvrez les autres actualités du cabinet." : "Retrouvez dès maintenant les réalisations et collaborations d’Efficience Globale."}</p>{annonces.length ? <button type="button" className="eg-button eg-button--secondary" onClick={() => setType("all")}>Toutes les annonces</button> : <Link href="/realisations" className="eg-button eg-button--secondary">Explorer nos réalisations</Link>}</div></div>}</div>
  </div>;
}
