const os = require('node:os');
const express = require('express');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Settings come from the environment: color/forma from the nginx-settings
// Secret (envFrom) and APP_VERSION baked into the image by the CI build.
function readSettings(env) {
  return {
    color: env.color || 'sin definir',
    forma: env.forma || 'sin definir',
    version: env.APP_VERSION || 'dev',
    hostname: os.hostname(),
  };
}

function createApp(env = process.env) {
  const settings = readSettings(env);
  const app = express();

  app.disable('x-powered-by');

  app.get('/healthz', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/info', (req, res) => {
    res.json(settings);
  });

  app.get('/', (req, res) => {
    res.type('html').send(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>GitOps demo</title>
  </head>
  <body>
    <h1>Aplicacion actualizada por GitOps</h1>
    <p>Color: ${escapeHtml(settings.color)}</p>
    <p>Forma: ${escapeHtml(settings.forma)}</p>
    <hr>
    <p>Version: ${escapeHtml(settings.version)} &middot; Pod: ${escapeHtml(settings.hostname)}</p>
  </body>
</html>
`);
  });

  return app;
}

module.exports = { createApp, escapeHtml };
