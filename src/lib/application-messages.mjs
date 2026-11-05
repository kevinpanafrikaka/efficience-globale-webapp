// A notification references a dossier without copying its private documents.
export const APPLICATION_MESSAGE_SCHEMA = `CREATE TABLE IF NOT EXISTS message_applications (
 message_id TEXT PRIMARY KEY REFERENCES messages(id) ON DELETE CASCADE,
 candidature_id TEXT NOT NULL UNIQUE
)`;
export const applicationMessageId = id => `candidature-${id}`;
