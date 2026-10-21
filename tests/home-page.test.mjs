import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { adminRuntime } from "./helpers/admin-runtime.mjs";

async function homeRuntime() {
  const runtime = await adminRuntime();
  // Link shared client components before loading the async page graph.
  await runtime.module("src/components/PublicImage.jsx");
  await runtime.module("src/components/HeroImage.jsx");
  await runtime.module("src/components/PartnerCard.jsx");
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
    assert.match(html, /Experts mobilisés/);
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
