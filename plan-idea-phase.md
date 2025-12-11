# Planning Session: Major Improvements for analyze.me
**Date:** December 10, 2024
**Status:** Ideation & Planning Phase

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

## Current State (What's Working)

### ✅ Completed Features
- Google Docs integration (OAuth + document picker)
- 5 psychological analysis types:
  - Themes & recurring topics
  - Mood & sentiment analysis
  - Goals & progress tracking
  - Strengths & weaknesses assessment
  - Self-improvement suggestions
- Output length control (Summary: 300, Middle: 1300, Long: 3000 tokens)
- PDF export + clipboard copy
- Analysis history (localStorage, last 50 items)
- Cyberpunk UI theme

### 🏗️ Architecture
- **Frontend:** Vue 3 + Vite + Tailwind CSS v4
- **Backend:** Netlify Functions (Grok API proxy)
- **APIs:** Google Drive/Docs, xAI Grok
- **Storage:** localStorage (needs upgrade)
- **Design:** Composables pattern for all business logic

---

## Proposed Improvements

### 1. 🥇 Post-Analysis Actions + Monetization (Priority #1)
**Problem:** Analysis ends with insights. What's next?

**Solution:**
- **Actionable Recommendations:** Extract specific tasks from AI analysis
  - "Schedule therapy session"
  - "Try 10-min meditation daily"
  - "Read 'Feeling Good' by David Burns"
  - "Set weekly journaling reminder"

- **Professional Recommendations (REVENUE MODEL):**
  - **BetterHelp affiliate:** $100-150 per referral
  - **Talkspace:** Therapy platform
  - **Noom:** Wellness coaching
  - **Psychology Today:** Local therapist directory

- **Smart Matching:**
  - Keywords: "depressed", "anxious" → Recommend therapy
  - Keywords: "goals", "productivity" → Recommend coaching
  - Keywords: "relationship" → Recommend couples counseling

- **Ethics:**
  - Clear commission disclosure
  - Free resources alongside paid options
  - Licensed professionals only
  - Never push unnecessarily

**Impact:** Makes app actionable + generates revenue
**Effort:** 2 weeks
**Revenue Potential:** $100-150 per therapy referral

---

### 2. 🥈 Automatic Data Sources (Priority #2)
**Problem:** Only Google Docs supported. Manual input is tedious.

**Solution: 8+ Free APIs (Click, click, click UX)**

**Implemented as 3-click flow:**
1. Click data source tab
2. Click "Connect [Platform]" → OAuth
3. Click "Analyze last 100" → Done

**Available Sources:**

**📧 Gmail API** (Free: 1B calls/day)
- Email sentiment over time
- Communication pattern changes
- Stress indicators from frequency
- Use case: "Your email tone became more stressed this month"

**📅 Google Calendar API** (Free: Unlimited)
- Life event tracking
- Busy period stress correlation
- Work-life balance analysis
- Use case: "80% work events vs 20% personal - rebalance?"

**🎵 Spotify API** (Free with OAuth)
- Music mood analysis
- Genre preference shifts
- Listening patterns (late night = insomnia?)
- Use case: "Shifted to sadder music recently"

**⌚ Apple Health / Google Fit** (Free with OAuth)
- Sleep patterns
- Exercise frequency
- Activity level
- Heart rate variability (stress)
- Use case: "Low activity - physical affects mental health"

**💻 GitHub API** (Free - for developers)
- Commit frequency = work patterns
- Late night commits = burnout
- Passion projects vs work balance

**📝 Notion API** (Free)
- Personal notes/journal
- Todo completion rates
- Project progress

**⏱️ RescueTime API** (Free basic tier)
- Screen time patterns
- Productivity scores
- Social media vs work balance

**🏃 Strava API** (Free)
- Exercise consistency
- Performance trends
- Fitness patterns

**Impact:** Dramatically richer data without user effort
**Effort:** 2-3 weeks for first 3 sources (Gmail, Calendar, Spotify)

---

### 3. 🥉 Twitter Archive + Manual Import (Priority #3)
**Problem:** Twitter API costs $100/month (too expensive)

**Solution: FREE Alternatives**

**Twitter Archive Import:**
- User downloads Twitter data export (Settings → Download archive)
- Upload ZIP/JSON file to app
- Parse tweets → batch analysis
- **Cost:** $0

