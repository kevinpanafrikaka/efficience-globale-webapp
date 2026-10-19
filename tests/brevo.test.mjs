import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { isBrevoConfigured, sendBrevo } from "../src/lib/brevo.mjs";

// Valeurs fictives : aucun de ces tests n'appelle le réseau.
const env = { BREVO_API_KEY: "test-only-key", BREVO_SENDER_EMAIL: "site@example.org" };
const message = { nom: "Visiteur", email: "visiteur@example.net", sujet: "Mission", message: "Bonjour, parlons du projet." };

test("Brevo stays inactive until both runtime values are valid", () => {
  assert.equal(isBrevoConfigured({}), false);
  assert.equal(isBrevoConfigured({ BREVO_API_KEY: "test-only-key" }), false);
  assert.equal(isBrevoConfigured({ ...env, BREVO_API_KEY: " " }), false);
  assert.equal(isBrevoConfigured({ ...env, BREVO_SENDER_EMAIL: "bad address" }), false);
  assert.equal(isBrevoConfigured(env), true);
});

test("Brevo sends to Oumar and replies to the visitor using the verified sender", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://api.brevo.com/v3/smtp/email");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["api-key"], "test-only-key");
    assert.ok(options.signal instanceof AbortSignal);
    const body = JSON.parse(options.body);
    assert.equal(body.sender.email, "site@example.org");
    assert.deepEqual(body.to.map((r) => r.email), ["oumar.camara@efficienceglobale.com"]);
    assert.equal(body.replyTo.email, message.email);
    assert.ok(body.textContent.includes(message.message));
    assert.equal(body.subject, "Nouveau message : Mission");
    return Response.json({ messageId: "<accepted@example.org>" }, { status: 201 });
  });
  assert.equal(await sendBrevo(env, message), "<accepted@example.org>");
});

test("Missing configuration and invalid reply addresses do not call the provider", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected network"); });
  await assert.rejects(sendBrevo({}, message), /configuration incomplete/);
  await assert.rejects(sendBrevo(env, { ...message, email: "bad\r\nBcc: someone@example.org" }), /Invalid reply/);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("A provider rejection does not disclose its body or API key", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ message: "sensitive-provider-detail" }, { status: 401 }));
  await assert.rejects(sendBrevo(env, message), (error) => {
    assert.equal(error.message, "Brevo request rejected (401)");
    return true;
  });
});

test("A successful HTTP response without an acknowledgement is not an email success", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({}));
  await assert.rejects(sendBrevo(env, message), /did not acknowledge/);
});

async function routeFor(runtimeEnv, events, { saveFails = false } = {}) {
  const context = vm.createContext({ Response });
  const modules = {
    "@opennextjs/cloudflare": { getCloudflareContext: async () => ({ env: runtimeEnv }) },
    "@/lib/db": {
      createMessage: async () => { events.push("saved"); if (saveFails) throw new Error("Database unavailable"); return 42; },
      markMessageSent: async (id) => { assert.equal(id, 42); events.push("sent"); },
      getReglages: async () => ({ email_destinataire: "legacy@example.net" }),
    },
    "@/lib/gmail.mjs": {
      isGmailConnected: async () => { events.push("gmail-checked"); return false; },
      sendGmail: async () => { throw new Error("Unexpected Gmail send"); },
    },
    "@/lib/brevo.mjs": { isBrevoConfigured, sendBrevo },
  };
  // fetch in the route uses the same mocked fetch as the actual Brevo module.
  context.fetch = (...args) => globalThis.fetch(...args);
  const source = await readFile(new URL("../src/app/api/contact/route.js", import.meta.url), "utf8");
  const route = new vm.SourceTextModule(source, { context });
  await route.link((specifier) => {
    const exports = modules[specifier];
    if (!exports) throw new Error(`Unexpected import: ${specifier}`);
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
    }, { context });
  });
  await route.evaluate();
  return route.namespace.POST;
}

function request(values = message) {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return new Request("https://example.org/api/contact", { method: "POST", body: form });
}

test("Contact saves first, uses Brevo before Gmail, then marks accepted email sent", async (t) => {
  const events = [];
  t.mock.method(globalThis, "fetch", async () => { events.push("brevo"); return Response.json({ messageId: "accepted" }, { status: 201 }); });
  const POST = await routeFor(env, events);
  const response = await POST(request());
  assert.deepEqual(await response.json(), { success: true });
  assert.deepEqual(events, ["saved", "brevo", "sent"]);
});

test("Brevo errors keep the saved message unsent and never fall back to another recipient", async (t) => {
  const events = [];
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { events.push("brevo-rejected"); return new Response(null, { status: 403 }); });
  const POST = await routeFor({ ...env, RESEND_API_KEY: "test-legacy" }, events);
  const response = await POST(request());
  assert.deepEqual(await response.json(), { success: true });
  assert.deepEqual(events, ["saved", "brevo-rejected"]);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test("A timeout keeps the saved message unsent without retrying", async (t) => {
  const events = [];
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new DOMException("Timed out", "TimeoutError"); });
  const POST = await routeFor(env, events);
  assert.equal((await POST(request())).status, 200);
  assert.deepEqual(events, ["saved"]);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test("Incomplete Brevo configuration preserves the existing Resend flow", async (t) => {
  const events = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    assert.equal(JSON.parse(options.body).to, "legacy@example.net");
    events.push("resend");
    return Response.json({ id: "legacy-accepted" });
  });
  const POST = await routeFor({ BREVO_API_KEY: "test-only-key", RESEND_API_KEY: "test-legacy" }, events);
  assert.equal((await POST(request())).status, 200);
  assert.deepEqual(events, ["saved", "gmail-checked", "resend", "sent"]);
});

test("Invalid submissions and database failures never send an email", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected network"); });
  const events = [];
  const POST = await routeFor(env, events);
  assert.equal((await POST(request({ ...message, email: "invalid" }))).status, 400);
  assert.equal((await POST(request({ ...message, site_web: "bot" }))).status, 200);
  assert.deepEqual(events, []);
  const failedPost = await routeFor(env, events, { saveFails: true });
  assert.equal((await failedPost(request())).status, 500);
  assert.equal(fetchMock.mock.callCount(), 0);
});
