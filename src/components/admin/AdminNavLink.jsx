"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNavLink({ href, children, badge = 0 }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center justify-between px-3.5 py-2.5 rounded text-[14px] font-medium transition-colors ${
        active ? "bg-lime text-ink" : "text-[#b9c4b4] hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
      {badge > 0 && (
        <span className={`ml-2 min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${active ? "bg-ink text-white" : "bg-lime text-ink"}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}
