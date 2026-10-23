"use client";
import { useEffect, useRef, useState } from "react";
import DeleteButton from "@/components/admin/DeleteButton";
export default function AnnouncementOptions({ annonce }) {
  const [open,setOpen] = useState(false), [below,setBelow] = useState(false), [room,setRoom] = useState(240);
  const root=useRef(null), trigger=useRef(null);
  useEffect(() => {
    if (!open) return;
    function position() {
      const rect=trigger.current?.getBoundingClientRect?.(); if (!rect) return;
      const viewport=window.visualViewport, top=Math.max(viewport?.offsetTop || 0,document.querySelector?.(".admin-topbar")?.getBoundingClientRect?.().bottom || 0), bottom=viewport ? viewport.height+viewport.offsetTop : window.innerHeight;
      const before=rect.top-top-12, after=bottom-rect.bottom-12, down=before<120 && after>before;
      setBelow(down); setRoom(Math.max(0,Math.min(240,down?after:before)));
    }
    const outside=e=>{if(!root.current?.contains(e.target))setOpen(false);};
    const escape=e=>{if(e.key==="Escape"){setOpen(false);trigger.current?.focus();}};
    position();document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);window.addEventListener("resize",position);window.addEventListener("scroll",position,true);
    return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape);window.removeEventListener("resize",position);window.removeEventListener("scroll",position,true);};
  },[open]);
  return <div className="announcement-options" ref={root}><button type="button" ref={trigger} className="eg-button eg-button--secondary eg-button--icon" aria-label={`Options pour ${annonce.titre}`} aria-expanded={open} aria-controls={`announcement-options-${annonce.id}`} onClick={()=>setOpen(!open)}>···</button>{open&&<div id={`announcement-options-${annonce.id}`} className="announcement-options-panel" data-below={below} style={{maxHeight:`${room}px`}} role="group" aria-label={`Actions pour ${annonce.titre}`}><DeleteButton endpoint={`/api/admin/annonces/${annonce.id}`} confirmMessage={`Supprimer « ${annonce.titre} » définitivement ?`} /></div>}</div>;
}
