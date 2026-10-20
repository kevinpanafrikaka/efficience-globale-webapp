"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const busy = useRef(false);
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy.current) return;
    busy.current = true;
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
    } finally { busy.current = false; }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xs mx-auto">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-[13px] font-semibold text-dark">
          Mot de passe admin
        </label>
        <div className="admin-password-wrap"><input
          id="password"
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded-lg border border-line px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-lime"
        /><button type="button" onClick={() => setVisible(!visible)} aria-pressed={visible} aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{visible ? "Masquer" : "Afficher"}</button></div>
      </div>
      {error && <p role="alert" className="text-[13.5px] text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading} aria-busy={loading}
        className="eg-button eg-button--primary"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
