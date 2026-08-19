import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

const SESSION_TTL_SECONDS = 8 * 60 * 60;
const SESSION_COOKIE = 'ashram_session';

export interface SessionClaims {
  userId: string;
  username: string;
  role: string;
  nameEn: string;
  nameMr: string;
  expiresAt: number;
}

export interface AuthenticatedRequest extends Request {
  authSession?: SessionClaims;
  requestId?: string;
}

function sessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET?.trim() || process.env.OTP_HMAC_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : null;
}

function base64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function cookies(req: Request): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of (req.get('cookie') || '').split(';')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key) result[key] = value;
  }
  return result;
}

function sessionToken(claims: SessionClaims, secret: string): string {
  const payload = base64Url(JSON.stringify(claims));
  return `${payload}.${sign(payload, secret)}`;
}

export function readSession(req: Request): SessionClaims | null {
  const secret = sessionSecret();
  const token = cookies(req)[SESSION_COOKIE];
  if (!secret || !token) return null;
  const separator = token.lastIndexOf('.');
  if (separator < 1) return null;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!safeEqual(signature, sign(payload, secret))) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionClaims;
    if (
      !claims ||
      typeof claims.userId !== 'string' ||
      typeof claims.username !== 'string' ||
      typeof claims.role !== 'string' ||
      typeof claims.expiresAt !== 'number' ||
      claims.expiresAt <= Math.floor(Date.now() / 1000)
    ) return null;
    return claims;
  } catch {
    return null;
  }
}

export function issueSession(res: Response, user: Omit<SessionClaims, 'expiresAt'>): void {
  const secret = sessionSecret();
  if (!secret) throw new Error('SESSION_SECRET or OTP_HMAC_SECRET must contain at least 32 characters');
  const claims: SessionClaims = {
    ...user,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const secure = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  res.append('Set-Cookie', [
    `${SESSION_COOKIE}=${sessionToken(claims, secret)}`,
    'HttpOnly',
    secure ? 'Secure' : '',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ].filter(Boolean).join('; '));
}

export function clearSession(res: Response): void {
  const secure = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  res.append('Set-Cookie', [
    `${SESSION_COOKIE}=`,
    'HttpOnly',
    secure ? 'Secure' : '',
    'SameSite=Strict',
    'Path=/',
    'Max-Age=0',
  ].filter(Boolean).join('; '));
}

export function requireSession(roles?: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const session = readSession(req);
    if (!session) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (roles && !roles.includes(session.role)) {
      res.status(403).json({ error: 'You do not have permission for this operation.' });
      return;
    }
    (req as AuthenticatedRequest).authSession = session;
    next();
  };
}

export function requireSameOrigin(req: Request, res: Response, next: NextFunction): void {
  const origin = req.get('origin');
  const host = req.get('host');
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        res.status(403).json({ error: 'Cross-origin request rejected.' });
        return;
      }
    } catch {
      res.status(403).json({ error: 'Invalid request origin.' });
      return;
    }
  }
  next();
}

interface RateLimitOptions {
  bucket: string;
  maximum: number;
  windowSeconds: number;
  key?: (req: AuthenticatedRequest) => string;
}

export function durableRateLimit(supabase: SupabaseClient, options: RateLimitOptions): RequestHandler {
  return async (request: Request, res: Response, next: NextFunction) => {
    const req = request as AuthenticatedRequest;
    const rawKey = options.key?.(req) || req.ip || req.socket.remoteAddress || 'unknown';
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    try {
      const { data, error } = await supabase.rpc('consume_auth_rate_limit', {
        p_bucket: options.bucket,
        p_key_hash: keyHash,
        p_window_seconds: options.windowSeconds,
        p_max_attempts: options.maximum,
      });
      if (error) throw error;
      if (data !== true) {
        res.setHeader('Retry-After', String(options.windowSeconds));
        res.status(429).json({
          error: 'Too many requests. Please try again later.',
          retryAfter: options.windowSeconds,
        });
        return;
      }
      next();
    } catch (error) {
      console.error(`Rate limit unavailable for ${options.bucket}:`, error instanceof Error ? error.message : error);
      res.status(503).json({ error: 'Request protection service is temporarily unavailable.' });
    }
  };
}

export function concurrencyGate(maximum: number, label: string): RequestHandler {
  let inFlight = 0;
  return (_req: Request, res: Response, next: NextFunction) => {
    if (inFlight >= maximum) {
      res.setHeader('Retry-After', '5');
      res.status(503).json({ error: `${label} is busy. Please retry shortly.`, retryAfter: 5 });
      return;
    }

    inFlight += 1;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      inFlight = Math.max(0, inFlight - 1);
    };
    res.once('finish', release);
    res.once('close', release);
    next();
  };
}

function proxySetting(): false | number | string {
  const configured = process.env.TRUST_PROXY?.trim();
  if (!configured) return process.env.VERCEL ? 1 : false;
  if (/^\d+$/.test(configured)) return Number(configured);
  if (configured === 'false' || configured === 'off') return false;
  return configured;
}

export function configureSecurity(app: Express): void {
  app.disable('x-powered-by');
  app.set('trust proxy', proxySetting());
  app.use((request: Request, res: Response, next: NextFunction) => {
    const req = request as AuthenticatedRequest;
    const supplied = req.get('X-Request-ID');
    req.requestId = supplied && /^[\w./-]{8,128}$/.test(supplied) ? supplied : randomUUID();
    res.setHeader('X-Request-ID', req.requestId);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=(self)');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    next();
  });
}
