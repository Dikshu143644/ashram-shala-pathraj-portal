import 'dotenv/config';
import { resolve } from 'node:path';
import type { Request, Response } from 'express';
import { createApiApp } from './server/app.js';

const app = createApiApp();
const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = resolve(process.cwd(), 'dist');
  app.use((await import('express')).default.static(distPath, {
    index: false,
    maxAge: '1h',
  }));
  app.get('*', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(resolve(distPath, 'index.html'));
  });
}

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port} (${isProduction ? 'production' : 'development'})`);
});

let draining = false;
function shutdown(signal: string): void {
  if (draining) return;
  draining = true;
  console.log(`${signal} received; draining HTTP connections`);
  server.close((error) => {
    if (error) {
      console.error('Graceful shutdown failed:', error);
      process.exitCode = 1;
    }
  });
  setTimeout(() => {
    console.error('Graceful shutdown deadline exceeded');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
