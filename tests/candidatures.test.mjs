import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { adminRuntime } from "./helpers/admin-runtime.mjs";
import { buildMime } from "../src/lib/gmail.mjs";
import { sendBrevo } from "../src/lib/brevo.mjs";
import { announcementApplicationPath } from "../src/lib/announcements.mjs";
const pdf=Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF");
const base="https://example.org";
function request(slug,extra={}){const f=new FormData();for(const [k,v] of Object.entries({nom:"Candidate Test",email:"candidate@example.net",telephone:"+224 600 000 000",message:"Ma motivation",request_id:randomUUID(),...extra}))if(v!==null)f.set(k,v);if(!f.has("cv"))f.set("cv",new File([pdf],"CV.pdf",{type:"application/pdf"}));return new Request(`${base}/api/candidatures/${slug}`,{method:"POST",headers:{origin:base,"cf-connecting-ip":"192.0.2.1"},body:f});}
async function setup(options={}){const mails=[];const r=await adminRuntime({fetcher:async(url,opts)=>{mails.push({url,body:JSON.parse(opts.body)});return Response.json(options.mailFails?{}:{messageId:"accepted"},{status:options.mailFails?503:201});},...options});Object.assign(r.env,{BREVO_API_KEY:"test",BREVO_SENDER_EMAIL:"site@example.org"});const db=await r.module("src/lib/db.js");const id=await db.createAnnonce({titre:"Chargé de projets",texte:"Offre",date:"2026-10-23",categorie:"recrutement",statut:"publie"});const api=await r.module("src/app/api/candidatures/[slug]/route.js"),core=await r.module("src/lib/candidatures.mjs");return {r,id,api,core,mails};}
const params=id=>({params:Promise.resolve({id})});

test("Announcements and dossiers share one sidebar entry without a duplicate global application tab",async()=>{
 for(const pathname of ["/admin/annonces","/admin/candidatures","/admin/candidatures/dossier"]){
  const r=await adminRuntime({pathname});try{
   const Shell=(await r.module("src/components/admin/AdminShell.jsx")).default;
   const html=renderToStaticMarkup((await import("react")).createElement(Shell,{unread:0}));
   const sidebar=html.match(/<nav aria-label="Administration"[^>]*>([\s\S]*?)<\/nav>/)[1];
   assert.match(sidebar,/href="\/admin\/annonces" aria-current="page"/);
   assert.doesNotMatch(sidebar,/href="\/admin\/candidatures"/);
   assert.doesNotMatch(html,/announcement-admin-tabs|Les candidatures/);
   assert.equal((html.match(/<h1/g)||[]).length,1);
  }finally{r.close();}
 }
});

test("Application offer and status filters combine without mixing dossiers or dropping saved offers",async()=>{
 const r=await adminRuntime();try{
  const db=await r.module("src/lib/db.js"),core=await r.module("src/lib/candidatures.mjs");await core.ensureApplications(r.env);
  const offer1=await db.createAnnonce({titre:"Offre A",texte:"Texte",date:"2026-10-27",categorie:"recrutement",statut:"publie"});
  const offer2=await db.createAnnonce({titre:"Offre B",texte:"Texte",date:"2026-10-27",categorie:"recrutement",statut:"publie"});
  const add=r.sqlite.prepare("INSERT INTO candidatures(id,request_id,annonce_id,offre_titre,nom,email,cv_key,document_secret,octets,cree_le,expire_le,upload_statut,statut) VALUES(?,?,?,?,?,?,'','',0,'2026-10-27','2026-11-27','ready',?)");
  add.run("a1","r1",offer1,"Offre A","Candidate retenue","a@example.org","retenue");
  add.run("a2","r2",offer1,"Offre A","Candidate nouvelle","b@example.org","nouvelle");
  add.run("b1","r3",offer2,"Offre B","Autre dossier","c@example.org","retenue");
  const page=(await r.module("src/app/admin/candidatures/page.js")).default;
  const html=renderToStaticMarkup(await page({searchParams:Promise.resolve({annonce:offer1,statut:"retenue"})}));
  assert.match(html,/Candidate retenue/);assert.doesNotMatch(html,/Candidate nouvelle|Autre dossier/);
  assert.match(html,/Retour aux offres/);assert.match(html,/Offre A/);assert.match(html,/Ouvrir le dossier/);
  assert.doesNotMatch(html,/a@example.org|Email transmis|Conservation :|Offre de recrutement/);
  assert.ok(html.includes(`annonce=${offer1}`));assert.ok(html.includes('statut=nouvelle'));
  const filter=(await r.module("src/components/admin/ApplicationOfferFilter.jsx")).default;
  assert.match(renderToStaticMarkup((await import("react")).createElement(filter,{offers:[{value:offer1,label:"Offre A"}],offer:offer2})),/Offre sélectionnée/);
 }finally{r.close();}
});

