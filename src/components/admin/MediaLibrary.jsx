"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MediaBrowser, { MediaPreview } from "./MediaBrowser";
import MediaDialog from "./MediaDialog";
import MediaUpload from "./MediaUpload";
import useAdminAction from "./useAdminAction";
import { formatMediaSize } from "@/lib/media-files.mjs";
import { formatDate } from "@/lib/format";
import "./media-library.css";

export default function MediaLibrary({ items: initialItems }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems), [selected, setSelected] = useState(null), [confirming, setConfirming] = useState(false), [copied, setCopied] = useState("");
  const [deleteAttempted, setDeleteAttempted] = useState(false);
  const { run, loading, error } = useAdminAction();
  useEffect(() => setItems(initialItems), [initialItems]);
  const unused = items.filter(file => !file.usages.length);
  const totalBytes = items.reduce((sum, file) => sum + file.size, 0), unusedBytes = unused.reduce((sum, file) => sum + file.size, 0);
  function inspect(item) { setSelected(item); setConfirming(false); setCopied(""); setDeleteAttempted(false); }
  async function remove() {
    if (!selected || selected.usages.length || loading) return;
    const key = selected.key;
    setDeleteAttempted(true);
    await run("/api/admin/medias", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) }, () => { setItems(previous => previous.filter(file => file.key !== key)); setSelected(null); setConfirming(false); router.refresh(); });
  }
  async function copy() {
    try { await navigator.clipboard.writeText(new URL(selected.url, window.location.origin).href); setCopied("Lien copié."); }
    catch { setCopied("Copie indisponible. Utilisez le lien « Ouvrir le fichier »."); }
  }
  return <div className="media-library">
    <div className="media-library-overview"><div className="media-storage"><span className="media-storage-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 14h18M7 17h2m3 0h5M7 8h10"/></svg></span><div><strong>{formatMediaSize(totalBytes)}</strong><span>{items.length} fichier{items.length > 1 ? "s" : ""} public{items.length > 1 ? "s" : ""}</span></div><div className="media-storage-unused"><strong>{formatMediaSize(unusedBytes)}</strong><span>{unused.length} inutilisé{unused.length > 1 ? "s" : ""}</span></div></div><MediaUpload/></div>
    <MediaBrowser items={items} onChoose={inspect}/>
    <MediaDialog open={!!selected} onClose={() => { if (!loading) setSelected(null); }} title="Détails du fichier" busy={loading}>
      {selected && <div className="media-dialog-scroll media-file-detail">
        <div className="media-detail-preview"><MediaPreview item={selected}/></div>
        <h3>{selected.name}</h3><p className="media-detail-meta">{selected.type === "pdf" ? "PDF" : selected.key.split(".").at(-1).toUpperCase()} · {formatMediaSize(selected.size)}{selected.uploaded ? ` · Ajouté le ${formatDate(selected.uploaded)}` : ""}</p>
        <section className="media-usages"><h4>{selected.usages.length ? `Utilisé dans ${selected.usages.length} emplacement${selected.usages.length > 1 ? "s" : ""}` : "Fichier inutilisé"}</h4>{selected.usages.length ? <ul>{selected.usages.map((usage, index) => <li key={`${usage.href}-${index}`}><Link href={usage.href}><span>{usage.label}</span><strong>{usage.title}</strong><span aria-hidden="true">↗</span></Link></li>)}</ul> : <p>Ce fichier n’est associé à aucun contenu enregistré.</p>}</section>
        <div className="media-detail-actions"><a href={selected.url} target="_blank" rel="noopener noreferrer" className="eg-button eg-button--secondary eg-button--compact">Ouvrir le fichier</a><button type="button" className="eg-button eg-button--secondary eg-button--compact" onClick={copy}>Copier le lien</button>{!selected.usages.length && <button type="button" className="eg-button eg-button--danger eg-button--compact" disabled={loading} onClick={() => setConfirming(true)}>Supprimer</button>}</div>
        {copied && <p role="status" className="media-feedback">{copied}</p>}
        {confirming && <div className="media-delete-confirm" role="group" aria-label="Confirmer la suppression"><p>Supprimer définitivement ce fichier ?</p><div><button type="button" disabled={loading} className="eg-button eg-button--secondary eg-button--compact" onClick={() => setConfirming(false)}>Annuler</button><button type="button" disabled={loading} className="eg-button eg-button--danger eg-button--compact" onClick={remove}>{loading ? "Suppression…" : "Confirmer la suppression"}</button></div></div>}
        {error && deleteAttempted && <p role="alert" className="media-error">{error}</p>}
      </div>}
    </MediaDialog>
  </div>;
}
