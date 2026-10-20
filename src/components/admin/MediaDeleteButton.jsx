"use client";
import { useRouter } from "next/navigation";
import useAdminAction from "./useAdminAction";
export default function MediaDeleteButton({ mediaKey }) {
  const router = useRouter();
  const { run, loading, error } = useAdminAction();
  async function handleDelete() {
    if (loading || !window.confirm("Supprimer définitivement cette image ?")) return;
    await run("/api/admin/medias", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: mediaKey }) }, () => router.refresh());
  }
  return <span className="inline-flex flex-col"><button type="button" onClick={handleDelete} disabled={loading} className="text-[12.5px] font-semibold text-red-600 disabled:opacity-60">{loading ? "Suppression…" : "Supprimer"}</button>{error && <span role="alert" className="admin-action-error">{error}</span>}</span>;
}
