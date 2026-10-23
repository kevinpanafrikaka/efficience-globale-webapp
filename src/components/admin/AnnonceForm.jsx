"use client";
import { useEffect,useRef,useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import EditorSelect from "./EditorSelect";
import AnnouncementGalleryUpload from "./AnnouncementGalleryUpload";
import EditorDate from "./EditorDate";
import AdminAnnouncementCard from "./AdminAnnouncementCard";
import { ANNOUNCEMENT_TYPES,announcementActionUrl } from "@/lib/announcements.mjs";
import "./project-editor.css";
import "./admin-projects.css";
import "./admin-announcements.css";
import "./announcement-editor.css";
function Field({id,label,children}){return <div className="editor-field"><label htmlFor={id}>{label}</label>{children}</div>;}
function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
export default function AnnonceForm({annonce}){
  const router=useRouter(),isEdit=!!annonce;
  const [form,setForm]=useState({titre:annonce?.titre||"",texte:annonce?.texte||"",image_url:annonce?.image_url||"",date:annonce?.date?.slice(0,10)||new Date().toISOString().slice(0,10),statut:annonce?.statut||"brouillon",categorie:annonce?.categorie||"vie",resume:annonce?.resume||"",lieu:annonce?.lieu||"",echeance:annonce?.echeance||"",action_url:annonce?.action_url||"",action_label:annonce?.action_label||"",galerie:Array.isArray(annonce?.galerie)?annonce.galerie:[]});
  const [error,setError]=useState(""),[loading,setLoading]=useState(false),[coverUploading,setCoverUploading]=useState(false),[galleryUploading,setGalleryUploading]=useState(false);
  const uploading=coverUploading||galleryUploading;
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
  const busy=loading||uploading,saveLabel=uploading?"Envoi des images…":loading?"Enregistrement…":isEdit?"Enregistrer les modifications":"Créer l’annonce";
  const practical=["recrutement","formation"].includes(form.categorie)||form.lieu||form.echeance||form.action_url||form.action_label;
  function Actions({mobile=false}){return <div className={mobile?"editor-mobile-actions":"editor-header-actions"}><a href="/admin/annonces" className="eg-button eg-button--secondary" aria-disabled={busy} onClick={e=>{if(busy)e.preventDefault();}}>Annuler</a><button type="submit" className="eg-button eg-button--primary" disabled={busy} aria-busy={busy}>{mobile&&isEdit&&!busy?"Enregistrer":saveLabel}</button></div>;}
  return <form onSubmit={handleSubmit} className="project-editor announcement-editor">
    <header className="editor-header"><h1>{isEdit?"Modifier l’annonce":"Nouvelle annonce"}</h1><Actions/></header>
    {error&&<div className="editor-error" role="alert" ref={errorRef} tabIndex={-1}>{error}</div>}
    <div className="announcement-editor-grid">
      <section className="editor-panel announcement-content" aria-labelledby="announcement-content-title">
        <h2 id="announcement-content-title">Contenu de l’annonce</h2>
        <Field id="annonceform-1" label="Titre"><input id="annonceform-1" value={form.titre} onChange={e=>update("titre",e.target.value)} required maxLength={300} disabled={loading} placeholder="Le titre de votre annonce"/></Field>
        <Field id="announcement-category" label="Type d’annonce"><EditorSelect id="announcement-category" value={form.categorie} options={ANNOUNCEMENT_TYPES} onChange={v=>update("categorie",v)} disabled={loading}/></Field>
        <Field id="announcement-summary" label="Résumé (facultatif)"><textarea id="announcement-summary" value={form.resume} onChange={e=>update("resume",e.target.value)} maxLength={500} disabled={loading} rows={2} placeholder="L’essentiel en quelques phrases…"/></Field>
        <div className="editor-field announcement-writing">
          <div className="announcement-writing-toolbar"><label htmlFor="annonceform-2">Texte de l’annonce</label><div className="announcement-format-tools" role="group" aria-label="Structurer le texte"><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={loading} onClick={()=>format("heading")}>Sous-titre</button><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={loading} onClick={()=>format("list")}>Liste</button></div></div>
          <textarea id="annonceform-2" ref={textRef} value={form.texte} onChange={e=>update("texte",e.target.value)} rows={12} required maxLength={20000} disabled={loading} placeholder="Rédigez votre annonce…"/>
        </div>
      </section>
      <section className="editor-panel announcement-image" aria-labelledby="announcement-cover-title">
        <h2 id="announcement-cover-title">Couverture et aperçu</h2>
        <div className="admin-projects admin-announcements announcement-preview"><AdminAnnouncementCard annonce={form} preview/></div>
        <ImageUpload value={form.image_url} onChange={url=>update("image_url",url)} onUploadingChange={setCoverUploading} allowRemove showPreview={false} disabled={loading||uploading}/>
      </section>
      <section className="editor-panel announcement-publication" aria-labelledby="announcement-publication-title">
        <h2 id="announcement-publication-title">Publication</h2>
        <EditorDate id="announcement-date" label="Date de l’annonce" value={form.date} onChange={v=>update("date",v)} disabled={loading}/>
        <Field id="annonceform-4" label="Statut"><EditorSelect id="annonceform-4" value={form.statut} options={[{value:"brouillon",label:"Brouillon"},{value:"publie",label:"Publié"}]} onChange={v=>update("statut",v)} disabled={loading}/></Field>
      </section>
      {practical&&<section className="editor-panel announcement-extra" aria-labelledby="announcement-extra-title">
        <h2 id="announcement-extra-title">Informations utiles</h2>
        <div className="editor-fields">
          <Field id="announcement-location" label="Lieu"><input id="announcement-location" value={form.lieu} onChange={e=>update("lieu",e.target.value)} disabled={loading} maxLength={300} placeholder="Conakry ou en ligne"/></Field>
          <EditorDate id="announcement-deadline" label="Date limite" value={form.echeance} onChange={v=>update("echeance",v)} optional disabled={loading}/>
          <Field id="announcement-action-label" label="Texte du bouton"><input id="announcement-action-label" value={form.action_label} onChange={e=>update("action_label",e.target.value)} disabled={loading} maxLength={100} placeholder={form.categorie==="recrutement"?"Envoyer ma candidature":"M’inscrire"}/></Field>
          <Field id="announcement-action-url" label="Lien du bouton"><input id="announcement-action-url" value={form.action_url} onChange={e=>update("action_url",e.target.value)} disabled={loading} maxLength={2000} placeholder="https://… ou mailto:…"/></Field>
        </div>
      </section>}
      <section className="editor-panel announcement-gallery-panel" aria-labelledby="announcement-gallery-panel-title">
        <h2 id="announcement-gallery-panel-title">Galerie de photos</h2>
        <AnnouncementGalleryUpload photos={form.galerie} onChange={photos=>update("galerie",photos)} onAdd={photos=>setForm(f=>({...f,galerie:[...f.galerie,...photos].slice(0,50)}))} onUploadingChange={setGalleryUploading} disabled={loading||coverUploading}/>
      </section>
    </div>
    <Actions mobile/>
  </form>;
}
