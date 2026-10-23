import Link from "next/link";
import AnnouncementCover from "@/components/AnnouncementCover";
import { announcementDate, announcementType, announcementSummary } from "@/lib/announcements.mjs";
import AnnouncementOptions from "./AnnouncementOptions";
export default function AdminAnnouncementCard({ annonce, preview=false }) {
  return <article className="project-card"><AnnouncementCover src={annonce.image_url} categorie={annonce.categorie} /><div className="project-card-body"><div className="project-metadata"><span>{annonce.statut==="publie"?"Publié":"Brouillon"}</span><span>{announcementType(annonce.categorie).label}</span><time dateTime={annonce.date}>{announcementDate(annonce.date)}</time></div><h2>{annonce.titre || "Titre de l’annonce"}</h2><p className="announcement-card-summary">{announcementSummary(annonce) || "Le résumé de votre annonce apparaîtra ici."}</p>{!preview&&<div className="project-card-actions"><Link href={`/admin/annonces/${annonce.id}/modifier`} className="eg-button eg-button--secondary eg-button--compact">Modifier</Link><AnnouncementOptions annonce={annonce} /></div>}</div></article>;
}
