import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  concurrencyGate,
  durableRateLimit,
  requireSameOrigin,
  requireSession,
  type AuthenticatedRequest,
} from './security.js';

const READ_ROLES = ['web_creator', 'principal', 'class_teacher', 'clerk', 'subject_teacher', 'student_parent'];
const WRITE_ROLES = ['web_creator', 'principal', 'clerk'];
const CREATE_STUDENT_ROLES = [...WRITE_ROLES, 'student_parent'];
const dataGate = concurrencyGate(Number(process.env.MAX_DATA_CONCURRENCY || 32), 'Database service');

function pagination(req: Request): { page: number; perPage: number; from: number; to: number } {
  const parsedPage = Number.parseInt(typeof req.query.page === 'string' ? req.query.page : '1', 10);
  const parsedPerPage = Number.parseInt(typeof req.query.perPage === 'string' ? req.query.perPage : '50', 10);
  const page = Number.isFinite(parsedPage) ? Math.min(Math.max(parsedPage, 1), 10_000) : 1;
  const perPage = Number.isFinite(parsedPerPage) ? Math.min(Math.max(parsedPerPage, 1), 100) : 50;
  const from = (page - 1) * perPage;
  return { page, perPage, from, to: from + perPage - 1 };
}

function boundedText(value: unknown, maximum: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maximum;
}

function auditActor(req: Request): { user_id?: string; username?: string; ip_address?: string } {
  const authReq = req as AuthenticatedRequest;
  return {
    user_id: authReq.authSession?.userId,
    username: authReq.authSession?.username,
    ip_address: req.ip,
  };
}

