import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {adminRuntime} from './helpers/admin-runtime.mjs';
import {filterMedia,publicMediaUrl,mediaFilename,formatMediaSize} from '../src/lib/media-files.mjs';
const root='https://example.org';
const request=(method='GET',data,origin=root)=>new Request(root+'/api/admin/medias',{method,headers:{origin,'Content-Type':'application/json'},...(data?{body:JSON.stringify(data)}:{})});
const pdfKey='publication-documents/11111111-1111-4111-8111-111111111111.pdf';

async function seed(r){
 r.sqlite.prepare('INSERT INTO projets(id,slug,titre,secteur,photo_url) VALUES(?,?,?,?,?)').run('p','p','Projet Santé','sante','/uploads/shared.png');
 r.sqlite.prepare('INSERT INTO membres(id,nom,photo_url) VALUES(?,?,?)').run('m','Équipe','/uploads/shared.png');
 r.sqlite.prepare('INSERT INTO partenaires(id,nom,logo_url) VALUES(?,?,?)').run('b','Partenaire','/uploads/logo.png');
 r.sqlite.prepare('INSERT INTO annonces(id,slug,titre,texte,image_url) VALUES(?,?,?,?,?)').run('a','a','Formation IA','Texte','/uploads/cover.png');
 r.sqlite.prepare('INSERT INTO annonce_photos(annonce_id,position,url) VALUES(?,?,?)').run('a',0,'/uploads/gallery.png');
 r.sqlite.prepare('INSERT INTO annonce_informations VALUES(?,?)').run('a',JSON.stringify({publication:{fichier_url:'/documents/11111111-1111-4111-8111-111111111111',support:'lien'}}));
}

test('Media allowlist never exposes private or unknown objects, including disguised private image paths',()=>{
 for(const key of ['private-applications/cv.pdf','private-applications/photo.png','secret.png/../../cv.pdf','unknown.pdf','../logo.png','image.svg'])assert.equal(publicMediaUrl(key),'');
 assert.equal(publicMediaUrl('image.png'),'/uploads/image.png');assert.equal(publicMediaUrl(pdfKey),'/documents/11111111-1111-4111-8111-111111111111');
 assert.equal(mediaFilename({key:'a.png',customMetadata:{filename:encodeURIComponent('Équipe du cabinet.png')}}),'Équipe du cabinet.png');
 assert.equal(mediaFilename({key:'a.png',customMetadata:{filename:'%invalid'}},[{title:'Formation'}]),'Formation · a.png');
 assert.equal(formatMediaSize(2*1024*1024),'2 Mo');
});

test('Authenticated listing follows all R2 pages, gives actual usage links including drafts, and excludes private sizes',async()=>{
 const r=await adminRuntime();try{
  await seed(r);let pages=0;
  r.env.UPLOADS.list=async options=>{
   assert.deepEqual(Array.from(options.include),['customMetadata']);pages++;
   return !options.cursor?{objects:[{key:'shared.png',size:200,uploaded:new Date('2026-11-04'),customMetadata:{filename:encodeURIComponent('Notre équipe.png')}},{key:'private-applications/secret.pdf',size:999999999,uploaded:new Date()}],truncated:true,cursor:'next'}:{objects:[{key:'unused.png',size:300,uploaded:new Date('2026-11-06')},{key:pdfKey,size:400,uploaded:new Date('2026-11-05')}],truncated:false};
  };
  const api=await r.module('src/app/api/admin/medias/route.js');const response=await api.GET(request());assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'no-store');
  const {items}=await response.json();assert.equal(pages,2);assert.equal(items.length,3);assert.equal(items.reduce((n,f)=>n+f.size,0),900);assert.equal(items[0].key,'unused.png');
  const shared=items.find(f=>f.key==='shared.png');assert.equal(shared.name,'Notre équipe.png');assert.deepEqual(shared.usages.map(u=>u.href),['/admin/projets/p/modifier','/admin/membres/m/modifier']);
  assert.equal(items.find(f=>f.type==='pdf').usages[0].label,'Publication');assert.doesNotMatch(JSON.stringify(items),/private-applications|secret\.pdf/);
  const db=await r.module('src/lib/db.js'),usages=await db.getMediaUsages();
  assert.equal(usages['/uploads/gallery.png'][0].label,'Galerie d’annonce');assert.equal(usages['/uploads/cover.png'][0].label,'Annonce');assert.equal(usages['/uploads/logo.png'][0].label,'Partenaire');
 }finally{r.close();}
});

