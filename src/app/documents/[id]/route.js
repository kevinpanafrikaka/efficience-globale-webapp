import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { publishedAnnouncementDocument } from "@/lib/db";
import { PUBLICATION_DOCUMENT_PREFIX } from "@/lib/publication-documents.mjs";
export const dynamic="force-dynamic";
export async function GET(request,{params}){
 const {id}=await params,headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
 if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id))return new Response("Introuvable",{status:404,headers});
 try{
  const {env}=await getCloudflareContext({async:true});
  if(!(await publishedAnnouncementDocument(`/documents/${id}`))&&!(await isAdminRequest(request,env)))return new Response("Introuvable",{status:404,headers});
  const object=await env.UPLOADS.get(`${PUBLICATION_DOCUMENT_PREFIX}${id}.pdf`);if(!object)return new Response("Introuvable",{status:404,headers});
  return new Response(object.body,{headers:{...headers,"Content-Type":"application/pdf","Content-Disposition":"attachment; filename=\"publication.pdf\""}});
 }catch{return new Response("Document indisponible.",{status:503,headers});}
}
