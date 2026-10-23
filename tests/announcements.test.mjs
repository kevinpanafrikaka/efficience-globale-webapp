import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { adminRuntime } from "./helpers/admin-runtime.mjs";
import { validateAdminContent } from "../src/lib/admin-input.mjs";
const req=body=>new Request("https://example.org/admin/annonces",{method:"POST",headers:{origin:"https://example.org","Content-Type":"application/json"},body:JSON.stringify(body)});

test("Existing announcements acquire editorial defaults without a manual database migration or content loss",async()=>{
 const r=await adminRuntime();try{
 r.sqlite.exec("DROP TABLE annonce_details");
 r.sqlite.prepare("INSERT INTO annonces(id,slug,titre,texte,date,statut) VALUES(?,?,?,?,?,?)").run("old","ancienne","Texte existant","Parcours de l’annonce conservé","2026-10-21","publie");
 const db=await r.module("src/lib/db.js");const rows=await db.getAnnonces();
 assert.equal(rows.length,1);assert.equal(rows[0].categorie,"vie");assert.equal(rows[0].texte,"Parcours de l’annonce conservé");assert.equal(rows[0].resume,"");
 assert.equal((await db.getAnnonceBySlug("ancienne")).id,"old");
 }finally{r.close();}
});

test("Announcement editorial fields persist through draft, publication and edit, and delete with the original record",async()=>{
 const r=await adminRuntime();try{
 const route=await r.module("src/app/api/admin/annonces/route.js"),item=await r.module("src/app/api/admin/annonces/[id]/route.js"),db=await r.module("src/lib/db.js");
 const data={titre:"Recrutement",texte:"## Mission\n\nUn parcours.\n\n- Analyse\n- Conseil",date:"2026-10-21",categorie:"recrutement",resume:"Résumé spécifique",lieu:"Conakry",echeance:"2099-12-01",action_url:"mailto:contact@example.org",action_label:"Postuler",statut:"brouillon"};
 const res=await route.POST(req(data));assert.equal(res.status,200);const {id}=await res.json();assert.equal((await db.getAnnonces()).length,0);assert.equal(await db.getAnnonceBySlug(id),null);
 assert.equal((await db.getAnnonceById(id)).lieu,"Conakry");
 assert.equal((await item.PUT(req({...data,statut:"publie",resume:"Résumé modifié"}),{params:Promise.resolve({id})})).status,200);
 const published=(await db.getAnnonces())[0];for(const key of ["categorie","lieu","echeance","action_url","action_label","texte"])assert.equal(published[key],data[key],key);assert.equal(published.resume,"Résumé modifié");
 assert.equal((await item.DELETE(req({}),{params:Promise.resolve({id})})).status,200);assert.equal(r.sqlite.prepare("SELECT count(*) n FROM annonce_details").get().n,0);
 }finally{r.close();}
});

test("Announcement inputs reject unknown types, invalid deadlines, incomplete buttons and executable links",()=>{
 const base={titre:"Annonce",texte:"Contenu",date:"2026-10-21"};
 for(const extra of [{categorie:"fake"},{echeance:"2026-02-31"},{action_label:"Postuler"},{action_url:"javascript:alert(1)",action_label:"Ouvrir"},{action_url:"data:text/html,test",action_label:"Ouvrir"}])assert.throws(()=>validateAdminContent("annonces",{...base,...extra}));
 assert.equal(validateAdminContent("annonces",base).categorie,"vie");
});

test("Public announcement articles render safe headings and lists and close expired calls to action",async()=>{
 const r=await adminRuntime();try{
 const db=await r.module("src/lib/db.js");
 const id=await db.createAnnonce({titre:"Postuler",texte:"## Les missions\n\n- Conseil\n- Analyse\n\n<script>alert(1)</script>",date:"2026-10-21",statut:"publie",categorie:"recrutement",resume:"Introduction",lieu:"Conakry",echeance:"2099-12-01",action_url:"https://example.org/postuler",action_label:"Envoyer ma candidature"});
 const {default:Page}=await r.module("src/app/(public)/annonces/[slug]/page.js");
 const html=renderToStaticMarkup(await Page({params:Promise.resolve({slug:id})}));
 assert.match(html,/<h2>Les missions<\/h2>/);assert.match(html,/<li>Conseil<\/li>/);assert.doesNotMatch(html,/<script>/);assert.match(html,/href="https:\/\/example.org\/postuler"/);assert.match(html,/Introduction/);
 r.sqlite.prepare("UPDATE annonce_details SET echeance=? WHERE annonce_id=?").run("2000-01-01",id);
 const closed=renderToStaticMarkup(await Page({params:Promise.resolve({slug:id})}));assert.match(closed,/date limite est dépassée/);assert.doesNotMatch(closed,/href="https:\/\/example.org\/postuler"/);
 }finally{r.close();}
});
