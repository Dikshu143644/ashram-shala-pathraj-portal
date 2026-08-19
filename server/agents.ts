import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  concurrencyGate,
  durableRateLimit,
  requireSession,
  type AuthenticatedRequest,
} from './security.js';

const MAX_CHAT_MESSAGE_LENGTH = 1000;
const MAX_TTS_TEXT_LENGTH = 2000;
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 12_000);
const TTS_TIMEOUT_MS = Number(process.env.TTS_TIMEOUT_MS || 15_000);

const BASE_CONTEXT = `You are the AI assistant for शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज (Government Secondary and Higher Secondary Ashram School, Pathraj), Taluka Karjat, District Raigad, Maharashtra. The school operates under the Tribal Development Department, Government of Maharashtra. Always respond in BOTH English and Marathi. First give the English response, then provide the Marathi translation below it separated by a line break. When you have access to student data, analyze records and suggest actionable next steps for the child based on their academic performance, attendance, and status. Never reveal personal records to unauthorized users. Be helpful, accurate, and concise.`;

const AGENT_PROMPTS: Record<string, string> = {
  admission: `${BASE_CONTEXT}\n\nYou are the Admission Information Agent. Explain general eligibility, application steps, and commonly required documents. Clearly direct users to the school office or official Tribal Development Department portal for current dates, seat availability, final eligibility, and application status. Do not invent application records or approval decisions.`,
  attendance: `${BASE_CONTEXT}\n\nYou are the Attendance Information Agent. Explain general attendance policies and leave procedures. You do not have real-time attendance or biometric access; direct record-specific questions to the class teacher or school office.`,
  hostel: `${BASE_CONTEXT}\n\nYou are the Hostel Information Agent. Explain general hostel facilities, routines, safety, meals, and visitor procedures. Treat schedules and capacity as information that must be confirmed with the school office. You do not have bed-allocation or medical-record access.`,
  academic: `${BASE_CONTEXT}\n\nYou are the Academic Information Agent. Explain general curriculum, exam preparation, scholarship information, and school processes. You do not have marks, results, timetables, or student records; direct record-specific questions to authorized school staff.`,
  general: `${BASE_CONTEXT}\n\nYou are the General Information Agent. Answer general school questions and route users to the appropriate school department. If a fact is not provided or may change, say it must be confirmed rather than inventing it.`,
};

const KEYWORDS: Record<string, string[]> = {
  admission: ['admission', 'admit', 'enroll', 'eligibility', 'document', 'application', 'apply', 'seat', 'प्रवेश', 'अर्ज', 'कागदपत्र', 'पात्रता', 'दाखला', 'certificate', 'aadhaar', 'आधार', 'caste', 'जात'],
  attendance: ['attendance', 'present', 'absent', 'leave', 'उपस्थिती', 'हजेरी', 'गैरहजर', 'रजा'],
  hostel: ['hostel', 'bed', 'mess', 'food', 'meal', 'room', 'rector', 'warden', 'medical', 'वसतिगृह', 'जेवण', 'खोली', 'भोजन', 'बेड'],
  academic: ['exam', 'result', 'marks', 'grade', 'schedule', 'timetable', 'syllabus', 'subject', 'board', 'परीक्षा', 'निकाल', 'गुण', 'वेळापत्रक', 'अभ्यासक्रम', 'scholarship', 'शिष्यवृत्ती'],
};

interface AgentResult {
  response: string;
  agent: string;
  provider: string;
  model: string;
  fallbackUsed: boolean;
  durationMs: number;
}

interface ProviderResult {
  text: string;
  provider: string;
  model: string;
}

class ProviderFailure extends Error {
  constructor(public provider: string, message: string) {
    super(message);
  }
}

function detectIntent(message: string): string {
  const normalized = message.toLowerCase();
  const scores: Record<string, number> = {};
  for (const [agent, keywords] of Object.entries(KEYWORDS)) {
    scores[agent] = keywords.reduce((score, keyword) => score + (normalized.includes(keyword) ? 1 : 0), 0);
  }
  const maximum = Math.max(...Object.values(scores));
  if (maximum === 0) return 'general';
  return ['admission', 'attendance', 'hostel', 'academic'].find((agent) => scores[agent] === maximum) || 'general';
}

function textFromGemini(data: unknown): string | null {
  const payload = data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const parts = payload.candidates?.[0]?.content?.parts;
  const text = parts?.map((part) => part.text || '').join('').trim();
  return text || null;
}

async function callGemini(message: string, prompt: string): Promise<ProviderResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.6-flash';
  if (!apiKey) throw new ProviderFailure('gemini', 'GEMINI_API_KEY is not configured');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: prompt }] },
      contents: [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 700 },
    }),
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
  });
  if (!response.ok) throw new ProviderFailure('gemini', `HTTP ${response.status}`);
  const text = textFromGemini(await response.json());
  if (!text) throw new ProviderFailure('gemini', 'Provider returned an empty response');
  return { text, provider: 'gemini', model };
}

