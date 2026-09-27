import { getCloudflareContext } from "@opennextjs/cloudflare";

const DEST_EMAIL = "oumar.camara@efficienceglobale.com";

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  const apiKey = env.RESEND_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "Service d'envoi non configuré." }, { status: 500 });
  }

  const data = await request.formData();
  const nom = data.get("nom")?.toString().trim();
  const email = data.get("email")?.toString().trim();
  const sujet = data.get("sujet")?.toString().trim();
  const message = data.get("message")?.toString().trim();

  if (!nom || !email || !message) {
    return Response.json({ error: "Merci de renseigner votre nom, votre email et un message." }, { status: 400 });
  }

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
      to: DEST_EMAIL,
      reply_to: email,
      subject: sujet ? `Nouveau message : ${sujet}` : "Nouveau message depuis le site",
      text: `De : ${nom} (${email})\n\n${message}`,
    }),
  });

  if (!resendRes.ok) {
    const errBody = await resendRes.text();
    // DIAGNOSTIC TEMPORAIRE — expose le détail Resend pour déboguer le 502 en prod.
    // À retirer une fois l'envoi confirmé fonctionnel.
    return Response.json(
      { error: "L'envoi a échoué. Réessayez ou écrivez directement par email.", debug: { status: resendRes.status, body: errBody } },
      { status: 502 }
    );
  }

  return Response.json({ success: true });
}
