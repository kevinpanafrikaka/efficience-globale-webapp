"use client";

import { useRef, useState } from "react";
import AdminImage from "./AdminImage";

export default function ImageUpload({ value, onChange, required, disabled = false, onUploadingChange, allowRemove = false, showPreview = true }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || uploading || disabled) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Choisissez une image JPG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image trop lourde : 8 Mo maximum.");
      return;
    }
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || typeof data.url !== "string" || !data.url) {
        setError(data.error || "Échec de l’envoi. Réessayez.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Échec de l’envoi. Vérifiez votre connexion puis réessayez.");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  return (
    <div className="flex flex-col gap-2" aria-busy={uploading}>
      {showPreview && (value ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-line bg-cream">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <AdminImage src={value} alt="Aperçu de l’image sélectionnée" className="w-full h-full object-contain" />
        </div>
      ) : (
        <div
          className={`w-full h-40 rounded-lg border border-dashed flex items-center justify-center text-[13px] ${
            required ? "border-red-300 text-red-400" : "border-line text-ink-faint"
          }`}
        >
          Aucune image {required && "(requise)"}
        </div>
      ))}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={disabled || uploading} onChange={handleFileChange} aria-label="Choisir un fichier image" className="admin-upload-input" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || disabled} aria-busy={uploading}
        className="eg-button eg-button--secondary eg-button--compact"
      >
        {uploading ? "Envoi…" : value ? "Changer l'image" : "Choisir une image sur l’ordinateur"}
      </button>
      {allowRemove && value && !required && <button type="button" disabled={disabled || uploading} className="eg-button eg-button--quiet eg-button--compact admin-upload-clear" onClick={() => onChange("")}>Retirer cette image du contenu</button>}

      <p className="text-[12px] text-ink-soft">JPG, PNG, WebP ou GIF · 8 Mo maximum.</p>
      <p role="status" className="sr-only">{uploading ? "Envoi de l’image en cours." : ""}</p>
      {error && <p role="alert" className="text-[13px] text-red-600">{error}</p>}
    </div>
  );
}
