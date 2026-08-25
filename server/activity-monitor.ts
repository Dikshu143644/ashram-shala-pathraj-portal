/**
 * Real-Time Activity Monitor
 * Middleware that tracks all user actions and sends a 15-minute digest to admin via WhatsApp.
 */

import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { readSession, requireSession, type AuthenticatedRequest } from './security.js';
import { sendAdminNotification } from './whatsapp-notify.js';

/**
 * Middleware that logs user actions to activity_logs table.
 * Skips logging for the web_creator role.
 */
export function activityLogMiddleware(supabase: SupabaseClient): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Decode the session cookie directly; authSession is only set later by requireSession()
    const session = readSession(req);

    // Skip if no session or if user is web_creator
    if (!session || session.role === 'web_creator') {
      next();
      return;
    }

    // Determine action from method + path
    const method = req.method.toUpperCase();
    const path = req.path;
    let action = `${method} ${path}`;

    // Classify action type
    if (path.includes('/auth/login')) action = 'login';
    else if (path.includes('/auth/logout')) action = 'logout';
    else if (method === 'POST' && path.includes('/gallery')) action = 'upload';
    else if (method === 'DELETE') action = 'deletion';
    else if (method === 'POST' || method === 'PUT' || method === 'PATCH') action = 'form_submission';
    else if (method === 'GET') action = 'page_view';

    // Log asynchronously without blocking the request
    void supabase.from('activity_logs').insert({
      user_id: session.userId,
      username: session.username,
      role: session.role,
      action,
      details: {
        method,
        path,
        query: req.query,
      },
      ip_address: req.ip || 'unknown',
    }).then(({ error }) => {
      if (error) {
        console.error('Activity log insert failed:', error.message);
      }
    });

    next();
  };
}

/**
 * Start the 15-minute digest timer that compiles and sends activity summary.
 * Returns the interval handle for cleanup on shutdown.
 */
function startDigestTimer(supabase: SupabaseClient): NodeJS.Timeout {
  const DIGEST_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

  return setInterval(() => {
    void sendActivityDigest(supabase);
  }, DIGEST_INTERVAL_MS);
}

async function sendActivityDigest(supabase: SupabaseClient): Promise<void> {
  try {
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('*')
      .gte('created_at', fifteenMinutesAgo.toISOString())
      .lte('created_at', now.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Activity digest query failed:', error.message);
      return;
    }

    if (!logs || logs.length === 0) {
      return; // No activity to report
    }

    // Count logins
    const logins = logs.filter((l: { action: string }) => l.action === 'login').length;

    // Key actions summary
    const actionTypes = logs.reduce((acc: Record<string, number>, log: { action: string }) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const actionList = Object.entries(actionTypes)
      .map(([action, count]) => `${action}: ${count}`)
      .slice(0, 5)
      .join(', ');

    // Check for suspicious activity (multiple failed actions, deletions, etc.)
    const deletions = logs.filter((l: { action: string }) => l.action === 'deletion').length;
    const alerts = deletions > 3 ? `${deletions} deletions detected` : 'None';

    const timeRange = `${fifteenMinutesAgo.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

    const digest = [
      '\u{1F3EB} \u0906\u0936\u094D\u0930\u092E\u0936\u093E\u0933\u093E \u092A\u093E\u0925\u0930\u091C - Activity Report',
      `\u23F0 ${timeRange}`,
      `\u{1F464} Logins: ${logins}`,
      `\u{1F4DD} Actions: ${actionList}`,
      `\u26A0\uFE0F Alerts: ${alerts}`,
    ].join('\n');

    await sendAdminNotification(digest);
  } catch (error) {
    console.error('Activity digest failed:', error instanceof Error ? error.message : error);
  }
}

/** Handle for the digest interval, exposed for graceful shutdown. */
let digestTimerHandle: NodeJS.Timeout | null = null;

/** Stop the digest timer (for graceful shutdown or testing). */
export function stopDigestTimer(): void {
  if (digestTimerHandle) {
    clearInterval(digestTimerHandle);
    digestTimerHandle = null;
  }
}

export function registerActivityMonitorRoutes(app: Express, supabase: SupabaseClient): void {
  // Start the 15-minute digest timer
  digestTimerHandle = startDigestTimer(supabase);

  // GET /api/admin/activity-logs - Returns recent activity logs for admins
  app.get(
    '/api/admin/activity-logs',
    requireSession(['web_creator', 'principal']),
    async (req: Request, res: Response) => {
      try {
        const { user, action, from: fromDate, to: toDate, page: pageStr, perPage: perPageStr } = req.query;

        const parsedPage = Number.parseInt(typeof pageStr === 'string' ? pageStr : '1', 10);
        const parsedPerPage = Number.parseInt(typeof perPageStr === 'string' ? perPageStr : '50', 10);
        const page = Number.isFinite(parsedPage) ? Math.min(Math.max(parsedPage, 1), 10_000) : 1;
        const perPage = Number.isFinite(parsedPerPage) ? Math.min(Math.max(parsedPerPage, 1), 200) : 50;
        const offset = (page - 1) * perPage;

        let query = supabase
          .from('activity_logs')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (typeof user === 'string' && user.trim()) {
          query = query.eq('username', user.trim());
        }
        if (typeof action === 'string' && action.trim()) {
          query = query.eq('action', action.trim());
        }
        if (typeof fromDate === 'string' && fromDate.trim()) {
          query = query.gte('created_at', fromDate.trim());
        }
        if (typeof toDate === 'string' && toDate.trim()) {
          query = query.lte('created_at', toDate.trim());
        }

        const { data, error, count } = await query.range(offset, offset + perPage - 1);

        if (error) throw error;

        res.json({
          data: data || [],
          total: count || 0,
          page,
          perPage,
          totalPages: Math.ceil((count || 0) / perPage),
        });
      } catch (error) {
        console.error('Activity logs fetch failed:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Unable to load activity logs.' });
      }
    },
  );
}
