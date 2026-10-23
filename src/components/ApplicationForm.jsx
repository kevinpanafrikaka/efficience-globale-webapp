"use client";
import { useEffect,useRef,useState } from "react";
const LIMIT=2*1024*1024;
function DocumentField({kind,label,required,file,onChange,disabled}){
 const input=useRef(null);
 return <div className={`application-document${file?" application-document--ready":""}`}>
  <span className="application-document-mark" aria-hidden="true">PDF</span>
  <div className="application-document-info">
   <label htmlFor={`application-${kind}`}>{label}</label>
   {file?<><span className="application-filename" role="status">{file.name}</span><span className="application-document-meta">{file.size<1024*1024?`${Math.max(1,Math.ceil(file.size/1024))} Ko`:`${(file.size/(1024*1024)).toLocaleString("fr-FR",{maximumFractionDigits:1})} Mo`} · Prêt à envoyer</span></>:<span className="application-document-meta">{required?"Obligatoire":"Facultative"} · PDF, 2 Mo max.</span>}
  </div>
  <input id={`application-${kind}`} ref={input} className="application-file-input" tabIndex={-1} type="file" accept="application/pdf,.pdf" disabled={disabled} onChange={e=>{onChange(e.target.files?.[0]||null);e.target.value="";}}/>
  <div className="application-document-actions"><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={disabled} onClick={()=>input.current?.click()} aria-label={`${file?"Changer":"Choisir"} ${label.toLowerCase()}`}>{file?"Changer":"Choisir le PDF"}</button>{file&&<button type="button" className="eg-button eg-button--quiet eg-button--compact" disabled={disabled} onClick={()=>onChange(null)} aria-label={`Retirer ${label.toLowerCase()}`}>Retirer</button>}</div>
 </div>;
}
export default function ApplicationForm({slug}){
 const [cv,setCv]=useState(null),[letter,setLetter]=useState(null),[error,setError]=useState(""),[busy,setBusy]=useState(false),[sent,setSent]=useState(false);
 const lock=useRef(false),requestId=useRef(null),feedback=useRef(null);
 useEffect(()=>{if(error||sent){feedback.current?.focus();feedback.current?.scrollIntoView?.({block:"center"});}},[error,sent]);
 function choose(kind,file){setError("");if(file&&(!/\.pdf$/i.test(file.name)||file.size>LIMIT)){setError("Choisissez un PDF de 2 Mo maximum par document.");return;}if(kind==="cv")setCv(file);else setLetter(file);}
 async function submit(e){
  e.preventDefault();if(lock.current)return;setError("");if(!cv){setError("Ajoutez votre CV au format PDF.");return;}
  const data=new FormData(e.currentTarget);requestId.current??=crypto.randomUUID();data.set("request_id",requestId.current);data.set("cv",cv);if(letter)data.set("lettre",letter);
  lock.current=true;setBusy(true);
  try{const response=await fetch(`/api/candidatures/${encodeURIComponent(slug)}`,{method:"POST",body:data});const result=await response.json();if(!response.ok){setError(result.error||"L’envoi a échoué. Réessayez.");return;}setSent(true);setCv(null);setLetter(null);}
  catch{setError("L’envoi n’a pas pu être confirmé. Vérifiez votre connexion puis réessayez.");}
  finally{lock.current=false;setBusy(false);}
 }
 if(sent)return <div className="application-result" role="status" ref={feedback} tabIndex={-1}><h2>Votre candidature a été reçue.</h2><p>Merci pour votre intérêt pour Efficience Globale.</p></div>;
 return <form className="application-form" onSubmit={submit} aria-busy={busy}>
  {error&&<p ref={feedback} tabIndex={-1} className="application-error" role="alert">{error}</p>}
  <fieldset className="application-contact" disabled={busy}><legend>Vos coordonnées</legend><div className="application-fields">
   <div><label htmlFor="application-name">Nom complet</label><input id="application-name" name="nom" required maxLength={120} autoComplete="name"/></div>
   <div><label htmlFor="application-email">Email</label><input id="application-email" name="email" type="email" required maxLength={200} autoComplete="email"/></div>
   <div><label htmlFor="application-phone">Téléphone (facultatif)</label><input id="application-phone" name="telephone" type="tel" maxLength={40} autoComplete="tel"/></div>
  </div></fieldset>
  <fieldset className="application-dossier" disabled={busy}><legend>Votre dossier</legend><div className="application-documents"><DocumentField kind="cv" label="CV" required file={cv} onChange={file=>choose("cv",file)} disabled={busy}/><DocumentField kind="lettre" label="Lettre de motivation" file={letter} onChange={file=>choose("lettre",file)} disabled={busy}/></div></fieldset>
  <div className="application-message"><label htmlFor="application-message">Message (facultatif)</label><textarea id="application-message" name="message" rows={3} maxLength={5000} disabled={busy}/></div>
  <div className="application-honeypot" aria-hidden="true"><label htmlFor="application-website">Site web</label><input id="application-website" name="site_web" tabIndex={-1} autoComplete="off"/></div>
  <div className="application-submit"><p className="application-retention">Votre dossier est transmis au cabinet par email.<br/>Les copies sur le site sont conservées 30 jours.</p>
  <button type="submit" className="eg-button eg-button--primary" disabled={busy}>{busy?"Envoi de la candidature…":"Envoyer ma candidature"}</button></div>
 </form>;
}
