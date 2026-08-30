# 🎨 GOOGLE STITCH — MASTER PROMPT (Generate the Entire Website)
### Ashram School Pathraj · "Aurora Glass" Spatial Glassmorphism · Full multi-screen app

> **HOW TO USE:** Open **stitch.withgoogle.com** → new project → set device to **Desktop** → paste the **MASTER PROMPT** below (Sections 0–3). Stitch will generate the connected screens. Then for any single screen, paste **Section A (Design System)** + that screen's block from **Section 2**, and ask *"now generate the mobile version."* Keep Section A on top of every prompt so all screens stay in one visual system.

---

# ══════════════════════════════════════════
# MASTER PROMPT (paste this whole thing)
# ══════════════════════════════════════════

## SECTION 0 — WHAT TO BUILD

Design and generate a **complete, multi-screen bilingual (English + Marathi/Devanagari) website + logged-in portal** for a government tribal residential school:

- **Name (Marathi):** शासकीय माध्यमिक व उच्च माध्यमिक आश्रमशाळा पाथरज
- **Name (English):** Govt. Secondary & Higher Secondary Ashram School Pathraj
- **Location:** Pathraj, Tal. Karjat, Dist. Raigad, Maharashtra 410201
- **Authority:** Tribal Development Department, Government of Maharashtra
- **Scale:** ~460 students, 26 staff, Standards 1–12, 520 hostel beds
- **Acting Principal:** Shri. Bansode Ajit Lalasaheb
- **Contacts:** Principal 9423864391 · Office 7666971183 · Email hmpathraj22@gmail.com

Generate **23 connected screens**: a public marketing site (7 pages), an authentication flow (5 screens), and a role-based dashboard portal (9 screens/tabs). Apply the SAME design system (Section A) to every screen. Change only the content per screen — never the visual identity.

---

## SECTION A — DESIGN SYSTEM (apply to EVERY screen, identically)

**Overall direction:** Premium, modern, minimal, futuristic, enterprise-grade **SaaS** interface inspired by **Apple, Linear, Vercel, Raycast**. It must feel expensive, polished, intentional. No generic Bootstrap layouts, no conventional corporate dashboards, no excessive decoration. Every element has a purpose.

**Core visual language — Spatial Glassmorphism:** frosted translucent glass panels, layered translucent surfaces, backdrop blur, soft reflections, subtle borders, soft ambient shadows, depth through overlapping layers, floating interface elements, bento-grid compositions. The UI should feel like floating glass panels inside a spacious digital environment. Glass = transparent, soft, premium, lightweight, layered — never plain gray boxes.

**Color system:**
- Background: primary #F8F7FC, with a subtle gradient **#F8F7FC → #FFFFFF**.
- Primary brand: **Purple #7C3AED** — use for primary actions, active navigation, important data, links, selected states, charts, brand accents.
- Secondary accent: **Orange #F97316** — use for CTAs, important actions, attention states, small highlights.
- Heading text **#1A1A2E**; body text **#6B7280**; secondary text **#9CA3AF**.
- Glass surface **rgba(255,255,255,0.70)**; glass border **rgba(255,255,255,0.55)**.
- Restrained palette — never neon, no unnecessary colors.

**Background environment:** soft atmospheric background with large blurred gradient orbs — one **purple #7C3AED**, one **orange #F97316** — heavy blur, low opacity, soft gradients, slow atmospheric positioning. Optionally a very subtle geometric dot grid, faint radial lighting, soft light reflections. All background elements stay subtle and never distract.

**Typography:** Headings in **Space Grotesk** (600/700), bold and geometric. Body in **Inter** (400/500). Scale — Display 48–64px, H1 40–48px, H2 30–36px, H3 24–28px, Body 14–18px, Small 12–14px. Strong contrast between headings and supporting text; no excessive font sizes.

**Glass card:** background rgba(255,255,255,0.70); backdrop blur 20–32px; border 1px solid rgba(255,255,255,0.55); **border-radius 24px**; soft, wide, diffused shadow; subtle internal top highlight; layered transparency when overlapping; appears to float slightly above the background.

