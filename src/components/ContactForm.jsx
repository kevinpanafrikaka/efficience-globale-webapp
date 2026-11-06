"use client";

import { useEffect, useRef, useState } from "react";
import { contactFileError, MAX_CONTACT_FILES } from "@/lib/contact-attachments.mjs";

const TOPICS = [
  { id: "projet", label: "Un projet", icon: "◫", subject: "Accompagnement d’un projet", hint: "Quel est votre objectif ? Précisez le contexte et, si vous le connaissez, le calendrier envisagé." },
  { id: "formation", label: "Une formation", icon: "✳", subject: "Demande de formation", hint: "Quel sujet souhaitez-vous explorer ? Parlez-nous de votre équipe et de ses besoins." },
  { id: "partenariat", label: "Un partenariat", icon: "◇", subject: "Proposition de partenariat", hint: "Présentez votre organisation et les pistes de collaboration que vous imaginez." },
];

export default function ContactForm({ emailContact }) {
  const submitting = useRef(false);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [filesNotSent, setFilesNotSent] = useState(false);
  const fileInput = useRef(null);
  const successRef = useRef(null);
  const subjectEdited = useRef(false);
  const selected = TOPICS.find((item) => item.id === topic);

  function chooseFiles(event) {
    const added = Array.from(event.target.files || []);
    event.target.value = "";
    if (!added.length) return;
    const next = [...files, ...added];
    const error = contactFileError(next);
    if (error) { setFileError(error); return; }
    setFiles(next);
    setFileError("");
  }

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
      const body = new FormData(form);
      for (const file of files) body.append("documents", file);
      const res = await fetch("/api/contact", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Une erreur est survenue.");
        setStatus("error");
        return;
      }
      setFilesNotSent(data.attachments_sent === false);
      setStatus("success");
      setFiles([]);
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
        {filesNotSent && <p role="alert" className="contact-files-warning">Votre message est enregistré, mais vos documents n’ont pas pu être transmis. {emailContact ? <>Envoyez-les directement à <a href={`mailto:${emailContact}`}>{emailContact}</a>.</> : "Merci de contacter le cabinet pour les transmettre."}</p>}
        <button type="button" onClick={() => { setTopic(""); setSubject(""); subjectEdited.current = false; setErrorMsg(""); setFileError(""); setFilesNotSent(false); setStatus("idle"); }}>Écrire un autre message</button>
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
            <input type="radio" required name="type_demande" value={item.id} checked={topic === item.id} onChange={() => { setTopic(item.id); if (!subjectEdited.current || !subject.trim()) setSubject(item.subject); }} />
            <span className="contact-topic-face"><span aria-hidden="true" className="contact-topic-icon">{item.icon}</span><span>{item.label}</span><span className="contact-topic-dot" aria-hidden="true" /></span>
          </label>)}
        </div>
      </fieldset>
      <p className="contact-required-note">Le type d’accompagnement, votre nom, votre email et votre message sont nécessaires.</p>
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
          onChange={(e) => { subjectEdited.current = Boolean(e.target.value.trim()); setSubject(e.target.value); }}
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

      <section className="contact-attachments" aria-labelledby="contact-files-label">
        <div className="contact-attachments-heading"><span id="contact-files-label">Documents <span className="contact-optional">(facultatif)</span></span><span className="contact-files-count" aria-live="polite">{files.length} / {MAX_CONTACT_FILES}</span></div>
        <input ref={fileInput} id="contact-documents" className="contact-file-input" type="file" multiple accept="application/pdf,.pdf" aria-label="Choisir des documents PDF" aria-describedby="contact-files-hint" disabled={status === "sending"} onChange={chooseFiles} />
        {files.length > 0 && <ul className="contact-file-list">{files.map((file, index) => <li key={`${index}-${file.name}`}><span className="contact-file-symbol" aria-hidden="true">PDF</span><span className="contact-file-meta"><strong>{file.name}</strong><span>{new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(file.size / 1024)} Ko</span></span><button type="button" disabled={status === "sending"} aria-label={`Retirer ${file.name}`} onClick={() => { setFiles(files.filter((_, i) => i !== index)); setFileError(""); }}>×</button></li>)}</ul>}
        <button type="button" className="contact-add-file" disabled={status === "sending" || files.length >= MAX_CONTACT_FILES} onClick={() => fileInput.current?.click()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m8 12 6.8-6.8a3 3 0 0 1 4.2 4.2L10.1 18a5 5 0 0 1-7.1-7.1l9.2-9.2M6.5 13.5l7.8-7.8" strokeLinecap="round" strokeLinejoin="round"/></svg>{files.length ? "Ajouter un document" : "Joindre des documents"}</button>
        <p id="contact-files-hint">PDF · 3 documents maximum · 2 Mo par document</p>
        {fileError && <p role="alert" className="contact-file-error">{fileError}</p>}
      </section>

      {status === "error" && <p role="alert" className="text-[13.5px] text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="contact-send eg-button eg-button--primary mt-1"
      >
        {status === "sending" ? "Envoi en cours…" : <>Envoyer mon message</>}
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
