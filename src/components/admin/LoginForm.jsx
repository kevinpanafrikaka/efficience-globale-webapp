"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Connexion impossible.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xs mx-auto">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-[13px] font-semibold text-dark">
          Mot de passe admin
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded-lg border border-line px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-lime"
        />
      </div>
      {error && <p className="text-[13.5px] text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded bg-lime px-6 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2 disabled:opacity-60 disabled:pointer-events-none"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
