-- Documents demandés par offre et pièces réellement reçues par candidature.
-- Les offres et candidatures existantes gardent leurs réglages antérieurs.
CREATE TABLE IF NOT EXISTS annonce_dossiers (
 annonce_id TEXT PRIMARY KEY REFERENCES annonces(id) ON DELETE CASCADE,
 documents_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS candidature_dossiers (
 candidature_id TEXT PRIMARY KEY REFERENCES candidatures(id) ON DELETE CASCADE,
 documents_json TEXT NOT NULL
);
