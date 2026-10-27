import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { adminRuntime } from "./helpers/admin-runtime.mjs";
import { applicationListFilters,applicationListHref,applicationDossierHref } from "../src/lib/application-navigation.mjs";

test("Dossier navigation retains only validated filters and encodes search text safely",()=>{
 assert.deepEqual(applicationListFilters({annonce:["a"],statut:"invalid",q:["b"],page:"-2"}),{annonce:"",statut:"",q:"",page:1});
 const values={annonce:"offre-a",statut:"retenue",q:"Aminata & Sylla",page:2};
 assert.equal(applicationListHref(values),"/admin/candidatures?annonce=offre-a&statut=retenue&q=Aminata+%26+Sylla&page=2");
 assert.equal(applicationDossierHref("a/b",values),"/admin/candidatures/a%2Fb?annonce=offre-a&statut=retenue&q=Aminata+%26+Sylla&page=2");
 assert.equal(applicationListFilters({q:"a".repeat(150),page:999999}).q.length,120);
 assert.equal(applicationListFilters({page:999999}).page,10000);
});

async function fixture(){
 const r=await adminRuntime(),db=await r.module("src/lib/db.js"),core=await r.module("src/lib/candidatures.mjs");await core.ensureApplications(r.env);
 const offer=await db.createAnnonce({titre:"Chargé de projets",texte:"Offre",categorie:"recrutement",date:"2026-10-27",statut:"publie"});
 const insert=r.sqlite.prepare("INSERT INTO candidatures(id,request_id,annonce_id,offre_titre,nom,email,cv_key,document_secret,octets,cree_le,expire_le,upload_statut,statut,message) VALUES(?,?,?,?,?,?,'','',0,?,'2099-01-01','ready',?,'Message privé du candidat')");
 for(let i=0;i<52;i++)insert.run(`d${i}`,`r${i}`,offer,"Chargé de projets",`Candidate ${String(i).padStart(2,"0")}`,`private${i}@example.org`,`2026-10-27T10:00:${String(i).padStart(2,"0")}.000Z`,i%2?"retenue":"nouvelle");
 return {r,offer};
}

test("Offer inbox sorts newest first, paginates, searches literal names and omits private detail columns",async()=>{
 const {r,offer}=await fixture();try{
  const page=(await r.module("src/app/admin/candidatures/page.js")).default;
  const render=async query=>renderToStaticMarkup(await page({searchParams:Promise.resolve({annonce:offer,...query})}));
  const first=await render({});assert.ok(first.indexOf("Candidate 51")<first.indexOf("Candidate 50"));assert.doesNotMatch(first,/Candidate 00|private51@example.org|Message privé|Email transmis/);
  assert.match(first,/Chargé de projets/);assert.match(first,/Ouvrir le dossier/);assert.match(first,/page=2/);
  const second=await render({page:2});assert.match(second,/Candidate 01/);assert.match(second,/Candidate 00/);assert.doesNotMatch(second,/Candidate 51/);
  const searched=await render({q:"50"});assert.match(searched,/Candidate 50/);assert.doesNotMatch(searched,/Candidate 51/);
  const mismatch=await render({q:"50",statut:"retenue"});assert.match(mismatch,/Aucun dossier correspondant/);assert.doesNotMatch(mismatch,/Candidate 50/);
  for(const q of ["Candidate%50","Candidate_50"]){assert.match(await render({q}),/Aucun dossier correspondant/);}
  const empty=await render({q:'<script>alert(1)</script>'});assert.doesNotMatch(empty,/<script>/);assert.match(empty,/&lt;script&gt;/);
 }finally{r.close();}
});

test("Dossier detail returns to its real offer with filters and retains archived applications",async()=>{
 const {r,offer}=await fixture();try{
  const page=(await r.module("src/app/admin/candidatures/[id]/page.js")).default;
  const query={annonce:"unrelated",statut:"retenue",q:"Candidate",page:2};
  const html=renderToStaticMarkup(await page({params:Promise.resolve({id:"d51"}),searchParams:Promise.resolve(query)}));
  assert.match(html,/Coordonnées|Message du candidat|Pièces jointes|Suivi du dossier/);
  assert.match(html,/private51@example.org/);assert.match(html,/Message privé du candidat/);
  const back=applicationListHref({...query,annonce:offer}).replaceAll("&","&amp;");assert.ok(html.includes(`href="${back}"`));
  r.sqlite.prepare("UPDATE candidatures SET annonce_id=NULL WHERE id='d51'").run();
  const archived=renderToStaticMarkup(await page({params:Promise.resolve({id:"d51"})}));assert.match(archived,/Candidate 51|Chargé de projets/);assert.match(archived,/href="\/admin\/candidatures"/);
 }finally{r.close();}
});

test("Only recruitment cards offer dossier access and the editor preview never exposes admin actions",async()=>{
 const r=await adminRuntime();try{
  const Card=(await r.module("src/components/admin/AdminAnnouncementCard.jsx")).default;
  for(const categorie of ["recrutement","formation","evenement","actualite","publication"]){
   const annonce={id:"offer",categorie,titre:"Titre",texte:"Contenu",date:"2026-10-27",statut:"publie"};
   const html=renderToStaticMarkup(createElement(Card,{annonce}));assert.equal(html.includes('/admin/candidatures?annonce=offer'),categorie==="recrutement");
   const preview=renderToStaticMarkup(createElement(Card,{annonce,preview:true}));assert.doesNotMatch(preview,/Modifier|\/admin\/candidatures/);
  }
 }finally{r.close();}
});