async function callOpenAi(message: string, prompt: string): Promise<ProviderResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4.1-mini';
  if (!apiKey) throw new ProviderFailure('openai', 'OPENAI_API_KEY is not configured');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, temperature: 0.3, max_tokens: 700, messages: [{ role: 'system', content: prompt }, { role: 'user', content: message }] }),
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
  });
  if (!response.ok) throw new ProviderFailure('openai', `HTTP ${response.status}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new ProviderFailure('openai', 'Provider returned an empty response');
  return { text, provider: 'openai', model };
}

async function callAnthropic(message: string, prompt: string): Promise<ProviderResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  const model = process.env.ANTHROPIC_MODEL?.trim() || 'claude-3-5-haiku-latest';
  if (!apiKey) throw new ProviderFailure('anthropic', 'ANTHROPIC_API_KEY is not configured');
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, system: prompt, max_tokens: 700, temperature: 0.3, messages: [{ role: 'user', content: message }] }),
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
  });
  if (!response.ok) throw new ProviderFailure('anthropic', `HTTP ${response.status}`);
  const data = await response.json() as { content?: Array<{ type?: string; text?: string }> };
  const text = data.content?.find((item) => item.type === 'text')?.text?.trim();
  if (!text) throw new ProviderFailure('anthropic', 'Provider returned an empty response');
  return { text, provider: 'anthropic', model };
}

async function callConfiguredFallback(message: string, prompt: string): Promise<ProviderResult> {
  const provider = process.env.AI_FALLBACK_PROVIDER?.trim().toLowerCase();
  if (provider === 'openai') return callOpenAi(message, prompt);
  if (provider === 'anthropic') return callAnthropic(message, prompt);
  throw new ProviderFailure('none', 'No AI fallback provider is configured');
}

async function callPythonService(message: string, language: string, requestId: string): Promise<ProviderResult & { agent: string }> {
  const url = process.env.ADK_SERVICE_URL?.trim();
  if (!url) throw new ProviderFailure('python-agent-service', 'ADK_SERVICE_URL is not configured');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-Request-ID': requestId };
  if (process.env.ADK_SERVICE_KEY) headers['X-Agent-Service-Key'] = process.env.ADK_SERVICE_KEY;
  const response = await fetch(`${url.replace(/\/$/, '')}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, language }),
    signal: AbortSignal.timeout(Math.min(AI_TIMEOUT_MS, 8_000)),
  });
  if (!response.ok) throw new ProviderFailure('python-agent-service', `HTTP ${response.status}`);
  const data = await response.json() as { response?: string; agent?: string; provider?: string; model?: string };
  if (!data.response || !data.agent) throw new ProviderFailure('python-agent-service', 'Invalid service response');
  return { text: data.response, agent: data.agent, provider: data.provider || 'gemini', model: data.model || 'unknown' };
}

function logAgentEvent(event: Record<string, unknown>): void {
  console.log(JSON.stringify({ event: 'agent_activity', timestamp: new Date().toISOString(), ...event }));
}

async function runAgent(message: string, language: string, requestId: string, studentContext?: string): Promise<AgentResult> {
  const startedAt = Date.now();
  const detectedAgent = detectIntent(message);
  const contextSuffix = studentContext ? `\n\n${studentContext}` : '';
  const prompt = `${AGENT_PROMPTS[detectedAgent]}${contextSuffix}\n\n${language === 'mr' ? 'Respond in Marathi first, then English.' : 'Respond in English first, then Marathi.'}`;
  const failures: string[] = [];

  if (process.env.ADK_SERVICE_URL?.trim()) {
    try {
      const result = await callPythonService(message, language, requestId);
      const durationMs = Date.now() - startedAt;
      logAgentEvent({ requestId, agent: result.agent, provider: result.provider, model: result.model, durationMs, fallbackUsed: false, status: 'success', messageLength: message.length, language });
      return { response: result.text, agent: result.agent, provider: result.provider, model: result.model, durationMs, fallbackUsed: false };
    } catch (error) {
      failures.push(error instanceof Error ? error.message : 'Python service failed');
    }
  }

  try {
    const result = await callGemini(message, prompt);
    const durationMs = Date.now() - startedAt;
    logAgentEvent({ requestId, agent: detectedAgent, provider: result.provider, model: result.model, durationMs, fallbackUsed: failures.length > 0, status: 'success', messageLength: message.length, language });
    return { response: result.text, agent: detectedAgent, provider: result.provider, model: result.model, durationMs, fallbackUsed: failures.length > 0 };
  } catch (error) {
    failures.push(error instanceof Error ? error.message : 'Gemini failed');
  }

  try {
    const result = await callConfiguredFallback(message, prompt);
    const durationMs = Date.now() - startedAt;
    logAgentEvent({ requestId, agent: detectedAgent, provider: result.provider, model: result.model, durationMs, fallbackUsed: true, status: 'success', messageLength: message.length, language });
    return { response: result.text, agent: detectedAgent, provider: result.provider, model: result.model, durationMs, fallbackUsed: true };
  } catch (error) {
    failures.push(error instanceof Error ? error.message : 'Fallback failed');
  }

  const durationMs = Date.now() - startedAt;
  logAgentEvent({ requestId, agent: detectedAgent, provider: 'none', model: 'none', durationMs, fallbackUsed: true, status: 'failed', messageLength: message.length, language, failureCount: failures.length });
  throw new Error('All configured AI providers failed');
}

