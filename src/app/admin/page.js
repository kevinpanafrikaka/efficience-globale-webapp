import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import LoginForm from "@/components/admin/LoginForm";
import LogoutButton from "@/components/admin/LogoutButton";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
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
    <div className="max-w-3xl mx-auto px-5 py-16 md:py-20">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-[24px]">Espace admin</h1>
        <LogoutButton />
      </div>
      <p className="text-[14.5px] text-ink-soft">
        Gestion des projets, membres et annonces : à venir.
      </p>
    </div>
  );
}
