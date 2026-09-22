"use client";

import Link from "next/link";
import Image from "next/image";
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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-line safe-top">
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-[72px] flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center shrink-0" aria-label="Efficience Globale — Accueil">
          <Image src="/img/logo-eg.png" alt="Efficience Globale" width={160} height={52} className="h-9 w-auto" priority />
        </Link>

        <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-[13.5px] font-medium text-ink-soft overflow-x-auto">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hoverable text-dark whitespace-nowrap">
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contact"
          className="hidden lg:inline-flex items-center rounded-lg bg-lime px-4 py-2.5 text-[13.5px] font-semibold text-ink active:scale-[0.97] transition-transform shrink-0"
        >
          Nous contacter
        </Link>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 -mr-2"
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
        <div className="lg:hidden fixed inset-x-0 top-[72px] bottom-0 bg-white overflow-y-auto safe-bottom">
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
              className="mt-5 mb-6 inline-flex items-center justify-center rounded-lg bg-lime px-5 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform"
            >
              Nous contacter
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
