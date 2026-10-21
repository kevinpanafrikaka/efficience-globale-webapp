import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { adminRuntime } from "./helpers/admin-runtime.mjs";

async function homeRuntime() {
  const runtime = await adminRuntime();
  // Link shared client components before loading the async page graph.
  await runtime.module("src/components/PublicImage.jsx");
  await runtime.module("src/components/HeroImage.jsx");
  await runtime.module("src/components/HomePartnerCard.jsx");
  await runtime.module("src/components/HomeTeamRail.jsx");
  return runtime;
}

test("Homepage uses published content, real project links and settings, and finds Oumar regardless of member order", async () => {
  const runtime = await homeRuntime();
  try {
    const project = runtime.sqlite.prepare("INSERT INTO projets (id,slug,titre,secteur,resume,photo_url,statut,cree_le) VALUES (?,?,?,?,?,?,?,?)");
    for (let i = 0; i < 5; i++) project.run(`p${i}`, `projet-${i}`, `Mission publique ${i}`, "sante", "Résumé enregistré", "/img/hero-services.jpg", i === 4 ? "brouillon" : "publie", `2026-10-${10+i} 12:00:00`);
    runtime.sqlite.prepare("INSERT INTO membres (id,nom,role,photo_url,ordre_affichage,statut) VALUES (?,?,?,?,?,?)").run("m1", "Premier profil", "Consultant", "/img/hero-services.jpg", 0, "publie");
    runtime.sqlite.prepare("INSERT INTO membres (id,nom,role,photo_url,ordre_affichage,statut) VALUES (?,?,?,?,?,?)").run("m2", "Oumar Camara", "Directeur général", "/img/logo-eg.png", 1, "publie");
    runtime.sqlite.prepare("INSERT INTO partenaires (id,nom,statut) VALUES (?,?,?)").run("partner", "Institution publiée", "publie");
    runtime.sqlite.prepare("INSERT INTO partenaires (id,nom,statut) VALUES (?,?,?)").run("draft", "Institution privée", "brouillon");
    runtime.sqlite.prepare("UPDATE projets SET client=? WHERE id=?").run("Institution publiée", "p0");
    for (let i = 2; i <= 9; i++) runtime.sqlite.prepare("INSERT INTO partenaires (id,nom,statut) VALUES (?,?,?)").run(`partner-${i}`, `Institution ${i}`, "publie");
    runtime.sqlite.prepare("INSERT INTO membres (id,nom,statut) VALUES (?,?,?)").run("aminata", "Aminata Sylla", "publie");
    runtime.sqlite.prepare("INSERT INTO membres (id,nom,statut) VALUES (?,?,?)").run("private", "Profil privé", "brouillon");
    const db = await runtime.module("src/lib/db.js");
    await db.saveReglages({ telephone: "+224 621 000 000", stats_equipe: JSON.stringify([{ nombre: 12, label: "Experts mobilisés" }]) });
    const { default: Home } = await runtime.module("src/app/(public)/page.js");
    const html = renderToStaticMarkup(await Home());
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, /href="tel:\+224621000000"/);
    for (let i = 0; i < 4; i++) assert.ok(html.includes(`href="/realisations/projet-${i}"`));
    assert.doesNotMatch(html, /Mission publique 4|Institution privée/);
    assert.match(html, /Institution publiée/);
    assert.match(html, /home-team-caption[^>]*><strong>Oumar Camara/);
    assert.doesNotMatch(html, /Experts mobilisés|Profil privé/);
    assert.match(html, /href="\/equipe\?membre=m1"/);
    assert.match(html, /href="\/equipe\?membre=m2"/);
    assert.match(html, /href="\/equipe\?membre=aminata"/);
    assert.match(html, /home-team-count[^>]*><strong>3<\/strong>/);
    assert.match(html, /href="\/realisations\?partenaire=partner#projets"/);
    assert.match(html, /Institution 9/);
    assert.equal((html.match(/class="home-partner-tile"/g) || []).length, 9);
    for (const key of ["sante", "education", "local", "ia"]) assert.ok(html.includes(`href="/domaines#${key}"`));
    assert.ok(html.includes('srcSet="/img/hero-conakry-mobile.webp"'));
  } finally { runtime.close(); }
});

test("Homepage keeps useful destinations when collections and optional phone are empty", async () => {
  const runtime = await homeRuntime();
  try {
    const db = await runtime.module("src/lib/db.js");
    await db.saveReglages({ telephone: "", stats_equipe: "[]" });
    const { default: Home } = await runtime.module("src/app/(public)/page.js");
    const html = renderToStaticMarkup(await Home());
    assert.match(html, /home-project-empty/);
    assert.doesNotMatch(html, /home-partners-grid|home-team-caption|href="tel:/);
    assert.match(html, /href="\/contact"/);
    assert.match(html, /href="\/services"/);
    assert.match(html, /href="\/equipe"/);
    assert.doesNotMatch(html, /undefined|NaN/);
  } finally { runtime.close(); }
});


test("Member deep links select the published profile and safely fall back for a missing or draft member", async () => {
  const runtime = await homeRuntime();
  try {
    const insert = runtime.sqlite.prepare("INSERT INTO membres (id,nom,role,statut,ordre_affichage) VALUES (?,?,?,?,?)");
    insert.run("first", "Premier membre", "Consultant", "publie", 0);
    insert.run("kevin", "Kevin Kandet Bomboh Bangoura", "Stagiaire", "publie", 1);
    insert.run("private", "Profil confidentiel", "Consultant", "brouillon", 2);
    const { default: Page } = await runtime.module("src/app/(public)/equipe/page.js");
    for (const [id, expected] of [["kevin", "Kevin Kandet Bomboh Bangoura"], ["absent", "Premier membre"], ["private", "Premier membre"]]) {
      const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ membre: id }) }));
      const biography = html.slice(html.indexOf('id="team-biography"'));
      assert.ok(biography.includes(`<h2>${expected}</h2>`));
      assert.doesNotMatch(html, /Profil confidentiel/);
    }
  } finally { runtime.close(); }
});
