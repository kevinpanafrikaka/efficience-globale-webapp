import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMime, seal, unseal, sendGmail, isGmailConnected, GMAIL_SCOPE } from '../src/lib/gmail.mjs';

const env = { GOOGLE_CLIENT_ID: 'test-client', GOOGLE_CLIENT_SECRET: 'test-secret' };

test('OAuth tokens are encrypted and cannot be decrypted with another secret', async () => {
  const sealed = await seal({ refreshToken: 'private-token' }, env);
  assert.ok(!sealed.includes('private-token'));
  assert.deepEqual(await unseal(sealed, env), { refreshToken: 'private-token' });
  await assert.rejects(unseal(sealed, { GOOGLE_CLIENT_SECRET: 'another-secret' }));
  await assert.rejects(unseal(`${sealed}x`, env));
});

test('MIME preserves accents and body while fixing the recipient to Mr Oumar', () => {
  const mime = buildMime({ nom: 'Kévin', email: 'visiteur@example.com', sujet: 'Réunion\r\nBcc: intrus@example.com', message: 'Bonjour à vous !' });
  assert.match(mime, /To: oumar.camara@efficienceglobale.com\r\n/);
  assert.match(mime, /Reply-To: visiteur@example.com\r\n/);
  assert.ok(!mime.includes('\r\nBcc:'));
  const body = Buffer.from(mime.split('\r\n\r\n')[1].replaceAll('\r\n', ''), 'base64').toString('utf8');
  assert.equal(body, 'De : Kévin (visiteur@example.com)\n\nBonjour à vous !');
});

test('Reply-To rejects header injection', () => {
  assert.throws(() => buildMime({ nom: 'Test', email: 'x@example.com\r\nBcc: y@example.com', message: 'Test' }));
});

function db(token) {
  return { prepare(sql) { return { async first() { return sql.includes('sqlite_master') ? { name: 'gmail_connection' } : { token }; } }; } };
}

test('Gmail remains disabled until credentials and a connection exist', async () => {
  assert.equal(await isGmailConnected({}), false);
  assert.equal(await isGmailConnected({ ...env, DB: { prepare() { return { first: async () => null }; } } }), false);
});

test('Gmail refreshes server-side and sends only to Mr Oumar', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  const token = await seal({ refreshToken: 'refresh-test' }, env);
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.includes('oauth2')) return Response.json({ access_token: 'access-test', scope: GMAIL_SCOPE });
    return Response.json({ id: 'accepted-message' });
  };
  try {
    await sendGmail({ ...env, DB: db(token) }, { nom: 'Test', email: 'a@example.com', sujet: 'Test', message: 'Bonjour' });
    assert.equal(calls.length, 2);
    assert.equal(calls[0].options.body.get('refresh_token'), 'refresh-test');
    assert.equal(calls[1].options.headers.Authorization, 'Bearer access-test');
    const raw = Buffer.from(JSON.parse(calls[1].options.body).raw, 'base64url').toString();
    assert.match(raw, /To: oumar.camara@efficienceglobale.com/);
  } finally { globalThis.fetch = originalFetch; }
});

test('Revoked Google authorization fails without attempting delivery', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({ error: 'invalid_grant' }, { status: 400 }); };
  try {
    const token = await seal({ refreshToken: 'revoked' }, env);
    await assert.rejects(sendGmail({ ...env, DB: db(token) }, { nom: 'Test', email: 'a@example.com', message: 'Test' }));
    assert.equal(calls, 1);
  } finally { globalThis.fetch = originalFetch; }
});
