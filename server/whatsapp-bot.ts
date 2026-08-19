import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  concurrencyGate,
  durableRateLimit,
  requireSession,
  type AuthenticatedRequest,
} from './security.js';

const MAX_MESSAGE_LENGTH = 500;
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 12_000);

const BOT_NAME = 'आश्रमशाळा पाथरज सहाय्यक';

const WHATSAPP_BOT_SYSTEM_PROMPT = `You are "${BOT_NAME}" - the official AI assistant for शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज (Government Secondary and Higher Secondary Ashram School, Pathraj), Taluka Karjat, District Raigad, Maharashtra.

## School Information
- Principal: श्री. अजित लालासाहेब बनसोडे
- Department: Tribal Development Department, Government of Maharashtra
- Total Students: 459
- Standards: 1 to 12
- Hostel Capacity: 520 beds
- Location: Pathraj, Taluka Karjat, District Raigad, Maharashtra, PIN 410201

## Mess Schedule (Daily)
- Breakfast (7:00 AM): Pohe/Upma/Idli, Tea, Banana/Seasonal Fruit
- Lunch (12:30 PM): Varan-Bhat (Dal-Rice), Bhaji, Chapati, Papad, Salad
- Evening Snack (4:30 PM): Chivda/Biscuits, Milk/Tea
- Dinner (8:00 PM): Rice/Khichdi/Chapati with seasonal vegetable curry, Dahi/Pickle

## Exam Schedule Pattern
- Unit Tests: Monthly (last week of each month)
- Semester Exams: October and March
- Board Exams (Std 10 & 12): As per Maharashtra State Board schedule (February-March)
- Internal Assessment: Continuous throughout the year

## PTM (Parent-Teacher Meeting) Pattern
- Regular PTM: First Saturday of every month (10:00 AM - 1:00 PM)
- Special PTM: After semester exam results
- Emergency meetings: As needed with prior notice

## Holiday Calendar Structure
- Diwali: 5 days (October/November)
- Christmas/New Year: 10 days (December-January)
- Summer Vacation: May-June (as per state government order)
- National Holidays: Republic Day, Independence Day, Gandhi Jayanti
- Regional: Ambedkar Jayanti, Shivaji Jayanti, Birsa Munda Jayanti

## Health Facilities
- Weekly health checkup by visiting doctor
- 24/7 first aid at hostel
- Tie-up with Karjat Rural Hospital for emergencies
- Mental health counseling available

## Your Capabilities
1. Attendance information
2. Exam Schedule
3. PTM dates and updates
4. Hostel and Mess information
5. Holiday calendar
6. Health updates
7. General School Information

## Response Rules
- Keep responses UNDER 200 words
- Use emojis to make responses friendly and engaging
- Use bullet points for lists
- Default language: Marathi. Switch to English ONLY if the user writes in English.
- ALWAYS end every response with: "आणखी काही मदत हवी असल्यास विचारा 🙏"
- If you switch to English, end with the same line in Marathi: "आणखी काही मदत हवी असल्यास विचारा 🙏"
- Introduce yourself as "${BOT_NAME}" when greeted
- Be warm, helpful, and concise
- If asked about specific student data (attendance, marks), mention that you are checking records
- Never reveal personal records of other students
- For questions outside your scope, politely redirect to the school office (Contact: 02148-222456)`;

interface WhatsAppChatResult {
  response: string;
  botName: string;
  provider: string;
  model: string;
}

function textFromGemini(data: unknown): string | null {
  const payload = data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const parts = payload.candidates?.[0]?.content?.parts;
  const text = parts?.map((part) => part.text || '').join('').trim();
  return text || null;
}

interface ConversationMessage {
  role: 'user' | 'model';
  text: string;
}

async function callGeminiForBot(
  message: string,
  systemPrompt: string,
  history: ConversationMessage[] = [],
): Promise<{ text: string; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  // Build contents array from conversation history + current message
  const contents = [
    ...history.map((msg) => ({ role: msg.role, parts: [{ text: msg.text }] })),
    { role: 'user', parts: [{ text: message }] },
  ];

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
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unable to read response body');
    console.error(`Gemini API error (HTTP ${response.status}):`, errorBody);
    throw new Error(`Gemini API HTTP ${response.status}`);
  }
  const text = textFromGemini(await response.json());
  if (!text) throw new Error('Gemini returned an empty response');
  return { text, model };
}

async function fetchStudentContext(supabase: SupabaseClient, userId: string): Promise<string> {
  try {
    // Get the authenticated user's linked student IDs
    const { data: user } = await supabase
      .from('auth_users')
      .select('parent_student_ids, role')
      .eq('id', userId)
      .single();

    if (!user) return '';

    // For parent role, fetch linked student data
    if (user.role === 'student_parent' && user.parent_student_ids?.length) {
      const { data: students } = await supabase
        .from('students')
        .select('full_name, standard, attendance_percentage')
        .in('id', user.parent_student_ids)
        .limit(5);

      if (students?.length) {
        const studentInfo = students.map((s: { full_name: string; standard: string; attendance_percentage?: number }) =>
          `- ${s.full_name} (Std ${s.standard}): Attendance ${s.attendance_percentage ?? 'N/A'}%`
        ).join('\n');
        return `\n\n## Linked Student Data (Parent's Children)\n${studentInfo}`;
      }
    }

    return '';
  } catch {
    // If Supabase query fails, continue without student context
    return '';
  }
}

