"use client";
import { useEffect,useRef,useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import EditorSelect from "./EditorSelect";
import AnnouncementGalleryUpload from "./AnnouncementGalleryUpload";
import EditorDate from "./EditorDate";
import AdminAnnouncementCard from "./AdminAnnouncementCard";
import EditorTime from "./EditorTime";
import PublicationPdfUpload from "./PublicationPdfUpload";
import { announcementInfos,validateAnnouncementInfo,TRAINING_FORMATS,PUBLICATION_TYPES } from "@/lib/announcement-fields.mjs";
import { ANNOUNCEMENT_TYPES,announcementActionUrl,announcementCategory } from "@/lib/announcements.mjs";
import { applicationRequirements,validateApplicationDocuments,MAX_APPLICATION_DOCUMENTS } from "@/lib/application-documents.mjs";
import "./project-editor.css";
import "./admin-projects.css";
import "./admin-announcements.css";
import "./announcement-editor.css";
function Field({id,label,children}){return <div className="editor-field"><label htmlFor={id}>{label}</label>{children}</div>;}
function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
export default function AnnonceForm({annonce}){
  const router=useRouter(),isEdit=!!annonce;
  const [form,setForm]=useState({titre:annonce?.titre||"",texte:annonce?.texte||"",image_url:annonce?.image_url||"",date:annonce?.date?.slice(0,10)||new Date().toISOString().slice(0,10),statut:annonce?.statut||"brouillon",categorie:announcementCategory(annonce?.categorie),resume:annonce?.resume||"",lieu:annonce?.lieu||"",echeance:annonce?.echeance||"",action_url:annonce?.action_url||"",action_label:annonce?.action_label||"",informations:announcementInfos(annonce?.informations),practicalDrafts:{},documents_candidature:applicationRequirements(annonce?.documents_candidature),galerie:Array.isArray(annonce?.galerie)?annonce.galerie:[]});
  const [error,setError]=useState(""),[loading,setLoading]=useState(false),[coverUploading,setCoverUploading]=useState(false),[galleryUploading,setGalleryUploading]=useState(false),[pdfUploading,setPdfUploading]=useState(false);
  const uploading=coverUploading||galleryUploading||pdfUploading;
  const saving=useRef(false),errorRef=useRef(null),textRef=useRef(null),caret=useRef(null);
  useEffect(()=>{if(error){errorRef.current?.focus();errorRef.current?.scrollIntoView?.({block:"center"});}},[error]);
  useEffect(()=>{if(caret.current!==null){textRef.current?.focus();textRef.current?.setSelectionRange?.(caret.current,caret.current);caret.current=null;}},[form.texte]);
  function update(key,value){setForm(f=>({...f,[key]:value}));}
  function updateInfo(key,value){setForm(f=>({...f,informations:{...f.informations,[f.categorie]:{...f.informations[f.categorie],[key]:value}}}));}
  function changeCategory(category){setForm(f=>{
    const cache={...f.practicalDrafts,[f.categorie]:{lieu:f.lieu,echeance:f.echeance,action_label:f.action_label,action_url:f.action_url}};
    return {...f,...(cache[category]||{lieu:"",echeance:"",action_label:"",action_url:""}),categorie:category,practicalDrafts:cache};
  });}
  function format(kind){const start=textRef.current?.selectionStart??form.texte.length,end=textRef.current?.selectionEnd??start,selection=form.texte.slice(start,end);const insertion=kind==="heading"?`\n\n## ${selection||"Sous-titre"}\n\n`:`\n\n${(selection||"Premier élément\nDeuxième élément").split("\n").map(line=>`- ${line}`).join("\n")}\n\n`;caret.current=start+insertion.length;update("texte",form.texte.slice(0,start)+insertion+form.texte.slice(end));}
  async function handleSubmit(e){e.preventDefault();if(saving.current||uploading||loading)return;setError("");
    if(!validDate(form.date)||(form.echeance&&!validDate(form.echeance))){setError("Renseignez une date complète et valide.");return;}
    if(Boolean(form.action_url.trim())!==Boolean(form.action_label.trim())){setError("Renseignez le libellé et le lien du bouton ensemble.");return;}
    if(form.action_url&&!announcementActionUrl(form.action_url)){setError("Le lien doit commencer par https://, http:// ou mailto:.");return;}
    if(form.categorie==="recrutement"){try{validateApplicationDocuments(form.documents_candidature);}catch(error){setError(error.message);return;}}
    let informations;try{informations=validateAnnouncementInfo(form.categorie,form.informations,form.echeance);}catch(error){setError(error.message);return;}
    const {practicalDrafts,...payload}=form;
    saving.current=true;setLoading(true);
    try{const res=await fetch(isEdit?`/api/admin/annonces/${annonce.id}`:"/api/admin/annonces",{method:isEdit?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...payload,informations,...(form.categorie!=="recrutement"?{documents_candidature:undefined}:{})})});const data=await res.json();if(!res.ok){setError(data.error||"Une erreur est survenue.");setLoading(false);return;}router.push("/admin/annonces");router.refresh();}catch{setError("Impossible d’enregistrer. Vérifiez votre connexion.");setLoading(false);}finally{saving.current=false;}
  }
  const busy=loading||uploading,saveLabel=uploading?"Envoi des fichiers…":loading?"Enregistrement…":isEdit?"Enregistrer les modifications":"Créer l’annonce";
  const type=form.categorie,info=form.informations[type];
  const infoTitle={recrutement:"Offre de recrutement",formation:"Organisation de la formation",evenement:"Retour sur l’événement",actualite:"Personnes et organisations",publication:"Ressource à consulter"}[type];
  const writingLabel={recrutement:"Présentation de l’offre",formation:"Programme et modalités",evenement:"Compte rendu de l’événement",actualite:"Texte de l’actualité",publication:"Présentation de la publication"}[type];
  const showAction=["recrutement","formation"].includes(type)||form.action_url||form.action_label;
  const actionFields=<><Field id="announcement-action-label" label={type==="formation"?"Bouton d’inscription":"Texte du bouton (facultatif)"}><input id="announcement-action-label" value={form.action_label} onChange={e=>update("action_label",e.target.value)} disabled={loading} maxLength={100} placeholder={type==="recrutement"?"Envoyer ma candidature":type==="formation"?"M’inscrire":"En savoir plus"}/></Field><Field id="announcement-action-url" label={type==="formation"?"Lien d’inscription":"Lien du bouton"}><input id="announcement-action-url" value={form.action_url} onChange={e=>update("action_url",e.target.value)} disabled={loading} maxLength={2000} placeholder="https://… ou mailto:…"/></Field></>;
  function Actions({mobile=false}){return <div className={mobile?"editor-mobile-actions":"editor-header-actions"}><a href="/admin/annonces" className="eg-button eg-button--secondary" aria-disabled={busy} onClick={e=>{if(busy)e.preventDefault();}}>Annuler</a><button type="submit" className="eg-button eg-button--primary" disabled={busy} aria-busy={busy}>{mobile&&isEdit&&!busy?"Enregistrer":saveLabel}</button></div>;}
  return <form onSubmit={handleSubmit} className="project-editor announcement-editor">
    <header className="editor-header"><h1>{isEdit?"Modifier l’annonce":"Nouvelle annonce"}</h1><Actions/></header>
    {error&&<div className="editor-error" role="alert" ref={errorRef} tabIndex={-1}>{error}</div>}
    <div className="announcement-editor-grid">
      <section className="editor-panel announcement-content" aria-labelledby="announcement-content-title">
        <h2 id="announcement-content-title">Contenu de l’annonce</h2>
        <Field id="annonceform-1" label="Titre"><input id="annonceform-1" value={form.titre} onChange={e=>update("titre",e.target.value)} required maxLength={300} disabled={loading} placeholder="Le titre de votre annonce"/></Field>
        <Field id="announcement-category" label="Type d’annonce"><EditorSelect id="announcement-category" value={form.categorie} options={ANNOUNCEMENT_TYPES} onChange={changeCategory} disabled={loading||uploading}/></Field>
        <Field id="announcement-summary" label="Résumé (facultatif)"><textarea id="announcement-summary" value={form.resume} onChange={e=>update("resume",e.target.value)} maxLength={500} disabled={loading} rows={2} placeholder="L’essentiel en quelques phrases…"/></Field>
        <div className="editor-field announcement-writing">
          <div className="announcement-writing-toolbar"><label htmlFor="annonceform-2">{writingLabel}</label><div className="announcement-format-tools" role="group" aria-label="Structurer le texte"><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={loading} onClick={()=>format("heading")}>Sous-titre</button><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={loading} onClick={()=>format("list")}>Liste</button></div></div>
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
        <EditorDate id="announcement-date" label="Date de publication de l’annonce" value={form.date} onChange={v=>update("date",v)} disabled={loading}/>
        <Field id="annonceform-4" label="Statut"><EditorSelect id="annonceform-4" value={form.statut} options={[{value:"brouillon",label:"Brouillon"},{value:"publie",label:"Publié"}]} onChange={v=>update("statut",v)} disabled={loading}/></Field>
      </section>
      <section className="editor-panel announcement-extra" aria-labelledby="announcement-extra-title">
        <h2 id="announcement-extra-title">{infoTitle}</h2>
        <div className="editor-fields">
          {type==="recrutement"&&<Field id="announcement-job" label="Poste"><input id="announcement-job" value={info.poste} onChange={e=>updateInfo("poste",e.target.value)} disabled={loading} maxLength={200} placeholder="Chargé(e) de projets"/></Field>}
          {type==="formation"&&<>
           <EditorDate id="training-start" label="Date de début" value={info.date_debut} onChange={v=>updateInfo("date_debut",v)} optional disabled={loading}/>
           <EditorDate id="training-end" label="Date de fin (facultatif)" value={info.date_fin} onChange={v=>updateInfo("date_fin",v)} optional disabled={loading}/>
           <EditorTime id="training-start-time" label="Heure de début" value={info.heure_debut} onChange={v=>updateInfo("heure_debut",v)} disabled={loading}/>
           <EditorTime id="training-end-time" label="Heure de fin" value={info.heure_fin} onChange={v=>updateInfo("heure_fin",v)} disabled={loading}/>
           <Field id="training-duration" label="Durée"><input id="training-duration" value={info.duree} onChange={e=>updateInfo("duree",e.target.value)} disabled={loading} maxLength={100} placeholder="Une journée, 12 heures…"/></Field>
           <Field id="training-format" label="Format"><EditorSelect id="training-format" value={info.format} options={TRAINING_FORMATS} onChange={v=>updateInfo("format",v)} disabled={loading}/></Field>
          </>}
          {type==="evenement"&&<EditorDate id="event-date" label="Date de l’activité" value={info.date_activite} onChange={v=>updateInfo("date_activite",v)} optional disabled={loading}/>}
          {["recrutement","formation","evenement"].includes(type)&&<Field id="announcement-location" label={type==="formation"&&info.format==="en_ligne"?"Lieu ou accès en ligne":"Lieu"}><input id="announcement-location" value={form.lieu} onChange={e=>update("lieu",e.target.value)} disabled={loading} maxLength={300} placeholder="Camayenne, Conakry…"/></Field>}
          {type==="formation"&&<>
           {info.format!=="presentiel"&&<Field id="training-platform" label="Plateforme"><input id="training-platform" value={info.plateforme} onChange={e=>updateInfo("plateforme",e.target.value)} disabled={loading} maxLength={200} placeholder="Zoom, Google Meet…"/></Field>}
           <Field id="training-audience" label="Public concerné"><textarea id="training-audience" value={info.public} onChange={e=>updateInfo("public",e.target.value)} disabled={loading} maxLength={500} rows={2} placeholder="Professionnels, entrepreneurs, associations…"/></Field>
           <Field id="training-price" label="Tarif (facultatif)"><input id="training-price" value={info.tarif} onChange={e=>updateInfo("tarif",e.target.value)} disabled={loading} maxLength={150} placeholder="Gratuit, 500 000 GNF…"/></Field>
          </>}
          {["recrutement","formation"].includes(type)&&<EditorDate id="announcement-deadline" label={type==="formation"?"Clôture des inscriptions":"Date limite de candidature"} value={form.echeance} onChange={v=>update("echeance",v)} optional disabled={loading}/>}
          {type==="evenement"&&<>
           <Field id="event-speakers" label="Intervenants (facultatif)"><textarea id="event-speakers" value={info.intervenants} onChange={e=>updateInfo("intervenants",e.target.value)} disabled={loading} maxLength={500} rows={2}/></Field>
           <div className="announcement-field-wide"><Field id="event-outcome" label="Bilan et points à retenir (facultatif)"><textarea id="event-outcome" value={info.bilan} onChange={e=>updateInfo("bilan",e.target.value)} disabled={loading} maxLength={2000} rows={3}/></Field></div>
          </>}
          {type==="actualite"&&<div className="announcement-field-wide"><Field id="news-people" label="Personnes ou organisations concernées (facultatif)"><textarea id="news-people" value={info.concernes} onChange={e=>updateInfo("concernes",e.target.value)} disabled={loading} maxLength={500} rows={2}/></Field></div>}
          {type==="publication"&&<>
           <Field id="publication-kind" label="Type de ressource"><EditorSelect id="publication-kind" value={info.nature} options={PUBLICATION_TYPES} onChange={v=>updateInfo("nature",v)} disabled={loading}/></Field>
           <Field id="publication-authors" label="Auteurs (facultatif)"><input id="publication-authors" value={info.auteurs} onChange={e=>updateInfo("auteurs",e.target.value)} disabled={loading} maxLength={500}/></Field>
           <EditorDate id="publication-document-date" label="Date du document" value={info.date_document} onChange={v=>updateInfo("date_document",v)} optional disabled={loading}/>
           <Field id="publication-support" label="Accès à la ressource"><EditorSelect id="publication-support" value={info.support} options={[{value:"pdf",label:"PDF depuis l’ordinateur"},{value:"lien",label:"Lien de consultation"}]} onChange={v=>updateInfo("support",v)} disabled={loading||pdfUploading}/></Field>
           <div className="announcement-field-wide">{info.support==="pdf"?<PublicationPdfUpload value={info.fichier_url} filename={info.fichier_nom} onChange={(url,name)=>setForm(f=>({...f,informations:{...f.informations,publication:{...f.informations.publication,fichier_url:url,fichier_nom:name}}}))} onUploadingChange={setPdfUploading} disabled={loading||coverUploading||galleryUploading}/>:<Field id="publication-source" label="Lien de consultation"><input id="publication-source" type="url" value={info.source_url} onChange={e=>updateInfo("source_url",e.target.value)} disabled={loading} maxLength={2000} placeholder="https://…"/></Field>}</div>
          </>}
          {showAction&&actionFields}
        </div>
      </section>
      {form.categorie==="recrutement"&&<section className="editor-panel announcement-documents-panel" aria-labelledby="announcement-documents-title">
        <div className="announcement-documents-heading"><h2 id="announcement-documents-title">Documents demandés</h2><span>PDF · 2 Mo par document</span></div>
        <div className="announcement-document-list">{form.documents_candidature.map(doc=><div className="announcement-document-row" key={doc.id}>
          <Field id={`announcement-document-${doc.id}`} label="Nom du document"><input id={`announcement-document-${doc.id}`} value={doc.label} onChange={e=>setForm(f=>({...f,documents_candidature:f.documents_candidature.map(d=>d.id===doc.id?{...d,label:e.target.value}:d)}))} maxLength={80} required disabled={loading} placeholder="CV, diplôme, portfolio…"/></Field>
          <Field id={`announcement-document-required-${doc.id}`} label="Pièce"><EditorSelect id={`announcement-document-required-${doc.id}`} value={doc.required?"required":"optional"} options={[{value:"required",label:"Obligatoire"},{value:"optional",label:"Facultative"}]} onChange={v=>setForm(f=>({...f,documents_candidature:f.documents_candidature.map(d=>d.id===doc.id?{...d,required:v==="required"}:d)}))} disabled={loading}/></Field>
          <button type="button" className="eg-button eg-button--quiet eg-button--compact" disabled={loading||form.documents_candidature.length===1} aria-label={`Retirer ${doc.label||"le document"}`} onClick={()=>setForm(f=>({...f,documents_candidature:f.documents_candidature.filter(d=>d.id!==doc.id)}))}>Retirer</button>
        </div>)}</div>
        <div className="announcement-document-add"><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={loading||form.documents_candidature.length>=MAX_APPLICATION_DOCUMENTS} onClick={()=>setForm(f=>({...f,documents_candidature:[...f.documents_candidature,{id:`piece_${crypto.randomUUID()}`,label:"",required:false}]}))}>Ajouter un document</button><span>{form.documents_candidature.length} / {MAX_APPLICATION_DOCUMENTS}</span></div>
      </section>}
      {!["recrutement","formation"].includes(type)&&<section className="editor-panel announcement-gallery-panel" aria-labelledby="announcement-gallery-panel-title">
        <h2 id="announcement-gallery-panel-title">{type==="evenement"?"Photos de l’activité":"Galerie de photos"}</h2>
        <AnnouncementGalleryUpload photos={form.galerie} onChange={photos=>update("galerie",photos)} onAdd={photos=>setForm(f=>({...f,galerie:[...f.galerie,...photos].slice(0,50)}))} onUploadingChange={setGalleryUploading} disabled={loading||coverUploading||pdfUploading}/>
      </section>}
    </div>
    <Actions mobile/>
  </form>;
}
