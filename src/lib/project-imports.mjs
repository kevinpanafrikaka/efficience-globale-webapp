import { validateAdminContent } from "./admin-input.mjs";

// Internal server-side boundary for a future, authenticated source adapter.
// This module exposes no HTTP endpoint and makes no network requests.
export class ProjectImportError extends Error {
  constructor(code, message) { super(message); this.name = "ProjectImportError"; this.code = code; }
}

function identity(source, record) {
  if (typeof source !== "string" || !/^[a-z0-9][a-z0-9_-]{0,79}$/.test(source)) throw new ProjectImportError("invalid_source", "Source d’import invalide.");
  if (!record || typeof record !== "object" || Array.isArray(record)) throw new ProjectImportError("invalid_record", "Projet source invalide.");
  if (typeof record.externalId !== "string" || !record.externalId.trim() || record.externalId.length > 200 || /[\x00-\x1f\x7f]/.test(record.externalId)) throw new ProjectImportError("invalid_identity", "L’identifiant du projet source est requis.");
  if (typeof record.status !== "string" || !record.status) throw new ProjectImportError("invalid_status", "Le statut du projet source est requis.");
  return { source, externalId: record.externalId };
}

function normalizedDate(value) {
  if (typeof value !== "string" || value.length > 40 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) throw new ProjectImportError("invalid_version", "La date de modification du projet source doit être horodatée.");
  const date = new Date(value);
  const calendarDate = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || Number.isNaN(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== value.slice(0, 10)) throw new ProjectImportError("invalid_version", "Date de modification invalide.");
  return date.toISOString();
}

function projectData(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ProjectImportError("invalid_project", "Les informations publiques du projet sont requises.");
  try {
    // Publication, IDs, slugs, local timestamps and unknown source fields are
    // never copied. Only this allowlist crosses into the public-content model.
    const data = validateAdminContent("projets", {
      titre: value.titre, secteur: value.secteur, client: value.client,
      periode: value.periode, resume: value.resume, description: value.description,
      resultats: value.resultats, photo_url: value.photo_url, statut: "brouillon",
    });
    return {
      titre: data.titre, secteur: data.secteur, client: data.client,
      periode: data.periode, resume: data.resume, description: data.description,
      resultats: data.resultats, photo_url: data.photo_url,
    };
  } catch {
    throw new ProjectImportError("invalid_project", "Les informations publiques du projet sont invalides ou incomplètes.");
  }
}

async function digest(text) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

function findImport(db, source, externalId) {
  return db.prepare("SELECT * FROM project_imports WHERE source = ? AND external_id = ?").bind(source, externalId).first();
}

export async function importCompletedProject(env, source, record) {
  const { externalId } = identity(source, record);
  // The source adapter must map its real completion status to this exact value.
  if (record.status !== "completed") return { outcome: "ignored", reason: "not_completed" };
  const updatedAt = normalizedDate(record.updatedAt);
  const data = projectData(record.project);
  const snapshot = JSON.stringify(data), hash = await digest(snapshot);
  const db = env.DB;
  const previous = await findImport(db, source, externalId);
  if (previous && !previous.project_id) return { outcome: "ignored", reason: "locally_deleted" };
  if (previous && previous.source_updated_at > updatedAt) return { outcome: "ignored", reason: "older_version", projectId: previous.project_id };
  if (previous && previous.source_updated_at === updatedAt && previous.snapshot_hash !== hash) throw new ProjectImportError("version_conflict", "Deux contenus différents portent la même version source.");

  const projectId = `import-${await digest(JSON.stringify([source, externalId]))}`;
  if (!previous && await db.prepare("SELECT id FROM projets WHERE id = ? OR slug = ?").bind(projectId, projectId).first()) {
    // Never adopt a manually created project just because an identifier matches.
    const concurrent = await findImport(db, source, externalId);
    if (!concurrent) throw new ProjectImportError("identity_conflict", "L’identifiant d’import est déjà utilisé.");
  }
  const now = new Date().toISOString();
  // D1 batch is atomic. Replays/concurrent imports cannot create a second draft.
  const results = await db.batch([
    db.prepare(`INSERT INTO projets (id,slug,titre,secteur,client,periode,resume,description,resultats,photo_url,statut,ordre_affichage)
      SELECT ?,?,?,?,?,?,?,?,?,?,'brouillon',0
      WHERE NOT EXISTS (SELECT 1 FROM project_imports WHERE source = ? AND external_id = ?)
        AND NOT EXISTS (SELECT 1 FROM projets WHERE id = ?)`)
      .bind(projectId, projectId, data.titre, data.secteur, data.client, data.periode, data.resume, data.description, JSON.stringify(data.resultats), data.photo_url, source, externalId, projectId),
    db.prepare(`INSERT INTO project_imports (source,external_id,project_id,source_updated_at,snapshot_json,snapshot_hash,applied_hash,first_imported_at,last_seen_at)
      SELECT ?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM projets WHERE id = ?)
      ON CONFLICT(source,external_id) DO UPDATE SET
        source_updated_at = excluded.source_updated_at, snapshot_json = excluded.snapshot_json,
        snapshot_hash = excluded.snapshot_hash, last_seen_at = excluded.last_seen_at,
        pending_update = CASE WHEN project_imports.applied_hash = excluded.snapshot_hash THEN 0 ELSE 1 END
      WHERE project_imports.project_id IS NOT NULL AND
        (excluded.source_updated_at > project_imports.source_updated_at OR
        (excluded.source_updated_at = project_imports.source_updated_at AND excluded.snapshot_hash = project_imports.snapshot_hash))`)
      .bind(source, externalId, projectId, updatedAt, snapshot, hash, hash, now, now, projectId),
  ]);
  const saved = await findImport(db, source, externalId);
  if (!saved) throw new ProjectImportError("storage_error", "L’import du projet n’a pas pu être confirmé.");
  if (!saved.project_id) return { outcome: "ignored", reason: "locally_deleted" };
  if (saved.source_updated_at > updatedAt) return { outcome: "ignored", reason: "older_version", projectId: saved.project_id };
  if (saved.snapshot_hash !== hash) throw new ProjectImportError("version_conflict", "Deux contenus différents portent la même version source.");
  return { outcome: results[0].meta.changes ? "created" : saved.pending_update ? "update_pending" : "unchanged", projectId: saved.project_id };
}
