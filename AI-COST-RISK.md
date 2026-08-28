# AI Cost Risk — RESOLVED (disabled, default-on demo mode)

**Date opened:** 2026-06-19
**Date resolved:** 2026-08-28
**Status:** Disabled — 1 endpoint (`netlify/functions/analyze.js`), default-on demo mode
**Risk level (scanner flag):** Critical 40 — "no authentication on Anthropic-calling function"

## Resolution

The escalation gate from the 2026-06-19 audit (below) was never closed by running the
recommended SQL query against `users`/`analyses`. It has instead been closed directly by
the CEO: on 2026-08-28 the CEO confirmed in conversation that **analyze.me / readmymind.me
is stale and discontinued — not an active product** — despite the real-looking billing
schema and wired-up auth code found during the original audit. The "harden, don't disable"
branch from the original recommendation therefore does not apply. Proceeding to disable per
the original plan.

### What was changed

Added a default-on `DEMO_MODE` flag to `netlify/functions/analyze.js`, matching the pattern
already applied to two other discontinued projects in this portfolio (3PS's
`analyze-decision.mts` and tiktok's `analyze-hook.mts`/`generate-script.mts`/
`optimize-profile.mts`):

- `const DEMO_MODE = (process.env.DEMO_MODE ?? 'true') !== 'false'` — defaults to **on**.
  Anthropic is only called when `DEMO_MODE=false` is explicitly set in Netlify env vars
  (and the site redeployed).
- While `DEMO_MODE` is on, the handler returns a canned markdown analysis (shape-matched to
  the real response: `{ analysis, usage }`, with `usage` zeroed out) instead of calling
  `https://api.anthropic.com/v1/messages`. All existing request handling — CORS, method
  check, per-IP rate limiting, `getUserIdFromHeaders` auth check, model/output_length/
  content-length validation — runs exactly as before; only the paid Anthropic call itself
  is short-circuited.
- The real Anthropic-calling code is untouched and still present in the file, marked with a
  `--- Live implementation below, unreachable while DEMO_MODE=true ---` comment, so it can
  be re-enabled without rewriting anything.
- `netlify/functions/user-sync.js`, `netlify/functions/utils/auth.js`, and the database
  (schema, tables, rows) were **not** touched — this is a code-level guard only.
- `src/tests/analyze-function.test.js` was updated to set `DEMO_MODE=false` in its shared
  `beforeEach`, so the existing test suite keeps exercising the real (now-dormant-by-default)
  Anthropic code path unchanged. Two new tests were added confirming the default-on demo
  path returns a 200 with mock content and never calls `axios.post`.

### How to reverse this (re-enable live AI)

1. In Netlify env vars for this site (`analyzeme11` / `readmymind.me`), set
   `DEMO_MODE=false`.
2. Confirm `ANTHROPIC_API_KEY` is still set (required once `DEMO_MODE=false`).
3. Redeploy — Netlify functions don't pick up env var changes until the next deploy.
4. Curl `/.netlify/functions/analyze` with a valid auth token to confirm it now returns a
   real Claude response.

No code changes are needed to reverse this — flipping the env var and redeploying is
sufficient.

### ⚠️ Flagged, not investigated: possible live Stripe billing

**This was explicitly out of scope for this task and was NOT checked.** The original audit
(below) found `users.tier`, `users.stripe_customer_id`, and a `usage_tracking` table
structured around a free/pro split. If Stripe billing was ever actually wired up and live
for this product, **there may be real customers still being charged monthly for a product
whose AI feature is now a no-op mock** (and which the CEO says is discontinued/stale
regardless). No Stripe access was available in this task to check or cancel anything.
**The CEO should check the Stripe dashboard directly** for any active subscriptions tied to
this product before assuming this is fully wound down.

---

## Original audit (2026-06-19) — preserved for record

**Status at the time:** Escalated for CEO decision — NO changes made to `analyze.js` or any
other code

### Why this was escalated instead of disabled

The task instructions required stopping before disabling anything if there was evidence of
real paying users or revenue. That evidence exists here.

### What was found

1. **Real billing schema** (`db/schema.sql`):
   - `users.tier` — `'free'` or `'pro'`, NOT NULL DEFAULT `'free'`
   - `users.stripe_customer_id` — column exists specifically to link users to Stripe customers
   - `usage_tracking` table — tracks `analysis_count` per `user_id` per month, explicitly
     commented `-- for free tier limits`, which only makes sense if a paid/pro tier exists
     that lifts those limits

