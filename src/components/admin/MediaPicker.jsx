"use client";
import { useEffect, useState } from "react";
import MediaDialog from "./MediaDialog";
import MediaBrowser from "./MediaBrowser";

export default function MediaPicker({ open, onClose, onChoose, type = "image", multiple = false, max = 1, excludeUrls = [] }) {
  const [items, setItems] = useState([]), [selection, setSelection] = useState([]), [loading, setLoading] = useState(false), [error, setError] = useState(""), [reload, setReload] = useState(0);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController(); let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    setSelection([]); setLoading(true); setError("");
    (async () => {
      try {
        const response = await fetch("/api/admin/medias", { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(response.status === 401 ? "Session expirée. Reconnectez-vous à l’administration." : data.error || "Chargement impossible.");
        if (!Array.isArray(data.items)) throw new Error("Chargement impossible.");
        if (active) setItems(data.items);
      } catch (error) { if (active) setError(controller.signal.aborted ? "Le chargement prend trop de temps. Réessayez." : error.message || "Chargement impossible."); }
      finally { clearTimeout(timeout); if (active) setLoading(false); }
    })();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [open, reload]);
  function toggle(item) {
    if (!multiple) { setSelection([item]); return; }
    setSelection(previous => previous.some(file => file.key === item.key) ? previous.filter(file => file.key !== item.key) : previous.length < max ? [...previous, item] : previous);
  }
  return <MediaDialog open={open} onClose={onClose} title={type === "pdf" ? "Choisir un PDF" : "Choisir dans la médiathèque"} wide>
    <div className="media-dialog-scroll">{loading ? <p className="media-loading" role="status">Chargement de la médiathèque…</p> : error ? <div className="media-error" role="alert"><p>{error}</p><button type="button" className="eg-button eg-button--secondary eg-button--compact" onClick={() => setReload(value => value + 1)}>Réessayer</button></div> : <MediaBrowser key={`${open}-${reload}`} items={items} type={type} picker selectedKeys={selection.map(file => file.key)} excludeUrls={excludeUrls} onChoose={toggle}/>}</div>
    <footer className="media-dialog-footer"><span role="status">{selection.length} sélection{selection.length > 1 ? "s" : ""}{multiple ? ` / ${max}` : ""}</span><div><button type="button" className="eg-button eg-button--secondary eg-button--compact" onClick={onClose}>Annuler</button><button type="button" className="eg-button eg-button--primary eg-button--compact" disabled={!selection.length || loading || !!error} onClick={() => { onChoose(selection); onClose(); }}>{multiple ? "Ajouter la sélection" : "Utiliser ce fichier"}</button></div></footer>
  </MediaDialog>;
}