export function registerDataRoutes(app: Express, supabase: SupabaseClient): void {
  const readLimit = durableRateLimit(supabase, {
    bucket: 'api_read_account',
    maximum: 120,
    windowSeconds: 60,
    key: (req) => req.authSession?.userId || String(req.ip || 'unknown'),
  });
  const writeLimit = durableRateLimit(supabase, {
    bucket: 'api_write_account',
    maximum: 30,
    windowSeconds: 5 * 60,
    key: (req) => req.authSession?.userId || String(req.ip || 'unknown'),
  });

  // GET /api/school/stats - Public endpoint returning school-wide statistics
  app.get('/api/school/stats', dataGate, async (_req: Request, res: Response) => {
    try {
      const [studentsResult, staffResult, standardsResult, villagesResult, enrolledResult] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('staff').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('standard'),
        supabase.from('students').select('village'),
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
      ]);

      const totalStudents = studentsResult.count || 0;
      const totalStaff = staffResult.count || 0;

      // Count distinct standards
      const standards = new Set((standardsResult.data || []).map((r: { standard: string }) => r.standard).filter(Boolean));
      const totalStandards = standards.size;

      // Count distinct villages
      const villages = new Set((villagesResult.data || []).map((r: { village: string }) => r.village).filter(Boolean));
      const totalVillages = villages.size;

      // Enrolled count: use Active status count, fall back to total if none have Active status
      const enrolledCount = (enrolledResult.count || 0) > 0 ? (enrolledResult.count || 0) : totalStudents;

      res.json({
        totalStudents,
        totalStaff,
        totalStandards,
        totalVillages,
        enrolledCount,
      });
    } catch (error) {
      console.error('School stats fetch failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to load school statistics.' });
    }
  });

  app.get('/api/students', requireSession(READ_ROLES), readLimit, dataGate, async (req: Request, res: Response) => {
    const { page, perPage, from, to } = pagination(req);
    const session = (req as AuthenticatedRequest).authSession;

    try {
      let query = supabase.from('students').select('*', { count: 'exact' });

      // Parent role: restrict to linked students only
      if (session?.role === 'student_parent') {
        const { data: userRow } = await supabase
          .from('auth_users')
          .select('parent_student_ids')
          .eq('id', session.userId)
          .maybeSingle();
        const parentStudentIds: string[] = userRow?.parent_student_ids || [];
        if (parentStudentIds.length === 0) {
          res.json({ data: [], total: 0, page, perPage, totalPages: 0 });
          return;
        }
        query = query.in('id', parentStudentIds);
      }

      const { standard, search } = req.query;
      if (typeof standard === 'string' && standard.length <= 20) query = query.eq('standard', standard);
      if (typeof search === 'string' && search.length <= 100) {
        const sanitizedSearch = search.replace(/[,.()"\\%_]/g, '').trim();
        if (sanitizedSearch) {
          query = query.or(`full_name.ilike.%${sanitizedSearch}%,guardian_name.ilike.%${sanitizedSearch}%,village.ilike.%${sanitizedSearch}%`);
        }
      }

      const { data, error, count } = await query.order('sr_no', { ascending: true }).range(from, to);
      if (error) throw error;
      res.json({
        data: data || [],
        total: count || 0,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      });
    } catch (error) {
      console.error('Student read failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to load student records.' });
    }
  });

  app.get('/api/staff', requireSession(READ_ROLES), readLimit, dataGate, async (req: Request, res: Response) => {
    const { page, perPage, from, to } = pagination(req);
    try {
      const { data, error, count } = await supabase
        .from('staff')
        .select('*', { count: 'exact' })
        .order('full_name', { ascending: true })
        .range(from, to);
      if (error) throw error;
      res.json({ data: data || [], total: count || 0, page, perPage, totalPages: Math.ceil((count || 0) / perPage) });
    } catch (error) {
      console.error('Staff read failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to load staff records.' });
    }
  });

  app.post('/api/students', requireSameOrigin, requireSession(CREATE_STUDENT_ROLES), writeLimit, dataGate, async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    if (!boundedText(body.full_name, 160) || !boundedText(body.standard, 20)) {
      res.status(400).json({ error: 'A valid full_name and standard are required.' });
      return;
    }

    const studentData: Record<string, unknown> = {
      full_name: body.full_name.trim(),
      standard: body.standard.trim(),
    };
    const allowedFields: Record<string, number> = {
      date_of_birth: 10,
      blood_group: 8,
      apaar_id: 32,
      mobile_number: 20,
      guardian_name: 160,
      village: 120,
      taluka: 120,
      district: 120,
      pincode: 10,
      guardian_mobile: 20,
      guardian_relation: 80,
      status: 30,
    };
    for (const [field, maximum] of Object.entries(allowedFields)) {
      const value = body[field];
      if (value !== undefined) {
        if (typeof value !== 'string' || value.length > maximum) {
          res.status(400).json({ error: `Invalid ${field}.` });
          return;
        }
        studentData[field] = value.trim();
      }
    }

    const session = (req as AuthenticatedRequest).authSession;
    if (session?.role === 'student_parent') studentData.status = 'Pending';

    try {
      const { data, error } = await supabase.from('students').insert(studentData).select().single();
      if (error) throw error;
      await supabase.from('security_logs').insert({
        action: 'student_created',
        details: `Student record created (${data.id})`,
        ...auditActor(req),
      });
      res.status(201).json({ data });
    } catch (error) {
      console.error('Student create failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to create student record.' });
    }
  });

  app.put('/api/students/:id', requireSameOrigin, requireSession(WRITE_ROLES), writeLimit, dataGate, async (req: Request, res: Response) => {
    const id = String(req.params.id || '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      res.status(400).json({ error: 'Invalid student ID.' });
      return;
    }
    const allowedFields: Record<string, number> = {
      full_name: 160,
      standard: 20,
      date_of_birth: 10,
      blood_group: 8,
      apaar_id: 32,
      mobile_number: 20,
      guardian_name: 160,
      village: 120,
      taluka: 120,
      district: 120,
      pincode: 10,
      guardian_mobile: 20,
      guardian_relation: 80,
      status: 30,
    };
    const updates: Record<string, unknown> = {};
    for (const [field, maximum] of Object.entries(allowedFields)) {
      const value = req.body[field];
      if (value !== undefined) {
        if (typeof value !== 'string' || value.length > maximum) {
          res.status(400).json({ error: `Invalid ${field}.` });
          return;
        }
        updates[field] = value.trim();
      }
    }
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No valid fields supplied.' });
      return;
    }
    updates.updated_at = new Date().toISOString();

    try {
      const { data, error } = await supabase.from('students').update(updates).eq('id', id).select().maybeSingle();
      if (error) throw error;
      if (!data) {
        res.status(404).json({ error: 'Student not found.' });
        return;
      }
      await supabase.from('security_logs').insert({ action: 'student_updated', details: `Student record updated (${id})`, ...auditActor(req) });
      res.json({ data });
    } catch (error) {
      console.error('Student update failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to update student record.' });
    }
  });

  app.delete('/api/students/:id', requireSameOrigin, requireSession(WRITE_ROLES), writeLimit, dataGate, async (req: Request, res: Response) => {
    const id = String(req.params.id || '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      res.status(400).json({ error: 'Invalid student ID.' });
      return;
    }
    try {
      const { data, error } = await supabase.from('students').delete().eq('id', id).select('id').maybeSingle();
      if (error) throw error;
      if (!data) {
        res.status(404).json({ error: 'Student not found.' });
        return;
      }
      await supabase.from('security_logs').insert({ action: 'student_deleted', details: `Student record deleted (${id})`, ...auditActor(req) });
      res.status(204).send();
    } catch (error) {
      console.error('Student delete failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to delete student record.' });
    }
  });

  app.post('/api/staff', requireSameOrigin, requireSession(WRITE_ROLES), writeLimit, dataGate, async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    if (!boundedText(body.full_name, 160) || !boundedText(body.designation, 120)) {
      res.status(400).json({ error: 'A valid full_name and designation are required.' });
      return;
    }
    const staffData: Record<string, unknown> = { full_name: body.full_name.trim(), designation: body.designation.trim() };
    const optionalFields: Record<string, number> = { department: 120, mobile_number: 20, email: 320, joining_date: 10, status: 30 };
    for (const [field, maximum] of Object.entries(optionalFields)) {
      const value = body[field];
      if (value !== undefined) {
        if (typeof value !== 'string' || value.length > maximum) {
          res.status(400).json({ error: `Invalid ${field}.` });
          return;
        }
        staffData[field] = value.trim();
      }
    }
    try {
      const { data, error } = await supabase.from('staff').insert(staffData).select().single();
      if (error) throw error;
      await supabase.from('security_logs').insert({ action: 'staff_created', details: `Staff record created (${data.id})`, ...auditActor(req) });
      res.status(201).json({ data });
    } catch (error) {
      console.error('Staff create failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to create staff record.' });
    }
  });

  app.put('/api/staff/:id', requireSameOrigin, requireSession(WRITE_ROLES), writeLimit, dataGate, async (req: Request, res: Response) => {
    const id = String(req.params.id || '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      res.status(400).json({ error: 'Invalid staff ID.' });
      return;
    }
    const allowedFields: Record<string, number> = { full_name: 160, designation: 120, department: 120, mobile_number: 20, email: 320, joining_date: 10, status: 30 };
    const updates: Record<string, unknown> = {};
    for (const [field, maximum] of Object.entries(allowedFields)) {
      const value = req.body[field];
      if (value !== undefined) {
        if (typeof value !== 'string' || value.length > maximum) {
          res.status(400).json({ error: `Invalid ${field}.` });
          return;
        }
        updates[field] = value.trim();
      }
    }
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No valid fields supplied.' });
      return;
    }
    try {
      const { data, error } = await supabase.from('staff').update(updates).eq('id', id).select().maybeSingle();
      if (error) throw error;
      if (!data) {
        res.status(404).json({ error: 'Staff member not found.' });
        return;
      }
      await supabase.from('security_logs').insert({ action: 'staff_updated', details: `Staff record updated (${id})`, ...auditActor(req) });
      res.json({ data });
    } catch (error) {
      console.error('Staff update failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to update staff record.' });
    }
  });

  app.delete('/api/staff/:id', requireSameOrigin, requireSession(WRITE_ROLES), writeLimit, dataGate, async (req: Request, res: Response) => {
    const id = String(req.params.id || '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      res.status(400).json({ error: 'Invalid staff ID.' });
      return;
    }
    try {
      const { data, error } = await supabase.from('staff').delete().eq('id', id).select('id').maybeSingle();
      if (error) throw error;
      if (!data) {
        res.status(404).json({ error: 'Staff member not found.' });
        return;
      }
      await supabase.from('security_logs').insert({ action: 'staff_deleted', details: `Staff record deleted (${id})`, ...auditActor(req) });
      res.status(204).send();
    } catch (error) {
      console.error('Staff delete failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to delete staff record.' });
    }
  });

  // GET /api/gallery - Public endpoint, returns all gallery images
  app.get('/api/gallery', async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json({ data: data || [] });
    } catch (error) {
      console.error('Gallery fetch failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to load gallery images.' });
    }
  });

  // POST /api/gallery - Requires web_creator or principal role
  app.post('/api/gallery', requireSameOrigin, requireSession(['web_creator', 'principal']), writeLimit, dataGate, async (req: Request, res: Response) => {
    const session = (req as AuthenticatedRequest).authSession!;
    const { url, caption } = req.body as { url?: unknown; caption?: unknown };
    if (typeof url !== 'string' || !url.trim() || url.length > 2048) {
      res.status(400).json({ error: 'A valid image URL is required (max 2048 characters).' });
      return;
    }
    if (!/^https?:\/\//i.test(url.trim())) {
      res.status(400).json({ error: 'Image URL must start with https:// or http://.' });
      return;
    }
    const safeCaption = typeof caption === 'string' && caption.trim().length > 0 ? caption.trim().slice(0, 500) : null;
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .insert({ url: url.trim(), caption: safeCaption, uploaded_by: session.userId })
        .select()
        .single();
      if (error) throw error;
      await supabase.from('security_logs').insert({ action: 'gallery_image_added', details: `Gallery image added (${data.id})`, ...auditActor(req) });
      res.status(201).json({ data });
    } catch (error) {
      console.error('Gallery insert failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to add gallery image.' });
    }
  });

  // DELETE /api/gallery/:id - Requires web_creator or principal role
  app.delete('/api/gallery/:id', requireSameOrigin, requireSession(['web_creator', 'principal']), writeLimit, dataGate, async (req: Request, res: Response) => {
    const id = String(req.params.id || '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      res.status(400).json({ error: 'Invalid gallery image ID.' });
      return;
    }
    try {
      // Fetch image first to get storage_path for cleanup
      const { data: imageData } = await supabase.from('gallery_images').select('id,storage_path').eq('id', id).maybeSingle();
      if (!imageData) {
        res.status(404).json({ error: 'Gallery image not found.' });
        return;
      }

      // Delete from Supabase Storage if storage_path exists
      if (imageData.storage_path) {
        const { error: storageError } = await supabase.storage.from('school-gallery').remove([imageData.storage_path]);
        if (storageError) {
          console.error(`Storage deletion failed for ${imageData.storage_path}:`, storageError.message);
          // Proceed with DB deletion even if storage cleanup fails (orphaned object is acceptable)
        }
      }

      const { error } = await supabase.from('gallery_images').delete().eq('id', id);
      if (error) throw error;
      await supabase.from('security_logs').insert({ action: 'gallery_image_deleted', details: `Gallery image deleted (${id})`, ...auditActor(req) });
      res.status(204).send();
    } catch (error) {
      console.error('Gallery delete failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to delete gallery image.' });
    }
  });

  // POST /api/gallery/upload - Upload image to Supabase Storage (base64 JSON body)
  app.post('/api/gallery/upload', requireSameOrigin, requireSession(['web_creator', 'principal']), writeLimit, dataGate, async (req: Request, res: Response) => {
    const session = (req as AuthenticatedRequest).authSession!;
    const { image, filename, caption } = req.body as { image?: unknown; filename?: unknown; caption?: unknown };

    if (typeof image !== 'string' || !image.trim()) {
      res.status(400).json({ error: 'Base64 encoded image data is required.' });
      return;
    }
    if (typeof filename !== 'string' || !filename.trim() || filename.length > 255) {
      res.status(400).json({ error: 'A valid filename is required (max 255 characters).' });
      return;
    }

    // Validate base64 and extract content type
    const base64Match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    let imageBuffer: Buffer;
    let contentType: string;

    // Allowlist safe image content types (reject svg+xml and other dangerous types)
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (base64Match) {
      contentType = base64Match[1];
      if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
        res.status(400).json({ error: 'Only JPEG, PNG, WebP, and GIF images are allowed.' });
        return;
      }
      imageBuffer = Buffer.from(base64Match[2], 'base64');
    } else {
      // Assume raw base64 without data URI prefix
      contentType = 'image/jpeg';
      imageBuffer = Buffer.from(image, 'base64');
    }

    // Validate file size (max 10MB)
    if (imageBuffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'Image too large. Maximum 10MB allowed.' });
      return;
    }

    const safeCaption = typeof caption === 'string' && caption.trim().length > 0 ? caption.trim().slice(0, 500) : null;
    const storagePath = `gallery/${Date.now()}-${filename.trim().replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('school-gallery')
        .upload(storagePath, imageBuffer, {
          contentType,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('school-gallery')
        .getPublicUrl(storagePath);

      const publicUrl = urlData?.publicUrl || '';

      // Insert metadata into gallery_images
      const { data, error: insertError } = await supabase
        .from('gallery_images')
        .insert({
          url: publicUrl,
          storage_path: storagePath,
          caption: safeCaption,
          uploaded_by: session.userId,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase.from('security_logs').insert({
        action: 'gallery_image_added',
        details: `Gallery image uploaded via storage (${data.id})`,
        ...auditActor(req),
      });

      res.status(201).json({ data });
    } catch (error) {
      console.error('Gallery upload failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to upload gallery image.' });
    }
  });

  // Public submission rate limiter (IP-based since no auth required)
  const publicWriteLimit = durableRateLimit(supabase, {
    bucket: 'api_public_write_ip',
    maximum: 5,
    windowSeconds: 10 * 60,
    key: (req) => String(req.ip || 'unknown'),
  });

  // POST /api/applications - Public endpoint for admission application submission
  app.post('/api/applications', publicWriteLimit, dataGate, async (req: Request, res: Response) => {
    const { applicant_name, parent_name, parent_mobile, parent_email, standard_applying } = req.body as {
      applicant_name?: unknown; parent_name?: unknown; parent_mobile?: unknown; parent_email?: unknown; standard_applying?: unknown;
    };

    if (typeof applicant_name !== 'string' || !applicant_name.trim() || applicant_name.length > 200) {
      res.status(400).json({ error: 'Applicant name is required (max 200 characters).' });
      return;
    }
    if (typeof parent_name !== 'string' || !parent_name.trim() || parent_name.length > 200) {
      res.status(400).json({ error: 'Parent name is required (max 200 characters).' });
      return;
    }
    if (typeof parent_mobile !== 'string' || !/^[6-9]\d{9}$/.test(parent_mobile)) {
      res.status(400).json({ error: 'A valid 10-digit mobile number is required.' });
      return;
    }

    const safeEmail = typeof parent_email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent_email) ? parent_email.trim() : null;
    const safeStandard = typeof standard_applying === 'number' && standard_applying >= 1 && standard_applying <= 12 ? standard_applying : null;

    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          applicant_name: applicant_name.trim(),
          parent_name: parent_name.trim(),
          parent_mobile: parent_mobile.trim(),
          parent_email: safeEmail,
          standard_applying: safeStandard,
        })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json({ data });
    } catch (error) {
      console.error('Application submission failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to submit application.' });
    }
  });

  // GET /api/applications - Admin endpoint to list all applications
  app.get('/api/applications', requireSession(['web_creator', 'principal', 'clerk']), readLimit, dataGate, async (req: Request, res: Response) => {
    const { page, perPage, from, to } = pagination(req);
    try {
      const { data, error, count } = await supabase
        .from('applications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      res.json({
        data: data || [],
        total: count || 0,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      });
    } catch (error) {
      console.error('Applications fetch failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to load applications.' });
    }
  });

  // GET /api/admin/security-logs - Requires web_creator or principal role
  app.get('/api/admin/security-logs', requireSession(['web_creator', 'principal']), readLimit, dataGate, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      res.json({ data: data || [] });
    } catch (error) {
      console.error('Security logs fetch failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to load security logs.' });
    }
  });

  // GET /api/parent/my-children - Returns only the parent's linked students
  app.get('/api/parent/my-children', requireSession(['student_parent']), readLimit, dataGate, async (req: Request, res: Response) => {
    const session = (req as AuthenticatedRequest).authSession!;
    try {
      const { data: userRow } = await supabase
        .from('auth_users')
        .select('parent_student_ids')
        .eq('id', session.userId)
        .maybeSingle();

      const parentStudentIds: string[] = userRow?.parent_student_ids || [];
      if (parentStudentIds.length === 0) {
        res.json({ data: [], total: 0 });
        return;
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .in('id', parentStudentIds)
        .order('sr_no', { ascending: true });

      if (error) throw error;
      res.json({ data: data || [], total: (data || []).length });
    } catch (error) {
      console.error('Parent children fetch failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Unable to load student records.' });
    }
  });
}
