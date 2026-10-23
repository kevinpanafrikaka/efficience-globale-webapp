"use client";
import { useEffect,useRef,useState } from "react";
import Image from "@/components/PublicImage";
import "./announcement-gallery.css";
export default function AnnouncementGallery({photos,title}){
 const [index,setIndex]=useState(null),dialog=useRef(null),opener=useRef(null);
 const open=index!==null,active=open?photos[index]:null;
 function navigate(offset){setIndex(current=>current===null?null:(current+offset+photos.length)%photos.length);}
 useEffect(()=>{
  if(!open)return;
  const node=dialog.current;if(!node)return;
  const previous=document.body.style.overflow;document.body.style.overflow="hidden";
  if(!node.open)node.showModal();
  return()=>{node.close();document.body.style.overflow=previous;opener.current?.focus?.({preventScroll:true});};
 },[open]);
 if(!photos.length)return null;
 return <section className="announcement-gallery" aria-labelledby="announcement-gallery-title">
  <div className="announcement-gallery-heading"><h2 id="announcement-gallery-title">En images</h2><span>{photos.length} photo{photos.length>1?"s":""}</span></div>
  <p className="announcement-gallery-help">Sélectionnez une photo pour l’agrandir.</p>
  <div className="announcement-photo-grid">{photos.map((photo,i)=><figure key={`${photo.url}-${i}`}><button type="button" className="announcement-photo-tile" aria-label={`Agrandir la photo ${i+1}${photo.legende?` : ${photo.legende}`:""}`} onClick={e=>{opener.current=e.currentTarget;setIndex(i);}}><Image src={photo.url} alt={photo.legende||`Photo ${i+1} · ${title}`} width={640} height={480} className="announcement-photo-thumb"/><span className="announcement-photo-open" aria-hidden="true">Agrandir</span></button>{photo.legende&&<figcaption>{photo.legende}</figcaption>}</figure>)}</div>
  <dialog ref={dialog} className="announcement-photo-dialog" aria-label={`Galerie · ${title}`} onCancel={e=>{e.preventDefault();setIndex(null);}} onClick={e=>{if(e.target===e.currentTarget)setIndex(null);}} onKeyDown={e=>{if(e.key==="ArrowRight"){e.preventDefault();navigate(1);}if(e.key==="ArrowLeft"){e.preventDefault();navigate(-1);}}}>
   {active&&<div className="announcement-viewer"><div className="announcement-viewer-toolbar"><p aria-live="polite">Photo {index+1} / {photos.length}</p><button type="button" onClick={()=>setIndex(null)} autoFocus>Fermer</button></div><figure><Image src={active.url} alt={active.legende||`Photo ${index+1} · ${title}`} width={1600} height={1200} className="announcement-viewer-image" loading="eager"/><figcaption>{active.legende||title}</figcaption></figure><div className="announcement-viewer-navigation"><button type="button" disabled={photos.length<2} onClick={()=>navigate(-1)}>Précédente</button><button type="button" disabled={photos.length<2} onClick={()=>navigate(1)}>Suivante</button></div></div>}
  </dialog>
 </section>;
}
