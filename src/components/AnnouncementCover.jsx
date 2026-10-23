"use client";
import { useState } from "react";
import "./announcements.css";
const messages = { recrutement: "Rejoignez l’équipe", formation: "Apprendre et transmettre", mission: "Agir ensemble", publication: "Partager nos regards", vie: "La vie du cabinet" };
export default function AnnouncementCover({ src, categorie }) {
  const [failed, setFailed] = useState(null);
  return <div className="announcement-cover">{src && src !== failed ? <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(src)} /> : <div className="eg-news-card-placeholder announcement-placeholder" aria-hidden="true"><span className="announcement-mark">EG</span><span className="announcement-cover-title">{messages[categorie] || messages.vie}</span><span className="announcement-signature">Efficience Globale</span></div>}</div>;
}
