import { getCloudflareContext } from "@opennextjs/cloudflare";
import { configured, isGmailConnected, GMAIL_OWNER } from "@/lib/gmail.mjs";
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
    ? { provider: "Brevo", status: "configured", sender: env.BREVO_SENDER_EMAIL }
    : await isGmailConnected(env)
      ? { provider: "Gmail", status: "registered", sender: GMAIL_OWNER }
      : env.RESEND_API_KEY
        ? { provider: "Resend", status: "configured" }
        : { provider: "Gmail", status: configured(env) ? "disconnected" : "unconfigured", sender: GMAIL_OWNER };

  return (
    <ReglagesForm reglages={reglages} notification={notification} />
  );
}
