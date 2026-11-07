import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFile } from "node:fs/promises";
import { importCompletedProject } from "../src/lib/project-imports.mjs";

async function runtime({ failBatchAt = -1 } = {}) {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(await readFile(new URL("../schema.sql", import.meta.url), "utf8"));
  const migration = await readFile(new URL("../migrations/009_project_imports.sql", import.meta.url), "utf8");
  sqlite.exec(migration); sqlite.exec(migration); // Safe to reapply.
  const DB = {
    prepare(sql) {
      let args = [];
      const stmt = { bind(...values) { args = values; return stmt; }, async first() { return sqlite.prepare(sql).get(...args) || null; },
        runSync() { return { meta: { changes: Number(sqlite.prepare(sql).run(...args).changes) } }; } };
      return stmt;
    },
    async batch(statements) {
      sqlite.exec("BEGIN IMMEDIATE");
      try {
        const rows = statements.map((stmt, i) => { if (i === failBatchAt) throw Error("simulated write failure"); return stmt.runSync(); });
        sqlite.exec("COMMIT"); return rows;
      } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
  };
  return { env: { DB }, sqlite, close() { sqlite.close(); } };
}
const record = overrides => ({ externalId: "source-42", status: "completed", updatedAt: "2026-11-07T10:00:00Z", project: { titre: "Projet de formation", secteur: "education", resume: "Résumé initial", resultats: ["20 professionnels formés"] }, ...overrides });

test("Completed projects become private drafts; replays and concurrent imports produce only one source link and project", async () => {
  const r = await runtime();
  try {
    const results = await Promise.all(Array.from({ length: 4 }, () => importCompletedProject(r.env, "gestion", record())));
    assert.equal(new Set(results.map(x => x.projectId)).size, 1);
    assert.equal(results.filter(x => x.outcome === "created").length, 1);
    assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM projets").get().n, 1);
    assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM project_imports").get().n, 1);
    assert.equal(r.sqlite.prepare("SELECT statut FROM projets").get().statut, "brouillon");
    assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM projets WHERE statut='publie'").get().n, 0);
    assert.equal((await importCompletedProject(r.env, "gestion", record())).outcome, "unchanged");
  } finally { r.close(); }
});

test("Only explicitly completed projects with valid public fields and version timestamps are accepted", async () => {
  const r = await runtime();
  try {
    assert.equal((await importCompletedProject(r.env, "gestion", record({status:"en_cours"}))).reason, "not_completed");
    for (const [source, value] of [["bad/source",record()], ["gestion",record({externalId:""})], ["gestion",record({updatedAt:"2026-11-07"})], ["gestion",record({updatedAt:"2026-02-30T10:00:00Z"})], ["gestion",record({project:{titre:"",secteur:"ia"}})], ["gestion",record({project:{titre:"Test",secteur:"inconnu"}})], ["gestion",record({project:{titre:"Test",secteur:"ia",photo_url:"javascript:alert(1)"}})]]) await assert.rejects(importCompletedProject(r.env,source,value));
    assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM projets").get().n,0);
    assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM project_imports").get().n,0);
  } finally { r.close(); }
});

test("Incoming publication flags and private unknown fields never cross the import boundary", async () => {
  const r = await runtime();
  try {
    const data=record();data.project={...data.project,statut:"publie",id:"manual",slug:"manual",note_interne:"CONFIDENTIEL",budget_interne:12000};
    const {projectId}=await importCompletedProject(r.env,"gestion",data);
    assert.notEqual(projectId,"manual");
    assert.equal(r.sqlite.prepare("SELECT statut FROM projets").get().statut,"brouillon");
    const saved=r.sqlite.prepare("SELECT snapshot_json FROM project_imports").get().snapshot_json;
    assert.doesNotMatch(saved,/CONFIDENTIEL|budget_interne|statut|slug/);
  } finally { r.close(); }
});

test("New source versions are staged without overwriting local edits or publication; old versions and conflicts are refused", async () => {
  const r = await runtime();
  try {
    const {projectId}=await importCompletedProject(r.env,"gestion",record());
    r.sqlite.prepare("UPDATE projets SET titre='Titre éditorial',resume='Texte du cabinet',statut='publie' WHERE id=?").run(projectId);
    const newer=record({updatedAt:"2026-11-07T11:00:00Z",project:{...record().project,resume:"Nouvelle source"}});
    assert.equal((await importCompletedProject(r.env,"gestion",newer)).outcome,"update_pending");
    const local=r.sqlite.prepare("SELECT titre,resume,statut FROM projets WHERE id=?").get(projectId);
    assert.deepEqual({...local},{titre:"Titre éditorial",resume:"Texte du cabinet",statut:"publie"});
    assert.equal((await importCompletedProject(r.env,"gestion",record())).reason,"older_version");
    await assert.rejects(importCompletedProject(r.env,"gestion",{...newer,project:{...newer.project,resume:"Version contradictoire"}}),{code:"version_conflict"});
    const saved=r.sqlite.prepare("SELECT * FROM project_imports").get();
    assert.equal(JSON.parse(saved.snapshot_json).resume,"Nouvelle source");
    assert.equal(saved.pending_update,1);
  } finally { r.close(); }
});

test("Equal titles from independent identities remain distinct and a deleted local draft is not recreated", async () => {
  const r = await runtime();
  try {
    r.sqlite.prepare("INSERT INTO projets(id,slug,titre,secteur) VALUES('manual','manual','Projet de formation','education')").run();
    const a=await importCompletedProject(r.env,"gestion",record());
    const b=await importCompletedProject(r.env,"autre-source",record());
    const c=await importCompletedProject(r.env,"gestion",record({externalId:"source-43"}));
    assert.equal(new Set([a.projectId,b.projectId,c.projectId]).size,3);
    r.sqlite.prepare("DELETE FROM projets WHERE id=?").run(a.projectId);
    assert.equal((await importCompletedProject(r.env,"gestion",record())).reason,"locally_deleted");
    assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM projets").get().n,3);
    assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM project_imports").get().n,3);
  } finally { r.close(); }
});

test("A failure writing source metadata rolls back the project insert", async () => {
  const r = await runtime({failBatchAt:1});
  try {
    await assert.rejects(importCompletedProject(r.env,"gestion",record()),/simulated write failure/);
    assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM projets").get().n,0);
    assert.equal(r.sqlite.prepare("SELECT COUNT(*) n FROM project_imports").get().n,0);
  } finally { r.close(); }
});
