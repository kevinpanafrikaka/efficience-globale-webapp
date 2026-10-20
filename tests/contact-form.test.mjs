import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import * as jsx from "react/jsx-runtime";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/build/swc");

// Execute real handlers with simulated React state; no browser or live email.
async function formHarness({ reject = false } = {}) {
  const state = [], requests = [];
  let cursor = 0;
  const hook = (initial) => {
    const index = cursor++;
    if (!(index in state)) state[index] = initial;
    return [state[index], value => { state[index] = value; }];
  };
  const context = vm.createContext({
    fetch: async (url, options) => {
      requests.push({ url, options });
      return Response.json(reject ? { error: "Erreur de test" } : { success: true }, { status: reject ? 400 : 200 });
    },
    FormData: class { constructor(form) { this.fields = form.fields; } },
  });
  const imports = {
    "react": {
      useState: hook,
      useRef: value => { const index = cursor++; return state[index] ??= { current: value }; },
      useEffect: () => {},
    },
    "react/jsx-runtime": jsx,
  };
  const source = await readFile(new URL("../src/components/ContactForm.jsx", import.meta.url), "utf8");
  const { code } = transformSync(source, { filename: "ContactForm.jsx", jsc: { target: "es2022", parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "es6" } });
  const module = new vm.SourceTextModule(code, { context });
  await module.link(name => {
    const values = imports[name];
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context });
  });
  await module.evaluate();
  return { requests, render: () => { cursor = 0; return module.namespace.default({ emailContact: "oumar.camara@efficienceglobale.com" }); } };
}

function find(root, predicate) {
  if (!root || typeof root !== "object") return null;
  if (predicate(root)) return root;
  for (const child of [root.props?.children].flat(Infinity)) {
    const result = find(child, predicate);
    if (result) return result;
  }
  return null;
}

test("The three topics prefill an editable subject and preserve the existing form fields", async () => {
  const harness = await formHarness();
  for (const [topic, expected] of [["projet", "Accompagnement d’un projet"], ["formation", "Demande de formation"], ["partenariat", "Proposition de partenariat"]]) {
    const tree = harness.render();
    find(tree, n => n.type === "input" && n.props.value === topic).props.onChange();
    const updated = harness.render();
    assert.equal(find(updated, n => n.props?.name === "sujet").props.value, expected);
    assert.equal(find(updated, n => n.props?.value === topic).props.checked, true);
    for (const name of ["nom", "email", "sujet", "message", "site_web"]) assert.ok(find(updated, n => n.props?.name === name));
  }
  find(harness.render(), n => n.props?.name === "sujet").props.onChange({ target: { value: "Sujet personnalisé" } });
  assert.equal(find(harness.render(), n => n.props?.name === "sujet").props.value, "Sujet personnalisé");
});

test("Submit retains the contact endpoint, prevents duplicate requests, then offers a fresh message", async () => {
  const harness = await formHarness();
  const tree = harness.render();
  let resetCount = 0;
  const event = { preventDefault() {}, currentTarget: { fields: { nom: "Test", email: "test@example.org", message: "Test" }, reset() { resetCount++; } } };
  await Promise.all([tree.props.onSubmit(event), tree.props.onSubmit(event)]);
  assert.equal(harness.requests.length, 1);
  assert.equal(harness.requests[0].url, "/api/contact");
  assert.equal(harness.requests[0].options.method, "POST");
  assert.equal(harness.requests[0].options.body.fields.message, "Test");
  assert.equal(resetCount, 1);
  const success = harness.render();
  assert.equal(success.props.role, "status");
  find(success, n => n.type === "button").props.onClick();
  const fresh = harness.render();
  assert.equal(fresh.type, "form");
  assert.equal(find(fresh, n => n.props?.name === "sujet").props.value, "");
});

test("A failed submission keeps the form and custom subject for retry", async () => {
  const harness = await formHarness({ reject: true });
  find(harness.render(), n => n.props?.name === "sujet").props.onChange({ target: { value: "À conserver" } });
  await harness.render().props.onSubmit({ preventDefault() {}, currentTarget: { fields: {}, reset() { throw Error("Must not reset failed submission"); } } });
  const tree = harness.render();
  assert.equal(find(tree, n => n.props?.role === "alert").props.children, "Erreur de test");
  assert.equal(find(tree, n => n.props?.name === "sujet").props.value, "À conserver");
  assert.equal(find(tree, n => n.type === "button" && n.props.type === "submit").props.disabled, false);
});
