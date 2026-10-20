"use client";
import { useRouter } from "next/navigation";
import useAdminAction from "./useAdminAction";
export default function DeleteButton({ endpoint, confirmMessage, redirectTo }) {
  const router = useRouter();
  const { run, loading, error } = useAdminAction();
  async function handleDelete() {
    if (loading || !window.confirm(confirmMessage || "Supprimer définitivement ?")) return;
    await run(endpoint, { method: "DELETE" }, () => { if (redirectTo) router.push(redirectTo); router.refresh(); });
  }
  return <span className="inline-flex flex-col items-start"><button type="button" onClick={handleDelete} disabled={loading} aria-busy={loading} className="eg-button eg-button--danger eg-button--compact">{loading ? "Suppression…" : "Supprimer"}</button>{error && <span role="alert" className="admin-action-error">{error}</span>}</span>;
}
