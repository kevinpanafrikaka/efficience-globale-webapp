"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DeleteButton from "@/components/admin/DeleteButton";
import useAdminAction from "./useAdminAction";

export default function PartnerOptions({ partenaire, prevId, nextId }) {
  const [open, setOpen] = useState(false);
  const [below, setBelow] = useState(false), [room, setRoom] = useState(320);
  const root = useRef(null), trigger = useRef(null);
  const router = useRouter();
  const { run, loading, error } = useAdminAction();
  useEffect(() => {
    if (!open) return;
    function position() {
      const rect = trigger.current?.getBoundingClientRect?.();
      if (!rect) return;
      const viewport = window.visualViewport;
      const header = document.querySelector?.(".admin-topbar")?.getBoundingClientRect?.();
      const top = Math.max(viewport?.offsetTop || 0, header?.bottom || 0);
      const bottom = viewport ? viewport.height + viewport.offsetTop : window.innerHeight;
      const before = rect.top - top - 14, after = bottom - rect.bottom - 14;
      const down = before < 240 && after > before;
      setBelow(down); setRoom(Math.max(0,Math.min(320,down ? after : before)));
    }
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    window.visualViewport?.addEventListener("resize", position);
    const outside = e => { if (!root.current?.contains(e.target)) setOpen(false); };
    const escape = e => { if (e.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { window.removeEventListener("resize", position); window.removeEventListener("scroll", position, true); window.visualViewport?.removeEventListener("resize", position); document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  async function move(targetId) {
    if (!targetId) return;
    await run("/api/admin/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table: "partenaires", id: partenaire.id, targetId }) }, () => { setOpen(false); router.refresh(); });
  }
  async function togglePublication() {
    const { nom, logo_url, site_web, ordre_affichage } = partenaire;
    await run(`/api/admin/partenaires/${partenaire.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nom, logo_url, site_web, ordre_affichage, statut: partenaire.statut === "publie" ? "brouillon" : "publie" }) }, () => { setOpen(false); router.refresh(); });
  }
  return <div className="partner-options" ref={root} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
    <button type="button" ref={trigger} className="eg-button eg-button--secondary eg-button--icon" aria-label={`Options pour ${partenaire.nom}`} aria-expanded={open} aria-controls={`partner-options-${partenaire.id}`} onClick={() => setOpen(!open)}>···</button>
    {open && <div id={`partner-options-${partenaire.id}`} className="partner-options-panel" data-below={below} style={{ maxHeight: `${room}px` }} role="group" aria-label={`Actions pour ${partenaire.nom}`}>
      <button type="button" disabled={!prevId || loading} aria-busy={loading} onClick={() => move(prevId)}>Déplacer avant</button>
      <button type="button" disabled={!nextId || loading} aria-busy={loading} onClick={() => move(nextId)}>Déplacer après</button>
      <button type="button" disabled={loading} aria-busy={loading} onClick={togglePublication}>{partenaire.statut === "publie" ? "Passer en brouillon" : "Publier"}</button>
      {error && <span role="alert">{error}</span>}
      {loading ? <span role="status" className="partner-action-status">Enregistrement…</span> : <DeleteButton endpoint={`/api/admin/partenaires/${partenaire.id}`} confirmMessage={`Supprimer « ${partenaire.nom} » définitivement ?`} />}
    </div>}
  </div>;
}
