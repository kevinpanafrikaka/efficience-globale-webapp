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
  montant TEXT,
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
