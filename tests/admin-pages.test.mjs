import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile, readdir } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { adminRuntime } from "./helpers/admin-runtime.mjs";

test("Every private server page checks the session before reading any data", async () => {
  const runtime = await adminRuntime({ authenticated: false });
  try {
    const paths = (await readdir(new URL("../src/app/admin", import.meta.url), { recursive: true })).filter(path => path.endsWith("page.js") && !path.startsWith("apercu"));
    for (const path of paths) {
      const page = await runtime.module(`src/app/admin/${path}`);
      assert.equal(await page.default({ params: Promise.resolve({ id: "unknown" }) }), null, path);
    }
    assert.equal(runtime.reads, 0);
  } finally { runtime.close(); }
});

test("Reading a message does not mark it read during server rendering or prefetch", async () => {
  const runtime = await adminRuntime();
  try {
    const db = await runtime.module("src/lib/db.js");
    const id = await db.createMessage({ nom: "Visiteur", email: "test@example.org", sujet: "Test", message: "Message privé" });
    const page = await runtime.module("src/app/admin/messages/[id]/page.js");
    assert.ok(await page.default({ params: Promise.resolve({ id }) }));
    assert.equal((await db.getMessageById(id)).lu, 0);
  } finally { runtime.close(); }
});

test("Admin forms render associated labels and all four content forms offer file upload", async () => {
  const runtime = await adminRuntime();
  try {
    for (const name of ["ProjetForm", "MembreForm", "PartenaireForm", "AnnonceForm"]) {
      const module = await runtime.module(`src/components/admin/${name}.jsx`);
      const html = renderToStaticMarkup(module.default ? (await import("react")).createElement(module.default) : null);
      assert.ok(html.includes('type="file"'), name);
      assert.ok(html.includes('accept="image/jpeg,image/png,image/webp,image/gif"'), name);
      for (const match of html.matchAll(/<label[^>]*for="([^"]+)"/g)) assert.ok(html.includes(`id="${match[1]}"`), `${name}: ${match[1]}`);
    }
  } finally { runtime.close(); }
});

test("Settings display the actual Gmail sender and recipient without exposing secrets", async () => {
  const runtime = await adminRuntime();
  try {
    runtime.env.GOOGLE_CLIENT_ID = "test-client";
    runtime.env.GOOGLE_CLIENT_SECRET = "test-google-secret";
    runtime.sqlite.exec("CREATE TABLE gmail_connection (id INTEGER PRIMARY KEY, token TEXT)");
    runtime.sqlite.prepare("INSERT INTO gmail_connection VALUES (1,?)").run("encrypted-test-token");
    const page = await runtime.module("src/app/admin/reglages/page.js");
    const html = renderToStaticMarkup(await page.default());
    assert.ok(html.includes("Gmail connecté"));
    assert.ok(html.includes("oumar.camara@efficienceglobale.com"));
    assert.ok(html.includes("kevinkandet05@gmail.com"));
    assert.doesNotMatch(html, /test-google-secret|encrypted-test-token|Destinataire Resend|Chiffres de l|Ajouter un chiffre/);
  } finally { runtime.close(); }
});

test("Real session signatures reject forged, expired, malformed and non-finite cookies", async () => {
  const context = vm.createContext({ TextEncoder, Date, crypto: webcrypto });
  const source = await readFile(new URL("../src/lib/adminAuth.js", import.meta.url), "utf8");
  const module = new vm.SourceTextModule(source, { context });
  await module.link(() => new vm.SyntheticModule(["cookies"], function () { this.setExport("cookies", async () => ({ get() {} })); }, { context }));
  await module.evaluate();
  const auth = module.namespace;
  const env = { ADMIN_PASSWORD: "test-password-only" };
  const token = await auth.createSessionCookieValue(env);
  const request = value => new Request("https://example.org/admin", { headers: { cookie: `eg_admin_session=${value}` } });
  assert.equal(await auth.isAdminRequest(request(token), env), true);
  assert.equal(await auth.isAdminRequest(request(token + "x"), env), false);
  assert.equal(await auth.isAdminRequest(request(token), { ADMIN_PASSWORD: "wrong" }), false);
  assert.equal(await auth.isAdminRequest(request("%malformed"), env), false);
  for (const expiration of ["1", "NaN", "Infinity"]) {
    const payload = `admin.${expiration}`;
    const key = await webcrypto.subtle.importKey("raw", new TextEncoder().encode(env.ADMIN_PASSWORD), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = Buffer.from(await webcrypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))).toString("hex");
    assert.equal(await auth.isAdminRequest(request(`${payload}.${signature}`), env), false);
  }
});
