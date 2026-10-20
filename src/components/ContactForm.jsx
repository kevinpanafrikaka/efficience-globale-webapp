"use client";

import { useEffect, useRef, useState } from "react";

const TOPICS = [
  { id: "projet", label: "Un projet", icon: "↗", subject: "Accompagnement d’un projet", hint: "Quel est votre objectif ? Précisez le contexte et, si vous le connaissez, le calendrier envisagé." },
  { id: "formation", label: "Une formation", icon: "✳", subject: "Demande de formation", hint: "Quel sujet souhaitez-vous explorer ? Parlez-nous de votre équipe et de ses besoins." },
  { id: "partenariat", label: "Un partenariat", icon: "◇", subject: "Proposition de partenariat", hint: "Présentez votre organisation et les pistes de collaboration que vous imaginez." },
];

export default function ContactForm({ emailContact }) {
  const submitting = useRef(false);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const successRef = useRef(null);
  const selected = TOPICS.find((item) => item.id === topic);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

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
      <div role="status" tabIndex={-1} ref={successRef} className="contact-success">
        <span className="contact-success-icon" aria-hidden="true">✓</span>
        <h3>Votre message est bien reçu.</h3>
        <p>Merci de nous avoir présenté votre besoin. L’équipe Efficience Globale reviendra vers vous à l’adresse indiquée.</p>
        <button type="button" onClick={() => { setTopic(""); setSubject(""); setErrorMsg(""); setStatus("idle"); }}>Écrire un autre message <span aria-hidden="true">↗</span></button>
      </div>
    );
  }

  return (
    <form aria-busy={status === "sending"} onSubmit={handleSubmit} className="public-contact-form contact-guided-form flex flex-col gap-4">
      <div className="contact-form-intro">
        <h3>Parlons de votre besoin.</h3>
        <p>Quelques mots suffisent pour commencer la conversation.</p>
      </div>
      <fieldset className="contact-topics" disabled={status === "sending"}>
        <legend>Comment pouvons-nous vous accompagner ?</legend>
        <div className="contact-topic-grid">
          {TOPICS.map((item) => <label key={item.id} className="contact-topic">
            <input type="radio" name="type_demande" value={item.id} checked={topic === item.id} onChange={() => { setTopic(item.id); setSubject(item.subject); }} />
            <span className="contact-topic-face"><span aria-hidden="true" className="contact-topic-icon">{item.icon}</span><span>{item.label}</span><span className="contact-topic-dot" aria-hidden="true" /></span>
          </label>)}
        </div>
      </fieldset>
      <p className="contact-required-note">Votre nom, votre email et votre message sont nécessaires.</p>
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
            placeholder="Votre nom complet"
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
            placeholder="vous@organisation.com"
            required
            className="rounded-lg border border-line px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-lime"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sujet" className="text-[13px] font-semibold text-dark">
          Sujet <span className="contact-optional">(facultatif)</span>
        </label>
        <input
          id="sujet"
          name="sujet"
          maxLength={200}
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="De quoi souhaitez-vous discuter ?"
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
          aria-describedby="contact-message-hint"
          placeholder="Parlez-nous de votre besoin…"
          required
          className="rounded-lg border border-line px-3.5 py-2.5 text-base resize-y min-h-[140px] focus:outline-none focus:ring-2 focus:ring-lime"
        />
        <p id="contact-message-hint" className="contact-message-hint">{selected?.hint || "Votre contexte, votre objectif, vos questions : partagez ce qui nous aidera à vous répondre."}</p>
      </div>

      {status === "error" && <p role="alert" className="text-[13.5px] text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="contact-send mt-1 inline-flex items-center justify-center rounded bg-lime px-6 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2 disabled:opacity-60 disabled:pointer-events-none"
      >
        {status === "sending" ? "Envoi en cours…" : <>Envoyer mon message <span aria-hidden="true">↗</span></>}
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