**Manual Text Import:**
- Universal textarea for any social media
- Copy 100 tweets → paste → analyze
- Works for: Reddit, Discord, LinkedIn, anywhere
- **Cost:** $0

**Instagram (Free API):**
- Instagram Basic Display API
- User's own posts only
- Caption text analysis

**Impact:** Achieves vision without API costs
**Effort:** 1 week

---

### 4. Firebase Cloud Storage (Priority #4)
**Problem:** localStorage limited (5MB, 50 items, no sync)

**Solution: Firebase Firestore**
- Real-time cross-device sync
- 1GB storage (free tier)
- 50K reads/day (free tier)
- Already have Google Sign-in
- Organized per-user

**Migration Path:**
1. Set up Firebase project
2. Create `useFirebaseAuth` composable
3. Create `useFirebaseStorage` composable
4. Migrate `useAnalysisHistory` from localStorage → Firestore
5. Add migration helper for existing users

**Impact:** Professional persistence + enables mobile future
**Effort:** 1-2 weeks

---

### 5. Trend Analysis Dashboard (Priority #5)
**Problem:** Each analysis is isolated, no pattern visibility

**Solution: Longitudinal Insights**

**Features:**
- **Mood Timeline:** Sentiment chart over time
- **Recurring Themes:** Word cloud of frequent topics
- **Goal Progress Tracker:** Mentions over time
- **Emotional Volatility:** Mood stability indicator

**Implementation:**
- Structured metadata extraction:
  ```javascript
  {
    sentimentScore: 0.7,        // -1 to 1
    dominantEmotion: 'hopeful',
    topThemes: ['career', 'health'],
    goalsMentioned: ['fitness']
  }
  ```
- Simple charts (Chart.js)
- New `/dashboard` route

**Impact:** Transforms snapshots into insights
**Effort:** 2-3 weeks

---

### 6. Additional Features (Phase 3+)

**Comparative Analysis:**
- "Compare this month vs last month"
- Side-by-side period comparison
- Highlight differences

**Smart Organization:**
- Auto-tagging analyses
- Search, filter, favorites
- Archive old analyses

**Visual Insights:**
- Mood meter widget
- Journaling streak counter
- Progress bars for goals
- Emotion distribution pie chart

**Data Export:**
- Export as JSON (full data)
- Export as Markdown (readable)
- Export as CSV (spreadsheet)
- Privacy-first data portability

---

## Prioritized Roadmap

### Phase 1: Foundation + Quick Wins (2-3 weeks)
**Goal:** Achieve vision + start revenue

**Week 1:**
- Twitter Archive import (file upload + JSON parser)
- Manual text import (textarea + batch processing)

**Week 2:**
- Post-analysis action items extraction
- Actionable recommendations UI

**Week 3:**
- BetterHelp/Talkspace affiliate integration
- Smart matching logic (keywords → recommendations)

**Deliverables:**
- ✅ Social media analysis (free, no API costs)
- ✅ Actionable insights (not just analysis)
- ✅ Revenue generation ($100-150 per referral)
- ✅ Vision achieved

---

### Phase 2: Automation + Storage (3-4 weeks)
**Goal:** Click, click, click + cross-device sync

**Features:**
- Gmail integration (email sentiment)
- Google Calendar integration (life events)
- Spotify integration (music mood)
- Firebase migration (cloud storage)

**Deliverables:**
- ✅ Automated data collection
- ✅ Professional storage
- ✅ Cross-device sync
- ✅ Richer insights

**Cost:** Firebase free tier (sufficient for MVP)

---

### Phase 3: Intelligence + Visualization (4-5 weeks)
**Goal:** Polish + engagement

**Features:**
- Trend analysis dashboard (charts)
- Comparative analysis (period-over-period)
- Smart organization (tags, search, filters)
- Instagram integration

**Deliverables:**
- ✅ Beautiful visualizations
- ✅ Pattern recognition over time
- ✅ Better history management

---

### Phase 4: Advanced Sources (Optional)
**Goal:** Power user features

- Apple Health / Google Fit
- Notion API
- RescueTime
- GitHub (developer burnout)

**Timeline:** 6-8 weeks
**Value:** Niche appeal

---

## Technical Decisions Made

