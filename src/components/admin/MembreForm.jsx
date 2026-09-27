"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    photo_url: membre?.photo_url || "",
    statut: membre?.statut || "brouillon",
    ordre_affichage: membre?.ordre_affichage ?? 0,
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
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Nom</label>
        <input value={form.nom} onChange={(e) => update("nom", e.target.value)} required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Rôle</label>
        <input value={form.role} onChange={(e) => update("role", e.target.value)} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Chemin de la photo</label>
        <input
          value={form.photo_url}
          onChange={(e) => update("photo_url", e.target.value)}
          placeholder="/img/equipe/exemple.jpg"
          className={inputClass}
        />
        <p className="text-[12px] text-ink-faint">
          Le fichier doit déjà exister dans le projet (pas d&apos;upload depuis cet écran pour l&apos;instant).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Statut</label>
          <select value={form.statut} onChange={(e) => update("statut", e.target.value)} className={inputClass}>
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publié</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Ordre d&apos;affichage</label>
          <input
            type="number"
            value={form.ordre_affichage}
            onChange={(e) => update("ordre_affichage", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {error && <p className="text-[13.5px] text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 inline-flex items-center justify-center rounded bg-lime px-6 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2 disabled:opacity-60 disabled:pointer-events-none w-fit"
      >
        {loading ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le membre"}
      </button>
    </form>
  );
}
