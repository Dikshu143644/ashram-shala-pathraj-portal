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
    console.warn('[CONTENT SAFETY] No GEMINI_API_KEY configured, blocking upload (fail-closed).');
    return { safe: false, score: 0.0, reasons: ['Content safety not configured - uploads blocked'] };
  }

  try {
    // Fetch the image and base64-encode it for Gemini Vision
    const imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(15_000) });
    if (!imageResponse.ok) {
      console.error(`[CONTENT SAFETY] Failed to fetch image (${imageResponse.status}): ${imageUrl}`);
      return { safe: false, score: 0.0, reasons: ['Unable to fetch image for analysis'] };
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.split(';')[0].trim();
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const base64Data = imageBuffer.toString('base64');

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
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
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
      // Fail-closed: block upload when API is unavailable
      return { safe: false, score: 0.0, reasons: ['Safety API unavailable - please retry later'] };
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

    // If parsing fails, fail-closed
    return { safe: false, score: 0.0, reasons: ['Could not parse safety response - please retry'] };
  } catch (error) {
    console.error('Content safety analysis failed:', error instanceof Error ? error.message : error);
    // Fail-closed: block upload when analysis fails
    return { safe: false, score: 0.0, reasons: ['Analysis error - please retry later'] };
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

        // Log unsafe content and enforce server-side by flagging the gallery image
        if (!result.safe) {
          // Update gallery_images safety_status to 'flagged'
          const { error: updateError } = await supabase
            .from('gallery_images')
            .update({ safety_status: 'flagged', safety_score: result.score })
            .eq('url', imageUrl.trim());

          if (updateError) {
            console.error('Failed to flag gallery image:', updateError.message);
          }

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
        } else {
          // Mark the image as approved
          await supabase
            .from('gallery_images')
            .update({ safety_status: 'approved', safety_score: result.score })
            .eq('url', imageUrl.trim());
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
