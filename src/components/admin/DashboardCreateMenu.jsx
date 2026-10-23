"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import DashboardIcon from "./DashboardIcon";
import "./dashboard-create-menu.css";

const OPTIONS = [
  { type: "projets", label: "Nouveau projet", href: "/admin/projets/nouveau" },
  { type: "annonces", label: "Nouvelle annonce", href: "/admin/annonces/nouveau" },
  { type: "membres", label: "Nouveau membre", href: "/admin/membres/nouveau" },
  { type: "partenaires", label: "Nouveau partenaire", href: "/admin/partenaires/nouveau" },
];

export default function DashboardCreateMenu() {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  function updateRoom() {
    const bounds = trigger.current?.getBoundingClientRect?.();
    if (!bounds || !container.current) return;
    const viewport = window.visualViewport;
    const viewportBottom = viewport ? viewport.height + viewport.offsetTop : window.innerHeight;
    const room = Math.max(0, Math.floor(viewportBottom - bounds.bottom - 24));
    container.current.style.setProperty("--dashboard-menu-room", `${room}px`);
  }
  useEffect(() => {
    if (!open) return;
    function outside(event) { if (!container.current?.contains(event.target)) setOpen(false); }
    function escape(event) { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } }
    updateRoom();
    window.addEventListener("resize", updateRoom);
    window.addEventListener("scroll", updateRoom, { passive: true });
    window.visualViewport?.addEventListener("resize", updateRoom);
    window.visualViewport?.addEventListener("scroll", updateRoom);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", updateRoom);
      window.removeEventListener("scroll", updateRoom);
      window.visualViewport?.removeEventListener("resize", updateRoom);
      window.visualViewport?.removeEventListener("scroll", updateRoom);
    };
  }, [open]);
  return <div className="dashboard-create" ref={container}>
    <button ref={trigger} type="button" className="eg-button eg-button--primary" aria-expanded={open} aria-controls="dashboard-create-options" onClick={() => { if (!open) updateRoom(); setOpen((value) => !value); }}><span aria-hidden="true" className="dashboard-create-plus">+</span>Créer un contenu</button>
    <nav id="dashboard-create-options" className="dashboard-create-options" aria-label="Choisir un contenu à créer" hidden={!open}>{OPTIONS.map((option) => <Link key={option.type} href={option.href} onClick={() => setOpen(false)}><span className="dashboard-create-icon"><DashboardIcon type={option.type} size={20} /></span><span><strong>{option.label}</strong></span></Link>)}</nav>
  </div>;
}
