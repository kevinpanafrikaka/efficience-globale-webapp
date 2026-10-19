import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

const origin = "https://portfolio.efficienceglobale.workers.dev";

async function loadRoute({ admin = true } = {}) {
  const context = vm.createContext({ Response, URL, URLSearchParams, TextEncoder, crypto: webcrypto });
  const modules = {
    "@opennextjs/cloudflare": { getCloudflareContext: async () => ({ env: { GOOGLE_CLIENT_ID: "test.apps.googleusercontent.com" } }) },
    "@/lib/adminAuth": { isAdminRequest: async () => admin },
    "@/lib/gmail.mjs": {
      GMAIL_OWNER: "kevinkandet05@gmail.com", GMAIL_SCOPE: "https://www.googleapis.com/auth/gmail.send",
      OAUTH_COOKIE: "__Host-eg_gmail_oauth", base64url: (bytes) => Buffer.from(bytes).toString("base64url"),
      configured: () => true, isGmailConnected: async () => false,
      redirectUri: () => `${origin}/api/email/google/callback`, seal: async () => "test-encrypted-state",
    },
  };
  const source = await readFile(new URL("../src/app/api/email/google/route.js", import.meta.url), "utf8");
  const route = new vm.SourceTextModule(source, { context });
  await route.link((name) => {
    const values = modules[name];
    if (!values) throw new Error(`Unexpected import: ${name}`);
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context });
  });
  await route.evaluate();
  return route.namespace;
}

test("The Gmail form preserves same-origin POST origins and permits only its Google redirect", async () => {
  const { GET } = await loadRoute();
  const response = await GET(new Request(`${origin}/api/email/google`));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("referrer-policy"), "same-origin");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.ok(response.headers.get("content-security-policy").includes("form-action 'self' https://accounts.google.com;"));
  assert.ok(response.headers.get("content-security-policy").includes("frame-ancestors 'none'"));
});

test("An authenticated same-origin form redirects to Google with state, PKCE and secure cookie", async () => {
  const { POST } = await loadRoute();
  const response = await POST(new Request(`${origin}/api/email/google`, { method: "POST", headers: { origin } }));
  assert.equal(response.status, 303);
  const location = new URL(response.headers.get("location"));
  assert.equal(location.origin, "https://accounts.google.com");
  assert.equal(location.searchParams.get("redirect_uri"), `${origin}/api/email/google/callback`);
  assert.equal(location.searchParams.get("code_challenge_method"), "S256");
  assert.ok(location.searchParams.get("state"));
  assert.ok(location.searchParams.get("code_challenge"));
  assert.match(response.headers.get("set-cookie"), /HttpOnly; Secure; SameSite=Lax/);
});

test("Foreign, missing and null origins are still refused", async () => {
  const { POST } = await loadRoute();
  for (const value of ["https://attacker.example", "null", undefined]) {
    const response = await POST(new Request(`${origin}/api/email/google`, {
      method: "POST", headers: value ? { origin: value } : {},
    }));
    assert.equal(response.status, 403);
    assert.equal(response.headers.get("location"), null);
  }
});

test("Both setup methods still require an admin session", async () => {
  const { GET, POST } = await loadRoute({ admin: false });
  assert.equal((await GET(new Request(`${origin}/api/email/google`))).status, 401);
  assert.equal((await POST(new Request(`${origin}/api/email/google`, { method: "POST", headers: { origin } }))).status, 401);
});
