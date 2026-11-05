import { getMailDelivery, ensureMailDelivery } from "@/lib/mail-delivery.mjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { getMessageById, setMessageLu } from "@/lib/db";
import { getMessageReplies, ensureMessageReplies } from "@/lib/message-replies.mjs";
import { isGmailConnected, GMAIL_OWNER } from "@/lib/gmail.mjs";
import { readNotificationRecipients } from "@/lib/notification-recipients.mjs";

async function context(request, mutate = false) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) return { error: Response.json({ error: "Non autorisé." }, { status: 401 }) };
  if (mutate && request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) return { error: Response.json({ error: "Origine refusée." }, { status: 403 }) };
  return { env };
}

export async function GET(request, { params }) {
  const { env, error } = await context(request);
  if (error) return error;
  const { id } = await params;
  if (!(await getMessageById(id))) return Response.json({ error: "Message introuvable." }, { status: 404 });
  try {
    const replies = await getMessageReplies(env, id);
    const connected = await isGmailConnected(env);
    const replyTo = await readNotificationRecipients(env);
    return Response.json({ replies, connected, sender: GMAIL_OWNER, replyTo, delivery: await getMailDelivery(env,id) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Le chargement du message a échoué." }, { status: 503 });
  }
}

export async function PUT(request, { params }) {
  const { error } = await context(request, true);
  if (error) return error;
  const { id } = await params;
  let data;
  try { data = await request.json(); } catch { return Response.json({ error: "Demande JSON invalide." }, { status: 400 }); }
  if (typeof data?.lu !== "boolean") return Response.json({ error: "Le statut lu doit être vrai ou faux." }, { status: 400 });
  if (!(await getMessageById(id))) return Response.json({ error: "Message introuvable." }, { status: 404 });
  await setMessageLu(id, data.lu);
  return Response.json({ success: true });
}

export async function DELETE(request, { params }) {
  const { env, error } = await context(request, true);
  if (error) return error;
  const { id } = await params;
  if (!(await getMessageById(id))) return Response.json({ error: "Message introuvable." }, { status: 404 });
  await ensureMessageReplies(env);
  await ensureMailDelivery(env);
  // One atomic conditional delete closes the race with the send claim.
  const results = await env.DB.batch([
    env.DB.prepare("DELETE FROM messages WHERE id = ? AND NOT EXISTS (SELECT 1 FROM message_replies WHERE message_id = ? AND status = 'pending' AND cree_le > datetime('now', '-2 minutes'))").bind(id, id),
    env.DB.prepare("DELETE FROM message_replies WHERE message_id = ? AND NOT EXISTS (SELECT 1 FROM messages WHERE id = ?)").bind(id, id),
    env.DB.prepare("DELETE FROM message_topics WHERE message_id = ? AND NOT EXISTS (SELECT 1 FROM messages WHERE id = ?)").bind(id, id),
    env.DB.prepare("DELETE FROM message_applications WHERE message_id = ? AND NOT EXISTS (SELECT 1 FROM messages WHERE id = ?)").bind(id, id),
  ]);
  await env.DB.prepare("DELETE FROM message_delivery WHERE message_id=? AND NOT EXISTS (SELECT 1 FROM messages WHERE id=?)").bind(id,id).run();
  if (!results[0].meta.changes) return Response.json({ error: "Un envoi est encore en cours. Réessayez dans quelques instants." }, { status: 409 });
  return Response.json({ success: true });
}
