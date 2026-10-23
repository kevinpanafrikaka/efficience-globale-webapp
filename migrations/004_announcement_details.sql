CREATE TABLE IF NOT EXISTS annonce_details (
  annonce_id TEXT PRIMARY KEY REFERENCES annonces(id) ON DELETE CASCADE,
  categorie TEXT NOT NULL DEFAULT 'vie',
  resume TEXT NOT NULL DEFAULT '',
  lieu TEXT NOT NULL DEFAULT '',
  echeance TEXT NOT NULL DEFAULT '',
  action_url TEXT NOT NULL DEFAULT '',
  action_label TEXT NOT NULL DEFAULT ''
);
