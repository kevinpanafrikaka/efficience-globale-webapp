"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNavLink({ href, children }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`block px-3.5 py-2.5 rounded text-[14px] font-medium transition-colors ${
        active ? "bg-lime text-ink" : "text-ink-soft hover:bg-cream hover:text-dark"
      }`}
    >
      {children}
    </Link>
  );
}
