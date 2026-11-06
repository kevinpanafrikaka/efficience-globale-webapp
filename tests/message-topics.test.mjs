import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { adminRuntime } from "./helpers/admin-runtime.mjs";

function contact(values) {
 const form=new FormData();
 for(const [key,value] of Object.entries({nom:"Visiteur",email:"visitor@example.org",sujet:"Un sujet libre",message:"Message de test",...values})) form.set(key,value);
 return new Request("https://example.org/api/contact",{method:"POST",body:form});
}

test("Contact stores the selected category independently from the subject, without sending email",async()=>{
 const r=await adminRuntime();try{
  const route=await r.module("src/app/api/contact/route.js"),db=await r.module("src/lib/db.js");
  for(const topic of ["projet","formation","partenariat"]){
   assert.equal((await route.POST(contact({type_demande:topic,sujet:`Titre personnalisé ${topic}`}))).status,200);
   const items=await db.getAllMessages();
   const found=items.find(m=>m.sujet===`Titre personnalisé ${topic}`);
   assert.equal(found.type_demande,topic);assert.equal(found.envoye,0);
   assert.equal((await db.getMessageById(found.id)).type_demande,topic);
  }
  assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM message_topics").get().n,3);
 }finally{r.close();}
});

test("Missing and unknown contact categories are rejected before saving; old unclassified messages remain readable",async()=>{
 const r=await adminRuntime();try{
  const route=await r.module("src/app/api/contact/route.js"),db=await r.module("src/lib/db.js");
  assert.equal((await route.POST(contact({type_demande:"inconnue"}))).status,400);
  assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM messages").get().n,0);
  r.sqlite.prepare("INSERT INTO messages (id,nom,email,sujet,message) VALUES (?,?,?,?,?)").run("legacy","Ancien visiteur","legacy@example.org","Demande de formation","Ancien message");
  for (const values of [{}, {type_demande:""}, {type_demande:"   "}]) {
   const response=await route.POST(contact(values));
   assert.equal(response.status,400);
   assert.equal((await response.json()).error,"Choisissez un type d’accompagnement.");
  }
  const items=await db.getAllMessages();assert.equal(items.length,1);
  assert.ok(items.every(m=>m.type_demande===null));
  assert.equal(items.find(m=>m.id==="legacy").message,"Ancien message");
 }finally{r.close();}
});

test("Deleting a categorized message removes its category without touching other messages",async()=>{
 const r=await adminRuntime();try{
  const db=await r.module("src/lib/db.js"),route=await r.module("src/app/api/admin/messages/[id]/route.js");
  const first=await db.createMessage({nom:"A",email:"a@example.org",message:"Texte",type_demande:"projet"});
  const second=await db.createMessage({nom:"B",email:"b@example.org",message:"Texte",type_demande:"formation"});
  assert.equal((await route.DELETE(new Request(`https://example.org/api/admin/messages/${first}`,{method:"DELETE",headers:{origin:"https://example.org"}}),{params:Promise.resolve({id:first})})).status,200);
  assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM message_topics WHERE message_id = ?").get(first).n,0);
  assert.equal((await db.getMessageById(second)).type_demande,"formation");
 }finally{r.close();}
});

