CREATE TABLE IF NOT EXISTS candidatures (
  id TEXT PRIMARY KEY, request_id TEXT NOT NULL UNIQUE,
  annonce_id TEXT REFERENCES annonces(id) ON DELETE SET NULL, offre_titre TEXT NOT NULL,
  nom TEXT NOT NULL, email TEXT NOT NULL, telephone TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '',
  cv_key TEXT NOT NULL, lettre_key TEXT NOT NULL DEFAULT '', document_secret TEXT NOT NULL, octets INTEGER NOT NULL,
  cree_le TEXT NOT NULL, expire_le TEXT NOT NULL, documents_supprimes INTEGER NOT NULL DEFAULT 0,
  upload_statut TEXT NOT NULL DEFAULT 'pending', email_statut TEXT NOT NULL DEFAULT 'pending',
  email_lock_le TEXT, email_envoye_le TEXT, statut TEXT NOT NULL DEFAULT 'nouvelle',
  UNIQUE(annonce_id,email)
 );

CREATE INDEX IF NOT EXISTS idx_candidatures_expiration ON candidatures(documents_supprimes,expire_le);

CREATE TABLE IF NOT EXISTS candidature_limits (cle TEXT PRIMARY KEY, compteur INTEGER NOT NULL, heure INTEGER NOT NULL);
