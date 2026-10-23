"use client";
import { useRef,useState } from "react";
import AdminImage from "@/components/admin/AdminImage";
const MAX_PHOTOS=50;
export default function AnnouncementGalleryUpload({photos,onChange,onAdd,onUploadingChange,disabled=false}){
 const input=useRef(null),busy=useRef(false);
 const [uploading,setUploading]=useState(false),[progress,setProgress]=useState(""),[errors,setErrors]=useState([]);
 async function choose(e){
  const files=Array.from(e.target.files||[]);e.target.value="";
  if(!files.length||disabled||busy.current)return;
  const remaining=MAX_PHOTOS-photos.length;
  if(files.length>remaining){setErrors([`Vous pouvez encore ajouter ${remaining} photo${remaining>1?"s":""}.`]);return;}
  busy.current=true;setUploading(true);onUploadingChange?.(true);setErrors([]);
  const failures=[];
  try{
   for(let i=0;i<files.length;i++){
    const file=files[i];setProgress(`Envoi de la photo ${i+1} sur ${files.length}…`);
    if(!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)){failures.push(`${file.name} : choisissez une image JPG, PNG, WebP ou GIF.`);continue;}
    if(file.size>8*1024*1024){failures.push(`${file.name} : 8 Mo maximum par photo.`);continue;}
    try{const body=new FormData();body.append("file",file);const res=await fetch("/api/admin/upload",{method:"POST",body});const data=await res.json();if(!res.ok||typeof data.url!=="string"||!data.url){failures.push(`${file.name} : échec de l’envoi, réessayez.`);continue;}onAdd([{url:data.url,legende:""}]);}
    catch{failures.push(`${file.name} : connexion interrompue, réessayez.`);}
   }
   setErrors(failures);setProgress(failures.length?"Envoi terminé. Certaines photos n’ont pas été ajoutées.":"Photos ajoutées.");
  }finally{busy.current=false;setUploading(false);onUploadingChange?.(false);}
 }
 function move(index,offset){const target=index+offset;if(target<0||target>=photos.length||disabled||uploading)return;const next=[...photos];[next[index],next[target]]=[next[target],next[index]];onChange(next);}
 return <div className="announcement-gallery-editor" aria-busy={uploading}>
  <div className="gallery-editor-toolbar"><input type="file" ref={input} multiple accept="image/jpeg,image/png,image/webp,image/gif" className="admin-upload-input" aria-label="Choisir plusieurs photos pour la galerie" disabled={disabled||uploading||photos.length>=MAX_PHOTOS} onChange={choose}/><button type="button" className="eg-button eg-button--secondary" disabled={disabled||uploading||photos.length>=MAX_PHOTOS} onClick={()=>input.current?.click()}>{uploading?"Envoi des photos…":"+ Ajouter des photos"}</button><span>{photos.length} photo{photos.length>1?"s":""}</span></div>
  <p className="editor-help">JPG, PNG, WebP ou GIF · 8 Mo par photo · 50 photos maximum.</p>
  {progress&&<p className="gallery-upload-progress" role="status">{progress}</p>}
  {errors.length>0&&<ul className="gallery-upload-errors" role="alert">{errors.map((error,i)=><li key={i}>{error}</li>)}</ul>}
  {photos.length>0&&<div className="gallery-editor-grid">{photos.map((photo,index)=><div className="gallery-editor-photo" key={photo.url}>
   <div className="gallery-editor-preview"><AdminImage src={photo.url} alt={`Photo ${index+1} de la galerie`}/><span>{index+1}</span></div>
   <div className="gallery-editor-caption"><label htmlFor={`announcement-photo-caption-${index}`}>Description <span>(facultatif)</span></label><input id={`announcement-photo-caption-${index}`} value={photo.legende||""} maxLength={300} disabled={disabled||uploading} placeholder="Ex. Atelier de groupe" onChange={e=>onChange(photos.map((p,i)=>i===index?{...p,legende:e.target.value}:p))}/></div>
   <div className="gallery-editor-actions"><button type="button" disabled={disabled||uploading||index===0} onClick={()=>move(index,-1)} aria-label={`Placer la photo ${index+1} avant la précédente`}>Avant</button><button type="button" disabled={disabled||uploading||index===photos.length-1} onClick={()=>move(index,1)} aria-label={`Placer la photo ${index+1} après la suivante`}>Après</button><button type="button" disabled={disabled||uploading} onClick={()=>onChange(photos.filter((_,i)=>i!==index))} aria-label={`Retirer la photo ${index+1} de la galerie`}>Retirer</button></div>
  </div>)}</div>}
 </div>;
}