### ✅ Storage: Firebase Firestore
- Real-time sync
- Free tier sufficient
- Already have Google auth
- Easy migration path

### ✅ Twitter: Archive Import (Not API)
- $0 cost vs $100/month API
- User downloads their data
- Manual paste as backup

### ✅ Monetization: Affiliate Model
- BetterHelp primary ($100-150/referral)
- Talkspace, Noom secondary
- Ethical, disclosed, optional

### ✅ UX Philosophy: Click, Click, Click
- Maximum 3 clicks for any data source
- OAuth auto-flow where possible
- Batch processing by default

### ✅ Data Sources: Start with 3
- Gmail (universal)
- Spotify (unique, engaging)
- Calendar (work-life insights)
- Add more based on demand

---

## Files to Create (Phase 1)

### Data Import:
- `src/components/DataSourceSelector.vue` - Tabbed interface
- `src/components/ManualImport.vue` - Textarea
- `src/components/TwitterArchiveImport.vue` - File upload
- `src/composables/useManualImport.js`
- `src/composables/useTwitterArchive.js`
- `src/config/batchPrompts.js`

### Post-Analysis:
- `src/components/ActionItems.vue` - Task checklist
- `src/components/ProfessionalRecommendations.vue` - Therapist cards
- `src/composables/useActionExtraction.js`
- `src/composables/useRecommendations.js`
- `src/config/affiliates.js` - Links + tracking

### Modifications:
- `src/components/ResultDisplay.vue` - Add new panels
- `src/components/GoogleAuth.vue` - Move to DataSourceSelector
- `src/config/prompts.js` - Enhance for actionable items

---

## Key Metrics to Track (Future)

**Engagement:**
- Daily active users
- Analyses per user
- Data sources connected per user
- Return rate (7-day, 30-day)

**Revenue:**
- Therapy referrals (BetterHelp)
- Conversion rate (analysis → referral)
- Average revenue per user

**Growth:**
- New user signups
- Data source usage distribution
- Most popular analysis types

---

## What We're NOT Doing

❌ Real-time monitoring (no push notifications)
❌ Multi-user features (no social, sharing, collaboration)
❌ Therapist portal (no professional interface)
❌ Mobile apps (web-only, responsive)
❌ Custom NLP models (stick with Grok)
❌ Payment/subscriptions (keep free)
❌ Expensive APIs (Twitter official API)

---

## Next Steps (When We Resume)

1. **Finalize BetterHelp affiliate signup**
   - Register for affiliate program
   - Get tracking links
   - Understand commission structure

2. **Start Phase 1 Development**
   - Begin with Twitter Archive parser
   - Build manual import textarea
   - Test with sample data

3. **Design Post-Analysis UI**
   - Sketch action items component
   - Design therapist recommendation cards
   - Plan smart matching logic

4. **Set up Firebase project**
   - Create Firebase account
   - Configure Firestore
   - Plan migration strategy

---

## Resources & Links

**Affiliate Programs:**
- BetterHelp: https://www.betterhelp.com/affiliates/
- Talkspace: https://www.talkspace.com/affiliates
- Noom: https://www.noom.com/affiliates/

**API Documentation:**
- Gmail API: https://developers.google.com/gmail/api
- Google Calendar API: https://developers.google.com/calendar/api
- Spotify API: https://developer.spotify.com/documentation/web-api
- Instagram Basic Display: https://developers.facebook.com/docs/instagram-basic-display-api

**Firebase:**
- Firebase Console: https://console.firebase.google.com/
- Firestore Docs: https://firebase.google.com/docs/firestore

**Twitter:**
- Download Your Archive: Settings → Your Account → Download an archive of your data

---

## Summary

We've planned a comprehensive evolution of analyze.me that:

✅ Achieves original vision (journals + social media → psychological reports)
✅ Keeps UX simple (click, click, click)
✅ Avoids expensive APIs (free alternatives)
✅ Focuses on post-analysis value (actionable recommendations)
✅ Generates revenue (therapy referrals: $100-150 each)
✅ Enables automation (8+ data sources via OAuth)
✅ Scales professionally (Firebase cloud storage)

**Phase 1 (2-3 weeks) delivers:**
- Social media analysis ✓
- Actionable insights ✓
- Revenue model ✓
- Zero API costs ✓

Ready to implement when you are! 🚀
