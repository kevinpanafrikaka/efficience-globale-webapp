import Image from "next/image";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { countMessagesNonLus } from "@/lib/db";
import LoginForm from "@/components/admin/LoginForm";
import AdminShell from "@/components/admin/AdminShell";
import "./admin.css";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const { env } = await getCloudflareContext({ async: true });
  const authenticated = await isAdminAuthenticated(env);

  if (!authenticated) {
    return (
      <div className="admin-space admin-login-page"><div className="admin-login-card">
        <Image src="/img/logo-eg.png" alt="Efficience Globale" width={200} height={65} className="admin-login-logo" />
        <p className="admin-login-eyebrow">VOTRE ESPACE DE GESTION</p>
        <h1>Bienvenue au cabinet.</h1><p className="admin-login-description">Connectez-vous pour gérer les contenus et les messages du site.</p>
        <LoginForm /><a className="admin-login-back" href="/">← Retour au site public</a>
      </div></div>
    );
  }

  const messagesNonLus = await countMessagesNonLus();

  return <AdminShell unread={messagesNonLus}>{children}</AdminShell>;
}
