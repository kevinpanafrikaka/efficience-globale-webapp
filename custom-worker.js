import handler from "./.open-next/worker.js";
import { cleanupApplications } from "./src/lib/candidatures.mjs";
export * from "./.open-next/worker.js";
export default {
 fetch: handler.fetch,
 async scheduled(event,env){
  try{await cleanupApplications(env);}
  catch{throw new Error("Application document cleanup failed");}
 },
};
