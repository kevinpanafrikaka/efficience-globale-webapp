-- Migration 002 — Supprime la colonne `montant` de `projets` (plus utilisée par l'application).
-- À appliquer APRÈS le déploiement du code qui ne la référence plus (commit f3203ae ou suivant),
-- sinon la création/modification de projets échoue tant que l'ancien code tourne.
-- À exécuter avec : wrangler d1 execute efficience-globale-db --remote --file=migrations/002_drop_montant.sql
-- Non rejouable : la seconde exécution échoue simplement (« no such column »), sans effet.

ALTER TABLE projets DROP COLUMN montant;
