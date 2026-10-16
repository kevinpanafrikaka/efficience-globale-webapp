-- À appliquer une fois sur une base existante (après vérification de PRAGMA table_info(membres)).
ALTER TABLE membres ADD COLUMN expertises TEXT NOT NULL DEFAULT '';
