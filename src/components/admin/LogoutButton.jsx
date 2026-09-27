"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-[13px] font-semibold text-ink-soft hover:text-dark transition-colors"
    >
      Se déconnecter
    </button>
  );
}
