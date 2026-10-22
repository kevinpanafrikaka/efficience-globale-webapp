"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import DashboardIcon from "./DashboardIcon";
import "./dashboard-create-menu.css";

const OPTIONS = [
  { type: "projets", label: "Nouveau projet", detail: "Présenter une réalisation", href: "/admin/projets/nouveau" },
  { type: "annonces", label: "Nouvelle annonce", detail: "Partager une actualité", href: "/admin/annonces/nouveau" },
  { type: "membres", label: "Nouveau membre", detail: "Enrichir l’équipe", href: "/admin/membres/nouveau" },
  { type: "partenaires", label: "Nouveau partenaire", detail: "Développer le réseau", href: "/admin/partenaires/nouveau" },
];

export default function DashboardCreateMenu() {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    function outside(event) { if (!container.current?.contains(event.target)) setOpen(false); }
    function escape(event) { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="dashboard-create" ref={container}>
    <button ref={trigger} type="button" className="eg-button eg-button--primary" aria-expanded={open} aria-controls="dashboard-create-options" onClick={() => setOpen((value) => !value)}><span aria-hidden="true" className="dashboard-create-plus">+</span>Créer un contenu</button>
    <nav id="dashboard-create-options" className="dashboard-create-options" aria-label="Choisir un contenu à créer" hidden={!open}>{OPTIONS.map((option) => <Link key={option.type} href={option.href} onClick={() => setOpen(false)}><span className="dashboard-create-icon"><DashboardIcon type={option.type} size={20} /></span><span><strong>{option.label}</strong><small>{option.detail}</small></span></Link>)}</nav>
  </div>;
}
