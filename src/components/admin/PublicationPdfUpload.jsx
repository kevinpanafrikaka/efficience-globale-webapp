"use client";
import { useRef,useState } from "react";
import { PUBLICATION_PDF_LIMIT } from "@/lib/announcement-fields.mjs";
export default function PublicationPdfUpload({value,filename,onChange,disabled=false,onUploadingChange}){
 const input=useRef(null),lock=useRef(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function choose(e){
  const file=e.target.files?.[0];e.target.value="";if(!file||lock.current||disabled)return;
  setError("");if(!/\.pdf$/i.test(file.name)||file.size>PUBLICATION_PDF_LIMIT||!file.size){setError("Choisissez un PDF de 8 Mo maximum.");return;}
  lock.current=true;setBusy(true);onUploadingChange?.(true);
  try{const form=new FormData();form.set("file",file);const response=await fetch("/api/admin/publications/document",{method:"POST",body:form});const data=await response.json();if(!response.ok||!/^\/documents\/[a-f0-9-]+$/.test(data.url||"")){setError(data.error||"Le PDF n’a pas pu être envoyé.");return;}onChange(data.url,data.nom||file.name);}
  catch{setError("Échec de l’envoi. Vérifiez votre connexion.");}
  finally{lock.current=false;setBusy(false);onUploadingChange?.(false);}
 }
 return <div className="publication-pdf-upload" aria-busy={busy}>
  <input ref={input} type="file" accept="application/pdf,.pdf" className="admin-upload-input" aria-label="Choisir un document PDF" tabIndex={-1} disabled={disabled||busy} onChange={choose}/>
  {value&&<div className="publication-pdf-selected"><span className="publication-pdf-mark" aria-hidden="true">PDF</span><a href={value} target="_blank" rel="noopener noreferrer">{filename||"Document PDF"}</a></div>}
  <div className="publication-pdf-actions"><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={disabled||busy} onClick={()=>input.current?.click()}>{busy?"Envoi du PDF…":value?"Changer le PDF":"Choisir un PDF sur l’ordinateur"}</button>{value&&<button type="button" className="eg-button eg-button--quiet eg-button--compact" disabled={disabled||busy} onClick={()=>onChange("","")}>Retirer le PDF</button>}</div>
  <span className="editor-help">PDF · 8 Mo maximum</span>{error&&<p role="alert" className="editor-help publication-pdf-error">{error}</p>}
 </div>;
}
