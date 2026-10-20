"use client";
import { useRouter } from "next/navigation";
import useAdminAction from "./useAdminAction";
export default function LogoutButton() {
  const router = useRouter();
  const { run, loading, error } = useAdminAction();
  return <div><button type="button" disabled={loading} onClick={() => run("/api/admin/logout", { method: "POST" }, () => { router.push("/admin"); router.refresh(); })} className="text-[13px] font-semibold text-[#b9c4b4] hover:text-white">{loading ? "Déconnexion…" : "Se déconnecter"}</button>{error && <p role="alert" className="text-[12px] text-red-200">{error}</p>}</div>;
}
