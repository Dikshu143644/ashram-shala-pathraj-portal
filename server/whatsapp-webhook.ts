import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

// Re-use the bot system prompt from whatsapp-bot.ts
const BOT_NAME = 'आश्रमशाळा पाथरज सहाय्यक';

const WHATSAPP_BOT_SYSTEM_PROMPT = `You are "${BOT_NAME}" - the official AI assistant for शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज (Government Secondary and Higher Secondary Ashram School, Pathraj), Taluka Karjat, District Raigad, Maharashtra.

## School Information
- Principal: श्री. अजित लालासाहेब बनसोडे (Mobile: 9423864391)
- Vice Principal: श्री. पाटील विजय दत्तात्रय
- Office Clerk: श्री. शिंदे रवींद्र (Mobile: 7666971183)
- Email: hmpathraj22@gmail.com
- Department: Tribal Development Department, Government of Maharashtra
- Total Students: 459 (Boys: 267, Girls: 192)
- Standards: 1st to 12th (11th-12th: Arts stream, Marathi medium)
- Hostel Capacity: 520 beds

## Capabilities
1. Attendance info, 2. Exam Schedule, 3. PTM dates, 4. Hostel/Mess info, 5. Holiday calendar, 6. Health updates, 7. Staff contacts, 8. Admission guidance, 9. Daily routine, 10. Fees info

## Response Rules
- Keep responses UNDER 200 words
- Use emojis to make responses friendly
- Use bullet points for lists
- Default language: Marathi. Switch to English ONLY if the user writes in English.
- ALWAYS end every response with: "आणखी काही मदत हवी असल्यास विचारा 🙏"
- Be warm, helpful, and concise like a school teacher
- Use respectful Marathi with appropriate honorifics (आपण/तुम्ही)`;

const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 12_000);

// ─── Helper: Check if WhatsApp is configured ───────────────────────────────────

function isWhatsAppConfigured(): boolean {
  return !!(
    process.env.WHATSAPP_TOKEN?.trim() &&
    process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
  );
}

// ─── Helper: Send WhatsApp message via Meta Cloud API ──────────────────────────

