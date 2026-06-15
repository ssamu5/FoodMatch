# Security

Security model and hardening plan for the FoodMatch MVP (Valencia-first dish-discovery
app: React/Vite/Tailwind/Capacitor frontend, Express + Prisma/Postgres backend, optional
env-gated Supabase, static bilingual marketing website).

## Threat model summary

The MVP workshop explicitly flagged three risk classes for an app of this shape:

1. **Exposed keys.** A client bundle and a public marketing site ship to every user. Any
   secret committed to the repo or prefixed for client bundling is effectively public.
   The split between client-safe and server-only secrets is the single most important
   boundary to get right.
2. **Weak access rules.** Anonymous reads are fine for public restaurant data, but writes
   (reviews, favorites, claims, profiles) and reads of personal data must be locked to the
   owning user. With Supabase, this is enforced by Row Level Security, not by the client.
3. **AI hallucinations.** Recommendations and parsed cravings are generated. They can be
   wrong, and they can assert dietary or allergen facts that are not true. This is both a
   trust risk and a liability risk (see the allergen disclaimer below).

Secondary concerns: injection on auth and search inputs, brute-force on auth endpoints,
overly permissive CORS, and privacy/RGPD obligations around taste data and the
public-listing model.

## Auth boundaries

- **Backend JWT.** The Express API issues a JWT on login with a 7-day expiry. Protected
  routes verify the token. There is no refresh-token rotation in the MVP; a 7-day window
  is the trade-off.
- **Passwords.** Stored as bcrypt hashes with a cost factor of 10 rounds. The `User`
  model holds `passwordHash` (nullable, because OAuth and Supabase-managed identities have
  no local password). Plaintext passwords are never logged or stored.
- **JWT_SECRET production requirement.** `JWT_SECRET` must be set from a strong random
  value in production. The development default in `backend/.env.example`
  (`your_super_secret_jwt_key_change_this_in_production`) is a placeholder only. Production
  startup must fail (not silently fall back to a default) if `JWT_SECRET` is unset or
  equal to the placeholder.
- **Supabase anon key is public by design.** `VITE_SUPABASE_ANON_KEY` is meant to ship in
  the client. It grants only what Row Level Security allows. Security on the Supabase path
  is enforced entirely by RLS policies (see `SUPABASE_RLS.sql`), never by hiding the key.
- **Service role key is server-only.** `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and must
  never be bundled. It is intentionally not `VITE_` prefixed so Vite cannot inline it into
  client code. It is used only by server-side scripts such as the one-time
  `scripts/migrateToSupabase.mjs` data load.

### The VITE_ prefix rule

Vite only exposes environment variables prefixed with `VITE_` to client code. The rule is:

- Safe to ship to the client (may be `VITE_`): `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY`.
- Server-only (must NOT be `VITE_` prefixed, must never appear in client code):
  `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `DATABASE_URL`, `STRIPE_API_KEY`,
  `OPENAI_API_KEY`.

Treat the appearance of any server-only secret with a `VITE_` prefix as a P0 bug.

## Secrets management

- `.env` files are gitignored. `.env.example` files ship placeholders only, never real
  values.
