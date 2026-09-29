"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DeleteButton from "@/components/admin/DeleteButton";

export default function MessageActions({ id, lu, redirectAfterDelete }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/messages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lu: !lu }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className="text-[12.5px] font-semibold text-dark-2 hover:text-lime transition-colors disabled:opacity-60"
      >
        {lu ? "Marquer non lu" : "Marquer lu"}
      </button>
      <DeleteButton endpoint={`/api/admin/messages/${id}`} confirmMessage="Supprimer ce message ?" redirectTo={redirectAfterDelete} />
    </div>
  );
}
