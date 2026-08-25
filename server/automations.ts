import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireSession, type AuthenticatedRequest } from './security.js';

interface AbsentStudent {
  id: string;
  name_mr: string;
  name_en: string;
  standard: string;
  parent_mobile: string | null;
  parent_name_mr: string | null;
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

async function sendSmsFast2sms(phone: string, message: string): Promise<boolean> {
  const apiKey = process.env.FAST2SMS_API_KEY?.trim();

  if (!apiKey) {
    console.log(`[AUTOMATION DEV MODE] SMS to ${phone}: ${message}`);
    return true;
  }

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message,
        numbers: phone,
        flash: 0,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Fast2SMS automation error (${response.status}):`, errorText.slice(0, 200));
      return false;
    }

    return true;
  } catch (error) {
    console.error('Fast2SMS automation request failed:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function logAutomation(
  supabase: SupabaseClient,
  automationName: string,
  status: string,
  details: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.from('automation_logs').insert({
    automation_name: automationName,
    status,
    details,
  });
  if (error) {
    console.error(`Automation log failed for ${automationName}:`, error.message);
  }
}

export async function sendAbsenteeNotifications(supabase: SupabaseClient): Promise<{ sent: number; failed: number }> {
  const today = todayDateString();
  let sent = 0;
  let failed = 0;

  try {
    // Query students marked absent today
    const { data: absentRecords, error: attendanceError } = await supabase
      .from('attendance')
      .select('student_id')
      .eq('date', today)
      .eq('status', 'absent');

    if (attendanceError) {
      console.error('Attendance query failed:', attendanceError.message);
      await logAutomation(supabase, 'absentee_notifications', 'error', { error: attendanceError.message });
      return { sent: 0, failed: 0 };
    }

    if (!absentRecords || absentRecords.length === 0) {
      console.log('[AUTOMATION] No absent students today.');
      await logAutomation(supabase, 'absentee_notifications', 'success', { message: 'No absent students', date: today });
      return { sent: 0, failed: 0 };
    }

    const studentIds = absentRecords.map((r: { student_id: string }) => r.student_id);

    // Get student details with parent info
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id,name_mr,name_en,standard,parent_mobile,parent_name_mr')
      .in('id', studentIds);

    if (studentError) {
      console.error('Student lookup failed:', studentError.message);
      await logAutomation(supabase, 'absentee_notifications', 'error', { error: studentError.message });
      return { sent: 0, failed: 0 };
    }

    const absentStudents = (students || []) as AbsentStudent[];

    for (const student of absentStudents) {
      if (!student.parent_mobile || !/^[6-9]\d{9}$/.test(student.parent_mobile)) {
        continue;
      }

      const parentName = student.parent_name_mr || 'पालक';
      const studentName = student.name_mr || student.name_en || 'विद्यार्थी';
      const standard = student.standard || '';

      // Marathi notification template
      const message = `नमस्कार ${parentName}, आपले पाल्य ${studentName} (इयत्ता ${standard}) आज शाळेत अनुपस्थित आहे. - आश्रमशाळा पाथरज`;

      const success = await sendSmsFast2sms(student.parent_mobile, message);

      // Record notification
      await supabase.from('parent_notifications').insert({
        student_id: student.id,
        parent_mobile: student.parent_mobile,
        message,
        channel: 'sms',
        status: success ? 'sent' : 'failed',
        sent_at: success ? new Date().toISOString() : null,
      });

      if (success) {
        sent += 1;
      } else {
        failed += 1;
      }
    }

    await logAutomation(supabase, 'absentee_notifications', 'success', {
      date: today,
      totalAbsent: absentStudents.length,
      notificationsSent: sent,
      notificationsFailed: failed,
    });
  } catch (error) {
    console.error('Absentee notification automation failed:', error instanceof Error ? error.message : error);
    await logAutomation(supabase, 'absentee_notifications', 'error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return { sent, failed };
}

export async function sendDailyDigest(supabase: SupabaseClient): Promise<void> {
  const today = todayDateString();

  try {
    // Get today's attendance stats
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select('status')
      .eq('date', today);

    if (attendanceError) {
      console.error('Daily digest attendance query failed:', attendanceError.message);
      await logAutomation(supabase, 'daily_digest', 'error', { error: attendanceError.message });
      return;
    }

    const records = attendanceData || [];
    const totalPresent = records.filter((r: { status: string }) => r.status === 'present').length;
    const totalAbsent = records.filter((r: { status: string }) => r.status === 'absent').length;
    const totalRecords = records.length;

    // Get total student count
    const { count: totalStudents } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true });

    const stats = {
      date: today,
      totalStudents: totalStudents || 0,
      attendanceRecorded: totalRecords,
      present: totalPresent,
      absent: totalAbsent,
      attendanceRate: totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0,
    };

    // Get principal/clerk phone numbers for digest
    const { data: staffUsers, error: staffError } = await supabase
      .from('auth_users')
      .select('mobile_number,role,name_en')
      .in('role', ['principal', 'clerk', 'web_creator'])
      .eq('is_active', true);

    if (staffError) {
      console.error('Staff lookup for daily digest failed:', staffError.message);
    }

    const digestMessage = `Daily Report ${today}: Students: ${stats.totalStudents}, Present: ${stats.present}, Absent: ${stats.absent}, Attendance Rate: ${stats.attendanceRate}% - Ashram Shala Pathraj`;

    const staffMembers = (staffUsers || []) as Array<{ mobile_number: string | null; role: string; name_en: string }>;
    let digestSent = 0;

    for (const staff of staffMembers) {
      if (staff.mobile_number && /^[6-9]\d{9}$/.test(staff.mobile_number)) {
        const success = await sendSmsFast2sms(staff.mobile_number, digestMessage);
        if (success) digestSent += 1;
      }
    }

    await logAutomation(supabase, 'daily_digest', 'success', {
      ...stats,
      digestSentTo: digestSent,
    });

    console.log(`[AUTOMATION] Daily digest sent. Stats:`, stats);
  } catch (error) {
    console.error('Daily digest automation failed:', error instanceof Error ? error.message : error);
    await logAutomation(supabase, 'daily_digest', 'error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function hasRunToday(supabase: SupabaseClient, automationName: string): Promise<boolean> {
  const today = todayDateString();
  const startOfDay = `${today}T00:00:00.000Z`;
  const endOfDay = `${today}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from('automation_logs')
    .select('id')
    .eq('automation_name', automationName)
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`Check hasRunToday failed for ${automationName}:`, error.message);
    return false;
  }

  return data !== null;
}

