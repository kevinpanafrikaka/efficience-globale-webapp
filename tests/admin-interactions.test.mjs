import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import * as jsx from "react/jsx-runtime";
const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/build/swc");

async function harness(path, props = {}, { fail = false, network = false, respond } = {}) {
  const state = [], requests = [], navigations = [];
  const listeners = new Map();
  let pendingEffects = [];
  let cursor = 0;
  const context = vm.createContext({
    URL, FormData, File,
    fetch: async (url, options) => { requests.push({ url, options }); if (respond) return respond(url, options); if (network) throw Error("offline"); return Response.json(fail ? { error: "Échec de test" } : { success: true }, { status: fail ? 401 : 200 }); },
    window: {
      confirm: () => true, innerHeight: 700,
      addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
      removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
    },
    document: { body: { style: { overflow: "" } },
      addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
      removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
    },
  });
  const imports = {
    "react": {
      useState(initial) { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], value => { state[i] = typeof value === "function" ? value(state[i]) : value; }]; },
      useRef(value) { const i = cursor++; return state[i] ??= { current: value }; },
      useEffect(effect, dependencies) {
        const i = cursor++;
        const previous = state[i];
        if (!previous || dependencies.some((value, index) => value !== previous.dependencies[index])) {
          pendingEffects.push(() => { previous?.cleanup?.(); state[i] = { dependencies, cleanup: effect() }; });
        }
      },
    },
    "react/jsx-runtime": jsx,
    "next/link": { default: function Link() {} },
    "./DashboardIcon": { default: function DashboardIcon() {} },
    "./dashboard-create-menu.css": {},
    "./admin-projects.css": {},
    "./admin-team.css": {},
    "./project-editor.css": {},
    "./member-editor.css": {},
    "./admin-announcements.css": {},
    "./announcement-editor.css": {},
    "./announcements.css": {},
    "./announcement-gallery.css": {},
    "@/components/PublicImage": { default: function PublicImage() {} },
    "@/components/AnnouncementCover": { default: function AnnouncementCover() {} },
    "./AnnouncementCover": { default: function AnnouncementCover() {} },
    "@/components/admin/AdminImage": { default: function AdminImage() {} },
    "@/components/admin/DeleteButton": { default: function DeleteButton() {} },
    "next/navigation": { useRouter: () => ({ push: value => navigations.push(value), refresh() {} }) },
    "@/components/admin/ImageUpload": { default: function ImageUpload() {} },
  };
  const cache = new Map();
  async function load(name) {
    if (imports[name]) return new vm.SyntheticModule(Object.keys(imports[name]), function () { for (const [k,v] of Object.entries(imports[name])) this.setExport(k,v); }, { context });
    const file = name === "./AnnouncementGalleryUpload" ? "src/components/admin/AnnouncementGalleryUpload.jsx" : name === "./EditorDate" ? "src/components/admin/EditorDate.jsx" : name === "./AdminAnnouncementCard" ? "src/components/admin/AdminAnnouncementCard.jsx" : name === "./AnnouncementOptions" ? "src/components/admin/AnnouncementOptions.jsx" : name === "./AnnouncementCard" ? "src/components/AnnouncementCard.jsx" : name === "@/lib/announcements.mjs" ? "src/lib/announcements.mjs" : name === "./useAdminAction" ? "src/components/admin/useAdminAction.js" : name === "./MemberCard" ? "src/components/admin/MemberCard.jsx" : name === "./MemberOptions" ? "src/components/admin/MemberOptions.jsx" : name === "./EditorSelect" ? "src/components/admin/EditorSelect.jsx" : name === "./ProjectPeriodField" ? "src/components/admin/ProjectPeriodField.jsx" : name === "@/lib/project-period.mjs" ? "src/lib/project-period.mjs" : name === "@/lib/member-expertises.mjs" ? "src/lib/member-expertises.mjs" : name;
    if (!cache.has(file)) {
      const source = await readFile(new URL("../" + file, import.meta.url), "utf8");
      const { code } = transformSync(source, { filename: file, jsc: { target: "es2022", parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "es6" } });
      const module = new vm.SourceTextModule(code, { context }); cache.set(file, module); await module.link(load);
    }
    return cache.get(file);
  }
  const module = await load(path); await module.evaluate();
  return { requests, navigations,
    viewport(height, offsetTop) {
      context.window.innerHeight = height;
      context.window.visualViewport = offsetTop === undefined ? undefined : {
        height, offsetTop,
        addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
        removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
      };
    },
    dispatch(type, event) { for (const listener of listeners.get(type) || []) listener(event); },
    render() { cursor = 0; pendingEffects = []; const tree = module.namespace.default(props); for (const effect of pendingEffects) effect(); return tree; },
  };
}

