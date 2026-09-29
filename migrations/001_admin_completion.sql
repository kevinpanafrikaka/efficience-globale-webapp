-- Migration 001 — Partenaires, messages de contact, réglages du site, anti-bruteforce login
-- À exécuter avec : wrangler d1 execute efficience-globale-db --remote --file=migrations/001_admin_completion.sql
-- Idempotente : peut être relancée sans risque.

CREATE TABLE IF NOT EXISTS partenaires (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  logo_url TEXT,
  site_web TEXT,
  ordre_affichage INTEGER DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'brouillon',  -- brouillon | publie
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
  envoye INTEGER NOT NULL DEFAULT 0,          -- 1 si la notification email a bien été envoyée
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

-- Partenaires existants (jusque-là codés en dur dans les pages)
INSERT OR IGNORE INTO partenaires (id, nom, logo_url, ordre_affichage, statut) VALUES
  ('gavi', 'Gavi', '/img/partners/gavi-logo.png', 0, 'publie'),
  ('unicef', 'UNICEF', '/img/partners/unicef-logo.png', 1, 'publie'),
  ('expertise-france', 'Expertise France', '/img/partners/expertise-france-logo.png', 2, 'publie'),
  ('banque-mondiale', 'Banque Mondiale', '/img/partners/world-bank-logo.png', 3, 'publie'),
  ('institut-francais-de-guinee', 'Institut Français de Guinée', '/img/partners/institut-francais-logo-v2.png', 4, 'publie'),
  ('universite-kofi-annan', 'Université Kofi Annan', '/img/partners/kofi-annan-logo.png', 5, 'publie'),
  ('aguipel', 'AGUIPEL', NULL, 6, 'publie'),
  ('ministere-de-la-sante', 'Ministère de la Santé', '/img/partners/ministere-sante-logo.png', 7, 'publie');

-- Réglages par défaut (valeurs actuellement affichées sur le site)
INSERT OR IGNORE INTO reglages (cle, valeur) VALUES
  ('email', 'oumar.camara@efficienceglobale.com'),
  ('telephone', '+224 626 852 951'),
  ('adresse', 'Camayenne, Conakry, Guinée'),
  ('email_destinataire', 'kevinkandet05@gmail.com'),
  ('facebook', ''),
  ('x', ''),
  ('linkedin', ''),
  ('stats_equipe', '[{"nombre":8,"label":"Consultants expérimentés, un par région administrative"},{"nombre":4,"label":"Analystes dédiés au suivi-évaluation et à la donnée"},{"nombre":2,"label":"Profils digital & data — informaticienne et data scientist"},{"nombre":1,"label":"Assistante administrative et financière"}]');
