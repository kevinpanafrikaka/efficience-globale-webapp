"use client";
import { useEffect,useRef,useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import EditorSelect from "./EditorSelect";
import EditorDate from "./EditorDate";
import AdminAnnouncementCard from "./AdminAnnouncementCard";
import { ANNOUNCEMENT_TYPES,announcementActionUrl } from "@/lib/announcements.mjs";
import "./project-editor.css";
import "./admin-projects.css";
import "./admin-announcements.css";
import "./announcement-editor.css";
function Field({id,label,hint,children}){return <div className="editor-field"><label htmlFor={id}>{label}</label>{children}{hint&&<p className="editor-help">{hint}</p>}</div>;}
function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
export default function AnnonceForm({annonce}){
  const router=useRouter(),isEdit=!!annonce;
  const [form,setForm]=useState({titre:annonce?.titre||"",texte:annonce?.texte||"",image_url:annonce?.image_url||"",date:annonce?.date?.slice(0,10)||new Date().toISOString().slice(0,10),statut:annonce?.statut||"brouillon",categorie:annonce?.categorie||"vie",resume:annonce?.resume||"",lieu:annonce?.lieu||"",echeance:annonce?.echeance||"",action_url:annonce?.action_url||"",action_label:annonce?.action_label||""});
  const [error,setError]=useState(""),[loading,setLoading]=useState(false),[uploading,setUploading]=useState(false);
  const saving=useRef(false),errorRef=useRef(null),textRef=useRef(null),caret=useRef(null);
  useEffect(()=>{if(error){errorRef.current?.focus();errorRef.current?.scrollIntoView?.({block:"center"});}},[error]);
  useEffect(()=>{if(caret.current!==null){textRef.current?.focus();textRef.current?.setSelectionRange?.(caret.current,caret.current);caret.current=null;}},[form.texte]);
  function update(key,value){setForm(f=>({...f,[key]:value}));}
  function format(kind){const start=textRef.current?.selectionStart??form.texte.length,end=textRef.current?.selectionEnd??start,selection=form.texte.slice(start,end);const insertion=kind==="heading"?`\n\n## ${selection||"Sous-titre"}\n\n`:`\n\n${(selection||"Premier élément\nDeuxième élément").split("\n").map(line=>`- ${line}`).join("\n")}\n\n`;caret.current=start+insertion.length;update("texte",form.texte.slice(0,start)+insertion+form.texte.slice(end));}
  async function handleSubmit(e){e.preventDefault();if(saving.current||uploading||loading)return;setError("");
    if(!validDate(form.date)||(form.echeance&&!validDate(form.echeance))){setError("Renseignez une date complète et valide.");return;}
    if(Boolean(form.action_url.trim())!==Boolean(form.action_label.trim())){setError("Renseignez le libellé et le lien du bouton ensemble.");return;}
    if(form.action_url&&!announcementActionUrl(form.action_url)){setError("Le lien doit commencer par https://, http:// ou mailto:.");return;}
    saving.current=true;setLoading(true);
    try{const res=await fetch(isEdit?`/api/admin/annonces/${annonce.id}`:"/api/admin/annonces",{method:isEdit?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const data=await res.json();if(!res.ok){setError(data.error||"Une erreur est survenue.");setLoading(false);return;}router.push("/admin/annonces");router.refresh();}catch{setError("Impossible d’enregistrer. Vérifiez votre connexion.");setLoading(false);}finally{saving.current=false;}
  }
  const busy=loading||uploading,saveLabel=uploading?"Envoi de l’image…":loading?"Enregistrement…":isEdit?"Enregistrer les modifications":"Créer l’annonce";
  const practical=["recrutement","formation"].includes(form.categorie)||form.lieu||form.echeance||form.action_url||form.action_label;
  function Actions({mobile=false}){return <div className={mobile?"editor-mobile-actions":"editor-header-actions"}><a href="/admin/annonces" className="eg-button eg-button--secondary" aria-disabled={busy} onClick={e=>{if(busy)e.preventDefault();}}>Annuler</a><button type="submit" className="eg-button eg-button--primary" disabled={busy} aria-busy={busy}>{mobile&&isEdit&&!busy?"Enregistrer":saveLabel}</button></div>;}
  return <form onSubmit={handleSubmit} className="project-editor announcement-editor"><header className="editor-header"><div><h1>{isEdit?"Modifier l’annonce":"Nouvelle annonce"}</h1><p>{isEdit?"Mettez à jour cette actualité du cabinet.":"Partagez une actualité, une opportunité ou un rendez-vous."}</p></div><Actions/></header>
  {error&&<div className="editor-error" role="alert" ref={errorRef} tabIndex={-1}>{error}</div>}
  <div className="editor-layout"><div className="editor-main-column"><section className="editor-panel"><h2>Contenu de l’annonce</h2>
    <Field id="annonceform-1" label="Titre"><input id="annonceform-1" value={form.titre} onChange={e=>update("titre",e.target.value)} required maxLength={300} disabled={loading} placeholder="Le titre de votre annonce"/></Field>
    <Field id="announcement-category" label="Type d’annonce"><EditorSelect id="announcement-category" value={form.categorie} options={ANNOUNCEMENT_TYPES} onChange={v=>update("categorie",v)} disabled={loading}/></Field>
    <Field id="announcement-summary" label="Résumé" hint="Facultatif. Une introduction courte pour la carte et la page de l’annonce."><textarea id="announcement-summary" value={form.resume} onChange={e=>update("resume",e.target.value)} maxLength={500} disabled={loading} rows={2} placeholder="L’essentiel en quelques phrases…"/></Field>
    <div className="editor-field announcement-writing"><label htmlFor="annonceform-2">Texte de l’annonce</label><div className="announcement-format-tools" role="group" aria-label="Structurer le texte"><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={loading} onClick={()=>format("heading")}>Sous-titre</button><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={loading} onClick={()=>format("list")}>Liste</button></div><textarea id="annonceform-2" ref={textRef} value={form.texte} onChange={e=>update("texte",e.target.value)} rows={8} required maxLength={20000} disabled={loading} placeholder="Rédigez votre annonce…"/><p className="editor-help">Séparez les paragraphes par une ligne vide. Utilisez Sous-titre et Liste pour organiser le contenu.</p></div>
  </section></div>
  <div className="editor-side-column"><section className="editor-panel announcement-image"><h2>Image et aperçu</h2><div className="admin-projects admin-announcements announcement-preview"><AdminAnnouncementCard annonce={form} preview/></div><ImageUpload value={form.image_url} onChange={url=>update("image_url",url)} onUploadingChange={setUploading} allowRemove showPreview={false} disabled={loading||uploading}/><p className="editor-help">Sans image, une composition aux couleurs du cabinet prend le relais.</p></section>
  <section className="editor-panel"><h2>Publication</h2><EditorDate id="announcement-date" label="Date de l’annonce" value={form.date} onChange={v=>update("date",v)} disabled={loading}/><Field id="annonceform-4" label="Statut"><EditorSelect id="annonceform-4" value={form.statut} options={[{value:"brouillon",label:"Brouillon"},{value:"publie",label:"Publié"}]} onChange={v=>update("statut",v)} disabled={loading}/></Field><p className={`editor-status-help ${form.statut==="publie"?"is-published":""}`}>{form.statut==="publie"?"Visible sur le site public après enregistrement.":"Visible uniquement dans l’administration."}</p></section></div></div>
  {practical&&<section className="editor-panel announcement-extra"><h2>Informations utiles</h2><p className="editor-help">Facultatif. Précisez les modalités de participation ou de candidature.</p><div className="editor-fields"><Field id="announcement-location" label="Lieu"><input id="announcement-location" value={form.lieu} onChange={e=>update("lieu",e.target.value)} disabled={loading} maxLength={300} placeholder="Ex. Conakry ou en ligne"/></Field><EditorDate id="announcement-deadline" label="Date limite" value={form.echeance} onChange={v=>update("echeance",v)} optional disabled={loading}/><Field id="announcement-action-label" label="Texte du bouton"><input id="announcement-action-label" value={form.action_label} onChange={e=>update("action_label",e.target.value)} disabled={loading} maxLength={100} placeholder={form.categorie==="recrutement"?"Envoyer ma candidature":"M’inscrire"}/></Field><Field id="announcement-action-url" label="Lien du bouton" hint="Lien du formulaire, d’un site ou adresse mail précédée de mailto:."><input id="announcement-action-url" value={form.action_url} onChange={e=>update("action_url",e.target.value)} disabled={loading} maxLength={2000} placeholder="https://… ou mailto:…"/></Field></div></section>}
  <Actions mobile/>
  </form>;
}
