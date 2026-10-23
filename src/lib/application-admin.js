import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
export async function applicationAdmin(request,write=false){
 const {env}=await getCloudflareContext({async:true});
 if(!(await isAdminRequest(request,env)))return {response:Response.json({error:"Non autorisé."},{status:401})};
 if(write&&request.headers.get("origin")!==new URL(request.url).origin)return {response:Response.json({error:"Origine refusée."},{status:403})};
 return {env};
}
