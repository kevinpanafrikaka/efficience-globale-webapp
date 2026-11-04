// Lazy, idempotent schema creation also supports existing D1 installations.
export async function ensureMessageReplies(env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS message_replies (
    id TEXT PRIMARY KEY, message_id TEXT NOT NULL, recipient TEXT NOT NULL,
    subject TEXT NOT NULL, body TEXT NOT NULL, reply_to TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', gmail_id TEXT,
    cree_le TEXT NOT NULL DEFAULT (datetime('now'))
  )`).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_message_replies_message ON message_replies(message_id, cree_le)").run();
}

export async function getMessageReplies(env, id) {
  await ensureMessageReplies(env);
  const { results } = await env.DB.prepare("SELECT id, recipient, subject, body, reply_to, status, cree_le FROM message_replies WHERE message_id = ? ORDER BY cree_le, rowid").bind(id).all();
  return results;
}