function find(root, predicate) {
  if (!root || typeof root !== "object") return null;
  if (predicate(root)) return root;
  for (const child of [root.props?.children].flat(Infinity)) { const found = find(child, predicate); if (found) return found; }
  return null;
}

test("Every image form waits for upload completion and saves the new image exactly once", async () => {
  for (const [name, key, imageKey, fields] of [
    ["ProjetForm", "projet", "photo_url", { titre: "Test", secteur: "ia", resultats: [] }],
    ["MembreForm", "membre", "photo_url", { nom: "Test" }],
    ["PartenaireForm", "partenaire", "logo_url", { nom: "Test" }],
    ["AnnonceForm", "annonce", "image_url", { titre: "Test", texte: "Contenu", date: "2026-10-20" }],
  ]) {
    const h = await harness(`src/components/admin/${name}.jsx`, { [key]: { id: "test", ...fields, [imageKey]: "/img/old.png" } });
    const upload = find(h.render(), n => n.type?.name === "ImageUpload");
    assert.ok(upload, name);
    upload.props.onUploadingChange(true);
    await h.render().props.onSubmit({ preventDefault() {} });
    assert.equal(h.requests.length, 0, name);
    upload.props.onChange("/uploads/new.png"); upload.props.onUploadingChange(false);
    const form = h.render();
    await Promise.all([form.props.onSubmit({ preventDefault() {} }), form.props.onSubmit({ preventDefault() {} })]);
    assert.equal(h.requests.length, 1, name);
    assert.equal(JSON.parse(h.requests[0].options.body)[imageKey], "/uploads/new.png", name);
    assert.equal(h.navigations.length, 1, name);
  }
});

test("Shared action handling reports session and network failures without reporting success", async () => {
  for (const options of [{ fail: true }, { network: true }]) {
    const h = await harness("src/components/admin/useAdminAction.js", {}, options);
    let successes = 0;
    assert.equal(await h.render().run("/api/admin/action", { method: "DELETE" }, () => successes++), false);
    const result = h.render();
    assert.equal(result.loading, false);
    assert.ok(result.error.includes(options.fail ? "Session expirée" : "Connexion interrompue"));
    assert.equal(successes, 0);
  }
});

test("Shared action handling prevents duplicate mutations while a request is pending", async () => {
  const h = await harness("src/components/admin/useAdminAction.js");
  const action = h.render();
  const values = await Promise.all([action.run("/delete", { method: "DELETE" }), action.run("/delete", { method: "DELETE" })]);
  assert.equal(h.requests.length, 1);
  assert.equal(values.filter(Boolean).length, 1);
  assert.equal(h.render().loading, false);
});


test("Dashboard creation menu opens all destinations and closes with Escape, outside click or destination selection", async () => {
  const h = await harness("src/components/admin/DashboardCreateMenu.jsx");
  const trigger = () => find(h.render(), n => n.type === "button");
  const menu = () => find(h.render(), n => n.type === "nav");
  assert.equal(trigger().props["aria-expanded"], false);
  assert.equal(menu().props.hidden, true);
  trigger().props.onClick();
  assert.equal(menu().props.hidden, false);
  for (const type of ["projets", "annonces", "membres", "partenaires"]) assert.ok(find(h.render(), n => n.props?.href === `/admin/${type}/nouveau`));
  let focused = 0;
  trigger().props.ref.current = { focus() { focused++; } };
  h.dispatch("keydown", { key: "Escape" });
  assert.equal(menu().props.hidden, true);
  assert.equal(focused, 1);
  trigger().props.onClick();
  const inside = {};
  h.render().props.ref.current = { contains(target) { return target === inside; } };
  h.dispatch("pointerdown", { target: inside });
  assert.equal(menu().props.hidden, false);
  h.dispatch("pointerdown", { target: {} });
  assert.equal(menu().props.hidden, true);
  trigger().props.onClick();
  const destination = find(h.render(), n => n.props?.href === "/admin/annonces/nouveau");
  destination.props.onClick();
  assert.equal(menu().props.hidden, true);
});


