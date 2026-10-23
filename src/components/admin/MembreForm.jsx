"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import EditorSelect from "./EditorSelect";
import MemberCard from "./MemberCard";
import { expertiseTags } from "@/lib/member-expertises.mjs";
import "./project-editor.css";
import "./admin-projects.css";
import "./admin-team.css";
import "./member-editor.css";

function Field({ label, id, children }) {
  return <div className="editor-field"><label htmlFor={id}>{label}</label>{children}</div>;
}

export default function MembreForm({ membre }) {
  const router = useRouter();
  const isEdit = !!membre;
  const [form, setForm] = useState({
    nom: membre?.nom || "",
    role: membre?.role || "",
    bio: membre?.bio || "",
    expertises: [...expertiseTags(membre?.expertises), "", "", ""].slice(0, 3),
    photo_url: membre?.photo_url || "",
    statut: membre?.statut || "brouillon",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const saving = useRef(false), errorRef = useRef(null);
  useEffect(() => {
    if (error) { errorRef.current?.focus(); errorRef.current?.scrollIntoView?.({ block: "center", behavior: "instant" }); }
  }, [error]);
  function update(field, value) { setForm(f => ({ ...f, [field]: value })); }
  function updateExpertise(index, value) { setForm(f => ({ ...f, expertises: f.expertises.map((text, i) => i === index ? value : text) })); }
  async function handleSubmit(e) {
    e.preventDefault();
    if (saving.current || uploading || loading) return;
    saving.current = true;
    setLoading(true); setError("");
    const payload = { ...form, expertises: expertiseTags(form.expertises).join(", ") };
    try {
      const res = await fetch(isEdit ? `/api/admin/membres/${membre.id}` : "/api/admin/membres", {
        method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Une erreur est survenue."); setLoading(false); return; }
      router.push("/admin/membres"); router.refresh();
    } catch {
      setError("Impossible d’enregistrer. Vérifiez votre connexion."); setLoading(false);
    } finally { saving.current = false; }
  }
  const busy = loading || uploading;
  const expertiseCount = form.expertises.filter(text => text.trim()).length;
  const saveLabel = uploading ? "Envoi de la photo…" : loading ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le membre";
  function Actions({ mobile = false }) {
    return <div className={mobile ? "editor-mobile-actions" : "editor-header-actions"}>
      <a href="/admin/membres" className="eg-button eg-button--secondary" aria-disabled={busy} onClick={e => { if (busy) e.preventDefault(); }}>Annuler</a>
      <button type="submit" disabled={busy} aria-busy={busy} className="eg-button eg-button--primary">{mobile && !busy && isEdit ? "Enregistrer" : saveLabel}</button>
    </div>;
  }
  return <form onSubmit={handleSubmit} className="project-editor member-editor">
    <header className="editor-header"><h1>{isEdit ? "Modifier le membre" : "Nouveau membre"}</h1><Actions /></header>
    {error && <div className="editor-error" role="alert" ref={errorRef} tabIndex={-1}>{error}</div>}
    <div className="editor-layout">
      <div className="editor-main-column">
        <section className="editor-panel member-identity" aria-labelledby="member-identity-title">
          <h2 id="member-identity-title">Identité et fonction</h2>
          <Field label="Nom complet" id="membreform-1"><input id="membreform-1" value={form.nom} onChange={e => update("nom", e.target.value)} required maxLength={200} disabled={loading} autoComplete="name" placeholder="Prénom et nom du membre" /></Field>
          <Field label="Fonction au cabinet" id="membreform-2"><input id="membreform-2" value={form.role} onChange={e => update("role", e.target.value)} maxLength={300} disabled={loading} autoComplete="organization-title" placeholder="Ex. Consultant en santé publique" /></Field>
        </section>
        <section className="editor-panel member-biography" aria-labelledby="member-biography-title">
          <h2 id="member-biography-title">Parcours et expertises</h2>
          <Field label="Biographie" id="membreform-3"><textarea id="membreform-3" value={form.bio} onChange={e => update("bio", e.target.value)} maxLength={10000} disabled={loading} rows={6} placeholder="Quelques phrases pour présenter son parcours…" /></Field>
          <fieldset className="member-expertises" aria-describedby="member-expertises-help">
            <legend>Expertises <span className="member-expertise-count" aria-label={`${expertiseCount} expertises sur 3 renseignées`}>{expertiseCount}/3</span></legend>
            <div className="member-expertise-fields">{form.expertises.map((text, index) => <div className="member-expertise-row" key={index}>
              <label className="sr-only" htmlFor={`member-expertise-${index}`}>Expertise {index + 1}</label>
              <input id={`member-expertise-${index}`} value={text} onChange={e => updateExpertise(index, e.target.value)} maxLength={50} disabled={loading} placeholder={["Ex. Gouvernance", "Ex. Suivi-évaluation", "Ex. Gestion de projet"][index]} aria-describedby="member-expertises-help" />
              <button type="button" className="member-expertise-clear" disabled={loading || !text} aria-label={`Effacer l’expertise ${index + 1}`} onClick={() => updateExpertise(index, "")}>×</button>
            </div>)}</div>
            <p id="member-expertises-help" className="editor-help">50 caractères maximum par expertise.</p>
          </fieldset>
        </section>
      </div>
      <div className="editor-side-column">
        <section className="editor-panel member-photo" aria-labelledby="member-photo-title">
          <h2 id="member-photo-title">Photo et aperçu</h2>
          <div className="admin-projects admin-team member-card-preview"><MemberCard membre={{ ...form, nom: form.nom.trim() || "Nom du membre" }} preview /></div>
          <ImageUpload value={form.photo_url} onChange={url => update("photo_url", url)} onUploadingChange={setUploading} allowRemove showPreview={false} disabled={loading || uploading} />
        </section>
        <section className="editor-panel member-publication" aria-labelledby="member-publication-title">
          <h2 id="member-publication-title">Publication</h2>
          <Field label="Statut du profil" id="membreform-4"><EditorSelect id="membreform-4" value={form.statut} options={[{ value: "brouillon", label: "Brouillon" }, { value: "publie", label: "Publié" }]} onChange={value => update("statut", value)} disabled={loading} /></Field>
        </section>
      </div>
    </div>
    <Actions mobile />
  </form>;
}
