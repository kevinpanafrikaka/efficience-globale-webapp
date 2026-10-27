"use client";
import { useRouter } from "next/navigation";
import EditorSelect from "./EditorSelect";
import useAdminAction from "./useAdminAction";
import { APPLICATION_STATUSES } from "@/lib/application-options.mjs";
export default function ApplicationAdminActions({application, returnHref="/admin/annonces?type=recrutement"}){
 const router=useRouter(),{run,loading,error}=useAdminAction();
 const endpoint=`/api/admin/candidatures/${application.id}`;
 const expired=application.documents_supprimes||application.expire_le<=new Date().toISOString();
 const sending=application.email_statut==="sending"&&application.email_lock_le>new Date().toISOString();
 return <div className="project-editor application-admin-actions"><label id="application-status-label" htmlFor="application-status">Statut de la candidature</label><EditorSelect id="application-status" value={application.statut} options={APPLICATION_STATUSES} disabled={loading} onChange={statut=>run(endpoint,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({statut})},()=>router.refresh())}/>
  <div className="application-admin-buttons">{application.email_statut!=="sent"&&!expired&&application.upload_statut==="ready"&&<button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={loading||sending} onClick={()=>{if(window.confirm("Vérifiez d’abord la messagerie de M. Oumar pour éviter un double envoi. Renvoyer avec les pièces jointes ?"))run(endpoint,{method:"POST"},()=>router.refresh());}}>{sending?"Envoi en cours…":"Renvoyer l’email"}</button>}
   <button type="button" className="eg-button eg-button--danger eg-button--compact" disabled={loading||sending} onClick={()=>{if(window.confirm("Supprimer définitivement cette candidature et ses documents stockés sur le site ?"))run(endpoint,{method:"DELETE"},()=>{router.push(returnHref);router.refresh();});}}>Supprimer</button>
  </div>{error&&<p role="alert" className="admin-action-error">{error}</p>}
 </div>;
}
