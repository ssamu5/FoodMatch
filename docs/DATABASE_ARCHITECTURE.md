# Database Architecture

This document describes the FoodMatch data model: the production schema defined in
`backend/prisma/schema.prisma`, how it maps to the frontend domain types, and how it
implements Samuel's product direction (dish-first discovery, public listing then claim
then upgrade) and the MVP validation funnel.

## Overview and design conventions

The schema is PostgreSQL via Prisma. It is built around four design goals:

1. Map closely to the frontend domain types in `frontend/src/types/*` so swapping bundled
   seed data for a live API is mechanical, not a rewrite.
2. Model Samuel's BMC revenue streams explicitly (high-intent leads, booking/delivery
   commission, taste insights, premium subscription and guides) plus the approved
   restaurant pricing (Free listing, Pro, Founder cohort, Boost add-on).
3. Capture the public-listing to claim to Pro-upgrade lifecycle.
4. Record the validation funnel (searches, recommendations with evidence, feedback) so the
   kill/continue KPIs are queryable from day one.

Conventions used throughout:

- **Money in cents.** All monetary fields are integer minor units (EUR cents), for example
  `priceCents`, `amountCents`, `commissionCents`. This avoids floating-point drift. The one
  exception is `Dish.priceEur` (a `Float`), which is display-level menu data, not a charge.
- **Postgres arrays.** Multi-value taxonomy fields use native `String[]` arrays
  (`tags`, `vibe`, `dietary`, `reasons`, `warnings`, and so on) rather than join tables.
- **UTC timestamps.** All `DateTime` fields are stored UTC (`@default(now())`,
  `@updatedAt`). The app localises for display.
- **cuid ids.** Every primary key is `String @id @default(cuid())`.
- **snake_case tables.** Each model has `@@map(...)` to a snake_case table name
  (`users`, `restaurants`, `taste_profiles`, and so on). This is the table name the
  Supabase path and any raw SQL must use.

## Domain group: Identity and Profile

Models: `User`, `TasteProfile`.

### User (`users`)

Core fields: `id`, `email` (unique), `passwordHash` (nullable, for OAuth or
Supabase-managed identities), `displayName`, `role` (`UserRole`: DINER, RESTAURATEUR,
ADMIN, default DINER), `emailVerified`, `deviceId`, `createdAt`, `updatedAt`.

`deviceId` is a stable anonymous id captured before signup. It lets pre-auth analytics and
saves be stitched to the account after registration.

Relations: one-to-one `TasteProfile`; one-to-many `Favorite`, `Review`,
`RestaurantClaim`, `Recommendation`, `RecommendationFeedback`, `SearchEvent`,
`AnalyticsEvent`, `GuidePurchase`; plus `ownedRestaurants` (the `RestaurantOwner`
relation back to `Restaurant`).

### TasteProfile (`taste_profiles`)

One-to-one with `User` (`userId` unique, `onDelete: Cascade`). Fields:
`favoriteCuisines`, `preferredAreas`, `dietary`, `vibePreferences` (all `String[]`),
`budgetComfort` (nullable Int, 1 to 4), `marketingOptIn`, `updatedAt`. The array values
correspond to the frontend `Cuisine`, `Area`, and `Vibe` unions.

## Domain group: Restaurants and Listings

Models: `Restaurant`, `Dish`, `Review`, `Favorite`, `RestaurantClaim`.

### Restaurant (`restaurants`)

The central entity. Key field groups:

- **Identity:** `id`, `slug` (unique), `name`, `description`.
- **Discovery taxonomy:** `cuisine` (primary), `secondaryCuisines[]`, `tags[]`, `vibe[]`,
  `bestFor[]`. These mirror the frontend `Cuisine` / `Vibe` unions.
- **Location:** `area`, `city` (default "Valencia"), `address`, `postalCode`, `latitude`,
  `longitude`.
- **Budget and reputation:** `priceLevel` (1 to 4), `averageSpend` (EUR per person),
  `rating` (0 to 5), `reviewCount`, plus cached external reputation `googleRating` and
  `googleReviewCount` (Google Places rating and count only, never review text).
- **Visual identity:** `imagePlaceholder` (gradient seed fallback), `heroImage` (real
  photo once claimed/verified).
- **Contact:** `website`, `instagram`, `phone`, `whatsapp` (published only when verified
  or provided by the restaurant).
