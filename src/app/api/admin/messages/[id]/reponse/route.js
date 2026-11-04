import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { getMessageById, setMessageLu } from "@/lib/db";
import { ensureMessageReplies } from "@/lib/message-replies.mjs";
import { isGmailConnected, sendGmailReply } from "@/lib/gmail.mjs";
import { readNotificationRecipients, validateNotificationRecipients } from "@/lib/notification-recipients.mjs";

export async function POST(request, { params }) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) return Response.json({ error: "Non autorisé." }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Origine refusée." }, { status: 403 });
  if (Number(request.headers.get("content-length")) > 100000) return Response.json({ error: "Réponse trop longue." }, { status: 413 });
  let data;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error();
    let size = 0, raw = "";
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 100000) { await reader.cancel(); return Response.json({ error: "Réponse trop longue." }, { status: 413 }); }
      raw += decoder.decode(value, { stream: true });
    }
    data = JSON.parse(raw + decoder.decode());
  } catch { return Response.json({ error: "Demande JSON invalide." }, { status: 400 }); }
  if (!data || typeof data.subject !== "string" || !data.subject.trim() || data.subject.length > 200 || /[\r\n]/.test(data.subject) || typeof data.text !== "string" || !data.text.trim() || data.text.length > 20000 || !/^[a-f0-9-]{36}$/i.test(data.requestId || "")) return Response.json({ error: "Vérifiez l’objet et le contenu de votre réponse." }, { status: 400 });
  const { id } = await params;
  const original = await getMessageById(id);
  if (!original) return Response.json({ error: "Message introuvable." }, { status: 404 });
  let replyTo;
  try {
    validateNotificationRecipients([original.email]);
    if (!(await isGmailConnected(env))) return Response.json({ error: "Connectez le compte Gmail dans Réglages avant de répondre." }, { status: 409 });
    replyTo = await readNotificationRecipients(env);
    await ensureMessageReplies(env);
  } catch { return Response.json({ error: "La réponse ne peut pas être préparée. Vérifiez les réglages Gmail." }, { status: 503 }); }
  const subject = data.subject.trim(), text = data.text.trim();
  // Claim before sending: a repeated request never sends the same reply twice.
  const claim = await env.DB.prepare("INSERT OR IGNORE INTO message_replies (id, message_id, recipient, subject, body, reply_to) SELECT ?, ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM messages WHERE id = ?)").bind(data.requestId, id, original.email, subject, text, JSON.stringify(replyTo), id).run();
  if (!claim.meta.changes) {
    const saved = await env.DB.prepare("SELECT message_id, subject, body, status FROM message_replies WHERE id = ?").bind(data.requestId).first();
    if (saved?.message_id === id && saved.subject === subject && saved.body === text && saved.status === "sent") return Response.json({ success: true });
    return Response.json({ error: "Cet envoi est déjà en cours ou non confirmé. Vérifiez Gmail avant de renvoyer.", uncertain: true }, { status: 409 });
  }
  try {
    const gmailId = await sendGmailReply(env, { recipient: original.email, subject, text, replyTo });
    await env.DB.prepare("UPDATE message_replies SET status = 'sent', gmail_id = ? WHERE id = ?").bind(gmailId, data.requestId).run();
  } catch {
    // A timeout may happen after delivery. Never automatically retry an uncertain send.
    await env.DB.prepare("UPDATE message_replies SET status = 'uncertain' WHERE id = ?").bind(data.requestId).run();
    return Response.json({ error: "Envoi non confirmé. Vérifiez les messages envoyés dans Gmail avant de renvoyer.", uncertain: true }, { status: 502 });
  }
  try { await setMessageLu(id, true); } catch { /* Delivery was confirmed; do not report a failed send. */ }
  return Response.json({ success: true });
}
