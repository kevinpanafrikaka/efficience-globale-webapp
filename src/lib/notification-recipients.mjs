export const DEFAULT_NOTIFICATION_RECIPIENTS = ["oumar.camara@efficienceglobale.com"];
const EMAIL_RE = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;

export function validateNotificationRecipients(value) {
  const list = typeof value === "string" ? value.split(/[\n,;]+/) : value;
  if (!Array.isArray(list) || list.length > 30 || list.some(email => typeof email !== "string")) throw new Error("Liste de destinataires invalide.");
  const recipients = [...new Set(list.map(email => email.trim().toLowerCase()).filter(Boolean))];
  if (!recipients.length || recipients.length > 10) throw new Error("Renseignez entre 1 et 10 adresses de notification.");
  if (recipients.some(email => email.length > 254 || !EMAIL_RE.test(email))) throw new Error("Une adresse de notification est invalide.");
  return recipients;
}

export function notificationRecipients(reglages) {
  if (!reglages?.email_notifications) return [...DEFAULT_NOTIFICATION_RECIPIENTS];
  return validateNotificationRecipients(JSON.parse(reglages.email_notifications));
}

export async function readNotificationRecipients(env) {
  let row;
  try { row = await env.DB.prepare("SELECT valeur FROM reglages WHERE cle = ?").bind("email_notifications").first(); }
  catch { return [...DEFAULT_NOTIFICATION_RECIPIENTS]; }
  return notificationRecipients({ email_notifications: row?.valeur });
}
