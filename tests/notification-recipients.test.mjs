import test from "node:test";
import assert from "node:assert/strict";
import { validateNotificationRecipients, readNotificationRecipients } from "../src/lib/notification-recipients.mjs";
import { buildMime } from "../src/lib/gmail.mjs";
import { adminRuntime } from "./helpers/admin-runtime.mjs";

test("Notification settings validate and deduplicate addresses without allowing MIME header injection", () => {
 assert.deepEqual(validateNotificationRecipients(" Oumar@example.org\nAMINATA@example.org;oumar@example.org "), ["oumar@example.org","aminata@example.org"]);
 for(const input of [[],["bad"],["a@example.org\r\nBcc: x@example.org"],Array.from({length:11},(_,i)=>`a${i}@example.org`),[{}]]) assert.throws(()=>validateNotificationRecipients(input));
 const mime=buildMime({nom:"Visiteur",email:"visitor@example.org",message:"Bonjour",recipients:["oumar@example.org","aminata@example.org"]});
 assert.match(mime,/To: oumar@example.org, aminata@example.org\r\n/);assert.match(mime,/Reply-To: visitor@example.org/);
});

test("Editing recipients in Settings changes the next Gmail notification while keeping the public email independent", async () => {
 const r=await adminRuntime();try{
  const route=await r.module("src/app/api/admin/reglages/route.js");const db=await r.module("src/lib/db.js");
  const fields={email:"public@example.org",email_notifications:"Oumar@example.org\naminata@example.org"};
  const req=data=>new Request("https://example.org/api/admin/reglages",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
  assert.equal((await route.PUT(req(fields))).status,200);
  assert.deepEqual(await readNotificationRecipients(r.env),["oumar@example.org","aminata@example.org"]);
  assert.equal((await db.getReglages()).email,"public@example.org");
  assert.equal((await route.PUT(req({...fields,email_notifications:"bad"}))).status,400);
  assert.deepEqual(await readNotificationRecipients(r.env),["oumar@example.org","aminata@example.org"]);
  const cross=req(fields);cross.headers.set("origin","https://other.example.org");assert.equal((await route.PUT(cross)).status,403);
 } finally {r.close();}
});

test("Existing installations keep Oumar as recipient until Settings is saved",async()=>{
 const r=await adminRuntime();try{assert.deepEqual(await readNotificationRecipients(r.env),["oumar.camara@efficienceglobale.com"]);}finally{r.close();}
});

test("The Gmail send request uses the saved recipients and the visitor reply address without real email delivery",async()=>{
 let sent=0;
 const r=await adminRuntime({fetcher:async(url,options)=>{
  if(url==="https://oauth2.googleapis.com/token")return Response.json({access_token:"test-only-access"});
  assert.equal(url,"https://gmail.googleapis.com/gmail/v1/users/me/messages/send");
  const mime=Buffer.from(JSON.parse(options.body).raw,"base64url").toString("utf8");
  assert.match(mime,/To: oumar@example.org, aminata@example.org\r\n/);assert.match(mime,/Reply-To: visitor@example.org/);sent++;return Response.json({id:"test-only-message"});
 }});
 try{
  r.env.GOOGLE_CLIENT_ID="test-client";r.env.GOOGLE_CLIENT_SECRET="test-secret";
  const db=await r.module("src/lib/db.js"),gmail=await r.module("src/lib/gmail.mjs");
  await db.saveReglages({email_notifications:JSON.stringify(["oumar@example.org","aminata@example.org"])});
  await gmail.saveConnection(r.env,"test-refresh");
  assert.equal(await gmail.sendGmail(r.env,{nom:"Visiteur",email:"visitor@example.org",message:"Bonjour"}),"test-only-message");assert.equal(sent,1);
 }finally{r.close();}
});