export function registerAgentRoutes(app: Express, supabase: SupabaseClient): void {
  const authenticatedRoles = ['web_creator', 'principal', 'class_teacher', 'clerk', 'subject_teacher', 'student_parent'];
  const chatLimit = durableRateLimit(supabase, { bucket: 'ai_chat_account', maximum: 20, windowSeconds: 60, key: (req) => req.authSession?.userId || req.ip || 'unknown' });
  const ttsLimit = durableRateLimit(supabase, { bucket: 'tts_account', maximum: 10, windowSeconds: 60, key: (req) => req.authSession?.userId || req.ip || 'unknown' });
  const chatGate = concurrencyGate(Number(process.env.MAX_AI_CONCURRENCY || 8), 'AI assistant');
  const ttsGate = concurrencyGate(Number(process.env.MAX_TTS_CONCURRENCY || 4), 'Voice service');

  app.post('/api/ai-chat', requireSession(authenticatedRoles), chatLimit, chatGate, async (request: Request, res: Response) => {
    const req = request as AuthenticatedRequest;
    const { message, language } = req.body as { message?: unknown; language?: unknown };
    if (typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }
    if (message.length > MAX_CHAT_MESSAGE_LENGTH) {
      res.status(400).json({ error: `Message too long. Maximum ${MAX_CHAT_MESSAGE_LENGTH} characters allowed.` });
      return;
    }
    const normalizedLanguage = language === 'mr' ? 'mr' : 'en';

    // Fetch real student data for authenticated parents
    let studentContext = '';
    try {
      const { data: userData } = await supabase
        .from('auth_users')
        .select('parent_student_ids,role')
        .eq('id', req.authSession!.userId)
        .maybeSingle();
      if (userData && userData.parent_student_ids && userData.parent_student_ids.length > 0) {
        const { data: students } = await supabase
          .from('students')
          .select('full_name,standard,status,date_of_birth,blood_group')
          .in('id', userData.parent_student_ids as string[]);
        if (students?.length) {
          studentContext = `\n\nThe user is a parent. Their linked student data:\n${JSON.stringify(students, null, 2)}`;
        }
      }
    } catch (err) {
      console.error('Failed to fetch student context for AI:', err instanceof Error ? err.message : err);
    }

    try {
      const result = await runAgent(message.trim(), normalizedLanguage, req.requestId || 'unknown', studentContext);
      res.json({ ...result, requestId: req.requestId });
    } catch (error) {
      console.error('AI providers unavailable:', error instanceof Error ? error.message : error);
      res.status(503).json({ error: 'AI assistant is temporarily unavailable.', requestId: req.requestId });
    }
  });

  app.post('/api/voice/tts', requireSession(authenticatedRoles), ttsLimit, ttsGate, async (req: Request, res: Response) => {
    const { text } = req.body as { text?: unknown };
    if (typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Text is required.' });
      return;
    }
    if (text.length > MAX_TTS_TEXT_LENGTH) {
      res.status(400).json({ error: `Text too long. Maximum ${MAX_TTS_TEXT_LENGTH} characters allowed.` });
      return;
    }
    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
    const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || 'pNInz6obpgDQGcFmaJgB';
    if (!apiKey) {
      res.status(503).json({ error: 'Voice service is not configured.' });
      return;
    }
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.5 } }),
        signal: AbortSignal.timeout(TTS_TIMEOUT_MS),
      });
      if (!response.ok) {
        console.error('ElevenLabs request failed:', response.status);
        res.status(502).json({ error: 'Voice provider could not generate speech.' });
        return;
      }
      const declaredLength = Number.parseInt(response.headers.get('content-length') || '0', 10);
      if (declaredLength > 5 * 1024 * 1024) {
        res.status(502).json({ error: 'Voice response exceeded the safety limit.' });
        return;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > 5 * 1024 * 1024) {
        res.status(502).json({ error: 'Voice response exceeded the safety limit.' });
        return;
      }
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'private, no-store');
      res.send(buffer);
    } catch (error) {
      const timeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
      console.error('Voice provider failed:', error instanceof Error ? error.message : error);
      res.status(timeout ? 504 : 502).json({ error: timeout ? 'Voice provider timed out.' : 'Voice provider request failed.' });
    }
  });
}
