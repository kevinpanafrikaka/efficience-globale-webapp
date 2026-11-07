-- Inactive foundation: apply only when the source connector is ready.
-- Retain source identity after a local deletion so a sync cannot recreate it.
CREATE TABLE IF NOT EXISTS project_imports (
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  project_id TEXT UNIQUE REFERENCES projets(id) ON DELETE SET NULL,
  source_updated_at TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  snapshot_hash TEXT NOT NULL,
  applied_hash TEXT NOT NULL,
  pending_update INTEGER NOT NULL DEFAULT 0 CHECK (pending_update IN (0, 1)),
  first_imported_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  PRIMARY KEY (source, external_id)
);
