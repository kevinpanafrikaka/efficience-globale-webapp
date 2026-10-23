import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { adminRuntime } from "./helpers/admin-runtime.mjs";
import { validateAdminContent } from "../src/lib/admin-input.mjs";
import { announcementFacts,validateAnnouncementInfo,announcementResource } from "../src/lib/announcement-fields.mjs";
const origin="https://example.org",base={titre:"Annonce",texte:"Contenu conservé.",date:"2026-10-23",statut:"publie"};
const pdf=Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF");
const context=id=>({params:Promise.resolve({id,slug:id})});
const json=(data,method="POST")=>new Request(origin,{method,headers:{origin,"content-type":"application/json"},body:JSON.stringify(data)});
function upload(file=new File([pdf],"Rapport.pdf",{type:"application/pdf"}),requestOrigin=origin){const form=new FormData();form.set("file",file);return new Request(origin,{method:"POST",headers:{origin:requestOrigin},body:form});}
const training={date_debut:"2026-11-15",date_fin:"2026-11-16",heure_debut:"09:00",heure_fin:"17:30",duree:"Deux jours",public:"Équipes de projets",tarif:"500 000 GNF",format:"hybride",plateforme:"Google Meet"};

test("Type-specific information validates dates, times, ranges and resource URLs on the server",()=>{
 assert.equal(validateAdminContent("annonces",{...base,categorie:"formation",echeance:"2026-11-14",informations:{formation:training}}).informations.formation.format,"hybride");
 for(const bad of [{date_debut:"2026-02-30"},{date_debut:"2026-11-15",date_fin:"2026-11-14"},{date_fin:"2026-11-15"},{heure_debut:"25:00"},{heure_fin:"12:00"},{heure_debut:"18:00",heure_fin:"09:00"},{format:"unknown"}])assert.throws(()=>validateAnnouncementInfo("formation",{formation:bad}));
 assert.throws(()=>validateAnnouncementInfo("formation",{formation:training},"2026-11-17"));
 assert.throws(()=>validateAdminContent("annonces",{...base,categorie:"evenement",informations:{evenement:{date_activite:"2026-13-01"}}}));
 for(const source_url of ["javascript:alert(1)","mailto:someone@example.org","//evil.example"])assert.throws(()=>validateAnnouncementInfo("publication",{publication:{support:"lien",source_url}}));
 assert.throws(()=>validateAnnouncementInfo("publication",{publication:{fichier_url:"/uploads/private-applications/cv.pdf"}}));
 assert.throws(()=>validateAnnouncementInfo("publication",{publication:{nature:"fake"}}));
 assert.equal(validateAnnouncementInfo("actualite",{actualite:{concernes:" Partenaire "},formation:{date_debut:"partial"}}).actualite.concernes,"Partenaire");
 assert.deepEqual(announcementFacts({categorie:"publication"}),[]);assert.deepEqual(announcementFacts({categorie:"formation"}),[]);
});

test("Specific information survives edits, type changes and legacy saves while inactive fields stay private",async()=>{
 const r=await adminRuntime();try{
 const create=await r.module("src/app/api/admin/annonces/route.js"),edit=await r.module("src/app/api/admin/annonces/[id]/route.js"),db=await r.module("src/lib/db.js");
 const response=await create.POST(json({...base,categorie:"formation",lieu:"Conakry",informations:{formation:training}}));assert.equal(response.status,200);const {id}=await response.json();
 assert.equal((await db.getAnnonceById(id)).informations.formation.heure_fin,"17:30");
 assert.equal((await edit.PUT(json({...base,categorie:"evenement",informations:{evenement:{date_activite:"2026-10-20",bilan:"Compte rendu réel"}}}),context(id))).status,200);
 let row=await db.getAnnonceById(id);assert.equal(row.informations.formation.tarif,training.tarif);assert.equal(row.informations.evenement.bilan,"Compte rendu réel");
 const visible=await db.getAnnonceBySlug(id);assert.equal(visible.informations.formation,undefined);assert.equal((await db.getAnnonces())[0].informations.formation,undefined);
 await edit.PUT(json({...base,categorie:"evenement",texte:"Texte corrigé"}),context(id));row=await db.getAnnonceById(id);assert.equal(row.informations.evenement.bilan,"Compte rendu réel");assert.equal(row.texte,"Texte corrigé");
 await edit.PUT(json({...base,categorie:"evenement",informations:{evenement:{bilan:""}}}),context(id));assert.equal((await db.getAnnonceById(id)).informations.evenement.bilan,"");
 await db.deleteAnnonce(id);assert.equal(r.sqlite.prepare("SELECT count(*) n FROM annonce_informations").get().n,0);
 }finally{r.close();}
});