test("Creation menu adapts to portrait, landscape and scrolling without putting options below the visible screen", async () => {
  const h = await harness("src/components/admin/DashboardCreateMenu.jsx");
  const style = new Map();
  let buttonBottom = 250;
  let root = h.render();
  root.props.ref.current = { contains() { return false; }, style: { setProperty(key, value) { style.set(key, value); } } };
  find(root, n => n.type === "button").props.ref.current = { getBoundingClientRect() { return { bottom: buttonBottom }; } };
  h.viewport(640);
  find(root, n => n.type === "button").props.onClick();
  h.render();
  assert.equal(style.get("--dashboard-menu-room"), "366px");
  h.viewport(360);
  buttonBottom = 190;
  h.dispatch("resize", {});
  assert.equal(style.get("--dashboard-menu-room"), "146px");
  buttonBottom = 140;
  h.dispatch("scroll", {});
  assert.equal(style.get("--dashboard-menu-room"), "196px");
  h.viewport(120);
  h.dispatch("resize", {});
  assert.equal(style.get("--dashboard-menu-room"), "0px");
});

test("Creation menu uses the visible viewport when browser chrome or zoom changes the available height", async () => {
  const h = await harness("src/components/admin/DashboardCreateMenu.jsx");
  const style = new Map();
  const root = h.render();
  root.props.ref.current = { contains() { return false; }, style: { setProperty(key, value) { style.set(key, value); } } };
  find(root, n => n.type === "button").props.ref.current = { getBoundingClientRect() { return { bottom: 200 }; } };
  h.viewport(400, 30);
  find(root, n => n.type === "button").props.onClick();
  h.render();
  assert.equal(style.get("--dashboard-menu-room"), "206px");
  h.viewport(300, 10);
  h.dispatch("resize", {});
  assert.equal(style.get("--dashboard-menu-room"), "86px");
});


test("Projects combine sector and accent-insensitive search, keep all statuses and reset on close", async () => {
  const projets = [
    { id: "a", titre: "Évaluation du PEV", client: "Gavi", secteur: "sante", statut: "publie" },
    { id: "b", titre: "Formation IA", client: "UNICEF", secteur: "ia", statut: "brouillon" },
  ];
  const h = await harness("src/components/admin/AdminProjetsGrid.jsx", { projets, secteurs: { sante: { label: "Santé publique" }, ia: { label: "Intelligence artificielle" } } });
  const card = id => find(h.render(), n => n.type === "article" && n.key === id);
  const field = () => find(h.render(), n => n.props?.id === "project-query");
  assert.ok(card("a")); assert.ok(card("b"));
  find(h.render(), n => n.props?.["aria-controls"] === "projects-search").props.onClick();
  assert.equal(find(h.render(), n => n.props?.id === "projects-search").props.hidden, false);
  assert.equal(find(h.render(), n => n.props?.className === "projects-browse").props.hidden, true);
  const toolbar = find(h.render(), n => n.props?.className === "projects-toolbar");
  assert.ok(find(toolbar, n => n.props?.id === "projects-search"));
  field().props.onChange({ target: { value: "evaluation" } });
  assert.ok(card("a")); assert.equal(card("b"), null);
  field().props.onChange({ target: { value: "UNICEF" } });
  assert.equal(card("a"), null); assert.ok(card("b"));
  find(h.render(), n => n.type === "button" && n.props.children === "Santé publique").props.onClick({ currentTarget: {} });
  assert.equal(card("b"), null);
  field().props.onKeyDown({ key: "Escape" });
  assert.equal(field().props.value, ""); assert.ok(card("a"));
  assert.equal(find(h.render(), n => n.props?.className === "projects-browse").props.hidden, false);
  assert.equal(find(h.render(), n => n.props?.id === "projects-search").props.hidden, true);
});

test("Project editor preserves existing details and synchronizes the preview with edits before saving", async () => {
  const projet = { id: "pev", titre: "Ancien titre", slug: "pev", titre_accent: "titre", secteur: "sante", client: "Gavi", periode: "2024", resume: "Résumé", description: "Description", resultats: ["Un", "Deux"], photo_url: "/uploads/pev.png", statut: "publie", ordre_affichage: 4 };
  const h = await harness("src/components/admin/ProjetForm.jsx", { projet });
  const title = find(h.render(), n => n.type === "input" && n.props?.id === "projetform-1");
  title.props.onChange({ target: { value: "Nouveau titre" } });
  assert.ok(find(h.render(), n => n.type === "h3" && n.props.children === "Nouveau titre"));
  const results = find(h.render(), n => n.type === "textarea" && n.props?.id === "project-result-0");
  results.props.onChange({ target: { value: " Premier résultat " } });
  find(h.render(), n => n.type === "textarea" && n.props?.id === "project-result-1").props.onChange({ target: { value: " Deuxième résultat " } });
  await h.render().props.onSubmit({ preventDefault() {} });
  const request = h.requests[0];
  assert.equal(request.url, "/api/admin/projets/pev"); assert.equal(request.options.method, "PUT");
  const data = JSON.parse(request.options.body);
  assert.equal(data.titre, "Nouveau titre");
  assert.deepEqual(data.resultats, ["Premier résultat", "Deuxième résultat"]);
  for (const key of ["slug", "titre_accent", "secteur", "client", "periode", "resume", "description", "photo_url", "statut"]) assert.equal(data[key], projet[key], key);
});

