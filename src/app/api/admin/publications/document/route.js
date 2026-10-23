import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { PublicationDocumentError,PUBLICATION_DOCUMENT_PREFIX,readPublicationPdf,publicationDocumentUrl } from "@/lib/publication-documents.mjs";
export async function POST(request){
 const {env}=await getCloudflareContext({async:true});
 const headers={"Cache-Control":"no-store"};
 if(!(await isAdminRequest(request,env)))return Response.json({error:"Non autorisé."},{status:401,headers});
 if(request.headers.get("origin")!==new URL(request.url).origin)return Response.json({error:"Origine refusée."},{status:403,headers});
 if(!env.UPLOADS)return Response.json({error:"Stockage indisponible."},{status:503,headers});
 try{const {bytes,nom}=await readPublicationPdf(request),key=`${PUBLICATION_DOCUMENT_PREFIX}${crypto.randomUUID()}.pdf`;await env.UPLOADS.put(key,bytes,{httpMetadata:{contentType:"application/pdf"}});return Response.json({success:true,url:publicationDocumentUrl(key),nom},{headers});}
 catch(error){return Response.json({error:error instanceof PublicationDocumentError?error.message:"Le PDF n’a pas pu être enregistré."},{status:error instanceof PublicationDocumentError?error.status:503,headers});}
}
