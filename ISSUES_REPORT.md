# Ashram Shala Pathraj Portal - Issues Report and Improvement Audit

## How this was analyzed

This is an end-to-end audit of the Ashram Shala Pathraj web portal. The application is a
bilingual (English / Marathi) single-page app built with React 18 + Vite 6 + TypeScript in
`src/`, backed by an Express 4 API in `server/`, with Supabase for data and auth support.

The baseline gates both pass on the current codebase:

- `npm run lint` (`tsc --noEmit`) exits 0.
- `npm run build` (Vite + esbuild server bundle) succeeds.

Because the project compiles and type-checks cleanly, the issues below are **not** compile
errors. They are logic, security, accessibility, UX, performance, configuration, and
dependency problems found by reading the source and cross-checking each claim against real
file and line references. Every issue lists the file it lives in and a Status note stating
whether it is auto-fixed in a later feature (FEAT-002 / FEAT-003) or left as a recommendation.

This report is documentation only. No source code is changed by this feature.

## Severity legend

- **Critical** - breaks core functionality for all users or exposes a severe security hole; fix immediately.
- **High** - major security weakness or a failure that breaks an important flow under common conditions.
- **Medium** - noticeable defect, inconsistent behavior, or a hardening gap that should be fixed soon.
- **Low** - minor UX, performance, or polish issue with limited blast radius.

## Error-type legend

- **Security** - authentication, secrets, headers, injection, or hardening weaknesses.
- **Runtime** - errors that surface only when the code executes (bad model id, unhandled render crash).
- **Type/Logic** - inconsistent or incorrect logic that the type checker does not catch.
- **Accessibility** - barriers for screen-reader and assistive-technology users.
- **UX** - user-experience friction or confusing behavior.
- **Performance** - bundle size, load time, and network efficiency.
- **Config/Build** - build, bundling, and configuration gaps.
- **Dependency** - vulnerable or outdated third-party packages.

---

## Critical

No Critical-severity issues were found. The application builds, type-checks, and has no
issue that unconditionally breaks the app for every user on startup. The most impactful
problems are rated High below.

---

## High

### H-1. Invalid default Gemini model id breaks AI chat when `GEMINI_MODEL` is unset
- **Type:** Runtime / Config
- **Location:** `server/agents.ts:99`
- **Detail:** The default model falls back to `'gemini-3.6-flash'`, which is not a valid
  Google Gemini model id. Every other place in the code uses `'gemini-2.0-flash'`. When the
  optional `GEMINI_MODEL` environment variable is not set, the main AI chat calls the
  generative API with a non-existent model and fails. The feature only works by accident when
  an operator happens to set `GEMINI_MODEL` to a real value.
- **Impact:** The AI assistant returns errors in the default configuration.
- **Status:** Auto-fixed in FEAT-002/FEAT-003 (default corrected to `gemini-2.0-flash`).

### H-2. Security-sensitive codes generated with `Math.random()`
- **Type:** Security
- **Location:** `server/auth.ts:756`, `server/auth.ts:1049`, `server/auth.ts:1557`, `server/sms-otp.ts:13`
- **Detail:** OTP codes and the AI PIN are generated with
  `Math.floor(100000 + Math.random() * 900000)`. `Math.random()` is not a
  cryptographically secure random number generator; its output is predictable and unsuitable
  for security tokens such as one-time passwords and PINs. The codebase already imports
  `node:crypto` (`randomUUID` / `randomBytes`) in `auth.ts` and `security.ts`, so a secure
  primitive is readily available.
- **Impact:** An attacker who can observe or model the PRNG state could predict OTP codes and
  the AI PIN, weakening account verification and access control.
- **Status:** Auto-fixed in FEAT-002/FEAT-003 (switch to `node:crypto` secure randomness).

