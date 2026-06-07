# Supabase DB Increment 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the 200 restaurants + ~1,600 dishes into Supabase Postgres and have the app read them live through the existing `RestaurantSource` seam (async, with seed fallback), and persist restaurant claim submissions to the DB.

**Architecture:** Snake_case Postgres tables + RLS (public read; insert-only claims). A row→`Restaurant` mapper keeps app types untouched. `RestaurantSource` becomes async; `SupabaseSource` issues the coarse SQL filter; `api.ts` picks Supabase when env is set and falls back to seed on missing-env or error. Schema + migration run via service-key Node scripts (the Supabase MCP is bound to a different account and cannot reach this project).

**Tech Stack:** TypeScript, React 18, Vite, Vitest, `@supabase/supabase-js`, Node (migration scripts), Supabase Postgres.

**Working dir for all commands:** `/Users/max/Projects/FoodMatch/frontend`

**Project:** ref `tiofurkrxqsnliwppkgc`, URL `https://tiofurkrxqsnliwppkgc.supabase.co`. Credentials already in gitignored `frontend/.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

---

## File structure

| File | Responsibility | Action |
|------|----------------|--------|
| `supabase/schema.sql` | DDL + RLS (source of truth) | create |
| `scripts/applySchema.mjs` | apply schema.sql via service key | create |
| `scripts/migrateToSupabase.mjs` | load seed restaurants+dishes via service key | create |
| `src/lib/supabase.ts` | browser client + `supabaseEnabled` + row→Restaurant mapper | create |
| `src/lib/supabaseSource.ts` | `SupabaseSource implements RestaurantSource` | create |
| `src/lib/supabaseSource.test.ts` | mapper + find() unit tests (mock client) | create |
| `src/lib/searchPipeline.ts` | make source + pipeline async | modify |
| `src/lib/searchPipeline.test.ts` | adapt to async | modify |
| `src/lib/api.ts` | async methods, source selection, claim write | modify |
| `src/lib/mvp.test.ts` | adapt any api/pipeline awaits | modify |
| `src/pages/Ask.tsx` | async search via api (loading state) | modify |
| `src/pages/Results.tsx` | async browse via api pipeline | modify |
| `src/pages/RestaurantDetail.tsx` | async getRestaurantBySlug | modify |
| `src/pages/Saved.tsx` | async getRestaurantsByIds | modify |
| `src/pages/Admin.tsx` | async listRestaurants | modify |
| `package.json` | deps + db scripts | modify |

---

## Task 1: Install supabase-js and add db npm scripts

**Files:** Modify `package.json`

- [ ] **Step 1: Install the client**

Run: `npm install @supabase/supabase-js@^2`
Expected: adds to dependencies, no errors.

- [ ] **Step 2: Add db scripts**

In `package.json` `scripts`, after the line `"android:apk": "cd android && ./gradlew assembleDebug"`, add:

```json
    "db:schema": "node scripts/applySchema.mjs",
    "db:migrate": "node scripts/migrateToSupabase.mjs"
```

(Add a comma to the preceding line so JSON stays valid.)

- [ ] **Step 3: Verify**

Run: `npm run lint`
Expected: PASS (tsc unaffected by package.json).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(db): add @supabase/supabase-js and db scripts"
```

---

## Task 2: Schema SQL (tables + RLS)

**Files:** Create `supabase/schema.sql`

- [ ] **Step 1: Write the schema**

Create `supabase/schema.sql`:

```sql
-- FoodMatch schema, increment 1. Idempotent (safe to re-run).
-- Apply with: npm run db:schema  (uses the service role key)

create table if not exists public.restaurants (
  id            text primary key,
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
  hours_kind    text not null default 'standard',
  vegetarian_friendly boolean not null default false,
  vegan_friendly      boolean not null default false,
  gluten_free_options boolean not null default false,
  is_partner    boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.dishes (
  id            bigint generated always as identity primary key,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  name          text not null,
  price_eur     numeric(6,2),
  tags          text[] not null default '{}',
  sort          int not null default 0
);

create table if not exists public.restaurant_claims (
  id            bigint generated always as identity primary key,
  restaurant_slug text,
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
  source        text not null default 'assistant',
  created_at    timestamptz not null default now()
);

create index if not exists dishes_restaurant_id_idx on public.dishes(restaurant_id);
create index if not exists restaurants_cuisine_idx on public.restaurants(cuisine);
create index if not exists restaurants_area_idx on public.restaurants(area);
create index if not exists restaurants_spend_idx on public.restaurants(average_spend);
create index if not exists restaurants_sec_cuisines_idx on public.restaurants using gin(secondary_cuisines);

alter table public.restaurants       enable row level security;
alter table public.dishes            enable row level security;
alter table public.restaurant_claims enable row level security;

drop policy if exists "public read restaurants" on public.restaurants;
create policy "public read restaurants" on public.restaurants for select using (true);

drop policy if exists "public read dishes" on public.dishes;
create policy "public read dishes" on public.dishes for select using (true);

drop policy if exists "anon insert claims" on public.restaurant_claims;
create policy "anon insert claims" on public.restaurant_claims for insert with check (true);
```

- [ ] **Step 2: Commit (no DB call yet)**

