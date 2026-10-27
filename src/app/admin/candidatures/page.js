import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { adminPageAllowed } from "@/lib/admin-page";
import { getAnnonceById } from "@/lib/db";
import { ensureApplications } from "@/lib/candidatures.mjs";
import { APPLICATION_STATUSES } from "@/lib/application-options.mjs";
import { applicationListFilters, applicationListHref, applicationDossierHref } from "@/lib/application-navigation.mjs";
import { formatDate } from "@/lib/format";
import ApplicationOfferFilter from "@/components/admin/ApplicationOfferFilter";
import "@/components/admin/admin-applications.css";
export const dynamic="force-dynamic";

export default async function ApplicationsPage({searchParams}) {
 if(!(await adminPageAllowed()))return null;
 const filters=applicationListFilters(await searchParams||{});
 const {annonce:offer,statut:status,q:search,page}=filters;
 const {env}=await getCloudflareContext({async:true});await ensureApplications(env);
 const where=["upload_statut='ready'"],args=[];
 if(status){where.push("statut=?");args.push(status);}
 if(offer){where.push("annonce_id=?");args.push(offer);}
 if(search){where.push("nom LIKE ? ESCAPE '\\'");args.push(`%${search.replace(/[\\%_]/g,"\\$&")}%`);}
 const clause=where.join(" AND ");
 const {results}=await env.DB.prepare(`SELECT id,nom,offre_titre,cree_le,statut FROM candidatures WHERE ${clause} ORDER BY cree_le DESC,id ASC LIMIT 50 OFFSET ?`).bind(...args,(page-1)*50).all();
 const count=await env.DB.prepare(`SELECT COUNT(*) n FROM candidatures WHERE ${clause}`).bind(...args).first();
 const currentOffer=offer?await getAnnonceById(offer):null;
 const {results:offers}=await env.DB.prepare("SELECT annonce_id AS value, MAX(offre_titre) AS label FROM candidatures WHERE upload_statut='ready' AND annonce_id IS NOT NULL GROUP BY annonce_id ORDER BY label").all();
 const title=currentOffer?.titre||offers.find(o=>o.value===offer)?.label||"Candidatures reçues";
 const href=changes=>applicationListHref({...filters,...changes});
 return <div className="admin-applications application-inbox">
  <div className="application-breadcrumb"><Link href="/admin/annonces?type=recrutement" className="eg-button eg-button--secondary eg-button--compact">Retour aux offres</Link>{currentOffer&&<Link href={`/admin/annonces/${encodeURIComponent(currentOffer.id)}/modifier`} className="eg-button eg-button--quiet eg-button--compact">Modifier l’offre</Link>}</div>
  <header className="application-inbox-heading"><div><p className="application-kicker">{offer?"Candidatures · Recrutement":"Recrutement"}</p><h2>{title}</h2></div><span className="application-result-count">{count.n} dossier{count.n>1?"s":""}</span></header>
  {!offer&&<ApplicationOfferFilter offers={offers} status={status} search={search}/>}
  <div className="application-inbox-toolbar">
   <nav className="application-admin-filters" aria-label="Filtrer les candidatures par statut">{[{value:"",label:"Toutes"},...APPLICATION_STATUSES.map(s=>({...s,label:{nouvelle:"Nouvelles",en_cours:"En cours d’examen",retenue:"Retenues",non_retenue:"Non retenues"}[s.value]}))].map(s=><Link key={s.value} href={href({statut:s.value,page:1})} className="eg-button eg-button--filter eg-button--compact" aria-current={status===s.value?"page":undefined}>{s.label}</Link>)}</nav>
   <form action="/admin/candidatures" method="get" className="application-inbox-search">
    {offer&&<input type="hidden" name="annonce" value={offer}/>}{status&&<input type="hidden" name="statut" value={status}/>}
    <label htmlFor="application-search" className="sr-only">Rechercher un candidat par nom</label><input id="application-search" type="search" name="q" defaultValue={search} maxLength={120} placeholder="Rechercher un nom…"/>
    <button type="submit" className="eg-button eg-button--secondary eg-button--icon" aria-label="Rechercher un candidat"><svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button>
   </form>
  </div>
  {(status||search)&&<div className="application-filter-reset"><Link href={href({statut:"",q:"",page:1})}>Réinitialiser les filtres</Link></div>}
  {results.length?<div className="application-dossiers">
   <div className="application-dossier-columns" aria-hidden="true"><span>Candidat</span><span>Réception</span><span>Statut</span><span>Dossier</span></div>
   <ol className="application-dossier-list">{results.map(row=><li key={row.id} className="application-dossier-row">
    <div className="application-candidate-name"><h3>{row.nom}</h3>{!offer&&<p>{row.offre_titre}</p>}</div>
    <time dateTime={row.cree_le} className="application-received"><span>Reçue le </span>{formatDate(row.cree_le)}</time>
    <span className="application-status-text" data-status={row.statut}>{APPLICATION_STATUSES.find(s=>s.value===row.statut)?.label||row.statut}</span>
    <Link href={applicationDossierHref(row.id,filters)} className="eg-button eg-button--secondary eg-button--compact" aria-label={`Ouvrir le dossier de ${row.nom}`}>Ouvrir le dossier</Link>
   </li>)}</ol>
  </div>:<div className="application-inbox-empty" role="status"><h3>{status||search?"Aucun dossier correspondant":"Aucune candidature reçue"}</h3><p>{status||search?"Essayez un autre nom ou un autre statut.":offer?"Les dossiers envoyés pour cette offre apparaîtront ici.":"Les dossiers reçus seront disponibles depuis leurs offres de recrutement."}</p>{(status||search)&&<Link href={href({statut:"",q:"",page:1})} className="eg-button eg-button--secondary">Voir tous les dossiers de cette offre</Link>}</div>}
  {(page>1||count.n>page*50)&&<nav className="application-admin-pagination" aria-label="Pages des candidatures">{page>1&&<Link href={href({page:page-1})} className="eg-button eg-button--secondary">Précédente</Link>}{count.n>page*50&&<Link href={href({page:page+1})} className="eg-button eg-button--secondary">Suivante</Link>}</nav>}
 </div>;
}
