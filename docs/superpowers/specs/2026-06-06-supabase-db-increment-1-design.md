# Supabase database, increment 1: restaurants read-path + claims

Date: 2026-06-06
Author: Max

## Decisions already made (brainstorm)

- **Stack:** Supabase (managed Postgres + auto REST + RLS). No API server.
  Chosen because it is Postgres underneath (no data-layer lock-in, scales
  past millions), needs no server tier for two founders, and includes
  auth/storage/realtime for later. Retire the stale `backend/` Express
  scaffold (separate cleanup, not this spec).
- **Project:** `tiofurkrxqsnliwppkgc` (eu-west-2 area), in a dedicated
  FoodMatch Supabase account. Credentials in gitignored `frontend/.env`.
- **Increment 1 scope:** restaurants + menus READ path (the foundation),
  plus restaurant **claims** WRITE path. Auth + favourites-sync are the
  NEXT increment and must slot in without rework.
- **RLS model:** public read on restaurants + menus; anon can INSERT a
  claim but never read/update/delete; no client UPDATE/DELETE on
  restaurants. Admin edits via dashboard/service key.
- **Async:** the data source becomes async (real network). Pages get
  `await`. We do NOT fake sync.

## Goal

The app and website read the 200 restaurants + ~1,600 dishes from Postgres
through the existing `RestaurantSource` seam, with a feature flag and seed
fallback; restaurant claim submissions persist to Postgres.

## Schema (Postgres)

Three tables. Snake_case columns (Postgres convention); a mapping layer
converts rows to the app's camelCase `Restaurant` shape so app types are
untouched.

```sql
-- restaurants
create table public.restaurants (
  id            text primary key,          -- keep app slugs' sibling id (r-001)
  slug          text unique not null,
  name          text not null,
  description   text not null default '',
  cuisine       text not null,
  secondary_cuisines text[] not null default '{}',
  tags          text[] not null default '{}',
  vibe          text[] not null default '{}',
  best_for      text[] not null default '{}',
  area          text not null,
  city          text not null default 'Valencia',
  address       text not null default '',
  price_level   int  not null default 2,
  average_spend int  not null default 20,
  rating        numeric(2,1) not null default 4.0,
  review_count  int  not null default 0,
  image_placeholder text not null default 'lime-muted',
  hero_image    text,
  instagram     text,
  phone         text,
  whatsapp      text,
  hours_kind    text not null default 'standard',  -- standard | late | brunch
  vegetarian_friendly boolean not null default false,
  vegan_friendly      boolean not null default false,
  gluten_free_options boolean not null default false,
  is_partner    boolean not null default false,
  created_at    timestamptz not null default now()
);

-- menus (dishes)
create table public.dishes (
  id            bigint generated always as identity primary key,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  name          text not null,
  price_eur     numeric(6,2),
  tags          text[] not null default '{}',
  sort          int not null default 0
);
create index dishes_restaurant_id_idx on public.dishes(restaurant_id);

-- restaurant claim submissions (write path)
create table public.restaurant_claims (
  id            bigint generated always as identity primary key,
  restaurant_slug text,                    -- the listing being claimed, if any
  restaurant_name text not null,
  owner_name    text not null,
  email         text not null,
  phone         text,
  area          text,
  cuisine       text,
  price_band    text,
  menu_link     text,
  has_photos    boolean,
  message       text,
  source        text not null default 'assistant',  -- assistant | form
  created_at    timestamptz not null default now()
);
```

Indexes for the coarse filter (the SQL-WHERE seam): on `cuisine`, `area`,
`average_spend`, plus a GIN index on `secondary_cuisines` for array
containment.

## RLS policies

```sql
alter table public.restaurants       enable row level security;
alter table public.dishes            enable row level security;
alter table public.restaurant_claims enable row level security;

-- public read
create policy "public read restaurants" on public.restaurants for select using (true);
create policy "public read dishes"      on public.dishes      for select using (true);

-- claims: anyone may INSERT, nobody may read/update/delete via the client
create policy "anon insert claims" on public.restaurant_claims for insert with check (true);
-- (no select/update/delete policies => denied for anon/authenticated)
```

