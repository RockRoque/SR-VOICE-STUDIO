# Sarah Roque Voice Studio

## Project Overview
Voice studio website for Sarah Roque (Alexandria, VA). Two parts:
1. **Public site** (`site/`) — Single-page vanilla HTML/CSS/JS + Decap CMS
2. **Admin dashboard** (`admin-dashboard/`) — React (Vite) + Firebase

## Architecture
- **Public site**: Static HTML/CSS/JS served by Vercel
- **Admin dashboard**: React + Vite, Firebase Auth/Firestore
- **Backend**: Firebase Cloud Functions (Cal.com sync, Wave proxy, emails)
- **CMS**: Decap CMS (Git-backed, content in `site/content/`)
- **Scheduling**: Cal.com embed (public) + API (admin)
- **Payments**: Wave Checkout links (public) + GraphQL API (admin)

## Design System
- **Font**: Newsreader (Google Fonts) — weights 200-600
- **Light theme**: Background `#fff2d8`, text `#000000`
- **Dark theme**: Background `#130f0c`, text `#fff2d8`
- **Theme toggle**: `data-theme` attribute on `<html>` + localStorage
- **Desktop**: 1458px frame, ~1200px content max-width
- **Mobile**: 402px frame, hamburger nav

## Commands
```bash
# Root — run all tests
npm test                    # Vitest across all workspaces
npm run test:e2e            # Playwright E2E tests
npm run test:coverage       # Vitest with coverage report

# Site — public site dev
npx serve site              # Local dev server for public site

# Admin dashboard
cd admin-dashboard && npm run dev    # Vite dev server
cd admin-dashboard && npm run build  # Production build

# Functions
cd functions && npm test             # Function unit tests

# Code review
coderabbit --plain          # AI code review (run from repo root)
```

## Key Conventions
- CSS variables in `site/css/tokens.css` for all design tokens
- Theme variants via `[data-theme="dark"]` selector
- CMS content stored as JSON in `site/content/`
- All Firestore collections are admin-only (single UID)
- No API keys in client code — use Vercel env vars or Firebase config
- Security headers configured in `vercel.json`

## Testing
- **Unit/Integration**: Vitest (95% coverage target)
- **E2E**: Playwright (desktop 1458px + mobile 402px)
- **Accessibility**: axe-core via Playwright
- Coverage thresholds enforced in CI

## Branch Strategy
- `main` — production (auto-deploys to Vercel)
- `feat/m{N}-{description}` — milestone feature branches
- PRs required for merges to main

## Design Reference
- Full plan: `docs/plans/2026-02-19-voice-studio-design.md`
- Figma: `figma.com/design/7iKLf10qySVAVkN3JpCW1V/saroque-studio-sap-mid-fidelity`
  - Desktop Light: node `2:3`
  - Desktop Dark: node `12:611`
  - Mobile Light: node `13:981`
