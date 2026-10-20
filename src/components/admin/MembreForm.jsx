"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";

const inputClass =
  "rounded-lg border border-line px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-lime w-full";
const labelClass = "text-[13px] font-semibold text-dark";

export default function MembreForm({ membre }) {
  const router = useRouter();
  const isEdit = !!membre;

  const [form, setForm] = useState({
    nom: membre?.nom || "",
    role: membre?.role || "",
    bio: membre?.bio || "",
    expertises: membre?.expertises || "",
    photo_url: membre?.photo_url || "",
    statut: membre?.statut || "brouillon",
    ordre_affichage: membre?.ordre_affichage ?? 0,
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
    if (uploading || loading) return;
    saving.current = true;
    setLoading(true);
    setError("");

    const payload = { ...form, ordre_affichage: Number(form.ordre_affichage) || 0 };

    try {
      const res = await fetch(isEdit ? `/api/admin/membres/${membre.id}` : "/api/admin/membres", {
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
      router.push("/admin/membres");
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
        <label htmlFor="membreform-1" className={labelClass}>Nom</label>
        <input id="membreform-1" value={form.nom} onChange={(e) => update("nom", e.target.value)} required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="membreform-2" className={labelClass}>Rôle</label>
        <input id="membreform-2" value={form.role} onChange={(e) => update("role", e.target.value)} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="membreform-3" className={labelClass}>Bio</label>
        <textarea id="membreform-3"
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="member-expertises" className={labelClass}>Expertises (facultatif)</label>
        <input id="member-expertises" value={form.expertises} onChange={(event) => update("expertises", event.target.value)}
          placeholder="Gouvernance, Suivi-évaluation, Gestion de projet" aria-describedby="expertises-help" className={inputClass} />
        <p id="expertises-help" className="text-[12px] text-ink-soft">Jusqu’à 3 expertises séparées par des virgules, 50 caractères chacune.</p>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className={`${labelClass} mb-2`}>Photo du membre</legend>
        <ImageUpload
          value={form.photo_url}
          onChange={(url) => update("photo_url", url)}
          onUploadingChange={setUploading}
          allowRemove
          disabled={loading || uploading}
        />
        <p className="text-[12px] text-ink-soft mt-1">
          Sélectionnez un portrait depuis votre ordinateur, puis enregistrez le membre pour conserver la photo.
        </p>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="membreform-4" className={labelClass}>Statut</label>
          <select id="membreform-4" value={form.statut} onChange={(e) => update("statut", e.target.value)} className={inputClass}>
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publié</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="membreform-5" className={labelClass}>Ordre d&apos;affichage</label>
          <input id="membreform-5"
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
        {uploading ? "Envoi de la photo…" : loading ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le membre"}
      </button>
    </form>
  );
}