test("A candidature stores encrypted PDFs, sends both attachments to Oumar, and exact retries do not resend",async()=>{
 const {r,id,api,core,mails}=await setup();try{
 const key=randomUUID(),extra={request_id:key,lettre:new File([pdf],"motivation.pdf",{type:"application/pdf"})};
 assert.equal((await api.POST(request(id,extra),{params:Promise.resolve({slug:id})})).status,200);
 const row=r.sqlite.prepare("SELECT * FROM candidatures").get();assert.equal(row.email_statut,"sent");assert.equal(row.upload_statut,"ready");assert.equal(r.files.size,2);
 for(const bytes of r.files.values())assert.notEqual(Buffer.from(bytes).subarray(0,5).toString(),"%PDF-");
 assert.deepEqual(Buffer.from(await core.applicationDocument(r.env,row,"cv")),pdf);
 assert.equal(mails.length,1);assert.equal(mails[0].body.to[0].email,"oumar.camara@efficienceglobale.com");assert.equal(mails[0].body.replyTo.email,"candidate@example.net");
 assert.deepEqual(mails[0].body.attachment.map(x=>x.name),["CV.pdf","Lettre-motivation.pdf"]);for(const a of mails[0].body.attachment)assert.deepEqual(Buffer.from(a.content,"base64"),pdf);
 assert.equal((await api.POST(request(id,extra),{params:Promise.resolve({slug:id})})).status,200);assert.equal(mails.length,1);assert.equal(r.sqlite.prepare("SELECT count(*) n FROM candidatures").get().n,1);
 const duplicate=await api.POST(request(id),{params:Promise.resolve({slug:id})});assert.equal(duplicate.status,409);
 }finally{r.close();}
});

test("Unauthenticated readers cannot access private documents or candidate pages, including through uploads",async()=>{
 const {r,id,api}=await setup({authenticated:false});try{
 await api.POST(request(id),{params:Promise.resolve({slug:id})});const row=r.sqlite.prepare("SELECT * FROM candidatures").get();
 const docs=await r.module("src/app/api/admin/candidatures/[id]/documents/[type]/route.js"),actions=await r.module("src/app/api/admin/candidatures/[id]/route.js"),uploads=await r.module("src/app/uploads/[...key]/route.js");
 const before=r.reads;
 assert.equal((await docs.GET(new Request(base),{params:Promise.resolve({id:row.id,type:"cv"})})).status,401);
 for(const method of ["PUT","POST","DELETE"])assert.equal((await actions[method](new Request(base,{method}),params(row.id))).status,401);
 assert.equal(r.reads,before);
 assert.equal((await uploads.GET(new Request(base),{params:Promise.resolve({key:row.cv_key.split("/")})})).status,404);
 for(const file of ["src/app/admin/candidatures/page.js","src/app/admin/candidatures/[id]/page.js"]){const page=await r.module(file);assert.equal(await page.default({params:Promise.resolve({id:row.id}),searchParams:Promise.resolve({})}),null);}
 }finally{r.close();}
});

