"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import AdminImage from "@/components/admin/AdminImage";
import "./project-editor.css";
import EditorSelect from "./EditorSelect";
import ProjectPeriodField from "./ProjectPeriodField";

const SECTEURS = [
  { value: "sante", label: "Santé publique" },
  { value: "ia", label: "Intelligence Artificielle" },
  { value: "education", label: "Éducation" },
  { value: "gouvernance", label: "Gouvernance" },
  { value: "local", label: "Développement local" },
  { value: "partenariat", label: "Partenariat" },
];

function EditorSection({ title, name, children, collapsible = false }) {
  const [open, setOpen] = useState(false);
  return <section className={`editor-panel ${collapsible ? "editor-collapsible" : ""}`}>
    {collapsible ? <><h2 className="editor-desktop-heading">{title}</h2><h2 className="editor-mobile-heading"><button type="button" aria-expanded={open} aria-controls={`editor-${name}`} onClick={() => setOpen(!open)}>{title}<span aria-hidden="true">{open ? "−" : "+"}</span></button></h2></> : <h2>{title}</h2>}
    <div id={`editor-${name}`} className="editor-section-content" data-open={open}>{children}</div>
  </section>;
}
function Field({ label, id, hint, children, wide = false }) {
  return <div className={`editor-field ${wide ? "editor-field-wide" : ""}`}><label htmlFor={id}>{label}</label>{children}{hint && <p className="editor-help">{hint}</p>}</div>;
}

