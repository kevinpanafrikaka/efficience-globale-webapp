"use client";

import { useRef, useState } from "react";

export default function ContactForm({ emailContact }) {
  const submitting = useRef(false);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: new FormData(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Une erreur est survenue.");
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setErrorMsg("Impossible d'envoyer le message. Vérifiez votre connexion.");
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-xl border border-lime bg-cream p-6">
        <p className="text-[16px] text-dark mb-1.5">Message envoyé</p>
        <p className="text-[13.5px] text-ink-soft">Nous vous répondrons dès que possible.</p>
      </div>
    );
  }

  return (
    <form aria-busy={status === "sending"} onSubmit={handleSubmit} className="public-contact-form flex flex-col gap-4">
      {/* Champ piège anti-spam : invisible pour les humains, rempli par les robots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="site_web">Ne pas remplir</label>
        <input id="site_web" name="site_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
          <label htmlFor="nom" className="text-[13px] font-semibold text-dark">
            Nom
          </label>
          <input
            id="nom"
            name="nom"
            maxLength={120}
            type="text"
            autoComplete="name"
            required
            className="rounded-lg border border-line px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-lime"
          />
        </div>
        <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
          <label htmlFor="email" className="text-[13px] font-semibold text-dark">
            Email
          </label>
          <input
            id="email"
            name="email"
            maxLength={200}
            type="email"
            autoComplete="email"
            required
            className="rounded-lg border border-line px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-lime"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sujet" className="text-[13px] font-semibold text-dark">
          Sujet
        </label>
        <input
          id="sujet"
          name="sujet"
          maxLength={200}
          type="text"
          className="rounded-lg border border-line px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-lime"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-[13px] font-semibold text-dark">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          maxLength={5000}
          rows={5}
          required
          className="rounded-lg border border-line px-3.5 py-2.5 text-base resize-y min-h-[140px] focus:outline-none focus:ring-2 focus:ring-lime"
        />
      </div>

      {status === "error" && <p role="alert" className="text-[13.5px] text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 inline-flex items-center justify-center rounded bg-lime px-6 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2 disabled:opacity-60 disabled:pointer-events-none"
      >
        {status === "sending" ? "Envoi en cours…" : "Envoyer le message"}
      </button>
      {emailContact && (
        <p className="text-[12.5px] text-ink-faint">
          Vous pouvez aussi écrire directement à{" "}
          <a href={`mailto:${emailContact}`} className="text-dark-2 font-medium">
            {emailContact}
          </a>
        </p>
      )}
    </form>
  );
}
