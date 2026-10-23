import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnnonceBySlug } from "@/lib/db";
import { announcementApplicationPath, announcementDate } from "@/lib/announcements.mjs";
import { applicationOpen } from "@/lib/candidatures.mjs";
import ApplicationForm from "@/components/ApplicationForm";
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
 return <section className="eg-container eg-section application-page">
  <ProjectPageEntry slug={`apply-${slug}`}/>
  <Link href={`/annonces/${encodeURIComponent(slug)}`} className="eg-button eg-button--secondary eg-button--compact">Voir l’offre</Link>
  <header className="application-heading"><h1>Votre candidature</h1><p>{annonce.titre}</p></header>
  <div className="application-layout"><div>{applicationOpen(annonce)?<ApplicationForm slug={slug}/>:<div className="application-result" role="status"><h2>Candidatures closes</h2><p>La date limite de cette offre est dépassée.</p><Link href="/annonces" className="eg-button eg-button--secondary">Toutes les annonces</Link></div>}</div>
   <aside className="application-offer" aria-label="L’offre en bref"><h2>L’offre en bref</h2><p>{annonce.titre}</p><dl>{annonce.lieu&&<div><dt>Lieu</dt><dd>{annonce.lieu}</dd></div>}{annonce.echeance&&<div><dt>Date limite</dt><dd>{announcementDate(annonce.echeance)}</dd></div>}</dl><span>PDF · 2 Mo maximum par document</span></aside>
  </div>
 </section>;
}
