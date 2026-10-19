const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const RECIPIENT = "oumar.camara@efficienceglobale.com";

// Activation uniquement lorsque la clé ET l'expéditeur vérifié sont renseignés.
export function isBrevoConfigured(env) {
  return Boolean(env.BREVO_API_KEY?.trim() && EMAIL_RE.test(env.BREVO_SENDER_EMAIL?.trim() || ""));
}

export async function sendBrevo(env, { nom, email, sujet, message }) {
  if (!isBrevoConfigured(env)) throw new Error("Brevo configuration incomplete");
  if (!EMAIL_RE.test(email)) throw new Error("Invalid reply address");

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY.trim(),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      sender: { name: "Site Efficience Globale", email: env.BREVO_SENDER_EMAIL.trim() },
      to: [{ email: RECIPIENT, name: "M. Oumar Camara" }],
      replyTo: { email, name: nom },
      subject: sujet ? `Nouveau message : ${sujet}` : "Nouveau message depuis le site",
      textContent: `De : ${nom} (${email})\n\n${message}`,
      tags: ["formulaire-contact"],
    }),
  });

  // Ne pas exposer la réponse du prestataire (ni la clé) dans les journaux.
  if (!response.ok) throw new Error(`Brevo request rejected (${response.status})`);
  const result = await response.json();
  if (typeof result.messageId !== "string" || !result.messageId.trim()) {
    throw new Error("Brevo did not acknowledge the message");
  }
  return result.messageId;
}
