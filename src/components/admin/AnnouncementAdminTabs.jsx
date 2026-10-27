import Link from "next/link";
import "./announcement-admin-tabs.css";

export default function AnnouncementAdminTabs({ applications = false }) {
  return <nav className="announcement-admin-tabs" aria-label="Vues des annonces">
    <Link href="/admin/annonces" className="eg-button eg-button--filter" aria-current={!applications ? "page" : undefined}>Les annonces</Link>
    <Link href="/admin/candidatures" className="eg-button eg-button--filter" aria-current={applications ? "page" : undefined}>Les candidatures</Link>
  </nav>;
}
