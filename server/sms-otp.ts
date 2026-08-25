import { createHash } from 'node:crypto';
import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

const OTP_EXPIRY_MS = 10 * 60_000; // 10 minutes
const SMS_RATE_LIMIT_WINDOW_MS = 15 * 60_000; // 15 minutes
const SMS_RATE_LIMIT_MAX = 3;

// In-memory rate limiting per phone for SMS sends
const smsPhoneRateMap = new Map<string, { count: number; windowStart: number }>();

function generateOtp(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return digits.toString();
}

function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

function isValidIndianMobile(phone: unknown): phone is string {
  return typeof phone === 'string' && /^[6-9]\d{9}$/.test(phone);
}

function isPhoneRateLimited(phone: string): boolean {
  const now = Date.now();
  const entry = smsPhoneRateMap.get(phone);

  if (!entry || now - entry.windowStart > SMS_RATE_LIMIT_WINDOW_MS) {
    smsPhoneRateMap.set(phone, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= SMS_RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

interface SmsResult {
  success: boolean;
  error?: string;
}

async function sendSmsFast2sms(phone: string, otp: string): Promise<SmsResult> {
  const apiKey = process.env.FAST2SMS_API_KEY?.trim();

  if (!apiKey) {
    // Dev mode: log OTP to console
    console.log(`[SMS-OTP DEV MODE] OTP for ${phone}: ${otp}`);
    return { success: true };
  }

  // Try "otp" route first
  try {
    const otpResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: phone,
        flash: 0,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const otpResult = await otpResponse.json().catch(() => null);
    console.log('[Fast2SMS] OTP route response:', JSON.stringify(otpResult));

    if (otpResult?.return === true) {
      return { success: true };
    }

    // Check for status codes 996 (website verification needed) or 999 (insufficient balance)
    const statusCode = otpResult?.status_code ?? otpResult?.statusCode;
    if (statusCode === 996 || statusCode === 999) {
      console.warn(`[Fast2SMS] OTP route failed with status ${statusCode}, trying v3 route...`);
    } else if (!otpResponse.ok) {
      console.error(`[Fast2SMS] OTP route HTTP error (${otpResponse.status})`);
    }
  } catch (error) {
    console.error('[Fast2SMS] OTP route request failed:', error instanceof Error ? error.message : error);
  }

  // Fallback: try "v3" route
  try {
    const v3Response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'v3',
        sender_id: 'ASHRAM',
        message: `Your OTP for Pathraj Ashram Shala portal is: ${otp}. Valid for 10 minutes.`,
        numbers: phone,
        flash: 0,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const v3Result = await v3Response.json().catch(() => null);
    console.log('[Fast2SMS] v3 route response:', JSON.stringify(v3Result));

    if (v3Result?.return === true) {
      return { success: true };
    }

    const v3Status = v3Result?.status_code ?? v3Result?.statusCode;
    const errorDetail = v3Status === 996
      ? 'SMS service requires website verification. Please verify email instead.'
      : v3Status === 999
        ? 'SMS service requires recharge. Please verify email instead.'
        : 'SMS delivery failed. Please verify email instead.';

    console.error(`[Fast2SMS] v3 route also failed (status: ${v3Status})`);
    return { success: false, error: errorDetail };
  } catch (error) {
    console.error('[Fast2SMS] v3 route request failed:', error instanceof Error ? error.message : error);
    return { success: false, error: 'SMS service unavailable. Please verify email instead.' };
  }
}

export function registerSmsOtpRoutes(app: Express, supabase: SupabaseClient): void {
  // POST /api/auth/sms/send-otp
  app.post('/api/auth/sms/send-otp', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');

    const { phone } = req.body as { phone?: unknown };

    if (!isValidIndianMobile(phone)) {
      res.status(400).json({ success: false, error: 'A valid 10-digit Indian mobile number is required.' });
      return;
    }

    // Rate limit check
    if (isPhoneRateLimited(phone)) {
      res.setHeader('Retry-After', String(Math.ceil(SMS_RATE_LIMIT_WINDOW_MS / 1000)));
      res.status(429).json({
        success: false,
        error: 'Too many OTP requests for this number. Please try again after 15 minutes.',
        retryAfter: Math.ceil(SMS_RATE_LIMIT_WINDOW_MS / 1000),
      });
      return;
    }

    try {
      const otp = generateOtp();
      const otpHashed = hashOtp(otp);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS).toISOString();

      // Store OTP hash in Supabase
      const { error: insertError } = await supabase.from('sms_otp_codes').insert({
        phone,
        otp_hash: otpHashed,
        expires_at: expiresAt,
        verified: false,
      });

      if (insertError) {
        console.error('Failed to store SMS OTP:', insertError.message);
        res.status(500).json({ success: false, error: 'Unable to generate OTP. Please try again.' });
        return;
      }

      // Send SMS
      const smsResult = await sendSmsFast2sms(phone, otp);
      if (!smsResult.success) {
        res.status(502).json({
          success: false,
          error: smsResult.error || 'Failed to send SMS. Please try again.',
          smsUnavailable: true,
        });
        return;
      }

      res.json({
        success: true,
        message: 'OTP sent successfully.',
        expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
      });
    } catch (error) {
      console.error('SMS OTP send error:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Unable to send OTP.' });
    }
  });

  // POST /api/auth/sms/verify-otp
  app.post('/api/auth/sms/verify-otp', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');

    const { phone, otp } = req.body as { phone?: unknown; otp?: unknown };

    if (!isValidIndianMobile(phone)) {
      res.status(400).json({ success: false, error: 'A valid 10-digit Indian mobile number is required.' });
      return;
    }

    if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      res.status(400).json({ success: false, error: 'A valid 6-digit OTP is required.' });
      return;
    }

    try {
      const otpHashed = hashOtp(otp);

      // Find matching unexpired, unverified OTP
      const { data, error } = await supabase
        .from('sms_otp_codes')
        .select('id,otp_hash,expires_at,verified')
        .eq('phone', phone)
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('SMS OTP lookup error:', error.message);
        res.status(500).json({ success: false, error: 'Unable to verify OTP.' });
        return;
      }

      if (!data) {
        res.status(400).json({ success: false, error: 'OTP is invalid or expired. Please request a new one.' });
        return;
      }

      // Verify hash match
      if (data.otp_hash !== otpHashed) {
        res.status(401).json({ success: false, error: 'Invalid OTP. Please check and try again.' });
        return;
      }

      // Mark as verified
      const { error: updateError } = await supabase
        .from('sms_otp_codes')
        .update({ verified: true })
        .eq('id', data.id);

      if (updateError) {
        console.error('SMS OTP verification update error:', updateError.message);
        res.status(500).json({ success: false, error: 'Unable to complete verification.' });
        return;
      }

      res.json({
        success: true,
        message: 'Phone number verified successfully.',
        phone,
      });
    } catch (error) {
      console.error('SMS OTP verify error:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Unable to verify OTP.' });
    }
  });

  // Periodic cleanup of rate limit map
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of smsPhoneRateMap.entries()) {
      if (now - entry.windowStart > SMS_RATE_LIMIT_WINDOW_MS) {
        smsPhoneRateMap.delete(key);
      }
    }
  }, 5 * 60_000);
  cleanupTimer.unref();
}
