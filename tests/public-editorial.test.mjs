import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { adminRuntime } from "./helpers/admin-runtime.mjs";

const routes = ["a-propos", "domaines", "services", "equipe", "realisations", "partenaires", "annonces", "contact"];
async function runtimeForPages() {
  const runtime = await adminRuntime();
  for (const file of ["PublicImage.jsx", "HeroImage.jsx", "PublicEditorial.jsx", "PageHero.jsx", "ProjectCard.jsx", "RealisationsGrid.jsx", "PartnerDirectoryCard.jsx", "TeamGallery.jsx", "ContactForm.jsx"]) await runtime.module(`src/components/${file}`);
  return runtime;
}
async function renderPage(runtime, route, props = {}) {
  const { default: Page } = await runtime.module(`src/app/(public)/${route}/page.js`);
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve({}), ...props }));
}
function assertStructure(html) {
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(html, /[↗↘→←↓↑]/);
  assert.doesNotMatch(html, /eg-hero-label/);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size, "IDs must be unique");
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), `Missing anchor ${target}`);
  for (const [, targets] of html.matchAll(/aria-labelledby="([^"]+)"/g)) for (const target of targets.split(" ")) assert.ok(ids.includes(target), `Missing labelled heading ${target}`);
}

test("Every redesigned public tab renders accessible headings and anchors with empty collections and no arrow glyphs", async () => {
  const runtime = await runtimeForPages();
  try {
    for (const route of routes) {
      const html = await renderPage(runtime, route);
      assertStructure(html);
      assert.match(html, /class="eg-page /);
      assert.ok(html.includes('media="(max-width: 767px)"'), `${route} preserves mobile hero art direction`);
    }
  } finally { runtime.close(); }
});

test("Published projects, partners, member profiles and journal text survive the redesign while drafts remain private", async () => {
  const runtime = await runtimeForPages();
  try {
    runtime.sqlite.prepare("INSERT INTO partenaires (id,nom,site_web,statut) VALUES (?,?,?,?)").run("institution", "Institution terrain", "https://example.org", "publie");
    runtime.sqlite.prepare("INSERT INTO projets (id,slug,titre,client,secteur,resume,description,resultats,statut) VALUES (?,?,?,?,?,?,?,?,?)").run("mission", "mission-terrain", "Mission sur le terrain", "Institution terrain", "sante", "Résumé réel", "Présentation réelle", '["Résultat réel"]', "publie");
    runtime.sqlite.prepare("INSERT INTO projets (id,slug,titre,client,secteur,resume,statut) VALUES (?,?,?,?,?,?,?)").run("accord", "accord-cadre", "Accord public", "Institution terrain", "partenariat", "Résumé de l’accord", "publie");
    runtime.sqlite.prepare("INSERT INTO membres (id,nom,role,bio,statut) VALUES (?,?,?,?,?)").run("oumar", "Oumar Camara", "Directeur général", "Parcours enregistré", "publie");
    for (const statut of ["publie", "brouillon"]) runtime.sqlite.prepare("INSERT INTO annonces (id,slug,titre,texte,image_url,date,statut) VALUES (?,?,?,?,?,?,?)").run(statut, statut, statut === "publie" ? "Nouvelle du terrain" : "ANNONCE PRIVEE", statut === "publie" ? "Texte complet de l’annonce\nDeuxième paragraphe conservé" : "Texte privé", statut === "publie" ? "/img/hero-annonces.jpg" : null, "2026-10-21", statut);
    for (const route of routes) assertStructure(await renderPage(runtime, route));
    const domains = await renderPage(runtime, "domaines");
    assert.match(domains, /href="\/realisations\/mission-terrain"/);
    const partners = await renderPage(runtime, "partenaires");
    assert.match(partners, /href="\/realisations\?partenaire=institution#projets"/);
    assert.match(partners, /href="\/realisations\/accord-cadre"/);
    assert.match(partners, /https:\/\/example.org/);
    const filtered = await renderPage(runtime, "realisations", { searchParams: Promise.resolve({ partenaire: "institution" }) });
    assert.match(filtered, /Mission sur le terrain/);
    const about = await renderPage(runtime, "a-propos");
    assert.match(about, /Parcours enregistré/);
    const team = await renderPage(runtime, "equipe", { searchParams: Promise.resolve({ membre: "oumar" }) });
    assert.match(team, /Parcours enregistré/);
    const news = await renderPage(runtime, "annonces");
    assert.match(news, /Deuxième paragraphe conservé/);
    assert.doesNotMatch(news, /ANNONCE PRIVEE|Texte privé/);
    const detail = await renderPage(runtime, "realisations/[slug]", { params: Promise.resolve({ slug: "mission-terrain" }) });
    assertStructure(detail);
    assert.match(detail, /Présentation réelle/);
    assert.match(detail, /Résultat réel/);
    assert.match(detail, /href="\/contact"/);
  } finally { runtime.close(); }
});

test("Contact keeps required fields and submission affordance; service and profile controls stay usable without icons", async () => {
  const runtime = await runtimeForPages();
  try {
    const contact = await renderPage(runtime, "contact");
    for (const field of ["nom", "email", "message"]) {
      const tag = contact.match(new RegExp(`<(?:input|textarea)[^>]*name="${field}"[^>]*>`))?.[0];
      assert.ok(tag?.includes('required=""'), `${field} remains required`);
    }
    assert.match(contact, /type="submit"[^>]*>Envoyer mon message/);
    const services = await renderPage(runtime, "services");
    assert.match(services, /href="#accompagnement-ia"/);
    assert.match(services, /href="\/contact" class="eg-button eg-button--primary">Discutons de vos besoins/);
    runtime.sqlite.prepare("INSERT INTO membres (id,nom,statut) VALUES (?,?,?)").run("a", "Premier membre", "publie");
    runtime.sqlite.prepare("INSERT INTO membres (id,nom,statut) VALUES (?,?,?)").run("b", "Second membre", "publie");
    const team = await renderPage(runtime, "equipe");
    assert.match(team, /class="team-counter tabular-nums" aria-label="Membre 1 sur 2">01 \/ 02<\/span>/);
    assert.match(team, /aria-label="Membre précédent">Précédent/);
    assert.match(team, /aria-label="Membre suivant">Suivant/);
    assert.match(team, /Mettre en pause le défilement automatique/);
  } finally { runtime.close(); }
});
