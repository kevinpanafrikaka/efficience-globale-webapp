"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminNavLink from "./AdminNavLink";
import LogoutButton from "./LogoutButton";
import DashboardCreateMenu from "./DashboardCreateMenu";

const NAV = [
  ["/admin", "Tableau de bord", "◫"], ["/admin/projets", "Projets", "▤"],
  ["/admin/membres", "Équipe", "♧"], ["/admin/annonces", "Annonces", "◷"],
  ["/admin/partenaires", "Partenaires", "◇"], ["/admin/messages", "Messages", "✉"],
  ["/admin/medias", "Médiathèque", "▧"], ["/admin/reglages", "Réglages", "⚙"],
];

export default function AdminShell({ children, unread }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dashboard = pathname === "/admin";
  const projects = pathname === "/admin/projets";
  const team = pathname === "/admin/membres";
  const projectEditor = pathname === "/admin/projets/nouveau" || /^\/admin\/projets\/[^/]+\/modifier$/.test(pathname);
  const memberEditor = pathname === "/admin/membres/nouveau" || /^\/admin\/membres\/[^/]+\/modifier$/.test(pathname);
  useEffect(() => { setOpen(false); }, [pathname]);
  const current = [...NAV].reverse().find(([href]) => pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)))?.[1] || "Administration";
  return <div className="admin-space admin-shell">
    <a href="#admin-main" className="admin-skip-link">Aller au contenu</a>
    <aside className="admin-sidebar">
      <div className="admin-brand-row">
        <span className="admin-brand">Espace administration</span>
        <button type="button" className="eg-button eg-button--inverse eg-button--compact admin-menu-button" aria-expanded={open} aria-controls="admin-navigation" onClick={() => setOpen(!open)}>{open ? "Fermer ×" : "Menu ☰"}</button>
      </div>
      <div id="admin-navigation" className="admin-navigation" data-open={open}>
        <nav aria-label="Administration" onClick={(event) => { if (event.target.closest("a")) setOpen(false); }}>
          {NAV.map(([href, label, icon]) => <AdminNavLink key={href} href={href} badge={href === "/admin/messages" ? unread : 0}><span className="admin-nav-label"><span aria-hidden="true" className="admin-nav-icon">{icon}</span>{label}</span></AdminNavLink>)}
        </nav>
        <div className="admin-sidebar-bottom"><a href="/" target="_blank" rel="noopener noreferrer">Voir le site public <span aria-hidden="true">↗</span></a><LogoutButton /></div>
      </div>
    </aside>
    <div className="admin-workspace">
      {!projectEditor && !memberEditor && <header className={`admin-topbar ${dashboard || projects || team ? "is-dashboard" : ""}${projects ? " is-projects" : team ? " is-team" : ""}`}>
        {dashboard || projects || team ? <div className="admin-topbar-title"><h1>{team ? "Équipe" : projects ? "Projets" : "Tableau de bord"}</h1><p>{team ? "Gérez les profils du cabinet." : projects ? "Gérez les réalisations du cabinet." : "Vos contenus, vos échanges et les prochaines actions du cabinet."}</p></div> : <span>Administration <span aria-hidden="true">/</span> <strong>{current}</strong></span>}
        <div className="admin-topbar-actions"><a href="/admin/messages" aria-label={`${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""}`}>Messages <span className="admin-unread-count">{unread}</span></a>{dashboard && <DashboardCreateMenu />}{projects && <a href="/admin/projets/nouveau" className="eg-button eg-button--primary">+ Nouveau projet</a>}{team && <a href="/admin/membres/nouveau" className="eg-button eg-button--primary">+ Nouveau membre</a>}</div>
      </header>}
      <main id="admin-main" className="admin-main" tabIndex={-1}>{children}</main>
      <footer className="admin-footer">Efficience Globale <span>Votre contenu, à votre rythme.</span></footer>
    </div>
  </div>;
}
