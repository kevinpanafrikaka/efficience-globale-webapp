import Link from "next/link";
import Image from "@/components/PublicImage";
import { notFound } from "next/navigation";
import { getAnnonceBySlug } from "@/lib/db";
import { announcementDate, announcementSummary, announcementType, announcementBlocks, announcementActionUrl } from "@/lib/announcements.mjs";
import "@/components/announcements.css";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const annonce = await getAnnonceBySlug(slug);
  return annonce ? { title: annonce.titre, description: announcementSummary(annonce).slice(0,160) } : {};
}
export default async function AnnonceDetailPage({ params }) {
  const { slug } = await params;
  const annonce = await getAnnonceBySlug(slug);
  if (!annonce) notFound();
  const action = announcementActionUrl(annonce.action_url);
  const expired = annonce.echeance && annonce.echeance < new Date().toISOString().slice(0,10);
  return <article className="eg-page eg-news-detail"><div className="eg-container eg-section">
    <Link href="/annonces" className="eg-button eg-button--secondary eg-button--compact">Toutes les annonces</Link>
    <header className="eg-news-detail-header"><div className="announcement-meta"><span>{announcementType(annonce.categorie).label}</span><time dateTime={annonce.date}>{announcementDate(annonce.date)}</time></div><h1>{annonce.titre}</h1>{annonce.resume && <p className="announcement-detail-lead">{annonce.resume}</p>}</header>
    {annonce.image_url && <div className="eg-news-detail-photo"><Image src={annonce.image_url} alt="" fill priority sizes="(min-width: 1152px) 1088px, 100vw" className="object-contain" /></div>}
    <div className="announcement-article-layout"><div className="eg-news-detail-text">{announcementBlocks(annonce.texte).map((block,i) => block.type === "heading" ? <h2 key={i}>{block.text}</h2> : block.type === "list" ? <ul key={i}>{block.items.map((text,j) => <li key={j}>{text}</li>)}</ul> : <p key={i}>{block.text}</p>)}</div>
    {(annonce.lieu || annonce.echeance || (action && annonce.action_label)) && <aside className="announcement-practical" aria-labelledby="announcement-practical-title"><h2 id="announcement-practical-title">Informations utiles</h2>{annonce.lieu && <div><span>Lieu</span><p>{annonce.lieu}</p></div>}{annonce.echeance && <div><span>Date limite</span><p><time dateTime={annonce.echeance}>{announcementDate(annonce.echeance)}</time></p></div>}{expired ? <p className="announcement-expired">La date limite est dépassée.</p> : action && annonce.action_label && <a href={action} className="eg-button eg-button--primary" rel="noopener noreferrer">{annonce.action_label}</a>}</aside>}</div>
    <div className="eg-news-detail-back"><Link href="/annonces" className="eg-button eg-button--secondary">Revenir aux annonces</Link></div>
  </div></article>;
}