export default function ProjetForm({ projet, partenaires = [] }) {
  const router = useRouter();
  const isEdit = !!projet;

  const [form, setForm] = useState({
    titre: projet?.titre || "",
    slug: projet?.slug || "",
    titre_accent: projet?.titre_accent || "",
    secteur: projet?.secteur || "sante",
    client: projet?.client || "",
    periode: projet?.periode || "",
    resume: projet?.resume || "",
    description: projet?.description || "",
    resultats: (projet?.resultats?.length ? projet.resultats : [""]).map((text, i) => ({ id: `result-${i}`, text })),
    photo_url: projet?.photo_url || "",
    statut: projet?.statut || "brouillon",
  });
  const [error, setError] = useState("");
  const [periodError, setPeriodError] = useState("");
  const [loading, setLoading] = useState(false);
  const saving = useRef(false);
  const [uploading, setUploading] = useState(false);
  const nextResultId = useRef(projet?.resultats?.length || 1);
  const resultInputs = useRef({});
  const focusResult = useRef(null);
  useEffect(() => {
    if (focusResult.current !== null) {
      resultInputs.current[focusResult.current]?.focus();
      focusResult.current = null;
    }
  }, [form.resultats]);
  function editResult(id, text) {
    setForm(f => ({ ...f, resultats: f.resultats.map(r => r.id === id ? { ...r, text } : r) }));
  }
  function addResult() {
    if (form.resultats.length >= 50) return;
    const id = `result-${nextResultId.current++}`;
    focusResult.current = id;
    setForm(f => ({ ...f, resultats: [...f.resultats, { id, text: "" }] }));
  }
  function removeResult(id) {
    const index = form.resultats.findIndex(r => r.id === id);
    const remaining = form.resultats.filter(r => r.id !== id);
    if (!remaining.length) remaining.push({ id, text: "" });
    focusResult.current = remaining[Math.min(index, remaining.length - 1)].id;
    setForm(f => ({ ...f, resultats: remaining }));
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving.current || uploading) return;
    setError("");

    if (periodError) { setError(periodError); return; }

    if (!form.photo_url) {
      setError("Une image est requise.");
      return;
    }

    saving.current = true;
    setLoading(true);

    const payload = {
      ...form,
      resultats: form.resultats.map(r => r.text.trim()).filter(Boolean),
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/projets/${projet.id}` : "/api/admin/projets", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        setLoading(false);
        return;
      }
      router.push("/admin/projets");
      router.refresh();
    } catch {
      setError("Impossible d'enregistrer. Vérifiez votre connexion.");
      setLoading(false);
    } finally {
      saving.current = false;
    }
  }

  const busy = loading || uploading;
  const statusLabel = form.statut === "publie" ? "Publié" : "Brouillon";
  const saveLabel = uploading ? "Envoi de l’image…" : loading ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le projet";
  function Actions({ mobile = false }) {
    return <div className={mobile ? "editor-mobile-actions" : "editor-header-actions"}>
      <a href="/admin/projets" className="eg-button eg-button--secondary" aria-disabled={busy} onClick={e => { if (busy) e.preventDefault(); }}>Annuler</a>
      <button type="submit" disabled={busy} aria-busy={busy} className="eg-button eg-button--primary">{mobile && !busy && isEdit ? "Enregistrer" : saveLabel}</button>
    </div>;
  }
  return <form onSubmit={handleSubmit} className="project-editor">
    <header className="editor-header"><div><h1>{isEdit ? "Modifier le projet" : "Nouveau projet"}</h1><p>{isEdit ? "Mettez à jour votre réalisation." : "Présentez une réalisation du cabinet."}</p></div><Actions /></header>
    {error && <div className="editor-error" role="alert">{error}</div>}
    <div className="editor-layout"><div className="editor-main-column">
      <div className="editor-general"><EditorSection title="Informations générales" name="general">
        <div className="editor-fields">
          <Field label="Titre du projet" id="projetform-1" wide><input id="projetform-1" value={form.titre} onChange={e => update("titre", e.target.value)} required placeholder="Nom du projet" /></Field>
          <Field label="Secteur" id="projetform-4"><EditorSelect id="projetform-4" value={form.secteur} options={SECTEURS.map(s => ({ value: s.value, label: s.label }))} onChange={v => update("secteur",v)} disabled={loading} /></Field>
          <Field label="Client / bailleur / partenaire" id="projetform-6"><EditorSelect id="projetform-6" value={form.client.split(/\s*·\s*/).map(s => s.trim()).filter(Boolean)} options={partenaires.filter(p => p.nom).map(p => ({ value: p.nom, label: p.nom }))} onChange={v => update("client",v.join(" · "))} multiple searchable allowCustom placeholder="Choisir des organisations…" disabled={loading} /></Field>
          <div className="editor-field-wide"><ProjectPeriodField value={form.periode} onChange={v => update("periode",v)} onValidityChange={setPeriodError} disabled={loading} /></div>
        </div>
      </EditorSection></div>
      <div className="editor-presentation"><EditorSection title="Présentation" name="presentation" collapsible>
        <Field label="Résumé" id="projetform-8" hint="Visible sur les cartes du site."><textarea id="projetform-8" value={form.resume} onChange={e => update("resume", e.target.value)} rows={3} placeholder="Un résumé concis du projet…" /></Field>
        <Field label="Description" id="projetform-9" hint="Visible sur la page du projet."><textarea id="projetform-9" value={form.description} onChange={e => update("description", e.target.value)} rows={6} placeholder="Présentez le contexte, les objectifs et votre intervention…" /></Field>
      </EditorSection></div>
      </div><div className="editor-side-column"><div className="editor-image"><EditorSection title="Image du projet" name="image">
        <ImageUpload value={form.photo_url} onChange={url => update("photo_url", url)} onUploadingChange={setUploading} disabled={loading} required />
        <p className="editor-help">Une image au format paysage convient aux cartes du site.</p>
      </EditorSection></div>
      <div className="editor-publication"><EditorSection title="Publication" name="publication">
        <Field label="Statut" id="projetform-5"><EditorSelect id="projetform-5" value={form.statut} options={[{ value: "brouillon", label: "Brouillon" }, { value: "publie", label: "Publié" }]} onChange={v => update("statut",v)} disabled={loading} /></Field>
        <p className={`editor-status-help ${form.statut === "publie" ? "is-published" : ""}`}>{form.statut === "publie" ? "Publié : visible sur le site public après enregistrement." : "Brouillon : visible uniquement dans l’administration."}</p>
      </EditorSection></div>
      <div className="editor-preview"><EditorSection title="Aperçu de la carte" name="preview" collapsible>
        <div className="editor-preview-card">
          <div className="editor-preview-image">{form.photo_url ? <AdminImage src={form.photo_url} alt="Aperçu du projet" className="editor-preview-photo" /> : <span>Votre image apparaîtra ici</span>}</div>
          <div className="editor-preview-body"><div className="editor-preview-meta"><span>{statusLabel}</span><span>{SECTEURS.find(s => s.value === form.secteur)?.label}</span>{form.client && <span>{form.client}</span>}</div><h3>{form.titre || "Titre du projet"}</h3>{form.resume && <p>{form.resume}</p>}</div>
        </div>
        <p className="editor-help">L’aperçu se met à jour pendant la saisie.</p>
      </EditorSection></div>
    </div>
      <div className="editor-results"><EditorSection title="Résultats obtenus" name="results" collapsible>
        <p className="editor-help editor-results-intro">Présentez un résultat concret par champ. Privilégiez les réalisations mesurables et les changements obtenus.</p>
        <div className="editor-results-list">
          {form.resultats.map((r, i) => <div className="editor-result-item" key={r.id}>
            <div className="editor-result-heading"><label htmlFor={`project-${r.id}`}>Résultat {i + 1}</label><button type="button" disabled={loading} onClick={() => removeResult(r.id)} aria-label={`Retirer le résultat ${i + 1}`}>Retirer</button></div>
            <textarea id={`project-${r.id}`} ref={node => { resultInputs.current[r.id] = node; }} value={r.text} onChange={e => editResult(r.id, e.target.value)} rows={2} maxLength={1000} disabled={loading} placeholder={i === 0 ? "Ex. 150 professionnels formés à la gestion du programme." : "Décrivez un autre résultat obtenu…"} />
          </div>)}
        </div>
        <div className="editor-results-footer"><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={loading || form.resultats.length >= 50} onClick={addResult}>+ Ajouter un résultat</button><span className="editor-help">{form.resultats.filter(r => r.text.trim()).length} résultat{form.resultats.filter(r => r.text.trim()).length > 1 ? "s" : ""} renseigné{form.resultats.filter(r => r.text.trim()).length > 1 ? "s" : ""}</span></div>
      </EditorSection></div>
      <div className="editor-advanced"><details className="editor-panel editor-advanced-panel"><summary>Options avancées<span aria-hidden="true">+</span></summary><div className="editor-advanced-content">
        {isEdit && <Field label="Adresse de la page" id="projetform-2" hint={`Le lien public sera /realisations/${form.slug || "…"}. Modifier ce champ change l’adresse de la page.`}><input id="projetform-2" value={form.slug} onChange={e => update("slug", e.target.value)} /></Field>}
        <Field label="Mot en italique (optionnel)" id="projetform-3" hint="Recopiez exactement le mot ou l’expression du titre à mettre en italique."><input id="projetform-3" value={form.titre_accent} onChange={e => update("titre_accent", e.target.value)} /></Field>
      </div></details></div>
    </div>
    <Actions mobile />
  </form>;
}
