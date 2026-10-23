import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { adminRuntime } from "./helpers/admin-runtime.mjs";

function seed(runtime) {
  const project = runtime.sqlite.prepare("INSERT INTO projets (id,slug,titre,secteur,statut,cree_le) VALUES (?,?,?,?,?,?)");
  for (let i = 0; i < 7; i++) project.run(`project-${i}`, `project-${i}`, `Projet ${i}`, "sante", "publie", `2026-10-${10 + i} 12:00:00`);
  project.run("project-draft", "project-draft", "Projet à finaliser", "ia", "brouillon", "2026-10-21 14:00:00");
  runtime.sqlite.prepare("INSERT INTO membres (id,nom,statut,cree_le) VALUES (?,?,?,?)").run("member", "Profil public", "publie", "2026-10-18 09:00:00");
  runtime.sqlite.prepare("INSERT INTO membres (id,nom,statut,cree_le) VALUES (?,?,?,?)").run("member-draft", "Profil à finaliser", "brouillon", "2026-10-21 13:00:00");
  runtime.sqlite.prepare("INSERT INTO partenaires (id,nom,statut,cree_le) VALUES (?,?,?,?)").run("partner", "Institution publique", "publie", "2026-10-19 08:00:00");
  runtime.sqlite.prepare("INSERT INTO partenaires (id,nom,statut,cree_le) VALUES (?,?,?,?)").run("partner-draft", "Partenaire à finaliser", "brouillon", "2026-10-21 12:00:00");
  runtime.sqlite.prepare("INSERT INTO annonces (id,slug,titre,texte,statut,date,cree_le) VALUES (?,?,?,?,?,?,?)").run("news", "news", "Annonce publique", "Texte", "publie", "2026-10-01", "2026-10-20 16:00:00");
  runtime.sqlite.prepare("INSERT INTO annonces (id,slug,titre,texte,statut,cree_le) VALUES (?,?,?,?,?,?)").run("news-draft", "news-draft", "Annonce à finaliser", "Texte", "brouillon", "2026-10-21 15:00:00");
  for (let i = 0; i < 6; i++) runtime.sqlite.prepare("INSERT INTO messages (id,nom,email,sujet,message,lu,cree_le) VALUES (?,?,?,?,?,?,?)").run(`message-${i}`, `Visiteur ${i}`, "test@example.org", `Sujet ${i}`, "Message", i < 2 ? 0 : 1, `2026-10-${10 + i} 10:00:00`);
}

test("Dashboard counts, recent publications and draft tasks use the actual four content sources and stable dates", async () => {
  const runtime = await adminRuntime();
  try {
    seed(runtime);
    const db = await runtime.module("src/lib/db.js");
    const s = await db.getDashboardStats();
    assert.equal(s.projets.publies, 7);
    assert.equal(s.projets.brouillons, 1);
    assert.equal(s.membres.publies, 1);
    assert.equal(s.annonces.publies, 1);
    assert.equal(s.partenaires.publies, 1);
    assert.equal(s.messagesNonLus, 2);
    assert.equal(s.derniersMessages.length, 5);
    assert.equal(s.derniersMessages[0].id, "message-5");
    assert.equal(s.dernieresPublications.length, 6);
    assert.equal(s.dernieresPublications[0].id, "news");
    assert.equal(s.dernieresPublications[0].date, "2026-10-20 16:00:00", "Use creation date, not a misleading announcement publication date");
    assert.equal(new Set(s.dernieresPublications.map((item) => item.type)).size, 4);
    assert.ok(s.dernieresPublications.every((item) => !item.id.endsWith("-draft")));
    assert.equal(s.derniersBrouillons.length, 4);
    assert.equal(s.derniersBrouillons[0].id, "news-draft");
    assert.equal(runtime.sqlite.prepare("SELECT COUNT(*) n FROM messages WHERE lu=0").get().n, 2, "Reading the dashboard must never mark messages read");
  } finally { runtime.close(); }
});

