# Revenue Model

How FoodMatch makes money in the Valencia pilot, and how each revenue stream maps to the
data model in `backend/prisma/schema.prisma`. This builds on `PRICING_PROPOSAL.md` (an
earlier draft written for Alicante) and the BMC revenue streams in
`docs/SAMUEL_VPC_BMC_2026-06-13.md`. Where this document and that older draft disagree on
the Founder offer, the shipped product (the app UI, the locale strings, and the backend
seed) is the source of truth: the pilot Founder price is 69 EUR/mo for the first 100
restaurants, locked for 24 months.

The headline: three restaurant tiers shown in the app (free public listing, Founder at
69 EUR/mo, and Pro at 99 EUR/mo), an optional weekly Boost add-on, and no commission on
bookings or delivery. Subscription is the core; the other BMC streams are modeled and
staged behind it.

## Restaurant pricing tiers

| Tier | Price | What is included | Models |
|---|---|---|---|
| Free public listing | 0 EUR | Auto-generated listing from public data: name, address, phone, public hours, cuisine, price range. Appears in AI responses and marketplace search. No own photos (placeholder or generic only), no integrated reviews, no editing, no dashboard. Exists so coverage is 100% from day one. | `Restaurant` (`listingStatus = PUBLIC_BASIC`, `source = PUBLIC_DATA`), `Plan` (`code = FREE`, `priceCents = 0`) |
| Founder | 69 EUR/mo for the first 100 restaurants, price locked for 24 months (then 99 EUR/mo). The headline pilot offer, shown as its own highlighted tier in the app. | Everything in Pro (below). | `Plan` (`code = FOUNDER`, `priceCents = 6900`, `interval = MONTH`), `Subscription` (`founderCohort = true`), `Payment` (`kind = SUBSCRIPTION`), `Restaurant` (`listingStatus = VERIFIED`) |
| Pro | 99 EUR/mo. Annual: 990 EUR/yr (two months free). | Everything in Free, plus own photos, Google reputation indicator (rating + count, link to Google), first-party in-app review system with owner replies, full menu with prices, allergens, and auto-translation, extended info, management dashboard, basic analytics, verified badge, email support. No commission on bookings or delivery. | `Plan` (`code = PRO`, `priceCents = 9900`, `interval = MONTH`; annual via `interval = YEAR`, `priceCents = 99000`), `Subscription`, `Payment` (`kind = SUBSCRIPTION`), `Restaurant` (`listingStatus = VERIFIED`) |
| Boost add-on | 50 EUR/week | Pro-only one-off purchase. Priority placement in AI responses and category listings, labeled transparently as "Promocionado". Hard limits: max 3 active slots per postal code, max 2 visible per AI response. | `BoostSlot` (`priceCents = 5000`, `interval` concept = WEEK, scoped by `postalCode`), `Payment` (`kind = BOOST`) |

The Boost business rules (3 per postal code, 2 per AI response, the "Promocionado" label)
are enforced in application logic. `BoostSlot` is the source of truth for what is active
and where; it is indexed on `[postalCode, status]` for exactly this enforcement.

The optional professional photo shoot mentioned in `PRICING_PROPOSAL.md` (about 199 EUR,
once a year) maps to `Payment` (`kind = PHOTO_SHOOT`).

## BMC streams beyond subscriptions

These are the four revenue streams from Samuel's Business Model Canvas. The subscription
tiers above are the live commercial core; the streams below are modeled in the schema and
staged for later.

### High-intent leads

- **What it is.** Selling qualified, high-intent diner leads (and capturing restaurateur
  onboarding leads). A diner expressing strong intent for a specific dish nearby is
  monetisable.
- **How it is modeled.** `Lead` with `type` in (`HIGH_INTENT`, `BOOKING`, `USER`,
  `RESTAURANT`), `valueCents` for the estimated lead value, `status` through the pipeline
  (NEW, CONTACTED, QUALIFIED, WON, LOST), and a flexible `payload`.
- **Current status.** Lead capture for diner email and restaurant onboarding is live in
  the UI (analytics events `user_lead_submitted`, `restaurant_lead_submitted`). Selling
  high-intent leads as a paid product is modeled only.

### Booking and delivery commission

- **What it is.** A commission on confirmed bookings or delivery orders. Currently set to
  0 to honor the approved no-commission promise, but kept configurable so it can be turned
  on per cohort if the strategy changes.
