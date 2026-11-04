"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import AdminImage from "@/components/admin/AdminImage";
import EditorSelect from "./EditorSelect";
import "./project-editor.css";
import "./admin-partners.css";

export default function PartenaireForm({ partenaire, initialOrder = 0 }) {
  const router = useRouter(), isEdit = !!partenaire;
  const [form, setForm] = useState({ nom: partenaire?.nom || "", logo_url: partenaire?.logo_url || "", site_web: partenaire?.site_web || "", statut: partenaire?.statut || "brouillon", ordre_affichage: partenaire?.ordre_affichage ?? initialOrder });
  const [error, setError] = useState(""), [loading, setLoading] = useState(false), [uploading, setUploading] = useState(false);
  const saving = useRef(false), errorRef = useRef(null);
  useEffect(() => { if (error) { errorRef.current?.focus(); errorRef.current?.scrollIntoView?.({ block: "center" }); } }, [error]);
  function update(field, value) { setForm(f => ({ ...f, [field]: value })); }
  async function handleSubmit(e) {
    e.preventDefault();
    if (saving.current || uploading || loading) return;
    saving.current = true; setLoading(true); setError("");
    try {
      const res = await fetch(isEdit ? `/api/admin/partenaires/${partenaire.id}` : "/api/admin/partenaires", { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Une erreur est survenue."); setLoading(false); return; }
      router.push("/admin/partenaires"); router.refresh();
    } catch { setError("Impossible d’enregistrer. Vérifiez votre connexion."); setLoading(false); }
    finally { saving.current = false; }
  }
  const busy = loading || uploading;
  const saveLabel = uploading ? "Envoi du logo…" : loading ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le partenaire";
  function Actions({ mobile = false }) {
    return <div className={mobile ? "editor-mobile-actions" : "editor-header-actions"}><a href="/admin/partenaires" className="eg-button eg-button--secondary" aria-disabled={busy} onClick={e => { if (busy) e.preventDefault(); }}>Annuler</a><button type="submit" className="eg-button eg-button--primary" disabled={busy} aria-busy={busy}>{mobile && isEdit && !busy ? "Enregistrer" : saveLabel}</button></div>;
  }
  return <form className="project-editor partner-editor" onSubmit={handleSubmit}>
    <header className="editor-header"><h1>{isEdit ? "Modifier le partenaire" : "Nouveau partenaire"}</h1><Actions /></header>
    {error && <div role="alert" className="editor-error" ref={errorRef} tabIndex={-1}>{error}</div>}
    <div className="partner-editor-layout">
      <section className="editor-panel partner-logo-panel" aria-labelledby="partner-logo-title"><h2 id="partner-logo-title">Logo</h2>
        <div className="partner-logo partner-logo-preview">{form.logo_url ? <AdminImage src={form.logo_url} alt={`Logo de ${form.nom || "votre partenaire"}`} className="partner-logo-image" /> : <span className="partner-logo-empty">{form.nom.trim() || "Logo du partenaire"}</span>}</div>
        <ImageUpload value={form.logo_url} onChange={url => update("logo_url", url)} onUploadingChange={setUploading} disabled={busy} showPreview={false} />
        {form.logo_url && <button type="button" disabled={busy} className="eg-button eg-button--quiet eg-button--compact admin-upload-clear" onClick={() => update("logo_url", "")}>Retirer le logo</button>}
      </section>
      <section className="editor-panel partner-details-panel" aria-labelledby="partner-details-title"><h2 id="partner-details-title">Informations du partenaire</h2>
        <div className="editor-field"><label htmlFor="partenaireform-1">Nom du partenaire</label><input id="partenaireform-1" value={form.nom} onChange={e => update("nom", e.target.value)} maxLength={200} required disabled={loading} autoComplete="organization" placeholder="Ex. Gavi" /></div>
        <div className="editor-field"><label htmlFor="partenaireform-2">Site web (optionnel)</label><input id="partenaireform-2" type="url" value={form.site_web} onChange={e => update("site_web", e.target.value)} maxLength={2000} disabled={loading} placeholder="https://…" autoComplete="url" /></div>
        <div className="editor-field"><label htmlFor="partenaireform-3">Statut</label><EditorSelect id="partenaireform-3" value={form.statut} options={[{ value: "brouillon", label: "Brouillon" }, { value: "publie", label: "Publié" }]} onChange={value => update("statut", value)} disabled={loading} /></div>
      </section>
    </div>
    <Actions mobile />
  </form>;
}