- Client-safe secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Server-only secrets: `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `DATABASE_URL`,
  `STRIPE_API_KEY`, `OPENAI_API_KEY`.
- In production, inject secrets via the host's environment or secret manager, not via a
  committed file.
- If a secret is ever committed, rotate it. Removing it from a later commit does not
  remove it from git history.

## Input validation and rate limiting

Validation (all auth and search inputs):

- Validate email format and normalise case before lookup.
- Enforce a minimum password length (at least 8 characters) and reject empty or
  whitespace-only fields.
- Validate and bound search and craving inputs (length cap, strip control characters)
  before they reach the parser or the LLM.
- Use Prisma's parameterised queries (the default) for all DB access. Never build SQL by
  string concatenation.

Rate limiting (plan):

- Auth endpoints (login, register, password reset): roughly 10 requests per 15 minutes
  per IP and per account.
- General API: roughly 100 requests per 15 minutes per IP.
- In production, back the limiter with a shared store (Redis) so limits hold across
  multiple instances. An in-memory limiter is acceptable only for a single-process dev
  setup.

CORS:

- Restrict allowed origins to the known frontend and marketing-site origins in production.
- Do not use a wildcard origin with credentials in production.

## Authorization model

Roles come from `User.role` (`DINER`, `RESTAURATEUR`, `ADMIN`).

- **Diners.** Read public restaurant and dish data. Create and edit only their own
  `Favorite`, `Review`, `RecommendationFeedback`, and `TasteProfile` rows. Read only their
  own personal data.
- **Restaurateurs.** A restaurateur gains write access to a restaurant only after a
  `RestaurantClaim` is verified and approved, which sets `Restaurant.ownerId`. A
  restaurateur can edit only restaurants where `ownerId` equals their user id. Claims must
  be verified before ownership is granted; an unverified claim grants nothing.
- **Admins.** Approve or reject claims, manage `Plan` records, and perform moderation.
  Admin actions run server-side with appropriate checks.

Key rule: ownership is established by the verified-claim flow, never self-asserted by the
client. On the Supabase path the same rule is enforced by RLS (owner-scoped writes); on
the backend path it is enforced by route middleware checking `ownerId` against the JWT
subject.

## Payments security

- No card data is ever stored by FoodMatch. Stripe handles the card details and PCI scope.
- The database stores only Stripe identifiers: `stripeCustomerId`,
  `stripeSubscriptionId` (on `Subscription`) and `stripePaymentIntentId` (on `Payment`).
- No real charges are possible without `STRIPE_API_KEY`. Until billing is wired, the
  pilot may invoice the first restaurants manually (see `REVENUE_MODEL.md`).
- Stripe webhooks (when enabled) must verify the webhook signature before mutating any
  `Subscription` or `Payment` row.

## Privacy and GDPR/RGPD

- **Lawful basis.** Account data is processed to provide the service (contract).
  Marketing email is sent only with explicit opt-in (`TasteProfile.marketingOptIn`,
  `User`/`Lead` capture). Analytics tied to a `deviceId` should rely on consent where
  required.
- **Data minimisation.** Collect only what the feature needs. The taste profile is small
  by design (cuisines, areas, dietary, vibes, budget comfort).
- **Taste insights are sold aggregated and anonymised only.** The `InsightAccess` stream
  sells demand and trend reports scoped to areas or cuisines (for example
  `ruzafa-demand-q3`). Raw personal data, individual taste profiles, or anything that can
  re-identify a diner is never sold or shared.
- **Public-listing fairness.** Restaurants exist as `PUBLIC_BASIC` listings built from
  public data before any owner is involved. They must be able to correct their data, claim
  the listing, or request removal. `sourceAttribution` records where public data came from.
- **Right to erasure.** A user can request deletion of their account and personal data.
  The schema's `onDelete: Cascade` relations (profile, favorites, reviews, feedback,
  searches, analytics tied to the user) support clean removal of personal records.

## Allergen and dietary disclaimer

This was called out in the workshop as a real MVP liability. Dietary flags and allergen
data are informational. They are sourced from public information or restaurant input and
may be incomplete or out of date. Diners with allergies must always confirm directly with
the restaurant before ordering. FoodMatch does not guarantee allergen safety. AI-generated
recommendations and parsed cravings can be wrong and must never be treated as medical or
allergen-safety advice.

The exact disclaimer copy below should be reused verbatim in the app and on the website.

### Spanish (ES)

> Aviso sobre alergenos y dietas: la informacion sobre alergenos y opciones dieteticas
> (vegetariano, vegano, sin gluten, etc.) es orientativa. Procede de fuentes publicas o de
> los propios restaurantes y puede estar incompleta o desactualizada. Si tienes alergias o
> intolerancias, confirma siempre directamente con el restaurante antes de pedir. FoodMatch
> no garantiza la seguridad frente a alergenos y no se hace responsable de las decisiones
> tomadas a partir de esta informacion.

### English (EN)

> Allergen and dietary notice: information about allergens and dietary options
> (vegetarian, vegan, gluten-free, etc.) is provided for guidance only. It comes from
> public sources or from the restaurants themselves and may be incomplete or out of date.
> If you have allergies or intolerances, always confirm directly with the restaurant before
> ordering. FoodMatch does not guarantee allergen safety and is not responsible for
> decisions made based on this information.

## Hardening checklist

Prioritised P0 (must fix before any real users) to P3 (nice to have).

### P0

- Fail production startup if `JWT_SECRET` is unset or still the placeholder value.
- Confirm no server-only secret is `VITE_` prefixed and none appear in the client bundle.
- Apply the Supabase RLS policies (`SUPABASE_RLS.sql`) before exposing any anon key.
- Confirm `.env` is gitignored and no secrets exist in git history.
- Hash all passwords with bcrypt; never log credentials.

### P1

- Rate-limit auth endpoints (about 10 per 15 min) and general API (about 100 per 15 min).
- Validate all auth and search inputs (email format, password length, input bounds).
- Restrict CORS origins in production.
- Enforce owner-scoped writes (`ownerId`) on both backend and Supabase paths.
- Verify Stripe webhook signatures before mutating billing rows (when billing is enabled).

### P2

- Move the rate limiter to a shared Redis store for multi-instance deployments.
- Add account/data deletion (right to erasure) tooling.
- Add audit logging for admin actions (claim approvals, plan changes).
- Surface the allergen disclaimer wherever dietary or allergen data is shown.

### P3

- Add refresh-token rotation or shorten the JWT lifetime with silent renewal.
- Add anomaly detection on lead and feedback submission to catch spam.
- Periodic dependency and secret scanning in CI.
