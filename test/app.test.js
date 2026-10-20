const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp, escapeHtml } = require('../src/app');

let server;
let baseUrl;

before(async () => {
  const app = createApp({ color: 'azul', forma: 'redonda', APP_VERSION: 'sha-test' });
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
});

test('GET /healthz responde ok', async () => {
  const res = await fetch(`${baseUrl}/healthz`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('GET / muestra los valores del Secret y la version', async () => {
  const res = await fetch(`${baseUrl}/`);
  const body = await res.text();
  assert.equal(res.status, 200);
  assert.match(body, /Color: azul/);
  assert.match(body, /Forma: redonda/);
  assert.match(body, /Version: sha-test/);
  assert.match(body, /Build Pipeline: GitHub Actions/);
});

test('GET /api/info devuelve la configuracion en JSON', async () => {
  const res = await fetch(`${baseUrl}/api/info`);
  const info = await res.json();
  assert.equal(info.color, 'azul');
  assert.equal(info.forma, 'redonda');
  assert.equal(info.version, 'sha-test');
});

test('sin variables usa valores por defecto', async () => {
  const app = createApp({});
  const local = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  try {
    const res = await fetch(`http://127.0.0.1:${local.address().port}/api/info`);
    const info = await res.json();
    assert.equal(info.color, 'sin definir');
    assert.equal(info.version, 'dev');
  } finally {
    local.close();
  }
});

test('escapeHtml neutraliza HTML en los valores', () => {
  assert.equal(escapeHtml('<b>"x"</b>'), '&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
});
