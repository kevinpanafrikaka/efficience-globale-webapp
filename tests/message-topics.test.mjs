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

test("Unknown contact categories are rejected before saving; old unclassified messages remain readable",async()=>{
 const r=await adminRuntime();try{
  const route=await r.module("src/app/api/contact/route.js"),db=await r.module("src/lib/db.js");
  assert.equal((await route.POST(contact({type_demande:"inconnue"}))).status,400);
  assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM messages").get().n,0);
  r.sqlite.prepare("INSERT INTO messages (id,nom,email,sujet,message) VALUES (?,?,?,?,?)").run("legacy","Ancien visiteur","legacy@example.org","Demande de formation","Ancien message");
  assert.equal((await route.POST(contact({}))).status,200);
  const items=await db.getAllMessages();assert.equal(items.length,2);
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
  assert.equal((html.match(/role="tab"/g)||[]).length,4);
  for(const label of ["Projets","Formations","Partenariats"])assert.ok(html.includes(label));
  assert.ok(html.includes('aria-label="2 messages non lus"'));
  assert.ok(html.includes('aria-label="Filtrer par état de lecture"')||html.includes('Filtrer par état de lecture'));
  assert.doesNotMatch(html,/Private body/);
 }finally{r.close();}
});
