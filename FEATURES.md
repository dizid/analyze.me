# Features

## What It Does

analyze.me connects to your personal data sources and uses Claude AI to generate psychological insights. Get instant analysis of your thoughts, emotions, work patterns, and habits from the data you already create.

## Data Sources

- **Google Docs** — Analyze your personal documents and journals
- **Gmail** — Email communication patterns and sentiment
- **Google Calendar** — Work-life balance and scheduling analysis
- **GitHub** — Developer wellness, commit patterns, burnout risk
- **Spotify** — Music mood analysis and listening patterns
- **Twitter Archive** — Import your tweet history (ZIP/JSON)
- **Manual Text** — Paste any text for analysis

## Analysis Types

8 pre-built analysis prompts with configurable output lengths (summary, balanced, deep-dive):

1. **Key Themes** — Recurring topics and personal patterns
2. **Mood & Sentiment** — Emotional tone and trajectory
3. **Goals & Progress** — Goal tracking and momentum
4. **Strengths & Weaknesses** — Balanced personal assessment
5. **Self-Improvement** — Actionable recommendations
6. **Email Communication** — Gmail patterns and communication style
7. **Music Mood** — Spotify listening patterns and emotional state
8. **Work-Life Balance** — Calendar analysis for burnout assessment

## Gamification

- **XP System** — Earn experience points for analyses, journal entries, and streaks
- **20 Levels** — Progress through levels as you analyze more
- **Streaks** — Daily login and analysis streaks
- **25+ Achievements** — Unlock achievements across consistency, exploration, depth, and discovery categories
- **Notifications** — Real-time XP gain and achievement unlock animations

## Journal

- **Mood Tracking** — Rate your mood (1-5) with each entry
- **Prompted Writing** — AI-suggested journal prompts
- **Cloud Storage** — Entries stored in PostgreSQL (Neon)
- **Analyze Entries** — Run AI analysis on your journal

## Post-Analysis

- **Action Items** — Extracted actionable tasks from analysis results
- **Professional Recommendations** — Relevant resources based on analysis content
- **Markdown Rendering** — Clean, formatted analysis output
- **Copy to Clipboard** — One-click sharing

## Security

- All AI API calls server-side only (keys never exposed)
- Google JWT authentication on all protected endpoints
- Rate limiting (10 requests/minute)
- Content sanitization (DOMPurify)
- CSP headers and HTTPS enforcement

---

**Turn your personal data into powerful self-insights with the intelligence of Claude AI.**