- **Dietary flags:** `vegetarianFriendly`, `veganFriendly`, `glutenFreeOptions`.
- **Listing lifecycle and provenance:** `listingStatus` (`ListingStatus`), `source`
  (`ListingSource`), `sourceAttribution`, `isPartner`, `ownerId` / `owner`.

Indexes: `[city, area]`, `[cuisine]`, `[listingStatus]`.

Relations: many `Dish`, `Review`, `Favorite`, `Payment`, `BoostSlot`, `Lead`,
`Recommendation`, `RecommendationFeedback`, `CommissionEvent`; one-to-one `RestaurantClaim`
and `Subscription`; optional `owner` (`User`).

### Dish (`dishes`)

Structured menu item. Fields: `name`, `description`, `priceEur` (Float, nullable),
`category`, `tags[]`, `allergens[]` (EU 14 allergen identifiers when known), `isSignature`.
Allergens are explicit so dietary filtering and the allergen disclaimer have real data to
stand on. Cascades on restaurant delete.

### Review (`reviews`)

First-party reviews (the long-term moat: verified Valencia reviews nobody else has).
Fields: `rating` (1 to 5), `comment`, `visitVerified`, `ownerResponse` (Pro restaurant
public reply). Unique on `[userId, restaurantId]` (one review per user per restaurant).

### Favorite (`favorites`)

Simple join of `userId` and `restaurantId`, unique on `[userId, restaurantId]`.

### RestaurantClaim (`restaurant_claims`)

A restaurateur claiming a public listing. `restaurantId` is unique (one claim per
restaurant). Fields: `status` (reuses `LeadStatus` for the review flow), `contactName`,
`contactEmail`, `contactPhone`, `evidence`, `note`, `createdAt`, `reviewedAt`. Approval is
the act that flips the listing to CLAIMED and sets ownership.

### Listing lifecycle (PUBLIC_BASIC to VERIFIED)

The `ListingStatus` enum encodes Samuel's "public listing then claim then upgrade"
direction directly:

1. **PUBLIC_BASIC.** The restaurant exists automatically, assembled from public data
   (`source = PUBLIC_DATA`), with no owner. It already appears in AI responses and search
   so coverage is complete from day one. This is the free listing tier.
2. **CLAIM_PENDING.** A restaurateur submits a `RestaurantClaim`; the listing awaits
   verification.
3. **CLAIMED.** The claim is approved. `ownerId` is set, the owner can edit, but the
   listing is still on the free plan.
4. **VERIFIED.** The claimed listing is on a paid plan (Pro or Founder). The verified
   badge is shown.

`ListingSource` (PUBLIC_DATA, PARTNER, MANUAL) plus `sourceAttribution` drives the
fairness and attribution copy: a restaurant that did not provide its own data can correct,
claim, or request removal.

## Domain group: Monetisation

Models: `Plan`, `Subscription`, `Payment`, `BoostSlot`, `Lead`, `CommissionEvent`,
`PremiumGuide`, `GuidePurchase`, `InsightAccess`. See `REVENUE_MODEL.md` for the business
side; this section covers the data shapes.

### Plan (`plans`)

Seeded catalog (not user-editable). Fields: `code` (`PlanCode`: FREE, PRO, FOUNDER,
unique), `name`, `priceCents`, `currency` (default EUR), `interval` (`BillingInterval`:
MONTH, YEAR, WEEK), `commissionBps` (basis points, default 0 to honor the no-commission
promise, configurable per cohort), `features` (Json marketing list), `active`.

### Subscription (`subscriptions`)

One-to-one with `Restaurant` (`restaurantId` unique). Fields: `planId`, `status`
(`SubscriptionStatus`: TRIALING, ACTIVE, PAST_DUE, CANCELED, INCOMPLETE),
`founderCohort`, the period and trial dates, `cancelAt`, and Stripe references
`stripeCustomerId` / `stripeSubscriptionId` (populated only once real billing is enabled).

### Payment (`payments`)

Fields: `restaurantId`, optional `subscriptionId`, `kind` (`PaymentKind`: SUBSCRIPTION,
BOOST, PHOTO_SHOOT, GUIDE, ONE_OFF), `amountCents`, `currency`, `status` (`PaymentStatus`:
PENDING, PAID, FAILED, REFUNDED), period dates, `stripePaymentIntentId`, `note`. Indexed on
`restaurantId`.

