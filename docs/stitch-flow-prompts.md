# Google Stitch — Full App Flow Prompt Pack
### Ashram School Pathraj · "Aurora Glass" Spatial Glassmorphism · build the whole web screen-by-screen

This pack lets you rebuild the **entire website in Google Stitch** as a connected flow — starting at Login, moving through every screen in navigation order, ending at Logout. Each screen prompt describes **what is on the screen** and **which screen each button/link goes to next**, so you can wire the whole prototype.

---

## HOW TO USE

1. Open **stitch.withgoogle.com** → new project.
2. **Paste the STYLE BLOCK (below) at the top of EVERY screen prompt**, followed by that screen's prompt. This keeps all screens in one visual system.
3. Generate **Desktop** first, then ask Stitch *"generate the mobile version of this screen."*
4. Use the **FLOW MAP** to link buttons to the correct next screen inside Stitch.

---

## 🗺️ ARCHITECTURE / FLOW MAP

```
                         ┌─────────────────────────────┐
                         │        PUBLIC WEBSITE         │
   ENTRY ─▶ [1] HOME ◀──▶ About · Academics · Admission  │
                         │ Hostel · Gallery · Contact    │
                         └───────────────┬───────────────┘
                                         │ "Login" button
                                         ▼
                                   [9] LOGIN ──────────────┐
                                     │  │  │               │
                        "Register" ◀─┘  │  └─▶ "Forgot?" ──▶ [11] FORGOT PASSWORD
                                        │                        │ (identifier ▶ OTP ▶ new pw)
                              [10] REGISTER                      ▼
                              (email/phone OTP ▶ password)    PORTAL
                                        │                        ▲
                                        ▼                        │
                               login success ──────────▶ [12] CHANGE PASSWORD (first login only)
                                                                 │
                                                                 ▼
                                                    [13] PHONE VERIFY (modal, if unverified)
                                                                 │
                                                                 ▼
                                                      [14] SPLASH ▶ [15] DASHBOARD
                                                                 │
   Role-based tabs ─────────────────────────────────────────────┤
     [16] Admissions   [17] Attendance   [18] Hostel  [19] Messages
     [20] Staff&Letters [21] Administration [22] AI Assistant [23] Voice Agent
                                                                 │
                                                        "Logout" ▼
                                                    back to [1] HOME (leave)
```

**Role visibility (which tabs each user sees):**
- **Web Creator / Super Admin** → all tabs
- **Principal** → Admissions, Attendance, Hostel, Messages, Staff & Letters, AI Assistant, Voice Agent
- **Class Teacher** → Admissions, Attendance, Hostel, Messages, AI Assistant
- **Clerk** → Admissions, Staff & Letters, AI Assistant
- **Subject Teacher** → Attendance, AI Assistant
- **Student / Parent** → Admissions, AI Assistant

---

## 🎨 STYLE BLOCK  (prepend to EVERY prompt)

> STYLE = Premium enterprise SaaS, spatial glassmorphism (Apple / Linear / Vercel / Raycast). Light lavender background gradient #F8F7FC→#FFFFFF with large soft blurred gradient orbs (one purple #7C3AED, one orange #F97316, low opacity) and a faint dot grid. Frosted translucent glass panels: surface rgba(255,255,255,0.70), 1px rgba(255,255,255,0.55) border, 20–32px backdrop blur, 24px radius, soft wide diffused shadow, subtle top highlight, slightly floating. Primary = purple #7C3AED (active nav, links, key data, icons, selected). Accent = orange #F97316 (CTAs, attention). Headings #1A1A2E in Space Grotesk 600/700; body #6B7280 and secondary #9CA3AF in Inter 400/500. Buttons 16px radius, 44–48px tall (primary purple gradient, CTA orange gradient, secondary transparent glass). Inputs 12px radius, glass fill, purple focus glow. Lucide-style thin line icons inside purple/orange glass tiles. Compact translucent badges (purple = primary, orange = attention). Bento-grid layouts (mixed card sizes), 24px gaps, 8px spacing scale, generous whitespace. Micro-interactions: hover translateY(-2px) + soft shadow, spring modals, glass skeleton loaders. Bilingual English + Marathi (Devanagari) labels. Fully responsive (375/768/1024/1440px) with real mobile compositions (bottom tab bar, drawers), not scaled-down desktop. Elegant, minimal, high-end, production-ready. Never neon, never plastic-glossy, no extra colors.