test("Each public article renders its own facts, separates publication dates and preserves authored text",async()=>{
 const r=await adminRuntime();try{
 const db=await r.module("src/lib/db.js"),Page=(await r.module("src/app/(public)/annonces/[slug]/page.js")).default;
 const cases=[
  {categorie:"recrutement",informations:{recrutement:{poste:"Chargé de projets"}},expect:["Poste","Chargé de projets"]},
  {categorie:"formation",informations:{formation:training},expect:["15 novembre 2026","16 novembre 2026","09 h 00 – 17 h 30","Deux jours","Équipes de projets","Hybride","Google Meet","500 000 GNF"]},
  {categorie:"evenement",echeance:"2000-01-01",informations:{evenement:{date_activite:"2026-10-20",intervenants:"Équipe du cabinet",bilan:"Un bilan <script>alerte</script>"}},expect:["20 octobre 2026","Équipe du cabinet","Bilan et points à retenir","&lt;script&gt;alerte&lt;/script&gt;"]},
  {categorie:"actualite",informations:{actualite:{concernes:"Partenaire local"}},expect:["Partenaire local"]},
  {categorie:"publication",informations:{publication:{nature:"etude",date_document:"2026-09-15",auteurs:"Équipe EG",support:"lien",source_url:"https://example.org/etude"}},expect:["Étude","15 septembre 2026","Équipe EG","Lire la publication",'href="https://example.org/etude"']},
 ];
 for(const data of cases){const id=await db.createAnnonce({...base,...data,titre:data.categorie});const html=renderToStaticMarkup(await Page(context(id)));for(const word of [...data.expect,"Contenu conservé.","23 octobre 2026"])assert.ok(html.includes(word),`${data.categorie}: ${word}`);if(data.categorie==="evenement")assert.doesNotMatch(html,/date limite est dépassée|<script>/);}
 }finally{r.close();}
});

test("Publications select one PDF or external action and do not invent resources for older announcements",()=>{
 const url=`/documents/${randomUUID()}`;
 assert.equal(announcementResource({categorie:"publication",informations:{publication:{support:"pdf",fichier_url:url,source_url:"https://example.org"}}}).url,url);
 assert.equal(announcementResource({categorie:"publication",informations:{publication:{support:"lien",fichier_url:url,source_url:"https://example.org"}}}).url,"https://example.org");
 assert.equal(announcementResource({categorie:"publication"}),null);assert.equal(announcementResource({categorie:"actualite",informations:{publication:{support:"pdf",fichier_url:url}}}),null);
});

test("Publication PDF upload rejects unauthenticated users and foreign origins before storing files",async()=>{
 const unauth=await adminRuntime({authenticated:false});try{const route=await unauth.module("src/app/api/admin/publications/document/route.js"),reads=unauth.reads;assert.equal((await route.POST(upload())).status,401);assert.equal(unauth.reads,reads);assert.equal(unauth.files.size,0);}finally{unauth.close();}
 const r=await adminRuntime();try{const route=await r.module("src/app/api/admin/publications/document/route.js");assert.equal((await route.POST(upload(undefined,"https://evil.example"))).status,403);assert.equal(r.files.size,0);}finally{r.close();}
});

