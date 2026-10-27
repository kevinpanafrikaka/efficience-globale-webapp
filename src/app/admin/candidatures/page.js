import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { adminPageAllowed } from "@/lib/admin-page";
import { ensureApplications, APPLICATION_BUDGET } from "@/lib/candidatures.mjs";
import { APPLICATION_STATUSES, applicationEmailLabel } from "@/lib/application-options.mjs";
import { formatDate } from "@/lib/format";
import ApplicationOfferFilter from "@/components/admin/ApplicationOfferFilter";
import "@/components/admin/admin-applications.css";
export const dynamic="force-dynamic";
export default async function ApplicationsPage({searchParams}){
 if(!(await adminPageAllowed()))return null;
 const query=await searchParams||{},status=APPLICATION_STATUSES.some(s=>s.value===query.statut)?query.statut:"",offer=typeof query.annonce==="string"?query.annonce.slice(0,300):"";
 const page=Math.max(1,Math.min(10000,Number.parseInt(query.page,10)||1));
 const {env}=await getCloudflareContext({async:true});await ensureApplications(env);
 const where=["upload_statut='ready'"],args=[];
 if(status){where.push("statut=?");args.push(status);}if(offer){where.push("annonce_id=?");args.push(offer);}
 const clause=where.join(" AND ");
 const {results}=await env.DB.prepare(`SELECT id,nom,email,offre_titre,cree_le,statut,email_statut FROM candidatures WHERE ${clause} ORDER BY cree_le DESC,id ASC LIMIT 50 OFFSET ?`).bind(...args,(page-1)*50).all();
 const count=await env.DB.prepare(`SELECT COUNT(*) n FROM candidatures WHERE ${clause}`).bind(...args).first();
 const used=await env.DB.prepare("SELECT COALESCE(SUM(octets),0) n FROM candidatures WHERE documents_supprimes=0").first();
 const {results:offers}=await env.DB.prepare("SELECT annonce_id AS value, MAX(offre_titre) AS label FROM candidatures WHERE upload_statut='ready' AND annonce_id IS NOT NULL GROUP BY annonce_id ORDER BY label").all();
 function href(changes){const p=new URLSearchParams({...query,...changes});for(const [key,value] of p)if(!value)p.delete(key);return `/admin/candidatures?${p}`;}
 return <div className="admin-applications"><header className="applications-admin-heading"><h2>Candidatures reçues</h2><span>{count.n} candidature{count.n>1?"s":""}</span></header>
  <ApplicationOfferFilter offers={offers} offer={offer} status={status}/>
  <nav className="application-admin-filters" aria-label="Filtrer les candidatures">{[{value:"",label:"Toutes"},...APPLICATION_STATUSES].map(s=><Link key={s.value} href={href({statut:s.value,page:"1"})} className="eg-button eg-button--filter eg-button--compact" aria-current={status===s.value?"page":undefined}>{s.label}</Link>)}{offer&&<Link href={href({annonce:"",page:"1"})} className="eg-button eg-button--secondary eg-button--compact">Toutes les offres</Link>}</nav>
  <p className="application-storage">Documents : {(used.n/1024/1024).toFixed(1)} Mo / {APPLICATION_BUDGET/1024/1024} Mo · Conservation : 30 jours</p>
  {results.length?<div className="applications-admin-list">{results.map(row=><Link key={row.id} href={`/admin/candidatures/${row.id}`} className="application-admin-row"><div><h2>{row.nom}</h2><p>{row.offre_titre}</p><span>{row.email}</span></div><div><strong>{APPLICATION_STATUSES.find(s=>s.value===row.statut)?.label||row.statut}</strong><span>{applicationEmailLabel(row.email_statut)}</span><time>{formatDate(row.cree_le)}</time></div></Link>)}</div>:<div className="admin-note">Aucune candidature{status||offer?" correspondante":""}.</div>}
  {(page>1||count.n>page*50)&&<nav className="application-admin-pagination" aria-label="Pages des candidatures">{page>1&&<Link href={href({page:String(page-1)})} className="eg-button eg-button--secondary">Précédente</Link>}{count.n>page*50&&<Link href={href({page:String(page+1)})} className="eg-button eg-button--secondary">Suivante</Link>}</nav>}
 </div>;
}