test("Project editor keeps a failed save on the page and requires an image before creation", async () => {
  const missing = await harness("src/components/admin/ProjetForm.jsx");
  await missing.render().props.onSubmit({ preventDefault() {} });
  assert.equal(missing.requests.length, 0);
  assert.match(find(missing.render(), n => n.props?.role === "alert").props.children, /image est requise/);
  for (const options of [{ fail: true }, { network: true }]) {
    const h = await harness("src/components/admin/ProjetForm.jsx", { projet: { id: "a", titre: "Projet", photo_url: "/uploads/image.png", resultats: [] } }, options);
    await h.render().props.onSubmit({ preventDefault() {} });
    assert.ok(find(h.render(), n => n.props?.role === "alert"));
    assert.equal(h.navigations.length, 0);
    await h.render().props.onSubmit({ preventDefault() {} });
    assert.equal(h.requests.length, 2);
  }
});

test("Member editor keeps stored profile details and updates the shared card preview before saving", async () => {
  const membre = { id: "malick", nom: "Malick Douet", role: "Chief Staff", bio: "Son parcours détaillé", expertises: "Gouvernance, Évaluation", photo_url: "/uploads/malick.png", statut: "publie", ordre_affichage: 7 };
  const h = await harness("src/components/admin/MembreForm.jsx", { membre });
  const input = id => find(h.render(), n => n.props?.id === id && typeof n.props.onChange === "function");
  input("membreform-1").props.onChange({ target: { value: "Malick D. Douet" } });
  input("membreform-2").props.onChange({ target: { value: "Directeur des opérations" } });
  input("membreform-4").props.onChange("brouillon");
  const preview = find(h.render(), n => n.type?.name === "MemberCard");
  assert.equal(preview.props.preview, true);
  assert.equal(preview.props.membre.nom, "Malick D. Douet");
  assert.equal(preview.props.membre.role, "Directeur des opérations");
  assert.equal(preview.props.membre.statut, "brouillon");
  await h.render().props.onSubmit({ preventDefault() {} });
  assert.equal(h.requests[0].url, "/api/admin/membres/malick");
  assert.equal(h.requests[0].options.method, "PUT");
  const data = JSON.parse(h.requests[0].options.body);
  for (const key of ["bio", "expertises", "photo_url"]) assert.equal(data[key], membre[key], key);
  assert.equal("ordre_affichage" in data, false);
  assert.equal(data.nom, "Malick D. Douet"); assert.equal(data.role, "Directeur des opérations"); assert.equal(data.statut, "brouillon");
  assert.deepEqual(h.navigations, ["/admin/membres"]);
});

test("Member creation accepts a draft without a portrait and failed saves preserve inputs for retry", async () => {
  const fresh = await harness("src/components/admin/MembreForm.jsx");
  find(fresh.render(), n => n.type === "input" && n.props?.id === "membreform-1").props.onChange({ target: { value: "Nouveau membre" } });
  await fresh.render().props.onSubmit({ preventDefault() {} });
  assert.equal(fresh.requests[0].url, "/api/admin/membres"); assert.equal(fresh.requests[0].options.method, "POST");
  const created = JSON.parse(fresh.requests[0].options.body);
  assert.equal(created.nom, "Nouveau membre"); assert.equal(created.photo_url, ""); assert.equal(created.statut, "brouillon");
  for (const options of [{ fail: true }, { network: true }]) {
    const h = await harness("src/components/admin/MembreForm.jsx", { membre: { id: "m", nom: "Membre existant", bio: "Parcours conservé", ordre_affichage: 4 } }, options);
    find(h.render(), n => n.type === "input" && n.props?.id === "member-expertise-0").props.onChange({ target: { value: "Formation" } });
    await h.render().props.onSubmit({ preventDefault() {} });
    assert.ok(find(h.render(), n => n.props?.role === "alert"));
    assert.equal(h.navigations.length, 0);
    assert.equal(find(h.render(), n => n.type === "input" && n.props?.id === "member-expertise-0").props.value, "Formation");
    await h.render().props.onSubmit({ preventDefault() {} });
    assert.equal(h.requests.length, 2);
    assert.equal(JSON.parse(h.requests[1].options.body).bio, "Parcours conservé");
  }
});

