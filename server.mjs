// Lightweight production static server for Azure App Service (Linux/Node).
// Replaces `pm2 serve`, which ignores serve.json and cannot set custom
// headers or apply compression. Everything header- and cache-related comes
// from public/serve.json (deployed to wwwroot/browser/serve.json alongside
// index.html).
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import compression from 'compression';
import handler from 'serve-handler';

const ROOT = resolve(process.cwd(), 'browser');
const PORT = Number(process.env.PORT) || 8080;

// serve-handler only auto-loads serve.json when no config object is provided.
// Since we need to set `public` and SPA rewrites, we must read and merge
// serve.json ourselves so its `headers`/`rewrites`/etc. still apply.
let serveJson = {};
try {
  serveJson = JSON.parse(readFileSync(resolve(ROOT, 'serve.json'), 'utf8'));
  console.log('[server] loaded serve.json');
} catch (err) {
  console.warn('[server] could not load serve.json:', err.message);
}

const HANDLER_CONFIG = {
  ...serveJson,
  public: ROOT,
  rewrites: [...(serveJson.rewrites ?? []), { source: '**', destination: '/index.html' }],
};

// `compression` is Express-style middleware; adapt it to a Promise.
const compress = compression();
const applyCompression = (req, res) =>
  new Promise((resolveMw) => {
    compress(req, res, () => resolveMw());
  });

const server = createServer(async (req, res) => {
  await applyCompression(req, res);
  await handler(req, res, HANDLER_CONFIG);
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
