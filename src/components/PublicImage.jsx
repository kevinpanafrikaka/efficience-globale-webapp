"use client";

import { useState } from "react";
import Image from "next/image";

// Tolère les photos facultatives et les fichiers supprimés, uniquement sur le site public.
export default function PublicImage({ src, alt = "", fill, width, height, className = "", onError, ...props }) {
  const [failed, setFailed] = useState(null);
  if (!src || failed === src) {
    return <span role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}
      className={`public-image-fallback ${fill ? "absolute inset-0" : "inline-flex"} ${className}`}
      style={fill ? undefined : { width, height }}><svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.5" /><path d="m4 17 5-5 4 4 3-3 5 5" /></svg></span>;
  }
  const direct = typeof src === "string" && (src.startsWith("/uploads/") || /^https?:\/\//.test(src));
  return <Image {...props} src={src} alt={alt} fill={fill} width={width} height={height} className={className}
    unoptimized={direct || props.unoptimized} onError={(event) => { setFailed(src); onError?.(event); }} />;
}
