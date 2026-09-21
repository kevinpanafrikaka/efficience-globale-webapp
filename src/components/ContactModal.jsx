"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ContactForm from "@/components/ContactForm";
import { IconClose } from "@/components/icons";

const CLOSE_DELAY_MS = 400; // couvre la durée de la transition mobile (400ms) et desktop (300ms)

export default function ContactModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Ouverture différée d'une frame : l'élément doit d'abord peindre son état
  // fermé pour que la transition CSS se déclenche au changement de classe.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => router.back(), CLOSE_DELAY_MS);
  }, [router]);

  // Verrouille le scroll de la page derrière la modale.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Échap pour fermer, focus initial sur le panneau.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close]);

  return (
    <div className="fixed inset-0 z-[100] flex md:items-center md:justify-center">
      <div
        className={`sheet-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm ${open ? "is-open" : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Nous contacter"
        tabIndex={-1}
        className={`sheet-panel relative w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl mt-auto md:mt-0 max-h-[88dvh] md:max-h-[85vh] flex flex-col safe-bottom outline-none ${open ? "is-open" : ""}`}
      >
        {/* poignée — mobile uniquement */}
        <div className="md:hidden flex justify-center pt-3 pb-1" style={{ touchAction: "pan-x" }}>
          <div className="h-1.5 w-10 rounded-full bg-line" />
        </div>

        <div className="flex items-center justify-between px-6 pt-4 md:pt-6 pb-2">
          <h2 className="text-[19px]">Nous contacter</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer"
            className="p-2 -mr-2 text-ink-soft focus:outline-none focus:ring-2 focus:ring-lime rounded-full"
          >
            <IconClose />
          </button>
        </div>

        <div className="px-6 pb-6 pt-2 overflow-y-auto" style={{ overscrollBehavior: "contain" }}>
          <ContactForm compact />
        </div>
      </div>
    </div>
  );
}
