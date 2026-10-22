"use client";
import { useState } from "react";
import Link from "next/link";
import MemberOptions from "./MemberOptions";

export default function MemberCard({ membre, prevId, nextId }) {
  const [failed, setFailed] = useState(null);
  const hasPhoto = Boolean(membre.photo_url && failed !== membre.photo_url);
  const names = (membre.nom || "").trim().split(/\s+/).filter(Boolean);
  const initials = names.length ? `${names[0][0]}${names.length > 1 ? names.at(-1)[0] : ""}`.toLocaleUpperCase("fr") : "EG";
  return <article className="team-card">
    <div className="team-card-profile">
      <div className="team-portrait" aria-hidden="true">
        {hasPhoto ? <img src={membre.photo_url} alt="" loading="lazy" decoding="async" onError={() => setFailed(membre.photo_url)} /> : <span className="team-initials">{initials}</span>}
      </div>
      <div className="team-identity"><h2>{membre.nom}</h2>{membre.role && <p className="team-role">{membre.role}</p>}{!hasPhoto && <p className="team-photo-note">Photo à compléter</p>}</div>
    </div>
    <div className="team-card-footer"><span className="team-status">{membre.statut === "publie" ? "Publié" : "Brouillon"}</span><div className="team-card-actions"><Link href={`/admin/membres/${membre.id}/modifier`} className="eg-button eg-button--secondary eg-button--compact">Modifier</Link><MemberOptions membre={membre} prevId={prevId} nextId={nextId} /></div></div>
  </article>;
}
