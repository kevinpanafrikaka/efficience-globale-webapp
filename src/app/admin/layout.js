import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import LoginForm from "@/components/admin/LoginForm";
import LogoutButton from "@/components/admin/LogoutButton";
import AdminNavLink from "@/components/admin/AdminNavLink";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/projets", label: "Projets" },
  { href: "/admin/membres", label: "Membres" },
  { href: "/admin/annonces", label: "Annonces" },
  { href: "/admin/apercu", label: "Aperçu du site" },
];

export default async function AdminLayout({ children }) {
  const { env } = await getCloudflareContext({ async: true });
  const authenticated = await isAdminAuthenticated(env);

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-5 py-24">
        <h1 className="text-[22px] mb-6 text-center">Espace admin</h1>
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-[220px] shrink-0 bg-darker px-3 py-6 flex flex-col justify-between">
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <AdminNavLink key={item.href} href={item.href}>
              {item.label}
            </AdminNavLink>
          ))}
        </nav>
        <div className="px-3.5">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 px-6 md:px-10 py-8">{children}</main>
    </div>
  );
}
