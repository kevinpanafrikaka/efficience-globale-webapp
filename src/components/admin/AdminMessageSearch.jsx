"use client";
import { createContext, useContext, useEffect, useRef } from "react";
export const MessageSearchContext = createContext({ query: "", searchOpen: false });
export default function AdminMessageSearch() {
 const {query,setQuery,searchOpen,setSearchOpen}=useContext(MessageSearchContext);
 const input=useRef(null),toggle=useRef(null);
 useEffect(()=>{if(searchOpen)input.current?.focus();},[searchOpen]);
 function close(){setQuery("");setSearchOpen(false);requestAnimationFrame(()=>toggle.current?.focus());}
 return searchOpen ? <div className="messages-navbar-search"><label className="sr-only" htmlFor="messages-query">Rechercher dans les messages</label><input id="messages-query" ref={input} type="search" placeholder="Nom, email, objet…" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Escape")close();}}/><button type="button" className="eg-button eg-button--secondary eg-button--compact" onClick={close}>Fermer</button></div> : <button ref={toggle} type="button" className="eg-button eg-button--secondary eg-button--icon" aria-label="Rechercher un message" aria-expanded={false} onClick={()=>setSearchOpen(true)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button>;
}
