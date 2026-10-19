"use client";

import { useEffect } from "react";

// Une fiche s'ouvre au début, même après avoir parcouru une longue liste.
export default function ProjectPageEntry({ slug }) {
  useEffect(() => {
    if (window.location.hash) return;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [slug]);

  return null;
}
