"use client";

import { useRef, useState } from "react";

export default function ImageUpload({ value, onChange, required }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Échec de l'envoi.");
        setUploading(false);
        return;
      }
      onChange(data.url);
      setUploading(false);
    } catch {
      setError("Échec de l'envoi. Vérifiez votre connexion.");
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-line bg-cream">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className={`w-full h-40 rounded-lg border border-dashed flex items-center justify-center text-[13px] ${
            required ? "border-red-300 text-red-400" : "border-line text-ink-faint"
          }`}
        >
          Aucune image {required && "(requise)"}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center justify-center rounded border border-line px-4 py-2 text-[13px] font-semibold text-dark-2 hover:border-lime hover:text-lime transition-colors w-fit disabled:opacity-60"
      >
        {uploading ? "Envoi…" : value ? "Changer l'image" : "Choisir une image"}
      </button>

      {error && <p className="text-[13px] text-red-600">{error}</p>}
    </div>
  );
}
