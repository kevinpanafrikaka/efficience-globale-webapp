-- Schéma D1 — Efficience Globale
-- À exécuter avec : wrangler d1 execute efficience-globale-db --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  cree_le TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projets (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  titre TEXT NOT NULL,
  titre_accent TEXT,              -- sous-chaîne de titre à afficher en italique (hero détail), optionnel
  secteur TEXT NOT NULL,          -- sante | ia | education | gouvernance | local
  client TEXT,
  periode TEXT,
  resume TEXT,
  description TEXT,
  resultats TEXT,                 -- JSON: tableau de chaînes
  photo_url TEXT,
  statut TEXT NOT NULL DEFAULT 'brouillon',  -- brouillon | publie
  ordre_affichage INTEGER DEFAULT 0,
  cree_le TEXT NOT NULL DEFAULT (datetime('now')),
  maj_le TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS membres (
  id TEXT PRIMARY KEY,
  expertises TEXT NOT NULL DEFAULT '',
  nom TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  photo_url TEXT,
  ordre_affichage INTEGER DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'brouillon',  -- brouillon | publie
  cree_le TEXT NOT NULL DEFAULT (datetime('now')),
  maj_le TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS annonces (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  titre TEXT NOT NULL,
  texte TEXT NOT NULL,
  image_url TEXT,
  date TEXT NOT NULL DEFAULT (datetime('now')),
  statut TEXT NOT NULL DEFAULT 'brouillon',  -- brouillon | publie
  cree_le TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projets_statut ON projets(statut);
CREATE INDEX IF NOT EXISTS idx_projets_secteur ON projets(secteur);
CREATE INDEX IF NOT EXISTS idx_membres_statut ON membres(statut);
CREATE INDEX IF NOT EXISTS idx_annonces_statut ON annonces(statut);

-- Ajouts de la migration 001 (voir migrations/001_admin_completion.sql pour l'application sur une base existante)
CREATE TABLE IF NOT EXISTS partenaires (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  logo_url TEXT,
  site_web TEXT,
  ordre_affichage INTEGER DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'brouillon',
  cree_le TEXT NOT NULL DEFAULT (datetime('now')),
  maj_le TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  sujet TEXT,
  message TEXT NOT NULL,
  lu INTEGER NOT NULL DEFAULT 0,
  envoye INTEGER NOT NULL DEFAULT 0,
  cree_le TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reglages (
  cle TEXT PRIMARY KEY,
  valeur TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS tentatives_login (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  cree_le TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_partenaires_statut ON partenaires(statut);
CREATE INDEX IF NOT EXISTS idx_messages_lu ON messages(lu);
CREATE INDEX IF NOT EXISTS idx_tentatives_ip ON tentatives_login(ip, cree_le);

-- Informations éditoriales des annonces.
CREATE TABLE IF NOT EXISTS annonce_details (
  annonce_id TEXT PRIMARY KEY REFERENCES annonces(id) ON DELETE CASCADE,
  categorie TEXT NOT NULL DEFAULT 'vie',
  resume TEXT NOT NULL DEFAULT '',
  lieu TEXT NOT NULL DEFAULT '',
  echeance TEXT NOT NULL DEFAULT '',
  action_url TEXT NOT NULL DEFAULT '',
  action_label TEXT NOT NULL DEFAULT ''
);

-- Galerie ordonnée des annonces.
CREATE TABLE IF NOT EXISTS annonce_photos (
  annonce_id TEXT NOT NULL REFERENCES annonces(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  url TEXT NOT NULL,
  legende TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (annonce_id, position)
);

-- Candidatures et conservation temporaire des documents
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
