# System Architecture

This document describes the complete architecture of the Ashram Shala Pathraj Portal, including the AI agent system, security layers, rate limiting, container status, and communication channel readiness.

---

## Table of Contents

1. [ADK Multi-Agent System](#adk-multi-agent-system)
2. [Request Handling and Concurrency](#request-handling-and-concurrency)
3. [DDoS/DoS Protection](#ddosdos-protection)
4. [Rate Limit Reference Table](#rate-limit-reference-table)
5. [Security Measures](#security-measures)
6. [Docker Container Status](#docker-container-status)
7. [Kubernetes Status](#kubernetes-status)
8. [SMS/WhatsApp Channel Status](#smswhatsapp-channel-status)

---

## ADK Multi-Agent System

The portal uses a multi-agent AI system with 5 specialized agents. There are two implementations that form a provider fallback chain:

### Agent Types

| Agent | Purpose | Routed via keywords |
|-------|---------|---------------------|
| **admission** | Eligibility, documents, application process, fees, scholarships | admission, admit, enroll, eligibility, document, application, apply, seat, certificate, aadhaar, caste (+ Marathi equivalents) |
| **attendance** | Attendance policies, leave procedures | attendance, present, absent, leave (+ Marathi equivalents) |
| **hostel** | Hostel facilities, meals, routines, visitor procedures | hostel, bed, mess, food, meal, room, rector, warden, medical (+ Marathi equivalents) |
| **academic** | Curriculum, exams, scholarships, timetable | exam, result, marks, grade, schedule, timetable, syllabus, subject, board, scholarship (+ Marathi equivalents) |
| **general** | General school queries, routing to departments | Fallback when no keywords match |

### Intent Detection

Both implementations use keyword-based scoring:
- Each incoming message is matched against keyword lists for each agent category.
- The category with the highest keyword match count is selected.
- If no keywords match (score = 0), routes to the `general` agent.
- Tie-breaking priority: admission > attendance > hostel > academic.

### Provider Fallback Chain

```
Request arrives at POST /api/ai-chat
        │
        ▼
┌─── Python ADK Service (if ADK_SERVICE_URL is set) ───┐
│    FastAPI server at agents/main.py                    │
│    Uses google-genai SDK with gemini-3.6-flash         │
│    Timeout: 8 seconds                                  │
└───────────────────────────────────────────────────────┘
        │ (fails or not configured)
        ▼
┌─── Gemini API (Direct) ──────────────────────────────┐
│    Model: gemini-3.6-flash (configurable via          │
│    GEMINI_MODEL env var)                               │
│    Timeout: 12 seconds (AI_TIMEOUT_MS)                 │
└───────────────────────────────────────────────────────┘
        │ (fails)
        ▼
┌─── Fallback Provider (based on AI_FALLBACK_PROVIDER) ─┐
│    "openai"  -> gpt-4.1-mini (OPENAI_MODEL)           │
│    "anthropic" -> claude-3-5-haiku-latest              │
│                  (ANTHROPIC_MODEL)                      │
│    Timeout: 12 seconds (AI_TIMEOUT_MS)                 │
└───────────────────────────────────────────────────────┘
        │ (all fail)
        ▼
    503 "AI assistant is temporarily unavailable."
```

### Python ADK Service (`agents/` directory)

- **Entry point:** `agents/main.py` (FastAPI with Uvicorn)
- **Endpoint:** `POST /chat` with body `{ "message": string, "language": "en"|"mr" }`
- **Health check:** `GET /health`
- **Port:** configurable via `ADK_PORT` env var (default: 8000)
- **Config:** `agents/config.py` loads `GEMINI_API_KEY` and sets `GEMINI_MODEL = 'gemini-3.6-flash'`
- **Router:** `agents/router.py` performs intent detection and routes to the correct agent class
- **Agent classes:** `agents/agents/` directory contains `admission_agent.py`, `attendance_agent.py`, `hostel_agent.py`, `academic_agent.py`, `general_agent.py`
- Each agent has a detailed system prompt with school-specific context (e.g., admission eligibility, 459 students, Std 1-12, Marathi medium)

### Agent System Prompts (Node.js Express side)

Defined in `server/agents.ts` under `AGENT_PROMPTS`. Each prompt includes the shared `BASE_CONTEXT`:

```
"You are the AI assistant for शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज
(Government Secondary and Higher Secondary Ashram School, Pathraj), Taluka Karjat,
District Raigad, Maharashtra. The school operates under the Tribal Development Department,
Government of Maharashtra..."
```

Key guardrails in prompts:
- Never claim access to live student/attendance/academic/hostel/government systems
- Never reveal personal records
- Respond in the user's language (Marathi or English)
- Be helpful, accurate, and concise

### Text-to-Speech (TTS)

- **Provider:** ElevenLabs
- **Model:** `eleven_multilingual_v2`
- **Endpoint:** `POST /api/voice/tts`
- **Voice ID:** configurable via `ELEVENLABS_VOICE_ID` (default: `pNInz6obpgDQGcFmaJgB`)
- **Max text length:** 2000 characters
- **Max audio response:** 5 MB safety limit
- **Timeout:** 15 seconds (`TTS_TIMEOUT_MS`)

### Structured Logging

Every agent call is logged as JSON to stdout:
```json
{
  "event": "agent_activity",
  "timestamp": "ISO-8601",
  "requestId": "uuid",
  "agent": "admission|attendance|hostel|academic|general",
  "provider": "gemini|openai|anthropic|python-agent-service",
  "model": "gemini-3.6-flash|gpt-4.1-mini|claude-3-5-haiku-latest",
  "durationMs": 1234,
  "fallbackUsed": false,
  "status": "success|failed",
  "messageLength": 42,
  "language": "en|mr"
}
```

---

## Request Handling and Concurrency

### Node.js Event Loop

The server runs on Node.js 22 using a single-threaded event loop:
- All I/O operations (Supabase queries, AI API calls, email sending) are non-blocking and async.
- Express handlers are `async` functions that `await` external calls without blocking other requests.
- The event loop can handle thousands of concurrent connections because no handler blocks the thread.

### Express Async Handlers

All route handlers in `server/auth.ts`, `server/data.ts`, and `server/agents.ts` are async:
```typescript
app.post('/api/ai-chat', requireSession(...), chatLimit, chatGate, async (request, res) => {
  // Awaits AI provider calls without blocking other requests
  const result = await runAgent(message, language, requestId);
  res.json(result);
});
```

### Concurrency Gates (In-Memory)

Concurrency gates prevent server overload by limiting simultaneous in-flight requests for expensive operations. Defined in `server/security.ts` as the `concurrencyGate()` middleware:

| Resource | Max Concurrent | Label | Exceeded Response |
|----------|---------------|-------|-------------------|
| AI Chat | 8 (configurable via `MAX_AI_CONCURRENCY`) | "AI assistant" | 503 with Retry-After: 5 |
| TTS | 4 (configurable via `MAX_TTS_CONCURRENCY`) | "Voice service" | 503 with Retry-After: 5 |
| Data operations | 32 (configurable via `MAX_DATA_CONCURRENCY`) | "Database service" | 503 with Retry-After: 5 |

The gate tracks in-flight requests and releases the slot when `res` emits `finish` or `close`.

### Graceful Shutdown

Defined in `server.ts`:
- Listens for `SIGTERM` and `SIGINT` signals.
- Calls `server.close()` to stop accepting new connections and drain existing ones.
- Hard deadline of 10 seconds; if not drained by then, `process.exit(1)`.

---

## DDoS/DoS Protection

The system uses multiple defense layers:

### Layer 1: Edge Protection (Production)

In production on Vercel, the platform provides automatic DDoS protection at the edge, absorbing volumetric attacks before they reach the application.

### Layer 2: Trust Proxy + Per-IP Global Rate Limit

- **Trust proxy:** configured in `server/security.ts` via `proxySetting()`. On Vercel, defaults to `1`. Configurable via `TRUST_PROXY` env var.
- **Global IP rate limit:** applied to all `/api` routes via `durableRateLimit()` middleware in `server/app.ts`.

### Layer 3: Per-Endpoint Rate Limits

Each endpoint has its own rate limit bucket (see table below). All rate limits are backed by the Supabase RPC `consume_auth_rate_limit`, making them atomic and durable across server restarts.

### Layer 4: Concurrency Gates

In-memory gates prevent resource exhaustion (see section above).

### Layer 5: Request Timeouts

| Operation | Timeout |
|-----------|---------|
| AI provider calls | 12 seconds (`AI_TIMEOUT_MS`) |
| TTS provider calls | 15 seconds (`TTS_TIMEOUT_MS`) |
| Resend email delivery | 8 seconds (`RESEND_TIMEOUT_MS`) |
| Database readiness check | 3 seconds (inline `setTimeout`) |
| Python ADK service | 8 seconds (min of `AI_TIMEOUT_MS`, 8000) |

### Layer 6: Request Body Limit

```typescript
app.use(express.json({ limit: '10kb', strict: true }));
```

Rejects payloads larger than 10 KB with a 413 status.

### Layer 7: Security Headers

Applied to every response in `configureSecurity()` (`server/security.ts`):
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: same-origin`
- `Permissions-Policy: camera=(), geolocation=(), microphone=(self)`
- `Cross-Origin-Resource-Policy: same-origin`
- `x-powered-by` header disabled

### Layer 8: CSRF Protection

`requireSameOrigin` middleware on all mutation endpoints validates that the `Origin` header matches the `Host` header. Cross-origin requests are rejected with 403.

---

## Rate Limit Reference Table

All rate limits use Supabase RPC `consume_auth_rate_limit` for atomic, durable enforcement.

| Endpoint | Bucket | Limit | Window | Key | Exceeded Response |
|----------|--------|-------|--------|-----|-------------------|
| `ALL /api/*` | `api_global_ip` | 180 | 60s | IP address | 429 + Retry-After: 60 |
| `POST /api/auth/login` | `login_ip` | 5 | 60s | IP address | 429 "Too many login attempts. Please try again after 1 minute." |
| `POST /api/auth/login` | `login_account` | 5 | 60s | Username (lowercase) | 429 "Too many login attempts. Please try again after 1 minute." |
| `POST /api/otp/send` | `otp_send_ip` | 10 | 60s | IP address | 429 "Too many OTP requests. Please try again later." |
| `POST /api/otp/send` | `otp_send_account` | 5 | 600s (10 min) | User ID | 429 "Too many OTP requests. Please try again later." |
| `POST /api/otp/verify` | `otp_verify_ip` | 10 | 60s | IP address | 429 "Too many verification attempts. Please try again later." |
| `POST /api/otp/verify` | `otp_verify_account` | 10 | 600s (10 min) | User ID | 429 "Too many verification attempts. Please try again later." |
| `POST /api/auth/register` | `register_ip` | 3 | 60s | IP address | 429 "Too many registration attempts. Please try again later." |
| `POST /api/ai-chat` | `ai_chat_account` | 20 | 60s | User ID | 429 "Too many requests. Please try again later." |
| `POST /api/voice/tts` | `tts_account` | 10 | 60s | User ID | 429 "Too many requests. Please try again later." |
| `GET /api/students`, `GET /api/staff`, `GET /api/parent/my-children` | `api_read_account` | 120 | 60s | User ID | 429 "Too many requests. Please try again later." |
| `POST/PUT/DELETE /api/students`, `POST/PUT/DELETE /api/staff` | `api_write_account` | 30 | 300s (5 min) | User ID | 429 "Too many requests. Please try again later." |

### How Rate Limiting Works

1. Every rate-limited request calls the Supabase RPC `consume_auth_rate_limit` with parameters:
   - `p_bucket`: the rate limit category name
   - `p_key_hash`: SHA-256 hash of the identifier (IP or user ID)
   - `p_window_seconds`: sliding window duration
   - `p_max_attempts`: maximum allowed requests in the window
2. The RPC atomically increments the counter and returns `true` if within limits, `false` if exceeded.
3. On exceeded: the server responds with HTTP 429, a `Retry-After` header, and a JSON error message.
4. Because the state lives in Supabase (PostgreSQL), rate limits survive server restarts and work across multiple server instances.

---

## Security Measures

### Authentication: HMAC Sessions

- Sessions are stored as signed cookies (`ashram_session`).
- Cookie value = `base64url(JSON claims).HMAC-SHA256(payload, secret)`.
- Session secret: `SESSION_SECRET` or `OTP_HMAC_SECRET` env var (minimum 32 characters).
- Session TTL: 8 hours (`SESSION_TTL_SECONDS = 8 * 60 * 60`).
- Cookie attributes: `HttpOnly`, `Secure` (in production), `SameSite=Strict`, `Path=/`.
- Session is validated on every authenticated request via `readSession()` which checks signature and expiry.

### Authentication: Bcrypt Passwords

- Passwords hashed with bcrypt at cost factor 12 (`BCRYPT_SALT_ROUNDS = 12`).
- Legacy plaintext passwords auto-migrate to bcrypt on successful login.
- Password verification uses timing-safe comparison (bcrypt internally).

### Authentication: Email OTP

- Login requires password + email OTP (two-factor).
- OTP codes are 6-digit, derived deterministically via HMAC (same code for resends within a challenge).
- OTP is stored as HMAC hash in the database (never stored in plaintext).
- Challenge TTL: 10 minutes. OTP TTL: 10 minutes. Max 3 sends per challenge. Max 5 verify attempts.
- Email sent via Resend API with idempotency keys.

### CSRF Protection

- `requireSameOrigin` middleware on all state-changing endpoints (`POST`, `PUT`, `DELETE`).
- Validates `Origin` header matches `Host` header.
- Cross-origin requests rejected with 403.

### Input Validation

- Strict JSON body parsing (`express.json({ strict: true })`).
- Per-field length limits on all user inputs (username: 50, password: 100, names: 160, etc.).
- UUID format validation on resource IDs (`/^[0-9a-f-]{36}$/i`).
- SQL injection prevention via Supabase parameterized queries (never raw SQL).
- Search inputs sanitized: `replace(/[,.()"\\%_]/g, '')`.

### Security Logging

All security events logged to `security_logs` table in Supabase:
- `login_failed`, `password_verified`, `otp_sent`, `otp_failed`, `login_success`
- `student_created`, `student_updated`, `student_deleted`
- `staff_created`, `staff_updated`, `staff_deleted`
- Each log includes: action, user_id, username, ip_address, details.

---

## Docker Container Status

**Status: EXISTS (not deployed in production - Vercel is the production platform)**

### Multi-Stage Build (`Dockerfile`)

| Stage | Base Image | Purpose |
|-------|-----------|---------|
| `builder` | `node:22-alpine` | Installs all dependencies (`npm ci`), copies source, runs `npm run build` (Vite + esbuild) |
| `deps` | `node:22-alpine` | Installs production-only dependencies (`npm ci --omit=dev`) |
| Production | `node:22-alpine` | Copies `dist/` from builder, `node_modules/` from deps, runs `node dist/server.js` |

### Container Details

- **Exposed port:** 3000
- **Health check:** `wget --no-verbose --tries=1 --spider http://localhost:3000/api/health` every 30s (start period: 5s, timeout: 10s, retries: 3)
- **Environment:** `NODE_ENV=production`
- **Entry point:** `CMD ["node", "dist/server.js"]`

### Build and Run

```bash
# Build the image
docker build -t ashram-shala-pathraj .

# Run with environment file
docker run -p 3000:3000 --env-file .env ashram-shala-pathraj
```

### Docker Compose (`docker-compose.yml`)

```bash
docker compose up --build
```

- Single `web` service
- Reads environment from `.env` file
- Restart policy: `unless-stopped`
- Same health check as Dockerfile

---

## Kubernetes Status

**Status: MANIFESTS EXIST - NOT DEPLOYED (no Kubernetes cluster is provisioned)**

All manifests are in the `k8s/` directory, targeting the `ashram-shala` namespace.

### Manifest Overview

| File | Resource | Purpose |
|------|----------|---------|
| `k8s/namespace.yaml` | Namespace `ashram-shala` | Isolates all resources in a dedicated namespace |
| `k8s/deployment.yaml` | Deployment (2 replicas) | Runs the container with resource limits, liveness/readiness probes |
| `k8s/service.yaml` | ClusterIP Service on port 3000 | Internal load balancer for pods |
| `k8s/ingress.yaml` | Ingress with TLS | Routes external traffic via nginx ingress controller with Let's Encrypt TLS |
| `k8s/hpa.yaml` | HorizontalPodAutoscaler | Auto-scales 2-5 replicas based on 70% CPU utilization |
| `k8s/configmap.yaml` | ConfigMap | Non-sensitive config: `PORT=3000`, `NODE_ENV=production` |
| `k8s/secret.yaml` | Secret (Opaque) | API keys (Gemini, ElevenLabs, Supabase, WhatsApp) - contains placeholder values |

### Deployment Spec Highlights

- **Image:** `ghcr.io/OWNER/REPO:latest` (placeholder - must be replaced)
- **Resources:**
  - Requests: 128Mi memory, 250m CPU
  - Limits: 256Mi memory, 500m CPU
- **Liveness probe:** `GET /api/health` on port 3000, initial delay 10s, period 30s
- **Readiness probe:** `GET /api/health` on port 3000, initial delay 5s, period 10s
- **Environment:** loaded from ConfigMap + Secret via `envFrom`

### HPA Auto-Scaling

- Minimum replicas: 2
- Maximum replicas: 5
- Scale-up trigger: average CPU utilization exceeds 70%
- Uses `autoscaling/v2` API

### Ingress Configuration

- Ingress class: `nginx`
- TLS via cert-manager with `letsencrypt-prod` cluster issuer
- Host: `ashram-shala.example.com` (placeholder - must be customized)

---

## SMS/WhatsApp Channel Status

### Current Status: NOT ACTIVE

The portal currently supports only **email OTP via Resend** for authentication. No SMS or WhatsApp messaging channels are operational.

### Email (Active)

- **Provider:** Resend
- **Status:** Sandbox mode - can only send to the verified email `omkardsupe143644@gmail.com`
- **Used for:** Login OTP delivery, registration verification
- **Configuration:** `RESEND_API_KEY` and `RESEND_FROM_EMAIL` env vars

### SMS (Not Active)

**What is needed to activate SMS:**

| Requirement | Options |
|-------------|---------|
| SMS Provider | Twilio, MSG91, or similar with API key |
| Verified sender | DLT-registered sender ID (mandatory in India) |
| Template approval | SMS templates must be approved by TRAI DLT platform |
| Environment variables | Provider API key, sender ID, template IDs |
| Code changes | New SMS sending function in `server/auth.ts` or separate module |

### WhatsApp (Not Active)

**What is needed to activate WhatsApp:**

| Requirement | Details |
|-------------|---------|
| WhatsApp Business API account | Via Meta for Developers |
| Verified phone number | Dedicated number verified through Meta's process |
| Webhook endpoint | Public HTTPS endpoint for receiving messages |
| Template message approval | Pre-approved templates for initiating conversations |
| Meta App Secret | For webhook payload signature verification |
| Permanent access token | System user token with messaging permissions |
| Environment variables | `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` |
| Code changes | Webhook handler, message parser, response formatter |

See `docs/WHATSAPP_BOT_OPAL_PROMPT.md` for the complete WhatsApp bot design and Google Opal prompt.
