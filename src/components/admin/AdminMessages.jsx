"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EditorSelect from "./EditorSelect";
import { MESSAGE_TOPICS } from "@/lib/message-topics.mjs";
import { formatDate } from "@/lib/format";
import "./admin-messages.css";

const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function replyRequestId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
const endpoint = id => `/api/admin/messages/${encodeURIComponent(id)}`;

export default function AdminMessages({ messages: initialMessages, initialSelectedId = null }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [filter, setFilter] = useState("all"), [query, setQuery] = useState(""), [searchOpen, setSearchOpen] = useState(false);
  const [detail, setDetail] = useState(null), [detailError, setDetailError] = useState(""), [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(false), [busy, setBusy] = useState(false), [deleting, setDeleting] = useState(false);
  const [drafts, setDrafts] = useState({}), [reload, setReload] = useState(0);
  const [page, setPage] = useState(0), [category, setCategory] = useState("all");
  const [replyOpen, setReplyOpen] = useState(false), [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef(null), replyRef = useRef(null);
  const centerRef = useRef(null), inboxHeadingRef = useRef(null), listScroll = useRef(null);
  const searchRef = useRef(null), searchToggle = useRef(null), titleRef = useRef(null), selectedButton = useRef(null);
  const busyRef = useRef(false);
  useEffect(() => setMessages(initialMessages), [initialMessages]);
  useEffect(() => {
    const initial = initialMessages.find(m => m.id === initialSelectedId);
    if (initial && !initial.lu) markRead(initial.id, true);
  }, [initialSelectedId]);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    if (!optionsOpen) return;
    const close = event => { if (!optionsRef.current?.contains(event.target)) setOptionsOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [optionsOpen]);
  useEffect(() => {
    if (replyOpen) replyRef.current?.querySelector("textarea")?.focus();
  }, [replyOpen, detail]);
  const selected = messages.find(m => m.id === selectedId);
  useEffect(() => { setPage(0); }, [filter, query, category]);
  useEffect(() => {
    if (selectedId) centerRef.current?.scrollIntoView({ block: "start" });
    else if (listScroll.current !== null) {
      window.scrollTo({ top: listScroll.current });
      const target = selectedButton.current?.isConnected ? selectedButton.current : inboxHeadingRef.current;
      target?.focus({ preventScroll: true });
    }
  }, [selectedId]);
  const unread = messages.filter(m => !m.lu).length;
  const filtered = messages.filter(m => (category === "all" || m.type_demande === category) && (filter === "all" || (filter === "unread" ? !m.lu : !!m.lu)) && normalize(`${m.nom} ${m.email} ${m.sujet} ${m.message}`).includes(normalize(query).trim()));
  const categories = [{ id: "all", label: "Tous" }, ...MESSAGE_TOPICS];
  function categoryKey(event, index) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? categories.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + categories.length) % categories.length;
    setCategory(categories[next].id);
    event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next]?.focus();
  }
  const pageSize = 25;
  const lastPage = Math.max(0, Math.ceil(filtered.length / pageSize) - 1);
  const currentPage = Math.min(page, lastPage);
  const visibleMessages = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);
    setDetail(null); setDetailError(""); setActionError(""); setDeleting(false); setOptionsOpen(false); setLoading(true);
    titleRef.current?.focus({ preventScroll: true });
    async function load() {
      try {
        const response = await fetch(endpoint(selectedId), { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(response.status === 401 ? "Session expirée. Reconnectez-vous à l’administration." : data.error || "Chargement impossible.");
        if (!cancelled) setDetail(data);
      } catch (error) { if (!cancelled) setDetailError(controller.signal.aborted ? "Le chargement prend trop de temps. Réessayez." : error.message || "Chargement impossible."); }
      finally { clearTimeout(timeout); if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; clearTimeout(timeout); controller.abort(); };
  }, [selectedId, reload]);

  async function markRead(id, lu) {
    try {
      const response = await fetch(endpoint(id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lu }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Le statut n’a pas pu être modifié.");
      setMessages(items => items.map(m => m.id === id ? { ...m, lu: lu ? 1 : 0 } : m));
      router.refresh();
    } catch (error) { setActionError(error.message || "Connexion interrompue."); }
  }
  function openMessage(message, button) {
    if (busyRef.current) return;
    listScroll.current = window.scrollY;
    selectedButton.current = button;
    if (selectedId !== message.id) setReplyOpen(false);
    setOptionsOpen(false);
    setSelectedId(message.id);
    if (!message.lu) markRead(message.id, true);
  }
  function closeMessage() { if (busyRef.current) return; setSelectedId(null); setDetail(null); setReplyOpen(false); selectedButton.current?.focus(); }
  async function remove() {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setActionError("");
    try {
      const response = await fetch(endpoint(selectedId), { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Suppression impossible.");
      setMessages(items => items.filter(m => m.id !== selectedId)); setSelectedId(null); setDeleting(false); router.refresh();
    } catch (error) { setActionError(error.message || "Connexion interrompue."); }
    finally { busyRef.current = false; setBusy(false); }
  }
  function setSending(value) { busyRef.current = value; setBusy(value); }
  function closeSearch() { setSearchOpen(false); setQuery(""); requestAnimationFrame(() => searchToggle.current?.focus()); }

  return <div ref={centerRef} className="message-center" data-reading={!!selected}>
    <div className="messages-toolbar">
      {searchOpen ? <div className="messages-search"><label className="sr-only" htmlFor="messages-query">Rechercher dans les messages</label><input ref={searchRef} id="messages-query" type="search" placeholder="Nom, email, objet…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Escape") closeSearch(); }} /><button type="button" className="eg-button eg-button--secondary eg-button--compact" onClick={closeSearch}>Fermer</button></div> : <>
        <div className="messages-status-filter"><label className="sr-only" htmlFor="messages-read-filter">Filtrer par état de lecture</label><EditorSelect id="messages-read-filter" value={filter} options={[{ value: "all", label: "Tous les statuts" }, { value: "unread", label: "Non lus" }, { value: "read", label: "Lus" }]} onChange={setFilter}/>
        </div><button ref={searchToggle} type="button" className="eg-button eg-button--secondary eg-button--icon" aria-label="Rechercher un message" aria-expanded={false} onClick={() => setSearchOpen(true)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button>
      </>}
    </div>
    <div className="messages-layout">
      <section className="messages-inbox" aria-label="Messages reçus" hidden={!!selected}>
        <div className="messages-inbox-heading"><h2 ref={inboxHeadingRef} tabIndex={-1}>Boîte de réception</h2><div className="messages-inbox-controls"><button type="button" className="eg-button eg-button--secondary eg-button--icon" aria-label="Actualiser les messages" onClick={() => router.refresh()}><svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 6.1A8 8 0 0 1 20 12M4 12a8 8 0 0 0 13.9 5.9"/></svg></button><span className="messages-range">{filtered.length ? `${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, filtered.length)} sur ${filtered.length}` : "0 message"}</span>{lastPage > 0 && <><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Précédent</button><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={currentPage === lastPage} onClick={() => setPage(currentPage + 1)}>Suivant</button></>}</div></div>
        <div className="message-category-tabs" role="tablist" aria-label="Catégories des messages">{categories.map((item, index) => {
          const count = messages.filter(m => !m.lu && (item.id === "all" || m.type_demande === item.id)).length;
          return <button type="button" role="tab" key={item.id} id={`message-tab-${item.id}`} aria-selected={category === item.id} aria-controls="message-category-panel" tabIndex={category === item.id ? 0 : -1} onKeyDown={event => categoryKey(event, index)} onClick={() => setCategory(item.id)}><CategoryIcon category={item.id}/><span className="message-tab-label">{item.label}</span>{count > 0 && <span className="message-tab-count" aria-label={`${count} message${count > 1 ? "s" : ""} non lu${count > 1 ? "s" : ""}`}>{count}<span className="message-tab-count-label"> non lu{count > 1 ? "s" : ""}</span></span>}</button>;
        })}</div>
        <div id="message-category-panel" role="tabpanel" aria-labelledby={`message-tab-${category}`} tabIndex={0}>
        {visibleMessages.length ? <ul className="messages-list">{visibleMessages.map(m => <li key={m.id}><button type="button" className="message-row" data-unread={!m.lu} aria-label={`${m.lu ? "" : "Non lu. "}Ouvrir le message de ${m.nom} : ${m.sujet || "Sans objet"}`} disabled={busy} onClick={e => openMessage(m, e.currentTarget)}>
          <span className="message-row-sender" title={m.email}><span className="message-row-name">{m.nom}</span></span>
          <span className="message-row-summary"><span className="message-row-subject">{m.sujet || "Sans objet"}</span></span>
          <time className="message-row-date">{formatDate(m.cree_le).split(",")[0]}</time>
        </button></li>)}</ul> : <div className="messages-empty-list"><h3>{messages.length ? "Aucun résultat" : "Aucun message"}</h3>{messages.length > 0 && <button type="button" className="eg-button eg-button--secondary eg-button--compact" onClick={() => { setFilter("all"); setCategory("all"); setQuery(""); }}>Réinitialiser</button>}</div>}
        </div>
      </section>
      <section id="message-reader" className="messages-reader" aria-label="Lecture du message" hidden={!selected}>
        {selected && <>
          <div className="message-reader-tools">
            <button type="button" onClick={closeMessage} disabled={busy} className="eg-button eg-button--secondary eg-button--compact message-back" aria-label="Tous les messages">Messages</button>
            <h2 ref={titleRef} tabIndex={-1} className="message-reader-subject">{selected.sujet || "Sans objet"}</h2>
            <div className="message-reader-actions">
              <button type="button" className="eg-button eg-button--primary eg-button--compact" aria-expanded={replyOpen} aria-controls="message-reply" disabled={busy || !detail?.connected} onClick={() => setReplyOpen(true)}>{drafts[selected.id]?.text?.trim() ? "Reprendre la réponse" : "Répondre"}</button>
              <div className="message-options" ref={optionsRef} onKeyDown={e => { if (e.key === "Escape") { setOptionsOpen(false); optionsRef.current?.querySelector("button")?.focus(); } }}>
                <button type="button" className="eg-button eg-button--secondary eg-button--icon" aria-label="Options du message" aria-expanded={optionsOpen} aria-controls="message-options" disabled={busy} onClick={() => setOptionsOpen(value => !value)}><span aria-hidden="true">···</span></button>
                {optionsOpen && <div id="message-options" className="message-options-panel" role="group" aria-label="Actions du message"><button type="button" onClick={() => { setOptionsOpen(false); markRead(selected.id, !selected.lu); }}>{selected.lu ? "Marquer non lu" : "Marquer lu"}</button><button type="button" className="message-option-delete" onClick={() => { setOptionsOpen(false); setDeleting(true); }}>Supprimer</button></div>}
              </div>
            </div>
          </div>
          {deleting && <div className="message-delete-confirm" role="group" aria-label="Confirmer la suppression"><p>Supprimer ce message et son historique de réponses ?</p><div><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={busy} onClick={() => setDeleting(false)}>Annuler</button><button type="button" className="eg-button eg-button--danger eg-button--compact" disabled={busy} onClick={remove}>{busy ? "Suppression…" : "Confirmer la suppression"}</button></div></div>}
          {actionError && <p role="alert" className="message-alert">{actionError}</p>}
          <header className="message-heading"><div className="message-contact"><div><strong>{selected.nom}</strong><a href={`mailto:${selected.email}`}>{selected.email}</a></div><time>{formatDate(selected.cree_le)}</time></div>{!selected.envoye && <span className="message-delivery-note">Notification email non envoyée</span>}</header>
          <div className="message-original">{selected.message}{selected.candidature_id && <p className="message-application-link"><Link href={`/admin/candidatures/${encodeURIComponent(selected.candidature_id)}`} className="eg-button eg-button--primary eg-button--compact">Voir la candidature</Link></p>}</div>
          {loading && <div className="message-loading" role="status"><span aria-hidden="true"/><span>Chargement des réponses…</span></div>}
          {detailError && <div className="message-alert" role="alert"><p>{detailError}</p><button type="button" className="eg-button eg-button--secondary eg-button--compact" onClick={() => setReload(value => value + 1)}>Réessayer</button></div>}
          {detail && <>
            {detail.replies.length > 0 && <section className="message-history" aria-label="Historique des réponses"><h3>Réponses du cabinet <span>{detail.replies.length}</span></h3>{detail.replies.map((reply, index) => <details key={reply.id} className="message-reply-record" open={index === detail.replies.length - 1}><summary><strong>{reply.status === "sent" ? "Réponse envoyée" : "Envoi à vérifier dans Gmail"}</strong><time>{formatDate(reply.cree_le)}</time><span className="message-record-toggle" aria-hidden="true">+</span></summary><div><p className="message-reply-destination">À : {reply.recipient}</p><h4>{reply.subject}</h4><p className="message-reply-body">{reply.body}</p></div></details>)}</section>}
            <div id="message-reply" ref={replyRef}>
              {detail.connected ? replyOpen ? <ReplyComposer key={selected.id} message={selected} detail={detail} draft={drafts[selected.id]} onDraft={draft => setDrafts(prev => ({ ...prev, [selected.id]: draft }))} onBusy={setSending} onClose={() => { setReplyOpen(false); titleRef.current?.focus({ preventScroll: true }); }} onSent={() => { setReload(value => value + 1); router.refresh(); }} /> : null : <div className="message-connect"><p>Connectez Gmail pour répondre depuis cet espace.</p><Link href="/admin/reglages" className="eg-button eg-button--secondary eg-button--compact">Ouvrir les réglages</Link></div>}
            </div>
          </>}
        </>}
      </section>
    </div>
  </div>;
}

function ReplyComposer({ message, detail, draft, onDraft, onBusy, onSent, onClose }) {
  const initialSubject = `Re: ${message.sujet || "Votre message"}`.replace(/[\r\n]/g, " ").slice(0, 200);
  const [confirming, setConfirming] = useState(false), [sending, setSending] = useState(false), [error, setError] = useState(""), [sent, setSent] = useState(false), [uncertain, setUncertain] = useState(false);
  const claim = useRef(null), locked = useRef(false);
  const subject = draft?.subject ?? initialSubject, text = draft?.text ?? "";
  const update = changes => { onDraft({ subject, text, ...changes }); setSent(false); claim.current = null; };
  async function send() {
    if (locked.current || uncertain) return;
    locked.current = true; setSending(true); onBusy(true); setError("");
    let receivedResponse = false;
    try {
      claim.current ||= replyRequestId();
      const response = await fetch(`${endpoint(message.id)}/reponse`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, text, requestId: claim.current }) });
      const data = await response.json();
      receivedResponse = true;
      if (!response.ok) { if (data.uncertain) setUncertain(true); throw new Error(data.error || "Envoi impossible."); }
      onDraft({ subject: initialSubject, text: "" }); setSent(true); setConfirming(false); claim.current = null; onSent();
    } catch (error) { if (!receivedResponse) setUncertain(true); setError(receivedResponse ? error.message : "Envoi non confirmé. Vérifiez les messages envoyés dans Gmail avant de renvoyer."); }
    finally { locked.current = false; setSending(false); onBusy(false); }
  }
  return <form className="message-composer" onSubmit={e => { e.preventDefault(); setConfirming(true); setError(""); }}>
    <div className="message-composer-title"><div><h3>Votre réponse</h3><p>À : {message.email}</p></div><button type="button" className="eg-button eg-button--secondary eg-button--icon" aria-label="Fermer la rédaction" disabled={sending} onClick={onClose}><span aria-hidden="true">×</span></button></div>
    <details className="message-send-details"><summary>Expéditeur et objet <span aria-hidden="true">+</span></summary><div><dl className="message-envelope"><div><dt>De</dt><dd>Efficience Globale · {detail.sender}</dd></div><div><dt>Réponses vers</dt><dd>{detail.replyTo.join(", ")}</dd></div></dl><label htmlFor="reply-subject">Objet</label><input id="reply-subject" value={subject} onChange={e => update({ subject: e.target.value })} maxLength={200} required disabled={sending || confirming || uncertain} /></div></details>
    <label htmlFor="reply-body">Votre réponse</label><textarea id="reply-body" rows={5} placeholder="Bonjour…" value={text} onChange={e => update({ text: e.target.value })} maxLength={20000} required disabled={sending || confirming || uncertain} />
    {error && <p role="alert">{error}</p>}{sent && <p role="status" className="message-success">Réponse envoyée.</p>}
    {confirming ? <div className="message-send-confirm"><p>Envoyer cette réponse à <strong>{message.email}</strong> ?</p><div><button type="button" className="eg-button eg-button--secondary eg-button--compact" disabled={sending || uncertain} onClick={() => setConfirming(false)}>Modifier</button><button type="button" className="eg-button eg-button--primary eg-button--compact" disabled={sending || uncertain} onClick={send}>{sending ? "Envoi…" : "Confirmer l’envoi"}</button></div></div> : <div className="message-composer-footer"><button type="submit" className="eg-button eg-button--primary" disabled={!text.trim() || !subject.trim() || uncertain}>Envoyer la réponse</button></div>}
  </form>;
}


function CategoryIcon({ category }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{category === "projet" ? <><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V4h6v3M4 12h16M10 12v3h4v-3"/></> : category === "formation" ? <><path d="M12 5C9 3 5 3 3 4v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-2-1-6-1-9 1ZM12 5v15"/></> : category === "partenariat" ? <><path d="m3 12 6-6 6 6-6 6-6-6Zm6 0 6-6 6 6-6 6-6-6Z"/></> : <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></>}</svg>;
}
