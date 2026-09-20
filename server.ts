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
  const spaDocuments = new Map<string, string>([
    ['/', 'index.html'],
    ['/about', 'about.html'],
    ['/academics', 'academics.html'],
    ['/admission', 'admission.html'],
    ['/hostel', 'hostel.html'],
    ['/gallery', 'gallery.html'],
    ['/contact', 'contact.html'],
    ['/privacy', 'privacy.html'],
    ['/login', 'login.html'],
    ['/clerk/login', 'login.html'],
    ['/admin/login', 'login.html'],
    ['/principal/login', 'login.html'],
    ['/register', 'register.html'],
    ['/forgot-password', 'forgot-password.html'],
  ]);
  app.get('*', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache');

    const normalizedPath = req.path.length > 1 ? req.path.replace(/\/+$/, '') : req.path;
    if (normalizedPath !== req.path) {
      const queryStart = req.originalUrl.indexOf('?');
      const query = queryStart >= 0 ? req.originalUrl.slice(queryStart) : '';
      res.redirect(308, `${normalizedPath}${query}`);
      return;
    }

    const portalRoute = normalizedPath === '/portal' || normalizedPath.startsWith('/portal/');
    const documentName = portalRoute ? 'portal.html' : spaDocuments.get(normalizedPath);
    res.status(documentName ? 200 : 404).sendFile(resolve(distPath, documentName || '404.html'));
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