---

# ── PUBLIC WEBSITE ──

## [1] HOME
> Apply STYLE. Landing page for **"Govt. Secondary & Higher Secondary Ashram School Pathraj / शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज"**.
> **Floating glass navbar:** purple logo tile + "आश्रमशाळा पाथरज"; center links Home · About · Academics · Admission · Hostel · Gallery · Contact; right = "मराठी/EN" toggle pill + orange **Login** button.
> **Hero glass panel:** purple pill kicker "Tribal Development Department, Maharashtra"; big Devanagari school name (last line purple→orange gradient); tagline "Nurturing Tribal Youth Through Quality Education"; location line with pin "Pathraj, Tal. Karjat, Dist. Raigad"; buttons orange **Apply for Admission** + glass **Contact Us**.
> **Stats bento (4 glass KPI cards):** 460 Students · 26 Staff · 12 Standards · 520 Hostel Beds (purple/orange icon tiles, big numbers).
> **Services bento (4 cards):** Admission, AI Assistant, Parent Portal, WhatsApp Bot (icon tile + title + one line + hover arrow).
> **Glass footer:** school info, Quick Links, Contact (Principal 9423864391, Office 7666971183, hmpathraj22@gmail.com), Address, copyright Tribal Development Department, Govt. of Maharashtra.
> **NAV:** navbar links → [2]-[7]; Login → [9]; "Apply for Admission" → [4]; "Parent Portal" service → [9].

## [2] ABOUT
> Apply STYLE. Same glass navbar. Hero glass panel: purple kicker "About Us", H1 "About Our School".
> Stacked frosted glass sections, each with purple icon tile + Space Grotesk heading + thin purple divider: **School History & Mission**; **Vision & Mission** (two side-by-side glass cards); **The Ashram Shala System** (paragraph + 2×2 bento chips: free education Std 1–12, free residential accommodation, three nutritious meals daily, books/uniforms/supplies provided); **Tribal Development Department**; **Campus Information** (bento of small stat cards: 460 students, 26 staff, Std 1–12, Marathi medium, Raigad, Karjat); **Residential Facility** (520 beds, Boys Wing, Girls Wing); **Principal's Office** card — "Shri. Bansode Ajit Lalasaheb — Acting Principal".
> **NAV:** navbar → [1]-[7]; Login → [9].

## [3] ACADEMICS
> Apply STYLE. Same navbar. Hero glass panel: purple kicker "Education", H1 "Academics".
> **Standards & Medium:** bento row of glass tiles (Standards 1–12, Marathi Medium, State Board) with purple icons + a purple-tinted glass info strip (lightbulb).
> **Subjects by Standard:** glass cards for Primary / Secondary / Higher Secondary, each a bullet list with small purple dots.
> **Faculty:** responsive grid of glass staff cards — avatar circle, name, purple role label, subject.
> **NAV:** navbar → [1]-[7]; Login → [9].

## [4] ADMISSION (public)
> Apply STYLE. Same navbar. Hero glass panel: purple kicker "Enrollment", H1 "Admission", glass status card with green check + orange **OPEN** badge "Admissions Open for 2026–27".
> **Admission Process:** vertical stepper of glass cards, each with a numbered orange gradient circle + step title/description.
> **Required Documents:** glass checklist card (purple check icons).
> **Application Form** (large glass card): labeled glass inputs — Student Name, Parent/Guardian Name, Mobile Number, Email (optional), Standard select dropdown — + orange **Submit Application** button; on submit show a glass success toast.
> **NAV:** navbar → [1]-[7]; Login → [9].

## [5] HOSTEL
> Apply STYLE. Same navbar. Hero glass panel: purple kicker "Residential Facility", H1 about hostel life.
> Glass sections: 520-bed facility overview; bento stat cards (520 Total Beds, Boys Wing, Girls Wing); feature chips (three meals, drinking water, health check-ups, recreation); warden contact cards for **Boys Hostel Warden** and **Girls Hostel Warden** (icon + label + phone).
> **NAV:** navbar → [1]-[7]; Login → [9].

