# FoodMatch ultracode implementation report

Date: 2026-06-15
Branch: feat/functional-mobile-mvp
Scope: ingest Samuel's inputs (VPC/BMC, MVP workshop, MVP expansion handoff) and turn them into a coherent, runnable product slice: mindmap, UI/UX, signup/login/profile, database architecture, revenue/payment streams, security, and verification. No deploy, no push.

## 1. Starting point (what already existed)

The repo was already a mature MVP, not a greenfield. Before this session it had:

- Frontend (React 18 + Vite + TypeScript + Tailwind + Capacitor): the dish-first craving flow (intent parser, ranking, search pipeline), ~200 Valencia seed restaurants, pages for Welcome/Home/Ask/Results/RestaurantDetail/Saved/Profile/RestaurantPartner/RestaurantSetup/Admin, a custom es/en i18n system with a parity test, an on-device "Account" (name + email, no password), and an optional env-gated Supabase data source with seed fallback.
- Backend (Express + Prisma/Postgres): the old 6-model schema (User/Restaurant/Menu/Review/Favorite/Order), JWT + bcrypt helpers present but auth routes commented out, no payments.
- Website: a polished bilingual static generator (418 pages) with diner/restaurant landings, a claim form, legal stubs, and 200+ SEO restaurant pages.

So Samuel's core asks (public listings from public data, dish-first discovery, a demo profile, the claim/upgrade concept, hero-image cards, i18n) were largely already in place. This session focused on the genuine gaps.

## 2. What this session delivered

### 2.1 Visual mindmap (new)
- `docs/foodmatch-mindmap.html`: a single self-contained, on-brand (Fraunces + Bricolage Grotesque, warm Mediterranean palette) interactive strategy mindmap distilled from the VPC, BMC, and MVP workshop. Central hub plus ten color-coded branches (value prop, segments, jobs/pains/gains, features, MVP scope, validation funnel, revenue streams, listing lifecycle, data/AI architecture, go-to-market). Opens in any browser, no build step. Clicking a branch highlights it; degrades gracefully without JS.

