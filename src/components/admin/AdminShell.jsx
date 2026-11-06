"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminNavLink from "./AdminNavLink";
import LogoutButton from "./LogoutButton";
import AdminMessageSearch, { MessageSearchContext } from "./AdminMessageSearch";
import DashboardCreateMenu from "./DashboardCreateMenu";

const NAV = [
  ["/admin", "Tableau de bord", "◫"], ["/admin/projets", "Projets", "▤"],
  ["/admin/membres", "Équipe", "♧"], ["/admin/annonces", "Annonces", "◷"],
  ["/admin/partenaires", "Partenaires", "◇"], ["/admin/messages", "Messages", "✉"],
  ["/admin/medias", "Médiathèque", "▧"], ["/admin/reglages", "Réglages", "⚙"],
];

export default function AdminShell({ children, unread }) {
  const [messageQuery,setMessageQuery]=useState(""), [messageSearchOpen,setMessageSearchOpen]=useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dashboard = pathname === "/admin";
  const projects = pathname === "/admin/projets";
  const media = pathname === "/admin/medias";
  const settings = pathname === "/admin/reglages";
  const messages = pathname === "/admin/messages" || pathname.startsWith("/admin/messages/");
  const partners = pathname === "/admin/partenaires";
  const partnerEditor = pathname === "/admin/partenaires/nouveau" || /^\/admin\/partenaires\/[^/]+\/modifier$/.test(pathname);
  const team = pathname === "/admin/membres";
  const applications = pathname === "/admin/candidatures" || pathname.startsWith("/admin/candidatures/");
  const announcements = pathname === "/admin/annonces" || applications;
  const announcementEditor = pathname === "/admin/annonces/nouveau" || /^\/admin\/annonces\/[^/]+\/modifier$/.test(pathname);
  const projectEditor = pathname === "/admin/projets/nouveau" || /^\/admin\/projets\/[^/]+\/modifier$/.test(pathname);
  const memberEditor = pathname === "/admin/membres/nouveau" || /^\/admin\/membres\/[^/]+\/modifier$/.test(pathname);
  useEffect(() => { setOpen(false); setMessageQuery(""); setMessageSearchOpen(false); }, [pathname]);
  const current = [...NAV].reverse().find(([href]) => pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)))?.[1] || "Administration";
  return <MessageSearchContext.Provider value={{query:messageQuery,setQuery:setMessageQuery,searchOpen:messageSearchOpen,setSearchOpen:setMessageSearchOpen}}><div className="admin-space admin-shell">
    <a href="#admin-main" className="admin-skip-link">Aller au contenu</a>
    <aside className="admin-sidebar">
      <div className="admin-brand-row">
        <span className="admin-brand">Espace administration</span>
        <button type="button" className="eg-button eg-button--inverse eg-button--compact admin-menu-button" aria-expanded={open} aria-controls="admin-navigation" onClick={() => setOpen(!open)}>{open ? "Fermer ×" : "Menu ☰"}</button>
      </div>
      <div id="admin-navigation" className="admin-navigation" data-open={open}>
        <nav aria-label="Administration" onClick={(event) => { if (event.target.closest("a")) setOpen(false); }}>
          {NAV.map(([href, label, icon]) => <AdminNavLink key={href} href={href} relatedPaths={href === "/admin/annonces" ? ["/admin/candidatures"] : []} badge={href === "/admin/messages" ? unread : 0}><span className="admin-nav-label"><span aria-hidden="true" className="admin-nav-icon">{icon}</span>{label}</span></AdminNavLink>)}
        </nav>
        <div className="admin-sidebar-bottom"><a href="/" target="_blank" rel="noopener noreferrer">Voir le site public <span aria-hidden="true">↗</span></a><LogoutButton /></div>
      </div>
    </aside>
    <div className="admin-workspace">
      {!projectEditor && !memberEditor && !announcementEditor && !partnerEditor && <header data-message-search={messages ? messageSearchOpen : undefined} className={`admin-topbar ${dashboard || projects || team || announcements || partners || messages || media || settings ? "is-dashboard" : ""}${projects ? " is-projects" : team ? " is-team" : announcements ? " is-announcements" : partners ? " is-partners" : messages ? " is-messages" : ""}`}>
        {dashboard || projects || team || announcements || partners || messages || media || settings ? <div className="admin-topbar-title"><h1>{settings ? "Réglages" : media ? "Médiathèque" : messages ? "Messages" : partners ? "Partenaires" : announcements ? "Annonces" : team ? "Équipe" : projects ? "Projets" : "Tableau de bord"}</h1></div> : <span>Administration <span aria-hidden="true">/</span> <strong>{current}</strong></span>}
        <div className="admin-topbar-actions">{messages ? <><span className="message-header-count">{unread} non lu{unread > 1 ? "s" : ""}</span><AdminMessageSearch /></> : <a href="/admin/messages" aria-label={`${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""}`}>Messages <span className="admin-unread-count">{unread}</span></a>}{dashboard && <DashboardCreateMenu />}{projects && <a href="/admin/projets/nouveau" className="eg-button eg-button--primary">+ Nouveau projet</a>}{team && <a href="/admin/membres/nouveau" className="eg-button eg-button--primary">+ Nouveau membre</a>}{partners && <a href="/admin/partenaires/nouveau" className="eg-button eg-button--primary">+ Nouveau partenaire</a>}{announcements && <a href="/admin/annonces/nouveau" className="eg-button eg-button--primary">+ Nouvelle annonce</a>}</div>
      </header>}
      <main id="admin-main" className="admin-main" tabIndex={-1}>{children}</main>
      <footer className="admin-footer">Efficience Globale</footer>
    </div>
  </div></MessageSearchContext.Provider>;
}