## [6] GALLERY
> Apply STYLE. Same navbar. Hero glass panel: purple kicker + H1 "Gallery". A **bento masonry grid** of photo cards in frosted glass frames (mixed large/wide/small, 24px radius, hover lift + zoom). Clicking a photo opens a frosted-glass **lightbox modal** (blurred dark overlay, spring scale-in, prev/next arrows, close).
> **NAV:** navbar → [1]-[7]; photo → lightbox modal; Login → [9].

## [7] CONTACT
> Apply STYLE. Same navbar. Hero glass panel: purple kicker "Get in Touch", H1 "Contact Us".
> **School Address** glass card (Marathi + English). **Contact Details** bento of glass cards: Principal (9423864391), Office/Clerk (7666971183), Email (hmpathraj22@gmail.com), WhatsApp card with orange **Chat on WhatsApp** button. **Location** section: map inside a rounded glass frame + orange **Navigate to School** button. **Send a Message** glass form (Name, Mobile, Message) + orange submit.
> **NAV:** navbar → [1]-[7]; Login → [9].

---

# ── AUTHENTICATION FLOW ──

## [9] LOGIN
> Apply STYLE. Full-screen auth on the lavender orb background. A single centered frosted glass card (24px radius, blur, floating). Top: circular purple logo tile + "Government of Maharashtra" kicker + school name. Glass inputs with icons: **Username** (user icon) and **Password** (lock icon + show/hide eye), purple focus glow. Orange gradient **Login** button (full width). Below: **Forgot password?** text link and a **Register** link ("New parent? Create an account"). Top-left glass **Back** button, top-right **मराठी/EN** toggle. A small footer line "Your data is protected with encryption". Calm, secure, minimal.
> **NAV:** Login (success) → [12] if first-login else [13]/[15]; Forgot password? → [11]; Register → [10]; Back → [1].

## [10] REGISTER (Parent) — 3 stages in one glass card
> Apply STYLE. Full-screen auth, centered frosted glass card, purple logo tile + "Parent Registration" title. Use a **3-step segmented progress** at the top (Verify → Password → Done).
> **Stage 1 — Verify:** glass inputs — Full Name; Mobile Number with a "+91 🇮🇳" prefix chip and an inline **Send OTP** button (small note "SMS optional"); a 6-digit OTP field + **Verify** button that shows a green "Verified" check; Email with inline **Send OTP** + 6-digit field + **Verify** ("Email verification required"); Relationship to Student dropdown (Father/Mother/Guardian/Other). Orange **Continue to Signup** button (disabled until email verified). Link **Back to login**.
> **Stage 2 — Create Password:** a green "Email verified" confirmation strip; New Password (lock + eye) and Confirm Password inputs (min 8 chars); orange **Create Account** button; **Back** link.
> **Stage 3 — Done:** centered green shield-check, "Your account is ready. Redirecting to portal…" with a glass skeleton/spinner.
> **NAV:** Continue → Stage 2; Create Account → Stage 3 → [15] Dashboard; Back to login → [9].

## [11] FORGOT PASSWORD — 4 stages in one glass card
> Apply STYLE. Full-screen auth, centered frosted glass card, purple logo tile.
> **Stage 1 — Enter identifier:** title "Forgot Password", subtitle "Enter your mobile number or email to receive a reset code"; one glass input (user icon) for mobile/email; orange **Send Reset Code** button; **Back to Login** link.
> **Stage 2 — Enter code:** title "Enter Reset Code", subtitle "We sent a 6-digit code to y•••@mail"; a large centered 6-digit code input (mono, wide letter-spacing, key icon); orange **Verify Code** button; "Try different identifier" link.
> **Stage 3 — Set new password:** New Password + Confirm Password glass inputs (eye toggle); orange **Reset Password** button.
> **Stage 4 — Done:** green shield-check, "Your password has been reset. Redirecting…".
> **NAV:** Send Reset Code → Stage 2; Verify → Stage 3; Reset Password → Stage 4 → [15]; Back to Login → [9].

