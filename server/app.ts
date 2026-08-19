import express from 'express';
import { createClient } from '@supabase/supabase-js';
import type { NextFunction, Request, Response } from 'express';
import { registerAuthRoutes } from './auth.js';
import { registerDataRoutes } from './data.js';
import { registerAgentRoutes } from './agents.js';
import { configureSecurity, durableRateLimit } from './security.js';

export function createApiApp() {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const app = express();
  configureSecurity(app);
  app.use(express.json({ limit: '10kb', strict: true }));

  app.get('/api/health/live', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ status: 'alive', service: 'ashram-portal-api', timestamp: new Date().toISOString() });
  });

  const readiness = async (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const databaseCheck = supabase.from('auth_users').select('id').limit(1);
      const timeout = new Promise<never>((_resolve, reject) => {
        setTimeout(() => reject(new Error('Database readiness check timed out')), 3_000);
      });
      const { error } = await Promise.race([databaseCheck, timeout]);
      if (error) throw error;
      res.json({ status: 'ready', database: 'reachable', timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Readiness check failed:', error instanceof Error ? error.message : error);
      res.status(503).json({ status: 'not_ready', database: 'unavailable', timestamp: new Date().toISOString() });
    }
  };
  app.get('/api/health/ready', readiness);
  app.get('/api/health', readiness);

  app.use('/api', durableRateLimit(supabase, {
    bucket: 'api_global_ip',
    maximum: Number(process.env.API_RATE_LIMIT_PER_MINUTE || 180),
    windowSeconds: 60,
  }));

  registerAuthRoutes(app, supabase);
  registerDataRoutes(app, supabase);
  registerAgentRoutes(app, supabase);

  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: 'Invalid JSON request body.' });
      return;
    }
    console.error('Unhandled API error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}
