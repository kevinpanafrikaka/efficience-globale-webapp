import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {webcrypto} from 'node:crypto';
import * as jsx from 'react/jsx-runtime';
import {adminRuntime} from './helpers/admin-runtime.mjs';
const require=createRequire(import.meta.url),{transformSync}=require('next/dist/build/swc');
const message={id:'one',nom:'Visiteur',email:'visitor@example.org',sujet:'Notre projet',message:'Bonjour,\n\nVoici notre projet.',cree_le:'2026-11-06 10:00:00'};
const replies=[{id:'a',recipient:message.email,subject:'Re: Notre projet',body:'Première réponse.',status:'sent',cree_le:'2026-11-06 11:00:00'},{id:'b',recipient:message.email,subject:'Re: Re: Notre projet',body:'Dernière réponse.\n\nCordialement.',status:'sent',cree_le:'2026-11-06 12:00:00'}];

test('Conversation keeps the original readable without replies and opens only the latest sent reply',async()=>{
 const r=await adminRuntime();try{
  const {MessageConversation}=await r.module('src/components/admin/AdminMessages.jsx');
  const render=items=>renderToStaticMarkup(React.createElement(MessageConversation,{message,replies:items}));
  const fresh=render([]);assert.match(fresh,/Bonjour,/);assert.doesNotMatch(fresh,/<details/);
  const html=render(replies);
  assert.match(html,/<details class="message-thread-original"><summary>/);
  assert.match(html,/class="message-reply-record" data-status="sent"/);
  assert.match(html,/class="message-reply-record" open="" data-status="sent"/);
  assert.equal((html.match(/class="message-reply-record" open=/g)||[]).length,1);
  assert.doesNotMatch(html,/Re: Notre projet|Re: Re: Notre projet|Réponses du cabinet|message-record-toggle/);
  assert.equal((html.match(/Détails de la réponse/g)||[]).length,2);
  assert.match(html,/visitor@example.org/);assert.match(html,/message-thread-chevron/);
 }finally{r.close();}
});

test('Custom subjects and uncertain sends remain explicit, and dossier links remain available',async()=>{
 const r=await adminRuntime();try{
  const {MessageConversation}=await r.module('src/components/admin/AdminMessages.jsx');
  const html=renderToStaticMarkup(React.createElement(MessageConversation,{message:{...message,candidature_id:'dossier'},replies:[{...replies[0],status:'uncertain',subject:'Nouvelle proposition <test>'}]}));
  assert.match(html,/Envoi à vérifier/);assert.doesNotMatch(html,/>Envoyée</);
  assert.match(html,/Nouvelle proposition &lt;test&gt;/);assert.match(html,/\/admin\/candidatures\/dossier/);
 }finally{r.close();}
});

function find(root,predicate){if(!root||typeof root!=='object')return null;if(predicate(root))return root;for(const child of [root.props?.children].flat(Infinity)){const found=find(child,predicate);if(found)return found;}return null;}
async function composerHarness({respond=async()=>Response.json({success:true}),draft}={}){
 let cursor=0,state=[],savedDraft=draft,closed=0,sent=0;const requests=[],busy=[];
 const imports={
  react:{useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},useRef(value){const i=cursor++;return state[i]??={current:value};},useEffect(){},useContext(){}},
  'react/jsx-runtime':jsx,'next/navigation':{useRouter(){}},'next/link':{default(){}},'./AdminMessageSearch':{MessageSearchContext:{}},'@/lib/message-topics.mjs':{MESSAGE_TOPICS:[]},'@/lib/mail-delivery.mjs':{deliveryDescription(){}},'@/lib/format':{formatDate:v=>v},'./admin-messages.css':{}
 };
 const context=vm.createContext({crypto:webcrypto,fetch:async(url,options)=>{requests.push({url,options});return respond(url,options);}});
 const source=await readFile(new URL('../src/components/admin/AdminMessages.jsx',import.meta.url),'utf8');
 const {code}=transformSync(source,{filename:'AdminMessages.jsx',jsc:{target:'es2022',parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'es6'}});
 const mod=new vm.SourceTextModule(code,{context});await mod.link(name=>{const obj=imports[name];return new vm.SyntheticModule(Object.keys(obj),function(){for(const[k,v]of Object.entries(obj))this.setExport(k,v);},{context});});await mod.evaluate();
 return {requests,busy,get draft(){return savedDraft;},get closed(){return closed;},get sent(){return sent;},render(){cursor=0;return mod.namespace.ReplyComposer({message,detail:{sender:'cabinet@example.org',replyTo:['oumar@example.org']},draft:savedDraft,onDraft:d=>savedDraft=d,onBusy:v=>busy.push(v),onClose:()=>closed++,onSent:()=>sent++});}};
}
const textField=h=>find(h.render(),n=>n.props?.id==='reply-body');
const button=(h,label)=>find(h.render(),n=>n.type==='button'&&n.props.children===label);

test('Composer keeps recipient visible, preserves a cancelled draft, and confirms one send on double click',async()=>{
 let release;const pending=new Promise(r=>release=r);
 const h=await composerHarness({respond:()=>pending});
 textField(h).props.onChange({target:{value:'Bonjour, échangeons.'}});
 assert.match(JSON.stringify(h.render()),/visitor@example.org/);
 button(h,'Annuler').props.onClick();assert.equal(h.closed,1);assert.equal(h.draft.text,'Bonjour, échangeons.');
 h.render().props.onSubmit({preventDefault(){}});
 const confirm=button(h,'Confirmer l’envoi');const sending=confirm.props.onClick();await confirm.props.onClick();assert.equal(h.requests.length,1);
 release(Response.json({success:true}));await sending;
 assert.equal(h.sent,1);assert.equal(h.draft.text,'');assert.deepEqual(h.busy,[true,false]);
});

test('Known rejection retains editable contents; ambiguous send remains locked after closing and reopening',async()=>{
 const rejected=await composerHarness({respond:async()=>Response.json({error:'Session expirée'},{status:401})});
 textField(rejected).props.onChange({target:{value:'À conserver'}});rejected.render().props.onSubmit({preventDefault(){}});await button(rejected,'Confirmer l’envoi').props.onClick();
 assert.equal(rejected.draft.text,'À conserver');assert.equal(rejected.sent,0);assert.match(find(rejected.render(),n=>n.props?.role==='alert').props.children,/Session expirée/);
 const h=await composerHarness({respond:async()=>{throw Error('offline');}});
 textField(h).props.onChange({target:{value:'Envoi à vérifier'}});h.render().props.onSubmit({preventDefault(){}});await button(h,'Confirmer l’envoi').props.onClick();
 assert.equal(h.draft.uncertain,true);assert.ok(h.draft.requestId);assert.equal(h.sent,0);
 const reopened=await composerHarness({draft:h.draft});assert.equal(textField(reopened).props.disabled,true);assert.equal(button(reopened,'Envoyer').props.disabled,true);
 assert.match(find(reopened.render(),n=>n.props?.role==='alert').props.children,/Envoi non confirmé/);
});
