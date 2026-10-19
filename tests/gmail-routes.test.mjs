import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import * as gmail from '../src/lib/gmail.mjs';

async function load(path, { env = {}, authenticated = true, overrides = {}, db = {} } = {}) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const context = vm.createContext({ Response, URL, URLSearchParams, TextEncoder, crypto, Date, fetch: () => { throw new Error('Unexpected network request'); } });
  const dependencies = {
    '@opennextjs/cloudflare': { getCloudflareContext: async () => ({ env }) },
    '@/lib/adminAuth': { isAdminRequest: async () => authenticated, safeEqual: (a,b) => a === b },
    '@/lib/gmail.mjs': { ...gmail, ...overrides },
    '@/lib/db': db,
  };
  const module = new vm.SourceTextModule(source, { context });
  await module.link(async (specifier) => {
    const exports = dependencies[specifier];
    const mock = new vm.SyntheticModule(Object.keys(exports), function () { for (const [name,value] of Object.entries(exports)) this.setExport(name,value); }, { context });
    return mock;
  });
  await module.evaluate();
  return module.namespace;
}

const start = '../src/app/api/email/google/route.js';
const callback = '../src/app/api/email/google/callback/route.js';
const creds = { GOOGLE_CLIENT_ID:'test-client', GOOGLE_CLIENT_SECRET:'test-secret' };
const origin = 'https://portfolio.efficienceglobale.workers.dev';

test('Connection endpoints reject anonymous visitors', async () => {
  const route = await load(start, { authenticated:false });
  assert.equal((await route.GET(new Request(`${origin}/api/email/google`))).status, 401);
  assert.equal((await route.POST(new Request(`${origin}/api/email/google`, { method:'POST' }))).status, 401);
  const cb = await load(callback, { authenticated:false });
  assert.equal((await cb.GET(new Request(`${origin}${gmail.CALLBACK_PATH}`))).status,401);
});

test('OAuth start rejects cross-site POST before contacting Google', async () => {
  const route = await load(start, { env:creds });
  assert.equal((await route.POST(new Request(`${origin}/api/email/google`, { method:'POST', headers:{origin:'https://another.example'} }))).status,403);
});

test('OAuth requests minimum mail permission, offline access, state and PKCE', async () => {
  const route = await load(start, { env:creds });
  const response = await route.POST(new Request(`${origin}/api/email/google`, { method:'POST', headers:{origin} }));
  assert.equal(response.status,303);
  const url = new URL(response.headers.get('location'));
  assert.equal(url.searchParams.get('redirect_uri'), `${origin}${gmail.CALLBACK_PATH}`);
  assert.equal(url.searchParams.get('access_type'),'offline');
  assert.equal(url.searchParams.get('code_challenge_method'),'S256');
  assert.ok(url.searchParams.get('scope').includes('gmail.send'));
  assert.ok(!url.searchParams.get('scope').includes('gmail.readonly'));
  assert.match(response.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Lax/);
});

test('Callback rejects mismatched and expired state before token exchange', async () => {
  for (const state of [{state:'correct',expires:Date.now()+60000}, {state:'wrong',expires:0}]) {
    let exchanged = false;
    const route = await load(callback, { env:creds, overrides:{googleToken:async()=>{exchanged=true; throw new Error('Unexpected');}} });
    const cookie = await gmail.seal(state,creds);
    const response = await route.GET(new Request(`${origin}${gmail.CALLBACK_PATH}?state=wrong&code=test`, {headers:{cookie:`${gmail.OAUTH_COOKIE}=${cookie}`}}));
    assert.equal(response.status,400);
    assert.equal(exchanged,false);
  }
});

test('Contact saves the message before a Gmail failure and never sends it via Resend', async () => {
  const events=[];
  const route=await load('../src/app/api/contact/route.js',{env:creds,
    db:{createMessage:async()=>{events.push('save');return 1;},markMessageSent:async()=>events.push('sent'),getReglages:async()=>{throw new Error('Resend must not be used');}},
    overrides:{isGmailConnected:async()=>true,sendGmail:async()=>{events.push('gmail');throw new Error('Google unavailable');}},
  });
  const form=new FormData(); for(const [key,value] of Object.entries({nom:'Test',email:'test@example.com',message:'Test technique'})) form.set(key,value);
  const response=await route.POST(new Request(`${origin}/api/contact`,{method:'POST',body:form}));
  assert.equal(response.status,200);
  assert.deepEqual(events,['save','gmail']);
});