test("Separate expertise inputs load existing specialties, keep independent edits and save only filled values", async () => {
  const h = await harness("src/components/admin/MembreForm.jsx", { membre: { id: "m", nom: "Membre", expertises: "Gouvernance, Formation, Évaluation", ordre_affichage: 9 } });
  const field = i => find(h.render(), n => n.type === "input" && n.props?.id === `member-expertise-${i}`);
  assert.equal(field(0).props.value, "Gouvernance"); assert.equal(field(1).props.value, "Formation"); assert.equal(field(2).props.value, "Évaluation");
  field(1).props.onChange({ target: { value: " Santé publique " } });
  find(h.render(), n => n.props?.["aria-label"] === "Effacer l’expertise 1").props.onClick();
  assert.equal(field(0).props.value, ""); assert.equal(field(1).props.value, " Santé publique "); assert.equal(field(2).props.value, "Évaluation");
  await h.render().props.onSubmit({ preventDefault() {} });
  const payload = JSON.parse(h.requests[0].options.body);
  assert.equal(payload.expertises, "Santé publique, Évaluation");
  assert.equal("ordre_affichage" in payload, false);
});


test("Custom menus select with native buttons and close on Escape or outside click", async () => {
  let chosen;
  const h = await harness("src/components/admin/EditorSelect.jsx", { id: "sector", value: "sante", options: [{ value: "sante", label: "Santé publique" }, { value: "ia", label: "Intelligence artificielle" }], onChange: v => { chosen = v; } });
  const trigger = () => find(h.render(), n => n.props?.id === "sector");
  trigger().props.onClick();
  assert.equal(trigger().props["aria-expanded"], true);
  find(h.render(), n => n.props?.role === "option" && n.props["aria-selected"] === false).props.onClick();
  assert.equal(chosen, "ia"); assert.equal(trigger().props["aria-expanded"], false);
  trigger().props.onClick(); h.render().props.onKeyDown({ key: "Escape", preventDefault() {} });
  assert.equal(trigger().props["aria-expanded"], false);
  trigger().props.onClick(); h.render(); h.dispatch("pointerdown", { target: {} });
  assert.equal(trigger().props["aria-expanded"], false);
});

test("Organisation selection preserves old names, searches without accents, adds and removes names", async () => {
  const props = { id: "partners", value: ["MSHP"], options: [{ value: "Gavi", label: "Gavi" }, { value: "École", label: "École" }], multiple: true, searchable: true, allowCustom: true, onChange: values => { props.value = values; } };
  const h = await harness("src/components/admin/EditorSelect.jsx", props);
  const open = () => find(h.render(), n => n.props?.id === "partners").props.onClick();
  const search = () => find(h.render(), n => n.type === "input");
  open(); search().props.onChange({ target: { value: "ecole" } });
  const school = find(h.render(), n => n.props?.role === "option");
  school.props.onClick(); assert.deepEqual([...props.value], ["MSHP", "École"]);
  search().props.onChange({ target: { value: "Organisation locale" } });
  find(h.render(), n => n.props?.role === "option").props.onClick();
  assert.ok(props.value.includes("Organisation locale"));
  find(h.render(), n => n.props?.["aria-label"] === "Retirer MSHP").props.onClick();
  assert.equal(props.value.includes("MSHP"), false);
});

test("The project form blocks an incomplete period before any network write", async () => {
  const h = await harness("src/components/admin/ProjetForm.jsx", { projet: { id: "a", titre: "Projet", photo_url: "/uploads/test.png", resultats: [] } });
  const period = find(h.render(), n => n.type?.name === "ProjectPeriodField");
  period.props.onValidityChange("La fin précède le début.");
  await h.render().props.onSubmit({ preventDefault() {} });
  assert.equal(h.requests.length, 0);
  assert.match(find(h.render(), n => n.props?.role === "alert").props.children, /fin précède/);
});