// In-memory set of user IDs that have completed phone verification this session.
// Cleared on server restart, which is acceptable since verification is lightweight.
const verifiedUsers = new Set<string>();

export function registerWhatsAppBotRoutes(app: Express, supabase: SupabaseClient): void {
  const authenticatedRoles = ['web_creator', 'principal', 'class_teacher', 'clerk', 'subject_teacher', 'student_parent'];

  const chatLimit = durableRateLimit(supabase, {
    bucket: 'whatsapp_bot_chat',
    maximum: 15,
    windowSeconds: 60,
    key: (req) => req.authSession?.userId || req.ip || 'unknown',
  });

  const verifyLimit = durableRateLimit(supabase, {
    bucket: 'whatsapp_bot_verify',
    maximum: 5,
    windowSeconds: 60,
    key: (req) => req.ip || 'unknown',
  });

  const chatGate = concurrencyGate(Number(process.env.MAX_WHATSAPP_CONCURRENCY || 6), 'WhatsApp bot');

  // POST /api/whatsapp/verify - Verify phone number against auth_users table
  app.post(
    '/api/whatsapp/verify',
    requireSession(authenticatedRoles),
    verifyLimit,
    async (request: Request, res: Response) => {
      const req = request as AuthenticatedRequest;
      const { phoneNumber } = req.body as { phoneNumber?: unknown };

      if (typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
        res.status(400).json({ error: 'Phone number is required.' });
        return;
      }

      // Normalize phone number (remove spaces, dashes)
      const normalized = phoneNumber.replace(/[\s\-()]/g, '').trim();

      if (normalized.length < 10 || normalized.length > 15) {
        res.status(400).json({ error: 'Invalid phone number format.' });
        return;
      }

      // Validate that normalized number contains only digits (optionally prefixed with +)
      if (!/^\+?\d{10,15}$/.test(normalized)) {
        res.status(400).json({ error: 'Invalid phone number format.' });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('auth_users')
          .select('id, mobile_number, role')
          .or(`mobile_number.eq.${normalized},mobile_number.eq.+91${normalized.slice(-10)}`)
          .limit(1);

        if (error) {
          console.error('WhatsApp verify query error:', error.message);
          res.status(500).json({ error: 'Verification failed. Please try again.' });
          return;
        }

        if (!data || data.length === 0) {
          res.status(404).json({ error: 'Phone number not found in school records. Please contact the school office.' });
          return;
        }

        // Persist verification state server-side
        const userId = req.authSession?.userId;
        if (userId) {
          verifiedUsers.add(userId);
        }

        res.json({ verified: true, message: 'Phone number verified successfully.' });
      } catch (err) {
        console.error('WhatsApp verify error:', err instanceof Error ? err.message : err);
        res.status(500).json({ error: 'Verification failed. Please try again.' });
      }
    },
  );

  // POST /api/whatsapp/chat - AI chatbot endpoint
  app.post(
    '/api/whatsapp/chat',
    requireSession(authenticatedRoles),
    chatLimit,
    chatGate,
    async (request: Request, res: Response) => {
      const req = request as AuthenticatedRequest;
      const userId = req.authSession?.userId || '';

      // Enforce server-side phone verification
      if (!verifiedUsers.has(userId)) {
        res.status(403).json({ error: 'Phone verification required before using the chatbot.' });
        return;
      }

      const { message, history } = req.body as { message?: unknown; history?: unknown };

      if (typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      if (message.length > MAX_MESSAGE_LENGTH) {
        res.status(400).json({ error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` });
        return;
      }

      try {
        // Fetch student context for the authenticated user
        const studentContext = await fetchStudentContext(supabase, userId);

        // Build enriched system prompt
        const enrichedPrompt = WHATSAPP_BOT_SYSTEM_PROMPT + studentContext;

        // Parse conversation history (last 6 messages from the frontend)
        const conversationHistory: ConversationMessage[] = [];
        if (Array.isArray(history)) {
          for (const entry of history.slice(-6)) {
            if (
              entry &&
              typeof entry === 'object' &&
              typeof (entry as { role?: unknown }).role === 'string' &&
              typeof (entry as { text?: unknown }).text === 'string'
            ) {
              const role = (entry as { role: string }).role === 'user' ? 'user' : 'model';
              conversationHistory.push({ role, text: (entry as { text: string }).text });
            }
          }
        }

        const result = await callGeminiForBot(message.trim(), enrichedPrompt, conversationHistory);

        const chatResult: WhatsAppChatResult = {
          response: result.text,
          botName: BOT_NAME,
          provider: 'gemini',
          model: result.model,
        };

        res.json(chatResult);
      } catch (err) {
        console.error('WhatsApp bot error:', err instanceof Error ? err.message : err);
        res.status(503).json({
          error: 'Bot is temporarily unavailable. Please try again later.',
          botName: BOT_NAME,
        });
      }
    },
  );
}
