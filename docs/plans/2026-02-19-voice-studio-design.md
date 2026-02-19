# Sarah Roque Voice Studio — Implementation Plan (v2)

## Context

Building a website for Sarah Roque's voice studio (Alexandria, VA). Two audiences: **clients** (public single-page site with booking/payment) and **Sarah as admin** (dashboard for bookings, income, clients, messaging). Figma designs define both dark and light theme variants. Built with a multi-agent Opus 4.6 orchestration, with Sonnet agent teams handling implementation.

**Figma file**: `figma.com/design/7iKLf10qySVAVkN3JpCW1V/saroque-studio-sap-mid-fidelity`
- Desktop Light: `2:3` | Desktop Dark: `12:611` | Mobile Light: `13:981`

**GitHub repo**: `https://github.com/RockRoque/SR-VOICE-STUDIO`
**Vercel project**: `sr-voice-studio` (linked to GitHub repo, auto-deploy on push)

---

## Architecture Overview

| Component | Technology | Hosting |
|-----------|-----------|---------|
| Public site | Vanilla HTML/CSS/JS + Decap CMS | Vercel |
| Admin dashboard | React (Vite) + Firebase SDK | Vercel |
| Backend/API | Firebase Cloud Functions | Firebase |
| Database | Firestore (free tier) | Firebase |
| Auth | Firebase Auth (email/password) | Firebase |
| Scheduling | Cal.com embed (syncs to Sarah's Google Calendar) | Cal.com |
| Payments | Wave Checkout links (public) + Wave GraphQL API (admin) | Wave |
| CMS | Decap CMS (open-source, Git-backed) | Vercel (served from `/admin`) |
| Testing | Vitest (unit/integration) + Playwright (E2E) | CI |
| Code Review | CodeRabbit CLI before every commit | Local + CI |
| Project Tracking | GitHub Issues + GitHub Projects | GitHub |

**Theme**: `prefers-color-scheme` + manual toggle via `data-theme` on `<html>`.

---

## Design Tokens (from Figma MCP — Exact Values)

### Colors

```
LIGHT THEME                          DARK THEME
─────────────────────────────────    ─────────────────────────────────
Background:    #fff2d8               Background:    #130f0c
Text primary:  #000000               Text primary:  #fff2d8
Text secondary:rgba(0,0,0,0.8)      Text secondary:rgba(255,242,216,0.8)
Card borders:  rgba(0,0,0,0.8) 3px  Card borders:  #fff2d8 3px
Card bg:       #fff2d8               Card bg:       transparent / #130f0c
CTA button bg: rgba(0,0,0,0.88)     CTA button bg: #fff2d8
CTA button txt:#fff2d8               CTA button txt:rgba(0,0,0,0.8)
Book btn bg:   rgba(0,0,0,0.88)     Book btn bg:   #fff2d8
Book btn txt:  #d9d9d9               Book btn txt:  rgba(0,0,0,0.8)
FAQ borders:   #000000               FAQ borders:   #fff2d8
Dividers:      rgba(0,0,0,0.3)      Dividers:      rgba(255,242,216,0.3)
Accent heart:  pink (image asset)    Accent heart:  pink (image asset)
```

### Typography — Newsreader (Google Font)

| Element | Weight | Desktop | Mobile | Style |
|---------|--------|---------|--------|-------|
| "Sarah Roque" | Light 300 | 40px | 32px | Italic, capitalize |
| "Voice Studio" | ExtraLight 200 | 128px | 64px | Italic, capitalize |
| Section headings | Medium 500 | 128px | 48px | Italic, lowercase |
| "I'm Sarah..." | Medium 500 | 96px | 64px | Italic, lowercase |
| Sub-headings | SemiBold 600 | 40px | 32px | Capitalize |
| Body text | Light 300 | 32px | 24px | Lowercase |
| Navigation | Normal 400 | 48px | — | Italic, lowercase |
| Motivational quotes | ExtraLight 200 | 64px | 40-48px | Lowercase, mixed italic |
| FAQ questions | Light 300 | 40px | 24px | Lowercase |
| Buttons | Medium 500 | 32px | 24px | Lowercase |

### Layout
- Desktop content: max-width ~1200px within 1458px frame
- Mobile: 402px frame, hamburger nav
- Cards: 380x525px (desktop), 339x525px (mobile stacked)
- Gallery: 3x2 grid (desktop), horizontal scroll with overlapping effect (mobile)
- Border radius: 6-8px | Section card gaps: 30px

### Special: Mobile Overlapping Gallery
- First image: 334x400px
- Second image: 359.78x421.26px, offset ~13px left + ~12px down
- CSS: `transform: translate(-13px, 12px)` with `z-index` layering

### Special: Pink Heart
- After "this is why I do what i do." text
- Mobile: `transform: rotate(18.95deg)`
- Image asset (not emoji)

---

## Project Structure

```
sarah-roque-voice-studio/
├── site/                             # Public site → Vercel
│   ├── index.html                    # Single page, all sections
│   ├── admin/                        # Decap CMS editor UI
│   │   ├── index.html                # Decap CMS admin panel
│   │   └── config.yml                # Decap CMS config (collections, fields)
│   ├── content/                      # CMS-managed content (JSON/Markdown)
│   │   ├── rates.json                # Rate card data
│   │   ├── reviews.json              # Review content
│   │   ├── faqs.json                 # FAQ questions & answers
│   │   ├── policies.json             # Policy text
│   │   └── gallery.json              # Gallery image references
│   ├── css/
│   │   ├── tokens.css                # CSS variables (themes, type, spacing)
│   │   ├── reset.css                 # Box-sizing, margin reset
│   │   ├── typography.css            # Type scale classes
│   │   ├── layout.css                # Page grid, sections, containers
│   │   ├── components.css            # Cards, buttons, nav, accordion, gallery
│   │   └── utilities.css             # Visibility, text-transform helpers
│   ├── js/
│   │   ├── theme-toggle.js           # Dark/light toggle + localStorage + prefers-color-scheme
│   │   ├── navigation.js             # Hamburger, smooth scroll, active section
│   │   ├── accordion.js              # FAQ expand/collapse
│   │   ├── gallery.js                # Mobile horizontal scroll/swipe + overlapping effect
│   │   └── content-loader.js         # Load CMS JSON content into page sections
│   ├── assets/
│   │   ├── images/                   # Photos (Sarah, gallery, reviews)
│   │   └── icons/                    # Microphone SVG, heart, chevrons, menu
│   └── __tests__/                    # Public site tests
│       ├── theme-toggle.test.js      # Vitest unit tests
│       ├── accordion.test.js
│       ├── navigation.test.js
│       └── e2e/
│           ├── site.spec.ts          # Playwright E2E: full page sections
│           ├── theme.spec.ts         # Playwright: theme toggle
│           ├── responsive.spec.ts    # Playwright: desktop + mobile viewports
│           └── a11y.spec.ts          # Playwright + axe-core: accessibility
├── admin-dashboard/                  # React admin dashboard → Vercel
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                   # AuthProvider + Router
│   │   ├── config/firebase.js        # initializeApp, getAuth, getFirestore
│   │   ├── context/AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useFirestore.js
│   │   │   ├── useCalcom.js          # Cal.com API for bookings
│   │   │   └── useWave.js            # Wave data via Cloud Functions
│   │   ├── components/
│   │   │   ├── layout/               # Sidebar, Header, ProtectedRoute
│   │   │   ├── bookings/             # BookingList, BookingDetail, BookingCalendar
│   │   │   ├── clients/              # ClientList, ClientDetail
│   │   │   ├── income/               # IncomeOverview, PaymentHistory
│   │   │   └── messages/             # MessageCompose, MessageList
│   │   ├── pages/                    # Login, Dashboard, Bookings, Clients, Income, Messages
│   │   └── styles/admin.css
│   ├── __tests__/                    # Admin tests
│   │   ├── components/               # Vitest + React Testing Library
│   │   ├── hooks/                    # Hook unit tests
│   │   ├── pages/                    # Page integration tests
│   │   └── e2e/
│   │       ├── auth.spec.ts          # Playwright: login/logout flow
│   │       ├── bookings.spec.ts      # Playwright: booking management
│   │       └── dashboard.spec.ts     # Playwright: dashboard data display
│   ├── vitest.config.js
│   ├── playwright.config.ts
│   ├── package.json
│   └── vite.config.js
├── functions/                        # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.js                  # Function exports
│   │   ├── calcom-sync.js            # Cal.com webhook/API → Firestore bookings
│   │   ├── wave-proxy.js             # Wave GraphQL API proxy
│   │   └── email-notifications.js    # Send emails to clients
│   └── __tests__/                    # Function tests
│       ├── calcom-sync.test.js
│       ├── wave-proxy.test.js
│       └── email-notifications.test.js
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── vercel.json                       # Vercel monorepo config
├── .github/workflows/
│   ├── ci.yml                        # Test + CodeRabbit on every PR
│   └── deploy.yml                    # Vercel deploy on push to main
├── playwright.config.ts              # Root Playwright config
├── vitest.workspace.js               # Vitest workspace (site + admin + functions)
├── package.json                      # Root: scripts, workspaces
├── CLAUDE.md                         # Project instructions
└── .coderabbit.yaml                  # CodeRabbit config
```

---

## Firestore Schema

```
clients/{clientId}
  name, email, phone, notes, createdAt, updatedAt, lessonCount

bookings/{bookingId}
  clientId, clientName, clientEmail, calcomBookingId, calcomEventId,
  dateTime, duration, type (intro|single|package),
  status (confirmed|cancelled|completed|rescheduled|no-show),
  rate, notes, waveInvoiceId, paymentStatus, createdAt, updatedAt

payments/{paymentId}
  waveTransactionId, clientId, clientName, amount, currency, method,
  status, description, bookingId, paidAt, syncedAt

messages/{messageId}
  to, clientId, clientName, subject, body, status (sent|failed|draft), sentAt

settings/app
  rates: {intro: 0, single: 7500, package: 20000}, calcomApiKey,
  waveBusinessId, notificationEmail
```

**Security rules**: All collections admin-only (`request.auth.uid == 'ADMIN_UID'`).

---

## Milestones

### M1: Project Scaffolding & Design System
### M2: Public Site — Hero, Nav, About
### M3: Public Site — Schedule, Rates, Gallery
### M4: Public Site — Reviews, Policies, FAQs, Footer + Security
### M5: Firebase Setup & Admin Scaffolding
### M6: Admin — Bookings & Cal.com Sync
### M7: Admin — Clients & Income
### M8: Admin — Messages, Polish & Launch
