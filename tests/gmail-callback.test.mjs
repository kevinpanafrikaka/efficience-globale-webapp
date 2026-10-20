import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { googleToken } from "../src/lib/gmail.mjs";

const scope = "https://www.googleapis.com/auth/gmail.send";
const origin = "https://portfolio.efficienceglobale.workers.dev";

async function callback(options = {}) {
  const calls = [];
  const context = vm.createContext({ Response, URL, Date, AbortSignal, fetch: async () => {
    calls.push("userinfo");
    return Response.json({ email: options.wrongAccount ? "other@example.org" : "kevinkandet05@gmail.com", email_verified: true });
  } });
  const modules = {
    "@opennextjs/cloudflare": { getCloudflareContext: async () => ({ env: { GOOGLE_CLIENT_ID: "test-client", GOOGLE_CLIENT_SECRET: "test-secret" } }) },
    "@/lib/adminAuth": { isAdminRequest: async () => options.admin !== false, safeEqual: (a, b) => a === b },
    "@/lib/gmail.mjs": {
      GMAIL_OWNER: "kevinkandet05@gmail.com", GMAIL_SCOPE: scope, OAUTH_COOKIE: "__Host-eg_gmail_oauth",
      configured: () => true, redirectUri: () => `${origin}/api/email/google/callback`,
      unseal: async () => {
        if (options.unsealFails) throw new Error("sensitive-crypto-detail");
        return { state: "expected-state", verifier: "test-verifier", expires: options.expired ? 1 : Date.now() + 600000 };
      },
      googleToken: async (params) => {
        calls.push("token");
        assert.equal(params.code_verifier, "test-verifier");
        if (options.tokenError) { const e = new Error("sensitive-provider-detail"); e.oauthCode = options.tokenError; throw e; }
        return { access_token: "test-access-token", refresh_token: options.noRefresh ? undefined : "test-refresh-token", scope: options.noScope ? "openid" : scope };
      },
      saveConnection: async () => { calls.push("save"); if (options.storageFails) throw new Error("sensitive-db-detail"); },
    },
  };
  const source = await readFile(new URL("../src/app/api/email/google/callback/route.js", import.meta.url), "utf8");
  const route = new vm.SourceTextModule(source, { context });
  await route.link((name) => {
    const values = modules[name];
    if (!values) throw new Error(`Unexpected import: ${name}`);
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context });
  });
  await route.evaluate();
  const url = new URL(`${origin}/api/email/google/callback`);
  url.searchParams.set("state", options.badState ? "wrong-state" : "expected-state");
  url.searchParams.set("code", "private-authorization-code");
  if (options.denied) url.searchParams.set("error", "access_denied");
  const cookie = options.noCookie ? "" : "eg_admin_session=test;__Host-eg_gmail_oauth=encrypted";
  return { response: await route.namespace.GET(new Request(url, { headers: { cookie } })), calls };
}

test("Callback saves only after state, permissions and account checks, including cookie headers without spaces", async () => {
  const { response, calls } = await callback();
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/api/email/google");
  assert.deepEqual(calls, ["token", "userinfo", "save"]);
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/);
});

test("Callback identifies failures without exposing credentials, codes or provider details", async (t) => {
  const cases = [
    [{ noCookie: true }, "cookie_missing", []],
    [{ unsealFails: true }, "cookie_invalid", []],
    [{ expired: true }, "state_expired", []],
    [{ badState: true }, "state_invalid", []],
    [{ denied: true }, "authorization_denied", []],
    [{ tokenError: "invalid_client" }, "invalid_client", ["token"]],
    [{ tokenError: "invalid_grant" }, "invalid_grant", ["token"]],
    [{ tokenError: "unexpected-sensitive-text" }, "token_exchange", ["token"]],
    [{ noScope: true }, "scope_missing", ["token"]],
    [{ noRefresh: true }, "refresh_missing", ["token"]],
    [{ wrongAccount: true }, "wrong_account", ["token", "userinfo"]],
    [{ storageFails: true }, "storage", ["token", "userinfo", "save"]],
  ];
  for (const [options, code, expected] of cases) await t.test(code, async () => {
    const { response, calls } = await callback(options);
    assert.equal(response.status, 400);
    const text = await response.text();
    assert.ok(text.includes(`(${code})`));
    assert.doesNotMatch(text, /sensitive-|test-secret|private-authorization-code|test-access-token|test-refresh-token|unexpected-sensitive-text/);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.match(response.headers.get("set-cookie"), /Max-Age=0/);
    assert.deepEqual(calls, expected);
  });
});

test("Callback still requires the admin session", async () => {
  const { response, calls } = await callback({ admin: false });
  assert.equal(response.status, 401);
  assert.deepEqual(calls, []);
});

test("Token errors retain only known OAuth codes, never raw Google descriptions", async (t) => {
  for (const code of ["invalid_client", "invalid_grant", "unexpected-sensitive-text"]) {
    t.mock.method(globalThis, "fetch", async () => Response.json({ error: code, error_description: "sensitive-provider-description" }, { status: 401 }));
    await assert.rejects(googleToken({ client_secret: "test-secret" }), (error) => {
      assert.equal(error.message, "Gmail authorization failed");
      assert.equal(error.oauthCode, code === "unexpected-sensitive-text" ? undefined : code);
      assert.doesNotMatch(JSON.stringify(error), /sensitive-|test-secret/);
      return true;
    });
    t.mock.restoreAll();
  }
});
