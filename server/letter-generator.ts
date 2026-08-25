import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireSession, type AuthenticatedRequest } from './security.js';

const LETTER_TYPES = [
  'admission_confirmation',
  'transfer_certificate',
  'fee_reminder',
  'leave_approval',
  'event_invitation',
  'general',
] as const;

type LetterType = typeof LETTER_TYPES[number];

const LETTER_TYPE_LABELS: Record<LetterType, string> = {
  admission_confirmation: 'Admission Confirmation Letter',
  transfer_certificate: 'Transfer Certificate Cover Letter',
  fee_reminder: 'Fee Reminder Letter',
  leave_approval: 'Leave Approval Letter',
  event_invitation: 'Event Invitation Letter',
  general: 'General Official Letter',
};

const SCHOOL_LETTERHEAD = `
शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज
Government Secondary & Higher Secondary Ashram School, Pathraj
Taluka Karjat, District Raigad, Maharashtra - 410201
Phone: 9423864391 / 7666971183 | Email: hmpathraj22@gmail.com
Under: Tribal Development Department, Government of Maharashtra
`.trim();

const SYSTEM_PROMPT = `You are an official letter generator for ${SCHOOL_LETTERHEAD}.

Generate professional school letters in the requested language (Hindi, Marathi, or English).
Include proper formatting with:
- School letterhead information at the top
- Date
- Reference number placeholder (Ref: ____/2025-26)
- Proper salutation and closing
- Principal's signature block at the bottom

The letter should be formal, professional, and ready to print.
Return the letter in clean HTML format with inline styles suitable for printing.
Use a professional font stack. Do not use markdown - only return valid HTML.`;

function textFromGemini(data: unknown): string | null {
  const payload = data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const parts = payload.candidates?.[0]?.content?.parts;
  const text = parts?.map((part) => part.text || '').join('').trim();
  return text || null;
}

async function generateLetterWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2000 },
      }),
      signal: AbortSignal.timeout(20_000),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const text = textFromGemini(await response.json());
  if (!text) throw new Error('Gemini returned an empty response');

  return text;
}

export function registerLetterGeneratorRoutes(app: Express, _supabase: SupabaseClient): void {
  // POST /api/ai/generate-letter
  app.post('/api/ai/generate-letter', requireSession(), async (req: Request, res: Response) => {
    const _authReq = req as AuthenticatedRequest;
    res.setHeader('Cache-Control', 'no-store');

    const { type, studentName, parentName, subject, details, language } = req.body as {
      type?: unknown;
      studentName?: unknown;
      parentName?: unknown;
      subject?: unknown;
      details?: unknown;
      language?: unknown;
    };

    // Validate letter type
    if (typeof type !== 'string' || !LETTER_TYPES.includes(type as LetterType)) {
      res.status(400).json({
        success: false,
        error: `Invalid letter type. Must be one of: ${LETTER_TYPES.join(', ')}`,
      });
      return;
    }

    // Validate required fields
    if (typeof studentName !== 'string' || !studentName.trim()) {
      res.status(400).json({ success: false, error: 'Student name is required.' });
      return;
    }

    const effectiveLanguage = typeof language === 'string' && ['en', 'mr', 'hi'].includes(language) ? language : 'en';
    const effectiveSubject = typeof subject === 'string' && subject.trim() ? subject.trim() : LETTER_TYPE_LABELS[type as LetterType];
    const effectiveDetails = typeof details === 'string' && details.trim() ? details.trim() : '';
    const effectiveParentName = typeof parentName === 'string' && parentName.trim() ? parentName.trim() : 'Parent/Guardian';

    const languageLabel = effectiveLanguage === 'mr' ? 'Marathi' : effectiveLanguage === 'hi' ? 'Hindi' : 'English';

    const userPrompt = `Generate a ${LETTER_TYPE_LABELS[type as LetterType]} in ${languageLabel} language.

Details:
- Letter Type: ${LETTER_TYPE_LABELS[type as LetterType]}
- Student Name: ${studentName.toString().trim()}
- Parent/Guardian Name: ${effectiveParentName}
- Subject: ${effectiveSubject}
${effectiveDetails ? `- Additional Details: ${effectiveDetails}` : ''}
- Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}

Generate the complete letter in HTML format with proper school letterhead, formal tone, and signature block. The HTML should be ready for printing with inline CSS styles.`;

    try {
      const letter = await generateLetterWithGemini(userPrompt);

      res.json({
        success: true,
        letter,
        format: 'html',
      });
    } catch (error) {
      console.error('Letter generation failed:', error instanceof Error ? error.message : error);
      res.status(500).json({
        success: false,
        error: 'Unable to generate letter. Please try again.',
      });
    }
  });
}
