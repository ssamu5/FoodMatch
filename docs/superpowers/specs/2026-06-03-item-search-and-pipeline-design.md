# Item search + staged search pipeline

Date: 2026-06-03
Author: Max

## Positioning (guides every decision below)

FoodMatch is **not** trying to be a better TheFork on TheFork's terms
(coverage, booking infra, review volume). TheFork is where you *book once
you've decided*. FoodMatch is **how you decide, fast, vibe-led, for young
people who hate scrolling 200 listings**. We complement the booking layer
(WhatsApp CTA today), we do not rebuild it.

Implication: item search must stay **conversational and visual** (Foody
prompt + warm cards), never a TheFork-style search-box-over-a-flat-list.

## Goals

1. **Item/dish search**: a user can type a dish ("paella", "croquetas",
   "ramen") and get the restaurants that serve it, ranked, through the
   existing prompt. No new screen.
2. **Structured menus**: restaurants gain a real `menu: Dish[]` field
   (the field an owner edits after claiming). Populated with deterministic,
   clearly-labeled sample dishes today.
3. **Staged search pipeline**: replace the single `rankRestaurants` call
   with an explicit `filter -> shortlist -> rank -> explain` pipeline, fed
   by a swappable `RestaurantSource`. This is the architecture that lets a
   future large DB do a cheap coarse filter (SQL `WHERE`) before the
   expensive ranking ever runs, so the ranker/AI never scans the whole DB.

## Non-goals (and explicit "no"s)

- **No scraping** of Google Maps / TheFork. Legal (ToS + EU/Spain data
  law), quality (stale/generic), and strategic (coverage is not our
  wedge) reasons. The licensed path is the Google Places API via the
  existing `placesService` seam. A short note for Samuel goes in `docs/`.
- **No second native app.** The existing one-app role split (`/welcome`
  diner vs `/restaurants` partner) is the MVP-correct version. Revisit
  only when restaurant-side features justify a separate binary.
- **No async churn now.** The pipeline is synchronous (seed data is
  in-memory, instant). The `RestaurantSource` interface is shaped so the
  async DB swap later is contained, but we do NOT push async/await into
  the React pages today.
- **No real booking/reservations.** MVP stays WhatsApp.

## Design

### 1. Data model: structured menus

```ts
// types/restaurant.ts
export interface Dish {
  name: string         // "Paella valenciana"
  priceEur?: number    // 14
  tags?: string[]      // ['arroz','tradicional'] or dietary ['vegano']
}
// Restaurant gains:
menu?: Dish[]          // structured menu; restaurant-owned after claim
```

- `scripts/genSeed.mjs` emits 6-10 deterministic dishes per restaurant,
  chosen by cuisine from curated per-cuisine dish pools (same seeded-PRNG
  approach as the restaurant names). ~1,600 dishes total.
- The detail page replaces the cuisine-preset "menu highlights" block
  with a real **Menu** section rendering `menu` (name + price), tagged
  "sample" when not owner-verified (mirrors the existing listing-tier
  honesty pattern).
- `leads.menuHighlightsFor()` is updated to derive from `menu` when
  present, so the WhatsApp lead message and any highlight UI stay correct.

### 2. Item search folded into the prompt

- `FoodIntent` gains `dishes: string[]`.
- `foodIntent.ts`: a dish-keyword pass extracts dish terms. The dictionary
  is derived from the generated menu vocabulary (normalized dish names +
  common aliases, e.g. "burger"/"hamburguesa", "ramen", "croquetas").
  Multi-word and accent-insensitive, matching the existing `normalize()`.
- `ranking.ts`: new `scoreDish` component. A restaurant scores when its
  `menu` (or, fallback, menuHighlights/tags) contains a requested dish.
  Reason string: `serves <Dish>`. Weight slots alongside cuisine so a
  specific dish request is a strong signal without dominating area/budget.
- Results still render as the existing `MatchCard`/`RestaurantCard`. No
  new screen, no flat list.

Scoring weights (rebalanced so total still clamps to 100; dish shares the
"what you want to eat" budget with cuisine):

