import Link from "next/link";
import AnnouncementCover from "./AnnouncementCover";
import { announcementDate, announcementType, announcementSummary } from "@/lib/announcements.mjs";
export default function AnnouncementCard({ annonce }) {
  return <Link href={`/annonces/${annonce.slug}`} className="project-card eg-news-card group relative flex h-full flex-col active:opacity-80">
    <AnnouncementCover src={annonce.image_url} categorie={annonce.categorie} />
    <div className="project-card-copy flex flex-col gap-2.5 flex-1"><div className="announcement-meta"><span>{announcementType(annonce.categorie).label}</span><time dateTime={annonce.date}>{announcementDate(annonce.date)}</time></div><h3>{annonce.titre}</h3><p>{announcementSummary(annonce)}</p></div>
  </Link>;
}