**Bento grid** is the primary layout pattern — mix Small / Medium / Large / Wide / Tall cards for hierarchy (e.g., one large feature card + two small + one wide analytics + small utility cards). Default gap **24px**; desktop content margins **32–40px**.

**Navigation (public):** floating/sticky **glass navbar** — glass background, backdrop blur, subtle border, rounded corners, soft shadow. Logo left, links center, utility actions right (language toggle, login). Active link = purple accent + subtle glass highlight + soft purple glow. No heavy solid bars.

**Sidebar (dashboard):** floating **glass sidebar** — logo, nav groups, icons, labels, user profile. Active item = purple icon + purple text + soft tinted purple glass background + glow; inactive = muted gray with subtle hover. Feels integrated into the glass environment, not a traditional admin panel.

**Buttons:** radius **16px**, height 40–48px. Primary = purple or orange gradient with subtle glass highlight; hover = slight elevation + soft shadow + small brightness increase; pressed = small scale reduction. Secondary = transparent glass with subtle border. Tertiary = text only. Avoid pill shapes except for badges/compact controls.

**Inputs:** glass / semi-transparent white surface, 1px subtle border, radius **12px**, height 44–48px, clear labels, purple focus border/glow, relevant leading icons. Not overly decorative.

**Iconography:** one consistent family — **Lucide-style** minimal geometric line icons, thin-to-medium stroke. Icon containers use purple glass / orange glass / soft translucent surfaces. Never mix icon styles.

**Data tables:** inside large rounded glass containers — clear column hierarchy, generous row spacing, subtle separators, hover glass row highlight, compact action buttons. Headers muted gray; important values purple; actions orange/purple. Not dense spreadsheet styling.

**KPI / stat cards:** premium glass — small icon, label, large number (in heading color), trend, optional mini chart. Highlight numbers selectively in purple or orange.

**Charts:** integrated into the glass environment — purple, orange, neutral gray only; minimal grid lines, soft labels, clean typography, rounded treatment, subtle glow. Line / area / bar / donut / progress. Not overly colorful.

**Modals:** frosted glass, 24px radius, backdrop blur, soft shadow, subtle border; behind it a darkened translucent blurred overlay; fade + scale spring animation; hierarchy = title, description, content/form, actions.

**Dropdowns/selects:** match the glass system — frosted surface, blur, rounded, soft border, shadow; selected = purple accent; hover = soft purple translucent background.

**Badges:** compact glass — purple translucent = primary, orange translucent = attention. Avoid excessive multicolor status systems.

**Micro-interactions:** hover translateY(-2px) + small shadow increase; button press animation; card elevation; smooth nav transitions; modal spring; chart soft entrance; page fade/slide. Motion feels smooth, cinematic, expensive, controlled — never bouncy, chaotic, excessive, or distracting.

**Glass reflections:** subtle directional reflection highlights that shift slightly with interaction. Not glossy plastic.

**Depth & layering:** foreground UI, midground cards, background orbs, soft shadows, blur, transparency, gentle parallax. Strong visual hierarchy.

**Spacing:** 8px system (8/16/24/32/40/48/64). Card padding 24px. Hero sections 64–96px vertical. Generous whitespace.

**Corners:** cards 24px, buttons 16px, inputs 12px, small tags 10–12px. Rounded geometric forms consistently.

**Responsive:** design for 375 / 768 / 1024 / 1440px+. Desktop = bento grids, floating panels, sidebar, multi-column. Tablet = reduced density, flexible cards. Mobile = single-column, collapsed nav (drawer + bottom navigation), full-width buttons, responsive tables, stacked cards. **Create proper mobile compositions — do NOT just scale down desktop.**

**States:** Loading = glass skeletons + soft shimmer (avoid spinners everywhere). Empty = minimal icon + short explanation + primary action. Error = clear, calm, minimal, restrained orange emphasis + retry. Toasts = floating glass, top-right, icon + message + optional action, slide+fade.

**UX principles:** clarity, consistency, hierarchy, speed, readability, accessibility, discoverability. Every screen answers: Where am I? What can I do? What is important? What next? Never sacrifice usability for effects.

