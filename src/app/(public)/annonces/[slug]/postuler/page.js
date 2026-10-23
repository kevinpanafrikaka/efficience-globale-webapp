import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnnonceBySlug } from "@/lib/db";
import { announcementApplicationPath, announcementDate } from "@/lib/announcements.mjs";
import { applicationOpen } from "@/lib/candidatures.mjs";
import ApplicationForm from "@/components/ApplicationForm";
import PublicImage from "@/components/PublicImage";
import ProjectPageEntry from "@/components/ProjectPageEntry";
import "@/components/applications.css";
export const dynamic="force-dynamic";
export async function generateMetadata({params}){
 const annonce=await getAnnonceBySlug((await params).slug);
 return {title:annonce?`Postuler · ${annonce.titre}`:"Candidature",robots:{index:false,follow:false}};
}
export default async function ApplyPage({params}){
 const {slug}=await params,annonce=await getAnnonceBySlug(slug);
 if(!annonce || !announcementApplicationPath(annonce))notFound();
 return <article className="application-screen">
  <ProjectPageEntry slug={`apply-${slug}`}/>
  <section className="application-hero" aria-labelledby="application-title">
   {annonce.image_url?<PublicImage src={annonce.image_url} alt="" fill priority sizes="100vw" className="application-hero-image"/>:<div className="application-hero-pattern" aria-hidden="true"/>}
   <div className="application-hero-shade" aria-hidden="true"/>
   <div className="eg-container application-hero-content">
    <h1 id="application-title">Votre candidature</h1>
    <p>{annonce.titre}</p>
    <Link href={`/annonces/${encodeURIComponent(slug)}`} className="eg-button eg-button--secondary eg-button--compact">Voir l’offre</Link>
   </div>
  </section>
  <section className="eg-container eg-section application-page" aria-label="Dossier de candidature">
   {(annonce.lieu||annonce.echeance)&&<dl className="application-offer-facts" aria-label="L’offre en bref">{annonce.lieu&&<div><dt>Lieu</dt><dd>{annonce.lieu}</dd></div>}{annonce.echeance&&<div><dt>Date limite</dt><dd>{announcementDate(annonce.echeance)}</dd></div>}</dl>}
   {applicationOpen(annonce)?<ApplicationForm slug={slug} documents={annonce.documents_candidature}/>:<div className="application-result" role="status"><h2>Candidatures closes</h2><p>La date limite de cette offre est dépassée.</p><Link href="/annonces" className="eg-button eg-button--secondary">Toutes les annonces</Link></div>}
  </section>
 </article>;
}
