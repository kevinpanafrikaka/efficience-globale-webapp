import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createElement} from 'react';
import * as jsx from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {adminRuntime} from './helpers/admin-runtime.mjs';
const {transformSync}=createRequire(import.meta.url)('next/dist/build/swc');
function find(node,predicate){if(!node||typeof node!=='object')return null;if(predicate(node))return node;for(const child of [node.props?.children].flat(Infinity)){const found=find(child,predicate);if(found)return found;}return null;}
async function shellHarness({stored='0',blocked=false}={}){
 const states=[],events=new Map(),storage=new Map([['eg-admin-sidebar-collapsed',stored]]);let cursor=0,effects=[],pathname='/admin/reglages';
 const context=vm.createContext({window:{localStorage:{getItem:key=>{if(blocked)throw Error('disabled');return storage.get(key);},setItem:(key,value)=>{if(blocked)throw Error('disabled');storage.set(key,value);}}},document:{addEventListener:(key,fn)=>events.set(key,fn),removeEventListener:key=>events.delete(key)}});
 const modules={react:{useState(initial){const i=cursor++;if(!(i in states))states[i]=initial;return [states[i],value=>{states[i]=typeof value==='function'?value(states[i]):value;}];},useRef(value){const i=cursor++;return states[i]??={current:value};},useEffect(effect,deps){const i=cursor++,previous=states[i];if(!previous||deps.some((v,index)=>v!==previous.deps[index]))effects.push(()=>{previous?.cleanup?.();states[i]={deps,cleanup:effect()};});}},'react/jsx-runtime':jsx,'next/navigation':{usePathname:()=>pathname},'./AdminNavLink':{default:function AdminNavLink(){}},'./LogoutButton':{default:function LogoutButton(){}},'./AdminMessageSearch':{default:function AdminMessageSearch(){},MessageSearchContext:{Provider:function Provider(){}}},'./DashboardCreateMenu':{default:function DashboardCreateMenu(){}},'./AdminSidebarIcon':{default:function AdminSidebarIcon(){}},'./admin-sidebar.css':{}};
 const source=await readFile(new URL('../src/components/admin/AdminShell.jsx',import.meta.url),'utf8');const {code}=transformSync(source,{filename:'AdminShell.jsx',jsc:{target:'es2022',parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'es6'}});
 const module=new vm.SourceTextModule(code,{context});await module.link(name=>{const values=modules[name];assert.ok(values,name);return new vm.SyntheticModule(Object.keys(values),function(){for(const [key,value]of Object.entries(values))this.setExport(key,value);},{context});});await module.evaluate();
 return {storage,path(value){pathname=value;},dispatch(key,event){events.get(key)?.(event);},render(){cursor=0;effects=[];const tree=module.namespace.default({unread:3,children:null});for(const effect of effects)effect();return tree;}};
}
test('Sidebar remembers collapsed mode across navigation, can expand again and still works when browser storage is unavailable',async()=>{
 for(const blocked of [false,true]){
  const h=await shellHarness({stored:'1',blocked});h.render();let tree=h.render();
  const root=()=>find(h.render(),n=>n.props?.className==='admin-space admin-shell');
  assert.equal(root().props['data-sidebar-collapsed'],!blocked);
  const button=find(tree,n=>n.props?.className==='admin-sidebar-toggle');button.props.onClick();
  assert.equal(root().props['data-sidebar-collapsed'],blocked);
  if(!blocked)assert.equal(h.storage.get('eg-admin-sidebar-collapsed'),'0');
  h.path('/admin/messages/test');h.render();assert.equal(root().props['data-sidebar-collapsed'],blocked);
 }
});
test('Mobile navigation closes with Escape or a destination and returns keyboard focus to its trigger',async()=>{
 const h=await shellHarness();h.render();let focused=0;
 const trigger=()=>find(h.render(),n=>n.props?.className==='admin-menu-button');
 trigger().props.ref.current={focus(){focused++;}};trigger().props.onClick();assert.equal(trigger().props['aria-expanded'],true);
 h.dispatch('keydown',{key:'Escape'});assert.equal(trigger().props['aria-expanded'],false);assert.equal(focused,1);
 trigger().props.onClick();h.render();find(h.render(),n=>n.type==='nav').props.onClick({target:{closest:()=>({})}});assert.equal(trigger().props['aria-expanded'],false);
 trigger().props.onClick();h.render();h.path('/admin/projets');h.render();assert.equal(trigger().props['aria-expanded'],false);
});
test('All sidebar links retain an accessible name, related pages activate one entry and unread counts disappear at zero',async()=>{
 for(const pathname of ['/admin','/admin/projets/test/modifier','/admin/membres/nouveau','/admin/candidatures/test','/admin/partenaires','/admin/messages/test','/admin/medias','/admin/reglages']){
  const r=await adminRuntime({pathname});try{
   const Shell=(await r.module('src/components/admin/AdminShell.jsx')).default;
   const html=renderToStaticMarkup(createElement(Shell,{unread:3}));const nav=html.match(/<nav aria-label="Administration"[^>]*>([\s\S]*?)<\/nav>/)[1];
   assert.equal((nav.match(/aria-current="page"/g)||[]).length,1,pathname);assert.equal((nav.match(/class="admin-nav-link"/g)||[]).length,8);
   assert.match(nav,/aria-label="Messages · 3 messages non lus"/);assert.equal((nav.match(/<svg/g)||[]).length,8);assert.match(html,/alt=""/);assert.match(html,/aria-label="Se déconnecter"/);
   const empty=renderToStaticMarkup(createElement(Shell,{unread:0})).match(/<nav aria-label="Administration"[^>]*>([\s\S]*?)<\/nav>/)[1];assert.doesNotMatch(empty,/admin-nav-badge/);
  }finally{r.close();}
 }
});
