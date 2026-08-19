# Deployment Guide

This document covers all deployment options for the Ashram Shala Pathraj Portal: Vercel (production), Docker (local/staging), and Kubernetes (future scaling).

---

## Table of Contents

1. [Vercel Deployment (Production)](#vercel-deployment-production)
2. [Docker Deployment](#docker-deployment)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Environment Variables Reference](#environment-variables-reference)

---

## Vercel Deployment (Production)

The portal is deployed to Vercel as a hybrid SPA + serverless API.

### How It Works

- **Frontend (SPA):** Vite builds the React app into `dist/`. Vercel serves static files from this directory.
- **API (Serverless):** The Express app is exported from `api/index.ts` as a Vercel serverless function. All `/api/*` requests are routed to this function.
- **SPA Routing:** All non-API requests are rewritten to `/index.html` for client-side routing.

### Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ],
  "functions": {
    "api/**": {
      "maxDuration": 30
    }
  }
}
```

- `buildCommand`: runs `vite build` (frontend only via the `vercel-build` script)
- `outputDirectory`: `dist/` contains the built SPA assets
- Rewrites route all `/api/*` paths to the serverless function
- Non-API paths serve `index.html` (SPA catch-all for client-side routing)
- Serverless function timeout: 30 seconds

### Auto-Deploy on Push

Vercel automatically deploys on every push to the connected branch:
- Push to `main` triggers a production deployment
- Push to any other branch creates a preview deployment with a unique URL
- No manual deployment steps required

### Setting Environment Variables

In the Vercel dashboard:
1. Go to Project Settings > Environment Variables
2. Add each variable from the [Environment Variables Reference](#environment-variables-reference) section
3. Set appropriate scopes (Production, Preview, Development)
4. Redeploy for changes to take effect

### DDoS Protection

Vercel provides automatic edge-level DDoS protection in production. This is the first layer of defense before requests reach the application's own rate limiting.

---

## Docker Deployment

### Prerequisites

- Docker 20.10+ installed
- `.env` file with all required environment variables

### Build the Image

```bash
# Using npm script
npm run docker:build

# Or directly
docker build -t ashram-shala-pathraj .
```

The multi-stage build (`Dockerfile`):
1. **Builder stage:** Installs all dependencies, copies source, runs full build (`vite build` + `esbuild server.ts`)
2. **Deps stage:** Installs production-only dependencies (`npm ci --omit=dev`)
3. **Production stage:** Node 22 Alpine, copies built `dist/` and production `node_modules/`, exposes port 3000

### Run the Container

```bash
# Using npm script
npm run docker:run

# Or directly
docker run -p 3000:3000 --env-file .env ashram-shala-pathraj

# Detached mode
docker run -d -p 3000:3000 --env-file .env --name ashram-portal ashram-shala-pathraj
```

### Docker Compose (Recommended for Local)

```bash
# Start
docker compose up --build

# Start in background
docker compose up --build -d

# Stop
docker compose down
```

The `docker-compose.yml` provides:
- Automatic rebuild on source changes (with `--build`)
- Environment loaded from `.env` file
- Restart policy: `unless-stopped`
- Health check every 30s against `GET /api/health`

### Health Check

The container includes a built-in health check:
```
wget --no-verbose --tries=1 --spider http://localhost:3000/api/health
```
- Interval: 30 seconds
- Timeout: 10 seconds
- Start period: 5 seconds (grace period before first check)
- Retries: 3 (container marked unhealthy after 3 consecutive failures)

### Verify the Container

```bash
# Check health
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ready","database":"reachable","timestamp":"..."}

# Check liveness
curl http://localhost:3000/api/health/live

# Expected response:
# {"status":"alive","service":"ashram-portal-api","timestamp":"..."}
```

---

## Kubernetes Deployment

> **Current Status:** Kubernetes manifests exist in `k8s/` but are NOT deployed. No cluster is provisioned. These instructions are for future use.

### Prerequisites

- A Kubernetes cluster (GKE, EKS, AKS, or self-managed)
- `kubectl` configured with cluster access
- `nginx-ingress-controller` installed on the cluster
- `cert-manager` installed with a `letsencrypt-prod` ClusterIssuer configured
- Container image pushed to a registry (e.g., `ghcr.io/your-org/ashram-shala-pathraj:latest`)

### Customization Required

Before deploying, update these placeholder values:

| File | Field | Replace With |
|------|-------|------|
| `k8s/deployment.yaml` | `spec.template.spec.containers[0].image` | Your actual image URL (e.g., `ghcr.io/your-org/ashram-shala-pathraj:v1.0.0`) |
| `k8s/ingress.yaml` | `spec.tls[0].hosts[0]` and `spec.rules[0].host` | Your actual domain name |
| `k8s/secret.yaml` | All `data.*` values | Base64-encoded real secrets (use `echo -n "value" \| base64`) |

### Deploy Steps

```bash
# 1. Create the namespace
kubectl apply -f k8s/namespace.yaml

# 2. Create ConfigMap and Secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# 3. Deploy the application
kubectl apply -f k8s/deployment.yaml

# 4. Expose via Service
kubectl apply -f k8s/service.yaml

# 5. Configure Ingress (external access)
kubectl apply -f k8s/ingress.yaml

# 6. Enable auto-scaling
kubectl apply -f k8s/hpa.yaml
```

Or apply all at once:
```bash
kubectl apply -f k8s/
```

### Verify Deployment

```bash
# Check pods are running
kubectl get pods -n ashram-shala

# Check deployment status
kubectl get deployment -n ashram-shala

# Check HPA status
kubectl get hpa -n ashram-shala

# Check ingress
kubectl get ingress -n ashram-shala

# View logs
kubectl logs -n ashram-shala -l app=ashram-shala-pathraj --tail=50

# Port-forward for local testing
kubectl port-forward -n ashram-shala svc/ashram-shala-pathraj 3000:3000
```

### Resource Allocation

Per pod (defined in `k8s/deployment.yaml`):
- **Memory request:** 128Mi
- **Memory limit:** 256Mi
- **CPU request:** 250m (0.25 cores)
- **CPU limit:** 500m (0.5 cores)

### Auto-Scaling (HPA)

Defined in `k8s/hpa.yaml`:
- **Minimum replicas:** 2
- **Maximum replicas:** 5
- **Scale-up trigger:** Average CPU utilization exceeds 70%
- **API version:** `autoscaling/v2`

### Health Probes

Both probes target `GET /api/health` on port 3000:

| Probe | Initial Delay | Period | Timeout | Failure Threshold |
|-------|---------------|--------|---------|-------------------|
| Liveness | 10s | 30s | 5s | 3 (pod restarts) |
| Readiness | 5s | 10s | 5s | 3 (removed from service) |

### Updating Secrets

```bash
# Encode a new value
echo -n "your-real-api-key" | base64

# Edit the secret file, then apply
kubectl apply -f k8s/secret.yaml

# Restart pods to pick up new secrets
kubectl rollout restart deployment/ashram-shala-pathraj -n ashram-shala
```

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (full access) | `eyJ...` |
| `OTP_HMAC_SECRET` | HMAC secret for OTP derivation and session signing (min 32 chars) | Random 64-char hex string |
| `RESEND_API_KEY` | Resend API key for sending OTP emails | `re_xxxx` |
| `RESEND_FROM_EMAIL` | Sender email address for OTP emails | `noreply@yourdomain.com` |
| `GEMINI_API_KEY` | Google Gemini API key for AI chat | `AIza...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server listening port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `SESSION_SECRET` | Session signing secret (falls back to `OTP_HMAC_SECRET`) | (uses `OTP_HMAC_SECRET`) |
| `TRUST_PROXY` | Express trust proxy setting | `1` on Vercel, `false` otherwise |
| `API_RATE_LIMIT_PER_MINUTE` | Global per-IP rate limit | `180` |
| `GEMINI_MODEL` | Gemini model name | `gemini-3.6-flash` |
| `AI_TIMEOUT_MS` | AI provider call timeout in milliseconds | `12000` |
| `TTS_TIMEOUT_MS` | TTS provider call timeout in milliseconds | `15000` |
| `AI_FALLBACK_PROVIDER` | Fallback AI provider (`openai` or `anthropic`) | (none) |
| `OPENAI_API_KEY` | OpenAI API key (if using OpenAI fallback) | |
| `OPENAI_MODEL` | OpenAI model name | `gpt-4.1-mini` |
| `ANTHROPIC_API_KEY` | Anthropic API key (if using Anthropic fallback) | |
| `ANTHROPIC_MODEL` | Anthropic model name | `claude-3-5-haiku-latest` |
| `ELEVENLABS_API_KEY` | ElevenLabs API key for text-to-speech | |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice ID | `pNInz6obpgDQGcFmaJgB` |
| `ADK_SERVICE_URL` | URL of the Python ADK multi-agent service | `http://localhost:8000` |
| `ADK_SERVICE_KEY` | Authentication key for the ADK service | |
| `MAX_AI_CONCURRENCY` | Maximum concurrent AI requests | `8` |
| `MAX_TTS_CONCURRENCY` | Maximum concurrent TTS requests | `4` |
| `MAX_DATA_CONCURRENCY` | Maximum concurrent data operations | `32` |

### WhatsApp Variables (Future - Not Active)

| Variable | Description |
|----------|-------------|
| `WHATSAPP_API_TOKEN` | WhatsApp Business API permanent access token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID from Meta |
| `WHATSAPP_APP_SECRET` | Meta App Secret for webhook verification |
| `WHATSAPP_VERIFY_TOKEN` | Custom token for webhook URL verification |

### Python ADK Service Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key (shared with Express server) | |
| `ADK_PORT` | Port for the FastAPI ADK service | `8000` |