**Consistency rule:** every screen shares the same typography, colors, card/border treatment, radii, shadows, icon family, button language, spacing, animation language, and background environment.

**Final feel:** a premium spatial SaaS operating environment — elegant, intelligent, minimal, high-end, production-ready, consistent, responsive, professional. Keywords: Spatial Glassmorphism · Premium SaaS · Frosted Glass · Bento Grid · Soft Lavender · Purple #7C3AED · Orange #F97316 · Space Grotesk · Inter · Backdrop Blur · Ambient Lighting · Glass Reflections · Floating UI · Layered Depth · Minimal Enterprise · Apple/Linear/Vercel.

---

## SECTION 1 — FLOW MAP (wire the buttons like this)

```
                         PUBLIC WEBSITE
   ENTRY ─▶ [1] HOME ◀──▶ [2]About [3]Academics [4]Admission
                         [5]Hostel [6]Gallery [7]Contact
                                │ "Login"
                                ▼
                          [9] LOGIN ──┬─▶ "Register"        ─▶ [10] REGISTER (email/phone OTP ▶ password)
                                      ├─▶ "Forgot password?" ─▶ [11] FORGOT PASSWORD (id ▶ code ▶ new pw)
                                      └─▶ login success
                                              ▼
                                 [12] CHANGE PASSWORD (first login only)
                                              ▼
                                 [13] PHONE VERIFY (modal, if unverified)
                                              ▼
                                 [14] SPLASH ▶ [15] DASHBOARD SHELL
                                              │
   Role tabs: [16]Admissions [17]Attendance [18]Hostel [19]Messages
              [20]Staff&Letters [21]Administration [22]AI Assistant [23]Voice Agent
                                              │ "Logout"
                                              ▼
                                        back to [1] HOME
```

**Role-based tab visibility:**
- **Web Creator / Super Admin** → all 8 tabs
- **Principal** → Admissions, Attendance, Hostel, Messages, Staff & Letters, AI Assistant, Voice Agent
- **Class Teacher** → Admissions, Attendance, Hostel, Messages, AI Assistant
- **Clerk** → Admissions, Staff & Letters, AI Assistant
- **Subject Teacher** → Attendance, AI Assistant
- **Student / Parent** → Admissions, AI Assistant

---

## SECTION 2 — SCREEN-BY-SCREEN SPECS

> Every screen uses SECTION A. Below is each screen's content + navigation targets.

### [1] HOME
Floating glass navbar: purple logo tile + "आश्रमशाळा पाथरज"; center links Home · About · Academics · Admission · Hostel · Gallery · Contact; right = "मराठी/EN" toggle pill + orange **Login** button. Hero glass panel (32px radius, floating on orbs): purple pill kicker "Tribal Development Department, Maharashtra"; large Devanagari school name (final line in purple→orange gradient); tagline "Nurturing Tribal Youth Through Quality Education"; location line with pin icon; buttons orange **Apply for Admission** + glass **Contact Us**. Stats bento (4 glass KPI cards): **460 Students · 26 Staff · 12 Standards · 520 Hostel Beds** with purple/orange icon tiles. Services bento (4 cards): **Admission, AI Assistant, Parent Portal, WhatsApp Bot** (icon tile + title + one line + hover arrow). Glass footer: school info + Quick Links + Contact numbers + Address + copyright.
**NAV:** navbar → [2]–[7]; Login & Parent Portal → [9]; Apply for Admission → [4].

### [2] ABOUT
Same navbar. Hero glass panel: kicker "About Us", H1 "About Our School". Stacked frosted glass sections (each = purple icon tile + Space Grotesk heading + thin purple divider): **School History & Mission**; **Vision & Mission** (two side-by-side glass cards); **The Ashram Shala System** (paragraph + 2×2 bento chips: free education Std 1–12 · free residential accommodation · three nutritious meals daily · books/uniforms/supplies provided); **Tribal Development Department**; **Campus Information** (bento of small stat cards: 460 students, 26 staff, Std 1–12, Marathi medium, Raigad, Karjat); **Residential Facility** (520 beds, Boys Wing, Girls Wing); **Principal's Office** — "Shri. Bansode Ajit Lalasaheb — Acting Principal".
**NAV:** navbar → [1]–[7]; Login → [9].

