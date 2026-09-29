"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ endpoint, confirmMessage, redirectTo }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmMessage || "Supprimer définitivement ?")) return;
    setLoading(true);
    await fetch(endpoint, { method: "DELETE" });
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-[12.5px] font-semibold text-red-600 hover:text-red-700 transition-colors disabled:opacity-60"
    >
      {loading ? "…" : "Supprimer"}
    </button>
  );
}
