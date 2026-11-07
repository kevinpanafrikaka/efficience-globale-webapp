"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AdminNavLink from "./AdminNavLink";
import LogoutButton from "./LogoutButton";
import AdminMessageSearch, { MessageSearchContext } from "./AdminMessageSearch";
import DashboardCreateMenu from "./DashboardCreateMenu";
import AdminSidebarIcon from "./AdminSidebarIcon";
import "./admin-sidebar.css";

const NAV = [
  ["/admin", "Tableau de bord", "dashboard"], ["/admin/projets", "Projets", "projects"],
  ["/admin/membres", "Équipe", "team"], ["/admin/annonces", "Annonces", "announcements"],
  ["/admin/partenaires", "Partenaires", "partners"], ["/admin/messages", "Messages", "messages"],
  ["/admin/medias", "Médiathèque", "media"], ["/admin/reglages", "Réglages", "settings"],
];

export default function AdminShell({ children, unread }) {
  const [messageQuery,setMessageQuery]=useState(""), [messageSearchOpen,setMessageSearchOpen]=useState(false);
  const [open, setOpen] = useState(false), [collapsed, setCollapsed] = useState(false);
  const menuButton = useRef(null);
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const media = window.matchMedia?.("(min-width: 1024px)");
    if (!media) return;
    const update = () => setDesktop(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    try { setCollapsed(window.localStorage.getItem("eg-admin-sidebar-collapsed") === "1"); } catch { /* Storage can be disabled. */ }
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = event => { if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    try { window.localStorage.setItem("eg-admin-sidebar-collapsed", next ? "1" : "0"); } catch { /* Keep the current-session preference. */ }
  }
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
  return <MessageSearchContext.Provider value={{query:messageQuery,setQuery:setMessageQuery,searchOpen:messageSearchOpen,setSearchOpen:setMessageSearchOpen}}><div className="admin-space admin-shell" data-sidebar-collapsed={collapsed}>
    <a href="#admin-main" className="admin-skip-link">Aller au contenu</a>
    <aside className="admin-sidebar">
      <div className="admin-brand-row">
        <button type="button" className="admin-brand-link" aria-label={desktop ? (collapsed ? "Développer le menu" : "Réduire le menu") : (open ? "Fermer le menu" : "Ouvrir le menu")} title={desktop ? (collapsed ? "Développer le menu" : "Réduire le menu") : (open ? "Fermer le menu" : "Ouvrir le menu")} aria-expanded={desktop ? !collapsed : open} aria-controls="admin-navigation" onClick={() => { if (desktop) toggleSidebar(); else setOpen(!open); }}><span className="admin-brand-logo"><img src="/img/logo-eg.png" width="345" height="109" alt="Efficience Globale"/></span></button>
        <button ref={menuButton} type="button" className="admin-menu-button" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} aria-controls="admin-navigation" onClick={() => setOpen(!open)}><AdminSidebarIcon type={open ? "close" : "menu"}/></button>
      </div>
      <div id="admin-navigation" className="admin-navigation" data-open={open}>
        <nav aria-label="Administration" onClick={(event) => { if (event.target.closest("a")) setOpen(false); }}>
          {NAV.map(([href, label, icon]) => <AdminNavLink key={href} href={href} label={label} relatedPaths={href === "/admin/annonces" ? ["/admin/candidatures"] : []} badge={href === "/admin/messages" ? unread : 0}><span className="admin-nav-label"><span className="admin-nav-icon"><AdminSidebarIcon type={icon}/></span><span className="admin-sidebar-text">{label}</span></span></AdminNavLink>)}
        </nav>
        <div className="admin-sidebar-bottom"><a href="/" target="_blank" rel="noopener noreferrer" aria-label="Voir le site public (nouvel onglet)" title="Voir le site public"><AdminSidebarIcon type="external"/><span className="admin-sidebar-text">Voir le site public</span></a><LogoutButton sidebar/></div>
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