test("Separate result fields retain their contents when adding and removing entries and ignore blank fields when saving", async () => {
  const h = await harness("src/components/admin/ProjetForm.jsx", { projet: { id: "test", titre: "Projet", photo_url: "/uploads/test.png", resultats: ["Premier résultat", "Deuxième résultat"] } });
  const field = id => find(h.render(), n => n.type === "textarea" && n.props?.id === id);
  find(h.render(), n => n.type === "button" && n.props.children === "+ Ajouter un résultat").props.onClick();
  field("project-result-2").props.onChange({ target: { value: " Troisième résultat " } });
  find(h.render(), n => n.props?.["aria-label"] === "Retirer le résultat 1").props.onClick();
  assert.equal(field("project-result-1").props.value, "Deuxième résultat");
  assert.equal(field("project-result-2").props.value, " Troisième résultat ");
  find(h.render(), n => n.type === "button" && n.props.children === "+ Ajouter un résultat").props.onClick();
  assert.equal(field("project-result-3").props.value, "");
  await h.render().props.onSubmit({ preventDefault() {} });
  assert.deepEqual(JSON.parse(h.requests[0].options.body).resultats, ["Deuxième résultat", "Troisième résultat"]);
});

test("Compact result inputs grow and shrink with their content without changing the saved text", async () => {
  const h = await harness("src/components/admin/ProjetForm.jsx", { projet: { id: "test", titre: "Projet", photo_url: "/uploads/test.png", resultats: ["Un résultat"] } });
  const field = find(h.render(), n => n.type === "textarea" && n.props?.id === "project-result-0");
  const node = { style: { height: "46px" }, scrollHeight: 110 };
  field.props.onInput({ currentTarget: node });
  assert.equal(node.style.height, "112px");
  node.scrollHeight = 44;
  field.props.onInput({ currentTarget: node });
  assert.equal(node.style.height, "46px");
  await h.render().props.onSubmit({ preventDefault() {} });
  assert.deepEqual(JSON.parse(h.requests[0].options.body).resultats, ["Un résultat"]);
});


test("Team search combines names, roles and expertise with status filters and retains real ordering neighbors", async () => {
  const membres = [{ id: "a", nom: "Oumar Camara", role: "Direction", statut: "publie" }, { id: "b", nom: "Profil privé", statut: "brouillon" }, { id: "c", nom: "Malick Douet", role: "Médecin", expertises: "Évaluation", statut: "publie" }];
  const h = await harness("src/components/admin/AdminMembresGrid.jsx", { membres });
  const card = id => find(h.render(), n => n.type?.name === "MemberCard" && n.props.membre.id === id);
  assert.ok(card("a")); assert.ok(card("b")); assert.ok(card("c"));
  find(h.render(), n => n.type === "button" && n.props.children === "Publiés").props.onClick({ currentTarget: {} });
  assert.equal(card("b"), null);
  assert.equal(card("c").props.prevId, "b");
  find(h.render(), n => n.props?.["aria-controls"] === "team-search").props.onClick();
  const toolbar = find(h.render(), n => n.props?.className === "projects-toolbar");
  assert.equal(find(toolbar, n => n.props?.className === "projects-browse").props.hidden, true);
  const input = () => find(h.render(), n => n.props?.id === "team-query");
  input().props.onChange({ target: { value: "evaluation" } });
  assert.equal(card("a"), null); assert.ok(card("c"));
  input().props.onChange({ target: { value: "medecin" } }); assert.ok(card("c"));
  input().props.onKeyDown({ key: "Escape" });
  assert.equal(input().props.value, ""); assert.ok(card("a")); assert.equal(card("b"), null);
});

test("Team portraits use initials for missing and broken photos without losing profile actions", async () => {
  for (const photo_url of ["", "/uploads/portrait.png"]) {
    const h = await harness("src/components/admin/MemberCard.jsx", { membre: { id: "malick", nom: "Malick Douet", role: "Chief Staff", statut: "publie", photo_url } });
    if (photo_url) find(h.render(), n => n.type === "img").props.onError();
    assert.ok(find(h.render(), n => n.props?.className === "team-initials" && n.props.children === "MD"));
    assert.ok(find(h.render(), n => n.props?.href === "/admin/membres/malick/modifier"));
    assert.ok(find(h.render(), n => n.props?.className === "team-photo-note"));
  }
});

test("Team options persist a single correct reorder request, report failure and close with Escape", async () => {
  for (const fail of [false, true]) {
    const h = await harness("src/components/admin/MemberOptions.jsx", { membre: { id: "c", nom: "Malick Douet" }, prevId: "b" }, { fail });
    const trigger = () => find(h.render(), n => n.props?.["aria-controls"] === "team-options-c");
    trigger().props.onClick();
    const move = find(h.render(), n => n.type === "button" && n.props.children === "Placer avant le précédent");
    await Promise.all([move.props.onClick(), move.props.onClick()]);
    assert.equal(h.requests.length, 1);
    assert.equal(h.requests[0].url, "/api/admin/reorder");
    assert.deepEqual(JSON.parse(h.requests[0].options.body), { table: "membres", id: "c", targetId: "b" });
    assert.equal(trigger().props["aria-expanded"], fail);
    if (fail) assert.ok(find(h.render(), n => n.props?.role === "alert"));
    else trigger().props.onClick();
    h.render(); h.dispatch("keydown", { key: "Escape" });
    assert.equal(trigger().props["aria-expanded"], false);
  }
});

