"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./media-library.css";

export default function MediaDialog({ open, onClose, title, children, wide = false, busy = false }) {
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
  return createPortal(<dialog ref={ref} className="media-dialog" data-wide={wide} aria-label={title} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClose={() => { if (open && !busy) onClose(); }}>
    <div className="media-dialog-layout"><header className="media-dialog-header"><h2>{title}</h2><button autoFocus type="button" className="eg-button eg-button--secondary eg-button--compact" onClick={onClose} disabled={busy}>Fermer</button></header>{children}</div>
  </dialog>, document.body);
}
