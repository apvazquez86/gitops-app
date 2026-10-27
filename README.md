# gitops-app

Aplicación de ejemplo (Node.js + Express) del laboratorio GitOps. Este repo es el **repositorio de código de la app**. Los manifiestos de despliegue viven en [apvazquez86/gitops](https://github.com/apvazquez86/gitops).

## Endpoints

| Ruta | Descripción |
|---|---|
| `/` | Página HTML con `color`, `forma`, versión y pod |
| `/api/info` | Lo mismo en JSON |
| `/healthz` | Health check para las probes de Kubernetes |

Variables de entorno: `color` y `forma` (vienen del ConfigMap `nginx-settings`, definido en `settings` de los values del chart), `DB_PASSWORD` (viene del Secret `nginx-secrets`, que el controller de Sealed Secrets genera a partir de un SealedSecret; **la página la muestra en claro solo porque es un lab**, `/api/info` no la devuelve), `APP_VERSION` (la fija el build) y `PORT` (por defecto 8080).

## Desarrollo local

```bash
npm install
npm test
color=azul forma=redonda npm start   # http://localhost:8080
```

## Pipeline (`.github/workflows/ci.yml`)

1. **test**: `npm ci` + `npm test` en cada push y PR.
2. **build**: solo en `main`. Construye la imagen multi-arquitectura (`linux/amd64`, `linux/arm64`) y la publica en `ghcr.io/apvazquez86/gitops-app:sha-<commit>`.
3. **promote**: abre un PR en `apvazquez86/gitops` que actualiza `image.tag` en `chart/values-dev.yaml`. Al mergearlo, Argo CD despliega en dev. Prod se promueve aparte, desde el repo `gitops`.

El paso **promote** necesita el secret `GITOPS_TOKEN`: un fine-grained token con permisos *Contents* y *Pull requests* (lectura y escritura) solo sobre el repo `gitops`.