test("Announcement filters combine publication, category and accent-insensitive search on the same toolbar",async()=>{
 const annonces=[{id:"a",titre:"Évaluation",texte:"Terrain",categorie:"mission",statut:"publie"},{id:"b",titre:"Stage",texte:"Candidature",categorie:"recrutement",statut:"brouillon"}];
 const h=await harness("src/components/admin/AdminAnnoncesGrid.jsx",{annonces});
 const card=id=>find(h.render(),n=>n.type?.name==="AdminAnnouncementCard"&&n.props.annonce.id===id);
 assert.ok(card("a"));assert.ok(card("b"));
 find(h.render(),n=>n.type==="button"&&n.props.children==="Publiées").props.onClick({currentTarget:{}});
 assert.ok(card("a"));assert.equal(card("b"),null);
 find(h.render(),n=>n.props?.id==="announcement-type-filter").props.onChange("recrutement");assert.equal(card("a"),null);
 find(h.render(),n=>n.props?.id==="announcement-type-filter").props.onChange("mission");
 find(h.render(),n=>n.props?.["aria-controls"]==="announcements-search").props.onClick();
 assert.equal(find(h.render(),n=>n.props?.className==="projects-browse").props.hidden,true);
 const field=()=>find(h.render(),n=>n.props?.id==="announcements-query");field().props.onChange({target:{value:"evaluation"}});assert.ok(card("a"));
 field().props.onKeyDown({key:"Escape"});assert.equal(field().props.value,"");assert.ok(card("a"));assert.equal(card("b"),null);
});

test("Public category filters keep real links' records together and reset an empty selection",async()=>{
 const h=await harness("src/components/AnnouncementsGrid.jsx",{annonces:[{id:"a",titre:"Stage",categorie:"recrutement"},{id:"b",titre:"Actualité existante"}]});
 const card=id=>find(h.render(),n=>n.type?.name==="AnnouncementCard"&&n.props.annonce.id===id);
 find(h.render(),n=>n.type==="button"&&n.props.children==="Recrutement").props.onClick({currentTarget:{}});assert.ok(card("a"));assert.equal(card("b"),null);
 find(h.render(),n=>n.type==="button"&&n.props.children==="Publications").props.onClick({currentTarget:{}});assert.equal(card("a"),null);assert.ok(find(h.render(),n=>n.props?.role==="status"));
 find(h.render(),n=>n.type==="button"&&n.props.children==="Toutes les annonces").props.onClick();assert.ok(card("a"));assert.ok(card("b"));
});

test("Announcement editor preserves dates and optional metadata, blocks partial actions, and retains failed edits",async()=>{
 const annonce={id:"stage",titre:"Stage",texte:"Contenu existant",date:"2026-10-21",statut:"publie",categorie:"recrutement",resume:"Résumé existant",lieu:"Conakry",echeance:"2026-12-30",action_url:"https://example.org/postuler",action_label:"Postuler",image_url:"/uploads/stage.png"};
 const h=await harness("src/components/admin/AnnonceForm.jsx",{annonce});
 find(h.render(),n=>n.type==="input"&&n.props.id==="annonceform-1").props.onChange({target:{value:"Stage de fin d’études"}});
 await h.render().props.onSubmit({preventDefault(){}});assert.equal(h.requests.length,1);const payload=JSON.parse(h.requests[0].options.body);
 for(const key of ["texte","date","statut","categorie","resume","lieu","echeance","action_url","action_label","image_url"])assert.equal(payload[key],annonce[key],key);
 assert.equal(payload.titre,"Stage de fin d’études");assert.equal(h.requests[0].options.method,"PUT");
 const invalid=await harness("src/components/admin/AnnonceForm.jsx",{annonce:{...annonce,action_url:""}});await invalid.render().props.onSubmit({preventDefault(){}});assert.equal(invalid.requests.length,0);assert.ok(find(invalid.render(),n=>n.props?.role==="alert"));
 const failed=await harness("src/components/admin/AnnonceForm.jsx",{annonce},{network:true});await failed.render().props.onSubmit({preventDefault(){}});assert.equal(failed.navigations.length,0);assert.equal(find(failed.render(),n=>n.type==="input"&&n.props.id==="annonceform-1").props.value,"Stage");
});

