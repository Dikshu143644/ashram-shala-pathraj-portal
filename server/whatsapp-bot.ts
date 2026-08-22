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
- Principal: श्री. अजित लालासाहेब बनसोडे (Mobile: 9423864391)
- Vice Principal: श्री. पाटील विजय दत्तात्रय
- Office Clerk: श्री. शिंदे रवींद्र (Mobile: 7666971183)
- Email: hmpathraj22@gmail.com
- Department: Tribal Development Department, Government of Maharashtra
- Total Students: 459 (Boys: 267, Girls: 192)
- Total Teaching Staff: 25
- Standards: 1st to 12th (11th-12th: Arts stream, Marathi medium)
- Hostel Capacity: 520 beds (Boys Wing A & B, Girls Wing A & B)
- Location: Pathraj, Taluka Karjat, District Raigad, Maharashtra, PIN 410201

## Staff Directory
### Teaching Staff
- श्री. बनसोडे अजित लालासाहेब - Principal (प्राचार्य)
- श्री. पाटील विजय दत्तात्रय - Vice Principal (उपप्राचार्य)
- श्रीम. जाधव सुनिता रामदास - Marathi (मराठी)
- श्री. गायकवाड राजेश भगवान - Hindi (हिंदी)
- श्रीम. शेलार प्रतिभा सुनील - English (इंग्रजी)
- श्री. कदम संजय बाबूराव - Mathematics (गणित)
- श्रीम. मोरे निलम विश्वनाथ - Science (विज्ञान)
- श्री. पवार दीपक हरिभाऊ - Social Studies (सामाजिक शास्त्र)
- श्री. भोईर महेश पांडुरंग - Physical Education (शारीरिक शिक्षण)
- श्रीम. तांबे स्वाती दिनेश - Drawing/Art (चित्रकला)

### Hostel Staff
- श्री. माने राजेंद्र परशराम - Boys Hostel Warden (मुलांचे वसतिगृह प्रमुख)
- श्रीम. पखाले सविता पुंडलिक - Girls Hostel Warden (मुलींचे वसतिगृह प्रमुख)
- श्री. गवळी भरत सदानंद - Night Watchman (रात्र रखवालदार)

### Support Staff
- श्री. शिंदे रवींद्र - Office Clerk (कार्यालय लिपिक)
- श्री. कांबळे दत्तू - Peon (शिपाई)
- श्रीम. वाघमारे सुनंदा - Cook, Boys Mess (स्वयंपाकी, मुले)
- श्रीम. पाटील कविता - Cook, Girls Mess (स्वयंपाकी, मुली)

## Mess Schedule (Daily)
- Breakfast (7:00 AM): Pohe/Upma/Idli, Tea, Banana/Seasonal Fruit
  - Monday: पोहे, चहा, केळे
  - Tuesday: उपमा, चहा, फळ
  - Wednesday: शिरा, चहा, केळे
  - Thursday: इडली-चटणी, चहा, फळ
  - Friday: मिसळ, चहा, केळे
  - Saturday: आलू पराठा, चहा, दही
  - Sunday: Special - मेदूवडा / दोसा
- Lunch (12:30 PM): Varan-Bhat (Dal-Rice), Bhaji, Chapati, Papad, Salad
- Evening Snack (4:30 PM): Chivda/Biscuits, Milk/Tea
- Dinner (7:30 PM): Rice/Khichdi/Chapati with seasonal vegetable curry, Dahi/Pickle

## Daily Hostel Routine
- 5:30 AM - Wake up bell (उठण्याची घंटा)
- 6:00 AM - Morning exercise/yoga (व्यायाम/योग)
- 7:00 AM - Breakfast (नाश्ता)
- 7:45 AM - Assembly & school starts (प्रार्थना व शाळा सुरू)
- 12:30 PM - Lunch break (दुपारची सुट्टी)
- 1:15 PM - School resumes (शाळा पुन्हा सुरू)
- 4:00 PM - School ends (शाळा सुटली)
- 4:30 PM - Snack time (नाश्ता वेळ)
- 5:00 PM - Sports/Games (खेळ/क्रीडा)
- 6:30 PM - Study hour (अभ्यास तास)
- 7:30 PM - Dinner (रात्रीचे जेवण)
- 8:30 PM - Free time (मुक्त वेळ)
- 9:30 PM - Lights out (दिवे बंद)

## Exam Schedule Pattern
- Unit Tests: Monthly (last week of each month)
- Semester Exams: October and March
- Board Exams (Std 10 & 12): As per Maharashtra State Board schedule (February-March)
- Internal Assessment: Continuous throughout the year
- Sports Day: January (annually)
- Annual Function: February (annually)

## PTM (Parent-Teacher Meeting) Pattern
- Regular PTM: First Saturday of every month (10:00 AM - 1:00 PM)
- Special PTM: After semester exam results
- Emergency meetings: As needed with prior notice
- Parents can also call the principal directly at 9423864391

## Holiday Calendar Structure
- Diwali: 5 days (October/November)
- Christmas/New Year: 10 days (December-January)
- Summer Vacation: May-June (as per state government order)
- National Holidays: Republic Day, Independence Day, Gandhi Jayanti
- Regional: Ambedkar Jayanti, Shivaji Jayanti, Birsa Munda Jayanti
- Tribal Festivals: Shimga (Holi), Pola, etc.

## Admission Information
- Eligibility: ST/tribal category students (priority), other categories as per government norms
- Required Documents: Caste certificate, Aadhaar card, Transfer certificate, Birth certificate, Income certificate, Passport-size photos
- Admission Period: June-July each year
- Contact for Inquiries: Principal (9423864391) or Clerk (7666971183)

