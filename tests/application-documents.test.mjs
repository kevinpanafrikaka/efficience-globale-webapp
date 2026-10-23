import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { adminRuntime } from "./helpers/admin-runtime.mjs";
import { validateAdminContent } from "../src/lib/admin-input.mjs";
import { applicationRequirements,validateApplicationDocuments,applicationDocumentFilename } from "../src/lib/application-documents.mjs";
import { buildMime } from "../src/lib/gmail.mjs";
const origin="https://example.org",pdf=Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF");
const offer={titre:"Mission de conseil",texte:"Offre",date:"2026-10-23",categorie:"recrutement",statut:"publie"};
const settings=[{id:"cv",label:"CV",required:false},{id:"lettre",label:"Lettre de motivation",required:true},{id:"diplome",label:"Diplôme",required:true}];
const context=id=>({params:Promise.resolve({id,slug:id})});
function send(id,files={},extra={}){const form=new FormData();for(const [key,value] of Object.entries({nom:"Candidate",email:"candidate@example.net",request_id:randomUUID(),...extra}))form.set(key,value);for(const [key,value] of Object.entries(files))form.append(key,value);return new Request(`${origin}/api/candidatures/${id}`,{method:"POST",headers:{origin,"cf-connecting-ip":"192.0.2.1"},body:form});}
const file=()=>new File([pdf],"document.pdf",{type:"application/pdf"});
async function setup(docs=settings,options={}){const mails=[];const r=await adminRuntime({fetcher:async(url,opts)=>{mails.push(JSON.parse(opts.body));return Response.json({messageId:"ok"},{status:201});},...options});Object.assign(r.env,{BREVO_API_KEY:"test",BREVO_SENDER_EMAIL:"site@example.org"});const db=await r.module("src/lib/db.js"),id=await db.createAnnonce({...offer,documents_candidature:docs}),api=await r.module("src/app/api/candidatures/[slug]/route.js"),core=await r.module("src/lib/candidatures.mjs");return {r,db,id,api,core,mails};}

test("Document settings validate names, flags, unique identifiers and reserved form fields",()=>{
 assert.deepEqual(applicationRequirements(),[{id:"cv",label:"CV",required:true},{id:"lettre",label:"Lettre de motivation",required:false}]);
 for(const bad of [null,[],[...settings,...settings], [{id:"nom",label:"Nom",required:true}],[{id:"constructor",label:"Test",required:true}],[{id:"../file",label:"Test",required:true}],[{id:"test",label:"",required:true}],[{id:"test",label:"X\nBcc",required:true}],[{id:"test",label:"Test",required:"false"}], [{id:"a",label:"CV",required:true},{id:"b",label:" cv ",required:false}]])assert.throws(()=>validateApplicationDocuments(bad));
 assert.throws(()=>validateAdminContent("annonces",{...offer,documents_candidature:[]}));
 assert.equal(validateAdminContent("annonces",{...offer,documents_candidature:settings}).documents_candidature[2].label,"Diplôme");
 assert.match(applicationDocumentFilename({id:"diplome",label:'Diplôme "spécialisé"'}),/^[A-Za-z0-9_-]+\.pdf$/);
});

test("Admin create/edit stores independent document requirements and older offers retain their defaults",async()=>{
 const {r,db,id}=await setup();try{
 const old=await db.createAnnonce({...offer,titre:"Ancienne offre"});assert.equal((await db.getAnnonceById(old)).documents_candidature[0].required,true);
 const create=await r.module("src/app/api/admin/annonces/route.js");
 const response=await create.POST(new Request(origin,{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify({...offer,titre:"Nouvelle offre",documents_candidature:[settings[2]]})}));assert.equal(response.status,200);const created=(await response.json()).id;
 assert.equal((await db.getAnnonceBySlug(created)).documents_candidature[0].label,"Diplôme");
 const edit=await r.module("src/app/api/admin/annonces/[id]/route.js");
 assert.equal((await edit.PUT(new Request(origin,{method:"PUT",headers:{origin,"content-type":"application/json"},body:JSON.stringify({...offer,documents_candidature:[{id:"lettre",label:"Motivation",required:false}]})}),context(id))).status,200);
 assert.deepEqual(JSON.parse(JSON.stringify((await db.getAnnonceById(id)).documents_candidature)),[{id:"lettre",label:"Motivation",required:false}]);
 await db.updateAnnonce(id,{...offer,titre:"Titre corrigé"});assert.equal((await db.getAnnonceById(id)).documents_candidature[0].label,"Motivation");
 assert.equal((await db.getAnnonceById(created)).documents_candidature[0].label,"Diplôme");
 await db.deleteAnnonce(created);assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM annonce_dossiers WHERE annonce_id=?").get(created).n,0);
 }finally{r.close();}
});

test("Custom mandatory documents are enforced server-side and optional CVs can be omitted",async()=>{
 const {r,id,api,mails}=await setup();try{
 const missing=await api.POST(send(id,{cv:file()}),context(id));assert.equal(missing.status,400);assert.match((await missing.json()).error,/Lettre de motivation/);
 assert.equal((await api.POST(send(id,{lettre:file(),diplome:file(),unrequested:file()}),context(id))).status,400);
 const request=send(id,{lettre:file(),diplome:file()});const receipt=await api.POST(request,context(id));assert.equal(receipt.status,200);
 const row=r.sqlite.prepare("SELECT * FROM candidatures").get();assert.equal(row.cv_key,"");assert.equal(row.email_statut,"sent");assert.equal(r.files.size,2);
 assert.equal(mails[0].attachment.length,2);assert.match(mails[0].attachment[1].name,/Diplome/);for(const doc of mails[0].attachment)assert.deepEqual(Buffer.from(doc.content,"base64"),pdf);
 const page=await r.module("src/app/(public)/annonces/[slug]/postuler/page.js");const html=renderToStaticMarkup(await page.default(context(id)));assert.match(html,/Diplôme/);assert.match(html,/Facultatif/);
 }finally{r.close();}
});