### 2.2 Functional signup / login / profile
- `frontend/src/lib/auth.ts` (new): one async auth seam with two providers. `supabase` is used automatically when `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set (real Supabase Auth signUp/signInWithPassword/signOut). `demo` is the default pilot/offline provider: email + password accounts on-device, passwords hashed with SHA-256 + per-user salt via Web Crypto (a usability stand-in, explicitly NOT a real security boundary). On success it keeps the legacy on-device `Account` in sync so the rest of the app is untouched.
- `frontend/src/components/AuthForm.tsx` (new): reusable Sign in / Create account form (email, password, name on signup), localized errors, busy state, provider note.
- `frontend/src/pages/Profile.tsx`, `frontend/src/pages/Welcome.tsx`: the old name-only account flow is replaced by AuthForm; sign out now calls `logout()` (clears Supabase session if present).
- Backend production path (finished from the crashed agent's work):
  - `src/controllers/authController.ts`: register / login / me. Generic 401 on login to avoid user enumeration; ADMIN cannot be self-assigned; full input validation.
  - `src/services/userService.ts`: createUser (bcrypt), findByEmail/findById, toSafeUser (strips passwordHash).
  - `src/controllers/userController.ts`: getProfile / upsertProfile (taste profile).
  - `src/routes/authRoutes.ts`, `src/routes/userRoutes.ts`, wired in `src/server.ts`.
  - `src/middleware/auth.ts`: JWT secret resolved once; fatal if missing in production (no hardcoded fallback in prod).

### 2.3 Database architecture (new schema + docs + seed)
- `backend/prisma/schema.prisma` (rewritten): 20 models covering every entity requested. Identity/profile (User, TasteProfile), restaurants/listings (Restaurant with the PUBLIC_BASIC to VERIFIED lifecycle, Dish with allergens, Review, Favorite, RestaurantClaim), monetisation (Plan, Subscription, Payment, BoostSlot, Lead, CommissionEvent, PremiumGuide, GuidePurchase, InsightAccess), and the discovery funnel (SearchEvent, Recommendation with reasons/warnings, RecommendationFeedback good/bad/tried/saved, AnalyticsEvent). Money in integer cents, Postgres arrays, cuid ids. Validates and generates cleanly.
- `backend/prisma/seed.ts` (rewritten): idempotent upsert seed for the three plans (FREE 0, FOUNDER 6900, PRO 9900 cents) and six Valencia restaurants with dishes/allergens, plus one active Pro subscription to demonstrate the monetisation path.
- `backend/prisma/migrations/README.md` (new): how to create the initial migration / db push / seed.
- `docs/DATABASE_ARCHITECTURE.md` (new): full model reference, the frontend-type to Prisma-model mapping, listing lifecycle, and the discovery funnel to KPI mapping.

### 2.4 Revenue / payment streams (schema + UI + docs)
- `frontend/src/pages/RestaurantPartner.tsx`: new Plans and pricing section (Free public listing 0, Founder 69 EUR/mo highlighted, Pro 99 EUR/mo, Boost 50 EUR/week add-on with the "Promocionado" + max-3-per-postal-code rules, and the 0% commission promise). Localized in both languages, mapped to the Plan/Subscription/Payment/BoostSlot models.
- `docs/REVENUE_MODEL.md` (new): pricing tiers, the BMC streams (high-intent leads, booking/delivery commission at 0 bps to honor the no-commission promise but configurable, taste insights aggregated only, premium guides), the not-yet-enabled Stripe flow, and Valencia revenue math.
- No real charges: `STRIPE_API_KEY` is reserved and unused; the pilot can invoice the first restaurants manually.

### 2.5 Security (docs + hardening)
- `docs/SECURITY.md` (new): MVP threat model, auth boundaries, secrets split (what is safe in the client vs server-only), validation + rate-limit plan, the claim-based authorization model, payments/PCI posture, GDPR/RGPD, the allergen disclaimer (verbatim ES + EN), and a P0 to P3 hardening checklist.
- `docs/SUPABASE_RLS.sql` (new): Row Level Security policies for the diner-facing tables that make the public anon key safe to ship.
- Hardening applied: `backend/src/lib/validation.ts` (dependency-free validators), `backend/src/middleware/rateLimit.ts` (in-memory fixed-window limiter; 10/15min on auth, 100/15min general; documents the Redis requirement for production), `app.set('trust proxy', 1)`, and the fatal-in-production JWT secret.
- Allergen/dietary disclaimer surfaced in `frontend/src/pages/RestaurantDetail.tsx` (both locales), addressing the dietary segment and the liability the MVP workshop flagged.

## 3. Verification outputs

Frontend (`/Users/max/Projects/FoodMatch/frontend`):
- `npm run lint` (tsc --noEmit): pass, no errors.
- `npm test` (vitest): 7 files, 32 tests passed (includes the es/en locale parity test).
- `npm run build` (vite): success. Pre-existing single-chunk size warning (~709 kB) from the ~200-restaurant bundled seed; not introduced here.

Backend (`/Users/max/Projects/FoodMatch/backend`):
- `npx prisma validate` + `npx prisma generate`: schema valid, client generated.
- `npm run build` (tsc): pass.
- `prisma/seed.ts` typecheck: pass.
- Runtime smoke test: bcrypt 6 hash/compare correct, JWT round-trip works, validation works.
- `npm audit`: 0 vulnerabilities (see dependency fixes below).

Website (`/Users/max/Projects/FoodMatch/website`):
- `npm run build`: 418 pages + sitemap built.

Repo rules: no em/en dashes in any new or changed file; no Co-Authored-By or Claude/Anthropic attribution added.

### Dependency security fixes (backend)
Starting state had 7 vulnerabilities (4 high, 3 moderate). Applied, all non-breaking for our usage:
- `bcrypt` 5.x to ^6.0.0: removes the high-severity tar / @mapbox/node-pre-gyp chain (55 transitive packages dropped). The hash/compare API is unchanged, verified at runtime.
- `tsx` 3.x to ^4.22.4 (dev dependency): removes the high-severity esbuild dev-server advisory.
- `qs` override ^6.15.2: fixes the moderate qs DoS pulled in transitively by express.
- Result: `npm audit` reports 0 vulnerabilities. Backend build still passes.

## 4. Adversarial audit

A four-dimension audit (security, correctness, repo-rules compliance, product/UX consistency) ran over the changed files as a multi-agent workflow: each dimension produced findings, and every finding was then adversarially verified by a separate skeptic before being accepted. 11 agents, 6 findings confirmed. The compliance dimension confirmed zero issues (no forbidden dashes, no attribution, no leaked secrets). All six confirmed findings were fixed:

1. (security) JWT secret guard incomplete. `resolveSecret()` failed in production only when the secret was empty, not when it was still the committed `.env.example` placeholder. Fixed in `backend/src/middleware/auth.ts`: production now also throws on the placeholder value and on secrets shorter than 32 chars. Verified at runtime (throws on the placeholder under NODE_ENV=production).
2. (security) Login timing side-channel. The missing-user branch returned before running bcrypt, leaking which emails are registered via response time. Fixed: `login()` now runs `bcrypt.compare` against a constant `DUMMY_HASH` (added to `passwordService.ts`) on the missing-user branch so both branches take comparable time.
3. (correctness) Supabase signup with email confirmation. `register()` faked a signed-in session even when Supabase returned no session (confirmation pending). Fixed in `frontend/src/lib/auth.ts`: it now branches on `data.session` and returns a `confirmEmail` result; `AuthForm.tsx` renders a positive "check your inbox" notice (new `auth.confirmEmail` locale string, both languages) instead of bouncing the user in.
4. (correctness) Rate limiter double-counting. The general limiter on `/api` also counted auth requests, burning an IP's general budget. Fixed in `backend/src/server.ts`: the general limiter is now mounted only on the non-auth subtrees; auth uses only the stricter auth limiter.
5. (consistency) Founder pricing drift in `docs/REVENUE_MODEL.md` (said 49 EUR / first 50 / 12 months, from the stale PRICING_PROPOSAL.md) contradicting the shipped UI, locales, and seed (69 EUR / first 100 / 24 months). Fixed the doc to the shipped, canonical terms and recomputed the founder-cohort MRR note.
6. (consistency) `docs/REVENUE_MODEL.md` framed a two-tier offer while the UI and seed have three tiers. Fixed: the doc now lists Founder as its own tier (Free / Founder / Pro) plus the Boost add-on, matching the UI and `seed.ts`.

After the fixes, all verification was re-run: frontend lint/test (32 pass)/build green, backend build green, seed typecheck green, JWT guard verified, no forbidden dashes.

## 5. Remaining production steps (env + infra)

These are intentionally not done in this session (no live infra, no deploy):

1. Provision Postgres and set `backend/.env` `DATABASE_URL`; run `npx prisma migrate dev --name init` then `npm run db:seed`.
2. Set a strong `JWT_SECRET` in production (the server refuses to start without it when `NODE_ENV=production`).
3. To use the Supabase path for the app: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env`, create the tables to match the Prisma shapes, and apply `docs/SUPABASE_RLS.sql` in the Supabase SQL editor. Once wired, switch on Supabase Auth session persistence for cross-reload login.
4. Billing: when ready, set `STRIPE_API_KEY` and implement the customer/subscription/payment-intent flow described in `docs/REVENUE_MODEL.md` (webhooks update Subscription/Payment). The pilot can invoice the first 10 to 20 restaurants manually first.
5. Rate limiting: move the in-memory limiter to a shared store (Redis) before running more than one backend instance.
6. CORS: restrict origins in `backend/src/server.ts` for production (currently open for local dev).
7. Legal pages on the website are still "coming soon" stubs pending lawyer review (`website/src/legal.mjs` `SHOW_FULL`).

## 6. Notes and tradeoffs

- Lean-MVP tension: the MVP workshop notes warn against building auth, dashboards, and payments before validation. This session honors that by making auth functional but lightweight (demo-first, Supabase/backend-ready) and by modeling payments in the schema and UI with NO live Stripe charges. The schema is a design artifact that costs nothing to carry and makes the investor/restaurant story concrete; it does not commit the team to building all of it before validation.
- The frontend still runs entirely on bundled seed data or Supabase; the Express backend is the documented production path but is not yet the app's data source. The shapes are kept in sync (see docs/DATABASE_ARCHITECTURE.md).
- City: the app and website already use Valencia throughout (the older PRICING_PROPOSAL.md still says Alicante; that document is stale and was not the source of truth).