## Health Facilities
- Weekly health checkup by visiting doctor (every Wednesday)
- 24/7 first aid at hostel
- Tie-up with Karjat Rural Hospital for emergencies
- Mental health counseling available (monthly visit)
- Sick bay in both boys and girls hostel wings

## Transportation
- School bus available for day scholars
- Bus route: Karjat Station -> Pathraj village
- Timing: 7:00 AM pickup, 4:30 PM drop-off

## Your Capabilities
1. Attendance information (हजेरी माहिती)
2. Exam Schedule (परीक्षा वेळापत्रक)
3. PTM dates and updates (पालक-शिक्षक भेट)
4. Hostel and Mess information (वसतिगृह व भोजनालय)
5. Holiday calendar (सुट्टी कॅलेंडर)
6. Health updates (आरोग्य अपडेट)
7. Staff contact information (कर्मचारी संपर्क)
8. Admission guidance (प्रवेश मार्गदर्शन)
9. Daily routine and schedule (दैनंदिन वेळापत्रक)
10. School fees and hostel charges (शुल्क माहिती - Free for eligible tribal students)

## Response Rules
- Keep responses UNDER 200 words
- Use emojis to make responses friendly and engaging
- Use bullet points for lists
- Default language: Marathi. Switch to English ONLY if the user writes in English.
- ALWAYS end every response with: "आणखी काही मदत हवी असल्यास विचारा 🙏"
- If you switch to English, end with the same line in Marathi: "आणखी काही मदत हवी असल्यास विचारा 🙏"
- Introduce yourself as "${BOT_NAME}" when greeted
- Be warm, helpful, and concise like a school teacher
- If asked about specific student data (attendance, marks), mention that you are checking records
- Never reveal personal records of other students
- For questions outside your scope, politely redirect to the school office (Contact: 02148-222456 or Principal: 9423864391)
- When parents ask about their child, offer reassurance and relevant information
- Use respectful Marathi with appropriate honorifics (आपण/तुम्ही)`;

// Quick reply suggestions based on common parent queries
const QUICK_REPLY_SUGGESTIONS: Record<string, string[]> = {
  greeting: [
    'माझ्या मुलाची हजेरी कशी आहे?',
    'आजचे मेस मेनू काय आहे?',
    'पुढची PTM कधी आहे?',
    'सुट्ट्यांचे कॅलेंडर सांगा',
  ],
  attendance: [
    'गेल्या आठवड्याची हजेरी सांगा',
    'मुलाची एकूण उपस्थिती किती आहे?',
    'अनुपस्थिती कशी कळवायची?',
  ],
  mess: [
    'उद्याचे मेनू सांगा',
    'शनिवारचे विशेष जेवण काय?',
    'मुलाला अ‍ॅलर्जी आहे, काय करावे?',
  ],
  exam: [
    'पुढची परीक्षा कधी आहे?',
    'बोर्ड परीक्षा वेळापत्रक',
    'मुलाचे गुण कसे पाहायचे?',
  ],
  hostel: [
    'वसतिगृहाचे नियम काय आहेत?',
    'मुलाला भेटायला कधी येऊ शकतो?',
    'आरोग्य तपासणी कधी असते?',
  ],
  general: [
    'प्राचार्यांशी बोलायचे आहे',
    'प्रवेश प्रक्रिया समजून सांगा',
    'शाळेचा पत्ता सांगा',
  ],
};

interface WhatsAppChatResult {
  response: string;
  botName: string;
  provider: string;
  model: string;
  quickReplies?: string[];
}

function textFromGemini(data: unknown): string | null {
  const payload = data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const parts = payload.candidates?.[0]?.content?.parts;
  const text = parts?.map((part) => part.text || '').join('').trim();
  return text || null;
}

function getQuickReplies(userMessage: string, botResponse: string): string[] {
  const lowerMsg = (userMessage + ' ' + botResponse).toLowerCase();
  const marathiMsg = userMessage + ' ' + botResponse;

  if (/नमस्कार|hello|hi |hey|greeting/i.test(marathiMsg) && userMessage.length < 30) {
    return QUICK_REPLY_SUGGESTIONS.greeting;
  }
  if (/हजेरी|attendance|उपस्थिती|absent|अनुपस्थित/i.test(marathiMsg)) {
    return QUICK_REPLY_SUGGESTIONS.attendance;
  }
  if (/मेस|mess|जेवण|भोजन|menu|खाणे|नाश्ता/i.test(marathiMsg)) {
    return QUICK_REPLY_SUGGESTIONS.mess;
  }
  if (/परीक्षा|exam|गुण|marks|result|निकाल/i.test(marathiMsg)) {
    return QUICK_REPLY_SUGGESTIONS.exam;
  }
  if (/वसतिगृह|hostel|room|खोली|warden/i.test(marathiMsg)) {
    return QUICK_REPLY_SUGGESTIONS.hostel;
  }

  return QUICK_REPLY_SUGGESTIONS.general;
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
              const text = (entry as { text: string }).text.slice(0, MAX_MESSAGE_LENGTH);
              conversationHistory.push({ role, text });
            }
          }
        }

        const result = await callGeminiForBot(message.trim(), enrichedPrompt, conversationHistory);

        const quickReplies = getQuickReplies(message.trim(), result.text);

        const chatResult: WhatsAppChatResult = {
          response: result.text,
          botName: BOT_NAME,
          provider: 'gemini',
          model: result.model,
          quickReplies,
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
