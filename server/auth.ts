import { createHash, createHmac, randomUUID, randomBytes } from 'node:crypto';
import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { clearSession, issueSession, readSession, requireSameOrigin, requireSession, type AuthenticatedRequest } from './security.js';

const RATE_LIMIT_WINDOW_SECONDS = 60;
const LOGIN_ATTEMPTS_PER_WINDOW = 5;
const OTP_ATTEMPTS_PER_WINDOW = 10;
const OTP_ACCOUNT_SEND_WINDOW_SECONDS = 10 * 60;
const OTP_ACCOUNT_SEND_MAXIMUM = 5;
const OTP_ACCOUNT_VERIFY_WINDOW_SECONDS = 10 * 60;
const OTP_ACCOUNT_VERIFY_MAXIMUM = 10;
const CHALLENGE_TTL_MS = 10 * 60_000;
const OTP_TTL_MS = 10 * 60_000;
const RESEND_COOLDOWN_MS = 60_000;
const SEND_RESERVATION_SECONDS = 15;
const RESEND_TIMEOUT_MS = 8_000;
const MAX_SENDS = 3;
const MAX_VERIFY_ATTEMPTS = 5;
const BCRYPT_SALT_ROUNDS = 12;
const REGISTER_RATE_PER_WINDOW = 3;
const PASSWORD_CHANGE_RATE_PER_WINDOW = 5;
const ADMIN_CREATE_RATE_PER_WINDOW = 10;
const STAFF_ROLES = ['web_creator', 'principal', 'class_teacher', 'clerk', 'subject_teacher'];

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
  must_change_password: boolean;
  mobile_number: string | null;
  parent_student_ids: string[];
  phone_verified?: boolean;
  email_verified?: boolean;
}

interface ChallengeRpcRow {
  challenge_id: string;
  stored_challenge_hash: string;
  challenge_expires_at: string;
  created: boolean;
}

interface SendReservationRow {
  reservation_status: 'reserved' | 'sent' | 'busy' | 'cooldown' | 'send_limit' | 'expired' | 'otp_expired' | 'conflict';
  challenge_id: string | null;
  user_id: string | null;
  effective_otp_expires_at: string | null;
  effective_send_count: number;
  retry_after_seconds: number;
}

interface VerificationRow {
  verification_status: 'success' | 'invalid' | 'expired' | 'used' | 'attempt_limit';
  user_id: string | null;
  attempt_count: number;
}

async function isRateLimited(
  supabase: SupabaseClient,
  bucket: string,
  key: string,
  maximum: number,
  windowSeconds = RATE_LIMIT_WINDOW_SECONDS,
): Promise<boolean> {
  const keyHash = createHash('sha256').update(key).digest('hex');
  const { data, error } = await supabase.rpc('consume_auth_rate_limit', {
    p_bucket: bucket,
    p_key_hash: keyHash,
    p_window_seconds: windowSeconds,
    p_max_attempts: maximum,
  });
  if (error) throw error;
  return data !== true;
}

function rejectRateLimit(res: Response, message: string, retryAfter: number): void {
  res.setHeader('Retry-After', String(retryAfter));
  res.status(429).json({ success: false, error: message, retryAfter });
}

function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function requestId(req: Request): string {
  const supplied = req.get('X-Request-ID');
  const id = supplied && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(supplied)
    ? supplied
    : randomUUID();
  return id;
}

function challengeTokenForId(challengeId: string, secret: string): string {
  return createHmac('sha256', secret).update(`challenge:v2:${challengeId}`).digest('hex');
}

function challengeHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function deriveOtpCode(hash: string, secret: string): string {
  const digestPrefix = createHmac('sha256', secret).update(`otp-code:v2:${hash}`).digest('hex').slice(0, 12);
  return (Number.parseInt(digestPrefix, 16) % 1_000_000).toString().padStart(6, '0');
}

function otpHash(challenge: string, code: string, secret: string): string {
  return createHmac('sha256', secret).update(`${challenge}:${code}`).digest('hex');
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

function firstRpcRow<T>(data: unknown): T | null {
  return Array.isArray(data) && data.length > 0 ? data[0] as T : null;
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

async function loadChallenge(
  supabase: SupabaseClient,
  hash: string,
  includeConsumed = false,
): Promise<OtpVerification | null> {
  let query = supabase
    .from('otp_verifications')
    .select('id,user_id,challenge_hash,otp_hash,expires_at,otp_expires_at,send_count,attempt_count,last_sent_at,consumed_at')
    .eq('challenge_hash', hash);
  if (!includeConsumed) query = query.is('consumed_at', null);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data as OtpVerification | null;
}

async function loadActiveUser(supabase: SupabaseClient, userId: string): Promise<AuthUserRow | null> {
  const { data, error } = await supabase
    .from('auth_users')
    .select('id,username,password_hash,role,name_en,name_mr,email,must_change_password,mobile_number,parent_student_ids,phone_verified,email_verified')
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

/**
 * Send OTP email with Gmail SMTP fallback.
 * Tries Resend API first. If Resend fails (non-2xx, especially 403/422 for sandbox restrictions),
 * falls back to Gmail SMTP using nodemailer.
 */
async function sendOtpEmail(
  to: string,
  code: string,
  otpExpiryLabel: string,
  idempotencyKey: string,
  subject: string,
  textBody: string,
  htmlBody: string,
): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  // Try Resend first
  if (resendApiKey && resendFromEmail) {
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          from: resendFromEmail,
          to: [to],
          subject,
          text: textBody,
          html: htmlBody,
        }),
        signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
      });

      if (emailResponse.ok) {
        return { success: true };
      }

      const resendError = await emailResponse.text();
      console.warn(`Resend API failed (${emailResponse.status}): ${resendError.slice(0, 200)}. Trying Gmail SMTP fallback...`);
    } catch (resendErr) {
      console.warn('Resend API error:', resendErr instanceof Error ? resendErr.message : resendErr, '. Trying Gmail SMTP fallback...');
    }
  }

  // Fallback to Gmail SMTP
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim();

  if (gmailUser && gmailAppPassword) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });

      await transporter.sendMail({
        from: `"Ashram Shala Pathraj" <${gmailUser}>`,
        to,
        subject,
        text: textBody,
        html: htmlBody,
      });

      console.log(`OTP email sent via Gmail SMTP to ${to}`);
      return { success: true };
    } catch (gmailErr) {
      console.error('Gmail SMTP fallback failed:', gmailErr instanceof Error ? gmailErr.message : gmailErr);
      return { success: false, error: 'Both Resend and Gmail SMTP failed to deliver email.' };
    }
  }

  // Neither provider available
  if (!resendApiKey && !gmailUser) {
    return { success: false, error: 'No email provider configured (set RESEND_API_KEY or GMAIL_USER + GMAIL_APP_PASSWORD).' };
  }

  return { success: false, error: 'Could not send the verification email via any provider.' };
}

// SMS rate limiting state (in-memory per instance)
const smsRateLimitMap = new Map<string, { count: number; firstSentAt: number }>();
const SMS_RATE_LIMIT_WINDOW_MS = 10 * 60_000; // 10 minutes
const SMS_RATE_LIMIT_MAX = 3;

async function cleanupExpiredAuthState(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.rpc('cleanup_auth_security_state');
  if (error) console.warn('Auth state cleanup unavailable:', error.message);
}

