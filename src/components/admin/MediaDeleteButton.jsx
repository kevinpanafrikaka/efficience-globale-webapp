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
  return <span className="inline-flex flex-col"><button type="button" onClick={handleDelete} disabled={loading} aria-busy={loading} className="eg-button eg-button--danger eg-button--compact">{loading ? "Suppression…" : "Supprimer"}</button>{error && <span role="alert" className="admin-action-error">{error}</span>}</span>;
}
