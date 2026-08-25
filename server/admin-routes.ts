/**
 * Admin Routes
 * Event approval, audit logs with filters, application approve/reject, link parent.
 */

import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireSameOrigin, requireSession, type AuthenticatedRequest } from './security.js';
import { sendAdminNotification } from './whatsapp-notify.js';

const ADMIN_ROLES = ['web_creator', 'principal'];

export function registerAdminRoutes(app: Express, supabase: SupabaseClient): void {
  // ===================== EVENT APPROVALS =====================

  // GET /api/admin/events - List events (defaults to pending)
  app.get(
    '/api/admin/events',
    requireSession(ADMIN_ROLES),
    async (req: Request, res: Response) => {
      try {
        const status = typeof req.query.status === 'string' ? req.query.status : 'pending';

        let query = supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json({ data: data || [] });
      } catch (error) {
        console.error('Events fetch failed:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Unable to load events.' });
      }
    },
  );

  // POST /api/admin/events - Create a new event
  app.post(
    '/api/admin/events',
    requireSameOrigin,
    requireSession(['web_creator', 'principal', 'class_teacher']),
    async (req: Request, res: Response) => {
      const session = (req as AuthenticatedRequest).authSession!;
      const { title, description, event_date } = req.body as {
        title?: unknown;
        description?: unknown;
        event_date?: unknown;
      };

      if (typeof title !== 'string' || !title.trim() || title.length > 500) {
        res.status(400).json({ error: 'A valid title is required (max 500 characters).' });
        return;
      }

      const safeDescription = typeof description === 'string' ? description.trim().slice(0, 2000) : null;
      const safeEventDate = typeof event_date === 'string' && event_date.trim() ? event_date.trim() : null;

      try {
        const { data, error } = await supabase
          .from('events')
          .insert({
            title: title.trim(),
            description: safeDescription,
            event_date: safeEventDate,
            created_by: session.userId,
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;

        // Notify admin about new event
        await sendAdminNotification(
          `📅 New event created: "${title.trim()}" by ${session.username}. Awaiting approval.`,
        );

        res.status(201).json({ data });
      } catch (error) {
        console.error('Event create failed:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Unable to create event.' });
      }
    },
  );

  // PATCH /api/admin/events/:id/approve
  app.patch(
    '/api/admin/events/:id/approve',
    requireSameOrigin,
    requireSession(ADMIN_ROLES),
    async (req: Request, res: Response) => {
      const id = String(req.params.id || '');
      if (!/^[0-9a-f-]{36}$/i.test(id)) {
        res.status(400).json({ error: 'Invalid event ID.' });
        return;
      }

      const session = (req as AuthenticatedRequest).authSession!;

      try {
        const { data, error } = await supabase
          .from('events')
          .update({
            status: 'approved',
            approved_by: session.userId,
            approved_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          res.status(404).json({ error: 'Event not found.' });
          return;
        }

        await supabase.from('security_logs').insert({
          action: 'event_approved',
          user_id: session.userId,
          username: session.username,
          ip_address: req.ip,
          details: `Event approved: ${data.title}`,
        });

        await sendAdminNotification(`✅ Event approved: "${data.title}" by ${session.username}`);

        res.json({ data });
      } catch (error) {
        console.error('Event approve failed:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Unable to approve event.' });
      }
    },
  );

  // PATCH /api/admin/events/:id/reject
  app.patch(
    '/api/admin/events/:id/reject',
    requireSameOrigin,
    requireSession(ADMIN_ROLES),
    async (req: Request, res: Response) => {
      const id = String(req.params.id || '');
      if (!/^[0-9a-f-]{36}$/i.test(id)) {
        res.status(400).json({ error: 'Invalid event ID.' });
        return;
      }

      const session = (req as AuthenticatedRequest).authSession!;

      try {
        const { data, error } = await supabase
          .from('events')
          .update({ status: 'rejected' })
          .eq('id', id)
          .select()
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          res.status(404).json({ error: 'Event not found.' });
          return;
        }

        await supabase.from('security_logs').insert({
          action: 'event_rejected',
          user_id: session.userId,
          username: session.username,
          ip_address: req.ip,
          details: `Event rejected: ${data.title}`,
        });

        res.json({ data });
      } catch (error) {
        console.error('Event reject failed:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Unable to reject event.' });
      }
    },
  );

  // ===================== AUDIT LOGS =====================

  // GET /api/admin/audit-logs - Security logs with filters
  app.get(
    '/api/admin/audit-logs',
    requireSession(ADMIN_ROLES),
    async (req: Request, res: Response) => {
      try {
        const { user, action, from: fromDate, to: toDate, page: pageStr, perPage: perPageStr } = req.query;

        const parsedPage = Number.parseInt(typeof pageStr === 'string' ? pageStr : '1', 10);
        const parsedPerPage = Number.parseInt(typeof perPageStr === 'string' ? perPageStr : '50', 10);
        const page = Number.isFinite(parsedPage) ? Math.min(Math.max(parsedPage, 1), 10_000) : 1;
        const perPage = Number.isFinite(parsedPerPage) ? Math.min(Math.max(parsedPerPage, 1), 200) : 50;
        const offset = (page - 1) * perPage;

        let query = supabase
          .from('security_logs')
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
        console.error('Audit logs fetch failed:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Unable to load audit logs.' });
      }
    },
  );

  // ===================== APPLICATIONS =====================

  // PATCH /api/admin/applications/:id - Approve/reject an application
  app.patch(
    '/api/admin/applications/:id',
    requireSameOrigin,
    requireSession(ADMIN_ROLES),
    async (req: Request, res: Response) => {
      const id = String(req.params.id || '');
      if (!/^[0-9a-f-]{36}$/i.test(id)) {
        res.status(400).json({ error: 'Invalid application ID.' });
        return;
      }

      const { status } = req.body as { status?: unknown };
      const allowedStatuses = ['approved', 'rejected', 'reviewed', 'pending'];
      if (typeof status !== 'string' || !allowedStatuses.includes(status)) {
        res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
        return;
      }

      const session = (req as AuthenticatedRequest).authSession!;

      try {
        const { data, error } = await supabase
          .from('applications')
          .update({
            status,
            reviewed_by: session.userId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          res.status(404).json({ error: 'Application not found.' });
          return;
        }

        await supabase.from('security_logs').insert({
          action: `application_${status}`,
          user_id: session.userId,
          username: session.username,
          ip_address: req.ip,
          details: `Application ${id} marked as ${status}`,
        });

        if (status === 'approved') {
          await sendAdminNotification(
            `✅ Application approved: ${data.applicant_name} for class ${data.standard_applying || 'N/A'}`,
          );
        }

        res.json({ data });
      } catch (error) {
        console.error('Application update failed:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Unable to update application.' });
      }
    },
  );

  // ===================== LINK PARENT =====================

  // POST /api/admin/link-parent - Link a parent to their child's student record
  app.post(
    '/api/admin/link-parent',
    requireSameOrigin,
    requireSession(ADMIN_ROLES),
    async (req: Request, res: Response) => {
      const { parentId, studentId } = req.body as { parentId?: unknown; studentId?: unknown };

      if (typeof parentId !== 'string' || !/^[0-9a-f-]{36}$/i.test(parentId)) {
        res.status(400).json({ error: 'A valid parentId is required.' });
        return;
      }
      if (typeof studentId !== 'string' || !/^[0-9a-f-]{36}$/i.test(studentId)) {
        res.status(400).json({ error: 'A valid studentId is required.' });
        return;
      }

      const session = (req as AuthenticatedRequest).authSession!;

      try {
        // Get current parent record
        const { data: parent, error: parentError } = await supabase
          .from('auth_users')
          .select('id, parent_student_ids, role')
          .eq('id', parentId)
          .maybeSingle();

        if (parentError) throw parentError;
        if (!parent) {
          res.status(404).json({ error: 'Parent user not found.' });
          return;
        }
        if (parent.role !== 'student_parent') {
          res.status(400).json({ error: 'User is not a student_parent role.' });
          return;
        }

        // Verify student exists
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('id, full_name')
          .eq('id', studentId)
          .maybeSingle();

        if (studentError) throw studentError;
        if (!student) {
          res.status(404).json({ error: 'Student not found.' });
          return;
        }

        // Update parent_student_ids array
        const currentIds: string[] = parent.parent_student_ids || [];
        if (currentIds.includes(studentId)) {
          res.status(400).json({ error: 'Student is already linked to this parent.' });
          return;
        }

        const updatedIds = [...currentIds, studentId];
        const { error: updateError } = await supabase
          .from('auth_users')
          .update({ parent_student_ids: updatedIds })
          .eq('id', parentId);

        if (updateError) throw updateError;

        await supabase.from('security_logs').insert({
          action: 'parent_linked',
          user_id: session.userId,
          username: session.username,
          ip_address: req.ip,
          details: `Parent ${parentId} linked to student ${studentId} (${student.full_name})`,
        });

        res.json({ success: true, parentId, studentId, linkedIds: updatedIds });
      } catch (error) {
        console.error('Link parent failed:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Unable to link parent to student.' });
      }
    },
  );
}