| Component | Before | After |
|-----------|--------|-------|
| cuisine | 30 | 24 |
| dish (new) | - | 12 |
| area | 20 | 18 |
| budget | 20 | 18 |
| vibe | 15 | 13 |
| dietary | 10 | 10 |
| rating | 5 | 5 |

When no dish is requested, `scoreDish` returns neutral credit so existing
craving queries are unaffected (verified by the existing tests).

### 3. Staged search pipeline

New module `lib/searchPipeline.ts`. Four pure stages + a source seam:

```ts
// The swap seam: SeedSource today, SupabaseSource later.
export interface RestaurantSource {
  all(): Restaurant[]
  find(filter: HardFilter): Restaurant[]   // coarse, becomes SQL WHERE
}

export interface HardFilter {
  cuisines?: Cuisine[]
  dishes?: string[]
  area?: Area | null
  maxSpendEur?: number | null
  openNow?: boolean
  avoidCuisines?: Cuisine[]
}

export interface PipelineDiagnostics {
  total: number       // rows in source
  filtered: number    // after coarse filter
  shortlisted: number // after cap
  ranked: number      // final results
  ms: number
}

export interface PipelineResult {
  results: Restaurant[]
  ranked: RankedResult[]
  diagnostics: PipelineDiagnostics
}

export function runSearchPipeline(
  intent: FoodIntent,
  source: RestaurantSource,
  opts?: { shortlistCap?: number; minScore?: number },
): PipelineResult
```

Stages:
1. **filter** — derive a `HardFilter` from the intent (open-now, avoided
   cuisines, explicitly-requested dish/cuisine, area, budget ceiling) and
   call `source.find()`. **This is the SQL-WHERE seam.** `SeedSource.find`
   does it in memory; a `SupabaseSource.find` would issue a query. If the
   filter is too aggressive and yields too few, it widens (drops the
   softest constraint) so we never return an empty page on a reasonable
   query.
2. **shortlist** — cap candidates to `shortlistCap` (default 150) by a
   cheap pre-score (cuisine/dish/area hit count). No-op at 200 rows; the
   guardrail at 10k. **This is what keeps the expensive ranker from ever
   seeing the whole DB.**
3. **rank** — existing `scoreRestaurant` over only the shortlist;
   `minScore` filter + sort. Today deterministic; an LLM re-ranker would
   slot here and still only see the shortlist.
4. **explain** — `buildMatchExplanation` for the top results.

`SeedSource` (in `lib/searchPipeline.ts` or `lib/sources.ts`) wraps
`SEED_RESTAURANTS`. `api.search` / `api.searchByIntent` are reimplemented
on top of `runSearchPipeline(intent, seedSource)` and keep their current
return shape, so pages and existing tests are unchanged.

### Files touched

- `types/restaurant.ts` — `Dish`, `menu?`
- `types/search.ts` — `FoodIntent.dishes`
- `scripts/genSeed.mjs` + regenerate `data/seedRestaurants.ts` — menus
- `lib/foodIntent.ts` — dish extraction + dictionary
- `lib/ranking.ts` — `scoreDish`, reweight
- `lib/searchPipeline.ts` (new) — stages, `RestaurantSource`, `SeedSource`
- `lib/api.ts` — reimplement search on the pipeline
- `lib/leads.ts` — `menuHighlightsFor` reads `menu`
- `pages/RestaurantDetail.tsx` — real Menu section
- `lib/mvp.test.ts` + new `lib/searchPipeline.test.ts` — coverage
- `docs/` — short "Places API not scraping" note for Samuel

### Testing

- Pipeline: a dish query ("paella") yields paella-serving places top;
  diagnostics show `total > filtered >= shortlisted >= ranked`; widening
  triggers when a filter is too narrow; empty-on-impossible-query is
  graceful.
- Dish parse: "croquetas", "ramen", "burger" populate `intent.dishes`.
- Regression: all existing `mvp.test.ts` pass unchanged (craving flow,
  leads, saved state) after the reweight + pipeline swap.
- `npm run lint`, `npm test`, `npm run build` green.

### Risk

Low-medium. The reweight + pipeline swap touch the core ranker, but the
existing tests pin the craving behaviour, and the pipeline keeps the same
public `api.search` shape. ~1,600 generated dishes are labeled demo data.
The async-later decision is documented, not deferred ambiguously.
