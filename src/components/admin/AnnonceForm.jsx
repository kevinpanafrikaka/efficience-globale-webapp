"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";

const inputClass =
  "rounded-lg border border-line px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-lime w-full";
const labelClass = "text-[13px] font-semibold text-dark";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AnnonceForm({ annonce }) {
  const router = useRouter();
  const isEdit = !!annonce;

  const [form, setForm] = useState({
    titre: annonce?.titre || "",
    texte: annonce?.texte || "",
    image_url: annonce?.image_url || "",
    date: annonce?.date?.slice(0, 10) || today(),
    statut: annonce?.statut || "brouillon",
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

    try {
      const res = await fetch(isEdit ? `/api/admin/annonces/${annonce.id}` : "/api/admin/annonces", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        setLoading(false);
        return;
      }
      router.push("/admin/annonces");
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
        <label htmlFor="annonceform-1" className={labelClass}>Titre</label>
        <input id="annonceform-1" value={form.titre} onChange={(e) => update("titre", e.target.value)} required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="annonceform-2" className={labelClass}>Texte</label>
        <textarea id="annonceform-2"
          value={form.texte}
          onChange={(e) => update("texte", e.target.value)}
          rows={5}
          required
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className={labelClass}>Image (optionnel)</p>
        <ImageUpload value={form.image_url} onChange={(url) => update("image_url", url)} onUploadingChange={setUploading} disabled={loading} />
        {form.image_url && <button type="button" disabled={loading || uploading} onClick={() => update("image_url", "")} className="admin-upload-clear">Retirer l’image de cette annonce</button>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="annonceform-3" className={labelClass}>Date</label>
          <input id="annonceform-3"
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="annonceform-4" className={labelClass}>Statut</label>
          <select id="annonceform-4" value={form.statut} onChange={(e) => update("statut", e.target.value)} className={inputClass}>
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publié</option>
          </select>
        </div>
      </div>

      {error && <p role="alert" className="text-[13.5px] text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || uploading}
        className="mt-1 inline-flex items-center justify-center rounded bg-lime px-6 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2 disabled:opacity-60 disabled:pointer-events-none w-fit"
      >
        {loading ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer l'annonce"}
      </button>
    </form>
  );
}
