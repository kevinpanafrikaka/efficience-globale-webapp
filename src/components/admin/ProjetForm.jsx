"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";

const SECTEURS = [
  { value: "sante", label: "Santé publique" },
  { value: "ia", label: "Intelligence Artificielle" },
  { value: "education", label: "Éducation" },
  { value: "gouvernance", label: "Gouvernance" },
  { value: "local", label: "Développement local" },
  { value: "partenariat", label: "Partenariat" },
];

const inputClass =
  "rounded-lg border border-line px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-lime w-full";
const labelClass = "text-[13px] font-semibold text-dark";

export default function ProjetForm({ projet }) {
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
    resultats: projet?.resultats?.join("\n") || "",
    photo_url: projet?.photo_url || "",
    statut: projet?.statut || "brouillon",
    ordre_affichage: projet?.ordre_affichage ?? 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const saving = useRef(false);
  const [uploading, setUploading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving.current || uploading) return;
    setError("");

    if (!form.photo_url) {
      setError("Une image est requise.");
      return;
    }

    saving.current = true;
    setLoading(true);

    const payload = {
      ...form,
      ordre_affichage: Number(form.ordre_affichage) || 0,
      resultats: form.resultats.split("\n").map((s) => s.trim()).filter(Boolean),
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="projetform-1" className={labelClass}>Titre</label>
        <input id="projetform-1"
          value={form.titre}
          onChange={(e) => update("titre", e.target.value)}
          required
          className={inputClass}
        />
      </div>

      {isEdit && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="projetform-2" className={labelClass}>Adresse de la page (slug)</label>
          <input id="projetform-2" value={form.slug} onChange={(e) => update("slug", e.target.value)} className={inputClass} />
          <p className="text-[12px] text-ink-faint">
            /realisations/{form.slug || "…"} — modifier ce champ change le lien public du projet.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="projetform-3" className={labelClass}>Mot en italique (optionnel)</label>
        <input id="projetform-3"
          value={form.titre_accent}
          onChange={(e) => update("titre_accent", e.target.value)}
          placeholder="Doit être une sous-chaîne exacte du titre"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="projetform-4" className={labelClass}>Secteur</label>
          <select id="projetform-4" value={form.secteur} onChange={(e) => update("secteur", e.target.value)} className={inputClass}>
            {SECTEURS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="projetform-5" className={labelClass}>Statut</label>
          <select id="projetform-5" value={form.statut} onChange={(e) => update("statut", e.target.value)} className={inputClass}>
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publié</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="projetform-6" className={labelClass}>Client / bailleur</label>
          <input id="projetform-6" value={form.client} onChange={(e) => update("client", e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="projetform-7" className={labelClass}>Période</label>
          <input id="projetform-7" value={form.periode} onChange={(e) => update("periode", e.target.value)} className={inputClass} />
        </div>
      </div>


      <div className="flex flex-col gap-1.5">
        <label htmlFor="projetform-8" className={labelClass}>Résumé (aperçu sur les cartes)</label>
        <textarea id="projetform-8"
          value={form.resume}
          onChange={(e) => update("resume", e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="projetform-9" className={labelClass}>Description (page détail)</label>
        <textarea id="projetform-9"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="projetform-10" className={labelClass}>Résultats obtenus (un par ligne)</label>
        <textarea id="projetform-10"
          value={form.resultats}
          onChange={(e) => update("resultats", e.target.value)}
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className={labelClass}>Image du projet</p>
        <ImageUpload value={form.photo_url} onChange={(url) => update("photo_url", url)} onUploadingChange={setUploading} disabled={loading} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="projetform-11" className={labelClass}>Ordre d&apos;affichage</label>
        <input id="projetform-11"
          type="number"
          value={form.ordre_affichage}
          onChange={(e) => update("ordre_affichage", e.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p role="alert" className="text-[13.5px] text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || uploading}
        className="mt-1 inline-flex items-center justify-center rounded bg-lime px-6 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2 disabled:opacity-60 disabled:pointer-events-none w-fit"
      >
        {loading ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le projet"}
      </button>
    </form>
  );
}
