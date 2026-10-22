"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DeleteButton from "@/components/admin/DeleteButton";
import useAdminAction from "./useAdminAction";

export default function MemberOptions({ membre, prevId, nextId }) {
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
    await run("/api/admin/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table: "membres", id: membre.id, targetId }) }, () => { setOpen(false); router.refresh(); });
  }
  return <div className="team-options" ref={root}>
    <button type="button" ref={trigger} className="eg-button eg-button--secondary eg-button--icon" aria-label={`Options pour ${membre.nom}`} aria-expanded={open} aria-controls={`team-options-${membre.id}`} onClick={() => setOpen(!open)}>···</button>
    {open && <div id={`team-options-${membre.id}`} className="team-options-panel" data-below={below} style={{ maxHeight: `${room}px` }} role="group" aria-label={`Actions pour ${membre.nom}`}>
      <p>Ordre de l’équipe</p>
      <button type="button" disabled={!prevId || loading} aria-busy={loading} onClick={() => move(prevId)}>Placer avant le précédent</button>
      <button type="button" disabled={!nextId || loading} aria-busy={loading} onClick={() => move(nextId)}>Placer après le suivant</button>
      {error && <span role="alert">{error}</span>}
      {loading ? <span role="status" className="team-order-status">Classement en cours…</span> : <DeleteButton endpoint={`/api/admin/membres/${membre.id}`} confirmMessage={`Supprimer « ${membre.nom} » définitivement ?`} />}
    </div>}
  </div>;
}
