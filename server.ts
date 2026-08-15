import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { GoogleGenAI } from '@google/genai';
import type { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ============================================================
// Rate Limiting (in-memory sliding window, per IP)
// ============================================================

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // max requests per window per IP

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodically clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    entry.timestamps = entry.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let entry = rateLimitStore.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(ip, entry);
  }
  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (entry.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  entry.timestamps.push(now);
  return false;
}

// ============================================================
// Input validation constants
// ============================================================

const MAX_CHAT_MESSAGE_LENGTH = 1000;
const MAX_TTS_TEXT_LENGTH = 2000;

// ============================================================
// API Routes
// ============================================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/students', async (_req: Request, res: Response) => {
  const { students } = await import('./src/data/mockData.js');
  res.json({ data: students, total: students.length });
});

app.get('/api/staff', async (_req: Request, res: Response) => {
  const { staff } = await import('./src/data/mockData.js');
  res.json({ data: staff, total: staff.length });
});

const SYSTEM_PROMPT = `You are the AI assistant for शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज, ता. कर्जत, जि. रायगड. You help parents and staff with queries about admissions, attendance, hostel, mess, exam schedules, tribal scholarships, and school information. Respond in Marathi when the user writes in Marathi, and in English when they write in English. The school has ~459 students from 1st to 12th standard. Principal: श्री. अजित लालासाहेब बनसोडे. The school is under the Tribal Development Department, Maharashtra.`;

app.post('/api/ai-chat', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(clientIp)) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  const { message } = req.body as { message?: string; language?: string };

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  if (message.length > MAX_CHAT_MESSAGE_LENGTH) {
    res.status(400).json({ error: `Message too long. Maximum ${MAX_CHAT_MESSAGE_LENGTH} characters allowed.` });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.json({ response: 'AI assistant is temporarily unavailable. Please try again later.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: message,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });
    const text = result.text ?? 'Sorry, I could not generate a response.';
    res.json({ response: text });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ response: 'An error occurred while processing your request. Please try again.' });
  }
});

app.post('/api/voice/tts', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(clientIp)) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  const { text } = req.body as { text?: string; language?: 'mr' | 'en' };

  if (!text) {
    res.status(400).json({ error: 'Text is required' });
    return;
  }

  if (text.length > MAX_TTS_TEXT_LENGTH) {
    res.status(400).json({ error: `Text too long. Maximum ${MAX_TTS_TEXT_LENGTH} characters allowed.` });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

  if (!apiKey) {
    res.status(400).json({ error: 'Voice service is temporarily unavailable.' });
    return;
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      res.status(500).json({ error: 'Failed to generate speech' });
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    res.status(500).json({ error: 'An error occurred while generating speech' });
  }
});

// ============================================================
// Vite Dev Server or Static Serving
// ============================================================

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(resolve(distPath, 'index.html'));
  });
}

// ============================================================
// Start Server
// ============================================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Mode: ${isProduction ? 'production' : 'development'}`);
});
