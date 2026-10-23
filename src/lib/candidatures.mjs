import { MAX_APPLICATION_DOCUMENTS,MAX_DOCUMENT_BYTES,applicationDocumentFilename } from "./application-documents.mjs";
import { isGmailConnected, sendGmail } from "./gmail.mjs";
import { isBrevoConfigured, sendBrevo } from "./brevo.mjs";
export const APPLICATION_PREFIX = "private-applications/";
export const MAX_PDF_BYTES = MAX_DOCUMENT_BYTES;
export const APPLICATION_BUDGET = 2 * 1024 * 1024 * 1024;
export { APPLICATION_STATUSES } from "./application-options.mjs";
export const APPLICATION_SCHEMA = [
 `CREATE TABLE IF NOT EXISTS candidatures (
  id TEXT PRIMARY KEY, request_id TEXT NOT NULL UNIQUE,
  annonce_id TEXT REFERENCES annonces(id) ON DELETE SET NULL, offre_titre TEXT NOT NULL,
  nom TEXT NOT NULL, email TEXT NOT NULL, telephone TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '',
  cv_key TEXT NOT NULL, lettre_key TEXT NOT NULL DEFAULT '', document_secret TEXT NOT NULL, octets INTEGER NOT NULL,
  cree_le TEXT NOT NULL, expire_le TEXT NOT NULL, documents_supprimes INTEGER NOT NULL DEFAULT 0,
  upload_statut TEXT NOT NULL DEFAULT 'pending', email_statut TEXT NOT NULL DEFAULT 'pending',
  email_lock_le TEXT, email_envoye_le TEXT, statut TEXT NOT NULL DEFAULT 'nouvelle',
  UNIQUE(annonce_id,email)
 )`,
 "CREATE INDEX IF NOT EXISTS idx_candidatures_expiration ON candidatures(documents_supprimes,expire_le)",
 "CREATE TABLE IF NOT EXISTS candidature_dossiers (candidature_id TEXT PRIMARY KEY REFERENCES candidatures(id) ON DELETE CASCADE, documents_json TEXT NOT NULL)",
 "CREATE TABLE IF NOT EXISTS candidature_limits (cle TEXT PRIMARY KEY, compteur INTEGER NOT NULL, heure INTEGER NOT NULL)",
];
export class ApplicationError extends Error {
 constructor(message,status=400){ super(message);this.status=status; }
}
export async function ensureApplications(env) {
 await env.DB.batch(APPLICATION_SCHEMA.map(sql=>env.DB.prepare(sql)));
}
export function applicationOpen(annonce,now=new Date()) {
 return annonce?.statut==="publie" && annonce.categorie==="recrutement" && (!annonce.echeance || annonce.echeance>=now.toISOString().slice(0,10));
}
export async function readApplicationForm(request) {
 const limit=MAX_APPLICATION_DOCUMENTS*MAX_PDF_BYTES+1024*1024;
 if(Number(request.headers.get("content-length"))>limit)throw new ApplicationError("Le dossier dépasse la taille autorisée.",413);
 if(!request.body)throw new ApplicationError("Dossier vide.");
 const reader=request.body.getReader(),chunks=[];let size=0;
 try { for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new ApplicationError("Le dossier dépasse la taille autorisée.",413);}chunks.push(value);} }
 finally{reader.releaseLock();}
 try{return await new Response(Buffer.concat(chunks),{headers:{"content-type":request.headers.get("content-type")||""}}).formData();}
 catch{throw new ApplicationError("Le formulaire n’a pas pu être lu.");}
}
export async function applicationPdf(file,required=false,label="CV") {
 if(!file || typeof file==="string" || !file.size){if(required)throw new ApplicationError(`Ajoutez le document « ${label} » au format PDF.`);return null;}
 if(file.size>MAX_PDF_BYTES)throw new ApplicationError("Chaque document doit faire 2 Mo maximum.",413);
 if(!/\.pdf$/i.test(file.name) || !["application/pdf","application/octet-stream",""].includes(file.type))throw new ApplicationError("Les documents doivent être au format PDF.");
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(Buffer.from(bytes.subarray(0,5)).toString()!=="%PDF-" || !Buffer.from(bytes.subarray(-1024)).toString().includes("%%EOF"))throw new ApplicationError("Un des documents n’est pas un PDF valide.");
 return bytes;
}
async function fileKey(secret) {
 if(!/^[A-Za-z0-9_-]{43}$/.test(secret||""))throw new Error("Application document key unavailable");
 return crypto.subtle.importKey("raw",Buffer.from(secret,"base64url"),"AES-GCM",false,["encrypt","decrypt"]);
}
async function encryptFile(secret,key,bytes) {
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const sealed=await crypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:new TextEncoder().encode(key)},await fileKey(secret),bytes);
 return Buffer.concat([Buffer.from(iv),Buffer.from(sealed)]);
}
export async function applicationDocuments(env,row) {
 if(Array.isArray(row.documents))return row.documents;
 const stored=row.documents_json!==undefined?{documents_json:row.documents_json}:await env.DB.prepare("SELECT documents_json FROM candidature_dossiers WHERE candidature_id=?").bind(row.id).first();
 if(stored?.documents_json!==null&&stored?.documents_json!==undefined)return JSON.parse(stored.documents_json);
 // Existing dossiers remain readable after the rollout.
 return [{id:"cv",label:"CV",key:row.cv_key},{id:"lettre",label:"Lettre de motivation",key:row.lettre_key}].filter(doc=>doc.key);
}
export async function applicationDocumentKeys(env,row) {
 return (await applicationDocuments(env,row)).map(doc=>doc.key).filter(key=>key&&key.startsWith(`${APPLICATION_PREFIX}${row.id}/`));
}
export async function applicationDocument(env,row,type) {
 if(!/^[a-z][a-z0-9_-]{0,59}$/.test(type) || row.documents_supprimes || row.upload_statut!=="ready" || row.expire_le<=new Date().toISOString())throw new ApplicationError("Ce document n’est plus disponible.",410);
 const key=(await applicationDocuments(env,row)).find(doc=>doc.id===type)?.key;
 if(!key || !key.startsWith(`${APPLICATION_PREFIX}${row.id}/`))throw new ApplicationError("Document introuvable.",404);
 const object=await env.UPLOADS.get(key);
 if(!object)throw new ApplicationError("Document introuvable.",404);
 if(object.size>MAX_PDF_BYTES+28)throw new Error("Invalid stored document size");
 const sealed=new Uint8Array(await object.arrayBuffer());
 const result=await crypto.subtle.decrypt({name:"AES-GCM",iv:sealed.subarray(0,12),additionalData:new TextEncoder().encode(key)},await fileKey(row.document_secret),sealed.subarray(12));
 if(result.byteLength>MAX_PDF_BYTES)throw new Error("Invalid stored document");
 return new Uint8Array(result);
}
export async function getApplication(env,id) {
 await ensureApplications(env);
 const row=await env.DB.prepare("SELECT * FROM candidatures WHERE id = ?").bind(id).first();
 return row?{...row,documents:await applicationDocuments(env,row)}:null;
}
export async function applicationRateLimit(env,ip) {
 const hour=Math.floor(Date.now()/3600000);
 const hash=Buffer.from(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(ip))).toString("hex");
 const row=await env.DB.prepare("INSERT INTO candidature_limits(cle,compteur,heure) VALUES(?,1,?) ON CONFLICT(cle) DO UPDATE SET compteur=compteur+1 RETURNING compteur").bind(`${hour}:${hash}`,hour).first();
 if(row.compteur>5)throw new ApplicationError("Trop de candidatures envoyées. Réessayez dans une heure.",429);
}
export async function storeApplication(env,annonce,data,files) {
 let existing=await env.DB.prepare("SELECT * FROM candidatures WHERE request_id = ? OR (annonce_id = ? AND email = ?)").bind(data.request_id,annonce.id,data.email).first();
 if(existing && existing.email===data.email && existing.annonce_id===annonce.id && existing.email_statut==="pending" && (existing.upload_statut==="failed" || (existing.upload_statut==="pending" && existing.cree_le<new Date(Date.now()-600000).toISOString()))){
  const keys=await applicationDocumentKeys(env,existing);
  if(keys.length)await env.UPLOADS.delete(keys);
  await env.DB.batch([env.DB.prepare("DELETE FROM candidature_dossiers WHERE candidature_id=?").bind(existing.id),env.DB.prepare("DELETE FROM candidatures WHERE id=? AND upload_statut!='ready' AND email_statut='pending'").bind(existing.id)]);
  existing=null;
 }
 if(existing){if(existing.upload_statut==="ready" && existing.email===data.email && existing.annonce_id===annonce.id && existing.request_id===data.request_id)return {row:existing,created:false};throw new ApplicationError(existing.upload_statut==="ready"?"Une candidature existe déjà pour cette offre et cet email. Contactez le cabinet pour la modifier.":"Un envoi est déjà en cours. Réessayez dans quelques instants.",409);}
 const id=crypto.randomUUID(),now=new Date(),expires=new Date(now.getTime()+30*86400000).toISOString();
 const documents=files.map(file=>({id:file.id,label:file.label,key:`${APPLICATION_PREFIX}${id}/${file.id}.bin`}));
 const cvKey=documents.find(doc=>doc.id==="cv")?.key||"",letterKey=documents.find(doc=>doc.id==="lettre")?.key||"";
 const secret=Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
 const bytes=files.reduce((sum,file)=>sum+file.bytes.byteLength+28,0);
 const values=[id,data.request_id,annonce.id,annonce.titre,data.nom,data.email,data.telephone,data.message,cvKey,letterKey,secret,bytes,now.toISOString(),expires];
 const inserted=await env.DB.prepare(`INSERT INTO candidatures(id,request_id,annonce_id,offre_titre,nom,email,telephone,message,cv_key,lettre_key,document_secret,octets,cree_le,expire_le)
 SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT COALESCE(SUM(octets),0) FROM candidatures WHERE documents_supprimes=0)+?<=? ON CONFLICT DO NOTHING`).bind(...values,bytes,APPLICATION_BUDGET).run();
 if(!inserted.meta?.changes){const duplicate=await env.DB.prepare("SELECT * FROM candidatures WHERE annonce_id=? AND email=? AND upload_statut='ready'").bind(annonce.id,data.email).first();if(duplicate)throw new ApplicationError("Une candidature existe déjà pour cette offre et cet email.",409);throw new ApplicationError("La réception des candidatures est temporairement indisponible. Contactez le cabinet.",503);}
 try {
  await env.DB.prepare("INSERT INTO candidature_dossiers(candidature_id,documents_json) VALUES(?,?)").bind(id,JSON.stringify(documents)).run();
  for(let i=0;i<files.length;i++){const key=documents[i].key;await env.UPLOADS.put(key,await encryptFile(secret,key,files[i].bytes),{httpMetadata:{contentType:"application/octet-stream"}});}
  await env.DB.prepare("UPDATE candidatures SET upload_statut='ready' WHERE id=?").bind(id).run();
 }catch{
  try{if(documents.length)await env.UPLOADS.delete(documents.map(doc=>doc.key));await env.DB.batch([env.DB.prepare("DELETE FROM candidature_dossiers WHERE candidature_id=?").bind(id),env.DB.prepare("DELETE FROM candidatures WHERE id=?").bind(id)]);}
  catch{await env.DB.prepare("UPDATE candidatures SET upload_statut='failed',expire_le=? WHERE id=?").bind(new Date().toISOString(),id).run();}
  throw new ApplicationError("Les documents n’ont pas pu être enregistrés. Réessayez.",503);
 }
 return {row:await env.DB.prepare("SELECT * FROM candidatures WHERE id=?").bind(id).first(),created:true};
}
export async function notifyApplication(env,row) {
 const now=new Date().toISOString();
 if(row.documents_supprimes || row.expire_le<=now || row.upload_statut!=="ready")throw new ApplicationError("Les documents ne sont plus disponibles.",410);
 const claim=await env.DB.prepare("UPDATE candidatures SET email_statut='sending',email_lock_le=? WHERE id=? AND (email_statut IN ('pending','failed') OR (email_statut='sending' AND email_lock_le<?))").bind(new Date(Date.now()+120000).toISOString(),row.id,now).run();
 if(!claim.meta?.changes)return false;
 try {
  const documents=await applicationDocuments(env,row),attachments=[];
  const dossier={...row,documents};
  for(const doc of documents)attachments.push({name:applicationDocumentFilename(doc),bytes:await applicationDocument(env,dossier,doc.id)});
  const message={nom:row.nom,email:row.email,sujet:`Candidature — ${row.offre_titre}`,message:`Poste : ${row.offre_titre}\nTéléphone : ${row.telephone||"Non renseigné"}\nRéférence : ${row.id}\n\n${row.message||(attachments.length?"Documents de candidature en pièces jointes.":"Candidature sans pièce jointe.")}`,attachments};
  if(isBrevoConfigured(env))await sendBrevo(env,message);
  else if(await isGmailConnected(env))await sendGmail(env,message);
  else throw new Error("No application email provider configured");
  await env.DB.prepare("UPDATE candidatures SET email_statut='sent',email_envoye_le=?,email_lock_le=NULL WHERE id=?").bind(new Date().toISOString(),row.id).run();
  return true;
 }catch{
  await env.DB.prepare("UPDATE candidatures SET email_statut='failed',email_lock_le=NULL WHERE id=?").bind(row.id).run();
  return false;
 }
}
export async function cleanupApplications(env) {
 await ensureApplications(env);
 const now=new Date().toISOString();let removed=0;
 for(let page=0;page<4;page++){
  const {results}=await env.DB.prepare("SELECT c.id,c.cv_key,c.lettre_key,d.documents_json FROM candidatures c LEFT JOIN candidature_dossiers d ON d.candidature_id=c.id WHERE c.documents_supprimes=0 AND c.expire_le<=? AND (c.email_statut!='sending' OR c.email_lock_le<?) LIMIT 100").bind(now,now).all();
  if(!results.length)break;
  const keys=[];for(const row of results)keys.push(...await applicationDocumentKeys(env,row));
  if(keys.length)await env.UPLOADS.delete(keys);
  await env.DB.prepare(`UPDATE candidatures SET documents_supprimes=1,document_secret='' WHERE id IN (${results.map(()=>"?").join(",")})`).bind(...results.map(row=>row.id)).run();
  removed+=results.length;
 }
 await env.DB.prepare("DELETE FROM candidature_limits WHERE heure<?").bind(Math.floor(Date.now()/3600000)-24).run();
 return removed;
}
