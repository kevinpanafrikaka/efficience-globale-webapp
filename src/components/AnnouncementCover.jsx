"use client";
import { useState } from "react";
import "./announcements.css";
import { announcementCategory } from "@/lib/announcements.mjs";
const messages = { recrutement: "Rejoignez l’équipe", formation: "Apprendre et transmettre", evenement: "Nos temps forts", actualite: "Les nouvelles du cabinet", publication: "Partager nos regards" };
export default function AnnouncementCover({ src, categorie }) {
  const [failed, setFailed] = useState(null);
  return <div className="announcement-cover">{src && src !== failed ? <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(src)} /> : <div className="eg-news-card-placeholder announcement-placeholder" aria-hidden="true"><span className="announcement-mark">EG</span><span className="announcement-cover-title">{messages[announcementCategory(categorie)]}</span><span className="announcement-signature">Efficience Globale</span></div>}</div>;
}
