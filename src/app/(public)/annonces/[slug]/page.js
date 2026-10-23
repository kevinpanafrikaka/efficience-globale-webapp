import Link from "next/link";
import Image from "@/components/PublicImage";
import { notFound } from "next/navigation";
import { getAnnonceBySlug, getAnnonces } from "@/lib/db";
import { announcementDate, announcementSummary, announcementType, announcementActionUrl } from "@/lib/announcements.mjs";
import ProjectPageEntry from "@/components/ProjectPageEntry";
import AnnouncementCard from "@/components/AnnouncementCard";
import AnnouncementGallery from "@/components/AnnouncementGallery";
import AnnouncementArticle from "@/components/AnnouncementArticle";
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
  const others = (await getAnnonces()).filter(a => a.slug !== slug);
  const sameType = others.filter(a => a.categorie === annonce.categorie);
  const related = (sameType.length ? sameType : others).slice(0,3);
  return <article className="eg-page eg-news-detail">
    <ProjectPageEntry slug={`announcement-${slug}`} />
    <section className="eg-project-hero announcement-detail-hero relative min-h-[380px] md:min-h-[480px] overflow-hidden bg-darker" aria-labelledby="announcement-title">
      {annonce.image_url ? <Image src={annonce.image_url} alt="" fill priority sizes="100vw" className="object-cover" /> : <div className="announcement-hero-pattern" aria-hidden="true"><span>EG</span></div>}
      <div className="absolute inset-0" style={{background:"linear-gradient(90deg,rgba(13,19,14,.88) 0%,rgba(13,19,14,.55) 45%,rgba(13,19,14,.3) 100%)"}} />
      <div className="absolute inset-0" style={{background:"linear-gradient(0deg,rgba(10,15,11,.8) 0%,rgba(10,15,11,.15) 45%)"}} />
      <div className="relative flex items-end min-h-[380px] md:min-h-[480px] pt-12"><div className="max-w-4xl mx-auto px-5 md:px-8 pb-8 w-full">
        <Link href="/annonces" className="inline-flex items-center rounded border-[1.5px] border-white/40 px-3.5 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white/10 mb-5 w-fit">Toutes les annonces</Link>
        <h1 id="announcement-title" className="text-white text-[26px] md:text-[40px] leading-[1.05] tracking-[-0.01em] max-w-2xl mb-5">{annonce.titre}</h1>
        <div className="announcement-hero-meta"><span>{announcementType(annonce.categorie).label}</span><time dateTime={annonce.date}>{announcementDate(annonce.date)}</time></div>
      </div></div>
    </section>
    <section className="eg-container eg-section announcement-detail-body" aria-label="Contenu de l’annonce">
      <AnnouncementArticle annonce={annonce} action={action} expired={expired}/>
      {annonce.galerie?.length > 0 && <AnnouncementGallery photos={annonce.galerie} title={annonce.titre} />}
      <div className="announcement-detail-return"><Link href="/annonces" className="eg-button eg-button--secondary">Revenir aux annonces</Link></div>
    </section>
    {related.length > 0 && <section className="announcement-related" aria-labelledby="announcement-related-title"><div className="eg-container"><h2 id="announcement-related-title">À lire également</h2><div className="eg-news-grid">{related.map(a => <AnnouncementCard key={a.id} annonce={a} />)}</div></div></section>}
  </article>;
}