async function runDailyAutomationsIfNeeded(supabase: SupabaseClient): Promise<void> {
  try {
    const alreadyRan = await hasRunToday(supabase, 'daily_digest');
    if (alreadyRan) {
      console.log('[AUTOMATION] Daily automations already ran today. Skipping.');
      return;
    }

    console.log('[AUTOMATION] Running daily automations...');
    await sendAbsenteeNotifications(supabase);
    await sendDailyDigest(supabase);
    console.log('[AUTOMATION] Daily automations completed.');
  } catch (error) {
    console.error('Daily automation startup check failed:', error instanceof Error ? error.message : error);
  }
}

export function registerAutomationRoutes(app: Express, supabase: SupabaseClient): void {
  // Auto-run on server start (checks if already ran today)
  void runDailyAutomationsIfNeeded(supabase);

  // GET /api/automations/run-daily - Protected endpoint for manual trigger
  app.get(
    '/api/automations/run-daily',
    requireSession(['web_creator', 'principal']),
    async (_req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-store');

      try {
        const [absenteeResult] = await Promise.all([
          sendAbsenteeNotifications(supabase),
          sendDailyDigest(supabase),
        ]);

        res.json({
          success: true,
          message: 'Daily automations executed successfully.',
          results: {
            absenteeNotifications: absenteeResult,
            dailyDigest: 'sent',
          },
        });
      } catch (error) {
        console.error('Manual automation trigger failed:', error instanceof Error ? error.message : error);
        res.status(500).json({ success: false, error: 'Automation execution failed.' });
      }
    },
  );
}
