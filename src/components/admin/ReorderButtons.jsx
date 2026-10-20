"use client";
import { useRouter } from "next/navigation";
import useAdminAction from "./useAdminAction";
export default function ReorderButtons({ table, id, prevId, nextId }) {
  const router = useRouter();
  const { run, loading, error } = useAdminAction();
  async function move(targetId) {
    if (!targetId) return;
    await run("/api/admin/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table, id, targetId }) }, () => router.refresh());
  }
  const btn = "w-10 min-h-11 flex items-center justify-center rounded-lg border border-line text-[16px] text-ink-soft hover:border-lime disabled:opacity-30";
  return <div className="flex flex-col gap-1"><div className="flex items-center gap-1">
    <button type="button" aria-label="Monter" title="Monter" onClick={() => move(prevId)} disabled={!prevId || loading} className={btn}>↑</button>
    <button type="button" aria-label="Descendre" title="Descendre" onClick={() => move(nextId)} disabled={!nextId || loading} className={btn}>↓</button>
  </div>{error && <span role="alert" className="admin-action-error">{error}</span>}</div>;
}