- **How it is modeled.** `Plan.commissionBps` defaults to 0 (basis points per plan).
  Realised commission is recorded as a `CommissionEvent` (`type` BOOKING or DELIVERY,
  `grossAmountCents`, `commissionBps`, `commissionCents`, `status`), optionally linked to
  the originating `Lead`.
- **Current status.** Modeled only; 0 bps everywhere. No commission is charged.

### Taste insights

- **What it is.** Selling aggregated, anonymised demand and trend reports (for example
  cuisine demand for a neighbourhood) to restaurants or partners.
- **How it is modeled.** `InsightAccess` records a sale: `scope` (for example
  `ruzafa-demand-q3`), `priceCents`, optional buyer, and the period covered.
- **Current status.** Modeled only. Critically, only aggregated and anonymised data is
  ever sold; raw personal data and individual taste profiles are never shared (see
  `SECURITY.md`).

### Premium guides

- **What it is.** Curated Valencia content (guides) sold to diners; the premium
  subscription/guides stream from the BMC.
- **How it is modeled.** `PremiumGuide` (catalog: `slug`, `title`, `priceCents`,
  `published`, Json `content`) and `GuidePurchase` (the sale: `userId`, `guideId`,
  `amountCents`, unique per user per guide). Purchases also flow through `Payment`
  (`kind = GUIDE`).
- **Current status.** Modeled only; future stream.

## Stripe integration path (not yet enabled)

Billing is modeled but not wired. No real charges happen without `STRIPE_API_KEY`.

Planned flow when enabled:

1. **Customer.** Create a Stripe customer for a restaurant; store the id in
   `Subscription.stripeCustomerId`.
2. **Subscription.** Create a Stripe subscription for the chosen plan (Pro, Founder, or
   annual); store `Subscription.stripeSubscriptionId` and track lifecycle via
   `Subscription.status` (TRIALING, ACTIVE, PAST_DUE, CANCELED, INCOMPLETE).
3. **Payment intent.** For one-off charges (Boost, photo shoot, guide) create a payment
   intent; store `Payment.stripePaymentIntentId` with the matching `kind`.
4. **Webhooks.** Stripe webhooks update `Subscription` and `Payment` status. The webhook
   signature must be verified before any row is mutated (see `SECURITY.md`).

We store only Stripe identifiers, never card data. Stripe owns the card details and the PCI
scope.

Pilot approach: per `PRICING_PROPOSAL.md`, the first 10 to 20 restaurants may be invoiced
manually to validate willingness to pay before investing in the Stripe integration. This
keeps engineering effort off billing until the model is proven.

## Revenue math (Valencia pilot)

These scenarios follow `PRICING_PROPOSAL.md` with Valencia as the market. Boost revenue
assumes a modest number of restaurants running roughly one boosted week per month.

### Conservative (Year 1)

- 50 Pro at 99 EUR/mo = 4,950 EUR/mo
- ~5 restaurants boosting ~1 week/month = ~250 EUR/mo
- MRR ~5,200 EUR/mo, about 62k EUR ARR

### Target (Year 1)

- 100 Pro at 99 EUR/mo = 9,900 EUR/mo
- ~15 restaurants boosting regularly = ~750 EUR/mo
- MRR ~10,650 EUR/mo, about 128k EUR ARR

### Target (Year 2)

- 250 Pro at 99 EUR/mo = 24,750 EUR/mo
- ~40 restaurants boosting regularly = ~2,000 EUR/mo
- MRR ~26,750 EUR/mo, about 321k EUR ARR

Notes:

- The founder cohort (first 100 at 69 EUR/mo, locked for 24 months) lowers early MRR by
  about 30 EUR per founder restaurant versus full Pro price (roughly 3,000 EUR/mo if all
  100 are active) while those rates are locked, then steps up to 99 EUR/mo.
- Annual prepay (990 EUR/yr) trades two months of revenue for cash up front and lower
  churn.
- Boost has a theoretical ceiling set by capacity: Valencia's active postal codes times 3
  slots times 50 EUR/week. Realistic occupancy is well below the ceiling, higher around
  local festivities.
- All figures assume Valencia only, no expansion, and depend on execution and the
  free-to-Pro conversion rate holding above the ~30% threshold called out in the pricing
  proposal.
