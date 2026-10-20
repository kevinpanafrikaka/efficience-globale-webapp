import test from "node:test";
import assert from "node:assert/strict";
import { adminRuntime } from "./helpers/admin-runtime.mjs";
import { validateAdminContent } from "../src/lib/admin-input.mjs";

const base = "https://example.org";
const request = (path, method, body) => new Request(base + path, { method, headers: { "Content-Type": "application/json", origin: base }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
const fixtures = {
  projets: { titre: "Projet de test", secteur: "ia", resultats: ["Un résultat"], photo_url: "/uploads/test.png", ordre_affichage: 0 },
  membres: { nom: "Membre de test", role: "Consultant", expertises: "IA, Formation", photo_url: "/uploads/test.png" },
  annonces: { titre: "Annonce de test", texte: "Une annonce complète", date: "2026-10-20", image_url: "/uploads/test.png" },
  partenaires: { nom: "Partenaire de test", logo_url: "/uploads/test.png", site_web: "https://example.org" },
};

for (const [kind, fixture] of Object.entries(fixtures)) {
  test(`${kind}: create draft, publish, read public data, update, delete, then return 404`, async () => {
    const runtime = await adminRuntime();
    try {
      const collection = await runtime.module(`src/app/api/admin/${kind}/route.js`);
      const item = await runtime.module(`src/app/api/admin/${kind}/[id]/route.js`);
      const db = await runtime.module("src/lib/db.js");
      const getters = { projets: "getProjets", membres: "getMembres", annonces: "getAnnonces", partenaires: "getPartenaires" };
      const response = await collection.POST(request(`/api/admin/${kind}`, "POST", fixture));
      assert.equal(response.status, 200);
      const { id } = await response.json();
      const params = { params: Promise.resolve({ id }) };
      assert.equal((await db[getters[kind]]()).length, 0);
      assert.equal((await item.PUT(request("/edit", "PUT", { ...fixture, statut: "publie" }), params)).status, 200);
      const published = await db[getters[kind]]();
      assert.equal(published.length, 1);
      assert.equal(published[0].id, id);
      const updated = { ...fixture, statut: "publie", ...(fixture.titre ? { titre: "Titre modifié" } : { nom: "Nom modifié" }) };
      assert.equal((await item.PUT(request("/edit", "PUT", updated), params)).status, 200);
      assert.equal((await item.DELETE(request("/delete", "DELETE"), params)).status, 200);
      assert.equal((await db[getters[kind]]()).length, 0);
      assert.equal((await item.PUT(request("/edit", "PUT", updated), params)).status, 404);
      assert.equal((await item.DELETE(request("/delete", "DELETE"), params)).status, 404);
    } finally { runtime.close(); }
  });
}

test("All admin mutations reject anonymous requests before touching the database or storage", async () => {
  const runtime = await adminRuntime({ authenticated: false });
  try {
    const paths = [
      ...Object.keys(fixtures).flatMap(kind => [[`${kind}/route.js`, "POST"], [`${kind}/[id]/route.js`, "PUT"], [`${kind}/[id]/route.js`, "DELETE"]]),
      ["messages/[id]/route.js", "PUT"], ["messages/[id]/route.js", "DELETE"], ["medias/route.js", "DELETE"], ["upload/route.js", "POST"], ["reorder/route.js", "POST"], ["reglages/route.js", "PUT"],
    ];
    for (const [path, method] of paths) {
      const route = await runtime.module(`src/app/api/admin/${path}`);
      assert.equal((await route[method](request("/admin-action", method, {}), { params: Promise.resolve({ id: "test" }) })).status, 401, `${method} ${path}`);
    }
    assert.equal(runtime.reads, 0);
    assert.equal(runtime.files.size, 0);
  } finally { runtime.close(); }
});

test("Validation rejects blank required text, invalid dates, statuses, URLs and malformed JSON", async () => {
  for (const [kind, data] of [
    ["annonces", { ...fixtures.annonces, titre: "   " }],
    ["annonces", { ...fixtures.annonces, date: "2026-02-31" }],
    ["projets", { ...fixtures.projets, secteur: "inconnu" }],
    ["projets", { ...fixtures.projets, resultats: "wrong" }],
    ["membres", { ...fixtures.membres, statut: "inconnu" }],
    ["membres", { ...fixtures.membres, ordre_affichage: -1 }],
    ["partenaires", { ...fixtures.partenaires, site_web: "javascript:alert(1)" }],
    ["annonces", { ...fixtures.annonces, image_url: "data:image/svg+xml,x" }],
  ]) assert.throws(() => validateAdminContent(kind, data));
  const runtime = await adminRuntime();
  try {
    const route = await runtime.module("src/app/api/admin/annonces/route.js");
    for (const value of [null, [], { ...fixtures.annonces, date: "invalid" }]) assert.equal((await route.POST(request("/create", "POST", value))).status, 400);
    assert.equal((await route.POST(new Request(base + "/create", { method: "POST", body: "{" }))).status, 400);
    assert.equal(runtime.sqlite.prepare("SELECT COUNT(*) n FROM annonces").get().n, 0);
  } finally { runtime.close(); }
});

test("Image upload, in-use protection and deletion work against simulated R2", async () => {
  const runtime = await adminRuntime();
  try {
    const upload = await runtime.module("src/app/api/admin/upload/route.js");
    const media = await runtime.module("src/app/api/admin/medias/route.js");
    const form = new FormData(); form.set("file", new File([new Uint8Array([137,80,78,71])], "test.png", { type: "image/png" }));
    const response = await upload.POST(new Request(base + "/upload", { method: "POST", body: form }));
    assert.equal(response.status, 200);
    const { url } = await response.json();
    const key = url.split("/").at(-1);
    assert.equal(runtime.files.size, 1);
    runtime.sqlite.prepare("INSERT INTO annonces (id,slug,titre,texte,image_url) VALUES (?,?,?,?,?)").run("test", "test", "Test", "Texte", url);
    assert.equal((await media.DELETE(request("/media", "DELETE", { key }))).status, 409);
    runtime.sqlite.prepare("DELETE FROM annonces").run();
    assert.equal((await media.DELETE(request("/media", "DELETE", { key }))).status, 200);
    assert.equal(runtime.files.size, 0);
    runtime.sqlite.exec("DROP TABLE annonces");
    assert.equal((await media.DELETE(request("/media", "DELETE", { key }))).status, 503);
    const bad = new FormData(); bad.set("file", new File(["text"], "test.svg", { type: "image/svg+xml" }));
    assert.equal((await upload.POST(new Request(base + "/upload", { method: "POST", body: bad }))).status, 400);
  } finally { runtime.close(); }
});

test("Message status accepts booleans and reordering persists without losing entries", async () => {
  const runtime = await adminRuntime();
  try {
    const db = await runtime.module("src/lib/db.js");
    const id = await db.createMessage({ nom: "Test", email: "test@example.org", message: "Texte" });
    const route = await runtime.module("src/app/api/admin/messages/[id]/route.js");
    const params = { params: Promise.resolve({ id }) };
    assert.equal((await route.PUT(request("/read", "PUT", { lu: "false" }), params)).status, 400);
    assert.equal((await route.PUT(request("/read", "PUT", { lu: true }), params)).status, 200);
    assert.equal((await db.getMessageById(id)).lu, 1);
    for (const nom of ["Premier", "Deuxième", "Troisième"]) await db.createMembre({ nom });
    const members = await db.getAllMembres();
    await db.moveItem("membres", members[2].id, members[0].id);
    const ordered = await db.getAllMembres();
    assert.equal(ordered.length, 3);
    assert.equal(ordered[0].id, members[2].id);
    assert.deepEqual(Array.from(ordered, m => m.ordre_affichage), [0,1,2]);
    assert.deepEqual(Array.from(db.parseStatsEquipe({ stats_equipe: "[]" })), []);
  } finally { runtime.close(); }
});

test("Saving visible settings preserves team figures and the legacy notification recipient", async () => {
  const runtime = await adminRuntime();
  try {
    const db = await runtime.module("src/lib/db.js");
    const stats = JSON.stringify([{ nombre: 8, label: "Consultants" }]);
    await db.saveReglages({ stats_equipe: stats, email_destinataire: "fallback@example.org" });
    const route = await runtime.module("src/app/api/admin/reglages/route.js");
    const fields = { email: "contact@example.org", telephone: "+224 123", adresse: "Conakry", facebook: "", x: "", linkedin: "https://example.org" };
    assert.equal((await route.PUT(request("/settings", "PUT", fields))).status, 200);
    const saved = await db.getReglages();
    assert.equal(saved.email, fields.email);
    assert.equal(saved.linkedin, fields.linkedin);
    assert.equal(saved.stats_equipe, stats);
    assert.equal(saved.email_destinataire, "fallback@example.org");
    assert.equal((await route.PUT(request("/settings", "PUT", { ...fields, email: "invalid" }))).status, 400);
  } finally { runtime.close(); }
});