test('Anonymous requests read neither database nor bucket and storage/query failures never report files unused',async()=>{
 const r=await adminRuntime({authenticated:false});try{
  r.env.UPLOADS.list=()=>{throw Error('Should not list');};const api=await r.module('src/app/api/admin/medias/route.js');assert.equal((await api.GET(request())).status,401);assert.equal(r.reads,0);
 }finally{r.close();}
 const a=await adminRuntime();try{
  const api=await a.module('src/app/api/admin/medias/route.js');a.env.UPLOADS.list=async()=>({objects:[],truncated:true});assert.equal((await api.GET(request())).status,503);
  a.sqlite.exec('DROP TABLE projets');assert.equal((await api.GET(request())).status,503);
 }finally{a.close();}
});

test('Filtering combines words, accents, type, usage and excluded gallery images',()=>{
 const items=[{key:'a.png',url:'/uploads/a.png',name:'Équipe.png',type:'image',usages:[{title:'Projet Santé',label:'Projet'}]},{key:'b.png',url:'/uploads/b.png',name:'Atelier',type:'image',usages:[]},{key:pdfKey,url:publicMediaUrl(pdfKey),name:'Guide',type:'pdf',usages:[]}];
 assert.deepEqual(filterMedia(items,{query:'equipe sante'}).map(f=>f.key),['a.png']);
 assert.equal(filterMedia(items,{type:'image',usage:'unused'}).length,1);
 assert.equal(filterMedia(items,{type:'pdf',usage:'used'}).length,0);
 assert.equal(filterMedia(items,{type:'image',excludeUrls:['/uploads/a.png']})[0].key,'b.png');
});

test('Cleanup protects covers, galleries, portraits, logos and inactive publication PDFs; foreign origins cannot delete',async()=>{
 const r=await adminRuntime();try{
  await seed(r);const api=await r.module('src/app/api/admin/medias/route.js');
  for(const key of ['shared.png','logo.png','cover.png','gallery.png',pdfKey])assert.equal((await api.DELETE(request('DELETE',{key}))).status,409);
  assert.equal((await api.DELETE(request('DELETE',{key:'unused.png'},'https://foreign.example.org'))).status,403);
  for(const key of ['private-applications/photo.png','private-applications/cv.pdf'])assert.equal((await api.DELETE(request('DELETE',{key}))).status,400);
  r.files.set('unused.png',new Uint8Array([1]));assert.equal((await api.DELETE(request('DELETE',{key:'unused.png'}))).status,200);assert.equal(r.files.has('unused.png'),false);
 }finally{r.close();}
});

test('Upload retains safe original filenames for future reuse without changing public URLs',async()=>{
 const r=await adminRuntime();try{
  let metadata;const put=r.env.UPLOADS.put;r.env.UPLOADS.put=async(key,bytes,options)=>{metadata=options.customMetadata;return put(key,bytes,options);};
  const api=await r.module('src/app/api/admin/upload/route.js'),form=new FormData();form.set('file',new File([new Uint8Array([137,80,78,71])],'Équipe.png',{type:'image/png'}));
  const response=await api.POST(new Request(root+'/api/admin/upload',{method:'POST',body:form}));assert.equal(response.status,200);assert.match((await response.json()).url,/^\/uploads\/[a-f0-9-]+\.png$/);assert.equal(decodeURIComponent(metadata.filename),'Équipe.png');
 }finally{r.close();}
});

test('Library and editors render reusable pickers while the library upload cannot recursively select files',async()=>{
 const r=await adminRuntime({pathname:'/admin/medias'});try{
  const components=await r.module('src/components/admin/MediaLibrary.jsx');
  const html=renderToStaticMarkup(React.createElement(components.default,{items:[{key:'a.png',url:'/uploads/a.png',name:'Image',type:'image',size:2048,uploaded:null,usages:[]}]}));
  assert.match(html,/fichier public/);assert.match(html,/Ajouter un fichier/);assert.match(html,/Rechercher un fichier/);assert.match(html,/Utilisés/);assert.match(html,/Inutilisés/);
  assert.doesNotMatch(html,/Go disponibles|10 Go|private-applications/);
  for(const [name,props] of [['ImageUpload',{}],['PublicationPdfUpload',{}]]){
   const module=await r.module(`src/components/admin/${name}.jsx`);const form=renderToStaticMarkup(React.createElement(module.default,{...props,onChange(){}}));assert.match(form,/Choisir dans la médiathèque/);
  }
  const shell=await r.module('src/components/admin/AdminShell.jsx');assert.match(renderToStaticMarkup(React.createElement(shell.default,{unread:0})),/<h1>Médiathèque<\/h1>/);
 }finally{r.close();}
});