### [3] ACADEMICS
Same navbar. Hero: kicker "Education", H1 "Academics". **Standards & Medium** bento of glass tiles (Standards 1–12, Marathi Medium, State Board) + a purple-tinted glass info strip (lightbulb). **Subjects by Standard**: glass cards Primary / Secondary / Higher Secondary, each a bullet list with purple dots. **Faculty**: responsive grid of glass staff cards (avatar, name, purple role label, subject).
**NAV:** navbar → [1]–[7]; Login → [9].

### [4] ADMISSION (public)
Same navbar. Hero: kicker "Enrollment", H1 "Admission", glass status card with green check + orange **OPEN** badge "Admissions Open for 2026–27". **Admission Process**: vertical stepper of glass cards, each numbered orange gradient circle + title/description. **Required Documents**: glass checklist card (purple check icons). **Application Form** (large glass card): Student Name, Parent/Guardian Name, Mobile Number, Email (optional), Standard dropdown + orange **Submit Application** → glass success toast.
**NAV:** navbar → [1]–[7]; Login → [9].

### [5] HOSTEL
Same navbar. Hero: kicker "Residential Facility", H1 about hostel life. Glass sections: 520-bed overview; bento stat cards (520 Total Beds, Boys Wing, Girls Wing); feature chips (three meals, drinking water, health check-ups, recreation); warden contact cards (Boys Hostel Warden, Girls Hostel Warden) with icon + label + phone.
**NAV:** navbar → [1]–[7]; Login → [9].

### [6] GALLERY
Same navbar. Hero: kicker + H1 "Gallery". **Bento masonry grid** of photo cards in frosted glass frames (mixed large/wide/small, 24px radius, hover lift + zoom). Clicking a photo → frosted-glass **lightbox modal** (blurred dark overlay, spring scale-in, prev/next arrows, close X).
**NAV:** navbar → [1]–[7]; photo → lightbox; Login → [9].

### [7] CONTACT
Same navbar. Hero: kicker "Get in Touch", H1 "Contact Us". **School Address** glass card (Marathi + English). **Contact Details** bento of glass cards: Principal 9423864391, Office/Clerk 7666971183, Email hmpathraj22@gmail.com, WhatsApp card + orange **Chat on WhatsApp**. **Location**: map inside rounded glass frame + orange **Navigate to School**. **Send a Message** glass form (Name, Mobile, Message) + orange submit.
**NAV:** navbar → [1]–[7]; Login → [9].

### [9] LOGIN
Full-screen auth on lavender orb background. One centered floating frosted glass card (24px radius). Top: circular purple logo tile + "Government of Maharashtra" kicker + school name. Glass inputs: **Username** (user icon), **Password** (lock icon + show/hide eye), purple focus glow. Orange gradient **Login** button (full width). Below: **Forgot password?** link + **Register** link ("New parent? Create an account"). Top-left glass **Back** button, top-right **मराठी/EN** toggle, footer line "Your data is protected with encryption".
**NAV:** Login success → [12] (first login) else [13]/[15]; Forgot password? → [11]; Register → [10]; Back → [1].

### [10] REGISTER (Parent) — 3 stages in one glass card
Centered frosted glass card, purple logo tile, "Parent Registration", 3-step segmented progress (Verify → Password → Done). **Stage 1 Verify:** Full Name; Mobile Number with "+91 🇮🇳" prefix chip + inline **Send OTP** ("SMS optional") + 6-digit field + **Verify** (green "Verified" check); Email + inline **Send OTP** + 6-digit + **Verify** ("Email required"); Relationship dropdown (Father/Mother/Guardian/Other); orange **Continue to Signup** (disabled until email verified); **Back to login** link. **Stage 2 Password:** green "verified" strip; New Password (lock+eye) + Confirm Password (min 8); orange **Create Account**; Back link. **Stage 3 Done:** green shield-check + "Your account is ready. Redirecting…" + glass skeleton.
**NAV:** Continue → Stage 2; Create Account → Stage 3 → [15]; Back to login → [9].

