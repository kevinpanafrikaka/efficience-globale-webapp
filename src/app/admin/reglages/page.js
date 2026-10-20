import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isGmailConnected, GMAIL_OWNER, GMAIL_RECIPIENT } from "@/lib/gmail.mjs";
import { isBrevoConfigured } from "@/lib/brevo.mjs";
import { adminPageAllowed } from "@/lib/admin-page";
import { getReglages } from "@/lib/db";
import ReglagesForm from "@/components/admin/ReglagesForm";

export const dynamic = "force-dynamic";

export default async function AdminReglagesPage() {
  if (!(await adminPageAllowed())) return null;
  const reglages = await getReglages();
  const { env } = await getCloudflareContext({ async: true });
  const notification = isBrevoConfigured(env)
    ? { provider: "Brevo", recipient: GMAIL_RECIPIENT, sender: env.BREVO_SENDER_EMAIL }
    : await isGmailConnected(env)
      ? { provider: "Gmail connecté", recipient: GMAIL_RECIPIENT, sender: GMAIL_OWNER }
      : { provider: env.RESEND_API_KEY ? "Resend" : "Non configurées", recipient: reglages.email_destinataire };

  return (
    <div>
      <h1 className="text-[24px] mb-2">Réglages du site</h1>
      <p className="text-[14px] text-ink-soft mb-6">
        Coordonnées et réseaux sociaux affichés sur le site public.
      </p>
      <ReglagesForm reglages={reglages} notification={notification} />
    </div>
  );
}