test("Inbox category tabs expose separate unread counts while keeping body text out of the list",async()=>{
 const r=await adminRuntime();try{
  const {default:Messages}=await r.module("src/components/admin/AdminMessages.jsx");
  const messages=[{id:"one",nom:"A",email:"a@example.org",sujet:"Objet A",message:"Private body A",type_demande:"projet",lu:0},{id:"two",nom:"B",email:"b@example.org",sujet:"Objet B",message:"Private body B",type_demande:"formation",lu:1},{id:"three",nom:"C",email:"c@example.org",sujet:"Objet C",message:"Private body C",type_demande:"partenariat",lu:0}];
  const html=renderToStaticMarkup(React.createElement(Messages,{messages}));
  assert.equal((html.match(/role="tab"/g)||[]).length,5);
  for(const label of ["Projets","Formations","Partenariats","Candidatures"])assert.ok(html.includes(label));
  assert.ok(html.includes('aria-label="2 messages non lus"'));
  assert.match(html,/class="message-tab-count" aria-label="2 messages non lus">2<\/span>/);
  assert.doesNotMatch(html,/message-tab-count-label/);
  assert.doesNotMatch(html,/Filtrer par état de lecture|Réinitialiser/);
  assert.doesNotMatch(html,/Private body/);
  const tabs=[...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map(match=>match[0]);
  assert.equal(tabs.filter(tab=>tab.includes('data-unread="true"')).length,3);
  const readHtml=renderToStaticMarkup(React.createElement(Messages,{messages:messages.map(m=>({...m,lu:1}))}));
  assert.doesNotMatch(readHtml,/data-unread="true"|class="message-tab-count"/);
 }finally{r.close();}
});


test("Application category isolates dossiers and empty inboxes use contextual text without reset controls",async()=>{
 const r=await adminRuntime();try{
  const {default:Messages,matchesMessageCategory,messageEmptyText}=await r.module("src/components/admin/AdminMessages.jsx");
  const application={id:"notification",candidature_id:"dossier",type_demande:"projet"};
  assert.equal(matchesMessageCategory(application,"candidatures"),true);
  assert.equal(matchesMessageCategory(application,"projet"),false);
  assert.equal(matchesMessageCategory({type_demande:"projet"},"candidatures"),false);
  assert.equal(matchesMessageCategory(application,"all"),true);
  for(const type of ["all","projet","formation","partenariat","candidatures"])assert.ok(messageEmptyText(type).length>20);
  assert.match(messageEmptyText("formation","aucun"),/recherche/);
  const html=renderToStaticMarkup(React.createElement(Messages,{messages:[]}));
  assert.match(html,/Vous n’avez pas encore reçu de message/);
  assert.doesNotMatch(html,/Réinitialiser|Tous les statuts/);
  // Header placement is rendered on the Messages route.
  const other=await adminRuntime({pathname:"/admin/messages"});try{
   const S=(await other.module("src/components/admin/AdminShell.jsx")).default;
   const markup=renderToStaticMarkup(React.createElement(S,{unread:0}));
   assert.match(markup,/<header[^>]*>[\s\S]*aria-label="Rechercher un message"[\s\S]*<\/header>/);
  }finally{other.close();}
 }finally{r.close();}
});


test("Message reading uses compact paragraphs while preserving line breaks and escaping content",async()=>{
 const r=await adminRuntime();try{
  const {MessageText}=await r.module("src/components/admin/AdminMessages.jsx");
  const html=renderToStaticMarkup(React.createElement(MessageText,{text:"Bonjour,\r\n\r\n\r\nUne première ligne.\r\nUne seconde ligne.\r\n\r\n<script>Texte</script>"}));
  assert.equal((html.match(/<p>/g)||[]).length,3);
  assert.ok(html.includes("Une première ligne.\nUne seconde ligne."));
  assert.ok(html.includes("&lt;script&gt;"));assert.doesNotMatch(html,/<script>/);
 }finally{r.close();}
});


test("Message delivery visibly distinguishes confirmed sending, historical sending and unconfirmed delivery",async()=>{
 const r=await adminRuntime();try{
  const {MessageDeliveryStatus,default:Messages}=await r.module("src/components/admin/AdminMessages.jsx");
  const render=props=>renderToStaticMarkup(React.createElement(MessageDeliveryStatus,props));
  const confirmed=render({message:{envoye:0},delivery:{status:"accepted",provider:"gmail",checked_le:"2026-11-05T15:19:42.000Z",sender:"cabinet@example.org",recipients:["oumar@example.org","aminata@example.org"],provider_message_id:"18c000ab42"}});
  assert.match(confirmed,/Email envoyé au cabinet/);assert.match(confirmed,/Gmail/);assert.match(confirmed,/data-sent="true"/);assert.doesNotMatch(confirmed,/Envoi par email au cabinet non confirmé/);
  assert.doesNotMatch(confirmed,/a confirmé l’envoi de cet email/);assert.match(confirmed,/<dialog[^>]*aria-label="Détails de l’envoi"/);assert.doesNotMatch(confirmed,/aria-haspopup="dialog"|aria-label="Informations sur l’envoi"/);assert.match(confirmed,/aria-label="Copier la référence Gmail"/);assert.doesNotMatch(confirmed,/<details|message-delivery-dialog-header/);assert.doesNotMatch(confirmed,/<dt>Réception<|<dt>Lecture<|Non suivie par le site/);
  assert.match(confirmed,/oumar@example.org/);assert.match(confirmed,/aminata@example.org/);assert.match(confirmed,/cabinet@example.org/);assert.match(confirmed,/18c000ab42/);
  const dialog=confirmed.match(/<dialog[\s\S]*?<\/dialog>/)[0];
  assert.doesNotMatch(dialog,/Email envoyé au cabinet|Informations sur l’envoi/);
  assert.match(dialog,/<dt>Service d’envoi<\/dt><dd>Gmail<\/dd>/);assert.match(dialog,/Envoi confirmé le/);assert.match(dialog,/15:19:42/);assert.match(dialog,/heure de Conakry/);
  assert.match(dialog,/Référence Gmail/);assert.match(dialog,/>Copier<|>Copier<!--/);assert.match(dialog,/>Fermer</);
  const reader=renderToStaticMarkup(React.createElement(Messages,{messages:[{id:"one",nom:"Visiteur",email:"visitor@example.org",sujet:"Objet du message",message:"Texte",envoye:1}],initialSelectedId:"one"}));
  assert.match(reader,/class="message-reader-title">[\s\S]*?<h2[^>]*><span>Objet du message<\/span><button[^>]*aria-label="Informations sur l’envoi"/);
  assert.equal((reader.match(/aria-haspopup="dialog"/g)||[]).length,1);
  const historical=render({message:{envoye:1},delivery:{status:"accepted",provider:"gmail",checked_le:"2026-11-05T15:19:42.000Z"}});assert.match(historical,/Non enregistré pour cet envoi/);assert.doesNotMatch(historical,/oumar@example.org/);
  const older=render({message:{envoye:1}});assert.match(older,/Email envoyé au cabinet/);assert.match(older,/ses détails ne sont pas disponibles/);assert.doesNotMatch(older,/Gmail/);
  const failed=render({message:{envoye:0},delivery:{status:"unconfirmed",provider:"gmail",error_code:"invalid_grant",stage:"authorization",http_status:400,checked_le:"2026-11-05T15:00:00.000Z"}});assert.match(failed,/Envoi par email au cabinet non confirmé/);assert.doesNotMatch(failed,/Email envoyé au cabinet/);assert.match(failed,/invalid_grant/);
  assert.doesNotMatch(render({message:{envoye:1},delivery:{status:"unconfirmed",provider:"gmail"}}),/Email envoyé au cabinet/);
  assert.match(render({message:{envoye:0},loading:true}),/Vérification de l’envoi/);
 }finally{r.close();}
});