### BoostSlot (`boost_slots`)

Weekly promoted placement. Fields: `restaurantId`, `postalCode`, `status` (`BoostStatus`:
SCHEDULED, ACTIVE, ENDED, CANCELED), `priceCents` (default 5000 = 50 EUR/week),
`startsAt`, `endsAt`, `paymentId`. Indexed on `[postalCode, status]`. The business rules
(max 3 active per postal code, max 2 visible per AI response, "Promocionado" label) are
enforced in application logic; this table is the source of truth for what is active and
where.

### Lead (`leads`)

Covers the "high-intent leads" and "booking commission" streams plus diner email capture
and restaurateur onboarding. Fields: `type` (`LeadType`: USER, RESTAURANT, HIGH_INTENT,
BOOKING), `status` (`LeadStatus`), optional `restaurantId`, contact fields (`email`,
`name`, `phone`, `message`), `source`, `payload` (Json), `valueCents` (estimated lead
value), `deviceId`. Optional one-to-one `CommissionEvent`. Indexed on `[type, status]`.

### CommissionEvent (`commission_events`)

Realised commission on a confirmed booking or delivery. Fields: `restaurantId`, optional
unique `leadId`, `type` (`CommissionType`: BOOKING, DELIVERY), `grossAmountCents`,
`commissionBps`, `commissionCents`, `status` (`CommissionStatus`: PENDING, CONFIRMED, PAID,
CANCELED). Indexed on `restaurantId`.

### PremiumGuide (`premium_guides`) and GuidePurchase (`guide_purchases`)

`PremiumGuide`: curated Valencia content sold to diners. Fields: `slug` (unique), `title`,
`description`, `city`, `priceCents`, `published`, `content` (Json). `GuidePurchase` records
a sale: `userId`, `guideId`, `amountCents`, `currency`, unique on `[userId, guideId]`.

### InsightAccess (`insight_access`)

Sale of aggregated, anonymised taste insights. Fields: optional `restaurantId`,
`buyerName`, `scope` (for example `ruzafa-demand-q3`), `priceCents`, `currency`, period
dates. No raw personal data is ever sold; see `SECURITY.md`.

## Domain group: Discovery Funnel

Models: `SearchEvent`, `Recommendation`, `RecommendationFeedback`, `AnalyticsEvent`.

### SearchEvent (`search_events`)

One craving search. Fields: `deviceId`, optional `userId`, `rawQuery`, `parsedIntent`
(Json: the FoodIntent the parser produced), `resultCount`. Indexed on `deviceId`.

### Recommendation (`recommendations`)

A single dish/restaurant recommendation with its evidence (the MVP promise: 3 per craving,
each with reasons and any warnings). Fields: optional `searchId` (set null on delete),
`restaurantId`, optional `userId`, `deviceId`, `rank` (1..n), `score` (0 to 100),
`reasons[]` (the "why recommended" evidence shown to the user), `warnings[]` (for example
dietary caveats), `cravingQuery`. Indexed on `restaurantId`.

### RecommendationFeedback (`recommendation_feedback`)

Diner reaction. Fields: optional `recommendationId` (set null on delete), `restaurantId`,
optional `userId`, `deviceId`, `verdict` (`FeedbackVerdict`: GOOD, BAD, TRIED, SAVED).
Indexed on `[restaurantId, verdict]`.

### AnalyticsEvent (`analytics_events`)

Generic product analytics mirroring the frontend `AnalyticsEventType` union. Fields:
`type` (String), `deviceId`, optional `userId`, `payload` (Json). Indexed on `type` and
`deviceId`.

### How the funnel supports the MVP KPIs

The funnel is wired so each kill/continue KPI is a direct query:

- **Craving submitted.** Every craving is a `SearchEvent` row (`rawQuery`,
  `parsedIntent`, `resultCount`). Volume and parse-success rate come straight from this
  table; `AnalyticsEvent` of type `prompt_submitted` and `no_results` corroborate.
- **Save / click.** `RecommendationFeedback` with `verdict = SAVED`, plus `Favorite` rows
  and `AnalyticsEvent` types `restaurant_saved`, `restaurant_opened`, and the various
  `outbound_*_clicked` events, measure engagement per recommendation.
