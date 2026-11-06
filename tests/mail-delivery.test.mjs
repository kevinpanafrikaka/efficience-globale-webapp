import test from 'node:test';
import assert from 'node:assert/strict';
import {adminRuntime} from './helpers/admin-runtime.mjs';
import {mailFailure,deliveryDescription} from '../src/lib/mail-delivery.mjs';
const form=()=>{const data=new FormData();for(const [k,v] of Object.entries({nom:'Visiteur',email:'visitor@example.org',message:'Bonjour',type_demande:'projet'}))data.set(k,v);return new Request('https://example.org/api/contact',{method:'POST',body:data});};

test('Diagnostic codes are allowlisted and never retain arbitrary provider text',()=>{
 const failure=mailFailure({message:'secret-token',oauthCode:'secret-token',mailStage:'secret-token',httpStatus:403,body:'secret-token'});
 assert.deepEqual(failure,{error_code:'permission',stage:null,http_status:403});
 assert.equal(mailFailure({oauthCode:'invalid_grant'}).error_code,'invalid_grant');
 assert.equal(mailFailure({name:'TimeoutError'}).error_code,'timeout');
 assert.equal(mailFailure({mailStage:'credentials'}).error_code,'credentials_unreadable');
 assert.match(deliveryDescription(null),/ancien envoi/);
});

test('Contact saves a safe Gmail authorization diagnostic and exposes it only to admin',async()=>{
 const r=await adminRuntime({fetcher:async()=>Response.json({error:'invalid_grant',error_description:'secret-token'},{status:400})});try{
  Object.assign(r.env,{GOOGLE_CLIENT_ID:'test-client',GOOGLE_CLIENT_SECRET:'test-secret'});
  const gmail=await r.module('src/lib/gmail.mjs');await gmail.saveConnection(r.env,'refresh-token');
  const api=await r.module('src/app/api/contact/route.js');
  const response=await api.POST(form());assert.equal(response.status,200);assert.deepEqual(await response.json(),{success:true});
  const message=r.sqlite.prepare('SELECT * FROM messages').get();assert.equal(message.envoye,0);
  const saved=r.sqlite.prepare('SELECT * FROM message_delivery').get();assert.equal(saved.error_code,'invalid_grant');assert.equal(saved.stage,'authorization');assert.equal(saved.provider,'gmail');assert.equal(saved.http_status,400);
  assert.doesNotMatch(JSON.stringify(saved),/secret-token|refresh-token|test-secret/);
  const admin=await r.module('src/app/api/admin/messages/[id]/route.js');
  const detail=await admin.GET(new Request('https://example.org'),{params:Promise.resolve({id:message.id})});assert.equal(detail.status,200);assert.equal((await detail.json()).delivery.error_code,'invalid_grant');
  await admin.DELETE(new Request('https://example.org',{method:'DELETE',headers:{origin:'https://example.org'}}),{params:Promise.resolve({id:message.id})});
  assert.equal(r.sqlite.prepare('SELECT COUNT(*) n FROM message_delivery').get().n,0);
 }finally{r.close();}
});

test('Missing provider is distinguished from an old undiagnosed message',async()=>{
 const r=await adminRuntime();try{
  const api=await r.module('src/app/api/contact/route.js');assert.equal((await api.POST(form())).status,200);
  const saved=r.sqlite.prepare('SELECT * FROM message_delivery').get();assert.equal(saved.error_code,'no_provider');assert.equal(saved.status,'unconfirmed');
 }finally{r.close();}
});

test('Gmail HTTP rejection records stage and status without response content; success is accepted',async()=>{
 let denied=true;
 const r=await adminRuntime({fetcher:async url=>String(url).includes('oauth2')?Response.json({access_token:'access'}):denied?Response.json({secret:'provider-detail'},{status:429}):Response.json({id:'accepted-id'})});try{
  Object.assign(r.env,{GOOGLE_CLIENT_ID:'test-client',GOOGLE_CLIENT_SECRET:'test-secret'});
  await (await r.module('src/lib/gmail.mjs')).saveConnection(r.env,'refresh');
  const api=await r.module('src/app/api/contact/route.js');await api.POST(form());
  const saved=r.sqlite.prepare('SELECT * FROM message_delivery').get();assert.equal(saved.error_code,'quota');assert.equal(saved.stage,'sending');assert.equal(saved.http_status,429);
  denied=false;await api.POST(form());assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM message_delivery WHERE status='accepted'").get().n,1);assert.equal(r.sqlite.prepare('SELECT COUNT(*) n FROM messages WHERE envoye=1').get().n,1);
 }finally{r.close();}
});

test('Gmail receipts retain the actual envelope independently of later settings and are deleted with the message',async()=>{
 const r=await adminRuntime({fetcher:async url=>String(url).includes('oauth2')?Response.json({access_token:'access'}):Response.json({id:'18c000ab42',extra:'do-not-store-provider-body'})});try{
  Object.assign(r.env,{GOOGLE_CLIENT_ID:'test-client',GOOGLE_CLIENT_SECRET:'test-secret'});
  const gmail=await r.module('src/lib/gmail.mjs'),db=await r.module('src/lib/db.js');
  await gmail.saveConnection(r.env,'refresh-token');
  await db.saveReglages({email_notifications:JSON.stringify(['oumar@example.org','aminata@example.org'])});
  const api=await r.module('src/app/api/contact/route.js');await api.POST(form());
  const message=r.sqlite.prepare('SELECT * FROM messages').get();assert.equal(message.envoye,1);
  await db.saveReglages({email_notifications:JSON.stringify(['changed@example.org'])});
  const admin=await r.module('src/app/api/admin/messages/[id]/route.js');
  const response=await admin.GET(new Request('https://example.org'),{params:Promise.resolve({id:message.id})});
  const {delivery}=await response.json();
  assert.equal(delivery.status,'accepted');assert.equal(delivery.provider_message_id,'18c000ab42');
  assert.equal(delivery.sender,gmail.GMAIL_OWNER);assert.deepEqual(delivery.recipients,['oumar@example.org','aminata@example.org']);
  assert.ok(Number.isFinite(Date.parse(delivery.checked_le)));
  const stored=r.sqlite.prepare('SELECT * FROM message_delivery_receipts').get();
  assert.doesNotMatch(JSON.stringify(stored),/do-not-store-provider-body|refresh-token|test-secret|changed@example.org/);
  // An unconfirmed retry must not inherit the receipt of an earlier accepted send.
  const diagnostic=await r.module('src/lib/mail-delivery.mjs');
  await diagnostic.recordMailDelivery(r.env,message.id,'gmail',{error:{mailStage:'authorization',oauthCode:'invalid_grant'}});
  assert.equal((await diagnostic.getMailDelivery(r.env,message.id)).recipients,undefined);
  assert.equal(r.sqlite.prepare('SELECT COUNT(*) n FROM message_delivery_receipts').get().n,0);
  await diagnostic.recordMailDelivery(r.env,message.id,'gmail',{sent:true,receipt:{id:'18c000ab42',sender:gmail.GMAIL_OWNER,recipients:['oumar@example.org']}});
  await admin.DELETE(new Request('https://example.org',{method:'DELETE',headers:{origin:'https://example.org'}}),{params:Promise.resolve({id:message.id})});
  assert.equal(r.sqlite.prepare('SELECT COUNT(*) n FROM message_delivery_receipts').get().n,0);
 }finally{r.close();}
});
