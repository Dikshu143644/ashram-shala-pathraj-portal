import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import type { Request, Response } from 'express';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json({ limit: '10kb' }));

// Trust the first proxy hop so req.ip resolves to the real client IP
// behind reverse proxies (Render, nginx, Cloudflare, etc.)
app.set('trust proxy', 1);

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

// Separate rate-limit buckets per endpoint
const chatRateLimitStore = new Map<string, RateLimitEntry>();
const ttsRateLimitStore = new Map<string, RateLimitEntry>();

// Periodically clean up stale entries every 5 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const store of [chatRateLimitStore, ttsRateLimitStore, loginRateLimitStore]) {
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }
}, 5 * 60 * 1000);
cleanupInterval.unref();

function isRateLimited(ip: string, store: Map<string, RateLimitEntry>): boolean {
  const now = Date.now();
  let entry = store.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
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
// Login Rate Limiting (stricter: 5 attempts per IP per minute)
// ============================================================

const LOGIN_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const LOGIN_RATE_LIMIT_MAX_REQUESTS = 5; // max 5 login attempts per window per IP

const loginRateLimitStore = new Map<string, RateLimitEntry>();

function isLoginRateLimited(ip: string): boolean {
  const now = Date.now();
  let entry = loginRateLimitStore.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    loginRateLimitStore.set(ip, entry);
  }
  entry.timestamps = entry.timestamps.filter(t => now - t < LOGIN_RATE_LIMIT_WINDOW_MS);
  if (entry.timestamps.length >= LOGIN_RATE_LIMIT_MAX_REQUESTS) {
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

app.get('/api/students', async (req: Request, res: Response) => {
  try {
    let query = supabase.from('students').select('*', { count: 'exact' });

    const { standard, search } = req.query;
    if (standard && typeof standard === 'string') {
      query = query.eq('standard', standard);
    }
    if (search && typeof search === 'string') {
      query = query.or(`full_name.ilike.%${search}%,guardian_name.ilike.%${search}%,village.ilike.%${search}%`);
    }

    query = query.order('sr_no', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ data: data || [], total: count || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/staff', async (_req: Request, res: Response) => {
  try {
    const { data, error, count } = await supabase
      .from('staff')
      .select('*', { count: 'exact' });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ data: data || [], total: count || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// Authentication Login Endpoint
// ============================================================

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  if (isLoginRateLimited(clientIp)) {
    res.status(429).json({ success: false, error: 'Too many login attempts. Please try again after 1 minute.' });
    return;
  }

  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ success: false, error: 'Username and password are required.' });
    return;
  }

  if (username.length > 50 || password.length > 100) {
    res.status(400).json({ success: false, error: 'Invalid credentials.' });
    return;
  }

  try {
    // Query auth_users table
    const { data: user, error } = await supabase
      .from('auth_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      // Log failed attempt
      await supabase.from('security_logs').insert({
        action: 'login_failed',
        username,
        ip_address: clientIp,
        details: `Failed login attempt for username: ${username}`,
      });

      res.status(401).json({ success: false, error: 'Invalid username or password.' });
      return;
    }

    // Compare password (plaintext for now - TODO: use bcrypt)
    if (user.password_hash !== password) {
      // Log failed attempt
      await supabase.from('security_logs').insert({
        action: 'login_failed',
        username,
        ip_address: clientIp,
        details: `Invalid password for username: ${username}`,
      });

      res.status(401).json({ success: false, error: 'Invalid username or password.' });
      return;
    }

    // Log successful login
    await supabase.from('security_logs').insert({
      action: 'login_success',
      user_id: user.id,
      username,
      ip_address: clientIp,
      details: `Successful login`,
    });

    res.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        nameEn: user.name_en,
        nameMr: user.name_mr,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// ============================================================
// Student CRUD Endpoints
// ============================================================

app.post('/api/students', async (req: Request, res: Response) => {
  const { full_name, standard, ...rest } = req.body;

  if (!full_name || !standard) {
    res.status(400).json({ error: 'full_name and standard are required.' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('students')
      .insert({ full_name, standard, ...rest })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    // Log the action
    await supabase.from('security_logs').insert({
      action: 'student_created',
      details: `Created student: ${full_name} (${standard})`,
    });

    res.status(201).json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/students/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id) {
    res.status(400).json({ error: 'Student ID is required.' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('students')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Student not found.' });
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }

    await supabase.from('security_logs').insert({
      action: 'student_updated',
      details: `Updated student: ${id}`,
    });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/students/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // First check if student exists
    const { data: existing, error: findError } = await supabase
      .from('students')
      .select('id, full_name')
      .eq('id', id)
      .single();

    if (findError || !existing) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await supabase.from('security_logs').insert({
      action: 'student_deleted',
      details: `Deleted student: ${existing.full_name} (${id})`,
    });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// Staff CRUD Endpoints
// ============================================================

app.post('/api/staff', async (req: Request, res: Response) => {
  const { full_name, designation, ...rest } = req.body;

  if (!full_name || !designation) {
    res.status(400).json({ error: 'full_name and designation are required.' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('staff')
      .insert({ full_name, designation, ...rest })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await supabase.from('security_logs').insert({
      action: 'staff_created',
      details: `Created staff: ${full_name} (${designation})`,
    });

    res.status(201).json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/staff/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id) {
    res.status(400).json({ error: 'Staff ID is required.' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Staff member not found.' });
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }

    await supabase.from('security_logs').insert({
      action: 'staff_updated',
      details: `Updated staff: ${id}`,
    });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/staff/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { data: existing, error: findError } = await supabase
      .from('staff')
      .select('id, full_name')
      .eq('id', id)
      .single();

    if (findError || !existing) {
      res.status(404).json({ error: 'Staff member not found.' });
      return;
    }

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await supabase.from('security_logs').insert({
      action: 'staff_deleted',
      details: `Deleted staff: ${existing.full_name} (${id})`,
    });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// Multi-Agent System - Specialized System Prompts
// ============================================================
// Future: Connect to Supabase/MongoDB here to fetch real-time data
// for each agent (student records, attendance logs, hostel data, etc.)
//
// SECURITY NOTE: When connecting a real database, ALWAYS use parameterized
// queries / prepared statements to prevent SQL injection. Never concatenate
// user input directly into query strings. Examples:
//
//   Supabase (parameterized by default):
//     const { data } = await supabase.from('students').select('*').eq('id', studentId);
//
//   Raw SQL with parameterized query:
//     const result = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
//
//   MongoDB (uses BSON, not SQL, but still sanitize inputs):
//     const student = await db.collection('students').findOne({ _id: new ObjectId(studentId) });
//
// The client-side sanitization in src/utils/sanitize.ts provides defense-in-depth
// but is NOT a substitute for server-side parameterized queries.
//
// Example:
//   import { createClient } from '@supabase/supabase-js';
//   const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
// Or with MongoDB:
//   import { MongoClient } from 'mongodb';
//   const mongoClient = new MongoClient(process.env.MONGODB_URI!);

const BASE_CONTEXT = `You are the AI assistant for शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज (Government Secondary and Higher Secondary Ashram School, Pathraj), ता. कर्जत, जि. रायगड, Maharashtra. The school operates under the Tribal Development Department, Government of Maharashtra. Principal: श्री. अजित लालासाहेब बनसोडे. The school has approximately 459 students from 1st to 12th standard. Respond in Marathi when the user writes in Marathi, and in English when they write in English. Be helpful, accurate, and concise.`;

const AGENT_PROMPTS: Record<string, string> = {
  admission: `${BASE_CONTEXT}

You are the Admission Specialist Agent. You handle all queries related to:
- Admission process and procedures
- Required documents: Student Aadhaar Card, Parent Aadhaar Card, Caste Certificate (Tribal/ST), School Leaving Certificate, Birth Certificate, Income Certificate, 2 Passport Photos, Bank Passbook Copy
- Eligibility criteria: Must belong to Scheduled Tribe (ST) category, age 6-16 years for Std 1-10, resident of Raigad district (preference), valid caste certificate from Tehsildar, family income below Rs. 2.5 lakhs/year
- For 11th-12th: Must have passed 10th from a recognized board
- Application status tracking (Application IDs follow format ASPS-2024-XXXXX)
- Admission timeline: Applications open June-July each year
- Seats available per class and reservation policies
- All documents should be self-attested
- Contact school office for queries: 02140-XXXXXX

Provide clear, step-by-step guidance for parents navigating the admission process.`,

  attendance: `${BASE_CONTEXT}

You are the Attendance Agent. You handle all queries related to:
- Student attendance records and present/absent status
- Attendance policies: Minimum 75% attendance required for exam eligibility
- Leave application process for students
- Daily attendance reporting to parents
- Biometric attendance system used for meal verification
- Monthly attendance reports
- Attendance data is tracked class-wise and student-wise
- Current school timings: 8:00 AM to 4:00 PM (Mon-Sat)
- Assembly: 7:45 AM daily

Note: When asked about specific student attendance, explain that real-time data will be available once the database is connected. For now, provide general attendance policies and procedures.`,

  hostel: `${BASE_CONTEXT}

You are the Hostel Agent. You handle all queries related to:
- Hostel capacity: 520 beds total
- Wings: Boys A, Boys B, Girls A, Girls B (130 beds each)
- Free boarding and lodging for all tribal students
- Mess schedule: Breakfast (7:00 AM), Lunch (12:30 PM), Evening Snack (5:00 PM), Dinner (7:30 PM)
- Biometric verification for meals
- Night study hours: 8:00 PM - 10:00 PM
- Bed allotment process (assigned at admission, class-wise)
- Sick bay / medical room: Basic first aid available, doctor visits twice a week
- Rector supervision 24/7
- Facilities: Library, Sports ground, Medical room, Study hall
- Hostel rules: No electronic devices, lights out at 10:30 PM, wake-up at 5:30 AM
- Laundry schedule: Twice a week
- Parent visiting hours: Sundays 10 AM - 4 PM

Provide helpful information about hostel life, facilities, and rules.`,

  academic: `${BASE_CONTEXT}

You are the Academic Agent. You handle all queries related to:
- Exam schedules: Unit Tests (monthly), Semester Exams (Oct & March), Board Exams (Feb-March for Std 10 & 12)
- Results and marks: Report cards distributed after each semester exam
- Subjects offered: Marathi, Hindi, English, Mathematics, Science, Social Studies (Std 1-10); Science/Commerce streams for 11-12
- Grading system: Marks-based for board classes, grade-based for lower classes
- Supplementary exams for failed students
- Scholarship exams: Tribal scholarship exam, National Merit Scholarship
- Extra coaching: Special classes for 10th and 12th board exam preparation
- Academic calendar highlights
- Teacher contact and subject allocation
- Progress reports and parent-teacher meetings (held quarterly)

Provide accurate academic information and guidance on exam preparation.`,

  general: `${BASE_CONTEXT}

You are the General Information Agent. You handle all queries related to:
- School history and background: Established under Tribal Development Dept
- Contact information: School office 02140-XXXXXX, located at Pathraj, Tal. Karjat, Dist. Raigad
- Tribal scholarships: Post-matric scholarship, Pre-matric scholarship for ST students, Government of India scholarships
- School facilities: Computer lab, Science lab, Library, Sports ground, Playground
- Transport: No school bus; students reside in hostel
- School events: Annual sports day, Republic Day, Independence Day celebrations, cultural programs
- Staff information: Teaching staff of ~30 members
- School timings: 8:00 AM - 4:00 PM
- Uniform details and where to purchase
- Fee structure: Education is free; government covers all expenses for tribal students
- Any other general queries about the school

Be warm, helpful, and guide users to the appropriate department if needed.`,
};

// ============================================================
// Intent Detection - Routes queries to the appropriate agent
// ============================================================

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Admission-related keywords (English and Marathi transliterations)
  const admissionKeywords = [
    'admission', 'admit', 'enroll', 'enrollment', 'document', 'documents',
    'eligibility', 'eligible', 'application', 'apply', 'seat', 'seats',
    'प्रवेश', 'कागदपत्र', 'पात्रता', 'अर्ज', 'दाखला', 'certificate',
    'aadhaar', 'aadhar', 'आधार', 'income', 'उत्पन्न', 'caste', 'जात',
    'age limit', 'criteria', 'requirement', 'required',
  ];

  // Attendance-related keywords
  const attendanceKeywords = [
    'attendance', 'present', 'absent', 'leave', 'holiday',
    'उपस्थिती', 'हजेरी', 'गैरहजर', 'सुट्टी', 'रजा',
    'absent today', 'present today', 'percentage', 'report',
  ];

  // Hostel-related keywords
  const hostelKeywords = [
    'hostel', 'bed', 'mess', 'food', 'meal', 'dinner', 'lunch', 'breakfast',
    'boarding', 'lodging', 'room', 'rector', 'warden', 'sick', 'medical',
    'वसतिगृह', 'जेवण', 'खोली', 'भोजन', 'नाश्ता', 'बेड',
    'laundry', 'visiting', 'night study',
  ];

  // Academic-related keywords
  const academicKeywords = [
    'exam', 'exams', 'result', 'results', 'marks', 'grade', 'score',
    'schedule', 'timetable', 'syllabus', 'subject', 'board',
    'परीक्षा', 'निकाल', 'गुण', 'वेळापत्रक', 'अभ्यासक्रम',
    'scholarship', 'merit', 'topper', 'pass', 'fail', 'supplementary',
    'unit test', 'semester', 'शिष्यवृत्ती',
  ];

  // Score each agent based on keyword matches
  const scores: Record<string, number> = {
    admission: 0,
    attendance: 0,
    hostel: 0,
    academic: 0,
  };

  for (const keyword of admissionKeywords) {
    if (lowerMessage.includes(keyword)) scores.admission++;
  }
  for (const keyword of attendanceKeywords) {
    if (lowerMessage.includes(keyword)) scores.attendance++;
  }
  for (const keyword of hostelKeywords) {
    if (lowerMessage.includes(keyword)) scores.hostel++;
  }
  for (const keyword of academicKeywords) {
    if (lowerMessage.includes(keyword)) scores.academic++;
  }

  // Find the agent with the highest score, using a priority array for
  // deterministic tie-breaking when multiple agents score equally
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'general';

  const priority = ['admission', 'attendance', 'hostel', 'academic'];
  const topAgent = priority.find((agent) => scores[agent] === maxScore);
  return topAgent || 'general';
}

// ============================================================
// AI Chat Endpoint with Multi-Agent Routing
// ============================================================

app.post('/api/ai-chat', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(clientIp, chatRateLimitStore)) {
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
    // Detect intent and route to appropriate agent
    const intent = detectIntent(message);
    const systemPrompt = AGENT_PROMPTS[intent];

    // Future: Query database for real-time data based on intent
    // For example:
    //   if (intent === 'attendance') {
    //     const attendanceData = await supabase.from('attendance').select('*').eq('date', today);
    //     // Append real data to the prompt or message context
    //   }

    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: message,
      config: {
        systemInstruction: systemPrompt,
      },
    });
    const text = result.text ?? 'Sorry, I could not generate a response.';
    res.json({ response: text, agent: intent });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request. Please try again.' });
  }
});

app.post('/api/voice/tts', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(clientIp, ttsRateLimitStore)) {
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
