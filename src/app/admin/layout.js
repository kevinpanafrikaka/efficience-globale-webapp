import Image from "next/image";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { countMessagesNonLus } from "@/lib/db";
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
  { href: "/admin/partenaires", label: "Partenaires" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/medias", label: "Médias" },
  { href: "/admin/reglages", label: "Réglages" },
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

  const messagesNonLus = await countMessagesNonLus();

  return (
    <div className="flex min-h-screen">
      <aside className="w-[220px] shrink-0 bg-darker px-3 py-6 flex flex-col justify-between">
        <div>
          <Image
            src="/img/logo-eg.png"
            alt="Efficience Globale"
            width={160}
            height={52}
            className="h-8 w-auto brightness-0 invert opacity-95 mb-6 ml-3.5"
          />
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <AdminNavLink key={item.href} href={item.href} badge={item.href === "/admin/messages" ? messagesNonLus : 0}>
                {item.label}
              </AdminNavLink>
            ))}
          </nav>
        </div>
        <div className="px-3.5">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 px-6 md:px-10 py-8">{children}</main>
    </div>
  );
}
