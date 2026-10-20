"use client";

import { useRef, useState } from "react";

export default function useAdminAction() {
  const busy = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run(endpoint, options, onSuccess) {
    if (busy.current) return false;
    busy.current = true;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(endpoint, options);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(response.status === 401 ? "Session expirée. Reconnectez-vous à l’administration." : data.error || "Action impossible. Réessayez.");
        return false;
      }
      await onSuccess?.();
      return true;
    } catch {
      setError("Connexion interrompue. Votre action n’a pas pu être confirmée. Réessayez.");
      return false;
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }
  return { run, loading, error };
}
