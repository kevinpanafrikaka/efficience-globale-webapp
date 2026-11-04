import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { adminRuntime } from "./helpers/admin-runtime.mjs";
import { buildReplyMime } from "../src/lib/gmail.mjs";

const origin = "https://example.org";
const req = (path, method = "GET", data, source = origin) => new Request(origin + path, { method, headers: { origin: source, "Content-Type": "application/json" }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
async function prepare(runtime) {
 runtime.env.GOOGLE_CLIENT_ID="test-only"; runtime.env.GOOGLE_CLIENT_SECRET="test-only-secret";
 const db=await runtime.module("src/lib/db.js"), gmail=await runtime.module("src/lib/gmail.mjs");
 await gmail.saveConnection(runtime.env,"test-only-refresh");
 await db.saveReglages({email_notifications:JSON.stringify(["oumar@example.org","aminata@example.org"])});
 const id=await db.createMessage({nom:"Visiteur",email:"visitor@example.org",sujet:"Notre projet",message:"Bonjour"});
 return {db,id,params:{params:Promise.resolve({id})}};
}

test("Reply MIME sends to the visitor, routes future replies to the cabinet, handles accents and rejects injection",()=>{
 const mime=buildReplyMime({recipient:"visitor@example.org",replyTo:["oumar@example.org","aminata@example.org"],subject:"Re: Échanges",text:"Bonjour à vous"});
 assert.match(mime,/To: visitor@example.org\r\n/);assert.match(mime,/Reply-To: oumar@example.org, aminata@example.org\r\n/);
 assert.ok(mime.endsWith(Buffer.from("Bonjour à vous").toString("base64")));
 for(const change of [{recipient:"v@example.org\r\nBcc: x@example.org"},{subject:"test\nBcc: x"},{replyTo:["bad"]}]) assert.throws(()=>buildReplyMime({recipient:"visitor@example.org",replyTo:["a@example.org"],subject:"Bonjour",text:"Texte",...change}));
});

test("Read/reply APIs reject anonymous requests without DB access; reply requires same origin",async()=>{
 const r=await adminRuntime({authenticated:false});try{
  const item=await r.module("src/app/api/admin/messages/[id]/route.js"),reply=await r.module("src/app/api/admin/messages/[id]/reponse/route.js");
  const params={params:Promise.resolve({id:"x"})};
  assert.equal((await item.GET(req("/api/admin/messages/x"),params)).status,401);
  assert.equal((await reply.POST(req("/reply","POST",{}),params)).status,401);assert.equal(r.reads,0);
 }finally{r.close();}
 const a=await adminRuntime();try{
  const route=await a.module("src/app/api/admin/messages/[id]/reponse/route.js");
  assert.equal((await route.POST(req("/reply","POST",{},"https://foreign.example.org"),{params:Promise.resolve({id:"x"})})).status,403);assert.equal(a.reads,0);
 }finally{a.close();}
});

test("Sending stores history, ignores a forged recipient, marks read and deduplicates retries without real mail",async()=>{
 let deliveries=0;
 const r=await adminRuntime({fetcher:async(url,options)=>{
  if(url==="https://oauth2.googleapis.com/token")return Response.json({access_token:"test-only-access"});
  assert.equal(url,"https://gmail.googleapis.com/gmail/v1/users/me/messages/send");
  const mime=Buffer.from(JSON.parse(options.body).raw,"base64url").toString();
  assert.match(mime,/To: visitor@example.org\r\n/);assert.doesNotMatch(mime,/attacker@example.org/);assert.match(mime,/Reply-To: oumar@example.org, aminata@example.org/);
  deliveries++;return Response.json({id:"test-only-delivery"});
 }});try{
  const {db,id,params}=await prepare(r),route=await r.module("src/app/api/admin/messages/[id]/reponse/route.js"),item=await r.module("src/app/api/admin/messages/[id]/route.js");
  const data={subject:"Re: Notre projet",text:"Bonjour, échangeons.",requestId:randomUUID(),recipient:"attacker@example.org"};
  assert.equal((await route.POST(req("/reply","POST",data),params)).status,200);
  assert.equal((await route.POST(req("/reply","POST",data),params)).status,200);assert.equal(deliveries,1);
  assert.equal((await db.getMessageById(id)).lu,1);
  const res=await item.GET(req("/message"),params);assert.equal(res.headers.get("Cache-Control"),"no-store");
  const history=await res.json();assert.equal(history.replies.length,1);assert.equal(history.replies[0].status,"sent");assert.equal(history.connected,true);
  assert.deepEqual(history.replyTo,["oumar@example.org","aminata@example.org"]);
  assert.equal((await route.POST(req("/reply","POST",{...data,text:"Changed"}),params)).status,409);assert.equal(deliveries,1);
  assert.equal((await item.DELETE(req("/message","DELETE"),params)).status,200);assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM message_replies").get().n,0);
 }finally{r.close();}
});

test("Invalid or disconnected replies never send; missing records return 404",async()=>{
 const r=await adminRuntime();try{
  const {params}=await prepare(r),route=await r.module("src/app/api/admin/messages/[id]/reponse/route.js"),item=await r.module("src/app/api/admin/messages/[id]/route.js");
  const data={subject:"Réponse",text:"Texte",requestId:randomUUID()};
  for(const change of [{text:" "},{subject:"a\r\nBcc: x"},{requestId:"bad"},{text:"a".repeat(20001)}, {subject:"a".repeat(201)}]) assert.equal((await route.POST(req("/reply","POST",{...data,...change}),params)).status,400);
  const missing={params:Promise.resolve({id:"missing"})};
  assert.equal((await route.POST(req("/reply","POST",data),missing)).status,404);assert.equal((await item.GET(req("/message"),missing)).status,404);
  r.sqlite.exec("DELETE FROM gmail_connection");
  assert.equal((await route.POST(req("/reply","POST",data),params)).status,409);assert.equal(r.sqlite.prepare("SELECT name FROM sqlite_master WHERE name = 'message_replies'").get(),undefined);
 }finally{r.close();}
});

test("An ambiguous Gmail failure is recorded and a retry never resends",async()=>{
 let sends=0;
 const r=await adminRuntime({fetcher:async(url)=>{
  if(url==="https://oauth2.googleapis.com/token")return Response.json({access_token:"test"});
  sends++;throw new Error("Timeout after sending");
 }});try{
  const {params}=await prepare(r),route=await r.module("src/app/api/admin/messages/[id]/reponse/route.js");
  const data={subject:"Réponse",text:"Texte",requestId:randomUUID()};
  const result=await route.POST(req("/reply","POST",data),params);assert.equal(result.status,502);assert.equal((await result.json()).uncertain,true);
  assert.equal((await route.POST(req("/reply","POST",data),params)).status,409);assert.equal(sends,1);assert.equal(r.sqlite.prepare("SELECT status FROM message_replies").get().status,"uncertain");
 }finally{r.close();}
});

test("Concurrent identical replies have one delivery; deletion cannot remove an active send",async()=>{
 let sends=0,release;
 const waiting=new Promise(resolve=>release=resolve);
 const r=await adminRuntime({fetcher:async(url)=>{
  if(url==="https://oauth2.googleapis.com/token")return Response.json({access_token:"test"});
  sends++;await waiting;return Response.json({id:"sent"});
 }});try{
  const {params}=await prepare(r),route=await r.module("src/app/api/admin/messages/[id]/reponse/route.js"),item=await r.module("src/app/api/admin/messages/[id]/route.js");
  const data={subject:"Réponse",text:"Texte",requestId:randomUUID()};
  const sending=route.POST(req("/reply","POST",data),params);
  // Wait for the mocked transport, not a wall-clock delay.
  while(!sends) await new Promise(resolve=>setImmediate(resolve));
  assert.equal((await route.POST(req("/reply","POST",data),params)).status,409);
  assert.equal((await item.DELETE(req("/message","DELETE"),params)).status,409);
  release();assert.equal((await sending).status,200);assert.equal(sends,1);
 }finally{release();r.close();}
});
