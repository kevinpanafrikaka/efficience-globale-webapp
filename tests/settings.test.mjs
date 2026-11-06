import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {adminRuntime} from './helpers/admin-runtime.mjs';
const origin='https://example.org';
const request=(value=origin)=>new Request(`${origin}/api/admin/reglages/gmail`,{method:'POST',headers:value?{origin:value}:{}});

test('Gmail authorization check rejects anonymous and foreign requests before reading saved credentials or contacting Google',async()=>{
 for(const [authenticated,site,expected] of [[false,origin,401],[true,'https://foreign.example',403],[true,undefined,403]]){
  const r=await adminRuntime({authenticated});try{
   const route=await r.module('src/app/api/admin/reglages/gmail/route.js');
   const before=r.reads;const response=await route.POST(site===undefined?new Request(`${origin}/api/admin/reglages/gmail`,{method:'POST'}):request(site));
   assert.equal(response.status,expected);assert.equal(r.reads,before);assert.equal(response.headers.get('cache-control'),'no-store');
  }finally{r.close();}
 }
});
test('Gmail check refreshes authorization without sending email, changing its stored token or exposing provider credentials',async()=>{
 const calls=[];const r=await adminRuntime({fetcher:async(url,options)=>{calls.push({url,options});return Response.json({access_token:'private-access-token',refresh_token:'private-provider-refresh-token'});}});
 try{
  Object.assign(r.env,{GOOGLE_CLIENT_ID:'test-client',GOOGLE_CLIENT_SECRET:'private-client-secret'});
  const gmail=await r.module('src/lib/gmail.mjs');await gmail.saveConnection(r.env,'private-saved-refresh-token');
  const before=r.sqlite.prepare('SELECT token FROM gmail_connection').get().token;
  const route=await r.module('src/app/api/admin/reglages/gmail/route.js');const response=await route.POST(request());const body=await response.text();
  assert.equal(JSON.parse(body).status,'verified');assert.equal(calls.length,1);assert.equal(calls[0].url,'https://oauth2.googleapis.com/token');
  assert.equal(calls[0].options.body.get('grant_type'),'refresh_token');assert.equal(calls[0].options.body.get('refresh_token'),'private-saved-refresh-token');
  assert.equal(r.sqlite.prepare('SELECT token FROM gmail_connection').get().token,before);
  assert.doesNotMatch(body,/private-|access_token|refresh_token|client_secret|test-client/);
 }finally{r.close();}
});
test('Gmail check distinguishes unconfigured, disconnected, revoked, unreadable and temporarily unavailable authorizations',async()=>{
 for(const scenario of ['unconfigured','disconnected','revoked','unreadable','offline','invalid-client']){
  let calls=0;const r=await adminRuntime({fetcher:async()=>{calls++;if(scenario==='offline')throw Error('private-network-details');return Response.json({error:scenario==='revoked'?'invalid_grant':'invalid_client',error_description:'private-provider-details'},{status:400});}});
  try{
   if(scenario!=='unconfigured')Object.assign(r.env,{GOOGLE_CLIENT_ID:'test-client',GOOGLE_CLIENT_SECRET:'private-client-secret'});
   const gmail=await r.module('src/lib/gmail.mjs');
   if(!['unconfigured','disconnected'].includes(scenario))await gmail.saveConnection(r.env,'private-refresh-token');
   if(scenario==='unreadable')r.sqlite.prepare('UPDATE gmail_connection SET token=?').run('private-unreadable-token');
   const route=await r.module('src/app/api/admin/reglages/gmail/route.js');const response=await route.POST(request());const body=await response.text();
   assert.equal(JSON.parse(body).status,({revoked:'invalid',unreadable:'invalid',offline:'unavailable','invalid-client':'unavailable'})[scenario]||scenario);
   assert.equal(calls,['revoked','offline','invalid-client'].includes(scenario)?1:0);assert.doesNotMatch(body,/private-|invalid_grant|invalid_client|token/);
  }finally{r.close();}
 }
});
test('Settings render accessible tabs, associated labels and a single navbar title without declaring an unverified connection valid',async()=>{
 const r=await adminRuntime({pathname:'/admin/reglages'});try{
  const form=await r.module('src/components/admin/ReglagesForm.jsx');const shell=await r.module('src/components/admin/AdminShell.jsx');
  const html=renderToStaticMarkup(createElement(shell.default,{unread:0},createElement(form.default,{reglages:{email:'cabinet@example.org'},notification:{provider:'Gmail',status:'registered',sender:'sender@example.org'}})));
  assert.equal((html.match(/<h1/g)||[]).length,1);assert.match(html,/<h1>Réglages<\/h1>/);assert.equal((html.match(/role="tab"/g)||[]).length,3);assert.equal((html.match(/role="tabpanel"/g)||[]).length,3);
  for(const match of html.matchAll(/<label[^>]*for="([^"]+)"/g))assert.ok(html.includes(`id="${match[1]}"`));
  assert.match(html,/Connexion enregistrée/);assert.doesNotMatch(html,/Gmail connecté|Autorisation vérifiée/);
 }finally{r.close();}
});
