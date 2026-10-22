"use client";
import { useState } from "react";
import Link from "next/link";
import MemberOptions from "./MemberOptions";

export default function MemberCard({ membre, prevId, nextId, preview = false }) {
  const [failed, setFailed] = useState(null);
  const hasPhoto = Boolean(membre.photo_url && failed !== membre.photo_url);
  const names = (membre.nom || "").trim().split(/\s+/).filter(Boolean);
  const initials = names.length ? `${names[0][0]}${names.length > 1 ? names.at(-1)[0] : ""}`.toLocaleUpperCase("fr") : "EG";
  return <article className="project-card team-card">
      <div className="project-photo team-portrait" aria-hidden="true">
        {hasPhoto ? <img src={membre.photo_url} alt="" loading="lazy" decoding="async" onError={() => setFailed(membre.photo_url)} /> : <span className="team-initials">{initials}</span>}
      </div>
      <div className="project-card-body">
        <div className="project-metadata"><span>{membre.statut === "publie" ? "Publié" : "Brouillon"}</span>{membre.role && <span>{membre.role}</span>}</div>
        <h2>{membre.nom}</h2>
        {!hasPhoto && <p className="team-photo-note">Photo à compléter</p>}
        {!preview && <div className="project-card-actions"><Link href={`/admin/membres/${membre.id}/modifier`} className="eg-button eg-button--secondary eg-button--compact">Modifier</Link><MemberOptions membre={membre} prevId={prevId} nextId={nextId} /></div>}
      </div>
  </article>;
}
