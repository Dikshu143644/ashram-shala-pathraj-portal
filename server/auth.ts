import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

const RATE_LIMIT_WINDOW_SECONDS = 60;
const LOGIN_ATTEMPTS_PER_WINDOW = 5;
const OTP_ATTEMPTS_PER_WINDOW = 10;
const CHALLENGE_TTL_MS = 10 * 60_000;
const OTP_TTL_MS = 10 * 60_000;
const RESEND_COOLDOWN_MS = 60_000;
const MAX_SENDS = 3;
const MAX_VERIFY_ATTEMPTS = 5;

interface OtpVerification {
  id: string;
  user_id: string;
  challenge_hash: string;
  otp_hash: string | null;
  expires_at: string;
  otp_expires_at: string | null;
  send_count: number;
  attempt_count: number;
  last_sent_at: string | null;
  consumed_at: string | null;
}

interface AuthUserRow {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  name_en: string;
  name_mr: string;
  email: string | null;
}

async function isRateLimited(
  supabase: SupabaseClient,
  bucket: 'login' | 'otp_send' | 'otp_verify',
  key: string,
  maximum: number,
): Promise<boolean> {
  const keyHash = createHash('sha256').update(key).digest('hex');
  const { data, error } = await supabase.rpc('consume_auth_rate_limit', {
    p_bucket: bucket,
    p_key_hash: keyHash,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    p_max_attempts: maximum,
  });
  if (error) throw error;
  return data !== true;
}

function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function challengeHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function otpHash(challenge: string, code: string, secret: string): string {
  return createHmac('sha256', secret).update(`${challenge}:${code}`).digest('hex');
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return 'your registered email';
  const visible = localPart.slice(0, Math.min(2, localPart.length));
  return `${visible}${'*'.repeat(Math.max(3, localPart.length - visible.length))}@${domain}`;
}

function validChallengeToken(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
}

async function logSecurity(
  supabase: SupabaseClient,
  event: { action: string; userId?: string; username?: string; ip: string; details: string },
): Promise<void> {
  const { error } = await supabase.from('security_logs').insert({
    action: event.action,
    user_id: event.userId,
    username: event.username,
    ip_address: event.ip,
    details: event.details,
  });
  if (error) console.error(`Security log failed for ${event.action}:`, error.message);
}

