import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  concurrencyGate,
  durableRateLimit,
  requireSession,
  type AuthenticatedRequest,
} from './security.js';

// ============================================================
// AI Voice Calling Agent
// Handles bulk parent notifications and admission inquiries
// Currently logs calls (actual voice integration requires Twilio/similar)
// ============================================================

const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 12_000);
const VOICE_ROLES = ['web_creator', 'principal'];

interface VoiceNotification {
  id: string;
  message: string;
  targetGroup: 'all_parents' | 'specific_standard' | 'specific_students';
  standard?: string;
  studentIds?: string[];
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  createdAt: string;
  createdBy: string;
  voiceScript?: string;
}

interface AdmissionInquiryLog {
  id: string;
  callerNumber: string;
  inquiry: string;
  aiResponse: string;
  timestamp: string;
  language: 'marathi' | 'hindi' | 'english';
}

// In-memory store for demo (in production this would be in Supabase)
const notificationHistory: VoiceNotification[] = [];
const inquiryLogs: AdmissionInquiryLog[] = [];

function generateId(): string {
  return `VC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function textFromGemini(data: unknown): string | null {
  const payload = data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const parts = payload.candidates?.[0]?.content?.parts;
  const text = parts?.map((part) => part.text || '').join('').trim();
  return text || null;
}

async function generateVoiceScript(message: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';
  if (!apiKey) return message;

  const systemPrompt = `You are a voice script generator for a school notification system. 
Convert the given message into a natural-sounding voice script in Marathi that can be read aloud.
- Start with "नमस्कार, आश्रमशाळा पाथरज येथून सूचना."
- Keep it concise (under 100 words)
- Use simple, clear Marathi that parents from tribal communities can easily understand
- End with "कृपया शाळेशी संपर्क साधा: ९४२३८६४३९१. धन्यवाद."
- Do not use complex vocabulary
- Output only the script, nothing else`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: `Convert this notification to a voice script: "${message}"` }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
        }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      },
    );

    if (!response.ok) return message;
    const text = textFromGemini(await response.json());
    return text || message;
  } catch {
    return message;
  }
}

async function generateInquiryResponse(inquiry: string, language: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';
  if (!apiKey) return 'कृपया शाळेच्या कार्यालयाशी संपर्क साधा: 9423864391';

  const systemPrompt = `You are a voice-based admission inquiry handler for शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज.
Respond in ${language === 'english' ? 'English' : language === 'hindi' ? 'Hindi' : 'Marathi'}.
Keep responses brief (under 80 words) as they will be spoken aloud.
Key info:
- School: Government Ashram School for tribal students, Pathraj, Karjat, Raigad
- Standards: 1st to 12th (Arts stream for 11th-12th)
- Admission period: June-July
- Required docs: Caste certificate, Aadhaar, TC, Birth certificate, Income certificate
- Eligibility: ST category priority
- Contact: Principal 9423864391, Clerk 7666971183
- Hostel: Free for eligible tribal students (520 beds)
- Medium: Marathi`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: inquiry }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
        }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      },
    );

    if (!response.ok) return 'कृपया शाळेच्या कार्यालयाशी संपर्क साधा: 9423864391';
    const text = textFromGemini(await response.json());
    return text || 'कृपया शाळेच्या कार्यालयाशी संपर्क साधा: 9423864391';
  } catch {
    return 'कृपया शाळेच्या कार्यालयाशी संपर्क साधा: 9423864391';
  }
}

export function registerCallingAgentRoutes(app: Express, supabase: SupabaseClient): void {
  const voiceLimit = durableRateLimit(supabase, {
    bucket: 'voice_notify',
    maximum: 10,
    windowSeconds: 60 * 5,
    key: (req) => req.authSession?.userId || req.ip || 'unknown',
  });

  const voiceGate = concurrencyGate(Number(process.env.MAX_VOICE_CONCURRENCY || 4), 'Voice calling agent');

  // POST /api/voice/notify-parents - Bulk notification to parents
  app.post(
    '/api/voice/notify-parents',
    requireSession(VOICE_ROLES),
    voiceLimit,
    voiceGate,
    async (request: Request, res: Response) => {
      const req = request as AuthenticatedRequest;
      const { message, targetGroup, standard, studentIds } = req.body as {
        message?: unknown;
        targetGroup?: unknown;
        standard?: unknown;
        studentIds?: unknown;
      };

      if (typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      if (message.length > 500) {
        res.status(400).json({ error: 'Message must be under 500 characters.' });
        return;
      }

      const validTargetGroups = ['all_parents', 'specific_standard', 'specific_students'];
      const target = typeof targetGroup === 'string' && validTargetGroups.includes(targetGroup)
        ? targetGroup as VoiceNotification['targetGroup']
        : 'all_parents';

      try {
        // Count recipients based on target group
        let recipientCount = 0;

        if (target === 'all_parents') {
          const { count } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true });
          recipientCount = count || 0;
        } else if (target === 'specific_standard' && typeof standard === 'string') {
          const { count } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('standard', standard);
          recipientCount = count || 0;
        } else if (target === 'specific_students' && Array.isArray(studentIds)) {
          recipientCount = studentIds.length;
        }

        // Generate voice script using AI
        const voiceScript = await generateVoiceScript(message.trim());

        const notification: VoiceNotification = {
          id: generateId(),
          message: message.trim(),
          targetGroup: target,
          standard: typeof standard === 'string' ? standard : undefined,
          studentIds: Array.isArray(studentIds) ? studentIds.filter(s => typeof s === 'string').slice(0, 100) : undefined,
          status: 'queued',
          totalRecipients: recipientCount,
          deliveredCount: 0,
          failedCount: 0,
          createdAt: new Date().toISOString(),
          createdBy: req.authSession?.username || 'unknown',
          voiceScript,
        };

        // Store in history
        notificationHistory.unshift(notification);
        if (notificationHistory.length > 50) notificationHistory.pop();

        // Log the notification (in production, this would trigger actual voice calls via Twilio/Exotel)
        console.log(`[VOICE AGENT] Notification queued: ${notification.id}`);
        console.log(`[VOICE AGENT] Target: ${target}, Recipients: ${recipientCount}`);
        console.log(`[VOICE AGENT] Script: ${voiceScript.slice(0, 100)}...`);

        // Simulate processing (in production, this would be async with a queue)
        setTimeout(() => {
          const idx = notificationHistory.findIndex(n => n.id === notification.id);
          if (idx !== -1) {
            notificationHistory[idx].status = 'completed';
            notificationHistory[idx].deliveredCount = recipientCount;
          }
        }, 3000);

        res.json({
          success: true,
          notification: {
            id: notification.id,
            status: notification.status,
            totalRecipients: recipientCount,
            voiceScript,
            message: `Voice notification queued for ${recipientCount} parent(s).`,
          },
        });
      } catch (err) {
        console.error('Voice notify error:', err instanceof Error ? err.message : err);
        res.status(500).json({ error: 'Failed to queue voice notification. Please try again.' });
      }
    },
  );

  // POST /api/voice/admission-inquiry - Handle incoming voice admission queries
  app.post(
    '/api/voice/admission-inquiry',
    requireSession(['web_creator', 'principal', 'clerk']),
    voiceGate,
    async (request: Request, res: Response) => {
      const req = request as AuthenticatedRequest;
      const { inquiry, callerNumber, language } = req.body as {
        inquiry?: unknown;
        callerNumber?: unknown;
        language?: unknown;
      };

      if (typeof inquiry !== 'string' || !inquiry.trim()) {
        res.status(400).json({ error: 'Inquiry text is required.' });
        return;
      }

      if (inquiry.length > 500) {
        res.status(400).json({ error: 'Inquiry must be under 500 characters.' });
        return;
      }

      const lang = typeof language === 'string' && ['marathi', 'hindi', 'english'].includes(language)
        ? language as 'marathi' | 'hindi' | 'english'
        : 'marathi';

      try {
        const aiResponse = await generateInquiryResponse(inquiry.trim(), lang);

        const log: AdmissionInquiryLog = {
          id: generateId(),
          callerNumber: typeof callerNumber === 'string' ? callerNumber.slice(0, 15) : 'unknown',
          inquiry: inquiry.trim(),
          aiResponse,
          timestamp: new Date().toISOString(),
          language: lang,
        };

        inquiryLogs.unshift(log);
        if (inquiryLogs.length > 100) inquiryLogs.pop();

        console.log(`[VOICE AGENT] Inquiry processed: ${log.id} from ${log.callerNumber}`);

        res.json({
          success: true,
          response: aiResponse,
          inquiryId: log.id,
          language: lang,
        });
      } catch (err) {
        console.error('Voice inquiry error:', err instanceof Error ? err.message : err);
        res.status(500).json({ error: 'Failed to process inquiry. Please try again.' });
      }
    },
  );

  // GET /api/voice/history - Get notification history
  app.get(
    '/api/voice/history',
    requireSession(VOICE_ROLES),
    async (_request: Request, res: Response) => {
      res.json({
        notifications: notificationHistory.slice(0, 20),
        inquiries: inquiryLogs.slice(0, 20),
      });
    },
  );
}
