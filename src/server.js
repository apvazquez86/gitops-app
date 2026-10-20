const { createApp } = require('./app');

const port = Number(process.env.PORT) || 8080;

const server = createApp().listen(port, () => {
  console.log(`gitops-app ${process.env.APP_VERSION || 'dev'} escuchando en :${port}`);
});

// Kubernetes sends SIGTERM before killing the pod: stop accepting
// connections and exit once in-flight requests finish.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
