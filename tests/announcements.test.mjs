import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { adminRuntime } from "./helpers/admin-runtime.mjs";
import { validateAdminContent } from "../src/lib/admin-input.mjs";
import { announcementArticleContent,ANNOUNCEMENT_TYPES,announcementCategory,announcementType } from "../src/lib/announcements.mjs";
const req=body=>new Request("https://example.org/admin/annonces",{method:"POST",headers:{origin:"https://example.org","Content-Type":"application/json"},body:JSON.stringify(body)});

test("Existing announcements acquire editorial defaults without a manual database migration or content loss",async()=>{
 const r=await adminRuntime();try{
 r.sqlite.exec("DROP TABLE annonce_details");
 r.sqlite.prepare("INSERT INTO annonces(id,slug,titre,texte,date,statut) VALUES(?,?,?,?,?,?)").run("old","ancienne","Texte existant","Parcours de l’annonce conservé","2026-10-21","publie");
 const db=await r.module("src/lib/db.js");const rows=await db.getAnnonces();
 assert.equal(rows.length,1);assert.equal(rows[0].categorie,"actualite");assert.equal(rows[0].texte,"Parcours de l’annonce conservé");assert.equal(rows[0].resume,"");
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
 assert.equal(validateAdminContent("annonces",base).categorie,"actualite");
});

test("Public announcement articles render safe headings and lists and close expired calls to action",async()=>{
 const r=await adminRuntime();try{
 const db=await r.module("src/lib/db.js");
 const id=await db.createAnnonce({titre:"Postuler",texte:"## Les missions\n\n- Conseil\n- Analyse\n\n<script>alert(1)</script>",date:"2026-10-21",statut:"publie",categorie:"recrutement",resume:"Introduction",lieu:"Conakry",echeance:"2099-12-01",action_url:"https://example.org/postuler",action_label:"Envoyer ma candidature"});
 const {default:Page}=await r.module("src/app/(public)/annonces/[slug]/page.js");
 const html=renderToStaticMarkup(await Page({params:Promise.resolve({slug:id})}));
 assert.match(html,/<h2\b[^>]*>Les missions<\/h2>/);assert.match(html,/<li>Conseil<\/li>/);assert.doesNotMatch(html,/<script>/);assert.match(html,/href="https:\/\/example.org\/postuler"/);assert.match(html,/Introduction/);
 r.sqlite.prepare("UPDATE annonce_details SET echeance=? WHERE annonce_id=?").run("2000-01-01",id);
 const closed=renderToStaticMarkup(await Page({params:Promise.resolve({slug:id})}));assert.match(closed,/date limite est dépassée/);assert.doesNotMatch(closed,/href="https:\/\/example.org\/postuler"/);
 }finally{r.close();}
});

test("Announcement details recommend published records of the same type without exposing drafts",async()=>{
 const r=await adminRuntime();try{
 const db=await r.module("src/lib/db.js");
 const main=await db.createAnnonce({titre:"Annonce principale",texte:"Contenu principal",date:"2026-10-23",statut:"publie",categorie:"mission"});
 const related=await db.createAnnonce({titre:"Mission associée",texte:"Autre mission",date:"2026-10-22",statut:"publie",categorie:"mission"});
 const other=await db.createAnnonce({titre:"Formation distincte",texte:"Formation",date:"2026-10-23",statut:"publie",categorie:"formation"});
 const draft=await db.createAnnonce({titre:"Mission confidentielle",texte:"Privé",date:"2026-10-23",statut:"brouillon",categorie:"mission"});
 const {default:Page}=await r.module("src/app/(public)/annonces/[slug]/page.js");
 const html=renderToStaticMarkup(await Page({params:Promise.resolve({slug:main})}));
 assert.match(html,new RegExp(`href="/annonces/${related}"`));
 assert.ok(!html.includes(`href="/annonces/${other}"`));assert.ok(!html.includes(`href="/annonces/${draft}"`));assert.doesNotMatch(html,/Mission confidentielle|[↗→←]/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 }finally{r.close();}
});

test("Gallery photos persist in order, protect media, preserve older edits and remain private until publication",async()=>{
 const r=await adminRuntime();try{
 r.sqlite.exec("DROP TABLE annonce_photos");
 const route=await r.module("src/app/api/admin/annonces/route.js"),item=await r.module("src/app/api/admin/annonces/[id]/route.js"),db=await r.module("src/lib/db.js");
 const photos=[{url:"/uploads/first.jpg",legende:"Atelier"},{url:"/uploads/second.jpg",legende:"Échanges"}];
 const data={titre:"Galerie",texte:"Une rencontre",date:"2026-10-23",statut:"brouillon",image_url:"/uploads/cover.jpg",galerie:photos};
 const response=await route.POST(req(data));assert.equal(response.status,200);const {id}=await response.json();
 assert.equal(await db.getAnnonceBySlug(id),null);
 assert.deepEqual(JSON.parse(JSON.stringify((await db.getAnnonceById(id)).galerie)),photos);
 assert.ok((await db.getUsedMediaUrls()).has(photos[0].url));
 const {galerie,...legacy}=data;
 await item.PUT(req({...legacy,statut:"publie"}),{params:Promise.resolve({id})});
 const published=await db.getAnnonceBySlug(id);assert.equal(published.galerie.length,2);assert.equal(published.image_url,data.image_url);
 const {default:Page}=await r.module("src/app/(public)/annonces/[slug]/page.js");
 const html=renderToStaticMarkup(await Page({params:Promise.resolve({slug:id})}));
 assert.match(html,/En images/);assert.match(html,/Agrandir la photo 2/);assert.match(html,/Atelier/);
 await item.PUT(req({...data,galerie:[photos[1]],statut:"publie"}),{params:Promise.resolve({id})});
 assert.equal((await db.getAnnonceById(id)).galerie[0].url,photos[1].url);assert.ok(!(await db.getUsedMediaUrls()).has(photos[0].url));
 await item.PUT(req({...data,galerie:[]}),{params:Promise.resolve({id})});assert.equal((await db.getAnnonceById(id)).galerie.length,0);
 await item.DELETE(req({}),{params:Promise.resolve({id})});assert.equal(r.sqlite.prepare("SELECT count(*) n FROM annonce_photos").get().n,0);
 }finally{r.close();}
});

test("Gallery validation rejects unsafe or oversized data and deduplicates photos without changing their order",()=>{
 const base={titre:"Annonce",texte:"Contenu",date:"2026-10-23"};
 for(const galerie of [null,{},[null],[{url:"javascript:alert(1)"}],[{url:""}],[{url:"/a.jpg",legende:"a".repeat(301)}],Array.from({length:51},()=>({url:"/a.jpg"}))])assert.throws(()=>validateAdminContent("annonces",{...base,galerie}));
 const result=validateAdminContent("annonces",{...base,galerie:[{url:"/a.jpg",legende:"Première"},{url:"/b.jpg"},{url:"/a.jpg"}]});assert.equal(result.galerie.length,2);assert.equal(result.galerie[0].legende,"Première");
});

test("Editorial grouping preserves author content and only avoids an exact repeated introduction",()=>{
 const body="Introduction complète.\n\nParagraphe à conserver.\n\n## Vos missions\n\n- Analyse\n- Conseil\n\n## Profil recherché\n\nVotre expérience.\n\n## Modalités\n\nDernière information.";
 const parsed=announcementArticleContent(body,"Introduction complète.");
 assert.equal(parsed.lead,"Introduction complète.");assert.equal(parsed.preamble[0].text,"Paragraphe à conserver.");assert.deepEqual(parsed.sections.map(s=>s.title),["Vos missions","Profil recherché","Modalités"]);assert.deepEqual(parsed.sections[0].blocks[0].items,["Analyse","Conseil"]);assert.equal(parsed.sections[2].blocks[0].text,"Dernière information.");
 const different=announcementArticleContent(body,"Un résumé différent.");assert.equal(different.preamble[0].text,"Introduction complète.");
 const plain=announcementArticleContent("Premier paragraphe.\n\nDeuxième paragraphe.");assert.equal(plain.lead,"Premier paragraphe.");assert.equal(plain.preamble[0].text,"Deuxième paragraphe.");assert.equal(plain.sections.length,0);
 const headings=announcementArticleContent("## Premier titre\n\n## Second titre\n\nTexte");assert.equal(headings.sections.length,2);assert.equal(headings.sections[0].blocks.length,0);
});

test("Full-width article renders custom headings for every announcement type with one safe action",async()=>{
 const r=await adminRuntime();try{
 const db=await r.module("src/lib/db.js"),{default:Page}=await r.module("src/app/(public)/annonces/[slug]/page.js");
 for(const categorie of ["recrutement","formation","evenement","actualite","publication"]){
  const id=await db.createAnnonce({titre:`Détail ${categorie}`,texte:"Résumé identique.\n\n## Découvrir\n\n- Premier élément\n- Deuxième élément\n\n## Approfondir\n\nTexte unique.\n\n## Participer\n\nDernier paragraphe.",resume:"Résumé identique.",date:"2026-10-23",statut:"publie",categorie,lieu:"Conakry",echeance:"2099-12-01",action_url:"mailto:contact@example.org",action_label:"Envoyer ma demande"});
  const html=renderToStaticMarkup(await Page({params:Promise.resolve({slug:id})}));
  const body=html.split('aria-label="Contenu de l’annonce"')[1].split('class="announcement-detail-return"')[0];
  for(const text of ["Découvrir","Premier élément","Approfondir","Texte unique.","Participer","Dernier paragraphe."])assert.ok(body.includes(text),text);
  assert.equal((body.match(/Résumé identique\./g)||[]).length,1);assert.equal((body.match(/Envoyer ma demande/g)||[]).length,1);
  assert.match(body,/<dt>Lieu<\/dt><dd>Conakry<\/dd>/);assert.match(body,/href="mailto:contact@example.org"/);assert.doesNotMatch(body,/À propos de l’annonce|announcement-article-layout|[↗→←]/);
 }
 const id=await db.createAnnonce({titre:"Simple",texte:"Un texte sans sous-titres.",date:"2026-10-23",statut:"publie",categorie:"publication"});
 const simple=renderToStaticMarkup(await Page({params:Promise.resolve({slug:id})}));assert.match(simple,/Un texte sans sous-titres\./);assert.doesNotMatch(simple,/class="announcement-practical"/);
 }finally{r.close();}
});

test("The agreed announcement taxonomy separates training, events, news and publications while retaining legacy records",async()=>{
 assert.deepEqual(ANNOUNCEMENT_TYPES.map(type=>type.label),["Recrutement","Formations","Événements","Actualités","Publications"]);
 for(const legacy of ["mission","vie",undefined])assert.equal(announcementCategory(legacy),"actualite");
 assert.equal(announcementType("mission").label,"Actualités");assert.equal(announcementType("evenement").label,"Événements");
 const r=await adminRuntime();try{
 const db=await r.module("src/lib/db.js"),api=await r.module("src/app/api/admin/annonces/route.js");
 for(const categorie of ["formation","evenement","actualite","publication"]){
  const response=await api.POST(req({titre:`Annonce ${categorie}`,texte:"Texte conservé",date:"2026-10-23",statut:"publie",categorie}));assert.equal(response.status,200);const {id}=await response.json();assert.equal((await db.getAnnonceById(id)).categorie,categorie);assert.equal((await db.getAnnonceBySlug(id)).categorie,categorie);
 }
 for(const old of ["vie","mission"]){
  const id=await db.createAnnonce({titre:`Ancienne ${old}`,texte:"Texte historique",date:"2026-10-23",statut:"publie"});
  r.sqlite.prepare("UPDATE annonce_details SET categorie=? WHERE annonce_id=?").run(old,id);
  assert.equal((await db.getAnnonceById(id)).categorie,"actualite");assert.equal((await db.getAnnonceBySlug(id)).texte,"Texte historique");assert.equal((await db.getAllAnnonces()).find(row=>row.id===id).categorie,"actualite");
  const saved=validateAdminContent("annonces",{titre:"Ancien onglet",texte:"Contenu",date:"2026-10-23",categorie:old});assert.equal(saved.categorie,"actualite");
 }
 }finally{r.close();}
});
