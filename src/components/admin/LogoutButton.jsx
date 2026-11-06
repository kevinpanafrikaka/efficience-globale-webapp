"use client";
import { useRouter } from "next/navigation";
import useAdminAction from "./useAdminAction";
import AdminSidebarIcon from "./AdminSidebarIcon";
export default function LogoutButton({ sidebar = false }) {
  const router = useRouter();
  const { run, loading, error } = useAdminAction();
  return <div className={sidebar ? "admin-sidebar-logout" : undefined}><button type="button" aria-label={loading ? "Déconnexion…" : "Se déconnecter"} title="Se déconnecter" disabled={loading} aria-busy={loading} onClick={() => run("/api/admin/logout", { method: "POST" }, () => { router.push("/admin"); router.refresh(); })} className={sidebar ? "admin-logout-button" : "eg-button eg-button--inverse eg-button--compact"}>{sidebar && <AdminSidebarIcon type="logout"/>}<span className={sidebar ? "admin-sidebar-text" : undefined}>{loading ? "Déconnexion…" : "Se déconnecter"}</span></button>{error && <p role="alert" className="text-[12px] text-red-200">{error}</p>}</div>;
}