test("Dashboard links lead directly to each task and publication, preserve all creation options and keep private messages read-only", async () => {
  const runtime = await adminRuntime();
  try {
    seed(runtime);
    const page = await runtime.module("src/app/admin/page.js");
    const content = await page.default();
    const html = renderToStaticMarkup(content);
    const { default: Shell } = await runtime.module("src/components/admin/AdminShell.jsx");
    const full = renderToStaticMarkup(createElement(Shell, { unread: 2 }, content));
    const topbar = full.match(/<header class="admin-topbar is-dashboard">([\s\S]*?)<\/header>/)?.[1];
    assert.ok(topbar);
    assert.equal((full.match(/<h1\b/g) || []).length, 1);
    assert.match(topbar, /Tableau de bord/);
    assert.doesNotMatch(topbar, /Vos contenus, vos échanges/);
    assert.match(topbar, /Créer un contenu/);
    assert.doesNotMatch(html, /<h1|Créer un contenu/);
    assert.match(html, /À traiter/);
    assert.match(html, /2 messages à lire/i);
    for (const [type, id] of [["projets", "project-draft"], ["membres", "member-draft"], ["annonces", "news-draft"], ["partenaires", "partner-draft"]]) {
      assert.ok(html.includes(`href="/admin/${type}/${id}/modifier"`));
      assert.ok(full.includes(`href="/admin/${type}/nouveau"`));
    }
    const publications = html.split('id="dashboard-publications-title"')[1];
    assert.match(publications, /href="\/admin\/annonces\/news\/modifier"/);
    assert.doesNotMatch(publications, /à finaliser/);
    assert.doesNotMatch(html, /[↗↘→←↓↑]/);
    assert.match(topbar, /aria-controls="dashboard-create-options"/);
    assert.match(topbar, /id="dashboard-create-options"[^>]*hidden/);
    assert.equal(runtime.sqlite.prepare("SELECT COUNT(*) n FROM messages WHERE lu=0").get().n, 2);
  } finally { runtime.close(); }
});

test("Dashboard empty and unavailable states do not invent activity or claim unavailable messages are read", async () => {
  const runtime = await adminRuntime();
  try {
    const page = await runtime.module("src/app/admin/page.js");
    let html = renderToStaticMarkup(await page.default());
    assert.match(html, /Aucun brouillon en attente/);
    assert.match(html, /Aucun message reçu/);
    assert.match(html, /Aucune publication en ligne/);
    runtime.sqlite.exec("DROP TABLE partenaires; DROP TABLE messages;");
    const db = await runtime.module("src/lib/db.js");
    const s = await db.getDashboardStats();
    assert.equal(s.partenaires, null);
    assert.equal(s.messagesNonLus, null);
    assert.equal(s.dernieresPublications.length, 0);
    html = renderToStaticMarkup(await page.default());
    assert.match(html, /Messages indisponibles/);
    assert.doesNotMatch(html, /aucun message non lu ni brouillon à finaliser/);
  } finally { runtime.close(); }
});

test("All draft totals remain accurate when the priority preview is limited to four items", async () => {
  const runtime = await adminRuntime();
  try {
    for (let i = 0; i < 8; i++) runtime.sqlite.prepare("INSERT INTO annonces (id,slug,titre,texte,statut,cree_le) VALUES (?,?,?,?,?,?)").run(`a${i}`, `a${i}`, `Brouillon ${i}`, "Texte", "brouillon", `2026-10-${10 + i} 10:00:00`);
    const db = await runtime.module("src/lib/db.js");
    const s = await db.getDashboardStats();
    assert.equal(s.annonces.brouillons, 8);
    assert.equal(s.derniersBrouillons.length, 4);
    const page = await runtime.module("src/app/admin/page.js");
    const html = renderToStaticMarkup(await page.default());
    assert.match(html, /8<\/strong> contenus à finaliser/);
    assert.match(html, /aria-label="Retrouver tous les brouillons"/);
    assert.match(html, /href="\/admin\/annonces"/);
    assert.match(html, /Brouillon 7/);
    assert.doesNotMatch(html, /Brouillon 0/);
  } finally { runtime.close(); }
});