## [12] CHANGE PASSWORD (forced first login)
> Apply STYLE. Full-screen auth, centered frosted glass card, purple logo tile + title "Set a New Password" and subtitle "For your security, please change your temporary password". Glass inputs: Current Password, New Password, Confirm Password (min 8, eye toggle, purple focus). Orange **Update Password** button. Optional small "Skip for now" text link. Success → glass toast + continue.
> **NAV:** Update Password → [13] or [15]; Skip → [15].

## [13] PHONE VERIFICATION (modal over dashboard)
> Apply STYLE. A centered frosted-glass **modal** (24px radius, spring scale-in) over a blurred dark overlay, with the dashboard dimmed behind. Title "Verify your mobile number", a "+91" prefixed phone input + orange **Send OTP**, then a 6-digit OTP field + purple **Verify** button; secondary glass **Skip / Do it later** button; close (X) top-right.
> **NAV:** Verify / Skip → closes modal → [15] Dashboard.

---

# ── LOGGED-IN PORTAL ──

## [14] SPLASH
> Apply STYLE. Full-screen lavender orb background, centered: large purple glass logo tile with a school icon (soft pulse), school name in Devanagari, kicker "PATHRAJ ASHRAM · EDUCATION PORTAL", and "Preparing your workspace…" with a slim glass progress shimmer. Auto-advances.
> **NAV:** auto → [15] Dashboard.

## [15] DASHBOARD SHELL (frame for all tabs)
> Apply STYLE. Logged-in app shell on the lavender orb background.
> **Floating glass sidebar (left, ~288px):** top = purple logo tile + "Pathraj Ashram / EDUCATION PORTAL"; nav items with Lucide icons — Admissions, Attendance, Hostel, Messages, Staff & Letters, Administration, AI Assistant, Voice Agent. **Active item = purple gradient tinted glass, purple icon+text, soft purple glow;** inactive = muted gray with subtle hover. Bottom = small glass info card "Tribal Welfare Department · Serving Pathraj, Karjat–Raigad".
> **Top bar (glass):** thin government kicker strip, school title, an **"Active"** green status pill, a user chip (avatar + name + role like "Principal / मुख्याध्यापक"), **मराठी/EN** toggle, and a **Logout** button.
> **Content = bento area** (changes per tab, below). **Mobile:** collapse sidebar into a drawer + a bottom glass tab bar of the same items; a top "Menu" button.
> **NAV:** sidebar items → [16]-[23]; Logout → [1] HOME.

## [16] TAB · ADMISSIONS
> Apply STYLE inside [15] shell. Page header: kicker "ADMISSIONS", title "Admission Records". A **New Admission Application** glass form card (Student Name, Parent/Guardian Name, Mobile, Village, Standard dropdown, etc.) with an orange **Submit** button. Below, a large glass **data-table card**: search field + filters, columns Sr No · Name · Standard · Guardian · Village · Status, muted uppercase headers, generous rows, purple important values, translucent **status badges** (Submitted=purple, Verified=orange, Approved/Enrolled=green, Rejected=red), compact purple/orange row action buttons, hover row highlight. Include a glass empty state and skeleton loading rows.
> **NAV:** row → detail modal; sidebar → other tabs; Logout → [1].

## [17] TAB · ATTENDANCE (Class Teacher)
> Apply STYLE inside [15]. Header kicker "ATTENDANCE", title "Mark Attendance". A glass control row: **Standard** select, **Date** picker (calendar icon), and a "Device Mode" toggle. A glass counter pill "marked X / total". A responsive grid/list of **student attendance glass cards** each with name, roll no, and Present / Absent toggle (Present=purple, Absent=orange/red). A wide glass summary card with a small donut/progress chart of present vs absent. Orange **Save Attendance** button → glass success toast.
> **NAV:** sidebar → other tabs; Logout → [1].

## [18] TAB · HOSTEL
> Apply STYLE inside [15]. Header kicker "HOSTEL", title "Hostel Management". KPI bento (Total Beds 520, Occupied, Vacant, Wardens). A glass **room/bed allocation** grid (Boys Wing / Girls Wing tabs) showing bed tiles (occupied=purple, vacant=glass). A glass table of resident students (Name · Standard · Room · Warden) with action buttons. Allocate-bed action opens a frosted glass modal.
> **NAV:** sidebar → other tabs; Logout → [1].