### [11] FORGOT PASSWORD — 4 stages in one glass card
Centered frosted glass card, purple logo tile. **Stage 1:** "Forgot Password", one glass input (mobile/email), orange **Send Reset Code**, Back to Login link. **Stage 2:** "Enter Reset Code", subtitle "sent to y•••@mail", large centered 6-digit mono code input (key icon), orange **Verify Code**, "Try different identifier". **Stage 3:** New Password + Confirm Password (eye toggle), orange **Reset Password**. **Stage 4:** green shield-check + "Password reset. Redirecting…".
**NAV:** Send → Stage 2; Verify → Stage 3; Reset → Stage 4 → [15]; Back to Login → [9].

### [12] CHANGE PASSWORD (forced first login)
Centered frosted glass card, purple logo tile, "Set a New Password" + subtitle "For your security, please change your temporary password". Inputs: Current Password, New Password, Confirm Password (min 8, eye toggle, purple focus). Orange **Update Password**. Optional "Skip for now" link. Success → glass toast.
**NAV:** Update → [13]/[15]; Skip → [15].

### [13] PHONE VERIFICATION (modal over dashboard)
Centered frosted-glass **modal** (spring scale-in) over blurred dark overlay, dashboard dimmed behind. "Verify your mobile number"; "+91" phone input + orange **Send OTP**; 6-digit OTP field + purple **Verify**; secondary glass **Skip / Do it later**; close X.
**NAV:** Verify / Skip → close → [15].

### [14] SPLASH
Full-screen lavender orb background. Centered: large purple glass logo tile with school icon (soft pulse), school name in Devanagari, kicker "PATHRAJ ASHRAM · EDUCATION PORTAL", "Preparing your workspace…" with slim glass progress shimmer. Auto-advances.
**NAV:** auto → [15].

### [15] DASHBOARD SHELL (frame for tabs [16]–[23])
Logged-in app shell on lavender orbs. **Floating glass sidebar (~288px):** purple logo tile + "Pathraj Ashram / EDUCATION PORTAL"; nav items with Lucide icons — Admissions, Attendance, Hostel, Messages, Staff & Letters, Administration, AI Assistant, Voice Agent. **Active = purple gradient tinted glass + purple icon/text + soft glow;** inactive = muted gray + hover. Bottom = small glass info card "Tribal Welfare Department · Serving Pathraj, Karjat–Raigad". **Top bar (glass):** thin government kicker strip, school title, green **"Active"** pill, user chip (avatar + name + role e.g. "Principal / मुख्याध्यापक"), **मराठी/EN** toggle, **Logout** button. Content = bento area (per tab). **Mobile:** sidebar → drawer + bottom glass tab bar + top "Menu" button.
**NAV:** sidebar → [16]–[23]; Logout → [1].

### [16] ADMISSIONS tab
Header kicker "ADMISSIONS", title "Admission Records". **New Admission Application** glass form card (Student Name, Parent/Guardian Name, Mobile, Village, Standard dropdown) + orange **Submit**. Large glass **data-table card**: search + filters; columns Sr No · Name · Standard · Guardian · Village · Status; muted uppercase headers, generous rows, purple key values, translucent **status badges** (Submitted=purple, Verified=orange, Approved/Enrolled=green, Rejected=red), compact purple/orange action buttons, hover row highlight; glass empty state + skeleton rows.
**NAV:** row → detail modal; sidebar → tabs; Logout → [1].

### [17] ATTENDANCE tab (Class Teacher)
Header kicker "ATTENDANCE", title "Mark Attendance". Glass control row: **Standard** select, **Date** picker (calendar icon), "Device Mode" toggle. Glass counter pill "marked X / total". Responsive grid of **student attendance glass cards** (name, roll no, Present/Absent toggle — Present=purple, Absent=orange/red). Wide glass summary card with a donut/progress chart. Orange **Save Attendance** → glass success toast.
**NAV:** sidebar → tabs; Logout → [1].

