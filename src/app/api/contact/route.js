import { recordMailDelivery } from "@/lib/mail-delivery.mjs";
import { validateMessageTopic } from "@/lib/message-topics.mjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createMessage, markMessageSent, getReglages } from "@/lib/db";

import { isGmailConnected, sendGmail } from "@/lib/gmail.mjs";
import { isBrevoConfigured, sendBrevo } from "@/lib/brevo.mjs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { nom: 120, email: 200, sujet: 200, message: 5000 };

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });

  const data = await request.formData();

  // Champ piège : un robot le remplit. On répond « succès » sans rien enregistrer.
  if (data.get("site_web")?.toString().trim()) {
    return Response.json({ success: true });
  }

  const nom = data.get("nom")?.toString().trim();
  const email = data.get("email")?.toString().trim();
  const sujet = data.get("sujet")?.toString().trim();
  const message = data.get("message")?.toString().trim();

  if (!nom || !email || !message) {
    return Response.json({ error: "Merci de renseigner votre nom, votre email et un message." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  if (
    nom.length > MAX.nom ||
    email.length > MAX.email ||
    (sujet && sujet.length > MAX.sujet) ||
    message.length > MAX.message
  ) {
    return Response.json({ error: "Un des champs est trop long." }, { status: 400 });
  }

  let type_demande;
  try { type_demande = validateMessageTopic(data.get("type_demande")?.toString().trim()); }
  catch { return Response.json({ error: "Type de demande invalide." }, { status: 400 }); }

  if (!type_demande) {
    return Response.json({ error: "Choisissez un type d’accompagnement." }, { status: 400 });
  }

  // 1. On enregistre d'abord : le message n'est jamais perdu, même si l'email échoue.
  let id;
  try {
    id = await createMessage({ nom, email, sujet, message, type_demande });
  } catch {
    return Response.json({ error: "Impossible d'enregistrer votre message. Réessayez plus tard." }, { status: 500 });
  }

  // Brevo prend le relais quand la clé et l'expéditeur sont configurés.
  // Un échec du prestataire choisi laisse le message enregistré, sans bascule
  // vers un autre destinataire et sans risque de double envoi.
  let provider="none",accepted=false;
  try {
    if (isBrevoConfigured(env)) {
      provider="brevo";
      await sendBrevo(env, { nom, email, sujet, message });
      accepted=true;
      await recordMailDelivery(env,id,provider,{sent:true});
      await markMessageSent(id);
    } else if (await isGmailConnected(env)) {
      provider="gmail";
      const receipt = await sendGmail(env, { nom, email, sujet, message });
      accepted=true;
      await recordMailDelivery(env,id,provider,{sent:true,receipt});
      await markMessageSent(id);
    } else {
      const apiKey = env.RESEND_API_KEY;
      if (apiKey) {
        provider="resend";
        {
          const { email_destinataire } = await getReglages();
          const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              // Adresse de test Resend, valable sans domaine vérifié. À remplacer par
              // "Site Efficience Globale <contact@efficienceglobale.com>" une fois le
              // domaine efficienceglobale.com acquis et vérifié dans Resend.
              from: "Site Efficience Globale <onboarding@resend.dev>",
              to: email_destinataire,
              reply_to: email,
              subject: sujet ? `Nouveau message : ${sujet}` : "Nouveau message depuis le site",
              text: `De : ${nom} (${email})\n\n${message}`,
            }),
          });
          if (!resendRes.ok) throw Object.assign(new Error("Resend rejected the email"),{mailStage:"sending",httpStatus:resendRes.status});
          accepted=true;
          await recordMailDelivery(env,id,provider,{sent:true});
          await markMessageSent(id);
        }
      } else await recordMailDelivery(env,id,provider,{code:"no_provider"});
    }
  } catch(error) {
    if(!accepted) await recordMailDelivery(env,id,provider,{error});
  }

  return Response.json({ success: true });
}