## [19] TAB · MESSAGES (WhatsApp Hub)
> Apply STYLE inside [15]. Header kicker "MESSAGES", title "WhatsApp Hub". Two-pane glass layout: left = list of message templates / broadcast campaigns (glass rows, purple active); right = a compose glass card (recipient group dropdown, message textarea, variable chips) + orange **Send** button and a preview bubble styled like a chat message. A wide glass stats card (sent / delivered / read) with a soft bar chart.
> **NAV:** sidebar → other tabs; Logout → [1].

## [20] TAB · STAFF & LETTERS (Clerk)
> Apply STYLE inside [15]. Header kicker "STAFF & LETTERS", title "Staff & Letters". Segmented control (glass pill): **Staff Directory** | **Letter Generator**.
> *Staff Directory:* responsive grid of glass staff cards (avatar, name, designation, department, mobile) + a glass table view (Name · Designation · Department) with search.
> *Letter Generator:* a glass form (letter type dropdown, recipient, subject, body) on the left and a live A4 letter **preview inside a glass sheet** on the right + orange **Generate PDF** button.
> **NAV:** segmented → sub-views; sidebar → other tabs; Logout → [1].

## [21] TAB · ADMINISTRATION (Super Admin)
> Apply STYLE inside [15]. Header kicker "ADMINISTRATION", title "Control Center". KPI bento (Users, Applications, Gallery Images, Activity Today). Sections: **User Management** glass table (role badges, enable/disable, reset) ; **Gallery Manager** glass grid with an upload dropzone card ; **Activity Monitor** large glass table (Date · Student · Parent · Mobile · Standard · Status) with filters; a wide glass analytics card (line/area chart in purple/orange). Compact purple/orange action buttons throughout.
> **NAV:** sidebar → other tabs; Logout → [1].

## [22] TAB · AI ASSISTANT
> Apply STYLE inside [15]. Header kicker "AI ASSISTANT", title "Ashram AI". A glass **chat interface**: message thread with user bubbles (purple gradient, right) and assistant bubbles (glass, left) with a typing-dots indicator; suggested-prompt chips; a floating glass composer bar at the bottom (text input, mic button, orange **Send**). Optional right glass panel with quick actions / sources.
> **NAV:** sidebar → other tabs; Logout → [1].

## [23] TAB · VOICE AGENT (Calling Agent)
> Apply STYLE inside [15]. Header kicker "VOICE AGENT", title "Calling Agent". A centered glass **call console** card: a large circular purple glass avatar with soft animated audio-wave rings, status text ("Ready" / "Calling…" / "Connected"), a recipient/number field, and round call controls (orange **Call**, glass Mute, red End). A glass **call log** table (Time · Number · Duration · Status badge) and a wide glass card with a live transcript panel.
> **NAV:** sidebar → other tabs; Logout → [1].

---

## [LOGOUT] LEAVE THE SITE
> Logout button (top bar) clears the session and returns to **[1] HOME**. Optionally show a small glass toast "You have been signed out" on the home page.

---

## GLOBAL / SUPPORTING STATES (generate as needed, always Apply STYLE)
- **Loading:** glass skeleton cards + soft shimmer (no spinners everywhere).
- **Empty state:** minimal line icon in a glass tile + short explanation + one primary action.
- **Error state:** calm, restrained orange emphasis, short message + Retry.
- **Toasts:** floating glass toast top-right (icon + message + optional action), slide+fade.
- **Dropdowns/Selects & Modals:** frosted glass surface, purple selected option, blurred dark overlay behind modals, spring scale-in.

---

### Refinement tips for Stitch
- If glass looks flat: *"increase backdrop blur, make panels more translucent, add soft blurred purple and orange background orbs."*
- For hierarchy: *"use a bento grid with mixed card sizes, not a uniform grid."*
- For bilingual text: *"show key labels in both English and Marathi (Devanagari)."*
- For consistency: paste the same STYLE BLOCK on every screen.
