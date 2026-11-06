import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import * as jsx from "react/jsx-runtime";
import * as contactFiles from "../src/lib/contact-attachments.mjs";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/build/swc");

// Execute real handlers with simulated React state; no browser or live email.
async function formHarness({ reject = false, attachmentsSent = true } = {}) {
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
      return Response.json(reject ? { error: "Erreur de test" } : { success: true, attachments_sent: attachmentsSent }, { status: reject ? 400 : 200 });
    },
    FormData: class { constructor(form) { this.fields = form.fields; this.files = []; } append(name, file) { this.files.push({name, file}); } },
  });
  const imports = {
    "react": {
      useState: hook,
      useRef: value => { const index = cursor++; return state[index] ??= { current: value }; },
      useEffect: () => {},
    },
    "react/jsx-runtime": jsx,
    "@/lib/contact-attachments.mjs": contactFiles,
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
    const radio = find(tree, n => n.type === "input" && n.props.value === topic);
    assert.equal(radio.props.required, true);
    radio.props.onChange();
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


test("Choosing or changing accompaniment preserves a manually entered subject; a blank subject can be suggested", async () => {
 const harness=await formHarness();
 const input=()=>find(harness.render(),n=>n.props?.name==="sujet");
 const choose=topic=>find(harness.render(),n=>n.type==="input"&&n.props.value===topic).props.onChange();
 input().props.onChange({target:{value:"Mon projet personnel"}});
 for(const topic of ["projet","formation","partenariat"]){choose(topic);assert.equal(input().props.value,"Mon projet personnel");}
 input().props.onChange({target:{value:""}});choose("formation");assert.equal(input().props.value,"Demande de formation");
 input().props.onChange({target:{value:"Sujet après sélection"}});choose("projet");assert.equal(input().props.value,"Sujet après sélection");
});

test("Documents can be added across selections, removed, and submitted exactly once", async () => {
 const h=await formHarness();
 const a=new File(['%PDF-1.7\n%%EOF'],'projet.pdf',{type:'application/pdf'}),b=new File(['%PDF-1.7\n%%EOF'],'budget.pdf',{type:'application/pdf'});
 const choose=files=>find(h.render(),n=>n.props?.id==='contact-documents').props.onChange({target:{files,value:'selection'}});
 choose([a]);choose([b]);
 assert.ok(find(h.render(),n=>n.props?.['aria-label']==='Retirer projet.pdf'));
 find(h.render(),n=>n.props?.['aria-label']==='Retirer projet.pdf').props.onClick();
 await h.render().props.onSubmit({preventDefault(){},currentTarget:{fields:{},reset(){}}});
 assert.deepEqual(h.requests[0].options.body.files,[{name:'documents',file:b}]);
 find(h.render(),n=>n.type==='button').props.onClick();
 assert.equal(find(h.render(),n=>n.props?.['aria-label']==='Retirer budget.pdf'),null);
});

test("Invalid files are rejected without discarding earlier selections, which survive API failure", async () => {
 const h=await formHarness({reject:true});
 const a=new File(['pdf'],'projet.pdf',{type:'application/pdf'});
 const choose=files=>find(h.render(),n=>n.props?.id==='contact-documents').props.onChange({target:{files,value:'selection'}});
 choose([a]);choose([new File(['exe'],'test.exe')]);
 assert.match(find(h.render(),n=>n.props?.role==='alert').props.children,/format PDF/);
 assert.ok(find(h.render(),n=>n.props?.['aria-label']==='Retirer projet.pdf'));
 find(h.render(),n=>n.props?.['aria-label']==='Retirer projet.pdf').props.onClick();choose([a]);
 await h.render().props.onSubmit({preventDefault(){},currentTarget:{fields:{},reset(){throw Error('Must not reset');}}});
 assert.ok(find(h.render(),n=>n.props?.['aria-label']==='Retirer projet.pdf'));
});

test("A saved message never conceals failure to transmit its documents", async () => {
 const h=await formHarness({attachmentsSent:false});
 await h.render().props.onSubmit({preventDefault(){},currentTarget:{fields:{},reset(){}}});
 const alert=find(h.render(),n=>n.props?.role==='alert');
 assert.ok(alert);assert.match(JSON.stringify(alert.props.children),/documents n’ont pas pu être transmis/);
});
