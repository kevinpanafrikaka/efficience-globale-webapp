"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminNavLink from "./AdminNavLink";
import LogoutButton from "./LogoutButton";

const NAV = [
  ["/admin", "Tableau de bord", "◫"], ["/admin/projets", "Projets", "↗"],
  ["/admin/membres", "Équipe", "♧"], ["/admin/annonces", "Annonces", "◷"],
  ["/admin/partenaires", "Partenaires", "◇"], ["/admin/messages", "Messages", "✉"],
  ["/admin/medias", "Médiathèque", "▧"], ["/admin/reglages", "Réglages", "⚙"],
  ["/admin/apercu", "Aperçu du site", "◉"],
];

export default function AdminShell({ children, unread }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  const current = [...NAV].reverse().find(([href]) => pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)))?.[1] || "Administration";
  return <div className="admin-space admin-shell">
    <a href="#admin-main" className="admin-skip-link">Aller au contenu</a>
    <aside className="admin-sidebar">
      <div className="admin-brand-row">
        <a href="/admin" className="admin-brand"><img src="/img/logo-eg.png" alt="Efficience Globale" width="160" height="52" /><span>ESPACE ADMINISTRATION</span></a>
        <button type="button" className="admin-menu-button" aria-expanded={open} aria-controls="admin-navigation" onClick={() => setOpen(!open)}>{open ? "Fermer ×" : "Menu ☰"}</button>
      </div>
      <div id="admin-navigation" className="admin-navigation" data-open={open}>
        <p className="admin-nav-caption">VOTRE ESPACE DE GESTION</p>
        <nav aria-label="Administration" onClick={(event) => { if (event.target.closest("a")) setOpen(false); }}>
          {NAV.map(([href, label, icon]) => <AdminNavLink key={href} href={href} badge={href === "/admin/messages" ? unread : 0}><span className="admin-nav-label"><span aria-hidden="true" className="admin-nav-icon">{icon}</span>{label}</span></AdminNavLink>)}
        </nav>
        <div className="admin-sidebar-bottom"><a href="/" target="_blank" rel="noopener noreferrer">Voir le site public <span aria-hidden="true">↗</span></a><LogoutButton /></div>
      </div>
    </aside>
    <div className="admin-workspace">
      <header className="admin-topbar"><span>Administration <span aria-hidden="true">/</span> <strong>{current}</strong></span><a href="/admin/messages" aria-label={`${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""}`}>Messages <span className="admin-unread-count">{unread}</span></a></header>
      <main id="admin-main" className="admin-main" tabIndex={-1}>{children}</main>
      <footer className="admin-footer">Efficience Globale <span>Votre contenu, à votre rythme.</span></footer>
    </div>
  </div>;
}
