"use client";
import { useRouter } from "next/navigation";
import useAdminAction from "./useAdminAction";
export default function LogoutButton() {
  const router = useRouter();
  const { run, loading, error } = useAdminAction();
  return <div><button type="button" disabled={loading} aria-busy={loading} onClick={() => run("/api/admin/logout", { method: "POST" }, () => { router.push("/admin"); router.refresh(); })} className="eg-button eg-button--inverse eg-button--compact">{loading ? "Déconnexion…" : "Se déconnecter"}</button>{error && <p role="alert" className="text-[12px] text-red-200">{error}</p>}</div>;
}
