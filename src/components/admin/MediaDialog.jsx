"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./media-library.css";

export default function MediaDialog({ open, onClose, title, children, wide = false, compact = false, closeIcon = false, busy = false }) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open || !mounted) return;
    const dialog = ref.current, active = document.activeElement, overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = overflow; active?.focus?.({ preventScroll: true }); };
  }, [open, mounted]);
  if (!mounted) return null;
  return createPortal(<dialog ref={ref} className="media-dialog" data-wide={wide} data-compact={compact} aria-label={title} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClose={() => { if (open && !busy) onClose(); }}>
    <div className="media-dialog-layout"><header className="media-dialog-header"><h2 title={title}>{title}</h2><button autoFocus type="button" className={`eg-button eg-button--secondary eg-button--compact${closeIcon ? " media-dialog-close" : ""}`} aria-label={closeIcon ? "Fermer" : undefined} onClick={onClose} disabled={busy}>{closeIcon ? <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m6 6 12 12M18 6 6 18"/></svg> : "Fermer"}</button></header>{children}</div>
  </dialog>, document.body);
}
