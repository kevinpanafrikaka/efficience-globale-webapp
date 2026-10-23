-- Informations propres à chaque type d’annonce, sans modifier les textes existants.
CREATE TABLE IF NOT EXISTS annonce_informations (
 annonce_id TEXT PRIMARY KEY REFERENCES annonces(id) ON DELETE CASCADE,
 donnees_json TEXT NOT NULL
);