async function loadChallenge(supabase: SupabaseClient, hash: string): Promise<OtpVerification | null> {
  const { data, error } = await supabase
    .from('otp_verifications')
    .select('id,user_id,challenge_hash,otp_hash,expires_at,otp_expires_at,send_count,attempt_count,last_sent_at,consumed_at')
    .eq('challenge_hash', hash)
    .is('consumed_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as OtpVerification | null;
}

async function loadActiveUser(supabase: SupabaseClient, userId: string): Promise<AuthUserRow | null> {
  const { data, error } = await supabase
    .from('auth_users')
    .select('id,username,password_hash,role,name_en,name_mr,email')
    .eq('id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data as AuthUserRow | null;
}

function otpConfiguration(): { resendApiKey: string; resendFromEmail: string; hmacSecret: string } | null {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  const hmacSecret = process.env.OTP_HMAC_SECRET?.trim();
  if (!resendApiKey || !resendFromEmail || !hmacSecret || hmacSecret.length < 32) return null;
  return { resendApiKey, resendFromEmail, hmacSecret };
}

export function registerAuthRoutes(app: Express, supabase: SupabaseClient): void {
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const ip = clientIp(req);
    res.setHeader('Cache-Control', 'no-store');

    try {
      if (await isRateLimited(supabase, 'login', ip, LOGIN_ATTEMPTS_PER_WINDOW)) {
        res.status(429).json({ success: false, error: 'Too many login attempts. Please try again after 1 minute.' });
        return;
      }
    } catch (error) {
      console.error('Login rate limit unavailable:', error instanceof Error ? error.message : error);
      res.status(503).json({ success: false, error: 'Authentication service is temporarily unavailable.' });
      return;
    }

    const { username, password } = req.body as { username?: unknown; password?: unknown };
    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
      res.status(400).json({ success: false, error: 'Username and password are required.' });
      return;
    }
    if (username.length > 50 || password.length > 100) {
      res.status(400).json({ success: false, error: 'Invalid credentials.' });
      return;
    }

    try {
      const normalizedUsername = username.trim();
      const { data, error } = await supabase
        .from('auth_users')
        .select('id,username,password_hash,role,name_en,name_mr,email')
        .eq('username', normalizedUsername)
        .eq('is_active', true)
        .maybeSingle();
      const user = data as AuthUserRow | null;

      if (error || !user || user.password_hash !== password) {
        await logSecurity(supabase, {
          action: 'login_failed',
          username: normalizedUsername,
          ip,
          details: 'Invalid username or password',
        });
        res.status(401).json({ success: false, error: 'Invalid username or password.' });
        return;
      }

      if (!user.email) {
        await logSecurity(supabase, {
          action: 'otp_unavailable',
          userId: user.id,
          username: user.username,
          ip,
          details: 'No OTP email configured for account',
        });
        res.status(403).json({ success: false, error: 'Email verification is not configured for this account.' });
        return;
      }

      const challengeToken = randomBytes(32).toString('hex');
      const hash = challengeHash(challengeToken);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + CHALLENGE_TTL_MS).toISOString();

      await supabase
        .from('otp_verifications')
        .update({ consumed_at: now.toISOString(), updated_at: now.toISOString() })
        .eq('user_id', user.id)
        .is('consumed_at', null);

      const { error: insertError } = await supabase.from('otp_verifications').insert({
        user_id: user.id,
        challenge_hash: hash,
        expires_at: expiresAt,
        request_ip: ip,
      });
      if (insertError) throw insertError;

      await logSecurity(supabase, {
        action: 'password_verified',
        userId: user.id,
        username: user.username,
        ip,
        details: 'Password verified; OTP challenge created',
      });

      res.json({
        success: true,
        otpRequired: true,
        challengeToken,
        maskedEmail: maskEmail(user.email),
        expiresInSeconds: CHALLENGE_TTL_MS / 1000,
      });
    } catch (error) {
      console.error('Password verification failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Unable to start email verification.' });
    }
  });

  app.post('/api/otp/send', async (req: Request, res: Response) => {
    const ip = clientIp(req);
    res.setHeader('Cache-Control', 'no-store');

    try {
      if (await isRateLimited(supabase, 'otp_send', ip, OTP_ATTEMPTS_PER_WINDOW)) {
        res.status(429).json({ success: false, error: 'Too many OTP requests. Please try again later.' });
        return;
      }
    } catch (error) {
      console.error('OTP send rate limit unavailable:', error instanceof Error ? error.message : error);
      res.status(503).json({ success: false, error: 'Email verification service is temporarily unavailable.' });
      return;
    }

    const configuration = otpConfiguration();
    if (!configuration) {
      res.status(503).json({ success: false, error: 'Email verification service is not configured.' });
      return;
    }

    const { challengeToken } = req.body as { challengeToken?: unknown };
    if (!validChallengeToken(challengeToken)) {
      res.status(400).json({ success: false, error: 'Verification session is invalid or expired.' });
      return;
    }

    try {
      const hash = challengeHash(challengeToken);
      const challenge = await loadChallenge(supabase, hash);
      const now = Date.now();
      if (!challenge || new Date(challenge.expires_at).getTime() <= now) {
        res.status(400).json({ success: false, error: 'Verification session is invalid or expired.' });
        return;
      }

      if (challenge.send_count >= MAX_SENDS) {
        res.status(429).json({ success: false, error: 'OTP send limit reached. Start the login process again.' });
        return;
      }

      if (challenge.last_sent_at) {
        const retryAfter = Math.ceil((new Date(challenge.last_sent_at).getTime() + RESEND_COOLDOWN_MS - now) / 1000);
        if (retryAfter > 0) {
          res.status(429).json({ success: false, error: `Please wait ${retryAfter} seconds before requesting another code.`, retryAfter });
          return;
        }
      }

      const user = await loadActiveUser(supabase, challenge.user_id);
      if (!user?.email) {
        res.status(400).json({ success: false, error: 'Verification session is invalid or expired.' });
        return;
      }

      const challengeExpiresAt = new Date(challenge.expires_at).getTime();
      const remainingChallengeMs = challengeExpiresAt - now;
      if (remainingChallengeMs < RESEND_COOLDOWN_MS) {
        res.status(400).json({ success: false, error: 'Verification session is about to expire. Start the login process again.' });
        return;
      }

      const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
      const codeHash = otpHash(hash, code, configuration.hmacSecret);
      const sentAt = new Date().toISOString();
      const effectiveOtpTtlMs = Math.min(OTP_TTL_MS, remainingChallengeMs);
      const otpExpiresAt = new Date(now + effectiveOtpTtlMs).toISOString();
      const otpExpiryDate = new Date(otpExpiresAt);
      const otpExpiryLabel = `${otpExpiryDate.getUTCHours().toString().padStart(2, '0')}:${otpExpiryDate.getUTCMinutes().toString().padStart(2, '0')} UTC`;
      const nextSendCount = challenge.send_count + 1;

      const { data: reserved, error: reserveError } = await supabase
        .from('otp_verifications')
        .update({
          otp_hash: codeHash,
          otp_expires_at: otpExpiresAt,
          send_count: nextSendCount,
          last_sent_at: sentAt,
          updated_at: sentAt,
        })
        .eq('id', challenge.id)
        .eq('send_count', challenge.send_count)
        .is('consumed_at', null)
        .select('id')
        .maybeSingle();
      if (reserveError) throw reserveError;
      if (!reserved) {
        res.status(409).json({ success: false, error: 'A code was already requested. Please wait before trying again.' });
        return;
      }

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${configuration.resendApiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `login-otp/${challenge.id}/${nextSendCount}`,
        },
        body: JSON.stringify({
          from: configuration.resendFromEmail,
          to: [user.email],
          subject: 'Your Ashram Shala login verification code',
          text: `Your Ashram Shala Pathraj login verification code is ${code}. It expires at ${otpExpiryLabel}. Never share this code or your password.`,
          html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#171d19"><p style="color:#006948;font-weight:700">ASHRAM SHALA PATHRAJ</p><h1 style="font-size:24px">Login verification code</h1><p>Use this one-time code to finish signing in:</p><p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#006948">${code}</p><p>This code expires at ${otpExpiryLabel}. Never share this code or your password.</p></div>`,
        }),
      });

      if (!emailResponse.ok) {
        const providerError = await emailResponse.text();
        console.error('Resend OTP delivery failed:', emailResponse.status, providerError.slice(0, 200));
        await supabase
          .from('otp_verifications')
          .update({ otp_hash: null, otp_expires_at: null, send_count: challenge.send_count, last_sent_at: challenge.last_sent_at, updated_at: new Date().toISOString() })
          .eq('id', challenge.id)
          .eq('otp_hash', codeHash);
        res.status(502).json({ success: false, error: 'Could not send the verification email. Please try again.' });
        return;
      }

      await logSecurity(supabase, {
        action: 'otp_sent',
        userId: user.id,
        username: user.username,
        ip,
        details: `Login OTP sent (attempt ${nextSendCount} of ${MAX_SENDS})`,
      });

      res.json({
        success: true,
        maskedEmail: maskEmail(user.email),
        expiresInSeconds: Math.max(0, Math.floor((new Date(otpExpiresAt).getTime() - Date.now()) / 1000)),
        resendAfterSeconds: RESEND_COOLDOWN_MS / 1000,
      });
    } catch (error) {
      console.error('OTP send failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Could not send the verification email.' });
    }
  });

  app.post('/api/otp/verify', async (req: Request, res: Response) => {
    const ip = clientIp(req);
    res.setHeader('Cache-Control', 'no-store');

    try {
      if (await isRateLimited(supabase, 'otp_verify', ip, OTP_ATTEMPTS_PER_WINDOW)) {
        res.status(429).json({ success: false, error: 'Too many verification attempts. Please try again later.' });
        return;
      }
    } catch (error) {
      console.error('OTP verify rate limit unavailable:', error instanceof Error ? error.message : error);
      res.status(503).json({ success: false, error: 'Email verification service is temporarily unavailable.' });
      return;
    }

    const configuration = otpConfiguration();
    if (!configuration) {
      res.status(503).json({ success: false, error: 'Email verification service is not configured.' });
      return;
    }

    const { challengeToken, code } = req.body as { challengeToken?: unknown; code?: unknown };
    if (!validChallengeToken(challengeToken) || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      res.status(400).json({ success: false, error: 'Enter a valid 6-digit verification code.' });
      return;
    }

    try {
      const hash = challengeHash(challengeToken);
      const challenge = await loadChallenge(supabase, hash);
      const now = Date.now();
      if (
        !challenge ||
        !challenge.otp_hash ||
        !challenge.otp_expires_at ||
        new Date(challenge.expires_at).getTime() <= now ||
        new Date(challenge.otp_expires_at).getTime() <= now
      ) {
        res.status(400).json({ success: false, error: 'Verification code is invalid or expired.' });
        return;
      }

      if (challenge.attempt_count >= MAX_VERIFY_ATTEMPTS) {
        res.status(429).json({ success: false, error: 'Verification attempt limit reached. Start the login process again.' });
        return;
      }

      const nextAttemptCount = challenge.attempt_count + 1;
      const { data: attemptReservation, error: attemptError } = await supabase
        .from('otp_verifications')
        .update({ attempt_count: nextAttemptCount, updated_at: new Date().toISOString() })
        .eq('id', challenge.id)
        .eq('attempt_count', challenge.attempt_count)
        .is('consumed_at', null)
        .select('id')
        .maybeSingle();
      if (attemptError) throw attemptError;
      if (!attemptReservation) {
        res.status(409).json({ success: false, error: 'Another verification attempt is in progress. Please try again.' });
        return;
      }

      const submittedHash = otpHash(hash, code, configuration.hmacSecret);
      if (!constantTimeEqual(challenge.otp_hash, submittedHash)) {
        const user = await loadActiveUser(supabase, challenge.user_id);
        await logSecurity(supabase, {
          action: 'otp_failed',
          userId: challenge.user_id,
          username: user?.username,
          ip,
          details: `Invalid OTP attempt ${nextAttemptCount} of ${MAX_VERIFY_ATTEMPTS}`,
        });

        res.status(401).json({ success: false, error: 'Verification code is invalid or expired.' });
        return;
      }

      const consumedAt = new Date().toISOString();
      const { data: consumed, error: consumeError } = await supabase
        .from('otp_verifications')
        .update({ consumed_at: consumedAt, updated_at: consumedAt })
        .eq('id', challenge.id)
        .eq('attempt_count', nextAttemptCount)
        .is('consumed_at', null)
        .select('id')
        .maybeSingle();
      if (consumeError) throw consumeError;
      if (!consumed) {
        res.status(409).json({ success: false, error: 'Verification code was already used.' });
        return;
      }

      const user = await loadActiveUser(supabase, challenge.user_id);
      if (!user) {
        res.status(400).json({ success: false, error: 'Verification session is invalid or expired.' });
        return;
      }

      await logSecurity(supabase, {
        action: 'login_success',
        userId: user.id,
        username: user.username,
        ip,
        details: 'Successful login with email OTP',
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
    } catch (error) {
      console.error('OTP verification failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Could not verify the code.' });
    }
  });
}
