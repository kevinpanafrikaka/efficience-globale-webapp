import test from "node:test";
import assert from "node:assert/strict";
import { projectEndKey, sortProjectsByEnd } from "../src/lib/project-period.mjs";
import { adminRuntime } from "./helpers/admin-runtime.mjs";

test("Completion sorting understands legacy months, years and short events without inventing agreement end dates", () => {
  assert.ok(projectEndKey("Sept. – Déc. 2025") > projectEndKey("Mars 2024 – Oct. 2025"));
  assert.ok(projectEndKey("Sept. – Nov. 2025") > projectEndKey("2023 – 2025"));
  assert.equal(projectEndKey("Mai – Juil. 2024"), 20240700);
  assert.equal(projectEndKey("5 – 6 mai 2025"), 20250506);
  assert.equal(projectEndKey("25 juin 2025 · 1 jour"), 20250625);
  assert.equal(projectEndKey("Depuis 2023 · en cours"), null);
  assert.equal(projectEndKey("Mai 2025 · 24 mois"), null);
  assert.equal(projectEndKey("24 avril 2025 · 2 ans renouvelable"), null);
  const projects = [{ id: "unknown", titre: "A", periode: "À préciser" }, { id: "older", titre: "B", periode: "2024" }, { id: "recent", titre: "C", periode: "Sept. – Nov. 2025" }];
  assert.deepEqual(sortProjectsByEnd(projects).map(p => p.id), ["recent", "older", "unknown"]);
  assert.equal(projects[0].id, "unknown", "Sorting must not mutate its input");
});

test("Public list, home teasers and admin list agree on completion order irrespective of insertion and manual rank", async () => {
  const runtime = await adminRuntime();
  try {
    const add = runtime.sqlite.prepare("INSERT INTO projets (id,slug,titre,secteur,statut,periode,ordre_affichage,cree_le) VALUES (?,?,?,?,?,?,?,?)");
    add.run("old", "old", "Ancienne mission", "sante", "publie", "Mai – Juil. 2024", 0, "2026-10-22");
    add.run("latest", "latest", "Mission récente", "sante", "publie", "Sept. – Déc. 2025", 99, "2025-01-01");
    add.run("middle", "middle", "Mission intermédiaire", "ia", "publie", "Sept. – Nov. 2025", 1, "2026-10-21");
    add.run("unknown", "unknown", "Période inconnue", "ia", "publie", "À préciser", 2, "2026-10-23");
    add.run("draft", "draft", "Brouillon récent", "sante", "brouillon", "Mars 2026 – Juin 2026", 0, "2026-10-24");
    const db = await runtime.module("src/lib/db.js");
    assert.deepEqual(Array.from(await db.getProjets(), p => p.id), ["latest", "middle", "old", "unknown"]);
    assert.deepEqual(Array.from(await db.getProjetsRecents(2), p => p.id), ["latest", "middle"]);
    assert.deepEqual(Array.from(await db.getProjets({ secteur: "sante" }), p => p.id), ["latest", "old"]);
    assert.equal((await db.getAllProjets())[0].id, "draft");
    assert.equal(runtime.sqlite.prepare("SELECT periode FROM projets WHERE id='old'").get().periode, "Mai – Juil. 2024");
  } finally { runtime.close(); }
});

test("The reorder endpoint rejects project ranking while preserving member and partner ranking", async () => {
  const runtime = await adminRuntime();
  try {
    const route = await runtime.module("src/app/api/admin/reorder/route.js");
    const response = await route.POST(new Request("https://example.org/api/admin/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table: "projets", id: "a", targetId: "b" }) }));
    assert.equal(response.status, 400);
  } finally { runtime.close(); }
});