```bash
git add supabase/schema.sql
git commit -m "feat(db): schema SQL with RLS (public read, insert-only claims)"
```

---

## Task 3: Apply the schema to Postgres

**Goal:** get `supabase/schema.sql` into the project's Postgres. The Supabase
JS client cannot run multi-statement DDL, and the Supabase MCP is bound to a
different account (verified: it returns "no permission" for this project). So
there are two viable paths; **the controller decides which based on whether
the user provides the DB password.**

**Path A (default, no extra credential): dashboard SQL editor.**

- [ ] **Step A1:** The controller pastes the full contents of
  `supabase/schema.sql` to the user and asks them to run it once in the
  Supabase dashboard → SQL Editor → New query → paste → Run (they are already
  logged in). This is a one-time manual step; it needs no DB password and no
  new code.
- [ ] **Step A2:** Verify the tables exist with the anon key:

```bash
node -e "import('@supabase/supabase-js').then(async ({createClient})=>{const fs=require('fs');const t=fs.readFileSync('.env','utf8');const e=Object.fromEntries([...t.matchAll(/^([A-Z0-9_]+)=(.*)$/gm)].map(m=>[m[1],m[2]]));const s=createClient(e.VITE_SUPABASE_URL,e.VITE_SUPABASE_ANON_KEY);const {error}=await s.from('restaurants').select('id',{head:true,count:'exact'});console.log(error?('NOT READY: '+error.message):'tables exist, RLS read OK')})"
```
Expected: `tables exist, RLS read OK` (zero rows is fine: table just needs to exist and be readable).

**Path B (optional automation, needs DB password): `pg` script.**

Only if the user supplies the project DB password (Supabase dashboard →
Project Settings → Database → Database password) and you set it in `.env` as
`SUPABASE_DB_PASSWORD`. Then:

- [ ] **Step B1:** `npm install -D pg`
- [ ] **Step B2:** Create `scripts/applySchema.mjs`:

```js
// Applies supabase/schema.sql via a direct Postgres connection.
// Needs SUPABASE_DB_PASSWORD in frontend/.env. Run: npm run db:schema
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, '../.env'), 'utf8')
    .split('\n')
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
)
const ref = new URL(env.VITE_SUPABASE_URL).host.split('.')[0]
const pw = env.SUPABASE_DB_PASSWORD
if (!pw) { console.error('Set SUPABASE_DB_PASSWORD in .env'); process.exit(1) }
// Direct connection (port 5432). Host shown in dashboard > Database > Connection.
const client = new pg.Client({
  host: `db.${ref}.supabase.co`,
  port: 5432,
  user: 'postgres',
  password: pw,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
})
await client.connect()
await client.query(readFileSync(resolve(__dirname, '../supabase/schema.sql'), 'utf8'))
await client.end()
console.log('Schema applied.')
```

- [ ] **Step B3:** `npm run db:schema` → expect `Schema applied.` Then run the
  Step A2 verification. If the direct host refuses (IPv6-only on some
  projects), fall back to Path A. Do NOT guess alternate hosts more than once
 : fall back to Path A and move on.

- [ ] **Step 3 (both paths): Commit**

```bash
# Path B only adds the script + dep; Path A adds nothing here.
git add -A scripts/ package.json package-lock.json 2>/dev/null || true
git commit -m "feat(db): schema apply path" --allow-empty
```

---

## Task 4: Migration script + run it

**Files:** Create `scripts/migrateToSupabase.mjs`

- [ ] **Step 1: Write the migration**

Reuse the website's seed parser at `../../website/src/data.mjs`
(`loadRestaurants()` returns plain objects with `slug`, `menu` etc.: VERIFY
it exposes `menu`; if not, parse `src/data/seedRestaurants.ts` for the menu
field). Create `scripts/migrateToSupabase.mjs`:

```js
// One-time load of seed restaurants + dishes into Supabase via service role.
// Idempotent: upsert restaurants, replace dishes per restaurant.
// Run: npm run db:migrate
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const txt = readFileSync(resolve(__dirname, '../.env'), 'utf8')
  const env = {}
  for (const line of txt.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}
const env = loadEnv()
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// Parse the seed TS file directly (no TS import needed).
const seedTxt = readFileSync(resolve(__dirname, '../src/data/seedRestaurants.ts'), 'utf8')
const blocks = seedTxt.split(/\n\s{2}\{\n/).slice(1)
const str = (b, k) => (b.match(new RegExp(`${k}: '((?:[^'\\\\]|\\\\.)*)'`)) || [])[1]?.replace(/\\'/g, "'")
const num = (b, k) => { const m = b.match(new RegExp(`${k}: (-?[0-9.]+)`)); return m ? Number(m[1]) : null }
const bool = (b, k) => { const m = b.match(new RegExp(`${k}: (true|false)`)); return m ? m[1] === 'true' : false }
const arr = (b, k) => { const m = b.match(new RegExp(`${k}: \\[([^\\]]*)\\]`)); return m ? [...m[1].matchAll(/'((?:[^'\\\\]|\\\\.)*)'/g)].map((x) => x[1].replace(/\\'/g, "'")) : [] }

