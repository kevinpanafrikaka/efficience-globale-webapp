import Link from "next/link";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { adminPageAllowed } from "@/lib/admin-page";
import { getApplication } from "@/lib/candidatures.mjs";
import { applicationEmailLabel } from "@/lib/application-options.mjs";
import { announcementDate } from "@/lib/announcements.mjs";
import ApplicationAdminActions from "@/components/admin/ApplicationAdminActions";
import "@/components/admin/project-editor.css";
import "@/components/admin/admin-applications.css";
export const dynamic="force-dynamic";
export default async function ApplicationDetail({params}){
 if(!(await adminPageAllowed()))return null;
 const {env}=await getCloudflareContext({async:true}),row=await getApplication(env,(await params).id);if(!row)notFound();
 const expired=row.documents_supprimes||row.expire_le<=new Date().toISOString();
 return <div className="admin-applications"><Link href="/admin/candidatures" className="eg-button eg-button--secondary eg-button--compact">Toutes les candidatures</Link><header className="applications-admin-heading"><div><h2>{row.nom}</h2><p>{row.offre_titre}</p></div></header>
  <div className="application-admin-detail"><section className="application-admin-panel"><h2>Coordonnées</h2><dl><div><dt>Email</dt><dd><a href={`mailto:${encodeURIComponent(row.email).replace("%40","@")}`}>{row.email}</a></dd></div>{row.telephone&&<div><dt>Téléphone</dt><dd>{row.telephone}</dd></div>}<div><dt>Reçue le</dt><dd>{announcementDate(row.cree_le)}</dd></div><div><dt>Notification</dt><dd>{applicationEmailLabel(row.email_statut)}</dd></div></dl>{row.message&&<div className="application-admin-message"><h2>Message</h2><p>{row.message}</p></div>}</section>
   <div><section className="application-admin-panel"><h2>Documents</h2>{expired?<p>{row.documents_supprimes?"Documents supprimés du site.":"Documents expirés."}</p>:<><div className="application-admin-documents">{row.documents.length?row.documents.map(doc=><a key={doc.id} href={`/api/admin/candidatures/${row.id}/documents/${encodeURIComponent(doc.id)}`} className="eg-button eg-button--secondary" download>{doc.label}</a>):<p>Aucun document joint.</p>}</div><p className="application-storage">Disponibles jusqu’au {announcementDate(row.expire_le)}.</p></>}</section><section className="application-admin-panel"><ApplicationAdminActions application={{id:row.id,statut:row.statut,upload_statut:row.upload_statut,email_statut:row.email_statut,email_lock_le:row.email_lock_le,expire_le:row.expire_le,documents_supprimes:row.documents_supprimes}}/></section></div>
  </div>
 </div>;
}