test("Custom announcement date clamps month ends and a partial year cannot be submitted",async()=>{
 const props={id:"date",label:"Date",value:"2026-01-31",onChange:v=>{props.value=v;}};
 const h=await harness("src/components/admin/EditorDate.jsx",props);
 find(h.render(),n=>n.props?.id==="date-month").props.onChange("02");assert.equal(props.value,"2026-02-28");
 const form=await harness("src/components/admin/AnnonceForm.jsx",{annonce:{id:"a",titre:"Titre",texte:"Texte",date:"2026-10-21"}});
 find(form.render(),n=>n.type?.name==="EditorDate").props.onChange("202-10-21");await form.render().props.onSubmit({preventDefault(){}});assert.equal(form.requests.length,0);assert.ok(find(form.render(),n=>n.props?.role==="alert"));
});

test("Announcement gallery upload preserves successful photos when another file fails",async()=>{
 const added=[],flags=[];
 const h=await harness("src/components/admin/AnnouncementGalleryUpload.jsx",{photos:[],onAdd:photos=>added.push(...photos),onChange(){},onUploadingChange:flag=>flags.push(flag)},{respond:async()=>Response.json({url:"/uploads/success.jpg"})});
 const input=find(h.render(),n=>n.type==="input"&&n.props.type==="file");
 await input.props.onChange({target:{files:[new File(["image"],"photo.jpg",{type:"image/jpeg"}),new File(["bad"],"document.pdf",{type:"application/pdf"})],value:""}});
 assert.equal(added.length,1);assert.equal(added[0].url,"/uploads/success.jpg");assert.deepEqual(flags,[true,false]);assert.equal(h.requests.length,1);
 assert.ok(find(h.render(),n=>n.props?.role==="alert"));
});

test("Gallery ordering and removal are explicit and saving waits for photo uploads",async()=>{
 const photos=[{url:"/a.jpg",legende:"A"},{url:"/b.jpg",legende:"B"}];let changed;
 const h=await harness("src/components/admin/AnnouncementGalleryUpload.jsx",{photos,onChange:value=>changed=value,onAdd(){}});
 find(h.render(),n=>n.props?.["aria-label"]==="Placer la photo 1 après la suivante").props.onClick();assert.equal(changed[0].url,"/b.jpg");
 find(h.render(),n=>n.props?.["aria-label"]==="Retirer la photo 1 de la galerie").props.onClick();assert.equal(changed.length,1);assert.equal(changed[0].url,"/b.jpg");
 const editor=await harness("src/components/admin/AnnonceForm.jsx",{annonce:{id:"test",titre:"Annonce",texte:"Contenu",date:"2026-10-23",image_url:"/cover.jpg",galerie:photos}});
 let tree=editor.render();find(tree,n=>n.type?.name==="AnnouncementGalleryUpload").props.onUploadingChange(true);
 tree=editor.render();await find(tree,n=>n.type==="form").props.onSubmit({preventDefault(){}});assert.equal(editor.requests.length,0);
 find(tree,n=>n.type?.name==="AnnouncementGalleryUpload").props.onUploadingChange(false);
 tree=editor.render();await find(tree,n=>n.type==="form").props.onSubmit({preventDefault(){}});
 const payload=JSON.parse(editor.requests[0].options.body);assert.equal(payload.image_url,"/cover.jpg");assert.equal(payload.galerie.length,2);
});

test("Public photo viewer cycles and closes with Escape while restoring focus",async()=>{
 const h=await harness("src/components/AnnouncementGallery.jsx",{title:"Atelier",photos:[{url:"/a.jpg",legende:"A"},{url:"/b.jpg",legende:"B"}]});
 let tree=h.render(),focused=false;const modal={open:false,showModal(){this.open=true;},close(){this.open=false;}};
 find(tree,n=>n.type==="dialog").props.ref.current=modal;
 find(tree,n=>n.props?.["aria-label"]==="Agrandir la photo 1 : A").props.onClick({currentTarget:{focus(){focused=true;}}});
 tree=h.render();assert.equal(modal.open,true);
 find(tree,n=>n.type==="button"&&n.props.children==="Suivante").props.onClick();
 tree=h.render();assert.equal(find(tree,n=>n.type?.name==="PublicImage"&&n.props.className==="announcement-viewer-image").props.src,"/b.jpg");
 find(tree,n=>n.type==="dialog").props.onCancel({preventDefault(){}});h.render();assert.equal(modal.open,false);assert.equal(focused,true);
});
