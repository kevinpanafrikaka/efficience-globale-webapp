"use client";
import { useState } from "react";
import { projectImageSource } from "@/lib/project-images.mjs";

export default function AdminImage({ src, alt = "", className = "" }) {
  const [failed, setFailed] = useState(null);
  const optimized = projectImageSource(src);
  const current = failed === optimized ? src : optimized;
  if (!src || failed === src) return <span role="img" aria-label={alt || "Aperçu indisponible"} className={`admin-image-fallback ${className}`}>Aperçu indisponible</span>;
  return <img src={current} alt={alt} loading="lazy" decoding="async" className={className} onError={() => setFailed(current)} />;
}