test("Download, status updates and deletion require a session and preserve the original attachment bytes",async()=>{
 const {r,id,api}=await setup();try{
 await api.POST(request(id),{params:Promise.resolve({slug:id})});const row=r.sqlite.prepare("SELECT * FROM candidatures").get();
 const docs=await r.module("src/app/api/admin/candidatures/[id]/documents/[type]/route.js"),actions=await r.module("src/app/api/admin/candidatures/[id]/route.js");
 const download=await docs.GET(new Request(base),{params:Promise.resolve({id:row.id,type:"cv"})});assert.equal(download.status,200);assert.deepEqual(Buffer.from(await download.arrayBuffer()),pdf);assert.equal(download.headers.get("cache-control"),"private, no-store");assert.match(download.headers.get("content-disposition"),/attachment/);
 const update=body=>new Request(base,{method:"PUT",headers:{origin:base,"content-type":"application/json"},body:JSON.stringify(body)});
 assert.equal((await actions.PUT(update({statut:"retenue"}),params(row.id))).status,200);assert.equal(r.sqlite.prepare("SELECT statut FROM candidatures").get().statut,"retenue");assert.equal((await actions.PUT(update({statut:"x"}),params(row.id))).status,400);
 assert.equal((await actions.DELETE(new Request(base,{method:"DELETE",headers:{origin:"https://evil.example"}}),params(row.id))).status,403);
 assert.equal((await actions.DELETE(new Request(base,{method:"DELETE",headers:{origin:base}}),params(row.id))).status,200);assert.equal(r.files.size,0);assert.equal(r.sqlite.prepare("SELECT count(*) n FROM candidatures").get().n,0);
 }finally{r.close();}
});

test("Cleanup removes only expired application copies, keeps records and site photos, and releases their storage budget",async()=>{
 const {r,id,api,core}=await setup();try{
 await api.POST(request(id),{params:Promise.resolve({slug:id})});const row=r.sqlite.prepare("SELECT * FROM candidatures").get();r.files.set("photo.jpg",Buffer.from("site image"));
 assert.equal(await core.cleanupApplications(r.env),0);assert.equal(r.files.size,2);
 r.sqlite.prepare("UPDATE candidatures SET expire_le='2000-01-01T00:00:00.000Z'").run();
 await assert.rejects(core.applicationDocument(r.env,row,"not-a-document"));const expired=r.sqlite.prepare("SELECT * FROM candidatures").get();await assert.rejects(core.applicationDocument(r.env,expired,"cv"));
 assert.equal(await core.cleanupApplications(r.env),1);assert.equal(r.files.size,1);assert.ok(r.files.has("photo.jpg"));assert.equal(r.sqlite.prepare("SELECT documents_supprimes FROM candidatures").get().documents_supprimes,1);assert.equal(r.sqlite.prepare("SELECT COALESCE(SUM(octets),0) n FROM candidatures WHERE documents_supprimes=0").get().n,0);
 assert.equal(await core.cleanupApplications(r.env),0);
 }finally{r.close();}
});

test("Provider failures keep the dossier, allow a deliberate retry, and do not fall back to another service",async()=>{
 let fail=true,sends=0;const {r,id,api,core}=await setup({fetcher:async()=>{sends++;return Response.json(fail?{}:{messageId:"ok"},{status:fail?503:201});}});try{
 assert.equal((await api.POST(request(id),{params:Promise.resolve({slug:id})})).status,200);const row=r.sqlite.prepare("SELECT * FROM candidatures").get();assert.equal(row.email_statut,"failed");assert.equal(r.files.size,1);assert.equal(sends,1);
 fail=false;assert.equal(await core.notifyApplication(r.env,row),true);assert.equal(sends,2);assert.equal(await core.notifyApplication(r.env,row),false);assert.equal(sends,2);
 }finally{r.close();}
});

