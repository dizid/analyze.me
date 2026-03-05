# analyze.me

AI-powered self-analysis platform. Connect your data sources — Google Docs, Gmail, Calendar, GitHub, Spotify, Twitter archives — and get psychological insights powered by Claude AI. Cyberpunk-themed Vue 3 app with gamification.

## Features

- **Multi-source data analysis** — Google Docs, Gmail, Calendar, GitHub, Spotify, Twitter archives, manual text
- **8 analysis types** — Themes, sentiment, goals, strengths/weaknesses, self-improvement, email patterns, music mood, work-life balance
- **Claude AI** — Powered by Anthropic's Claude (Sonnet/Haiku) via Netlify Functions
- **Gamification** — XP, 20 levels, streaks, 25+ achievements
- **Journal** — Mood-tracked entries stored in PostgreSQL
- **Action items** — Extracts actionable recommendations from analyses
- **Export** — Markdown rendering, copy to clipboard
- **Cyberpunk UI** — Dark theme with neon accents, glitch effects, Orbitron font

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3 (Composition API), Vue Router 4, Vite 6 |
| Styling | Tailwind CSS v4, custom cyberpunk theme |
| Backend | Netlify Functions (Node.js 18) |
| AI | Claude API (Anthropic) |
| Auth | Google Sign-In (native GIS + JWT verification) |
| Database | Neon PostgreSQL (serverless) |
| Deployment | Netlify (auto-deploy from GitHub) |

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/dizid/analyze.me.git
cd analyze.me
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Required
ANTHROPIC_API_KEY=your-anthropic-api-key
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_API_KEY=your-google-api-key

# Optional (for data source integrations)
VITE_GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
VITE_SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

### 3. Set Up Google OAuth

Follow [GOOGLE_SETUP.md](./GOOGLE_SETUP.md) for step-by-step instructions on:
- Creating a Google Cloud project
- Enabling Drive, Docs, Gmail, Calendar APIs
- Configuring OAuth consent screen
- Getting Client ID and API Key

### 4. Set Up Database

Create a [Neon](https://neon.tech) project and run the schema:

```bash
# Apply schema to your Neon database
psql $DATABASE_URL < db/schema.sql
```

### 5. Run Development Server

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000) with Netlify Functions emulated via `@netlify/vite-plugin`.

## Project Structure

```
analyze.me/
├── netlify/functions/              # Server-side API
│   ├── analyze.js                  # Claude AI proxy (rate-limited)
│   ├── journal.js                  # Journal CRUD
│   ├── user-sync.js                # Google user sync to DB
│   ├── github-token.js             # GitHub OAuth token exchange
│   ├── spotify-token.js            # Spotify OAuth token exchange
│   └── utils/
│       ├── auth.js                 # JWT verification
│       └── db.js                   # Neon DB client
├── db/
│   └── schema.sql                  # PostgreSQL schema
├── src/
│   ├── main.js                     # Vue app entry
│   ├── App.vue                     # Root component
│   ├── router/index.js             # Vue Router (10 routes)
│   ├── views/                      # Page views
│   │   ├── LandingView.vue         # Public landing
│   │   ├── AuthView.vue            # Google Sign-In
│   │   ├── HomeView.vue            # Main dashboard
│   │   ├── JournalView.vue         # Journal entries
│   │   ├── ProfileView.vue         # User profile
│   │   ├── AchievementsView.vue    # Achievement showcase
│   │   ├── DigestView.vue          # Weekly digest
│   │   ├── CeoDashboardView.vue    # Project dashboard
│   │   ├── PrivacyPolicyView.vue   # Privacy policy
│   │   └── TermsOfServiceView.vue  # Terms of service
│   ├── components/                 # Vue components
│   │   ├── GoogleAuth.vue          # Auth wrapper
│   │   ├── DataSourceSelector.vue  # Data source tabs
│   │   ├── AnalysisPrompt.vue      # Prompt selection
│   │   ├── ResultDisplay.vue       # Analysis results
│   │   ├── ActionItems.vue         # Action items
│   │   ├── ErrorDialog.vue         # Error modal
│   │   ├── data-sources/           # Gmail, GitHub, Spotify, Calendar imports
│   │   ├── gamification/           # XP, levels, streaks, achievements
│   │   ├── dashboard/              # Project dashboard components
│   │   ├── journal/                # Journal components
│   │   └── ui/                     # Cyberpunk theme components
│   ├── composables/                # Business logic (21 composables)
│   │   ├── useAuth.js              # Google Sign-In state
│   │   ├── useAnalysis.js          # Claude analysis wrapper
│   │   ├── useJournal.js           # Journal CRUD
│   │   ├── useGamification.js      # XP/levels/streaks
│   │   ├── useGmailData.js         # Gmail integration
│   │   ├── useGitHubData.js        # GitHub integration
│   │   ├── useSpotifyData.js       # Spotify integration
│   │   ├── useCalendarData.js      # Calendar integration
│   │   ├── useTwitterArchive.js    # Twitter archive import
│   │   └── ...                     # + 12 more
│   ├── config/                     # App configuration
│   │   ├── prompts.js              # 8 analysis prompts
│   │   ├── google.js               # Google API config
│   │   ├── gamification.js         # Levels & achievements
│   │   ├── github.js               # GitHub OAuth config
│   │   └── spotify.js              # Spotify OAuth config
│   ├── utils/errorHandler.js       # Error handling
│   ├── assets/styles/              # Tailwind + animations
│   └── tests/                      # Vitest unit tests (15 files)
├── .env.example                    # Environment variables template
├── netlify.toml                    # Netlify build & headers config
├── vite.config.js                  # Vite + Vue + Tailwind + Netlify plugins
├── vitest.config.js                # Test configuration
├── GOOGLE_SETUP.md                 # Google OAuth setup guide
└── FEATURES.md                     # Feature overview
```

## Scripts

```bash
npm run dev              # Vite dev server (port 3000, Netlify functions emulated)
npm run build            # Production build
npm run preview          # Preview production build
npm test                 # Run Vitest tests
npm run netlify:dev      # Netlify CLI dev server (port 9999)
npm run netlify:deploy   # Deploy to Netlify
```

## Security

- Claude API key server-side only (never exposed to client)
- Google JWT verification on all authenticated endpoints
- Rate limiting on analyze endpoint (10 req/min/IP)
- Content sanitized with DOMPurify
- CSP headers configured in `netlify.toml`
- Input validation (max 50k chars for documents)
- CORS properly configured

## Database Schema

Tables: `users`, `user_gamification`, `analyses`, `journal_entries`, `usage_tracking`

See [db/schema.sql](./db/schema.sql) for full schema.

## Deployment

1. Connect GitHub repo (`dizid/analyze.me`) to Netlify
2. Build command: `npm run build` | Publish: `dist/`
3. Set environment variables in Netlify dashboard:
   - `ANTHROPIC_API_KEY`, `DATABASE_URL`
   - `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_API_KEY`
   - Optional: GitHub and Spotify OAuth credentials
4. Update Google OAuth authorized origins with your Netlify URL
5. Deploy (auto-deploys on push to `main`)

---

Built with Claude Code
