import { applicationDocumentFilename } from "@/lib/application-documents.mjs";
import { applicationAdmin } from "@/lib/application-admin";
import { ApplicationError, getApplication, applicationDocument } from "@/lib/candidatures.mjs";
export async function GET(request,{params}){
 const {env,response}=await applicationAdmin(request);if(response)return response;
 const {id,type}=await params;
 if(!/^[a-z][a-z0-9_-]{0,59}$/.test(type))return new Response("Introuvable",{status:404});
 const row=await getApplication(env,id);if(!row)return new Response("Introuvable",{status:404});
 const doc=row.documents.find(doc=>doc.id===type);if(!doc)return new Response("Introuvable",{status:404,headers:{"Cache-Control":"no-store"}});
 try{const bytes=await applicationDocument(env,row,type);return new Response(bytes,{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${applicationDocumentFilename(doc)}"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","X-Robots-Tag":"noindex"}});}
 catch(error){return new Response(error instanceof ApplicationError?error.message:"Document indisponible.",{status:error instanceof ApplicationError?error.status:503,headers:{"Cache-Control":"no-store"}});}
}
