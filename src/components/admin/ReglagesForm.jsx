"use client";

import { cloneElement, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { notificationRecipients, validateNotificationRecipients } from "@/lib/notification-recipients.mjs";
import "./admin-settings.css";

const TABS = [["cabinet", "Cabinet"], ["emails", "Emails"], ["social", "Réseaux sociaux"]];
const STATUS = { registered: "Connexion enregistrée", configured: "Service configuré", disconnected: "À connecter", unconfigured: "Non configuré", verified: "Autorisation vérifiée", invalid: "À reconnecter", unavailable: "Vérification indisponible" };
const EMAIL_RE = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;

function values(reglages) {
  return { email: reglages.email || "", telephone: reglages.telephone || "", adresse: reglages.adresse || "", facebook: reglages.facebook || "", linkedin: reglages.linkedin || "", x: reglages.x || "", email_notifications: notificationRecipients(reglages) };
}
function Field({ label, hint, children }) {
  const id = useId();
  return <div className="settings-field"><label htmlFor={id}>{label}</label>{cloneElement(children, { id, "aria-describedby": hint ? `${id}-hint` : undefined })}{hint && <p id={`${id}-hint`} className="settings-hint">{hint}</p>}</div>;
}
function CloseIcon() {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg>;
}

export default function ReglagesForm({ reglages, notification }) {
  const router = useRouter(), id = useId(), formRef = useRef(null), tabsRef = useRef({}), saving = useRef(false), verifying = useRef(false);
  const [form, setForm] = useState(values(reglages)), [baseline, setBaseline] = useState(values(reglages));
  const [active, setActive] = useState("cabinet"), [error, setError] = useState(null), [saved, setSaved] = useState(false), [loading, setLoading] = useState(false);
  const [check, setCheck] = useState(null), [checking, setChecking] = useState(false), [focusField, setFocusField] = useState("");
  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);
  const connectionStatus = check?.status || notification?.status || "unconfigured";
  const provider = notification?.provider || "Gmail";

  useEffect(() => {
    if (!dirty) return;
    const warn = event => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (focusField) { formRef.current?.elements?.namedItem(focusField)?.focus(); setFocusField(""); }
  }, [focusField]);

  function update(field, value) { setForm(previous => ({ ...previous, [field]: value })); setSaved(false); setError(null); }
  function changeRecipient(index, value) { update("email_notifications", form.email_notifications.map((email, i) => i === index ? value : email)); }
  function addRecipient() {
    if (loading || form.email_notifications.length >= 10) return;
    update("email_notifications", [...form.email_notifications, ""]);
    setFocusField(`notification-${form.email_notifications.length}`);
  }
  function cancel() { setForm({ ...baseline, email_notifications: [...baseline.email_notifications] }); setError(null); setSaved(false); }
  function invalid(tab, field, message) { setActive(tab); setError({ message, field }); setFocusField(field); }
  function tabKey(event, tab) {
    const index = TABS.findIndex(([key]) => key === tab);
    const next = event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : event.key === "ArrowRight" ? (index + 1) % TABS.length : event.key === "ArrowLeft" ? (index + TABS.length - 1) % TABS.length : -1;
    if (next < 0) return;
    event.preventDefault(); setActive(TABS[next][0]); tabsRef.current[TABS[next][0]]?.focus();
  }
  async function verify() {
    if (verifying.current) return;
    verifying.current = true; setChecking(true);
    try {
      const response = await fetch("/api/admin/reglages/gmail", { method: "POST", signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (!response.ok || !STATUS[result.status]) throw new Error();
      setCheck(result);
    } catch { setCheck({ status: "unavailable", message: "Vérification impossible. Vérifiez votre connexion et réessayez." }); }
    finally { verifying.current = false; setChecking(false); }
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if (saving.current || !dirty) return;
    if (!EMAIL_RE.test(form.email.trim())) return invalid("cabinet", "email", "Renseignez une adresse email publique valide.");
    const emails = form.email_notifications.map(email => email.trim().toLowerCase());
    const bad = emails.findIndex(email => !email || email.length > 254 || !EMAIL_RE.test(email));
    if (bad >= 0) return invalid("emails", `notification-${bad}`, "Renseignez une adresse valide pour chaque destinataire, ou retirez la ligne vide.");
    if (new Set(emails).size !== emails.length) return invalid("emails", `notification-${emails.findIndex((email, i) => emails.indexOf(email) !== i)}`, "Cette adresse figure déjà dans les destinataires.");
    let recipients;
    try { recipients = validateNotificationRecipients(emails); }
    catch (failure) { return invalid("emails", "notification-0", failure.message); }
    for (const key of ["facebook", "linkedin", "x"]) {
      if (!form[key].trim()) continue;
      try { const url = new URL(form[key].trim()); if (!["http:", "https:"].includes(url.protocol)) throw new Error(); }
      catch { return invalid("social", key, "Les liens des réseaux sociaux doivent commencer par https:// ou http://."); }
    }
    const submitted = { ...Object.fromEntries(Object.entries(form).filter(([key]) => key !== "email_notifications").map(([key, value]) => [key, value.trim()])), email_notifications: recipients };
    saving.current = true; setLoading(true); setSaved(false); setError(null);
    try {
      const response = await fetch("/api/admin/reglages", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(submitted), signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (!response.ok) { setError({ message: result.error || "Enregistrement impossible. Réessayez." }); return; }
      setForm(submitted); setBaseline(submitted); setSaved(true); router.refresh();
    } catch { setError({ message: "Enregistrement non confirmé. Vérifiez votre connexion puis réessayez." }); }
    finally { saving.current = false; setLoading(false); }
  }
  const input = (key, type = "text") => <input name={key} type={type} value={form[key]} onChange={event => update(key, event.target.value)} disabled={loading} required={key === "email"} aria-invalid={error?.field === key || undefined} autoComplete={key === "email" ? "email" : key === "telephone" ? "tel" : "off"}/>;

  return <form ref={formRef} onSubmit={handleSubmit} noValidate className="settings-form">
    <div className="settings-tabs" role="tablist" aria-label="Catégories des réglages">{TABS.map(([key, label]) => <button key={key} ref={node => { tabsRef.current[key] = node; }} id={`${id}-tab-${key}`} type="button" role="tab" aria-selected={active === key} aria-controls={`${id}-panel-${key}`} tabIndex={active === key ? 0 : -1} onClick={() => setActive(key)} onKeyDown={event => tabKey(event, key)}>{label}</button>)}</div>
    <div className="settings-panels">
      <section hidden={active !== "cabinet"} role="tabpanel" id={`${id}-panel-cabinet`} aria-labelledby={`${id}-tab-cabinet`} className="settings-panel" tabIndex={0}>
        <header className="settings-section-heading"><h2>Coordonnées du cabinet</h2><p>Les coordonnées affichées sur le site public.</p></header>
        <div className="settings-fields-grid"><Field label="Email public" hint="L’adresse de contact visible par les visiteurs.">{input("email", "email")}</Field><Field label="Téléphone">{input("telephone", "tel")}</Field><div className="settings-full-field"><Field label="Adresse">{input("adresse")}</Field></div></div>
      </section>
      <section hidden={active !== "emails"} role="tabpanel" id={`${id}-panel-emails`} aria-labelledby={`${id}-tab-emails`} className="settings-panel" tabIndex={0}>
        <div className="settings-email-grid">
          <div className="settings-email-service"><header className="settings-section-heading"><h2>Compte d’envoi</h2><p>Le service utilisé pour les emails du site.</p></header>
            <div className="settings-connection"><div className="settings-connection-top"><strong>{provider}</strong><span className="settings-connection-status" data-status={connectionStatus}>{STATUS[connectionStatus]}</span></div>{notification?.sender && <p className="settings-sender">{notification.sender}</p>}
              <p className="settings-hint" role="status">{checking ? "Vérification de l’autorisation Google…" : check?.message || (connectionStatus === "registered" ? "La validité de cette autorisation n’a pas encore été vérifiée." : connectionStatus === "disconnected" ? "Connectez Gmail pour activer les envois." : connectionStatus === "unconfigured" ? "La connexion Gmail doit être configurée." : "La configuration du service est enregistrée.")}</p>
              {check?.checkedAt && <p className="settings-check-date">Vérifié le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Conakry" }).format(new Date(check.checkedAt))} · Conakry</p>}
              <div className="settings-connection-actions">{provider === "Gmail" && <>{!["unconfigured", "disconnected"].includes(connectionStatus) && <button type="button" onClick={verify} disabled={checking || loading} aria-busy={checking} className="eg-button eg-button--secondary eg-button--compact">{checking ? "Vérification…" : "Vérifier l’autorisation"}</button>}<a href="/api/email/google" className="settings-manage-link">Gérer la connexion Gmail <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10"/></svg></a></>}</div>
            </div>
          </div>
          <div className="settings-recipient-section"><header className="settings-section-heading"><h2>Destinataires des notifications <span className="settings-recipient-count">{form.email_notifications.length}/10</span></h2><p id={`${id}-recipient-help`}>Les personnes averties des messages et des candidatures.</p></header>
            <div className="settings-recipients">{form.email_notifications.map((email, index) => <div className="settings-recipient-row" key={index}><label className="sr-only" htmlFor={`${id}-recipient-${index}`}>Adresse du destinataire {index + 1}</label><input id={`${id}-recipient-${index}`} name={`notification-${index}`} type="email" value={email} onChange={event => changeRecipient(index, event.target.value)} disabled={loading} required aria-describedby={`${id}-recipient-help`} aria-invalid={error?.field === `notification-${index}` || undefined} placeholder="nom@exemple.com" autoComplete="off"/><button type="button" disabled={loading || form.email_notifications.length === 1} aria-label={`Retirer le destinataire ${index + 1}`} className="settings-remove-recipient" onClick={() => update("email_notifications", form.email_notifications.filter((_, i) => i !== index))}><CloseIcon/></button></div>)}</div>
            <button type="button" className="settings-add-recipient" onClick={addRecipient} disabled={loading || form.email_notifications.length >= 10}>+ Ajouter une adresse</button>
          </div>
        </div>
      </section>
      <section hidden={active !== "social"} role="tabpanel" id={`${id}-panel-social`} aria-labelledby={`${id}-tab-social`} className="settings-panel" tabIndex={0}>
        <header className="settings-section-heading"><h2>Réseaux sociaux</h2><p>Les liens vers les pages du cabinet.</p></header><div className="settings-fields-grid">{[["facebook", "Facebook"], ["linkedin", "LinkedIn"], ["x", "X (Twitter)"]].map(([key, label]) => <Field key={key} label={label}>{cloneElement(input(key, "url"), { placeholder: "https://…" })}</Field>)}</div>
      </section>
    </div>
    <div className="settings-savebar"><div aria-live="polite">{error ? <p role="alert">{error.message}</p> : saved ? <p className="settings-saved" role="status">Réglages enregistrés.</p> : <p className="settings-save-state">{dirty ? "Modifications non enregistrées" : "Aucune modification en cours"}</p>}</div><div className="settings-save-actions"><button type="button" onClick={cancel} disabled={!dirty || loading} className="eg-button eg-button--secondary eg-button--compact">Annuler</button><button type="submit" disabled={!dirty || loading} aria-busy={loading} className="eg-button eg-button--primary eg-button--compact">{loading ? "Enregistrement…" : "Enregistrer"}</button></div></div>
  </form>;
}
