const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp, escapeHtml, cssColor, cssBorderRadius, maskSecret } = require('../src/app');

const API_KEY = 'sk-test-0123456789abcd';

let server;
let baseUrl;

before(async () => {
  const app = createApp({ color: 'azul', forma: 'redonda', API_KEY, APP_VERSION: 'sha-test' });
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
  assert.match(body, /class="swatch"[^>]*background:blue;border-radius:50%/);
  assert.match(body, /Forma: redonda/);
  assert.match(body, /API key: ••••••abcd/);
  assert.match(body, /Version: sha-test/);
  assert.match(body, /Build Pipeline: GitHub Actions/);
  assert.ok(!body.includes(API_KEY), 'la pagina no debe mostrar la API key completa');
});

test('GET /api/info devuelve la configuracion en JSON', async () => {
  const res = await fetch(`${baseUrl}/api/info`);
  const info = await res.json();
  assert.equal(info.color, 'azul');
  assert.equal(info.forma, 'redonda');
  assert.equal(info.apiKey, '••••••abcd');
  assert.equal(info.apiKeyConfigured, true);
  assert.equal(info.version, 'sha-test');
  assert.ok(!JSON.stringify(info).includes(API_KEY), '/api/info no debe exponer la API key');
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
    assert.equal(info.apiKey, 'no configurada');
    assert.equal(info.apiKeyConfigured, false);
    assert.equal(info.version, 'dev');
  } finally {
    local.close();
  }
});

test('cssColor traduce el nombre del color y usa gris si no lo conoce', () => {
  assert.equal(cssColor('rojo'), 'red');
  assert.equal(cssColor('Rojo'), 'red');
  assert.equal(cssColor('sin definir'), 'gray');
});

test('cssBorderRadius dibuja un circulo solo para la forma redonda', () => {
  assert.equal(cssBorderRadius('redonda'), '50%');
  assert.equal(cssBorderRadius('cuadrada'), '0');
});

test('maskSecret solo deja ver los ultimos 4 caracteres de claves largas', () => {
  assert.equal(maskSecret(undefined), 'no configurada');
  assert.equal(maskSecret(''), 'no configurada');
  assert.equal(maskSecret('corta'), '••••••');
  assert.equal(maskSecret('0123456789ab'), '••••••89ab');
});

test('escapeHtml neutraliza HTML en los valores', () => {
  assert.equal(escapeHtml('<b>"x"</b>'), '&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
});