### H-3. Missing key HTTP security headers (CSP, HSTS, X-Frame-Options)
- **Type:** Security
- **Location:** `server/security.ts` (`configureSecurity`, header block around lines 220-224)
- **Detail:** The security middleware sets `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, and `Cross-Origin-Resource-Policy`, but it does
  **not** set:
  - `Content-Security-Policy` (defense-in-depth against XSS and control over allowed origins),
  - `Strict-Transport-Security` (HSTS, to force HTTPS),
  - `X-Frame-Options` / CSP `frame-ancestors` (clickjacking protection).
- **Impact:** The app is exposed to clickjacking and has weaker XSS defense-in-depth than it
  should, and does not instruct browsers to pin HTTPS.
- **Status:** Auto-fixed in FEAT-002/FEAT-003 (add CSP, HSTS, and frame protection headers).

---

## Medium

### M-1. No React error boundary anywhere in the SPA
- **Type:** Runtime / UX
- **Location:** `src/App.tsx`, `src/main.tsx` (no `ErrorBoundary` / `componentDidCatch` present in `src`)
- **Detail:** A repository-wide search for `ErrorBoundary` and `componentDidCatch` returns no
  matches. Any uncaught error thrown during rendering unmounts the entire React tree and shows
  a blank page instead of a graceful fallback.
- **Impact:** A single component error blanks the whole portal with no recovery path.
- **Status:** Auto-fixed in FEAT-002/FEAT-003 (global bilingual ErrorBoundary added).

### M-2. OTP verify response omits `phoneVerified`, causing inconsistent client state
- **Type:** Type/Logic
- **Location:** `server/auth.ts:331` (OTP `/api/otp/verify` success payload) vs `server/auth.ts:457` (`/api/auth/login` payload)
- **Detail:** The login response includes `phoneVerified: user.phone_verified ?? false`, but
  the OTP verify success response does not include the `phoneVerified` field, even though the
  handler tracks a `phoneVerified` value locally. The client therefore receives an
  inconsistent shape depending on which login path was used.
- **Impact:** Client state after an OTP login can diverge from state after a password login,
  leading to incorrect UI gating around phone verification.
- **Status:** Auto-fixed in FEAT-002/FEAT-003 (include `phoneVerified` in the OTP verify response).

### M-3. npm audit reports 7 vulnerabilities
- **Type:** Dependency
- **Location:** `package.json` / `package-lock.json` (transitive and direct dependencies)
- **Detail:** `npm audit` reports 7 vulnerabilities: 1 high (nodemailer) and several moderate
  (qs / body-parser / express, uuid / gaxios, and the esbuild dev-server advisory). The
  nodemailer, qs, and uuid class of fixes are safe to apply via `npm audit fix`. The esbuild
  advisory fix requires a breaking major version bump, so it is not applied automatically.
- **Impact:** Known vulnerabilities in dependencies increase attack surface.
- **Status:** Safe fixes (nodemailer / qs / uuid) Auto-fixed in FEAT-002/FEAT-003 via
  `npm audit fix`. The esbuild major bump is Recommended (not auto-applied) because it is a
  breaking change.

### M-4. Form inputs not consistently associated with labels
- **Type:** Accessibility
- **Location:** `src/**` (68 `<label>` elements but only 15 `htmlFor` attributes across `src`)
- **Detail:** There are 68 `<label>` elements in the source but only 15 `htmlFor` attributes,
  meaning most labels are not programmatically associated with their inputs, and some inputs
  lack `aria-label` fallbacks.
- **Impact:** Screen-reader users may not hear which label belongs to which field, and
  clicking a label may not focus its control.
- **Status:** Recommendation, with targeted `aria-label` / association fixes applied where
  practical in FEAT-002/FEAT-003; a full sweep plus a11y linting is Recommended (not auto-applied).

### M-5. `index.html` hard-codes `lang="en"` on a bilingual app
- **Type:** Accessibility
- **Location:** `index.html:2`
- **Detail:** The document declares `<html lang="en">` even though the app renders Marathi
  content. The declared language does not switch with the active UI language.
- **Impact:** Screen readers may mispronounce Marathi (Devanagari) content because the
  document language is fixed to English.
- **Status:** Auto-fixed in FEAT-002/FEAT-003 (language handling improved for the bilingual UI).

---

## Low

### L-1. Single large JS chunk with no code-splitting
- **Type:** Performance
- **Location:** `vite.config.ts` (no `build.chunkSizeWarningLimit`, no `manualChunks`)
- **Detail:** The Vite build emits a single JS chunk larger than 500 kB (about 671 kB raw /
  175 kB gzip) and warns about it. There is no `manualChunks` configuration and no route-level
  code-splitting.
- **Impact:** Slower first load, especially painful for low-connectivity rural users.
- **Status:** Recommended (not auto-applied) - code-splitting / lazy routes are a larger change.

### L-2. Three external font CDNs with no local fallback or CSP allowlist
- **Type:** Performance / Security
- **Location:** `index.html:7-18` (Google Fonts x2 plus jsdelivr)
- **Detail:** The page loads fonts from `fonts.googleapis.com`, `fonts.gstatic.com`, and
  `cdn.jsdelivr.net` with no self-hosted fallback. Combined with the missing CSP (H-3), there
  is no allowlist constraining these third-party origins.
- **Impact:** Render can block or fonts can fail on flaky networks, and third-party origins are
  unconstrained.
- **Status:** Self-hosting fonts is Recommended (not auto-applied). Once CSP is added (H-3),
  these origins can be allowlisted explicitly.

### L-3. AI Assistant input has no client-side `maxLength`
- **Type:** UX
- **Location:** `src/components/AiAssistant.tsx` (no `maxLength`); server cap `MAX_CHAT_MESSAGE_LENGTH = 1000` in `server/agents.ts:10`
- **Detail:** The server rejects chat messages longer than 1000 characters, but the client
  input has no `maxLength`, so a user can type well past the limit and only find out after the
  request is silently rejected.
- **Impact:** Confusing UX; effort is lost with no inline feedback.
- **Status:** Auto-fixed in FEAT-002/FEAT-003 (add client-side `maxLength` matching the server cap).

---

## Improvement Ideas

These are enhancements rather than bugs. They make the website better and more maintainable
over time.

- **Introduce an automated test suite.** The project currently has zero tests. Add Vitest +
  React Testing Library for components and API integration tests for the Express routes so
  regressions are caught before release. *Recommended (not auto-applied).*
- **Add a dedicated security-headers middleware.** Centralize CSP, HSTS, and frame protection
  (see H-3) in one place so headers stay consistent across routes.
- **Code-split the bundle and lazy-load portal routes.** Use `React.lazy` + `Suspense` to
  split heavy routes, reducing the initial payload (see L-1). *Recommended (not auto-applied).*
- **Add a global ErrorBoundary with a friendly bilingual fallback.** Show a helpful
  English / Marathi message and a reload action instead of a blank page (see M-1).
- **Audit loading, empty, and error states.** Ensure every async view has clear loading,
  empty, and error UI so users are never left staring at a blank region.
- **Add pre-commit linting via husky.** Run `tsc --noEmit` (and a11y lint) on commit to keep
  the tree green.
- **Wire Dependabot / `npm audit` into CI.** Surface vulnerable dependencies automatically
  (see M-3) so they do not accumulate.
- **Add alt-text and label auditing to CI** via `eslint-plugin-jsx-a11y`, catching missing
  labels and image alt text before merge (see M-4).
- **Consider self-hosting fonts.** Bundle the fonts locally to remove third-party origins and
  render-blocking network calls (see L-2). *Recommended (not auto-applied).*
- **Add an offline / PWA manifest.** Since the portal targets low-connectivity rural users, a
  service worker and installable manifest would improve resilience and repeat-visit speed.

---

## Status summary

| Issue | Severity | Type | Status |
| --- | --- | --- | --- |
| H-1 Invalid Gemini model default | High | Runtime/Config | Auto-fixed in FEAT-002/FEAT-003 |
| H-2 `Math.random()` for OTP/PIN | High | Security | Auto-fixed in FEAT-002/FEAT-003 |
| H-3 Missing CSP/HSTS/X-Frame | High | Security | Auto-fixed in FEAT-002/FEAT-003 |
| M-1 No ErrorBoundary | Medium | Runtime/UX | Auto-fixed in FEAT-002/FEAT-003 |
| M-2 OTP verify omits `phoneVerified` | Medium | Type/Logic | Auto-fixed in FEAT-002/FEAT-003 |
| M-3 npm audit (7 vulns) | Medium | Dependency | Safe fixes auto-fixed; esbuild bump recommended |
| M-4 Label/input association | Medium | Accessibility | Partial auto-fix; full sweep recommended |
| M-5 `lang="en"` on bilingual app | Medium | Accessibility | Auto-fixed in FEAT-002/FEAT-003 |
| L-1 Single large JS chunk | Low | Performance | Recommended (not auto-applied) |
| L-2 External font CDNs | Low | Performance/Security | Recommended (not auto-applied) |
| L-3 AI input has no `maxLength` | Low | UX | Auto-fixed in FEAT-002/FEAT-003 |
