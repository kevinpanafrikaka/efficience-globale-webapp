"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";

const inputClass =
  "rounded-lg border border-line px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-lime w-full";
const labelClass = "text-[13px] font-semibold text-dark";

export default function PartenaireForm({ partenaire }) {
  const router = useRouter();
  const isEdit = !!partenaire;

  const [form, setForm] = useState({
    nom: partenaire?.nom || "",
    logo_url: partenaire?.logo_url || "",
    site_web: partenaire?.site_web || "",
    statut: partenaire?.statut || "brouillon",
    ordre_affichage: partenaire?.ordre_affichage ?? 0,
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
    saving.current = true;
    setLoading(true);
    setError("");

    const payload = { ...form, ordre_affichage: Number(form.ordre_affichage) || 0 };

    try {
      const res = await fetch(isEdit ? `/api/admin/partenaires/${partenaire.id}` : "/api/admin/partenaires", {
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
      router.push("/admin/partenaires");
      router.refresh();
    } catch {
      setError("Impossible d'enregistrer. Vérifiez votre connexion.");
      setLoading(false);
    } finally {
      saving.current = false;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="partenaireform-1" className={labelClass}>Nom</label>
        <input id="partenaireform-1" value={form.nom} onChange={(e) => update("nom", e.target.value)} required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className={labelClass}>Logo (optionnel)</p>
        <ImageUpload value={form.logo_url} onChange={(url) => update("logo_url", url)} onUploadingChange={setUploading} disabled={loading} />
        {form.logo_url && (
          <button
            type="button"
            onClick={() => update("logo_url", "")}
            className="text-[12.5px] text-ink-faint hover:text-red-600 w-fit"
          >
            Retirer le logo (le nom sera affiché à la place)
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="partenaireform-2" className={labelClass}>Site web (optionnel)</label>
        <input id="partenaireform-2"
          type="url"
          value={form.site_web}
          onChange={(e) => update("site_web", e.target.value)}
          placeholder="https://…"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="partenaireform-3" className={labelClass}>Statut</label>
          <select id="partenaireform-3" value={form.statut} onChange={(e) => update("statut", e.target.value)} className={inputClass}>
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publié</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="partenaireform-4" className={labelClass}>Ordre d&apos;affichage</label>
          <input id="partenaireform-4"
            type="number"
            value={form.ordre_affichage}
            onChange={(e) => update("ordre_affichage", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {error && <p role="alert" className="text-[13.5px] text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || uploading}
        className="mt-1 inline-flex items-center justify-center rounded bg-lime px-6 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2 disabled:opacity-60 disabled:pointer-events-none w-fit"
      >
        {loading ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le partenaire"}
      </button>
    </form>
  );
}
