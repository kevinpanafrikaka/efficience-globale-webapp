import { applicationAdmin } from "@/lib/application-admin";
import { applicationDocumentKeys, APPLICATION_STATUSES, getApplication, notifyApplication } from "@/lib/candidatures.mjs";
export async function PUT(request,{params}){
 const {env,response}=await applicationAdmin(request,true);if(response)return response;
 let data;try{data=await request.json();}catch{return Response.json({error:"Demande invalide."},{status:400});}
 if(!APPLICATION_STATUSES.some(s=>s.value===data?.statut))return Response.json({error:"Statut invalide."},{status:400});
 const {id}=await params,row=await getApplication(env,id);if(!row)return Response.json({error:"Candidature introuvable."},{status:404});
 await env.DB.prepare("UPDATE candidatures SET statut=? WHERE id=?").bind(data.statut,id).run();
 return Response.json({success:true});
}
export async function POST(request,{params}){
 const {env,response}=await applicationAdmin(request,true);if(response)return response;
 const row=await getApplication(env,(await params).id);if(!row)return Response.json({error:"Candidature introuvable."},{status:404});
 if(row.email_statut==="sent")return Response.json({success:true});
 try{const sent=await notifyApplication(env,row);return sent?Response.json({success:true}):Response.json({error:"Envoi non confirmé. Vérifiez la messagerie avant de réessayer."},{status:503});}
 catch{return Response.json({error:"Les documents ne sont plus disponibles pour cet envoi."},{status:410});}
}
export async function DELETE(request,{params}){
 const {env,response}=await applicationAdmin(request,true);if(response)return response;
 const row=await getApplication(env,(await params).id);if(!row)return Response.json({error:"Candidature introuvable."},{status:404});
 if(row.email_statut==="sending"&&row.email_lock_le>new Date().toISOString())return Response.json({error:"Un envoi est en cours. Réessayez dans quelques instants."},{status:409});
 try{const keys=await applicationDocumentKeys(env,row);if(keys.length)await env.UPLOADS.delete(keys);await env.DB.batch([env.DB.prepare("DELETE FROM candidature_dossiers WHERE candidature_id=?").bind(row.id),env.DB.prepare("DELETE FROM candidatures WHERE id=?").bind(row.id)]);return Response.json({success:true});}
 catch{return Response.json({error:"La suppression n’a pas pu être confirmée. Réessayez."},{status:503});}
}
