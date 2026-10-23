import { adminPageAllowed } from "@/lib/admin-page";
import Link from "next/link";
import { getDashboardStats } from "@/lib/db";
import { formatDate } from "@/lib/format";
import AdminImage from "@/components/admin/AdminImage";
import DashboardIcon from "@/components/admin/DashboardIcon";
import "./dashboard.css";

export const dynamic = "force-dynamic";

const CONTENT = [
  { type: "projets", label: "Projets", singular: "Projet" },
  { type: "membres", label: "Équipe", singular: "Profil d’équipe" },
  { type: "annonces", label: "Annonces", singular: "Annonce" },
  { type: "partenaires", label: "Partenaires", singular: "Partenaire" },
];
const contentLabel = (type) => CONTENT.find((item) => item.type === type)?.singular || "Contenu";
const editHref = (item) => `/admin/${item.type}/${encodeURIComponent(item.id)}/modifier`;

function Initials({ name }) {
  const letters = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("");
  return <span className="dashboard-avatar" aria-hidden="true">{letters || "EG"}</span>;
}

function StatCard({ item, stats }) {
  return <Link href={`/admin/${item.type}`} className="dashboard-stat" aria-label={`Gérer ${item.label.toLowerCase()} : ${stats?.publies ?? "données indisponibles"} en ligne${stats ? `, ${stats.brouillons} brouillon${stats.brouillons > 1 ? "s" : ""}` : ""}`}>
    <div className="dashboard-stat-top"><span>{item.label}</span><span className="dashboard-stat-icon"><DashboardIcon type={item.type} /></span></div>
    <div className="dashboard-stat-value"><strong>{stats ? stats.publies.toLocaleString("fr-FR") : "—"}</strong><span>{stats ? "en ligne" : "Indisponible"}</span></div>
    <div className="dashboard-stat-foot"><span className={stats?.brouillons > 0 ? "dashboard-draft-count" : ""}>{stats ? stats.brouillons > 0 ? `${stats.brouillons} brouillon${stats.brouillons > 1 ? "s" : ""}` : "Aucun brouillon" : "Données indisponibles"}</span><span>Gérer</span></div>
  </Link>;
}

export default async function AdminHomePage() {
  if (!(await adminPageAllowed())) return null;
  const s = await getDashboardStats();
  const drafts = CONTENT.reduce((sum, item) => sum + (s[item.type]?.brouillons || 0), 0);
  const unread = s.messagesNonLus;
  return <div className="admin-dashboard">

    <section className="dashboard-stats" aria-label="Les contenus du cabinet">{CONTENT.map((item) => <StatCard key={item.type} item={item} stats={s[item.type]} />)}</section>

    <div className="dashboard-workspace">
      <section className="dashboard-panel dashboard-inbox" aria-labelledby="dashboard-inbox-title">
        <header className="dashboard-panel-heading"><div><h2 id="dashboard-inbox-title">Derniers messages</h2></div>{unread !== null && <span className={`dashboard-status ${unread > 0 ? "is-unread" : ""}`}>{unread} non lu{unread > 1 ? "s" : ""}</span>}</header>
        {unread === null ? <div className="dashboard-empty"><DashboardIcon type="messages" size={28} /><h3>Messages indisponibles</h3><p>La boîte de réception n’est pas accessible pour le moment.</p></div> : s.derniersMessages.length === 0 ? <div className="dashboard-empty"><DashboardIcon type="messages" size={28} /><h3>Aucun message reçu.</h3></div> : <div className="dashboard-message-list">{s.derniersMessages.map((message) => <Link key={message.id} href={`/admin/messages/${encodeURIComponent(message.id)}`} className={`dashboard-message ${!message.lu ? "is-unread" : ""}`}><Initials name={message.nom} /><div className="dashboard-message-copy"><div><strong>{message.nom}</strong>{!message.lu && <span className="dashboard-unread-dot" aria-label="Non lu" />}</div><p>{message.sujet || "Message sans objet"}</p><time>{formatDate(message.cree_le)}</time></div><span className="dashboard-message-action">Ouvrir</span></Link>)}</div>}
        {unread !== null && <footer className="dashboard-panel-footer"><Link href="/admin/messages" className="eg-button eg-button--secondary eg-button--compact">Tous les messages</Link></footer>}
      </section>

      <section className="dashboard-panel dashboard-priorities" aria-labelledby="dashboard-priorities-title">
        <header className="dashboard-panel-heading"><div><h2 id="dashboard-priorities-title">À traiter</h2></div><span className="dashboard-priority-icon"><DashboardIcon type="draft" /></span></header>
        {unread > 0 && <Link href="/admin/messages" className="dashboard-unread-task" aria-label={`${unread} message${unread > 1 ? "s" : ""} à lire`}><span className="dashboard-task-count">{unread}</span><span><strong>Message{unread > 1 ? "s" : ""} à lire</strong></span></Link>}
        {drafts > 0 ? <div className="dashboard-drafts"><p className="dashboard-drafts-heading"><strong>{drafts}</strong> contenu{drafts > 1 ? "s" : ""} à finaliser</p><div className="dashboard-draft-list">{s.derniersBrouillons.map((item) => <Link key={`${item.type}-${item.id}`} href={editHref(item)}><span><small>{contentLabel(item.type)}</small><strong>{item.titre}</strong></span><span className="dashboard-draft-resume">Reprendre</span></Link>)}</div>{drafts > s.derniersBrouillons.length && <nav className="dashboard-draft-groups" aria-label="Retrouver tous les brouillons">{CONTENT.filter((item) => s[item.type]?.brouillons > 0).map((item) => <Link key={item.type} href={`/admin/${item.type}`}>{item.label}<span>{s[item.type].brouillons}</span></Link>)}</nav>}</div> : <div className="dashboard-clear"><span className="dashboard-clear-icon"><DashboardIcon type="check" size={28} /></span><h3>Aucun brouillon en attente.</h3></div>}
      </section>
    </div>

    <section className="dashboard-panel dashboard-publications" aria-labelledby="dashboard-publications-title"><header className="dashboard-panel-heading"><div><h2 id="dashboard-publications-title">Publications récentes</h2></div></header>
      {s.dernieresPublications.length === 0 ? <div className="dashboard-empty"><DashboardIcon type="projets" size={28} /><h3>Aucune publication en ligne.</h3></div> : <div className="dashboard-publication-grid">{s.dernieresPublications.map((item) => <Link key={`${item.type}-${item.id}`} href={editHref(item)} className="dashboard-publication"><div className={`dashboard-publication-thumb ${item.type === "partenaires" ? "is-logo" : ""}`}>{item.image_url ? <AdminImage src={item.image_url} alt="" className="dashboard-publication-image" /> : <DashboardIcon type={item.type} size={26} />}</div><div className="dashboard-publication-copy"><span className="dashboard-publication-type">{contentLabel(item.type)}</span><h3>{item.titre}</h3><time>Ajouté le {formatDate(item.date)}</time></div><span className="dashboard-publication-edit">Modifier</span></Link>)}</div>}
    </section>
  </div>;
}
