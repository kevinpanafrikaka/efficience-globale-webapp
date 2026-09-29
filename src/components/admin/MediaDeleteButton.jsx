"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MediaDeleteButton({ mediaKey }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!window.confirm("Supprimer définitivement cette image ?")) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/medias", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: mediaKey }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Échec.");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        title={error || undefined}
        className="text-[12.5px] font-semibold text-red-600 hover:text-red-700 transition-colors disabled:opacity-60"
      >
        {loading ? "…" : error ? "Erreur" : "Supprimer"}
      </button>
    </>
  );
}
