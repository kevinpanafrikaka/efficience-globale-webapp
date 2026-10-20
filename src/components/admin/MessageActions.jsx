"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import DeleteButton from "./DeleteButton";
import useAdminAction from "./useAdminAction";
export default function MessageActions({ id, lu, markOnOpen = false, redirectAfterDelete }) {
  const router = useRouter();
  const { run, loading, error } = useAdminAction();
  const attempted = useRef(false);
  async function setRead(value) {
    return run(`/api/admin/messages/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lu: value }) }, () => router.refresh());
  }
  useEffect(() => {
    if (markOnOpen && !lu && !attempted.current) { attempted.current = true; setRead(true); }
  }, [id, lu, markOnOpen]);
  return <div className="admin-action-group">
    <button type="button" onClick={() => setRead(!lu)} disabled={loading} aria-busy={loading} className="eg-button eg-button--secondary eg-button--compact">{loading ? "Mise à jour…" : lu ? "Marquer non lu" : "Marquer lu"}</button>
    <DeleteButton endpoint={`/api/admin/messages/${id}`} confirmMessage="Supprimer ce message ?" redirectTo={redirectAfterDelete} />
    {error && <span role="alert" className="admin-action-error">{error}</span>}
  </div>;
}