No update/delete/insert policies on restaurants/dishes => client cannot
write them. Admin writes happen via the service key (migration/dashboard).

## Code changes (frontend)

1. **Dependency:** add `@supabase/supabase-js`.
2. **`src/lib/supabase.ts`** (new): create the browser client from
   `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Export `supabaseEnabled`
   (both env present) and a typed row->`Restaurant` mapper.
3. **`src/lib/searchPipeline.ts`:** make `RestaurantSource.all()/find()`
   return `Promise`. Update `SeedSource` (wrap returns in `Promise.resolve`).
   Make `runSearchPipeline` async (`await source.find(...)`).
4. **`src/lib/supabaseSource.ts`** (new): `SupabaseSource implements
   RestaurantSource`. `all()` selects restaurants + dishes; `find(filter)`
   issues the coarse query (`.eq('area',...)`, `.lte('average_spend',...)`,
   `.in('cuisine',...)`, dish/cuisine `or` for dish terms) — the real SQL
   WHERE. Maps rows to `Restaurant` (incl. nested `menu`). On any error,
   logs and signals fallback.
5. **`src/lib/api.ts`:** pick the source: `supabaseEnabled ?
   new SupabaseSource() : new SeedSource(SEED_RESTAURANTS)`. If a Supabase
   call throws, fall back to seed for that call (resilience). `search`/
   `searchByIntent` become async. `getRestaurantBySlug/ById/listRestaurants`
   become async too (Supabase reads), keeping seed fallback.
6. **Pages:** add `await`/loading state where these are called
   (`Ask.tsx`, `Results.tsx`, `RestaurantDetail.tsx`, `Saved.tsx`,
   `Home`/browse). Minimal: a loading flag; results render when resolved.
7. **Claims write:** `api.submitRestaurantLead` also inserts into
   `restaurant_claims` when `supabaseEnabled` (best-effort; still records
   locally so the existing flow/Admin keeps working offline).

## Migration (one-time, local, service key)

`scripts/migrateToSupabase.mjs` (Node, reads `frontend/.env`):
- Parse `SEED_RESTAURANTS` (reuse the website's `data.mjs` parser or import
  the TS via a small loader) -> rows.
- Upsert restaurants (chunked), then dishes (delete-then-insert per
  restaurant to stay idempotent). Uses `SUPABASE_SERVICE_ROLE_KEY`
  (bypasses RLS). Re-runnable.
- Verify counts: 200 restaurants, ~1,600 dishes.
- npm script: `db:migrate`.

## Schema application

Apply schema + RLS via the Supabase MCP `apply_migration` against project
`tiofurkrxqsnliwppkgc` (the MCP is authorized to the OLD account though —
if it cannot reach this project, fall back to running the SQL through a
`scripts/applySchema.mjs` using the service key, or paste into the SQL
editor). Spec assumes the SQL is the source of truth either way; store it
in `supabase/schema.sql`.

## Testing

- Unit: `SupabaseSource` mapper (row -> Restaurant) via a mock client.
- Unit: pipeline stays correct with an async source (existing pipeline
  tests adapted to `await`).
- Live smoke: after migration, `getRestaurants()` returns 200 from
  Postgres; a dish query returns rows; claims insert succeeds; with env
  unset, app still works on seed (fallback).
- `npm run lint`, `npm test`, `npm run build` green.

## Out of scope (next increments)

Auth / real sign-in, favourites sync, reviews, orders, Edge Function for
claim spam control, retiring `backend/`, website reading from Supabase
(it can keep building from the seed parser until a later pass).

## Risks

- **Async refactor touches core + pages.** Mitigated: source seam + seed
  fallback keep the app working; existing tests pin ranking behaviour.
- **MCP auth is bound to the old account.** Schema application may need the
  service-key script path. Documented above.
- **Anon key ships in the client.** Correct by design; RLS is the control.
  Service key stays out of all `VITE_` vars and committed code.
