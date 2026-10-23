"use client";

import { cloneElement, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "rounded-lg border border-line px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-lime w-full";
const labelClass = "text-[13px] font-semibold text-dark";

function Field({ label, children }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>{label}</label>
      {cloneElement(children, { id })}
    </div>
  );
}

export default function ReglagesForm({ reglages, notification }) {
  const router = useRouter();
  const saving = useRef(false);
  const [form, setForm] = useState({
    email: reglages.email,
    telephone: reglages.telephone,
    adresse: reglages.adresse,
    facebook: reglages.facebook,
    x: reglages.x,
    linkedin: reglages.linkedin,
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving.current) return;
    saving.current = true;
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/admin/reglages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
    saving.current = false;
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
      <section className="flex flex-col gap-4">
        <div className="admin-note"><strong>Notifications du formulaire · {notification?.provider || "Non configurées"}</strong><p>Destinataire actif : {notification?.recipient || "À configurer"}</p>{notification?.sender && <p>Expéditeur : {notification.sender}</p>}<a href="/api/email/google" className="eg-button eg-button--secondary eg-button--compact mt-3">Gérer la connexion Gmail ↗</a></div>
        <h2 className="text-[16px]">Coordonnées</h2>
        <Field label="Email public">
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
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-[16px]">Réseaux sociaux</h2>
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

      {error && <p role="alert" className="text-[13.5px] text-red-600">{error}</p>}
      {saved && <p role="status" className="text-[13.5px] text-lime font-semibold">Réglages enregistrés.</p>}

      <button
        type="submit"
        disabled={loading} aria-busy={loading}
        className="eg-button eg-button--primary"
      >
        {loading ? "Enregistrement…" : "Enregistrer les réglages"}
      </button>
    </form>
  );
}
