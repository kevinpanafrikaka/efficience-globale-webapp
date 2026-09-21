"use client";

import { useEffect, useRef, useState } from "react";

// Révélation au scroll : transform+opacity, ease-out marqué, stagger léger.
// Gate : contenu marketing vu une fois par visite — pas d'anim sur les
// interactions répétées. Respecte prefers-reduced-motion via CSS (globals.css).
export default function Reveal({ children, index = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const delay = Math.min(index * 60, 240);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
