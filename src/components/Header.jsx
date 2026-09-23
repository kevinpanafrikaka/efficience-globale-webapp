"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-line safe-top">
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-[72px] flex items-center gap-8">
        <Link href="/" className="flex items-center shrink-0" aria-label="Efficience Globale — Accueil">
          <Image src="/img/logo-eg.png" alt="Efficience Globale" width={160} height={52} className="h-9 w-auto" priority />
        </Link>

        <nav className="hidden xl:flex flex-1 items-center justify-end gap-6 2xl:gap-8 text-[15px] font-semibold">
          {NAV_LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname === l.href || pathname?.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
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
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="xl:hidden p-2 -mr-2"
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
        <div className="xl:hidden fixed inset-x-0 top-[72px] bottom-0 bg-white overflow-y-auto safe-bottom">
          <nav className="flex flex-col px-5">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-4 text-[17px] font-semibold text-dark border-b border-line active:bg-cream"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-5 mb-6 inline-flex items-center justify-center rounded bg-lime px-5 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform"
            >
              Nous contacter
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