test("Oversized, fake or missing PDFs, foreign origins, closed/draft offers and honeypots never create a dossier",async()=>{
 const {r,id,api,mails}=await setup();try{
 for(const extra of [{cv:"bad"},{cv:new File(["not a PDF"],"fake.pdf",{type:"application/pdf"})},{cv:new File([new Uint8Array(2*1024*1024+1)],"large.pdf",{type:"application/pdf"})}])assert.ok((await api.POST(request(id,extra),{params:Promise.resolve({slug:id})})).status>=400);
 const bad=request(id);bad.headers.set("origin","https://evil.example");assert.equal((await api.POST(bad,{params:Promise.resolve({slug:id})})).status,403);
 assert.equal((await api.POST(request(id,{site_web:"bot"}),{params:Promise.resolve({slug:id})})).status,200);
 r.sqlite.prepare("UPDATE annonce_details SET echeance='2000-01-01' WHERE annonce_id=?").run(id);assert.equal((await api.POST(request(id),{params:Promise.resolve({slug:id})})).status,410);
 r.sqlite.prepare("UPDATE annonces SET statut='brouillon' WHERE id=?").run(id);assert.equal((await api.POST(request(id),{params:Promise.resolve({slug:id})})).status,404);
 assert.equal(r.sqlite.prepare("SELECT count(*) n FROM candidatures").get().n,0);assert.equal(r.files.size,0);assert.equal(mails.length,0);
 }finally{r.close();}
});

test("Storage reservations cannot exceed the candidature budget and the intake is rate limited",async()=>{
 const {r,id,api,core}=await setup();try{
 await api.POST(request(id),{params:Promise.resolve({slug:id})});r.sqlite.prepare("UPDATE candidatures SET octets=?").run(core.APPLICATION_BUDGET);
 assert.equal((await api.POST(request(id,{email:"next@example.net"}),{params:Promise.resolve({slug:id})})).status,503);assert.equal(r.files.size,1);
 for(let i=0;i<4;i++)await api.POST(request(id,{email:`rate${i}@example.net`}),{params:Promise.resolve({slug:id})});
 assert.equal((await api.POST(request(id,{email:"limited@example.net"}),{params:Promise.resolve({slug:id})})).status,429);
 }finally{r.close();}
});

test("A failed second upload rolls back the partial dossier and its first document",async()=>{
 const {r,id,api}=await setup();try{
 const put=r.env.UPLOADS.put;let count=0;r.env.UPLOADS.put=async(...args)=>{if(++count===2)throw Error("storage unavailable");return put(...args);};
 const response=await api.POST(request(id,{lettre:new File([pdf],"lettre.pdf",{type:"application/pdf"})}),{params:Promise.resolve({slug:id})});assert.equal(response.status,503);assert.equal(r.files.size,0);assert.equal(r.sqlite.prepare("SELECT count(*) n FROM candidatures").get().n,0);
 }finally{r.close();}
});

test("Recruitment contact buttons lead to the application form while external recruitment tools and other categories keep their links",async()=>{
 assert.equal(announcementApplicationPath({categorie:"recrutement",slug:"stage",action_url:"https://portfolio.efficienceglobale.workers.dev/contact"}),"/annonces/stage/postuler");assert.equal(announcementApplicationPath({categorie:"recrutement",slug:"stage",action_url:"https://external.example/apply"}),"");assert.equal(announcementApplicationPath({categorie:"formation",slug:"formation"}),"");
 const {r,id}=await setup();try{const page=await r.module("src/app/(public)/annonces/[slug]/page.js");const html=renderToStaticMarkup(await page.default({params:Promise.resolve({slug:id})}));assert.match(html,new RegExp(`href="/annonces/${id}/postuler"`));
 const apply=await r.module("src/app/(public)/annonces/[slug]/postuler/page.js");assert.match(renderToStaticMarkup(await apply.default({params:Promise.resolve({slug:id})})),/Envoyer ma candidature/);
 const list=await r.module("src/app/admin/candidatures/page.js");assert.match(renderToStaticMarkup(await list.default({searchParams:Promise.resolve({})})),/Aucune candidature/);
 }finally{r.close();}
});

