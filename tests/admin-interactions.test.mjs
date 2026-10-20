import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import * as jsx from "react/jsx-runtime";
const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/build/swc");

async function harness(path, props = {}, { fail = false, network = false } = {}) {
  const state = [], requests = [], navigations = [];
  let cursor = 0;
  const context = vm.createContext({
    fetch: async (url, options) => { requests.push({ url, options }); if (network) throw Error("offline"); return Response.json(fail ? { error: "Échec de test" } : { success: true }, { status: fail ? 401 : 200 }); },
    window: { confirm: () => true },
  });
  const imports = {
    "react": {
      useState(initial) { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], value => { state[i] = typeof value === "function" ? value(state[i]) : value; }]; },
      useRef(value) { const i = cursor++; return state[i] ??= { current: value }; },
    },
    "react/jsx-runtime": jsx,
    "next/navigation": { useRouter: () => ({ push: value => navigations.push(value), refresh() {} }) },
    "@/components/admin/ImageUpload": { default: function ImageUpload() {} },
  };
  const cache = new Map();
  async function load(name) {
    if (imports[name]) return new vm.SyntheticModule(Object.keys(imports[name]), function () { for (const [k,v] of Object.entries(imports[name])) this.setExport(k,v); }, { context });
    const file = name === "./useAdminAction" ? "src/components/admin/useAdminAction.js" : name;
    if (!cache.has(file)) {
      const source = await readFile(new URL("../" + file, import.meta.url), "utf8");
      const { code } = transformSync(source, { filename: file, jsc: { target: "es2022", parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "es6" } });
      const module = new vm.SourceTextModule(code, { context }); cache.set(file, module); await module.link(load);
    }
    return cache.get(file);
  }
  const module = await load(path); await module.evaluate();
  return { requests, navigations, render() { cursor = 0; return module.namespace.default(props); } };
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