export function registerAuthRoutes(app: Express, supabase: SupabaseClient): void {
  void cleanupExpiredAuthState(supabase);
  const cleanupTimer = setInterval(() => void cleanupExpiredAuthState(supabase), 6 * 60 * 60_000);
  cleanupTimer.unref();

  app.get('/api/auth/session', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const session = readSession(req);
    if (!session) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    // Look up mustChangePassword and phone_verified from the database
    let mustChangePassword = false;
    let phoneVerified = false;
    try {
      const { data } = await supabase
        .from('auth_users')
        .select('must_change_password,phone_verified')
        .eq('id', session.userId)
        .eq('is_active', true)
        .maybeSingle();
      if (data && data.must_change_password) {
        mustChangePassword = true;
      }
      if (data && data.phone_verified) {
        phoneVerified = true;
      }
    } catch {
      // If lookup fails, proceed without the flag
    }

    res.json({
      success: true,
      user: {
        username: session.username,
        role: session.role,
        nameEn: session.nameEn,
        nameMr: session.nameMr,
        mustChangePassword,
        phoneVerified,
      },
      expiresAt: session.expiresAt,
    });
  });

  app.post('/api/auth/logout', requireSameOrigin, (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    clearSession(res);
    res.json({ success: true });
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const ip = clientIp(req);
    const operationId = requestId(req);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Request-ID', operationId);

    const { username, password } = req.body as { username?: unknown; password?: unknown };
    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
      res.status(400).json({ success: false, error: 'Username and password are required.' });
      return;
    }
    if (username.length > 50 || password.length > 100) {
      res.status(400).json({ success: false, error: 'Invalid credentials.' });
      return;
    }

    const normalizedUsername = username.trim();
    try {
      const [ipLimited, accountLimited] = await Promise.all([
        isRateLimited(supabase, 'login_ip', ip, LOGIN_ATTEMPTS_PER_WINDOW),
        isRateLimited(supabase, 'login_account', normalizedUsername.toLowerCase(), LOGIN_ATTEMPTS_PER_WINDOW),
      ]);
      if (ipLimited || accountLimited) {
        rejectRateLimit(res, 'Too many login attempts. Please try again after 1 minute.', RATE_LIMIT_WINDOW_SECONDS);
        return;
      }
    } catch (error) {
      console.error('Login rate limit unavailable:', error instanceof Error ? error.message : error);
      res.status(503).json({ success: false, error: 'Authentication service is temporarily unavailable.' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('auth_users')
        .select('id,username,password_hash,role,name_en,name_mr,email,must_change_password,mobile_number,parent_student_ids,phone_verified')
        .eq('username', normalizedUsername)
        .eq('is_active', true)
        .maybeSingle();
      const user = data as AuthUserRow | null;

      if (error || !user) {
        await logSecurity(supabase, {
          action: 'login_failed',
          username: normalizedUsername,
          ip,
          details: 'Invalid username or password',
        });
        res.status(401).json({ success: false, error: 'Invalid username or password.' });
        return;
      }

      // Verify password: try bcrypt first, fall back to plaintext for migration
      let passwordValid = false;
      const isBcryptHash = user.password_hash.startsWith('$2');
      if (isBcryptHash) {
        passwordValid = await bcrypt.compare(password, user.password_hash);
      } else {
        // Plaintext legacy password - check and auto-hash
        passwordValid = user.password_hash === password;
        if (passwordValid) {
          const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
          await supabase.from('auth_users').update({ password_hash: hashed }).eq('id', user.id);
        }
      }

      // If primary password failed, try AI PIN as fallback
      if (!passwordValid) {
        const { data: aiData } = await supabase
          .from('auth_users')
          .select('ai_password_hash')
          .eq('id', user.id)
          .maybeSingle();
        if (aiData?.ai_password_hash) {
          passwordValid = await bcrypt.compare(password, aiData.ai_password_hash);
        }
      }

      if (!passwordValid) {
        await logSecurity(supabase, {
          action: 'login_failed',
          username: normalizedUsername,
          ip,
          details: 'Invalid username or password',
        });
        res.status(401).json({ success: false, error: 'Invalid username or password.' });
        return;
      }

      // Direct login - issue session immediately (no OTP required)
      issueSession(res, {
        userId: user.id,
        username: user.username,
        role: user.role,
        nameEn: user.name_en,
        nameMr: user.name_mr,
      });

      await logSecurity(supabase, {
        action: 'login_success',
        userId: user.id,
        username: user.username,
        ip,
        details: 'Successful login with password',
      });

      res.json({
        success: true,
        user: {
          username: user.username,
          role: user.role,
          nameEn: user.name_en,
          nameMr: user.name_mr,
          mustChangePassword: user.must_change_password,
          phoneVerified: user.phone_verified ?? false,
        },
      });
    } catch (error) {
      console.error('Login failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Unable to process login.' });
    }
  });

  app.post('/api/otp/send', async (req: Request, res: Response) => {
    const ip = clientIp(req);
    const operationId = requestId(req);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Request-ID', operationId);

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
      if (!challenge || new Date(challenge.expires_at).getTime() <= Date.now()) {
        res.status(400).json({ success: false, error: 'Verification session is invalid or expired.' });
        return;
      }

      const [ipLimited, accountLimited] = await Promise.all([
        isRateLimited(supabase, 'otp_send_ip', ip, OTP_ATTEMPTS_PER_WINDOW),
        isRateLimited(supabase, 'otp_send_account', challenge.user_id, OTP_ACCOUNT_SEND_MAXIMUM, OTP_ACCOUNT_SEND_WINDOW_SECONDS),
      ]);
      if (ipLimited || accountLimited) {
        const retryAfter = ipLimited ? RATE_LIMIT_WINDOW_SECONDS : OTP_ACCOUNT_SEND_WINDOW_SECONDS;
        rejectRateLimit(res, 'Too many OTP requests. Please try again later.', retryAfter);
        return;
      }

      const user = await loadActiveUser(supabase, challenge.user_id);
      if (!user?.email) {
        res.status(400).json({ success: false, error: 'Verification session is invalid or expired.' });
        return;
      }

      const now = Date.now();
      const remainingChallengeMs = new Date(challenge.expires_at).getTime() - now;
      if (remainingChallengeMs < RESEND_COOLDOWN_MS) {
        res.status(400).json({ success: false, error: 'Verification session is about to expire. Start the login process again.' });
        return;
      }

      const code = deriveOtpCode(hash, configuration.hmacSecret);
      const codeHash = otpHash(hash, code, configuration.hmacSecret);
      const proposedOtpExpiresAt = new Date(now + Math.min(OTP_TTL_MS, remainingChallengeMs)).toISOString();
      const { data: reservationData, error: reservationError } = await supabase.rpc('reserve_otp_send', {
        p_challenge_hash: hash,
        p_otp_hash: codeHash,
        p_otp_expires_at: proposedOtpExpiresAt,
        p_request_id: operationId,
        p_max_sends: MAX_SENDS,
        p_cooldown_seconds: RESEND_COOLDOWN_MS / 1000,
        p_reservation_seconds: SEND_RESERVATION_SECONDS,
      });
      if (reservationError) throw reservationError;

      const reservation = firstRpcRow<SendReservationRow>(reservationData);
      if (!reservation) throw new Error('OTP reservation RPC returned no row');

      if (reservation.reservation_status === 'sent') {
        res.json({
          success: true,
          maskedEmail: maskEmail(user.email),
          expiresInSeconds: reservation.effective_otp_expires_at
            ? Math.max(0, Math.floor((new Date(reservation.effective_otp_expires_at).getTime() - Date.now()) / 1000))
            : 0,
          resendAfterSeconds: RESEND_COOLDOWN_MS / 1000,
        });
        return;
      }
      if (reservation.reservation_status === 'busy' || reservation.reservation_status === 'cooldown') {
        rejectRateLimit(
          res,
          `Please wait ${reservation.retry_after_seconds} seconds before requesting another code.`,
          reservation.retry_after_seconds,
        );
        return;
      }
      if (reservation.reservation_status === 'send_limit') {
        rejectRateLimit(res, 'OTP send limit reached. Start the login process again.', Math.ceil(remainingChallengeMs / 1000));
        return;
      }
      if (reservation.reservation_status !== 'reserved' || !reservation.challenge_id || !reservation.effective_otp_expires_at) {
        res.status(400).json({ success: false, error: 'Verification session is invalid or expired.' });
        return;
      }

      const otpExpiryDate = new Date(reservation.effective_otp_expires_at);
      const otpExpiryLabel = `${otpExpiryDate.getUTCHours().toString().padStart(2, '0')}:${otpExpiryDate.getUTCMinutes().toString().padStart(2, '0')} UTC`;

      const emailSubject = 'Your Ashram Shala login verification code';
      const emailText = `Your Ashram Shala Pathraj login verification code is ${code}. It expires at ${otpExpiryLabel}. Resends for this login use the same code. Never share this code or your password.`;
      const emailHtml = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#171d19"><p style="color:#006948;font-weight:700">ASHRAM SHALA PATHRAJ</p><h1 style="font-size:24px">Login verification code</h1><p>Use this one-time code to finish signing in:</p><p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#006948">${code}</p><p>This code expires at ${otpExpiryLabel}. Resends for this login use the same code. Never share this code or your password.</p></div>`;

      const emailResult = await sendOtpEmail(
        user.email,
        code,
        otpExpiryLabel,
        `login-otp/${reservation.challenge_id}/${operationId}`,
        emailSubject,
        emailText,
        emailHtml,
      );

      if (!emailResult.success) {
        console.error('OTP email delivery failed:', emailResult.error);
        await supabase.rpc('cancel_otp_send', {
          p_challenge_id: reservation.challenge_id,
          p_request_id: operationId,
        });
        res.status(502).json({ success: false, error: 'Could not send the verification email. Please try again.' });
        return;
      }

      const { error: confirmError } = await supabase.rpc('confirm_otp_send', {
        p_challenge_id: reservation.challenge_id,
        p_request_id: operationId,
      });
      if (confirmError) console.error('OTP delivery confirmation update failed:', confirmError.message);

      await logSecurity(supabase, {
        action: 'otp_sent',
        userId: user.id,
        username: user.username,
        ip,
        details: `Stable login OTP delivered (send ${reservation.effective_send_count} of ${MAX_SENDS})`,
      });

      res.json({
        success: true,
        maskedEmail: maskEmail(user.email),
        expiresInSeconds: Math.max(0, Math.floor((otpExpiryDate.getTime() - Date.now()) / 1000)),
        resendAfterSeconds: RESEND_COOLDOWN_MS / 1000,
      });
    } catch (error) {
      console.error('OTP send failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Could not send the verification email.' });
    }
  });

  app.post('/api/otp/verify', async (req: Request, res: Response) => {
    const ip = clientIp(req);
    const operationId = requestId(req);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Request-ID', operationId);

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
      const challenge = await loadChallenge(supabase, hash, true);
      if (!challenge) {
        res.status(400).json({ success: false, error: 'Verification code is invalid or expired.' });
        return;
      }

      const [ipLimited, accountLimited] = await Promise.all([
        isRateLimited(supabase, 'otp_verify_ip', ip, OTP_ATTEMPTS_PER_WINDOW),
        isRateLimited(supabase, 'otp_verify_account', challenge.user_id, OTP_ACCOUNT_VERIFY_MAXIMUM, OTP_ACCOUNT_VERIFY_WINDOW_SECONDS),
      ]);
      if (ipLimited || accountLimited) {
        const retryAfter = ipLimited ? RATE_LIMIT_WINDOW_SECONDS : OTP_ACCOUNT_VERIFY_WINDOW_SECONDS;
        rejectRateLimit(res, 'Too many verification attempts. Please try again later.', retryAfter);
        return;
      }

      const submittedHash = otpHash(hash, code, configuration.hmacSecret);
      const { data: verificationData, error: verificationError } = await supabase.rpc('verify_otp_challenge', {
        p_challenge_hash: hash,
        p_submitted_otp_hash: submittedHash,
        p_request_id: operationId,
        p_max_attempts: MAX_VERIFY_ATTEMPTS,
      });
      if (verificationError) throw verificationError;

      const verification = firstRpcRow<VerificationRow>(verificationData);
      if (!verification) throw new Error('OTP verification RPC returned no row');

      if (verification.verification_status === 'attempt_limit') {
        rejectRateLimit(res, 'Verification attempt limit reached. Start the login process again.', Math.ceil(CHALLENGE_TTL_MS / 1000));
        return;
      }
      if (verification.verification_status === 'used') {
        res.status(409).json({ success: false, error: 'Verification code was already used.' });
        return;
      }
      if (verification.verification_status !== 'success' || !verification.user_id) {
        const user = verification.user_id ? await loadActiveUser(supabase, verification.user_id) : null;
        await logSecurity(supabase, {
          action: 'otp_failed',
          userId: verification.user_id || undefined,
          username: user?.username,
          ip,
          details: `Invalid OTP attempt ${verification.attempt_count} of ${MAX_VERIFY_ATTEMPTS}`,
        });
        res.status(verification.verification_status === 'invalid' ? 401 : 400).json({
          success: false,
          error: 'Verification code is invalid or expired.',
        });
        return;
      }

      const user = await loadActiveUser(supabase, verification.user_id);
      if (!user) {
        res.status(400).json({ success: false, error: 'Verification session is invalid or expired.' });
        return;
      }

      issueSession(res, {
        userId: user.id,
        username: user.username,
        role: user.role,
        nameEn: user.name_en,
        nameMr: user.name_mr,
      });

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
          mustChangePassword: user.must_change_password,
        },
      });
    } catch (error) {
      console.error('OTP verification failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Could not verify the code.' });
    }
  });

  // In-memory store for registration email OTPs
  const regEmailOtpStore = new Map<string, { code: string; expiresAt: number }>();
  const regEmailCleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of regEmailOtpStore.entries()) {
      if (value.expiresAt < now) regEmailOtpStore.delete(key);
    }
  }, 5 * 60_000);
  regEmailCleanupTimer.unref();

  // POST /api/auth/email/send-otp - Send email OTP for registration verification
  app.post('/api/auth/email/send-otp', async (req: Request, res: Response) => {
    const ip = clientIp(req);
    res.setHeader('Cache-Control', 'no-store');

    try {
      const limited = await isRateLimited(supabase, 'email_otp_ip', ip, OTP_ATTEMPTS_PER_WINDOW);
      if (limited) {
        rejectRateLimit(res, 'Too many OTP requests. Please try again later.', RATE_LIMIT_WINDOW_SECONDS);
        return;
      }
    } catch {
      res.status(503).json({ success: false, error: 'Service temporarily unavailable.' });
      return;
    }

    const { email } = req.body as { email?: unknown };
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
      res.status(400).json({ success: false, error: 'A valid email address is required.' });
      return;
    }

    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60_000;
      regEmailOtpStore.set(email.toLowerCase(), { code, expiresAt });

      const emailSubject = 'Email Verification - Ashram Shala Pathraj';
      const emailText = `Your email verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`;
      const emailHtml = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#171d19"><p style="color:#006948;font-weight:700">ASHRAM SHALA PATHRAJ</p><h1 style="font-size:20px">Email Verification Code</h1><p>Your verification code is:</p><p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#006948">${code}</p><p>This code expires in 10 minutes.</p><p>If you did not request this, please ignore this email.</p></div>`;

      const emailResult = await sendOtpEmail(
        email.toLowerCase(),
        code,
        '10 minutes',
        `reg-email-otp/${email.toLowerCase()}/${randomUUID()}`,
        emailSubject,
        emailText,
        emailHtml,
      );

      if (!emailResult.success) {
        console.error('Registration email OTP send failed:', emailResult.error);
        res.status(502).json({ success: false, error: 'Could not send verification email. Please try again.' });
        return;
      }

      res.json({ success: true, message: 'Verification code sent to email.', expiresInSeconds: 600 });
    } catch (error) {
      console.error('Email OTP send error:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Unable to send verification email.' });
    }
  });

  // POST /api/auth/email/verify-otp - Verify email OTP for registration
  app.post('/api/auth/email/verify-otp', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');

    const { email, otp } = req.body as { email?: unknown; otp?: unknown };
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ success: false, error: 'A valid email address is required.' });
      return;
    }
    if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      res.status(400).json({ success: false, error: 'A valid 6-digit OTP is required.' });
      return;
    }

    const stored = regEmailOtpStore.get(email.toLowerCase());
    if (!stored) {
      res.status(400).json({ success: false, error: 'OTP is invalid or expired. Please request a new one.' });
      return;
    }

    if (Date.now() > stored.expiresAt) {
      regEmailOtpStore.delete(email.toLowerCase());
      res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
      return;
    }

    if (stored.code !== otp) {
      res.status(401).json({ success: false, error: 'Invalid OTP. Please check and try again.' });
      return;
    }

    // Mark as verified by removing from store (verified state is transient)
    regEmailOtpStore.delete(email.toLowerCase());

    res.json({ success: true, message: 'Email verified successfully.', email: email.toLowerCase() });
  });

  // POST /api/auth/register - Parent self-registration (simplified: form + password -> done)
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    const ip = clientIp(req);
    res.setHeader('Cache-Control', 'no-store');

    try {
      const limited = await isRateLimited(supabase, 'register_ip', ip, REGISTER_RATE_PER_WINDOW);
      if (limited) {
        rejectRateLimit(res, 'Too many registration attempts. Please try again later.', RATE_LIMIT_WINDOW_SECONDS);
        return;
      }
    } catch {
      res.status(503).json({ success: false, error: 'Registration service is temporarily unavailable.' });
      return;
    }

    const { fullName, mobileNumber, email, relationship, password } = req.body as {
      fullName?: unknown; mobileNumber?: unknown; email?: unknown; relationship?: unknown; password?: unknown;
    };

    if (typeof fullName !== 'string' || !fullName.trim() || fullName.length > 160) {
      res.status(400).json({ success: false, error: 'Full name is required (max 160 characters).' });
      return;
    }
    if (typeof mobileNumber !== 'string' || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      res.status(400).json({ success: false, error: 'A valid 10-digit Indian mobile number is required.' });
      return;
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
      res.status(400).json({ success: false, error: 'A valid email address is required.' });
      return;
    }
    const validRelationships = ['Father', 'Mother', 'Guardian', 'Other'];
    if (typeof relationship !== 'string' || !validRelationships.includes(relationship)) {
      res.status(400).json({ success: false, error: 'Relationship must be Father, Mother, Guardian, or Other.' });
      return;
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 100) {
      res.status(400).json({ success: false, error: 'Password must be between 8 and 100 characters.' });
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      // Check if user already exists with this mobile or email (handle stuck users)
      const { data: existingByMobile } = await supabase
        .from('auth_users')
        .select('id,username,password_hash,email,mobile_number')
        .eq('mobile_number', mobileNumber)
        .maybeSingle();

      const { data: existingByEmail } = await supabase
        .from('auth_users')
        .select('id,username,password_hash,email,mobile_number')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      // If user exists (stuck user from failed OTP registration), allow re-registration
      // by updating their password to the new one they just provided
      const existingUser = existingByMobile || existingByEmail;
      if (existingUser) {
        // Update the existing stuck user with the new password and details
        const { error: updateError } = await supabase
          .from('auth_users')
          .update({
            password_hash: hashedPassword,
            name_en: fullName.trim(),
            name_mr: fullName.trim(),
            email: email.toLowerCase(),
            mobile_number: mobileNumber,
            username: mobileNumber,
            must_change_password: false,
            is_active: true,
          })
          .eq('id', existingUser.id);

        if (updateError) throw updateError;

        // Issue session directly
        issueSession(res, {
          userId: existingUser.id,
          username: mobileNumber,
          role: 'student_parent',
          nameEn: fullName.trim(),
          nameMr: fullName.trim(),
        });

        await logSecurity(supabase, {
          action: 'parent_re_registered',
          userId: existingUser.id,
          username: mobileNumber,
          ip,
          details: `Parent re-registration (password reset): ${relationship}`,
        });

        res.status(200).json({
          success: true,
          userId: existingUser.id,
          user: {
            username: mobileNumber,
            role: 'student_parent',
            nameEn: fullName.trim(),
            nameMr: fullName.trim(),
            mustChangePassword: false,
          },
        });
        return;
      }

      // Check phone verification in sms_otp_codes table
      const { data: phoneVerification } = await supabase
        .from('sms_otp_codes')
        .select('id,verified')
        .eq('phone', mobileNumber)
        .eq('verified', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!phoneVerification) {
        res.status(400).json({ success: false, error: 'Phone number must be verified before registration. Please verify your mobile number first.' });
        return;
      }

      // Check username uniqueness (using mobile as username)
      const { data: existingUsername } = await supabase
        .from('auth_users')
        .select('id')
        .eq('username', mobileNumber)
        .maybeSingle();
      if (existingUsername) {
        res.status(409).json({ success: false, error: 'An account with this mobile number already exists. Try logging in or use Forgot Password.' });
        return;
      }

      // Create new user with the password they provided
      const { data: newUser, error: insertError } = await supabase
        .from('auth_users')
        .insert({
          username: mobileNumber,
          password_hash: hashedPassword,
          role: 'student_parent',
          name_en: fullName.trim(),
          name_mr: fullName.trim(),
          email: email.toLowerCase(),
          mobile_number: mobileNumber,
          must_change_password: false,
          is_active: true,
          phone_verified: true,
          email_verified: true,
        })
        .select('id,username,email')
        .single();

      if (insertError) throw insertError;

      // Issue session directly - user is logged in immediately after registration
      issueSession(res, {
        userId: newUser.id,
        username: newUser.username,
        role: 'student_parent',
        nameEn: fullName.trim(),
        nameMr: fullName.trim(),
      });

      await logSecurity(supabase, {
        action: 'parent_registered',
        userId: newUser.id,
        username: newUser.username,
        ip,
        details: `Parent self-registration: ${relationship}`,
      });

      res.status(201).json({
        success: true,
        userId: newUser.id,
        user: {
          username: newUser.username,
          role: 'student_parent',
          nameEn: fullName.trim(),
          nameMr: fullName.trim(),
          mustChangePassword: false,
        },
      });
    } catch (error) {
      console.error('Registration failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Unable to complete registration.' });
    }
  });

  // POST /api/auth/set-password - Set password after registration (requires session)
  app.post('/api/auth/set-password', requireSameOrigin, requireSession(), async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const ip = clientIp(req);
    res.setHeader('Cache-Control', 'no-store');

    try {
      const limited = await isRateLimited(supabase, 'set_password', authReq.authSession!.userId, PASSWORD_CHANGE_RATE_PER_WINDOW);
      if (limited) {
        rejectRateLimit(res, 'Too many password attempts. Please try again later.', RATE_LIMIT_WINDOW_SECONDS);
        return;
      }
    } catch {
      res.status(503).json({ success: false, error: 'Service temporarily unavailable.' });
      return;
    }

    const { password, confirmPassword } = req.body as { password?: unknown; confirmPassword?: unknown };
    if (typeof password !== 'string' || password.length < 8 || password.length > 100) {
      res.status(400).json({ success: false, error: 'Password must be between 8 and 100 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ success: false, error: 'Passwords do not match.' });
      return;
    }

    try {
      const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      // Generate a random 6-digit AI PIN for chatbot access.
      // Security note: The 6-digit PIN (900,000 values) is intentionally acceptable here because
      // login is rate-limited to 5 attempts per 60-second window per IP and per account,
      // making brute-force infeasible (would take ~250 days at maximum rate).
      const aiPin = Math.floor(100000 + Math.random() * 900000).toString();
      const aiPinHash = await bcrypt.hash(aiPin, BCRYPT_SALT_ROUNDS);

      const { error } = await supabase
        .from('auth_users')
        .update({
          password_hash: hashed,
          ai_password_hash: aiPinHash,
          must_change_password: false,
          password_changed_at: new Date().toISOString(),
        })
        .eq('id', authReq.authSession!.userId);

      if (error) throw error;

      // Re-issue session with fresh expiry to invalidate old cookie
      issueSession(res, {
        userId: authReq.authSession!.userId,
        username: authReq.authSession!.username,
        role: authReq.authSession!.role,
        nameEn: authReq.authSession!.nameEn,
        nameMr: authReq.authSession!.nameMr,
      });

      // Send AI PIN via email so the user has a recovery path
      const user = await loadActiveUser(supabase, authReq.authSession!.userId);
      if (user?.email) {
        const pinSubject = 'Your Ashram Shala AI Assistant PIN';
        const pinText = `Your AI Assistant PIN for Ashram Shala Pathraj portal is: ${aiPin}\n\nUse this PIN to log in to the AI chatbot assistant. Keep it safe and do not share it with anyone.\n\nIf you did not request this, please contact the school office immediately.`;
        const pinHtml = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#171d19"><p style="color:#006948;font-weight:700">ASHRAM SHALA PATHRAJ</p><h1 style="font-size:20px">Your AI Assistant PIN</h1><p>Your AI Assistant PIN is:</p><p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#006948">${aiPin}</p><p>Use this PIN to log in to the AI chatbot assistant. Keep it safe and do not share it with anyone.</p><p style="color:#93000a">If you did not request this, please contact the school office immediately.</p></div>`;

        const pinEmailResult = await sendOtpEmail(
          user.email,
          aiPin,
          '',
          `ai-pin/${authReq.authSession!.userId}/${randomUUID()}`,
          pinSubject,
          pinText,
          pinHtml,
        );
        if (!pinEmailResult.success) {
          console.error('Failed to send AI PIN email:', pinEmailResult.error);
        }
      }

      await logSecurity(supabase, {
        action: 'password_set',
        userId: authReq.authSession!.userId,
        username: authReq.authSession!.username,
        ip,
        details: 'Password and AI PIN set successfully',
      });

      res.json({ success: true, aiPin });
    } catch (error) {
      console.error('Set password failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Unable to set password.' });
    }
  });

  // POST /api/auth/change-password - Change password (requires session)
  app.post('/api/auth/change-password', requireSameOrigin, requireSession(), async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const ip = clientIp(req);
    res.setHeader('Cache-Control', 'no-store');

    try {
      const limited = await isRateLimited(supabase, 'change_password', authReq.authSession!.userId, PASSWORD_CHANGE_RATE_PER_WINDOW);
      if (limited) {
        rejectRateLimit(res, 'Too many password change attempts. Please try again later.', RATE_LIMIT_WINDOW_SECONDS);
        return;
      }
    } catch {
      res.status(503).json({ success: false, error: 'Service temporarily unavailable.' });
      return;
    }

    const { currentPassword, newPassword } = req.body as { currentPassword?: unknown; newPassword?: unknown };
    if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 100) {
      res.status(400).json({ success: false, error: 'New password must be between 8 and 100 characters.' });
      return;
    }

    try {
      const user = await loadActiveUser(supabase, authReq.authSession!.userId);
      if (!user) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      // If must_change_password is true, skip current password check
      if (!user.must_change_password) {
        if (typeof currentPassword !== 'string' || !currentPassword) {
          res.status(400).json({ success: false, error: 'Current password is required.' });
          return;
        }
        const isBcryptHash = user.password_hash.startsWith('$2');
        let currentValid = false;
        if (isBcryptHash) {
          currentValid = await bcrypt.compare(currentPassword, user.password_hash);
        } else {
          currentValid = user.password_hash === currentPassword;
        }
        if (!currentValid) {
          res.status(401).json({ success: false, error: 'Current password is incorrect.' });
          return;
        }
      }

      const hashed = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
      const { error } = await supabase
        .from('auth_users')
        .update({
          password_hash: hashed,
          must_change_password: false,
          password_changed_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Re-issue session with fresh expiry to invalidate old cookie
      issueSession(res, {
        userId: user.id,
        username: user.username,
        role: user.role,
        nameEn: user.name_en,
        nameMr: user.name_mr,
      });

      await logSecurity(supabase, {
        action: 'password_changed',
        userId: user.id,
        username: user.username,
        ip,
        details: user.must_change_password ? 'First-login password change' : 'Voluntary password change',
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Change password failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Unable to change password.' });
    }
  });

  // POST /api/admin/create-account - Admin creates staff account
  app.post('/api/admin/create-account', requireSameOrigin, requireSession(['web_creator', 'principal']), async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const ip = clientIp(req);
    res.setHeader('Cache-Control', 'no-store');

    try {
      const limited = await isRateLimited(supabase, 'admin_create', authReq.authSession!.userId, ADMIN_CREATE_RATE_PER_WINDOW, 5 * 60);
      if (limited) {
        rejectRateLimit(res, 'Too many account creation attempts. Please try again later.', 5 * 60);
        return;
      }
    } catch {
      res.status(503).json({ success: false, error: 'Service temporarily unavailable.' });
      return;
    }

    const { fullName, email, mobileNumber, role, nameEn, nameMr } = req.body as {
      fullName?: unknown; email?: unknown; mobileNumber?: unknown; role?: unknown; nameEn?: unknown; nameMr?: unknown;
    };

    if (typeof fullName !== 'string' || !fullName.trim() || fullName.length > 160) {
      res.status(400).json({ success: false, error: 'Full name is required.' });
      return;
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
      res.status(400).json({ success: false, error: 'A valid email is required.' });
      return;
    }
    if (typeof role !== 'string' || !STAFF_ROLES.includes(role)) {
      res.status(400).json({ success: false, error: 'Invalid staff role.' });
      return;
    }

    const mobile = typeof mobileNumber === 'string' && /^[6-9]\d{9}$/.test(mobileNumber) ? mobileNumber : null;
    const effectiveNameEn = typeof nameEn === 'string' && nameEn.trim() ? nameEn.trim() : fullName.trim();
    const effectiveNameMr = typeof nameMr === 'string' && nameMr.trim() ? nameMr.trim() : fullName.trim();

    try {
      // Check email uniqueness
      const { data: existing } = await supabase
        .from('auth_users')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      if (existing) {
        res.status(409).json({ success: false, error: 'An account with this email already exists.' });
        return;
      }

      // Generate temporary password
      const tempPassword = randomBytes(6).toString('base64url').slice(0, 10);
      const hashedPassword = await bcrypt.hash(tempPassword, BCRYPT_SALT_ROUNDS);

      // Create username from email prefix or mobile
      const username = mobile || email.split('@')[0].slice(0, 30);

      const { data: newUser, error: insertError } = await supabase
        .from('auth_users')
        .insert({
          username,
          password_hash: hashedPassword,
          role,
          name_en: effectiveNameEn,
          name_mr: effectiveNameMr,
          email: email.toLowerCase(),
          mobile_number: mobile,
          must_change_password: true,
          is_active: true,
          created_by: authReq.authSession!.userId,
        })
        .select('id,username')
        .single();

      if (insertError) throw insertError;

      // Send email with temp password via Resend (with Gmail SMTP fallback)
      const accountSubject = 'Your Ashram Shala Portal Account';
      const accountText = `Your staff account has been created.\n\nUsername: ${username}\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password immediately.`;
      const accountHtml = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#171d19"><p style="color:#006948;font-weight:700">ASHRAM SHALA PATHRAJ</p><h1 style="font-size:20px">Your Staff Account</h1><p>Your account has been created with the following credentials:</p><p><strong>Username:</strong> ${username}<br/><strong>Temporary Password:</strong> <code>${tempPassword}</code></p><p style="color:#93000a;font-weight:600">Please log in and change your password immediately.</p></div>`;

      const accountEmailResult = await sendOtpEmail(
        email.toLowerCase(),
        tempPassword,
        '',
        `admin-create/${newUser.id}/${randomUUID()}`,
        accountSubject,
        accountText,
        accountHtml,
      );
      if (!accountEmailResult.success) {
        console.error('Failed to send account creation email:', accountEmailResult.error);
      }

      await logSecurity(supabase, {
        action: 'account_created',
        userId: newUser.id,
        username: newUser.username,
        ip,
        details: `Staff account created by ${authReq.authSession!.username} with role ${role}`,
      });

      res.status(201).json({
        success: true,
        user: { id: newUser.id, username: newUser.username, role },
        tempPassword,
      });
    } catch (error) {
      console.error('Admin account creation failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Unable to create account.' });
    }
  });

  // GET /api/admin/lookup-parent - Lookup a parent by mobile number or user ID
  app.get('/api/admin/lookup-parent', requireSession(['web_creator', 'principal']), async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');

    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) {
      res.status(400).json({ success: false, error: 'Query parameter q is required.' });
      return;
    }

    try {
      // Try looking up by mobile_number first, then by id
      let parentData = null;
      if (/^[6-9]\d{9}$/.test(q)) {
        const { data } = await supabase
          .from('auth_users')
          .select('id,username,name_en,role,mobile_number')
          .eq('mobile_number', q)
          .eq('role', 'student_parent')
          .eq('is_active', true)
          .maybeSingle();
        parentData = data;
      }

      if (!parentData) {
        const { data } = await supabase
          .from('auth_users')
          .select('id,username,name_en,role,mobile_number')
          .eq('id', q)
          .eq('role', 'student_parent')
          .eq('is_active', true)
          .maybeSingle();
        parentData = data;
      }

      if (!parentData) {
        // Also try by username
        const { data } = await supabase
          .from('auth_users')
          .select('id,username,name_en,role,mobile_number')
          .eq('username', q)
          .eq('role', 'student_parent')
          .eq('is_active', true)
          .maybeSingle();
        parentData = data;
      }

      if (!parentData) {
        res.status(404).json({ success: false, error: 'Parent not found with the given mobile number or ID.' });
        return;
      }

      res.json({ success: true, parent: parentData });
    } catch (error) {
      console.error('Parent lookup failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Unable to look up parent.' });
    }
  });

  // POST /api/admin/link-parent-student - Link a parent account to student IDs
  app.post('/api/admin/link-parent-student', requireSameOrigin, requireSession(['web_creator', 'principal']), async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const ip = clientIp(req);
    res.setHeader('Cache-Control', 'no-store');

    try {
      const limited = await isRateLimited(supabase, 'admin_link', authReq.authSession!.userId, ADMIN_CREATE_RATE_PER_WINDOW, 5 * 60);
      if (limited) {
        rejectRateLimit(res, 'Too many link attempts. Please try again later.', 5 * 60);
        return;
      }
    } catch {
      res.status(503).json({ success: false, error: 'Service temporarily unavailable.' });
      return;
    }

    const { parentUserId, studentIds } = req.body as { parentUserId?: unknown; studentIds?: unknown };

    if (typeof parentUserId !== 'string' || !parentUserId.trim()) {
      res.status(400).json({ success: false, error: 'Parent user ID is required.' });
      return;
    }
    if (!Array.isArray(studentIds) || studentIds.length === 0 || !studentIds.every((id: unknown) => typeof id === 'string' && id.trim())) {
      res.status(400).json({ success: false, error: 'At least one valid student ID is required.' });
      return;
    }
    if (studentIds.length > 20) {
      res.status(400).json({ success: false, error: 'Maximum 20 students can be linked to a parent.' });
      return;
    }

    try {
      // Validate parentUserId exists and has role student_parent
      const { data: parentUser, error: parentError } = await supabase
        .from('auth_users')
        .select('id,role,username,name_en')
        .eq('id', parentUserId.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (parentError) throw parentError;
      if (!parentUser) {
        res.status(404).json({ success: false, error: 'Parent user not found.' });
        return;
      }
      if (parentUser.role !== 'student_parent') {
        res.status(400).json({ success: false, error: 'The specified user does not have the student_parent role.' });
        return;
      }

      // Validate all studentIds exist in the students table
      const trimmedIds = studentIds.map((id: string) => id.trim());
      const { data: existingStudents, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .in('id', trimmedIds);

      if (studentsError) throw studentsError;
      const foundIds = new Set((existingStudents || []).map((s: { id: string }) => s.id));
      const missingIds = trimmedIds.filter((id: string) => !foundIds.has(id));
      if (missingIds.length > 0) {
        res.status(400).json({ success: false, error: `Student IDs not found: ${missingIds.join(', ')}` });
        return;
      }

      // Merge new student IDs with the parent's existing linked students (deduplicated)
      const { data: parentRecord, error: fetchError } = await supabase
        .from('auth_users')
        .select('parent_student_ids')
        .eq('id', parentUserId.trim())
        .single();

      if (fetchError) throw fetchError;
      const existingIds: string[] = Array.isArray(parentRecord?.parent_student_ids) ? parentRecord.parent_student_ids : [];
      const mergedIds = [...new Set([...existingIds, ...trimmedIds])];

      if (mergedIds.length > 20) {
        res.status(400).json({ success: false, error: 'Maximum 20 students can be linked to a parent.' });
        return;
      }

      // Update parent_student_ids with the merged array
      const { error: updateError } = await supabase
        .from('auth_users')
        .update({ parent_student_ids: mergedIds })
        .eq('id', parentUserId.trim());

      if (updateError) throw updateError;

      await logSecurity(supabase, {
        action: 'parent_linked',
        userId: parentUserId.trim(),
        username: parentUser.username,
        ip,
        details: `Parent linked to ${mergedIds.length} student(s) by ${authReq.authSession!.username}`,
      });

      res.json({
        success: true,
        parentUserId: parentUserId.trim(),
        linkedStudentIds: mergedIds,
      });
    } catch (error) {
      console.error('Parent-student linking failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Unable to link parent to students.' });
    }
  });

  // ====================================================================
  // FORGOT PASSWORD - In-memory OTP store for password reset
  // ====================================================================
  const forgotPasswordOtpStore = new Map<string, { code: string; userId: string; expiresAt: number }>();

  // Clean up expired entries every 5 minutes
  const forgotPasswordCleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of forgotPasswordOtpStore.entries()) {
      if (value.expiresAt < now) forgotPasswordOtpStore.delete(key);
    }
  }, 5 * 60_000);
  forgotPasswordCleanupTimer.unref();

  // POST /api/auth/forgot-password - Send reset OTP to user's email
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    const ip = clientIp(req);
    res.setHeader('Cache-Control', 'no-store');

    try {
      const limited = await isRateLimited(supabase, 'forgot_password_ip', ip, 5);
      if (limited) {
        rejectRateLimit(res, 'Too many requests. Please try again later.', RATE_LIMIT_WINDOW_SECONDS);
        return;
      }
    } catch {
      res.status(503).json({ success: false, error: 'Service temporarily unavailable.' });
      return;
    }

    const { identifier } = req.body as { identifier?: unknown };
    if (typeof identifier !== 'string' || !identifier.trim() || identifier.length > 320) {
      res.status(400).json({ success: false, error: 'Please enter your mobile number or email address.' });
      return;
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();

    try {
      // Look up user by mobile number, email, or username
      let user: { id: string; email: string | null; username: string; name_en: string } | null = null;

      if (/^[6-9]\d{9}$/.test(normalizedIdentifier)) {
        // Mobile number lookup
        const { data } = await supabase
          .from('auth_users')
          .select('id,email,username,name_en')
          .eq('mobile_number', normalizedIdentifier)
          .eq('is_active', true)
          .maybeSingle();
        user = data;
      }

      if (!user && normalizedIdentifier.includes('@')) {
        // Email lookup
        const { data } = await supabase
          .from('auth_users')
          .select('id,email,username,name_en')
          .eq('email', normalizedIdentifier)
          .eq('is_active', true)
          .maybeSingle();
        user = data;
      }

      if (!user) {
        // Username lookup
        const { data } = await supabase
          .from('auth_users')
          .select('id,email,username,name_en')
          .eq('username', normalizedIdentifier)
          .eq('is_active', true)
          .maybeSingle();
        user = data;
      }

      if (!user || !user.email) {
        // Return generic message to prevent user enumeration
        res.json({ success: true, message: 'If an account exists with this identifier, a reset code will be sent to the registered email.' });
        return;
      }

      // Generate 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60_000; // 10 minutes

      // Store OTP keyed by the identifier (so user can use same identifier to reset)
      forgotPasswordOtpStore.set(normalizedIdentifier, { code, userId: user.id, expiresAt });

      // Send OTP via email (using same helper as login OTP)
      const emailSubject = 'Password Reset Code - Ashram Shala Pathraj';
      const emailText = `Your password reset code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`;
      const emailHtml = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#171d19"><p style="color:#006948;font-weight:700">ASHRAM SHALA PATHRAJ</p><h1 style="font-size:20px">Password Reset Code</h1><p>Hi ${user.name_en},</p><p>Your password reset code is:</p><p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#006948">${code}</p><p>This code expires in 10 minutes.</p><p>If you did not request this, please ignore this email.</p></div>`;

      const emailResult = await sendOtpEmail(
        user.email,
        code,
        '10 minutes',
        `forgot-password/${user.id}/${randomUUID()}`,
        emailSubject,
        emailText,
        emailHtml,
      );

      if (!emailResult.success) {
        console.error('Forgot password email failed:', emailResult.error);
        res.status(502).json({ success: false, error: 'Could not send reset email. Please try again.' });
        return;
      }

      await logSecurity(supabase, {
        action: 'forgot_password_otp_sent',
        userId: user.id,
        username: user.username,
        ip,
        details: `Password reset OTP sent to ${maskEmail(user.email)}`,
      });

      res.json({
        success: true,
        message: 'If an account exists with this identifier, a reset code will be sent to the registered email.',
        maskedEmail: maskEmail(user.email),
      });
    } catch (error) {
      console.error('Forgot password failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Unable to process request.' });
    }
  });

  // POST /api/auth/reset-password - Verify OTP and set new password
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    const ip = clientIp(req);
    res.setHeader('Cache-Control', 'no-store');

    try {
      const limited = await isRateLimited(supabase, 'reset_password_ip', ip, 10);
      if (limited) {
        rejectRateLimit(res, 'Too many attempts. Please try again later.', RATE_LIMIT_WINDOW_SECONDS);
        return;
      }
    } catch {
      res.status(503).json({ success: false, error: 'Service temporarily unavailable.' });
      return;
    }

    const { identifier, otp, newPassword } = req.body as { identifier?: unknown; otp?: unknown; newPassword?: unknown };

    if (typeof identifier !== 'string' || !identifier.trim()) {
      res.status(400).json({ success: false, error: 'Identifier is required.' });
      return;
    }
    if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      res.status(400).json({ success: false, error: 'A valid 6-digit code is required.' });
      return;
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 100) {
      res.status(400).json({ success: false, error: 'Password must be between 8 and 100 characters.' });
      return;
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();
    const storedOtp = forgotPasswordOtpStore.get(normalizedIdentifier);

    if (!storedOtp) {
      res.status(400).json({ success: false, error: 'No reset code found. Please request a new one.' });
      return;
    }

    if (Date.now() > storedOtp.expiresAt) {
      forgotPasswordOtpStore.delete(normalizedIdentifier);
      res.status(400).json({ success: false, error: 'Reset code has expired. Please request a new one.' });
      return;
    }

    if (storedOtp.code !== otp) {
      res.status(401).json({ success: false, error: 'Invalid reset code. Please try again.' });
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

      const { error } = await supabase
        .from('auth_users')
        .update({
          password_hash: hashedPassword,
          must_change_password: false,
          password_changed_at: new Date().toISOString(),
        })
        .eq('id', storedOtp.userId);

      if (error) throw error;

      // Remove the used OTP
      forgotPasswordOtpStore.delete(normalizedIdentifier);

      // Load user data for session
      const user = await loadActiveUser(supabase, storedOtp.userId);
      if (user) {
        // Issue session so user is logged in after password reset
        issueSession(res, {
          userId: user.id,
          username: user.username,
          role: user.role,
          nameEn: user.name_en,
          nameMr: user.name_mr,
        });
      }

      await logSecurity(supabase, {
        action: 'password_reset',
        userId: storedOtp.userId,
        ip,
        details: 'Password reset via forgot-password OTP',
      });

      res.json({
        success: true,
        user: user ? {
          username: user.username,
          role: user.role,
          nameEn: user.name_en,
          nameMr: user.name_mr,
          mustChangePassword: false,
        } : undefined,
      });
    } catch (error) {
      console.error('Reset password failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Unable to reset password.' });
    }
  });

  // POST /api/auth/verify-phone-after-login - Verify phone number for already logged-in users
  app.post('/api/auth/verify-phone-after-login', requireSameOrigin, requireSession(), async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const ip = clientIp(req);
    res.setHeader('Cache-Control', 'no-store');

    const { phone, otp } = req.body as { phone?: unknown; otp?: unknown };

    if (typeof phone !== 'string' || !/^[6-9]\d{9}$/.test(phone)) {
      res.status(400).json({ success: false, error: 'A valid 10-digit Indian mobile number is required.' });
      return;
    }

    if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      res.status(400).json({ success: false, error: 'A valid 6-digit OTP is required.' });
      return;
    }

    try {
      // Verify OTP from sms_otp_codes table
      const otpHashed = createHash('sha256').update(otp).digest('hex');
      const { data: otpRecord, error: otpError } = await supabase
        .from('sms_otp_codes')
        .select('id,otp_hash,expires_at,verified')
        .eq('phone', phone)
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (otpError) {
        console.error('Phone verification OTP lookup error:', otpError.message);
        res.status(500).json({ success: false, error: 'Unable to verify OTP.' });
        return;
      }

      if (!otpRecord) {
        res.status(400).json({ success: false, error: 'OTP is invalid or expired. Please request a new one.' });
        return;
      }

      if (otpRecord.otp_hash !== otpHashed) {
        res.status(401).json({ success: false, error: 'Invalid OTP. Please check and try again.' });
        return;
      }

      // Mark OTP as verified
      await supabase
        .from('sms_otp_codes')
        .update({ verified: true })
        .eq('id', otpRecord.id);

      // Update user's phone_verified status and mobile_number
      const { error: updateError } = await supabase
        .from('auth_users')
        .update({ phone_verified: true, mobile_number: phone })
        .eq('id', authReq.authSession!.userId);

      if (updateError) {
        console.error('Phone verification update error:', updateError.message);
        res.status(500).json({ success: false, error: 'Unable to update verification status.' });
        return;
      }

      await logSecurity(supabase, {
        action: 'phone_verified_after_login',
        userId: authReq.authSession!.userId,
        username: authReq.authSession!.username,
        ip,
        details: `Phone +91${phone} verified after login`,
      });

      res.json({ success: true, message: 'Phone number verified successfully.' });
    } catch (error) {
      console.error('Phone verification failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Unable to verify phone number.' });
    }
  });

  // POST /api/auth/send-sms-otp - Send OTP via SMS (with rate limiting)
  app.post('/api/auth/send-sms-otp', async (req: Request, res: Response) => {
    const ip = clientIp(req);
    const operationId = requestId(req);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Request-ID', operationId);

    const configuration = otpConfiguration();
    if (!configuration) {
      res.status(503).json({ success: false, error: 'OTP service is not configured.' });
      return;
    }

    const { challengeToken: token, mobileNumber } = req.body as { challengeToken?: unknown; mobileNumber?: unknown };
    if (!validChallengeToken(token)) {
      res.status(400).json({ success: false, error: 'Verification session is invalid or expired.' });
      return;
    }
    if (typeof mobileNumber !== 'string' || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      res.status(400).json({ success: false, error: 'A valid 10-digit Indian mobile number is required.' });
      return;
    }

    // Rate limit: max 3 SMS per 10 minutes per phone number
    const now = Date.now();
    const rateLimitKey = `sms:${mobileNumber}`;
    const existing = smsRateLimitMap.get(rateLimitKey);
    if (existing) {
      if (now - existing.firstSentAt < SMS_RATE_LIMIT_WINDOW_MS) {
        if (existing.count >= SMS_RATE_LIMIT_MAX) {
          const retryAfter = Math.ceil((SMS_RATE_LIMIT_WINDOW_MS - (now - existing.firstSentAt)) / 1000);
          rejectRateLimit(res, 'Too many SMS OTP requests. Please try again later.', retryAfter);
          return;
        }
      } else {
        // Window expired, reset
        smsRateLimitMap.delete(rateLimitKey);
      }
    }

    try {
      const hash = challengeHash(token);
      const challenge = await loadChallenge(supabase, hash);
      if (!challenge || new Date(challenge.expires_at).getTime() <= Date.now()) {
        res.status(400).json({ success: false, error: 'Verification session is invalid or expired.' });
        return;
      }

      // IP rate limiting
      const ipLimited = await isRateLimited(supabase, 'sms_otp_ip', ip, OTP_ATTEMPTS_PER_WINDOW);
      if (ipLimited) {
        rejectRateLimit(res, 'Too many OTP requests. Please try again later.', RATE_LIMIT_WINDOW_SECONDS);
        return;
      }

      const code = deriveOtpCode(hash, configuration.hmacSecret);
      const codeHash = otpHash(hash, code, configuration.hmacSecret);
      const remainingChallengeMs = new Date(challenge.expires_at).getTime() - now;
      const proposedOtpExpiresAt = new Date(now + Math.min(OTP_TTL_MS, remainingChallengeMs)).toISOString();

      const { data: reservationData, error: reservationError } = await supabase.rpc('reserve_otp_send', {
        p_challenge_hash: hash,
        p_otp_hash: codeHash,
        p_otp_expires_at: proposedOtpExpiresAt,
        p_request_id: operationId,
        p_max_sends: MAX_SENDS,
        p_cooldown_seconds: RESEND_COOLDOWN_MS / 1000,
        p_reservation_seconds: SEND_RESERVATION_SECONDS,
      });
      if (reservationError) throw reservationError;

      const reservation = firstRpcRow<SendReservationRow>(reservationData);
      if (!reservation) throw new Error('OTP reservation RPC returned no row');

      if (reservation.reservation_status === 'sent') {
        res.json({ success: true, resendAfterSeconds: RESEND_COOLDOWN_MS / 1000 });
        return;
      }
      if (reservation.reservation_status === 'busy' || reservation.reservation_status === 'cooldown') {
        rejectRateLimit(res, `Please wait ${reservation.retry_after_seconds} seconds before requesting another code.`, reservation.retry_after_seconds);
        return;
      }
      if (reservation.reservation_status === 'send_limit') {
        rejectRateLimit(res, 'OTP send limit reached. Start the process again.', Math.ceil(remainingChallengeMs / 1000));
        return;
      }
      if (reservation.reservation_status !== 'reserved' || !reservation.challenge_id) {
        res.status(400).json({ success: false, error: 'Verification session is invalid or expired.' });
        return;
      }

      // Send SMS OTP
      const smsApiKey = process.env.SMS_API_KEY?.trim();
      const smsProviderUrl = process.env.SMS_PROVIDER_URL?.trim();

      if (smsApiKey && smsProviderUrl) {
        // Production: Send via SMS provider
        try {
          const smsResponse = await fetch(smsProviderUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${smsApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: `+91${mobileNumber}`,
              message: `Your Ashram Shala Pathraj verification code is ${code}. Do not share this with anyone.`,
            }),
            signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
          });

          if (!smsResponse.ok) {
            const smsError = await smsResponse.text();
            console.error('SMS provider failed:', smsResponse.status, smsError.slice(0, 200));
            await supabase.rpc('cancel_otp_send', { p_challenge_id: reservation.challenge_id, p_request_id: operationId });
            res.status(502).json({ success: false, error: 'Could not send SMS. Please try email verification instead.' });
            return;
          }
        } catch (smsErr) {
          console.error('SMS delivery error:', smsErr instanceof Error ? smsErr.message : smsErr);
          await supabase.rpc('cancel_otp_send', { p_challenge_id: reservation.challenge_id, p_request_id: operationId });
          res.status(502).json({ success: false, error: 'Could not send SMS. Please try email verification instead.' });
          return;
        }
      } else {
        // Development mode: Log OTP to console
        console.log(`[DEV SMS OTP] To: +91${mobileNumber}, Code: ${code}`);
      }

      // Confirm the OTP send
      const { error: confirmError } = await supabase.rpc('confirm_otp_send', {
        p_challenge_id: reservation.challenge_id,
        p_request_id: operationId,
      });
      if (confirmError) console.error('SMS OTP delivery confirmation update failed:', confirmError.message);

      // Update rate limit counter
      const currentLimit = smsRateLimitMap.get(rateLimitKey);
      if (currentLimit && now - currentLimit.firstSentAt < SMS_RATE_LIMIT_WINDOW_MS) {
        currentLimit.count++;
      } else {
        smsRateLimitMap.set(rateLimitKey, { count: 1, firstSentAt: now });
      }

      await logSecurity(supabase, {
        action: 'sms_otp_sent',
        userId: challenge.user_id,
        ip,
        details: `SMS OTP sent to +91${mobileNumber.slice(0, 2)}****${mobileNumber.slice(8)}`,
      });

      res.json({ success: true, resendAfterSeconds: RESEND_COOLDOWN_MS / 1000 });
    } catch (error) {
      console.error('SMS OTP send failed:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, error: 'Could not send SMS verification code.' });
    }
  });
}