test("Gmail MIME contains valid multipart PDF attachments and safely encodes header-like text",()=>{
 const mime=buildMime({nom:"Candidate",email:"candidate@example.org",sujet:"Stage\r\nBcc: evil@example.org",message:"Ma lettre",attachments:[{name:"CV.pdf",bytes:pdf},{name:"Lettre-motivation.pdf",bytes:pdf}]});assert.match(mime,/Content-Type: multipart\/mixed/);assert.match(mime,/Content-Disposition: attachment; filename="CV.pdf"/);assert.match(mime,/Content-Disposition: attachment; filename="Lettre-motivation.pdf"/);assert.match(mime,/To: oumar.camara@efficienceglobale.com/);assert.doesNotMatch(mime,/\r\nBcc:/);assert.ok(mime.includes(pdf.toString("base64")));assert.throws(()=>buildMime({nom:"A",email:"candidate@example.org",message:"x",attachments:[{name:'bad".pdf',bytes:pdf}]}));
});

test("The configured Gmail connection sends a base64url MIME message with the actual PDF attachment",async()=>{
 let sends=0;const {r,id,api}=await setup({fetcher:async(url,options)=>{
  if(url==="https://oauth2.googleapis.com/token")return Response.json({access_token:"test-access"});
  assert.equal(url,"https://gmail.googleapis.com/gmail/v1/users/me/messages/send");assert.equal(options.headers.Authorization,"Bearer test-access");sends++;
  const mime=Buffer.from(JSON.parse(options.body).raw,"base64url").toString();assert.match(mime,/To: oumar.camara@efficienceglobale.com/);assert.match(mime,/Reply-To: candidate@example.net/);assert.match(mime,/filename="CV.pdf"/);assert.ok(mime.includes(pdf.toString("base64")));return Response.json({id:"test-gmail-id"});
 }});try{
 delete r.env.BREVO_API_KEY;Object.assign(r.env,{GOOGLE_CLIENT_ID:"test-client",GOOGLE_CLIENT_SECRET:"test-secret"});
 const gmail=await r.module("src/lib/gmail.mjs");await gmail.saveConnection(r.env,"test-refresh");
 assert.equal((await api.POST(request(id),{params:Promise.resolve({slug:id})})).status,200);assert.equal(sends,1);assert.equal(r.sqlite.prepare("SELECT email_statut FROM candidatures").get().email_statut,"sent");
 }finally{r.close();}
});

test("Deleting an announcement retains its received candidates and downloadable documents",async()=>{
 const {r,id,api,core}=await setup();try{
 await api.POST(request(id),{params:Promise.resolve({slug:id})});const db=await r.module("src/lib/db.js");await db.deleteAnnonce(id);
 const row=r.sqlite.prepare("SELECT * FROM candidatures").get();assert.equal(row.annonce_id,null);assert.equal(row.offre_titre,"Chargé de projets");assert.deepEqual(Buffer.from(await core.applicationDocument(r.env,row,"cv")),pdf);
 }finally{r.close();}
});

test("A retry can recover an interrupted pending upload without leaving orphaned copies",async()=>{
 const {r,id,api}=await setup();try{
 const requestId=randomUUID();await api.POST(request(id,{request_id:requestId}),{params:Promise.resolve({slug:id})});const old=r.sqlite.prepare("SELECT * FROM candidatures").get();
 r.sqlite.prepare("UPDATE candidatures SET upload_statut='pending',email_statut='pending',cree_le='2000-01-01T00:00:00.000Z'").run();
 assert.equal((await api.POST(request(id,{request_id:requestId}),{params:Promise.resolve({slug:id})})).status,200);const row=r.sqlite.prepare("SELECT * FROM candidatures").get();assert.notEqual(row.id,old.id);assert.equal(row.upload_statut,"ready");assert.equal(r.files.size,1);assert.ok(!r.files.has(old.cv_key));
 }finally{r.close();}
});
