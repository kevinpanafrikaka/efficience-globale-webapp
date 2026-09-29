"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "rounded-lg border border-line px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-lime w-full";
const labelClass = "text-[13px] font-semibold text-dark";

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="text-[12px] text-ink-faint">{hint}</p>}
    </div>
  );
}

export default function ReglagesForm({ reglages, stats }) {
  const router = useRouter();
  const [form, setForm] = useState({
    email: reglages.email,
    telephone: reglages.telephone,
    adresse: reglages.adresse,
    email_destinataire: reglages.email_destinataire,
    facebook: reglages.facebook,
    x: reglages.x,
    linkedin: reglages.linkedin,
  });
  const [statsList, setStatsList] = useState(stats.map((s) => ({ nombre: String(s.nombre), label: s.label })));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  function updateStat(i, field, value) {
    setStatsList((list) => list.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/admin/reglages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, stats_equipe: statsList }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
      } else {
        setSaved(true);
        router.refresh();
      }
    } catch {
      setError("Impossible d'enregistrer. Vérifiez votre connexion.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
      <section className="flex flex-col gap-4">
        <h2 className="text-[16px]">Coordonnées</h2>
        <Field label="Email de contact (affiché sur le site)">
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required className={inputClass} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Téléphone">
            <input value={form.telephone} onChange={(e) => update("telephone", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Adresse">
            <input value={form.adresse} onChange={(e) => update("adresse", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field
          label="Destinataire du formulaire de contact"
          hint="Adresse qui reçoit la notification pour chaque message. Tant que le domaine n'est pas vérifié dans Resend, ce doit être l'adresse du compte Resend."
        >
          <input
            type="email"
            value={form.email_destinataire}
            onChange={(e) => update("email_destinataire", e.target.value)}
            required
            className={inputClass}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-[16px]">Réseaux sociaux</h2>
        <p className="text-[12.5px] text-ink-faint -mt-2">Laissez vide pour masquer l&apos;icône dans le pied de page.</p>
        {[
          ["facebook", "Facebook"],
          ["x", "X (Twitter)"],
          ["linkedin", "LinkedIn"],
        ].map(([key, label]) => (
          <Field key={key} label={label}>
            <input
              type="url"
              value={form[key]}
              onChange={(e) => update(key, e.target.value)}
              placeholder="https://…"
              className={inputClass}
            />
          </Field>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-[16px]">Chiffres de l&apos;équipe</h2>
        <p className="text-[12.5px] text-ink-faint -mt-2">Affichés sur l&apos;accueil et la page Équipe.</p>
        {statsList.map((s, i) => (
          <div key={i} className="grid grid-cols-[90px_1fr_auto] gap-3 items-center">
            <input
              type="number"
              value={s.nombre}
              onChange={(e) => updateStat(i, "nombre", e.target.value)}
              aria-label="Nombre"
              className={inputClass}
            />
            <input
              value={s.label}
              onChange={(e) => updateStat(i, "label", e.target.value)}
              aria-label="Libellé"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => {
                setStatsList((list) => list.filter((_, idx) => idx !== i));
                setSaved(false);
              }}
              className="text-[12.5px] font-semibold text-red-600 hover:text-red-700"
            >
              Retirer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setStatsList((list) => [...list, { nombre: "", label: "" }])}
          className="text-[13px] font-semibold text-dark-2 hover:text-lime transition-colors w-fit"
        >
          + Ajouter un chiffre
        </button>
      </section>

      {error && <p className="text-[13.5px] text-red-600">{error}</p>}
      {saved && <p className="text-[13.5px] text-lime font-semibold">Réglages enregistrés.</p>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded bg-lime px-6 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2 disabled:opacity-60 disabled:pointer-events-none w-fit"
      >
        {loading ? "Enregistrement…" : "Enregistrer les réglages"}
      </button>
    </form>
  );
}