const restaurants = []
const dishesByR = {}
for (const raw of blocks) {
  const b = raw.split(/\n\s{2}\},/)[0]
  const id = str(b, 'id'); const slug = str(b, 'slug')
  if (!id || !slug) continue
  const hoursKind = /brunchHours\(\)/.test(b) ? 'brunch' : /standardOpening\(true\)/.test(b) ? 'late' : 'standard'
  restaurants.push({
    id, slug,
    name: str(b, 'name'),
    description: str(b, 'description') || '',
    cuisine: str(b, 'cuisine'),
    secondary_cuisines: arr(b, 'secondaryCuisines'),
    tags: arr(b, 'tags'),
    vibe: arr(b, 'vibe'),
    best_for: arr(b, 'bestFor'),
    area: str(b, 'area'),
    city: str(b, 'city') || 'Valencia',
    address: str(b, 'address') || '',
    price_level: num(b, 'priceLevel') ?? 2,
    average_spend: num(b, 'averageSpend') ?? 20,
    rating: num(b, 'rating') ?? 4.0,
    review_count: num(b, 'reviewCount') ?? 0,
    image_placeholder: str(b, 'imagePlaceholder') || 'lime-muted',
    instagram: str(b, 'instagram') || null,
    phone: str(b, 'phone') || null,
    hours_kind: hoursKind,
    vegetarian_friendly: bool(b, 'vegetarianFriendly'),
    vegan_friendly: bool(b, 'veganFriendly'),
    gluten_free_options: bool(b, 'glutenFreeOptions'),
    is_partner: bool(b, 'isPartner'),
  })
  // dishes: menu: [{ name: '...', priceEur: N }, ...]
  const menuMatch = b.match(/menu: \[([\s\S]*?)\]/)
  const dishes = []
  if (menuMatch) {
    const items = [...menuMatch[1].matchAll(/\{ name: '((?:[^'\\\\]|\\\\.)*)', priceEur: ([0-9.]+) \}/g)]
    items.forEach((m, i) => dishes.push({ restaurant_id: id, name: m[1].replace(/\\'/g, "'"), price_eur: Number(m[2]), sort: i }))
  }
  dishesByR[id] = dishes
}

console.log(`Parsed ${restaurants.length} restaurants, ${Object.values(dishesByR).reduce((a, d) => a + d.length, 0)} dishes.`)

// Upsert restaurants in chunks
for (let i = 0; i < restaurants.length; i += 100) {
  const chunk = restaurants.slice(i, i + 100)
  const { error } = await supabase.from('restaurants').upsert(chunk, { onConflict: 'id' })
  if (error) { console.error('restaurants upsert error:', error); process.exit(1) }
}
// Replace dishes: delete all then insert (idempotent for a single-source load)
{
  const { error: delErr } = await supabase.from('dishes').delete().neq('restaurant_id', '')
  if (delErr) { console.error('dishes delete error:', delErr); process.exit(1) }
  const allDishes = Object.values(dishesByR).flat()
  for (let i = 0; i < allDishes.length; i += 500) {
    const chunk = allDishes.slice(i, i + 500)
    const { error } = await supabase.from('dishes').insert(chunk)
    if (error) { console.error('dishes insert error:', error); process.exit(1) }
  }
}

const { count: rCount } = await supabase.from('restaurants').select('*', { count: 'exact', head: true })
const { count: dCount } = await supabase.from('dishes').select('*', { count: 'exact', head: true })
console.log(`DB now has ${rCount} restaurants, ${dCount} dishes.`)
```

- [ ] **Step 2: Run it (after Task 3 schema exists)**

Run: `npm run db:migrate`
Expected: `Parsed 200 restaurants, ~1600 dishes.` then `DB now has 200 restaurants, ~1600 dishes.`

- [ ] **Step 3: Spot-check via a query**

Run:
```bash
node -e "import('@supabase/supabase-js').then(async ({createClient})=>{const fs=require('fs');const t=fs.readFileSync('.env','utf8');const e=Object.fromEntries([...t.matchAll(/^([A-Z0-9_]+)=(.*)$/gm)].map(m=>[m[1],m[2]]));const s=createClient(e.VITE_SUPABASE_URL,e.VITE_SUPABASE_ANON_KEY);const {data,error}=await s.from('restaurants').select('slug,name,cuisine').limit(3);console.log(error||data)})"
```
Expected: 3 rows printed using the ANON key (proves public read RLS works).

- [ ] **Step 4: Commit**

```bash
git add scripts/migrateToSupabase.mjs
git commit -m "feat(db): one-time seed -> Supabase migration script"
```

---

## Task 5: Browser client + row mapper

**Files:** Create `src/lib/supabase.ts`

- [ ] **Step 1: Write the client + mapper**

Create `src/lib/supabase.ts`:

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Restaurant, Cuisine, Area, Dish } from '../types/restaurant'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseEnabled = Boolean(url && anon)

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url as string, anon as string, { auth: { persistSession: false } })
  : null

// The shape rows come back in (snake_case), with optional nested dishes.
export interface RestaurantRow {
  id: string
  slug: string
  name: string
  description: string
  cuisine: string
  secondary_cuisines: string[]
  tags: string[]
  vibe: string[]
  best_for: string[]
  area: string
  city: string
  address: string
  price_level: number
  average_spend: number
  rating: number
  review_count: number
  image_placeholder: string
  hero_image: string | null
  instagram: string | null
  phone: string | null
  whatsapp: string | null
  hours_kind: string
  vegetarian_friendly: boolean
  vegan_friendly: boolean
  gluten_free_options: boolean
  is_partner: boolean
  dishes?: Array<{ name: string; price_eur: number | null; tags: string[] | null; sort: number }>
}

export function rowToRestaurant(row: RestaurantRow): Restaurant {
  const menu: Dish[] | undefined = row.dishes && row.dishes.length
    ? [...row.dishes].sort((a, b) => a.sort - b.sort).map((d) => ({
        name: d.name,
        priceEur: d.price_eur ?? undefined,
        tags: d.tags ?? undefined,
      }))
    : undefined
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    cuisine: row.cuisine as Cuisine,
    secondaryCuisines: (row.secondary_cuisines as Cuisine[]) ?? [],
    tags: row.tags ?? [],
    vibe: row.vibe as Restaurant['vibe'],
    bestFor: row.best_for ?? [],
    area: row.area as Area,
    city: row.city,
    address: row.address,
    priceLevel: row.price_level as Restaurant['priceLevel'],
    averageSpend: row.average_spend,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    imagePlaceholder: row.image_placeholder,
    heroImage: row.hero_image ?? undefined,
    instagram: row.instagram ?? undefined,
    phone: row.phone ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    menu,
    // opening: omitted; hours_kind drives display elsewhere. Keep undefined
    // so isOpenAt treats it as "unknown" (open). A later increment can map
    // hours_kind back to an OpeningInfo if needed.
    vegetarianFriendly: row.vegetarian_friendly,
    veganFriendly: row.vegan_friendly,
    glutenFreeOptions: row.gluten_free_options,
    isPartner: row.is_partner,
  }
}
```

NOTE on `opening`: the seed objects carry an `opening` schedule used by
`isOpenAt`. Rows store only `hours_kind`. For increment 1, leaving `opening`
undefined makes `isOpenAt` return "unknown" → treated as open (the open-now
filter simply won't exclude DB rows). This is acceptable and documented; a
later increment can reconstruct `OpeningInfo` from `hours_kind`. The mapper
must compile against the real `Restaurant`/`Dish` types: if a required
field is missing, add it from the row (do not cast away required fields).

- [ ] **Step 2: Verify it compiles**

Run: `npm run lint`
Expected: PASS. If TS complains a `Restaurant` field is required and missing, fix the mapper to supply it (check `src/types/restaurant.ts` for required vs optional).

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat(db): supabase browser client + row->Restaurant mapper"
```

---

## Task 6: Make RestaurantSource + pipeline async

**Files:** Modify `src/lib/searchPipeline.ts`, `src/lib/searchPipeline.test.ts`

- [ ] **Step 1: Make the interface + SeedSource async**

In `src/lib/searchPipeline.ts`, change the `RestaurantSource` interface:

```ts
export interface RestaurantSource {
  all(): Promise<Restaurant[]>
  find(filter: HardFilter): Promise<Restaurant[]>
}
```

Change `SeedSource` to async:

```ts
export class SeedSource implements RestaurantSource {
  constructor(private rows: Restaurant[]) {}
  async all(): Promise<Restaurant[]> {
    return this.rows
  }
  async find(filter: HardFilter): Promise<Restaurant[]> {
    return this.rows.filter((r) => matchesFilter(r, filter))
  }
}
```

- [ ] **Step 2: Make runSearchPipeline async**

Change the signature to `export async function runSearchPipeline(...): Promise<PipelineResult>` and `await` the two source calls. The body becomes:

```ts
export async function runSearchPipeline(
  intent: FoodIntent,
  source: RestaurantSource,
  opts: { shortlistCap?: number; minScore?: number } = {},
): Promise<PipelineResult> {
  const start = Date.now()
  const allRows = await source.all()
  const total = allRows.length
  const cap = opts.shortlistCap ?? 150
  const minScore = opts.minScore ?? 10

  let candidates = await source.find(hardFilterFromIntent(intent))
  const filtered = candidates.length

  const widened = candidates.length < MIN_CANDIDATES
  if (widened) {
    candidates = allRows
  }

  const shortlist =
    candidates.length > cap
      ? [...candidates].sort((a, b) => cheapScore(b, intent) - cheapScore(a, intent)).slice(0, cap)
      : candidates
  const shortlisted = shortlist.length

  const rankedResults = rankRestaurants(intent, shortlist, {
    hardFilterOpenNow: intent.mustBeOpenNow,
    minScore,
  })

  const byId = new Map(shortlist.map((r) => [r.id, r]))
  const results = rankedResults.map((rr) => byId.get(rr.restaurantId)).filter((x): x is Restaurant => Boolean(x))

  return {
    results,
    ranked: rankedResults,
    diagnostics: { total, filtered, shortlisted, ranked: results.length, ms: Date.now() - start, widened },
  }
}
```

(Note: now calls `source.all()` once up front and reuses it for widening, avoiding a double call.)

- [ ] **Step 3: Update the pipeline tests to await**

In `src/lib/searchPipeline.test.ts`, every `runSearchPipeline(...)` call must be `await`ed and its `it(...)` callback made `async`. Example for the first test:

```ts
  it('reports per-stage diagnostics, never expanding total', async () => {
    const intent = parseFoodIntent('tapas')
    const { diagnostics } = await runSearchPipeline(intent, source)
    expect(diagnostics.total).toBe(SEED_RESTAURANTS.length)
    expect(diagnostics.filtered).toBeLessThanOrEqual(diagnostics.total)
    expect(diagnostics.shortlisted).toBeLessThanOrEqual(diagnostics.total)
    expect(diagnostics.ranked).toBeLessThanOrEqual(diagnostics.shortlisted)
    expect(diagnostics.widened).toBe(false)
  })
```

Apply the same `async`/`await` change to ALL tests in the file (the dish-query test, the cap test, the widen test, the nigiri test). `source` is still `new SeedSource(SEED_RESTAURANTS)`.

- [ ] **Step 4: Run pipeline tests**

Run: `npm test -- searchPipeline`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/searchPipeline.ts src/lib/searchPipeline.test.ts
git commit -m "refactor(search): make RestaurantSource + pipeline async"
```

---

## Task 7: SupabaseSource

**Files:** Create `src/lib/supabaseSource.ts`, `src/lib/supabaseSource.test.ts`

- [ ] **Step 1: Write the failing test (mock client)**

Create `src/lib/supabaseSource.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { SupabaseSource } from './supabaseSource'
import type { RestaurantRow } from './supabase'

// Minimal mock of the supabase query builder for all()/find().
function mockClient(rows: RestaurantRow[]) {
  const builder: any = {
    _rows: rows,
    select() { return this },
    eq() { return this },
    lte() { return this },
    in() { return this },
    or() { return this },
    then(resolve: any) { return resolve({ data: this._rows, error: null }) },
  }
  return { from: () => builder } as any
}

const sampleRow: RestaurantRow = {
  id: 'r-001', slug: 'taberna-pepe', name: 'Taberna Pepe', description: 'Tapas spot',
  cuisine: 'Spanish tapas', secondary_cuisines: [], tags: ['tapas'], vibe: ['lively'], best_for: ['sharing'],
  area: 'Ruzafa', city: 'Valencia', address: 'Calle 1', price_level: 2, average_spend: 20,
  rating: 4.5, review_count: 100, image_placeholder: 'lime-warm', hero_image: null,
  instagram: null, phone: null, whatsapp: null, hours_kind: 'standard',
  vegetarian_friendly: true, vegan_friendly: false, gluten_free_options: false, is_partner: true,
  dishes: [{ name: 'Croquetas', price_eur: 8, tags: [], sort: 0 }],
}

describe('SupabaseSource', () => {
  it('maps rows to Restaurant with nested menu', async () => {
    const src = new SupabaseSource(mockClient([sampleRow]))
    const all = await src.all()
    expect(all).toHaveLength(1)
    expect(all[0].name).toBe('Taberna Pepe')
    expect(all[0].cuisine).toBe('Spanish tapas')
    expect(all[0].menu?.[0]).toEqual({ name: 'Croquetas', priceEur: 8, tags: undefined })
    expect(all[0].isPartner).toBe(true)
  })

  it('returns rows from find() (filter applied server-side)', async () => {
    const src = new SupabaseSource(mockClient([sampleRow]))
    const rows = await src.find({ cuisines: ['Spanish tapas'] })
    expect(rows).toHaveLength(1)
    expect(rows[0].slug).toBe('taberna-pepe')
  })
})
```

Note the mock's `dishes[].tags: []` maps to `tags: undefined` only if the mapper treats empty arrays as undefined; align the assertion with the actual mapper (Task 5 maps `d.tags ?? undefined`, so `[]` stays `[]`). FIX the assertion to `{ name: 'Croquetas', priceEur: 8, tags: [] }` to match the mapper exactly.

- [ ] **Step 2: Run, verify it fails**

Run: `npm test -- supabaseSource`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement SupabaseSource**

Create `src/lib/supabaseSource.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Restaurant } from '../types/restaurant'
import type { HardFilter, RestaurantSource } from './searchPipeline'
import { rowToRestaurant, type RestaurantRow } from './supabase'

const SELECT = '*, dishes(name, price_eur, tags, sort)'

// Reads restaurants (+ nested dishes) from Supabase. The coarse filter runs
// server-side (the SQL WHERE seam); ranking happens client-side on the result.
export class SupabaseSource implements RestaurantSource {
  constructor(private client: SupabaseClient) {}

  async all(): Promise<Restaurant[]> {
    const { data, error } = await this.client.from('restaurants').select(SELECT)
    if (error) throw error
    return (data as RestaurantRow[]).map(rowToRestaurant)
  }

  async find(filter: HardFilter): Promise<Restaurant[]> {
    let q = this.client.from('restaurants').select(SELECT)
    if (filter.area) q = q.eq('area', filter.area)
    if (filter.maxSpendEur != null) q = q.lte('average_spend', Math.round(filter.maxSpendEur * 1.2))
    if (filter.cuisines && filter.cuisines.length) {
      // primary cuisine in list OR secondary_cuisines overlaps the list
      const list = filter.cuisines.map((c) => `"${c}"`).join(',')
      q = q.or(`cuisine.in.(${list}),secondary_cuisines.ov.{${filter.cuisines.join(',')}}`)
    }
    const { data, error } = await q
    if (error) throw error
    let rows = (data as RestaurantRow[]).map(rowToRestaurant)
    // dishes/openNow/avoid refinements done client-side (cheap on the filtered set)
    if (filter.avoidCuisines && filter.avoidCuisines.length) {
      rows = rows.filter((r) => !filter.avoidCuisines!.includes(r.cuisine) &&
        !(r.secondaryCuisines ?? []).some((c) => filter.avoidCuisines!.includes(c)))
    }
    return rows
  }
}
```

NOTE: dish-term filtering is intentionally NOT pushed to SQL here (dish text
lives in the child table; a server-side join filter is more complex). The
pipeline's widen + client ranking still surface dish matches because
`scoreDish` runs on the candidates. If `find` over-returns, that's fine :
the shortlist cap + ranker handle it. Keep `find` correct, not exhaustive.

- [ ] **Step 4: Run tests**

Run: `npm test -- supabaseSource`
Expected: PASS, 2 tests. Fix the mock/assertions if the `or`/`eq` chain isn't exercised (the mock returns all rows regardless; the test verifies mapping + call shape, not server filtering).

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabaseSource.ts src/lib/supabaseSource.test.ts
git commit -m "feat(db): SupabaseSource reads restaurants+dishes via the source seam"
```

---

## Task 8: Wire api.ts to Supabase with seed fallback (async)

**Files:** Modify `src/lib/api.ts`

- [ ] **Step 1: Read the current api.ts fully** so you preserve `search`'s `{ intent, results, rankedResults, event }` shape and the `addRecentSearch` side effect.

- [ ] **Step 2: Swap to an async, fallback-aware source**

Replace the imports + source construction. After the existing imports add:

```ts
import { supabase, supabaseEnabled } from './supabase'
import { SupabaseSource } from './supabaseSource'
```

Replace `const restaurantSource = new SeedSource(SEED_RESTAURANTS)` with:

```ts
const seedSource = new SeedSource(SEED_RESTAURANTS)
const liveSource = supabaseEnabled && supabase ? new SupabaseSource(supabase) : null
const restaurantSource = liveSource ?? seedSource
```

- [ ] **Step 3: Make the read methods async with fallback**

Convert these methods to async, each trying Supabase then falling back to seed on error:

```ts
  async listRestaurants(): Promise<Restaurant[]> {
    if (liveSource) {
      try { return await liveSource.all() } catch (e) { console.warn('[api] supabase listRestaurants failed, using seed', e) }
    }
    return SEED_RESTAURANTS
  },

  async getRestaurantBySlug(slug: string): Promise<Restaurant | undefined> {
    if (liveSource && supabase) {
      try {
        const { data, error } = await supabase.from('restaurants').select('*, dishes(name, price_eur, tags, sort)').eq('slug', slug).maybeSingle()
        if (error) throw error
        if (data) { const { rowToRestaurant } = await import('./supabase'); return rowToRestaurant(data as any) }
        return undefined
      } catch (e) { console.warn('[api] supabase getRestaurantBySlug failed, using seed', e) }
    }
    return SEED_RESTAURANTS.find((r) => r.slug === slug)
  },

  async getRestaurantById(id: string): Promise<Restaurant | undefined> {
    const all = await this.listRestaurants()
    return all.find((r) => r.id === id)
  },

  async getRestaurantsByIds(ids: string[]): Promise<Restaurant[]> {
    const set = new Set(ids)
    const all = await this.listRestaurants()
    return all.filter((r) => set.has(r.id))
  },
```

- [ ] **Step 4: Make search + searchByIntent async with fallback**

```ts
  async search(query: string, _opts: { hardFilterOpenNow?: boolean } = {}): Promise<{
    intent: FoodIntent
    results: Restaurant[]
    rankedResults: ReturnType<typeof rankRestaurants>
    event: SearchEvent
  }> {
    const intent = parseFoodIntent(query)
    const pipeline = await this.searchByIntent(intent)
    const results = pipeline.results
    const event: SearchEvent = {
      id: id(),
      query,
      intent,
      resultIds: results.map((r) => r.id),
      topMatchId: results[0]?.id || null,
      createdAt: nowIso(),
      resultCount: results.length,
    }
    addRecentSearch(event)
    return { intent, results, rankedResults: pipeline.rankedResults, event }
  },

  async searchByIntent(intent: FoodIntent, _opts: { hardFilterOpenNow?: boolean } = {}): Promise<{
    results: Restaurant[]
    rankedResults: ReturnType<typeof rankRestaurants>
  }> {
    try {
      const p = await runSearchPipeline(intent, restaurantSource, { minScore: 10 })
      return { results: p.results, rankedResults: p.ranked }
    } catch (e) {
      console.warn('[api] supabase search failed, using seed', e)
      const p = await runSearchPipeline(intent, seedSource, { minScore: 10 })
      return { results: p.results, rankedResults: p.ranked }
    }
  },
```

(Keep `rankedResults`/`ranked` naming consistent with `PipelineResult.ranked`. `search` now returns `rankedResults: pipeline.rankedResults`: adjust: `searchByIntent` returns `rankedResults`, so in `search` use the returned `rankedResults`.)

- [ ] **Step 5: Persist claims to the DB (best-effort)**

In `submitRestaurantLead`, after the existing local `addRestaurantLead(stored)` call, add a best-effort DB insert (do not change the return type):

```ts
    if (supabaseEnabled && supabase) {
      supabase.from('restaurant_claims').insert({
        restaurant_slug: (lead as any).restaurantSlug ?? null,
        restaurant_name: lead.restaurantName,
        owner_name: lead.ownerName,
        email: lead.email,
        phone: lead.phone ?? null,
        area: lead.area ?? null,
        cuisine: (lead as any).cuisine ?? null,
        price_band: (lead as any).priceBand ?? null,
        menu_link: (lead as any).menuLink ?? null,
        has_photos: (lead as any).hasPhotos ?? null,
        message: lead.message ?? null,
        source: (lead as any).source ?? 'form',
      }).then(({ error }) => { if (error) console.warn('[api] claim insert failed', error) })
    }
```

- [ ] **Step 6: Verify lint**

Run: `npm run lint`
Expected: PASS. The async signature changes will surface compile errors at the page call sites: those are fixed in Tasks 9-11. If lint blocks here on the pages, that's expected; proceed (pages get fixed next). If lint blocks IN api.ts itself, fix it.

- [ ] **Step 7: Commit**

```bash
git add src/lib/api.ts
git commit -m "feat(db): api reads via Supabase with seed fallback; persist claims"
```

---

## Task 9: Update Ask.tsx + Results.tsx to async pipeline

**Files:** Modify `src/pages/Ask.tsx`, `src/pages/Results.tsx`

- [ ] **Step 1: Ask.tsx: replace the useMemo search with an async effect**

In `src/pages/Ask.tsx`, replace:

```ts
  const { results, rankedResults } = useMemo(() => {
    if (!query) return { results: [], rankedResults: [] }
    const r = api.searchByIntent(intent)
    return r
  }, [intent, query])
```

with state + effect:

```ts
  const [results, setResults] = useState<Restaurant[]>([])
  const [rankedResults, setRankedResults] = useState<RankedResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) { setResults([]); setRankedResults([]); return }
    let cancelled = false
    setLoading(true)
    api.searchByIntent(intent).then((r) => {
      if (cancelled) return
      setResults(r.results)
      setRankedResults(r.rankedResults)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [intent, query])
```

Add imports at the top: `import type { Restaurant } from '../types/restaurant'` and `import type { RankedResult } from '../types/search'` (merge with the existing search-type import). Remove the now-unused `useMemo`, `rankRestaurants`, `SEED_RESTAURANTS`, and the `void SEED_RESTAURANTS` line if present.

- [ ] **Step 2: Ask.tsx: optional loading indicator**

Where results render, show a simple loading state when `loading && query`. Find the results section and add, just before it:

```tsx
      {loading && query && (
        <p className="mt-6 text-center text-[13px] text-tinta/50">Buscando…</p>
      )}
```

- [ ] **Step 3: Results.tsx: route through api.searchByIntent**

In `src/pages/Results.tsx`, read the current logic (it builds `ranked` via `rankRestaurants(intent, SEED_RESTAURANTS, ...)` inside a `useMemo`). Replace the direct-rank `useMemo` with an async effect that calls `api.searchByIntent(intent)` and stores `results`. Remove `rankRestaurants` + `SEED_RESTAURANTS` imports. Concretely, replace the `useMemo` that produces `ranked` with:

```ts
  const [items, setItems] = useState<{ restaurant: Restaurant; rr: RankedResult }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.searchByIntent(intent).then(({ results, rankedResults }) => {
      if (cancelled) return
      const rrById = new Map(rankedResults.map((rr) => [rr.restaurantId, rr]))
      setItems(results.map((restaurant) => ({ restaurant, rr: rrById.get(restaurant.id)! })))
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [intent])
```

Then update the render to map `items` (each has `.restaurant` and `.rr`) instead of the old `ranked` structure, and show `loading ? 'Cargando…'` when appropriate. Read the existing render to wire the field names exactly (the old code used `ranked.map(({ restaurant, rr }) => ...)` per the grep: if so, just rename `ranked` → `items`). Add imports: `import { api } from '../lib/api'`, `import type { Restaurant } from '../types/restaurant'`, `import type { RankedResult } from '../types/search'`.

NOTE: Results.tsx had sort/filter logic applied after ranking. Preserve it: apply the existing sort to `items` (by `restaurant.averageSpend`, `rating`, etc.) the same way it did before. Read the file and keep that behaviour; only the data SOURCE changes (api pipeline instead of direct rank).

- [ ] **Step 4: Verify**

Run: `npm run lint`
Expected: PASS.
Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Ask.tsx src/pages/Results.tsx
git commit -m "feat(db): Ask + Results read via async search pipeline"
```

---

## Task 10: Update RestaurantDetail.tsx + Saved.tsx + Admin.tsx for async reads

**Files:** Modify `src/pages/RestaurantDetail.tsx`, `src/pages/Saved.tsx`, `src/pages/Admin.tsx`

- [ ] **Step 1: RestaurantDetail.tsx: async getRestaurantBySlug**

Currently `const r = api.getRestaurantBySlug(slug)` is synchronous and used throughout the component. Replace with state + effect at the top of the component:

```ts
  const [r, setR] = useState<Restaurant | undefined>(undefined)
  const [loadingR, setLoadingR] = useState(true)
  useEffect(() => {
    let cancelled = false
    setLoadingR(true)
    api.getRestaurantBySlug(slug).then((found) => {
      if (cancelled) return
      setR(found)
      setLoadingR(false)
    })
    return () => { cancelled = true }
  }, [slug])
```

Add `import type { Restaurant } from '../types/restaurant'` if not present. The existing `if (!r) return <NotFound/>` guard must become: while `loadingR` show a loading state, else if `!r` show not-found. Replace the early guard:

```tsx
  if (loadingR) {
    return (
      <AppShell>
        <p className="pt-10 text-center text-[14px] text-tinta/50">Cargando…</p>
      </AppShell>
    )
  }
  if (!r) {
    // ... existing not-found EmptyState block unchanged ...
  }
```

The `personalised` useMemo and other code referencing `r` already handle `if (!r) return null` internally; keep them. Verify nothing else calls `api.getRestaurantBySlug` synchronously.

- [ ] **Step 2: Saved.tsx: async getRestaurantsByIds**

Currently `setSaved(api.getRestaurantsByIds(ids))` inside an effect. Make it await the promise:

```ts
    const ids = getSavedIds()
    api.getRestaurantsByIds(ids).then((rs) => setSaved(rs))
    setRecent(getRecentSearches())
```

(Read the surrounding effect to place this correctly; `getSavedIds`/`getRecentSearches` stay synchronous: only the api call becomes a promise.)

- [ ] **Step 3: Admin.tsx: async listRestaurants**

Currently `const restaurants = api.listRestaurants()` at component top. Convert to state + effect:

```ts
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  useEffect(() => {
    api.listRestaurants().then(setRestaurants)
  }, [])
```

Add `import { useEffect, useState } from 'react'` (merge with existing React import) and `import type { Restaurant } from '../types/restaurant'`. Anything using `restaurants` (e.g. the top-clicks resolution) already treats it as an array; an initial empty array renders fine until the effect resolves.

- [ ] **Step 4: Verify**

Run: `npm run lint`
Expected: PASS.
Run: `npm run build`
Expected: PASS.
Run: `npm test`
Expected: PASS (all suites; mvp.test.ts may need awaits: see Task 11).

- [ ] **Step 5: Commit**

```bash
git add src/pages/RestaurantDetail.tsx src/pages/Saved.tsx src/pages/Admin.tsx
git commit -m "feat(db): detail/saved/admin pages read restaurants async"
```

---

## Task 11: Fix mvp.test.ts for async + full verify

**Files:** Modify `src/lib/mvp.test.ts`

- [ ] **Step 1: Find any api/pipeline calls that are now async**

Run: `grep -n "api\.\|runSearchPipeline" src/lib/mvp.test.ts`
The existing mvp tests use `parseFoodIntent`, `rankRestaurants`, `buildLeadMessage`, etc. directly (NOT `api.*` or `runSearchPipeline`), so they likely need NO change. If any test calls `api.search`/`searchByIntent` or `runSearchPipeline`, make that `it` async and `await` the call. If none do, this task is a no-op verification.

- [ ] **Step 2: Full suite**

Run: `npm test`
Expected: ALL passing (mvp + searchPipeline + supabaseSource). Report the count.

- [ ] **Step 3: Live end-to-end smoke (requires Tasks 3-4 done)**

Run the dev server and confirm live data:
```bash
npm run build
```
Expected: PASS. Then a runtime check via node using the anon key (proves the same query path the app uses):
```bash
node -e "import('@supabase/supabase-js').then(async ({createClient})=>{const fs=require('fs');const t=fs.readFileSync('.env','utf8');const e=Object.fromEntries([...t.matchAll(/^([A-Z0-9_]+)=(.*)$/gm)].map(m=>[m[1],m[2]]));const s=createClient(e.VITE_SUPABASE_URL,e.VITE_SUPABASE_ANON_KEY);const {count}=await s.from('restaurants').select('*',{count:'exact',head:true});const {data}=await s.from('restaurants').select('slug,dishes(name)').limit(1);console.log('count',count,'sample',JSON.stringify(data))})"
```
Expected: `count 200` and a sample restaurant with nested dishes.

- [ ] **Step 4: Commit (if mvp.test.ts changed)**

```bash
git add src/lib/mvp.test.ts
git commit -m "test(db): adapt mvp tests to async api where needed"
```

---

## Done criteria

- `supabase/schema.sql` applied; 200 restaurants + ~1,600 dishes in Postgres; anon key can read them (RLS public read works); claims insert via anon.
- App reads live data through `SupabaseSource` when env is set; falls back to seed (and never crashes) when env is unset or a call errors.
- All pages (Ask, Results, RestaurantDetail, Saved, Admin) work with async reads + a loading state.
- `npm run lint`, `npm test`, `npm run build` green.
- Service key never committed and never `VITE_`-prefixed; `.env` gitignored.

## Known follow-ups (out of scope)

- Reconstruct `OpeningInfo` from `hours_kind` so open-now filtering works on DB rows (currently DB rows read as "hours unknown" = open).
- Website reading from Supabase (still builds from seed parser).
- Auth + favourites sync (next increment). Retire `backend/`.