- **"Matched my craving."** `RecommendationFeedback` with `verdict = GOOD` (positive
  match) versus `BAD`, joined back through `recommendationId` to the originating
  `SearchEvent`, gives a match-quality rate per craving type. `TRIED` captures real-world
  follow-through.

Because `Recommendation` stores `score`, `reasons`, and `warnings` alongside the verdict,
you can correlate evidence quality with feedback, which is the core validation loop.

## Frontend type to Prisma model mapping

| Frontend type (`src/types/*`) | Prisma model | Notes on shape differences |
|---|---|---|
| `Restaurant` (`restaurant.ts`) | `Restaurant` | Frontend uses camelCase; DB/Supabase rows are snake_case (`secondary_cuisines`, `best_for`, `price_level`). Frontend `cuisine` is a typed `Cuisine` union; DB stores a plain `String`. Frontend `opening: OpeningInfo` is rebuilt client-side from a coarse `hours_kind` in the Supabase path; the Prisma model has no opening field yet. Frontend `menuHighlights` is a convenience list with no direct column. |
| `Dish` (`restaurant.ts`) | `Dish` | Frontend `Dish` is light (`name`, `priceEur`, `tags`). Prisma `Dish` adds `description`, `category`, `allergens[]`, `isSignature`, and the `restaurantId` FK. |
| `TasteProfile` (`profile.ts`) | `TasteProfile` | Close match. Frontend `dietary` is `('vegetarian' \| 'vegan' \| 'gluten-free')[]`; DB stores `String[]`. Frontend carries an `email` for weekly picks plus `updatedAt`; the DB models marketing capture via `marketingOptIn` and the `User.email` / `Lead` path. |
| `Account` (`profile.ts`) | `User` | Frontend `Account` is an on-device pilot stub (`displayName`, `email`, `createdAt`). It maps to `User` once real auth lands; `User` adds `role`, `passwordHash`, `emailVerified`, `deviceId`. |
| `UserLead` (`profile.ts`) | `Lead` (`type = USER`) | `source` values (`profile_email`, `home_email`) map to `Lead.source`. |
| `RestaurantLead` (`profile.ts`) | `Lead` (`type = RESTAURANT`) | Onboarding-assistant extras (`cuisine`, `priceBand`, `menuLink`, `hasPhotos`) land in `Lead.payload` (Json). The eventual claim is a separate `RestaurantClaim`. |
| `AnalyticsEvent` / `AnalyticsEventType` (`profile.ts`) | `AnalyticsEvent` | `type` is the union value stored as a String. `payload` is `Record<string, unknown>` in the frontend, `Json` in the DB. |
| (no frontend type yet) | `Recommendation`, `RecommendationFeedback`, `SearchEvent`, `Plan`, `Subscription`, `Payment`, `BoostSlot`, `CommissionEvent`, `PremiumGuide`, `GuidePurchase`, `InsightAccess`, `Review`, `Favorite`, `RestaurantClaim` | Backend-only for now; these back features not yet surfaced in the seed-data frontend. |

## Migrations and seed

These commands require a running Postgres instance and a valid `DATABASE_URL` (see
`backend/.env.example`).

- Create and apply the first migration during development:

  ```bash
  npx prisma migrate dev --name init
  ```

- Push the schema to the database without creating a migration file (fast iteration on a
  throwaway dev DB):

  ```bash
  npx prisma db push
  ```

- Seed plans, sample restaurants, and demo data:

  ```bash
  npm run db:seed
  ```

Run these from the `backend/` directory. `migrate dev` is the path of record for anything
that will reach production; `db push` is for local prototyping only.

## Two data backends

There are two data paths and they must be kept in sync:

1. **Production path: backend Express + Prisma + Postgres.** This is the source of truth
   and the eventual API the frontend will call. The schema in
   `backend/prisma/schema.prisma` defines it.
2. **Frontend path: bundled seed data or Supabase (env-gated).** The frontend currently
   runs on bundled seed data. When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are
   both set, it reads live data from Supabase via `SupabaseSource` (see
   `frontend/src/lib/supabase.ts`); otherwise it falls back to seed data.

The Supabase tables use the same snake_case names as the Prisma `@@map` values and the
same column shapes (see `rowToRestaurant` in `frontend/src/lib/supabase.ts` and the RLS
policies in `SUPABASE_RLS.sql`). When the Prisma schema changes, the Supabase tables and
the `RestaurantRow` mapping must be updated to match, or the two backends will drift.
