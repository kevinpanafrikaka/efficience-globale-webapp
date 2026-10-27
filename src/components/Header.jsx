"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/domaines", label: "Domaines" },
  { href: "/services", label: "Services" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/equipe", label: "Notre équipe" },
  { href: "/partenaires", label: "Partenaires" },
  { href: "/annonces", label: "Annonces" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const isActive = (href) => href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(`${href}/`);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("a")?.focus();
    function closeMenu() {
      setOpen(false);
      toggleRef.current?.focus();
    }
    function handleKey(event) {
      if (event.key === "Escape") closeMenu();
      if (event.key !== "Tab") return;
      const links = [...panelRef.current.querySelectorAll("a"), toggleRef.current];
      const index = links.indexOf(document.activeElement);
      event.preventDefault();
      links[(index + (event.shiftKey ? -1 : 1) + links.length) % links.length]?.focus();
    }
    const desktop = window.matchMedia("(min-width: 1280px)");
    const handleResize = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener("keydown", handleKey);
    desktop.addEventListener("change", handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      desktop.removeEventListener("change", handleResize);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-line safe-top">
      <div className="public-shell h-[72px] flex items-center gap-5 justify-between">
        <Link href="/" className="flex items-center shrink-0" aria-label="Efficience Globale — Accueil">
          <Image src="/img/logo-eg.png" alt="Efficience Globale" width={160} height={52} className="h-9 w-auto" priority />
        </Link>

        <nav aria-label="Navigation principale" className="hidden xl:flex flex-1 items-center justify-end gap-6 2xl:gap-8 text-[15px] font-semibold">
          {NAV_LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap border-b-2 pb-1 transition-colors ${
                  active ? "border-lime text-dark" : "border-transparent text-ink-soft hoverable"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          ref={toggleRef}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-controls={open ? "mobile-navigation" : undefined}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="public-menu-toggle xl:hidden min-w-11 min-h-11 flex items-center justify-center p-2 -mr-2"
        >
          <span className="relative block w-6 h-4">
            <span
              className={`absolute left-0 top-0 h-[2px] w-6 bg-dark transition-transform duration-200 ${open ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`absolute left-0 bottom-0 h-[2px] w-6 bg-dark transition-transform duration-200 ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div ref={panelRef} id="mobile-navigation" className="xl:hidden fixed inset-x-0 top-[calc(72px+env(safe-area-inset-top,0px))] bottom-0 bg-white overflow-y-auto overscroll-contain safe-bottom">
          <nav aria-label="Navigation mobile" className="flex flex-col px-5 py-2">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`py-4 px-3 min-h-12 text-[17px] font-semibold border-b border-line active:bg-cream ${isActive(l.href) ? "text-dark bg-cream border-l-2 border-l-lime" : "text-dark"}`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="eg-button eg-button--primary mt-5 mb-6"
            >
              Nous contacter
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
