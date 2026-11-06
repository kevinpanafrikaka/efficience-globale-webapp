"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNavLink({ href, children, badge = 0, relatedPaths = [], label }) {
  const pathname = usePathname();
  const active = [href, ...relatedPaths].some(path => pathname === path || (path !== "/admin" && pathname.startsWith(`${path}/`)));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={label ? `${label}${badge > 0 ? ` · ${badge} message${badge > 1 ? "s" : ""} non lu${badge > 1 ? "s" : ""}` : ""}` : undefined}
      title={label}
      className="admin-nav-link"
    >
      {children}
      {badge > 0 && (
        <span className="admin-nav-badge" aria-hidden="true">
          {badge}
        </span>
      )}
    </Link>
  );
}
