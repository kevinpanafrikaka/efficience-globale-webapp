import test from 'node:test';
import assert from 'node:assert/strict';
import { adminRuntime } from './helpers/admin-runtime.mjs';
import { contactAttachments, contactFileError, readContactForm, MAX_CONTACT_BODY_BYTES } from '../src/lib/contact-attachments.mjs';

const pdf = '%PDF-1.7\n1 0 obj <<>> endobj\n%%EOF';
function form(files = []) {
  const data = new FormData();
  for (const [key, value] of Object.entries({nom:'Visiteur',email:'visitor@example.org',sujet:'Projet test',message:'Bonjour',type_demande:'projet'})) data.set(key,value);
  for (const file of files) data.append('documents',file);
  return new Request('https://example.org/api/contact',{method:'POST',body:data});
}

test('PDFs are optional, sanitized uniquely, and their exact bytes are retained',async()=>{
  const data = new FormData();
  assert.deepEqual(await contactAttachments(data),[]);
  for(let i=0;i<3;i++)data.append('documents',new File([pdf],'Présentation été.pdf',{type:'application/pdf'}));
  const files=await contactAttachments(data);
  assert.deepEqual(files.map(f=>f.name),['Presentation-ete-1.pdf','Presentation-ete-2.pdf','Presentation-ete-3.pdf']);
  for(const file of files)assert.equal(Buffer.from(file.bytes).toString(),pdf);
});

test('Invalid, empty, oversized and excess files are rejected before saving or sending',async()=>{
  const r=await adminRuntime();try{
    const route=await r.module('src/app/api/contact/route.js');
    for(const files of [
      [new File(['script'],'projet.pdf',{type:'application/pdf'})],
      [new File([pdf],'projet.exe',{type:'application/pdf'})],
      [new File([],'vide.pdf',{type:'application/pdf'})],
      [new File([pdf],'projet.pdf',{type:'text/html'})],
      [new File([new Uint8Array(2*1024*1024+1)],'gros.pdf',{type:'application/pdf'})],
      Array.from({length:4},()=>new File([pdf],'projet.pdf',{type:'application/pdf'})),
    ])assert.equal((await route.POST(form(files))).status,400);
    assert.equal(r.sqlite.prepare('SELECT COUNT(*) n FROM messages').get().n,0);
    assert.equal(r.files.size,0);
  }finally{r.close();}
});

test('Actual request stream is bounded even without Content-Length; malformed multipart is rejected',async()=>{
  let cancelled=false;
  const body=new ReadableStream({start(c){c.enqueue(new Uint8Array(MAX_CONTACT_BODY_BYTES+1));},cancel(){cancelled=true;}});
  await assert.rejects(readContactForm(new Request('https://example.org',{method:'POST',body,duplex:'half'})),e=>e.status===413);
  assert.equal(cancelled,true);
  await assert.rejects(readContactForm(new Request('https://example.org',{method:'POST',headers:{'content-length':String(MAX_CONTACT_BODY_BYTES+1)},body:'tiny'})),e=>e.status===413);
  const r=await adminRuntime();try{
    const route=await r.module('src/app/api/contact/route.js');
    assert.equal((await route.POST(new Request('https://example.org',{method:'POST',body:'not multipart'}))).status,400);
  }finally{r.close();}
});

test('Contact sends real PDF MIME parts through Gmail with no R2 copy and records filenames',async()=>{
  let mime;
  const r=await adminRuntime({fetcher:async(url,options)=>{
    if(String(url).includes('oauth2'))return Response.json({access_token:'fake-access'});
    assert.equal(url,'https://gmail.googleapis.com/gmail/v1/users/me/messages/send');
    mime=Buffer.from(JSON.parse(options.body).raw,'base64url').toString();
    return Response.json({id:'18c000ab42'});
  }});try{
    Object.assign(r.env,{GOOGLE_CLIENT_ID:'test-client',GOOGLE_CLIENT_SECRET:'test-secret'});
    await (await r.module('src/lib/gmail.mjs')).saveConnection(r.env,'fake-refresh');
    const route=await r.module('src/app/api/contact/route.js');
    const response=await route.POST(form([new File([pdf],'Projet.pdf',{type:'application/pdf'})]));
    assert.deepEqual(await response.json(),{success:true,attachments_sent:true});
    assert.match(mime,/Content-Type: multipart\/mixed/);
    assert.match(mime,/Content-Disposition: attachment; filename="Projet-1.pdf"/);
    assert.ok(mime.includes(Buffer.from(pdf).toString('base64')));
    const message=r.sqlite.prepare('SELECT * FROM messages').get();
    assert.equal(message.envoye,1);assert.match(message.message,/Documents joints à l’email :\n• Projet-1.pdf/);
    assert.equal(r.files.size,0);
  }finally{r.close();}
});

test('Failed sends report documents not transmitted while retaining the message without auto-resending',async()=>{
  let calls=0;
  const r=await adminRuntime({fetcher:async()=>{calls++;return Response.json({error:'invalid_grant'},{status:400});}});try{
    Object.assign(r.env,{GOOGLE_CLIENT_ID:'test-client',GOOGLE_CLIENT_SECRET:'test-secret'});
    await (await r.module('src/lib/gmail.mjs')).saveConnection(r.env,'fake-refresh');
    const route=await r.module('src/app/api/contact/route.js');
    const response=await route.POST(form([new File([pdf],'Projet.pdf',{type:'application/pdf'})]));
    assert.deepEqual(await response.json(),{success:true,attachments_sent:false});
    assert.equal(r.sqlite.prepare('SELECT envoye FROM messages').get().envoye,0);
    assert.equal(calls,1);assert.equal(r.files.size,0);
  }finally{r.close();}
});

test('Browser metadata limits agree with server limits',()=>{
 assert.match(contactFileError(Array.from({length:4},()=>new File([pdf],'test.pdf'))),/3 documents/);
 assert.match(contactFileError([new File([new Uint8Array(2097153)],'test.pdf')]),/2 Mo/);
});