### [18] HOSTEL tab
Header kicker "HOSTEL", title "Hostel Management". KPI bento (Total Beds 520, Occupied, Vacant, Wardens). Glass **bed allocation** grid with Boys Wing / Girls Wing tabs (bed tiles: occupied=purple, vacant=glass). Glass table of resident students (Name · Standard · Room · Warden) + actions. Allocate-bed → frosted glass modal.
**NAV:** sidebar → tabs; Logout → [1].

### [19] MESSAGES tab (WhatsApp Hub)
Header kicker "MESSAGES", title "WhatsApp Hub". Two-pane glass layout: left = templates/broadcast campaigns list (glass rows, purple active); right = compose glass card (recipient group dropdown, message textarea, variable chips) + orange **Send** + preview chat bubble. Wide glass stats card (sent/delivered/read) with soft bar chart.
**NAV:** sidebar → tabs; Logout → [1].

### [20] STAFF & LETTERS tab (Clerk)
Header kicker "STAFF & LETTERS", title "Staff & Letters". Glass segmented control: **Staff Directory** | **Letter Generator**. *Staff Directory:* grid of glass staff cards (avatar, name, designation, department, mobile) + glass table (Name · Designation · Department) with search. *Letter Generator:* glass form (letter type dropdown, recipient, subject, body) + live A4 letter **preview inside a glass sheet** + orange **Generate PDF**.
**NAV:** segmented → sub-views; sidebar → tabs; Logout → [1].

### [21] ADMINISTRATION tab (Super Admin)
Header kicker "ADMINISTRATION", title "Control Center". KPI bento (Users, Applications, Gallery Images, Activity Today). **User Management** glass table (role badges, enable/disable, reset). **Gallery Manager** glass grid + upload dropzone card. **Activity Monitor** large glass table (Date · Student · Parent · Mobile · Standard · Status) + filters. Wide glass analytics card (purple/orange line/area chart).
**NAV:** sidebar → tabs; Logout → [1].

### [22] AI ASSISTANT tab
Header kicker "AI ASSISTANT", title "Ashram AI". Glass **chat interface**: thread with user bubbles (purple gradient, right) + assistant bubbles (glass, left) + typing-dots; suggested-prompt chips; floating glass composer bar at bottom (text input, mic button, orange **Send**). Optional right glass panel of quick actions/sources.
**NAV:** sidebar → tabs; Logout → [1].

### [23] VOICE AGENT tab (Calling Agent)
Header kicker "VOICE AGENT", title "Calling Agent". Centered glass **call console**: large circular purple glass avatar with animated audio-wave rings, status text ("Ready"/"Calling…"/"Connected"), recipient/number field, round call controls (orange **Call**, glass Mute, red End). Glass **call log** table (Time · Number · Duration · Status badge) + wide glass live-transcript panel.
**NAV:** sidebar → tabs; Logout → [1].

---

## SECTION 3 — GLOBAL RULES FOR STITCH

1. Apply **Section A** to **every** screen identically — do not redesign per page.
2. Keep the **background orb environment** on all screens.
3. Show key labels **bilingually** (English + Marathi/Devanagari) where natural.
4. Generate **Desktop first**, then a **true mobile composition** for each (bottom tab bar, drawers, stacked cards, full-width buttons).
5. Wire buttons/links exactly per the **NAV** notes and **Flow Map**.
6. Use **glass skeletons** for loading, calm **orange** for errors, floating **glass toasts** for notifications.
7. Logout always returns to **[1] HOME**.

# ══════════════════════════════════════════
# END MASTER PROMPT
# ══════════════════════════════════════════

---

### If Stitch struggles with "all at once"
Stitch sometimes generates better one screen at a time. In that case, paste **Section A** + a single screen block from Section 2, generate it, then move to the next screen. The visual system stays consistent because Section A is identical every time.

### Refinement follow-ups to type into Stitch
- *"Increase backdrop blur and make the glass panels more translucent."*
- *"Add large soft blurred purple and orange background orbs, low opacity."*
- *"Use a bento grid with mixed card sizes, not a uniform grid."*
- *"Make the main heading a purple-to-orange gradient in Space Grotesk."*
- *"Show labels in both English and Marathi (Devanagari)."*
- *"Now generate the mobile version of this screen with a bottom tab bar."*
