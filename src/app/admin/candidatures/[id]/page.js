import Link from "next/link";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { adminPageAllowed } from "@/lib/admin-page";
import { getApplication } from "@/lib/candidatures.mjs";
import { APPLICATION_STATUSES, applicationEmailLabel } from "@/lib/application-options.mjs";
import { applicationListFilters, applicationListHref } from "@/lib/application-navigation.mjs";
import { announcementDate } from "@/lib/announcements.mjs";
import ApplicationAdminActions from "@/components/admin/ApplicationAdminActions";
import "@/components/admin/project-editor.css";
import "@/components/admin/admin-applications.css";
export const dynamic="force-dynamic";
export default async function ApplicationDetail({params,searchParams}){
 if(!(await adminPageAllowed()))return null;
 const {env}=await getCloudflareContext({async:true}),row=await getApplication(env,(await params).id);if(!row)notFound();
 const filters=applicationListFilters(await searchParams||{});
 const returnHref=applicationListHref({...filters,annonce:row.annonce_id||""});
 const expired=row.documents_supprimes||row.expire_le<=new Date().toISOString();
 return <div className="admin-applications application-dossier-detail">
  <div className="application-breadcrumb"><Link href={returnHref} className="eg-button eg-button--secondary eg-button--compact">Retour aux dossiers</Link><Link href="/admin/annonces?type=recrutement" className="eg-button eg-button--quiet eg-button--compact">Les offres de recrutement</Link></div>
  <header className="application-inbox-heading"><div><p className="application-kicker">Dossier de candidature</p><h2>{row.nom}</h2><p className="application-offer-title">{row.offre_titre}</p></div><span className="application-status-text" data-status={row.statut}>{APPLICATION_STATUSES.find(s=>s.value===row.statut)?.label||row.statut}</span></header>
  <div className="application-admin-detail">
   <div className="application-profile-column"><section className="application-admin-panel"><h2>Coordonnées</h2><dl><div><dt>Email</dt><dd><a href={`mailto:${encodeURIComponent(row.email).replace("%40","@")}`}>{row.email}</a></dd></div>{row.telephone&&<div><dt>Téléphone</dt><dd>{row.telephone}</dd></div>}<div><dt>Reçue le</dt><dd>{announcementDate(row.cree_le)}</dd></div><div><dt>Notification au cabinet</dt><dd>{applicationEmailLabel(row.email_statut)}</dd></div></dl></section>
   {row.message&&<section className="application-admin-panel application-candidate-message"><h2>Message du candidat</h2><p>{row.message}</p></section>}</div>
   <div className="application-review-column"><section className="application-admin-panel"><h2>Suivi du dossier</h2><ApplicationAdminActions returnHref={returnHref} application={{id:row.id,statut:row.statut,upload_statut:row.upload_statut,email_statut:row.email_statut,email_lock_le:row.email_lock_le,expire_le:row.expire_le,documents_supprimes:row.documents_supprimes}}/></section>
   <section className="application-admin-panel"><h2>Pièces jointes</h2>{expired?<p className="application-document-unavailable">{row.documents_supprimes?"Documents supprimés du site.":"Documents expirés."}</p>:<><div className="application-document-list">{row.documents.length?row.documents.map(doc=><a key={doc.id} href={`/api/admin/candidatures/${row.id}/documents/${encodeURIComponent(doc.id)}`} className="application-document-download" download><span className="application-pdf-mark" aria-hidden="true">PDF</span><span><strong>{doc.label}</strong><span>Télécharger</span></span></a>):<p>Aucun document joint.</p>}</div>{row.documents.length>0&&<p className="application-storage">Disponibles jusqu’au {announcementDate(row.expire_le)}.</p>}</>}</section></div>
  </div>
 </div>;
}
