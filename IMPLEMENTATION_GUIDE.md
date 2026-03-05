# Implementation Guide

## Current Status: Fully Implemented

All core features are built and functional.

### Implemented Features
- **Auth:** Google Sign-In (native GIS, JWT verification server-side)
- **AI Analysis:** Claude API (Sonnet/Haiku) via Netlify Functions with rate limiting
- **Database:** Neon PostgreSQL (users, analyses, journal entries, gamification, usage tracking)
- **Data Sources:** Google Docs, Gmail, Calendar, GitHub, Spotify, Twitter archives, manual text
- **Gamification:** XP, 20 levels, streaks, 25+ achievements
- **Journal:** CRUD with mood tracking, cloud-stored in PostgreSQL
- **UI:** Cyberpunk theme (Tailwind CSS v4), 10 page views, 30+ components
- **Testing:** 15 Vitest test files covering composables and functions

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Google OAuth
Follow [GOOGLE_SETUP.md](./GOOGLE_SETUP.md) to create credentials.

### 3. Set Up Neon Database
1. Create a project at [neon.tech](https://neon.tech)
2. Run the schema: `psql $DATABASE_URL < db/schema.sql`

### 4. Get Claude API Key
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Create an API key

### 5. Configure Environment
```bash
cp .env.example .env.local
```

Fill in all values (see `.env.example` for descriptions).

### 6. Run
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). Netlify Functions are emulated automatically by `@netlify/vite-plugin`.

---

## Testing

```bash
npm test
```

### Manual Testing Checklist

1. **Auth Flow:**
   - [ ] Google Sign-In works on landing page
   - [ ] Redirects to `/app` after sign-in
   - [ ] Sign-out clears state

2. **Data Sources:**
   - [ ] Google Docs selection and content fetch
   - [ ] Gmail import
   - [ ] Calendar import
   - [ ] GitHub OAuth and data fetch
   - [ ] Spotify OAuth and data fetch
   - [ ] Twitter archive upload (ZIP)
   - [ ] Manual text input

3. **Analysis:**
   - [ ] All 8 prompt types work
   - [ ] Output length toggle (summary/middle/long)
   - [ ] Results render markdown correctly
   - [ ] Action items extracted

4. **Journal:**
   - [ ] Create entry with mood
   - [ ] Edit and delete entries
   - [ ] Entries persist in database

5. **Gamification:**
   - [ ] XP awarded for analyses
   - [ ] Level up triggers notification
   - [ ] Streaks tracked correctly
   - [ ] Achievements unlock

6. **Error Handling:**
   - [ ] Rate limit message appears (11+ requests/min)
   - [ ] Invalid auth shows error dialog
   - [ ] Network errors handled gracefully

---

## Deployment to Netlify

### Prerequisites
- GitHub repo connected to Netlify
- Google OAuth credentials configured for production domain
- Anthropic API key
- Neon database provisioned

### Steps

1. **Connect to Netlify:**
   - New site from Git → select `dizid/analyze.me`
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Set Environment Variables** (Netlify Dashboard → Site settings → Environment variables):
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL`
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_API_KEY`
   - `VITE_GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` (optional)
   - `VITE_SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` (optional)

3. **Update Google OAuth** (Google Cloud Console → Credentials):
   - Add production URL to Authorized JavaScript origins
   - Add production URL to Authorized redirect URIs

4. **Deploy:** Push to `main` or trigger manual deploy.

---

## Troubleshooting

### Auth Issues
- **"Access blocked"** → Check authorized origins include your URL
- **Sign-in button doesn't appear** → Verify `VITE_GOOGLE_CLIENT_ID` is set
- **JWT verification fails** → Check that `google-auth-library` can reach Google servers

### API Issues
- **"ANTHROPIC_API_KEY not configured"** → Set in `.env.local` or Netlify env vars
- **Rate limit exceeded** → Wait 1 minute (10 req/min limit)
- **Analysis fails** → Check Netlify Functions logs for error details

### Database Issues
- **Connection refused** → Verify `DATABASE_URL` format and Neon project is active
- **Table not found** → Run `db/schema.sql` against your database

### Style Issues
- **Tailwind not loading** → Ensure `@tailwindcss/vite` plugin is in `vite.config.js`
- **Theme broken** → Check `@import "tailwindcss"` in `src/assets/styles/main.css`

### Dev Server Issues
- **Port conflict** → Kill process on port 3000: `lsof -ti:3000 | xargs kill`
- **Functions not working** → The `@netlify/vite-plugin` emulates them automatically, no separate server needed

---

## Future Enhancements

- [ ] PDF export for analyses
- [ ] Trend analysis dashboard (sentiment over time)
- [ ] Comparative analysis (period-over-period)
- [ ] Multiple document batch analysis
- [ ] Firebase push notifications
- [ ] Mobile app (PWA)
