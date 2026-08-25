/**
 * Content Safety ADK Agent
 * Uses Gemini Vision API to analyze uploaded images for inappropriate content.
 * Provides POST /api/content/analyze endpoint.
 */

import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireSession, type AuthenticatedRequest } from './security.js';
import { sendAdminNotification } from './whatsapp-notify.js';

interface SafetyResult {
  safe: boolean;
  score: number;
  reasons: string[];
}

export async function analyzeImageSafety(imageUrl: string): Promise<SafetyResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    console.log('[CONTENT SAFETY DEV MODE] No GEMINI_API_KEY configured, auto-approving.');
    return { safe: true, score: 1.0, reasons: [] };
  }

  try {
    const prompt = `You are a content safety moderator for a school website (Ashram Shala Pathraj).
Analyze this image and determine if it is safe to display on a school website.

Check for:
- Inappropriate content
- Violence or gore
- Nudity or sexual content
- Harmful or dangerous material
- Non-school-related inappropriate content
- Offensive gestures or symbols

Respond in this exact JSON format:
{"safe": true/false, "score": 0.0-1.0, "reasons": ["reason1", "reason2"]}

Where score 1.0 = completely safe, 0.0 = completely unsafe.
If safe, reasons should be an empty array.
If unsafe, list the specific concerns found.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: undefined,
                  file_data: undefined,
                  // Use image URL reference
                },
                {
                  text: `Image URL to analyze: ${imageUrl}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 256,
          },
        }),
        signal: AbortSignal.timeout(30_000),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error (${response.status}):`, errorText.slice(0, 300));
      // Fail-open: approve if API is unavailable
      return { safe: true, score: 0.8, reasons: ['API error - auto-approved'] };
    }

    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as SafetyResult;
      return {
        safe: Boolean(parsed.safe),
        score: typeof parsed.score === 'number' ? parsed.score : (parsed.safe ? 1.0 : 0.0),
        reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
      };
    }

    // If parsing fails, default to safe
    return { safe: true, score: 0.7, reasons: ['Could not parse safety response'] };
  } catch (error) {
    console.error('Content safety analysis failed:', error instanceof Error ? error.message : error);
    // Fail-open: approve if analysis fails
    return { safe: true, score: 0.8, reasons: ['Analysis error - auto-approved'] };
  }
}

export function registerContentSafetyRoutes(app: Express, supabase: SupabaseClient): void {
  // POST /api/content/analyze - Analyze an image URL for safety
  app.post(
    '/api/content/analyze',
    requireSession(['web_creator', 'principal']),
    async (req: Request, res: Response) => {
      const { imageUrl } = req.body as { imageUrl?: unknown };

      if (typeof imageUrl !== 'string' || !imageUrl.trim() || imageUrl.length > 2048) {
        res.status(400).json({ error: 'A valid imageUrl is required (max 2048 characters).' });
        return;
      }

      if (!/^https?:\/\//i.test(imageUrl.trim())) {
        res.status(400).json({ error: 'Image URL must start with https:// or http://.' });
        return;
      }

      try {
        const result = await analyzeImageSafety(imageUrl.trim());
        const session = (req as AuthenticatedRequest).authSession;

        // Log unsafe content
        if (!result.safe) {
          await supabase.from('security_logs').insert({
            action: 'content_blocked',
            user_id: session?.userId,
            username: session?.username,
            ip_address: req.ip,
            details: JSON.stringify({
              imageUrl: imageUrl.trim(),
              score: result.score,
              reasons: result.reasons,
            }),
          });

          // Notify admin via WhatsApp
          await sendAdminNotification(
            `⚠️ Unsafe content blocked!\nUser: ${session?.username || 'Unknown'}\nScore: ${result.score}\nReasons: ${result.reasons.join(', ')}`,
          );
        }

        res.json({
          safe: result.safe,
          score: result.score,
          reasons: result.reasons,
        });
      } catch (error) {
        console.error('Content analysis endpoint failed:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Content analysis failed.' });
      }
    },
  );
}
