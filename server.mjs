// Lightweight production static server for Azure App Service (Linux/Node).
// Replaces `pm2 serve`, which ignores serve.json and cannot set custom
// headers or apply compression. Everything header- and cache-related comes
// from public/serve.json (deployed to wwwroot alongside index.html).
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import compression from 'compression';
import handler from 'serve-handler';

const ROOT = resolve(process.cwd(), 'browser');
const PORT = Number(process.env.PORT) || 8080;

// `compression` is Express-style middleware; adapt it to a Promise.
const compress = compression();
const applyCompression = (req, res) =>
  new Promise((resolveMw) => {
    compress(req, res, () => resolveMw());
  });

const server = createServer(async (req, res) => {
  await applyCompression(req, res);

  // SPA fallback: rewrite unknown paths to /index.html so deep links work.
  await handler(req, res, {
    public: ROOT,
    rewrites: [{ source: '**', destination: '/index.html' }],
  });
});

server.listen(PORT, () => {
  console.log(`[server] listening on http://0.0.0.0:${PORT} (root=${ROOT})`);
});

// Graceful shutdown for Azure deploy slot swaps.
const shutdown = (signal) => {
  console.log(`[server] received ${signal}, closing`);
  server.close(() => process.exit(0));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
