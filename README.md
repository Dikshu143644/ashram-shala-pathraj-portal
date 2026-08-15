# शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज

## Govt. Secondary & Higher Secondary Ashram School Pathraj

**ता. कर्जत, जि. रायगड, पिनकोड 410201**

A full-stack web portal for Ashram School Pathraj, built with React 18, TypeScript, and Express. The portal serves ~459 students across Standards 1-12 under the Tribal Development Department, Maharashtra.

**Principal:** श्री. अजित लालासाहेब बनसोडे

---

## Features

- Bilingual interface (English / Marathi)
- Student management and attendance tracking
- AI-powered chatbot assistant (Google Gemini)
- Text-to-Speech support (ElevenLabs)
- Voice input for accessibility
- Admission portal
- Staff and faculty directory
- Dashboard with analytics
- Responsive design with Tailwind CSS
- Docker and Kubernetes deployment support

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Dikshu143644/ashram-shala-pathraj-portal.git
cd ashram-shala-pathraj-portal

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env and fill in your API keys (see Environment Variables section below)

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your real API keys:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | Environment (`development` or `production`) |
| `GEMINI_API_KEY` | Google Gemini AI API key |
| `ELEVENLABS_API_KEY` | ElevenLabs text-to-speech API key |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice ID for TTS |
| `SUPABASE_URL` | Supabase project URL (future) |
| `SUPABASE_ANON_KEY` | Supabase anonymous key (future) |
| `WHATSAPP_API_TOKEN` | WhatsApp Business API token (future) |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID (future) |
| `GHCR_TOKEN` | GitHub Container Registry token |

---

## Production Build

```bash
# Build the application (frontend + server)
npm run build

# Start the production server
npm start
```

This produces:
- `dist/` - Frontend static assets (via Vite)
- `dist/server.js` - Bundled Express server (via esbuild)

---

## Docker Deployment

### Build and run with Docker

```bash
# Build the Docker image
docker build -t ashram-shala-pathraj .

# Run the container
docker run -p 3000:3000 --env-file .env ashram-shala-pathraj
```

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Kubernetes Deployment

The `k8s/` directory contains all necessary manifests:

```bash
# Create the namespace
kubectl apply -f k8s/namespace.yaml

# Apply configuration and secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy the application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

Manifests included:
- `namespace.yaml` - Dedicated namespace (`ashram-shala`)
- `deployment.yaml` - 2 replicas with resource limits and health probes
- `service.yaml` - ClusterIP service on port 3000
- `ingress.yaml` - Ingress with TLS support
- `configmap.yaml` - Non-sensitive configuration
- `secret.yaml` - Template for sensitive credentials
- `hpa.yaml` - Horizontal Pod Autoscaler (2-5 replicas, 70% CPU target)

---

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment.

### CI (`ci.yml`)

Triggered on every push to `main` and on pull requests:

1. Installs dependencies (`npm ci`)
2. Runs TypeScript type checking (`npm run lint`)
3. Builds the application (`npm run build`)
4. Builds the Docker image (validation only, no push)

### Deploy (`deploy.yml`)

Triggered on push to `main` only:

1. Builds the Docker image
2. Pushes to GitHub Container Registry (`ghcr.io`)
3. Triggers Render deploy webhook (if configured)

---

## API Keys Security

Follow these practices to keep your API keys secure:

1. **Copy `.env.example` to `.env`** and fill in your real API keys there.
2. **Fill in your real API keys in `.env`** - this file is for local development only.
3. **`.env` is in `.gitignore` and never committed** - your secrets stay on your machine.
4. **For production deployments**, use Kubernetes secrets (`k8s/secret.yaml`) or Render environment variables in the dashboard.
5. **For GitHub Actions**, set secrets in your repo under Settings > Secrets and variables > Actions. Required secrets:
   - `RENDER_DEPLOY_HOOK_URL` - Render deploy hook (optional)
   - `GITHUB_TOKEN` - Automatically provided by GitHub Actions for GHCR access

Never commit real API keys to the repository. If you accidentally commit a secret, rotate it immediately.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS 4 |
| Backend | Express.js, Node.js 22 |
| AI | Google Gemini API |
| Voice | ElevenLabs TTS, Web Speech API |
| Build | Vite, esbuild |
| Styling | Tailwind CSS, Motion (animations) |
| Icons | Lucide React |
| Container | Docker (multi-stage, node:22-alpine) |
| Orchestration | Kubernetes |
| CI/CD | GitHub Actions |
| Hosting | Render |

---

## Live Demo

The portal is deployed at: [https://ashram-shala-pathraj.onrender.com](https://ashram-shala-pathraj.onrender.com)

---

## School Information

| | |
|---|---|
| **School** | शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज |
| **English** | Govt. Secondary & Higher Secondary Ashram School Pathraj |
| **Location** | ता. कर्जत, जि. रायगड, पिनकोड 410201 |
| **Department** | Tribal Development Department, Maharashtra |
| **Students** | ~459 (Standards 1-12) |
| **Principal** | श्री. अजित लालासाहेब बनसोडे |

---

## License

This project is developed for Ashram School Pathraj under the Tribal Development Department, Government of Maharashtra.
