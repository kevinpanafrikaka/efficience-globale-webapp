import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAnnonceBySlug } from "@/lib/db";
import { announcementApplicationPath } from "@/lib/announcements.mjs";
import { ApplicationError, applicationOpen, ensureApplications, readApplicationForm, applicationPdf, applicationRateLimit, storeApplication, notifyApplication } from "@/lib/candidatures.mjs";
export async function POST(request,{params}) {
 if(request.headers.get("origin")!==new URL(request.url).origin)return Response.json({error:"Origine refusée."},{status:403});
 try{
  const {env}=await getCloudflareContext({async:true});
  if(!env.UPLOADS || !env.ADMIN_PASSWORD)throw new ApplicationError("La réception des candidatures est momentanément indisponible.",503);
  const {slug}=await params,annonce=await getAnnonceBySlug(slug);
  if(!annonce || !announcementApplicationPath(annonce))throw new ApplicationError("Cette offre n’accepte pas de candidature ici.",404);
  if(!applicationOpen(annonce))throw new ApplicationError("Les candidatures pour cette offre sont closes.",410);
  const form=await readApplicationForm(request);
  if(form.get("site_web")?.toString().trim())return Response.json({success:true});
  const data={};
  for(const [key,max] of [["nom",120],["email",200],["telephone",40],["message",5000],["request_id",36]]){
   const value=form.get(key);if(value!==null&&typeof value!=="string")throw new ApplicationError("Un champ du formulaire est invalide.");
   data[key]=(value||"").trim();if(data[key].length>max)throw new ApplicationError("Un champ du formulaire est trop long.");
  }
  data.email=data.email.toLowerCase();
  if(!data.nom || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email))throw new ApplicationError("Renseignez votre nom et une adresse email valide.");
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(data.request_id))throw new ApplicationError("Rechargez le formulaire puis réessayez.");
  if(form.getAll("cv").length!==1 || form.getAll("lettre").length>1)throw new ApplicationError("Ajoutez un CV et une seule lettre de motivation.");
  const cv=await applicationPdf(form.get("cv"),true),letter=await applicationPdf(form.get("lettre"));
  await ensureApplications(env);
  // Exact retries do not consume another slot or send another email.
  const prior=await env.DB.prepare("SELECT * FROM candidatures WHERE request_id=? AND email=? AND annonce_id=? AND upload_statut='ready'").bind(data.request_id,data.email,annonce.id).first();
  if(prior){if(prior.email_statut==="pending")await notifyApplication(env,prior);return Response.json({success:true});}
  await applicationRateLimit(env,request.headers.get("cf-connecting-ip")||"unknown");
  const {row,created}=await storeApplication(env,annonce,data,cv,letter);
  if(created)await notifyApplication(env,row);
  return Response.json({success:true});
 }catch(error){return Response.json({error:error instanceof ApplicationError?error.message:"Impossible d’enregistrer la candidature. Réessayez plus tard."},{status:error instanceof ApplicationError?error.status:503,headers:error.status===429?{"Retry-After":"3600"}:{}});}
}
