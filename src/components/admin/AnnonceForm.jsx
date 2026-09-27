"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
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
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Titre</label>
        <input value={form.titre} onChange={(e) => update("titre", e.target.value)} required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Texte</label>
        <textarea
          value={form.texte}
          onChange={(e) => update("texte", e.target.value)}
          rows={5}
          required
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Image (optionnel)</label>
        <input
          value={form.image_url}
          onChange={(e) => update("image_url", e.target.value)}
          placeholder="/img/annonces/exemple.jpg"
          className={inputClass}
        />
        <p className="text-[12px] text-ink-faint">
          Le fichier doit déjà exister dans le projet (pas d&apos;upload depuis cet écran pour l&apos;instant).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Statut</label>
          <select value={form.statut} onChange={(e) => update("statut", e.target.value)} className={inputClass}>
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publié</option>
          </select>
        </div>
      </div>

      {error && <p className="text-[13.5px] text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 inline-flex items-center justify-center rounded bg-lime px-6 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2 disabled:opacity-60 disabled:pointer-events-none w-fit"
      >
        {loading ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer l'annonce"}
      </button>
    </form>
  );
}
