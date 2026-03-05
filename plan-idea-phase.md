# Planning Session: Major Improvements for analyze.me
**Date:** December 10, 2024
**Last Updated:** March 5, 2026
**Status:** Phase 1 & 2 Largely Complete

---

## Vision & Goals

### Core Vision
User uploads **journal docs** or **social media posts** (last ~100) → AI generates **psychological reports** → Actionable recommendations

### Key Principles
1. **Keep it simple** - Click, click, click UX (minimal friction)
2. **Automation over manual** - Auto-pull data where possible
3. **Focus on AFTER analysis** - What happens after insights are generated?
4. **No expensive APIs** - Find free alternatives (Twitter $100/month = too expensive)
5. **Extend usefulness** - Make app more valuable beyond one-time analysis

---

## Current State (March 2026)

### Tech Stack Changes Since Planning
- **AI:** Migrated from Grok → **Claude API** (Anthropic)
- **Auth:** Migrated from Clerk → **Google Sign-In** (native GIS)
- **Database:** Added **Neon PostgreSQL** (serverless)
- **Gamification:** Full XP/levels/streaks/achievements system added

### ✅ Implemented Features
- Google Docs integration (OAuth + document picker)
- Gmail integration (email patterns, communication analysis)
- Google Calendar integration (work-life balance)
- GitHub integration (developer wellness, commit patterns)
- Spotify integration (music mood analysis)
- Twitter Archive import (ZIP/JSON upload)
- Manual text import (textarea + paste)
- 8 analysis types with configurable output length
- Claude AI analysis via Netlify Functions (rate-limited)
- Journal system with mood tracking (1-5)
- Gamification: XP, 20 levels, streaks, 25+ achievements
- Action items extraction from analyses
- Professional recommendations (affiliate)
- User accounts (Neon PostgreSQL)
- Markdown rendering (marked + DOMPurify)
- Copy to clipboard
- Cyberpunk UI theme (responsive)
- 15 unit test files (Vitest)
- Privacy policy & terms of service pages
- CEO project dashboard

### Architecture
- **Frontend:** Vue 3 + Vite 6 + Tailwind CSS v4
- **Backend:** Netlify Functions (5 functions + utils)
- **AI:** Claude API (Sonnet/Haiku models)
- **Auth:** Google Sign-In + JWT verification
- **Database:** Neon PostgreSQL (5 tables)
- **Storage:** PostgreSQL (migrated from localStorage)

---

## Proposed Improvements (Original Plan + Status)

### 1. Post-Analysis Actions + Monetization ✅ IMPLEMENTED
- Action items extraction from AI analysis
- Professional recommendations component
- Affiliate configuration (`src/config/affiliates.js`)
- **Remaining:** Finalize BetterHelp/Talkspace affiliate signups, A/B test placement

### 2. Automatic Data Sources ✅ IMPLEMENTED
- Gmail API integration ✅
- Google Calendar API integration ✅
- Spotify API integration ✅
- GitHub API integration ✅ (added beyond original plan)
- **Remaining:** Apple Health / Google Fit, RescueTime, Strava (Phase 4)

### 3. Twitter Archive + Manual Import ✅ IMPLEMENTED
- Twitter archive ZIP/JSON import ✅
- Manual text textarea ✅
- Instagram Basic Display API — Not implemented (deprioritized)

### 4. Cloud Storage ✅ IMPLEMENTED (via Neon, not Firebase)
- **Decision changed:** Used Neon PostgreSQL instead of Firebase Firestore
- Users table, analyses table, journal entries table ✅
- Usage tracking table ✅
- Gamification table ✅
- Cross-device sync via database ✅

### 5. Trend Analysis Dashboard ⬜ NOT YET IMPLEMENTED
- Mood timeline chart
- Recurring themes word cloud
- Goal progress tracker
- Emotional volatility indicator
- **Status:** Ready to build — all data is in PostgreSQL

### 6. Additional Features (Phase 3+)
- Comparative analysis — ⬜ Not implemented
- Smart organization (tags, search, filters) — ⬜ Not implemented
- Visual insights (charts, pie charts) — ⬜ Not implemented
- Data export (JSON, Markdown, CSV) — ⬜ Not implemented

---

## Prioritized Roadmap (Updated)

### ✅ Phase 1: Foundation + Quick Wins — COMPLETE
- Twitter Archive import ✅
- Manual text import ✅
- Post-analysis action items ✅
- Professional recommendations ✅

### ✅ Phase 2: Automation + Storage — COMPLETE
- Gmail integration ✅
- Google Calendar integration ✅
- Spotify integration ✅
- GitHub integration ✅ (bonus)
- Database migration to Neon PostgreSQL ✅
- Gamification system ✅ (bonus)
- Journal system ✅ (bonus)

### ⬜ Phase 3: Intelligence + Visualization — NEXT
- Trend analysis dashboard (sentiment charts over time)
- Comparative analysis (period-over-period)
- Smart organization (tags, search, filters)
- Data export (JSON, Markdown, CSV)
- PDF export for analyses

### ⬜ Phase 4: Advanced Sources (Optional)
- Apple Health / Google Fit
- Notion API
- RescueTime
- Strava

---

## Technical Decisions (Final)

| Decision | Original Plan | Actual |
|----------|--------------|--------|
| AI | Grok (xAI) | **Claude API (Anthropic)** |
| Auth | Clerk → Google Sign-In | **Google Sign-In (native GIS)** |
| Storage | Firebase Firestore | **Neon PostgreSQL** |
| Twitter | Archive import | **Archive import** ✅ |
| Monetization | Affiliate model | **Affiliate model** (configured, not live) |
| UX | Click, click, click | **Click, click, click** ✅ |

---

## What We're NOT Doing

- Real-time monitoring (no push notifications)
- Multi-user features (no social, sharing, collaboration)
- Therapist portal (no professional interface)
- Mobile apps (web-only, responsive)
- Custom NLP models (using Claude)
- Payment/subscriptions (keeping free for now)
- Expensive APIs (Twitter official API)

---

## Next Steps (Phase 3)

1. **Trend Analysis Dashboard**
   - Add Chart.js or similar
   - Query analyses by date range from PostgreSQL
   - Sentiment score extraction and charting
   - New `/dashboard` or `/trends` route

2. **Data Export**
   - JSON export of all user data
   - CSV export of analyses
   - Markdown export of individual analyses

3. **PDF Export**
   - Generate PDF from analysis results
   - Include metadata (date, prompt, source)

4. **Affiliate Program Activation**
   - Register for BetterHelp affiliate program
   - Set up tracking links
   - A/B test recommendation placement

---

## Summary

**Phase 1 & 2 are complete.** The app has evolved significantly from the original plan:

- 8 data sources (planned 3-4 initially)
- Full gamification system (not in original plan)
- Journal system (not in original plan)
- PostgreSQL instead of Firebase (better for structured data)
- Claude instead of Grok (better analysis quality)
- Native Google Sign-In instead of Clerk (simpler, no third-party dependency)
- 15 test files (not in original plan)
- CEO dashboard (not in original plan)

**Phase 3 (trends, export, visualization) is the natural next step.**