2. **Real, wired-up authentication** — not a stub or unused import:
   - `netlify/functions/user-sync.js` — POST endpoint that calls
     `getUserIdFromHeaders(event.headers)` and returns `unauthorized()` (401) if missing,
     then upserts the authenticated user into the `users` table
   - `netlify/functions/utils/auth.js` — shared auth helper used across functions
   - Frontend OAuth integrations: Google, GitHub, Spotify (`useGoogleAuth.js`,
     `useGitHubAuth.js`, `useSpotifyAuth.js`), with `AuthView.vue` as the login screen
   - Schema comment: `-- Clerk user ID` — indicates Clerk is/was the auth provider

3. **Per-user data persistence tied to the Anthropic-calling function**:
   - `analyses` table stores `user_id`, `document_name`, `prompt_used`, `content`, `model`,
     `data_source`, `output_length` for every analysis run — i.e., every call to
     `netlify/functions/analyze.js` (the flagged function) is logged against a real user
     account, not anonymous/throwaway usage

4. **Git activity is not abandoned**: most recent commit (`4ab597e`, "Robust error handling:
   Google API 403s, stale chunks, signOut") is dated 2026-03-08 — about 3 months old, not
   stale on the scale of a dead portfolio project. Commit history shows active bug-fixing on
   auth and API reliability, consistent with a live app, not a frozen demo.

5. **No direct Stripe SDK dependency in `package.json`** — this is the one data point that
   superficially supports the "demo" theory. However, the schema's `stripe_customer_id`
   column and `tier` field strongly suggest billing is (or was) handled via Clerk's billing
   integration or a Stripe webhook living outside this repo (e.g., a Clerk-hosted billing
   page, or a webhook handler not yet located). Absence of the Stripe npm package does not
   rule out paid usage — Clerk can proxy Stripe checkout without the app importing `stripe`
   directly.

### Recommendation at the time: harden, don't disable

If this app does have active `pro` users relying on real AI analysis, disabling the
Anthropic call would break a paid feature for paying customers — a worse outcome than the
cost-risk the scanner flagged. Recommended next steps instead:

1. **Confirm tier/customer state directly in the database** before any code change:
   ```sql
   SELECT count(*) AS total_users,
          count(*) FILTER (WHERE tier = 'pro') AS pro_users,
          count(*) FILTER (WHERE stripe_customer_id IS NOT NULL) AS stripe_linked_users
   FROM users;
   ```
   and
   ```sql
   SELECT count(*) FROM analyses WHERE created_at > now() - interval '30 days';
   ```
   If `pro_users` or `stripe_linked_users` is 0 and recent `analyses` volume is 0, the
   "portfolio demo" theory is back on the table and the original disable plan can proceed
   safely. If either is nonzero, treat this as a live revenue-bearing feature.

   **Note: this query was never run.** The gate was instead closed by a direct CEO
   confirmation on 2026-08-28 that the product is stale/discontinued — see "Resolution"
   above. The Stripe question in particular remains unverified — see the flagged warning
   above.

2. **If live:** add real authentication enforcement to `analyze.js` itself (it currently has
   no auth check per the scanner finding, unlike `user-sync.js` which does call
   `getUserIdFromHeaders`/`unauthorized()`). This closes the actual security gap — anyone
   can currently call the Anthropic-backed endpoint without being a logged-in user at all,
   which is also a direct cost-abuse vector regardless of the billing question.

3. **Add per-user rate limiting** in `analyze.js` using the existing `usage_tracking` table
   pattern, so free-tier abuse can't run up Anthropic spend even with auth in place.

4. **Set Anthropic usage alerts** regardless of outcome (see provider console steps below) —
   this is cheap insurance whether the app is live or not.

### Provider console steps

**Anthropic** (console.anthropic.com -> Plans & Billing): configure usage alerts (notify at
chosen % thresholds of budget). A hard organization-wide monthly spending limit with
Auto-Reload is available on Team/Enterprise plans via Organization Settings. On lower
individual tiers, a true hard stop may not be available -- treat email alerts as your
trigger to manually pause the key if needed.
