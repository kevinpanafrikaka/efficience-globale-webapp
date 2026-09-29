"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Boutons ↑ / ↓ : déplacent `id` à la place de son voisin visible (`prevId` ou `nextId`).
export default function ReorderButtons({ table, id, prevId, nextId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function move(targetId) {
    if (!targetId || loading) return;
    setLoading(true);
    await fetch("/api/admin/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, id, targetId }),
    });
    router.refresh();
    setLoading(false);
  }

  const btn =
    "w-7 h-7 flex items-center justify-center rounded border border-line text-[13px] text-ink-soft hover:border-lime hover:text-lime transition-colors disabled:opacity-30 disabled:pointer-events-none";

  return (
    <div className="flex items-center gap-1">
      <button type="button" aria-label="Monter" title="Monter" onClick={() => move(prevId)} disabled={!prevId || loading} className={btn}>
        ↑
      </button>
      <button type="button" aria-label="Descendre" title="Descendre" onClick={() => move(nextId)} disabled={!nextId || loading} className={btn}>
        ↓
      </button>
    </div>
  );
}
