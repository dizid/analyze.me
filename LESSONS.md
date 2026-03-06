# Lessons Learned - Analyze.me

Hard-won lessons from building this project. Read before making changes.

---

## 1. Auth: Don't Use Clerk for Simple Google-Only Auth

**What happened:** Started with Clerk (email + Google + GitHub), then spent 3 commits debugging Clerk initialization order, CSP blocking, and worker-src issues. Eventually ripped it all out and replaced with direct Google Sign-In.

**Lesson:** If you only need Google auth, use Google Identity Services directly with `google-auth-library` on the backend. Clerk adds complexity, CSP headaches, and a dependency you don't control.

**Commits:** `c1b6ffd` → `2b3470e` → `4d05a57` → `f086470`

---

## 2. Google Sign-In: Use renderButton, Not One Tap / FedCM

**What happened:** First Google Sign-In implementation used `prompt()` / One Tap, which relies on FedCM and third-party cookies. Broke silently in many browsers.

**Lesson:** Use `google.accounts.id.renderButton()` — it's reliable across all browsers and doesn't depend on FedCM or third-party cookie support.

**Commit:** `14d57fa`

---

## 3. CSP Headers: Death by a Thousand Cuts

**What happened:** CSP issues appeared across 5+ commits. Missing `style-src` for Google buttons, missing `connect-src` for Google Identity Services fetch requests, missing `worker-src blob:` for Clerk, missing closing quote in TOML string.

**Lessons:**
- Every third-party service needs specific CSP entries — check their docs
- Google Sign-In needs: `script-src`, `style-src`, `connect-src`, and `frame-src` for `accounts.google.com`
- Test CSP in browser DevTools console — blocked resources show clear errors
- TOML strings with semicolons need careful quoting — validate the file

**Commits:** `2b3470e`, `4d05a57`, `14d57fa`, `0cfc34a`

---

## 4. Don't Hardcode localhost URLs in Environment Variables

**What happened:** `localhost:9999` function URL was set in Netlify env vars during development. It got baked into the production build, causing all API calls to fail in production.

**Lesson:** Use relative URLs (`/.netlify/functions/analyze`) for same-origin API calls. Never put localhost URLs in Netlify env vars — they persist into production builds.

**Commit:** `2b3470e`, `6b9b88c`

---

## 5. Netlify Dev: Use @netlify/vite-plugin, Not Manual Proxy

**What happened:** Started with separate port configs (Vite on 3000, Netlify Functions on 9999) and a Vite proxy. Required `netlify dev` to wrap Vite, which was fragile. Spent 2 commits getting port config right.

**Lesson:** Use `@netlify/vite-plugin` — it emulates Netlify inside Vite's dev server. Run `npm run dev`, not `netlify dev`. No proxy config needed. Functions just work at `/.netlify/functions/*`.

**Commits:** `6d2147c`, `2ddad72`, `c1b6ffd`

---

## 6. Don't Use the Neon Netlify Extension

**What happened:** The Neon Netlify extension creates anonymous databases that break builds and are hard to manage.

**Lesson:** Use a manual `DATABASE_URL` env var pointing to your own Neon project. You keep full control over the database.

---

## 7. Tailwind CSS v4: Version Mismatches Break Silently

**What happened:** `@tailwindcss/vite` was at 4.0.0 while `tailwindcss` updated to 4.1.17. Build failed with cryptic "Cannot convert undefined or null to object" error.

**Lesson:** Keep `tailwindcss` and `@tailwindcss/vite` versions in sync. When updating one, update both. In Tailwind v4, use `@theme {}` blocks, not `tailwind.config.js`.

**Commit:** `e25d5bb`

---

## 8. CORS: Use a Shared Utility, Not Hardcoded Headers

**What happened:** CORS headers were hardcoded differently in each Netlify function. When origin requirements changed, had to fix each function separately. Some got missed, causing 500 errors.

**Lesson:** Create a shared `cors.js` utility in `netlify/functions/utils/` and import it in every function. Single source of truth for allowed origins.

**Commit:** `0cfc34a`

---

## 9. PDF Export Is Unreliable in SPAs — Use Simple Downloads

**What happened:** `html2pdf.js` had rendering issues with the cyberpunk UI (gradients, glassmorphism, complex CSS). Output was broken.

**Lesson:** Skip client-side PDF generation for complex UIs. Offer Markdown and TXT downloads instead — they're reliable, lightweight, and dependency-free.

**Commit:** `4f99298`

---

## 10. API Model Names Get Deprecated Without Warning

**What happened:** `grok-beta` model was deprecated and replaced with `grok-3`. API calls started failing with no clear error message.

**Lesson:** Don't assume model names are stable. When switching AI providers (we later moved from Grok to Claude), plan for model name changes. Hardcode the model in one config location, not scattered across files.

**Commits:** `226469a`, `40b33c8`

---

## 11. Always Validate Env Vars Exist Before Deployment

**What happened:** Missing `DATABASE_URL`, `ALLOWED_ORIGIN`, and `ANTHROPIC_API_KEY` in Netlify env vars caused 500 errors on production functions.

**Lesson:** Check all required env vars are set on the deployment platform before deploying. Add early validation in functions — fail fast with clear error messages instead of cryptic 500s.

**Commit:** `0cfc34a`

---

## 12. Test in Production-Like Environment Early

**What happened:** Many issues (CSP, CORS, hardcoded localhost, missing env vars) only appeared in production. Local dev worked fine because the browser is more permissive and env vars were set locally.

**Lesson:** Added Playwright E2E smoke tests that run against the deployed site. Test pages load, CSP headers are correct, API returns 200, and console has no errors. Catch production issues before users do.

**Commit:** `0cfc34a`

---

## Quick Reference

| Category | Rule |
|----------|------|
| Auth | Google-only? Use GIS directly, skip Clerk |
| CSP | Check each third-party service's required domains |
| URLs | Always relative for same-origin API calls |
| Dev setup | `@netlify/vite-plugin` + `npm run dev` |
| Database | Manual `DATABASE_URL`, no Neon extension |
| Tailwind | Keep v4 package versions in sync |
| CORS | Shared utility, never hardcode per-function |
| Exports | Markdown/TXT over PDF for complex UIs |
| Env vars | Validate existence at function startup |
| Testing | E2E smoke tests against production |
