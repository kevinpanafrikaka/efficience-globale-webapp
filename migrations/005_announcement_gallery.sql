CREATE TABLE IF NOT EXISTS annonce_photos (
  annonce_id TEXT NOT NULL REFERENCES annonces(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  url TEXT NOT NULL,
  legende TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (annonce_id, position)
);