export async function sendWhatsAppMessage(
  phone: string,
  message: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();

  if (!token || !phoneNumberId) {
    console.warn('[WhatsApp Webhook] WhatsApp not configured - set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID env vars');
    return {
      success: false,
      error: 'WhatsApp not configured - set WHATSAPP_TOKEN env var',
    };
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      console.error(`[WhatsApp Webhook] Send failed (HTTP ${response.status}):`, errorBody);
      return { success: false, error: `HTTP ${response.status}: ${errorBody}` };
    }

    const data = await response.json() as { messages?: Array<{ id?: string }> };
    const messageId = data.messages?.[0]?.id;
    return { success: true, messageId };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[WhatsApp Webhook] Send error:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

// ─── Helper: Call Gemini AI ────────────────────────────────────────────────────

function textFromGemini(data: unknown): string | null {
  const payload = data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const parts = payload.candidates?.[0]?.content?.parts;
  const text = parts?.map((part) => part.text || '').join('').trim();
  return text || null;
}

async function callGeminiForWhatsApp(message: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';

  if (!apiKey) {
    return 'AI assistant is not configured. Please contact the school office at 9423864391.';
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: WHATSAPP_BOT_SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini API HTTP ${response.status}`);
  }

  const text = textFromGemini(await response.json());
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

// ─── Helper: Delay ─────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Route Registration ────────────────────────────────────────────────────────

export function registerWhatsAppWebhookRoutes(app: Express, supabase: SupabaseClient): void {
  // ─── GET /api/whatsapp/webhook - Meta verification endpoint ──────────────────
  app.get('/api/whatsapp/webhook', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'] as string | undefined;
    const token = req.query['hub.verify_token'] as string | undefined;
    const challenge = req.query['hub.challenge'] as string | undefined;

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim();

    if (!verifyToken) {
      console.warn('[WhatsApp Webhook] WHATSAPP_VERIFY_TOKEN not set');
      res.status(403).send('Verification token not configured');
      return;
    }

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[WhatsApp Webhook] Verification successful');
      res.status(200).send(challenge || '');
      return;
    }

    console.warn('[WhatsApp Webhook] Verification failed - token mismatch');
    res.status(403).send('Forbidden');
  });

  // ─── POST /api/whatsapp/webhook - Incoming message handler ───────────────────
  app.post('/api/whatsapp/webhook', async (req: Request, res: Response) => {
    // Always respond 200 quickly to Meta (they retry on non-200)
    res.status(200).json({ status: 'received' });

    try {
      const body = req.body;

      // Validate webhook structure
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value || !value.messages || value.messages.length === 0) {
        return; // Not a message event (could be status update)
      }

      const messageData = value.messages[0];
      const senderPhone = messageData.from; // sender phone number (without +)
      const messageType = messageData.type; // text, image, audio, etc.

      // Only handle text messages
      if (messageType !== 'text' || !messageData.text?.body) {
        if (senderPhone) {
          await sendWhatsAppMessage(
            senderPhone,
            'क्षमस्व, मी फक्त मजकूर संदेश (text messages) वाचू शकतो. कृपया मराठी किंवा इंग्रजीत लिहा. आणखी काही मदत हवी असल्यास विचारा 🙏',
          );
        }
        return;
      }

      const messageText = messageData.text.body;

      // Check if phone number belongs to a verified parent
      const normalizedPhone = senderPhone.replace(/^\+/, '');
      const last10 = normalizedPhone.slice(-10);

      const { data: parentUser } = await supabase
        .from('auth_users')
        .select('id, mobile_number, role')
        .or(`mobile_number.eq.${normalizedPhone},mobile_number.eq.+91${last10},mobile_number.eq.${last10}`)
        .limit(1);

      let aiResponse: string;

      if (!parentUser || parentUser.length === 0) {
        // Not a verified parent - send welcome message
        aiResponse = `नमस्कार! 🙏 मी ${BOT_NAME} आहे.\n\nतुमचा फोन नंबर आमच्या शाळेच्या नोंदणीत सापडला नाही. कृपया शाळेच्या कार्यालयात संपर्क करा:\n📞 प्राचार्य: 9423864391\n📞 कार्यालय: 7666971183\n\nनोंदणीकृत पालकांना हजेरी, परीक्षा, PTM आणि इतर माहिती मिळू शकते.\n\nआणखी काही मदत हवी असल्यास विचारा 🙏`;
      } else {
        // Verified parent - process with Gemini AI
        try {
          aiResponse = await callGeminiForWhatsApp(messageText);
        } catch (err) {
          console.error('[WhatsApp Webhook] Gemini error:', err instanceof Error ? err.message : err);
          aiResponse = 'क्षमस्व, तांत्रिक अडचणीमुळे सध्या उत्तर देता येत नाही. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा. आणखी काही मदत हवी असल्यास विचारा 🙏';
        }
      }

      // Send the response back via WhatsApp
      await sendWhatsAppMessage(senderPhone, aiResponse);

      // Store conversation in database
      try {
        await supabase.from('whatsapp_conversations').insert({
          phone_number: senderPhone,
          sender: 'parent',
          message: messageText,
          ai_response: aiResponse,
        });
      } catch (dbErr) {
        console.error('[WhatsApp Webhook] Failed to store conversation:', dbErr);
      }
    } catch (err) {
      console.error('[WhatsApp Webhook] Error processing incoming message:', err);
    }
  });

  // ─── POST /api/whatsapp/send - Send message to a specific phone number ───────
  app.post('/api/whatsapp/send', async (req: Request, res: Response) => {
    const { phone_number, message } = req.body as { phone_number?: string; message?: string };

    if (!phone_number || typeof phone_number !== 'string' || !phone_number.trim()) {
      res.status(400).json({ error: 'phone_number is required.' });
      return;
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'message is required.' });
      return;
    }

    if (message.length > 4096) {
      res.status(400).json({ error: 'Message too long. Maximum 4096 characters.' });
      return;
    }

    const result = await sendWhatsAppMessage(phone_number.trim(), message.trim());

    if (result.success) {
      // Log the sent message
      try {
        await supabase.from('whatsapp_conversations').insert({
          phone_number: phone_number.trim(),
          sender: 'school',
          message: message.trim(),
          ai_response: null,
        });
      } catch {
        // Non-critical - don't fail the request
      }

      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(502).json({ success: false, error: result.error });
    }
  });

  // ─── POST /api/whatsapp/broadcast - Send message to ALL parents ──────────────
  app.post('/api/whatsapp/broadcast', async (req: Request, res: Response) => {
    const { message } = req.body as { message?: string };

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'message is required.' });
      return;
    }

    if (message.length > 4096) {
      res.status(400).json({ error: 'Message too long. Maximum 4096 characters.' });
      return;
    }

    if (!isWhatsAppConfigured()) {
      console.warn('[WhatsApp Webhook] Broadcast attempted but WhatsApp not configured');
      res.json({
        sent: 0,
        failed: 0,
        total: 0,
        warning: 'WhatsApp not configured - set WHATSAPP_TOKEN env var. No messages were sent.',
      });
      return;
    }

    try {
      // Fetch all parent phone numbers from students table (guardian_mobile)
      const { data: students, error } = await supabase
        .from('students')
        .select('guardian_mobile')
        .not('guardian_mobile', 'is', null);

      if (error) {
        console.error('[WhatsApp Webhook] Failed to fetch student guardians:', error.message);
        res.status(500).json({ error: 'Failed to fetch parent phone numbers.' });
        return;
      }

      // Deduplicate phone numbers
      const phoneNumbers = [...new Set(
        (students || [])
          .map((s: { guardian_mobile?: string | null }) => s.guardian_mobile?.trim())
          .filter((p): p is string => !!p && p.length >= 10),
      )];

      if (phoneNumbers.length === 0) {
        res.json({ sent: 0, failed: 0, total: 0, warning: 'No parent phone numbers found in records.' });
        return;
      }

      let sent = 0;
      let failed = 0;
      const total = phoneNumbers.length;
      const BATCH_SIZE = 50;

      // Process in batches of 50 with 1s delay between batches
      for (let i = 0; i < phoneNumbers.length; i += BATCH_SIZE) {
        const batch = phoneNumbers.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          batch.map((phone) => sendWhatsAppMessage(phone, message.trim())),
        );

        for (const result of results) {
          if (result.status === 'fulfilled' && result.value.success) {
            sent++;
          } else {
            failed++;
          }
        }

        // Delay between batches (skip after last batch)
        if (i + BATCH_SIZE < phoneNumbers.length) {
          await delay(1000);
        }
      }

      // Log broadcast
      try {
        await supabase.from('whatsapp_conversations').insert({
          phone_number: 'BROADCAST',
          sender: 'school',
          message: `[Broadcast to ${total} parents] ${message.trim()}`,
          ai_response: null,
        });
      } catch {
        // Non-critical
      }

      res.json({ sent, failed, total });
    } catch (err) {
      console.error('[WhatsApp Webhook] Broadcast error:', err);
      res.status(500).json({ error: 'Broadcast failed due to an internal error.' });
    }
  });
}
