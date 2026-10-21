import Link from "next/link";
import Image from "@/components/PublicImage";
import { notFound } from "next/navigation";
import { getAnnonceBySlug } from "@/lib/db";
import { announcementDate, announcementExcerpt } from "@/lib/announcements.mjs";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const annonce = await getAnnonceBySlug(slug);
  if (!annonce) return {};
  return { title: annonce.titre, description: announcementExcerpt(annonce.texte, 160) };
}

export default async function AnnonceDetailPage({ params }) {
  const { slug } = await params;
  const annonce = await getAnnonceBySlug(slug);
  if (!annonce) notFound();
  return <article className="eg-page eg-news-detail"><div className="eg-container eg-section">
    <Link href="/annonces" className="eg-button eg-button--secondary eg-button--compact">Toutes les annonces</Link>
    <header className="eg-news-detail-header"><time dateTime={annonce.date} className="eg-news-date">{announcementDate(annonce.date)}</time><h1>{annonce.titre}</h1></header>
    {annonce.image_url && <div className="eg-news-detail-photo"><Image src={annonce.image_url} alt="" fill priority sizes="(min-width: 1152px) 1088px, 100vw" className="object-contain" /></div>}
    <div className="eg-news-detail-text"><p>{annonce.texte}</p></div>
    <div className="eg-news-detail-back"><Link href="/annonces" className="eg-button eg-button--secondary">Revenir aux annonces</Link></div>
  </div></article>;
}