test("Received document labels and private downloads survive edits and deletion of the original offer",async()=>{
 const {r,id,db,api,core}=await setup();try{
 const requestId=randomUUID();await api.POST(send(id,{lettre:file(),diplome:file()},{request_id:requestId}),context(id));let row=r.sqlite.prepare("SELECT * FROM candidatures").get();
 await db.updateAnnonce(id,{...offer,documents_candidature:[{id:"newdoc",label:"Nouvelle pièce",required:true}]});
 assert.equal((await api.POST(send(id,{}, {request_id:requestId}),context(id))).status,200);
 await db.deleteAnnonce(id);row=await core.getApplication(r.env,row.id);assert.equal(row.documents[1].label,"Diplôme");
 const download=await r.module("src/app/api/admin/candidatures/[id]/documents/[type]/route.js");const response=await download.GET(new Request(origin),{params:Promise.resolve({id:row.id,type:"diplome"})});assert.equal(response.status,200);assert.deepEqual(Buffer.from(await response.arrayBuffer()),pdf);assert.match(response.headers.get("content-disposition"),/Diplome/);assert.equal(response.headers.get("cache-control"),"private, no-store");
 assert.equal((await download.GET(new Request(origin),{params:Promise.resolve({id:row.id,type:"newdoc"})})).status,404);
 const page=await r.module("src/app/admin/candidatures/[id]/page.js");assert.match(renderToStaticMarkup(await page.default(context(row.id))),/Diplôme/);
 const actions=await r.module("src/app/api/admin/candidatures/[id]/route.js");assert.equal((await actions.DELETE(new Request(origin,{method:"DELETE",headers:{origin}}),context(row.id))).status,200);assert.equal(r.files.size,0);assert.equal(r.sqlite.prepare("SELECT count(*) n FROM candidature_dossiers").get().n,0);
 }finally{r.close();}
});

test("All-optional settings allow submission without attachments or a hidden CV requirement",async()=>{
 const {r,id,api,core,mails}=await setup([{id:"portfolio",label:"Portfolio",required:false}]);try{
 assert.equal((await api.POST(send(id),context(id))).status,200);const row=await core.getApplication(r.env,r.sqlite.prepare("SELECT id FROM candidatures").get().id);assert.equal(row.octets,0);assert.equal(row.documents.length,0);assert.equal(row.email_statut,"sent");assert.equal(mails[0].attachment,undefined);
 const page=await r.module("src/app/admin/candidatures/[id]/page.js");assert.match(renderToStaticMarkup(await page.default(context(row.id))),/Aucun document joint/);
 }finally{r.close();}
});

test("Five custom PDF attachments are counted, encrypted and removed by expiry cleanup",async()=>{
 const docs=Array.from({length:5},(_,i)=>({id:`piece${i}`,label:`Pièce ${i}`,required:true}));
 const {r,id,api,core,mails}=await setup(docs);try{
 assert.equal((await api.POST(send(id,Object.fromEntries(docs.map(doc=>[doc.id,file()]))),context(id))).status,200);const row=await core.getApplication(r.env,r.sqlite.prepare("SELECT id FROM candidatures").get().id);
 assert.equal(row.octets,5*(pdf.byteLength+28));assert.equal(r.files.size,5);assert.equal(mails[0].attachment.length,5);
 const mime=buildMime({nom:"Test",email:"candidate@example.net",message:"Test",attachments:docs.map(doc=>({name:applicationDocumentFilename(doc),bytes:pdf}))});assert.equal((mime.match(/Content-Disposition: attachment/g)||[]).length,5);
 r.files.set("site-photo.jpg",pdf);r.sqlite.prepare("UPDATE candidatures SET expire_le='2000-01-01'").run();assert.equal(await core.cleanupApplications(r.env),1);assert.equal(r.files.size,1);assert.ok(r.files.has("site-photo.jpg"));assert.equal(r.sqlite.prepare("SELECT document_secret FROM candidatures").get().document_secret,"");
 }finally{r.close();}
});

test("Partial upload failures remove every custom file and its document manifest",async()=>{
 const {r,id,api}=await setup(settings.map(doc=>({...doc,required:true})));try{
 const put=r.env.UPLOADS.put;let count=0;r.env.UPLOADS.put=async(...args)=>{if(++count===3)throw Error("Storage failure");return put(...args);};
 assert.equal((await api.POST(send(id,{cv:file(),lettre:file(),diplome:file()}),context(id))).status,503);assert.equal(r.files.size,0);assert.equal(r.sqlite.prepare("SELECT count(*) n FROM candidatures").get().n,0);assert.equal(r.sqlite.prepare("SELECT count(*) n FROM candidature_dossiers").get().n,0);
 }finally{r.close();}
});

test("Existing private CV and letter copies still download when no manifest was recorded",async()=>{
 const {r,id,api,core}=await setup(applicationRequirements());try{
 await api.POST(send(id,{cv:file(),lettre:file()}),context(id));r.sqlite.prepare("DELETE FROM candidature_dossiers").run();const row=r.sqlite.prepare("SELECT * FROM candidatures").get();assert.deepEqual(Buffer.from(await core.applicationDocument(r.env,row,"cv")),pdf);assert.deepEqual(Buffer.from(await core.applicationDocument(r.env,row,"lettre")),pdf);
 }finally{r.close();}
});
