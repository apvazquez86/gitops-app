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

// Spanish color names from the Secret mapped to CSS colors for the swatch.
const CSS_COLORS = {
  rojo: 'red',
  azul: 'blue',
  verde: 'green',
  amarillo: 'gold',
  naranja: 'orange',
  negro: 'black',
  blanco: 'white',
};

function cssColor(color) {
  return CSS_COLORS[String(color).toLowerCase()] || 'gray';
}

// "redonda" draws the swatch as a circle; any other shape keeps it square.
function cssBorderRadius(forma) {
  return String(forma).toLowerCase() === 'redonda' ? '50%' : '0';
}

// Settings come from the environment: color/forma from the nginx-settings
// ConfigMap (envFrom) and APP_VERSION baked into the image by the CI build.
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
    <p>Build Pipeline: GitHub Actions &rarr; GHCR &rarr; PR en gitops &rarr; Argo CD</p>
    <p>Color: ${escapeHtml(settings.color)}</p>
    <div class="swatch" style="width:120px;height:120px;border:1px solid #000;background:${cssColor(settings.color)};border-radius:${cssBorderRadius(settings.forma)}"></div>
    <p>Forma: ${escapeHtml(settings.forma)}</p>
    <hr>
    <p>Version: ${escapeHtml(settings.version)} &middot; Pod: ${escapeHtml(settings.hostname)}</p>
  </body>
</html>
`);
  });

  return app;
}

module.exports = { createApp, escapeHtml, cssColor, cssBorderRadius };