test("Publication PDFs validate their signature and size and remain available for admin preview",async()=>{
 const r=await adminRuntime();try{
 const route=await r.module("src/app/api/admin/publications/document/route.js");
 for(const invalid of [new File(["not PDF"],"wrong.pdf",{type:"application/pdf"}),new File([pdf],"wrong.png",{type:"image/png"}),new File([new Uint8Array(8*1024*1024+1)],"large.pdf",{type:"application/pdf"})])assert.ok((await route.POST(upload(invalid))).status>=400);
 const response=await route.POST(upload());assert.equal(response.status,200);const data=await response.json();assert.match(data.url,/^\/documents\/[a-f0-9-]+$/);assert.equal(data.nom,"Rapport.pdf");assert.equal(r.files.size,1);
 const download=await r.module("src/app/documents/[id]/route.js");const result=await download.GET(new Request(origin),context(data.url.split("/").at(-1)));assert.equal(result.status,200);assert.equal(result.headers.get("content-type"),"application/pdf");assert.match(result.headers.get("cache-control"),/no-store/);assert.deepEqual(Buffer.from(await result.arrayBuffer()),pdf);
 const headersOnly=new Request(origin,{method:"POST",headers:{origin,"content-length":String(10*1024*1024)}});assert.equal((await route.POST(headersOnly)).status,413);
 }finally{r.close();}
});

test("A publication PDF is public only while its matching announcement and PDF support are published",async()=>{
 const r=await adminRuntime({authenticated:false});try{
 const uuid=randomUUID(),url=`/documents/${uuid}`,key=`publication-documents/${uuid}.pdf`;r.files.set(key,pdf);
 const db=await r.module("src/lib/db.js"),route=await r.module("src/app/documents/[id]/route.js");
 const data={...base,categorie:"publication",informations:{publication:{nature:"rapport",support:"pdf",fichier_url:url}}},id=await db.createAnnonce({...data,statut:"brouillon"});
 let gets=0;const get=r.env.UPLOADS.get;r.env.UPLOADS.get=async(...args)=>{gets++;return get(...args);};
 assert.equal((await route.GET(new Request(origin),context(uuid))).status,404);assert.equal(gets,0);
 await db.updateAnnonce(id,data);assert.equal((await route.GET(new Request(origin),context(uuid))).status,200);
 const raw=await r.module("src/app/uploads/[...key]/route.js");assert.equal((await raw.GET(new Request(origin),{params:Promise.resolve({key:key.split("/")})})).status,404);
 await db.updateAnnonce(id,{...data,informations:{publication:{support:"lien",source_url:"https://example.org",fichier_url:url}}});assert.equal((await route.GET(new Request(origin),context(uuid))).status,404);
 await db.updateAnnonce(id,{...data,categorie:"actualite"});assert.equal((await route.GET(new Request(origin),context(uuid))).status,404);
 }finally{r.close();}
});

test("Media management protects PDFs used in drafts or inactive settings and can delete unreferenced files",async()=>{
 const r=await adminRuntime();try{
 const uuid=randomUUID(),url=`/documents/${uuid}`,key=`publication-documents/${uuid}.pdf`;r.files.set(key,pdf);r.files.set("private-applications/secret/cv.bin",pdf);
 const db=await r.module("src/lib/db.js"),id=await db.createAnnonce({...base,categorie:"publication",statut:"brouillon",informations:{publication:{support:"pdf",fichier_url:url}}});
 const route=await r.module("src/app/api/admin/medias/route.js");assert.equal((await route.DELETE(json({key},"DELETE"))).status,409);
 await db.updateAnnonce(id,{...base,categorie:"actualite"});assert.equal((await route.DELETE(json({key},"DELETE"))).status,409);
 const Page=(await r.module("src/app/admin/medias/page.js")).default;const html=renderToStaticMarkup(await Page());assert.match(html,/Document PDF/);assert.match(html,new RegExp(url));assert.doesNotMatch(html,/private-applications/);
 await db.updateAnnonce(id,{...base,categorie:"publication",informations:{publication:{support:"pdf",fichier_url:""}}});assert.equal((await route.DELETE(json({key},"DELETE"))).status,200);assert.ok(!r.files.has(key));assert.ok(r.files.has("private-applications/secret/cv.bin"));
 }finally{r.close();}
});
