# Restaurant Hero-Image Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable server-side pipeline that generates a food-forward AI cover image themed to a restaurant's cuisine, stores it in Supabase Storage, and sets `restaurants.hero_image` so the app shows it automatically.

**Architecture:** A small Node CLI (`frontend/scripts/generateHeroImage.mjs`) plus a fully unit-tested `frontend/scripts/lib/` core (prompt builder, kie.ai client, image downloader, orchestration, arg parser). The core is dependency-injected and free of process/env concerns so it can later be lifted into a Supabase Edge Function. The app already renders `heroImage` (no app changes); the website is out of scope (it builds from the fictional seed and does not read the DB).

**Tech Stack:** Node 22 (native `fetch`), `@supabase/supabase-js` (already a dep, service-role client), kie.ai GPT-image API, `images.weserv.nl` download proxy, vitest.

**Spec:** `docs/superpowers/specs/2026-06-15-restaurant-hero-image-pipeline-design.md`

**Conventions for every task:** run unit tests from `frontend/` with `npm test`. Do not commit secrets. Commit messages must not include any Co-Authored-By trailer.

---

### Task 1: Prompt builder

Pure function mapping a cuisine (the "theme") plus optional vibe/name to a food-forward photography prompt. Keys match the literal seed/DB cuisine strings (including accents).

**Files:**
- Create: `frontend/scripts/lib/heroPrompt.mjs`
- Test: `frontend/scripts/lib/heroPrompt.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// frontend/scripts/lib/heroPrompt.test.mjs
import { describe, it, expect } from 'vitest'
import { heroPrompt } from './heroPrompt.mjs'

describe('heroPrompt', () => {
  it('uses the cuisine-specific subject and the shared style suffix', () => {
    const p = heroPrompt('paella', {})
    expect(p).toContain('Valencian seafood paella')
    expect(p).toContain('Professional food photography')
    expect(p).toContain('No text, no logos')
  })

  it('falls back to a default subject for unknown cuisines', () => {
    expect(heroPrompt('fondue', {})).toContain('appetising signature dish')
  })

  it('matches accented cuisine keys exactly', () => {
    expect(heroPrompt('menú del día', {})).toContain('menu del dia plate')
  })

  it('weaves in up to two vibe words when provided', () => {
    const p = heroPrompt('sushi', { vibe: ['minimalist', 'romantic', 'loud'] })
    expect(p).toContain('The mood is minimalist, romantic.')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run scripts/lib/heroPrompt.test.mjs`
Expected: FAIL (cannot find module `./heroPrompt.mjs`).

- [ ] **Step 3: Write minimal implementation**

```js
// frontend/scripts/lib/heroPrompt.mjs
// Pure prompt builder for restaurant hero images. Maps a restaurant's cuisine
// (its "theme") to a food-forward photography prompt. Keys MUST match the literal
// seed/DB cuisine strings, including accents (for example 'menú del día').

const STYLE_SUFFIX =
  'Professional food photography, 45-degree angle, warm natural window light, ' +
  'shallow depth of field, fresh and appetizing, rustic table setting, vibrant ' +
  'but natural colours, editorial restaurant-magazine style. No text, no logos, ' +
  'no watermarks, no people, no hands.'

const CUISINE_SUBJECT = {
  'Spanish tapas': 'a colourful spread of Spanish tapas: patatas bravas, jamon iberico, garlic prawns, croquetas and olives on small ceramic plates',
  paella: 'an authentic Valencian seafood paella in a traditional pan with mussels, prawns, lemon wedges and saffron rice',
  'menú del día': 'a hearty Spanish menu del dia plate: grilled meat, rustic vegetables and bread on a simple ceramic plate',
  sushi: 'an elegant assortment of fresh sushi nigiri and sashimi on a dark slate board with soy sauce and wasabi',
  burgers: 'a gourmet cheeseburger with melted cheese, fresh lettuce and tomato, with crispy fries on a wooden board',
  pizza: 'a wood-fired Neapolitan margherita pizza with bubbling mozzarella, fresh basil and tomato on a rustic surface',
  pasta: 'a bowl of fresh handmade pasta with rich tomato sauce, parmesan and basil',
  'healthy bowls': 'a vibrant healthy grain bowl with avocado, roasted vegetables, chickpeas and greens',
  vegan: 'a colourful vegan buddha bowl with roasted vegetables, tofu, quinoa and tahini dressing',
  vegetarian: 'a fresh vegetarian dish with grilled seasonal vegetables, herbs and burrata',
  brunch: 'a brunch spread with avocado toast, poached eggs, pancakes and fresh orange juice',
  coffee: 'a beautifully crafted flat white with latte art beside a slice of cake on a cafe table',
  bar: 'craft cocktails and a sharing board of snacks on a moody bar counter',
  Mexican: 'authentic Mexican tacos with fresh cilantro, onion, lime and salsa on a colourful plate',
  Indian: 'a rich Indian curry with naan bread, basmati rice and fresh herbs in copper bowls',
  'Asian fusion': 'a modern Asian-fusion plate of bao buns and dumplings with dipping sauces on slate',
  Mediterranean: 'a Mediterranean mezze platter with hummus, grilled vegetables, olives and pita',
  seafood: 'a fresh seafood platter with grilled fish, prawns, mussels and lemon on ice',
  steak: 'a grilled ribeye steak with rosemary, sliced to show a juicy medium-rare interior, on a cast-iron skillet',
}

const DEFAULT_SUBJECT = 'an appetising signature dish, beautifully plated'

export function heroPrompt(cuisine, { vibe = [], name = '' } = {}) {
  void name // reserved for future per-restaurant nuance; kept in the signature
  const subject = CUISINE_SUBJECT[cuisine] || DEFAULT_SUBJECT
  const vibeWords = Array.isArray(vibe) ? vibe.filter(Boolean).slice(0, 2).join(', ') : ''
  const ambiance = vibeWords ? ` The mood is ${vibeWords}.` : ''
  return `${subject}.${ambiance} ${STYLE_SUFFIX}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run scripts/lib/heroPrompt.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd /Users/max/Projects/FoodMatch
git add frontend/scripts/lib/heroPrompt.mjs frontend/scripts/lib/heroPrompt.test.mjs
git commit -m "feat(images): add food-forward hero-image prompt builder"
```

---

### Task 2: kie.ai client + URL extraction

Calls kie.ai (createTask, poll recordInfo) and extracts the result image URL by regex (the response JSON is malformed). Network is injected via `fetchImpl` so it is unit-testable.

**Files:**
- Create: `frontend/scripts/lib/kieImage.mjs`
- Test: `frontend/scripts/lib/kieImage.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// frontend/scripts/lib/kieImage.test.mjs
import { describe, it, expect, vi } from 'vitest'
import { extractImageUrl, generateImage } from './kieImage.mjs'

describe('extractImageUrl', () => {
  it('pulls the image URL out of malformed resultJson', () => {
    const malformed = '{"resultUrls":["https://tempfile.aiquickdraw.com/abc123.png"]} junk'
    expect(extractImageUrl(malformed)).toBe('https://tempfile.aiquickdraw.com/abc123.png')
  })
  it('returns null when no URL is present', () => {
    expect(extractImageUrl('{"state":"success"}')).toBeNull()
  })
})

describe('generateImage', () => {
  it('creates a task then polls until success and returns the URL', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ json: async () => ({ data: { taskId: 't1' } }) })
      .mockResolvedValueOnce({ json: async () => ({ data: { state: 'waiting' } }) })
      .mockResolvedValueOnce({ json: async () => ({ data: { state: 'success', resultJson: '{"resultUrls":["https://cdn/x.png"]}' } }) })
    const url = await generateImage(
      { prompt: 'p', apiKey: 'k' },
      { fetchImpl, sleepImpl: async () => {}, pollMs: 0 },
    )
    expect(url).toBe('https://cdn/x.png')
    expect(fetchImpl).toHaveBeenCalledTimes(3)
  })
  it('throws when the task fails', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ json: async () => ({ data: { taskId: 't1' } }) })
      .mockResolvedValueOnce({ json: async () => ({ data: { state: 'fail', failMsg: 'nope' } }) })
    await expect(
      generateImage({ prompt: 'p', apiKey: 'k' }, { fetchImpl, sleepImpl: async () => {} }),
    ).rejects.toThrow('kie: task failed')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run scripts/lib/kieImage.test.mjs`
Expected: FAIL (cannot find module `./kieImage.mjs`).

- [ ] **Step 3: Write minimal implementation**

```js
// frontend/scripts/lib/kieImage.mjs
// kie.ai GPT-image client. createTask -> poll recordInfo -> extract result URL.
// The recordInfo JSON is malformed (double-encoded param), so the image URL is
// extracted by regex rather than JSON.parse.

const CREATE_URL = 'https://api.kie.ai/api/v1/jobs/createTask'
const RECORD_URL = 'https://api.kie.ai/api/v1/jobs/recordInfo'

// Reuse the model that produced website/img/hero-*.jpg. Confirm this value
// against kie.ai before any paid run (see plan Task 9).
export const KIE_MODEL = 'gpt-image-2-text-to-image'

export function extractImageUrl(resultJson) {
  if (!resultJson) return null
  const text = typeof resultJson === 'string' ? resultJson : JSON.stringify(resultJson)
  const m = text.match(/https:\/\/[^"\\\s]+\.(?:png|jpe?g)/i)
  return m ? m[0] : null
}

const defaultSleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function generateImage(
  { prompt, aspectRatio = '3:2', apiKey },
  { fetchImpl = fetch, pollMs = 3000, maxPolls = 60, sleepImpl = defaultSleep } = {},
) {
  if (!apiKey) throw new Error('kie: missing apiKey')

  const createRes = await fetchImpl(CREATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: KIE_MODEL, input: { prompt, aspect_ratio: aspectRatio } }),
  })
  const createBody = await createRes.json()
  const taskId = createBody?.data?.taskId ?? createBody?.taskId
  if (!taskId) throw new Error(`kie: no taskId in createTask response: ${JSON.stringify(createBody)}`)

  for (let i = 0; i < maxPolls; i++) {
    const infoRes = await fetchImpl(`${RECORD_URL}?taskId=${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    const info = await infoRes.json()
    const state = info?.data?.state ?? info?.state
    if (state === 'success') {
      const url = extractImageUrl(info?.data?.resultJson ?? info)
      if (!url) throw new Error('kie: success but no image URL found')
      return url
    }
    if (state === 'fail' || state === 'failed') {
      throw new Error(`kie: task failed: ${JSON.stringify(info?.data ?? info)}`)
    }
    await sleepImpl(pollMs)
  }
  throw new Error('kie: timed out waiting for image')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run scripts/lib/kieImage.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd /Users/max/Projects/FoodMatch
git add frontend/scripts/lib/kieImage.mjs frontend/scripts/lib/kieImage.test.mjs
git commit -m "feat(images): add kie.ai image client with malformed-JSON URL extraction"
```

---

### Task 3: Image downloader (weserv proxy)

Downloads the generated image as an optimized JPEG through `images.weserv.nl` (the direct kie CDN resets connections in this environment), with a direct-fetch fallback.

**Files:**
- Create: `frontend/scripts/lib/downloadImage.mjs`
- Test: `frontend/scripts/lib/downloadImage.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// frontend/scripts/lib/downloadImage.test.mjs
import { describe, it, expect, vi } from 'vitest'
import { weservUrl, downloadAsJpeg } from './downloadImage.mjs'

describe('weservUrl', () => {
  it('builds a proxied, resized jpg URL without the scheme', () => {
    const u = weservUrl('https://tempfile.aiquickdraw.com/x.png')
    expect(u).toContain('images.weserv.nl')
    expect(u).toContain('output=jpg')
    expect(u).toContain(encodeURIComponent('tempfile.aiquickdraw.com/x.png'))
  })
})

describe('downloadAsJpeg', () => {
  it('returns bytes from the proxy', async () => {
    const bytes = new Uint8Array([1, 2, 3])
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => bytes.buffer })
    const out = await downloadAsJpeg('https://cdn/x.png', { fetchImpl })
    expect(Array.from(out)).toEqual([1, 2, 3])
  })

  it('falls back to the direct URL if the proxy fails', async () => {
    const bytes = new Uint8Array([9])
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => bytes.buffer })
    const out = await downloadAsJpeg('https://cdn/x.png', { fetchImpl })
    expect(Array.from(out)).toEqual([9])
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run scripts/lib/downloadImage.test.mjs`
Expected: FAIL (cannot find module `./downloadImage.mjs`).

- [ ] **Step 3: Write minimal implementation**

```js
// frontend/scripts/lib/downloadImage.mjs
// Download a generated image as an optimized JPEG via the images.weserv.nl proxy.
// The direct kie CDN (tempfile.aiquickdraw.com) resets connections in some
// environments; weserv both proxies and resizes/optimizes. Falls back to direct.

export function weservUrl(imageUrl, { width = 1200, quality = 82 } = {}) {
  const stripped = imageUrl.replace(/^https?:\/\//, '')
  return `https://images.weserv.nl/?url=${encodeURIComponent(stripped)}&w=${width}&output=jpg&q=${quality}`
}

export async function downloadAsJpeg(imageUrl, { fetchImpl = fetch, width = 1200, quality = 82 } = {}) {
  const tryFetch = async (u) => {
    const res = await fetchImpl(u)
    if (!res.ok) throw new Error(`download: HTTP ${res.status} for ${u}`)
    return new Uint8Array(await res.arrayBuffer())
  }
  try {
    return await tryFetch(weservUrl(imageUrl, { width, quality }))
  } catch {
    return await tryFetch(imageUrl)
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run scripts/lib/downloadImage.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd /Users/max/Projects/FoodMatch
git add frontend/scripts/lib/downloadImage.mjs frontend/scripts/lib/downloadImage.test.mjs
git commit -m "feat(images): add weserv-proxied JPEG downloader with direct fallback"
```

---

### Task 4: CLI argument parser

Tiny pure parser so the CLI glue stays trivial and the parsing is tested.

**Files:**
- Create: `frontend/scripts/lib/parseArgs.mjs`
- Test: `frontend/scripts/lib/parseArgs.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// frontend/scripts/lib/parseArgs.test.mjs
import { describe, it, expect } from 'vitest'
import { parseArgs } from './parseArgs.mjs'

describe('parseArgs', () => {
  it('reads a slug positional', () => {
    expect(parseArgs(['la-prueba'])).toEqual({ slug: 'la-prueba', missing: false, force: false, dryRun: false })
  })
  it('reads flags', () => {
    expect(parseArgs(['--missing', '--force', '--dry-run'])).toEqual({ slug: null, missing: true, force: true, dryRun: true })
  })
  it('combines a slug with flags', () => {
    expect(parseArgs(['la-prueba', '--force'])).toEqual({ slug: 'la-prueba', missing: false, force: true, dryRun: false })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run scripts/lib/parseArgs.test.mjs`
Expected: FAIL (cannot find module `./parseArgs.mjs`).

- [ ] **Step 3: Write minimal implementation**

```js
// frontend/scripts/lib/parseArgs.mjs
// Parse CLI args for the hero-image generator.
export function parseArgs(argv) {
  const out = { slug: null, missing: false, force: false, dryRun: false }
  for (const a of argv) {
    if (a === '--missing') out.missing = true
    else if (a === '--force') out.force = true
    else if (a === '--dry-run') out.dryRun = true
    else if (!a.startsWith('-') && !out.slug) out.slug = a
  }
  return out
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run scripts/lib/parseArgs.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd /Users/max/Projects/FoodMatch
git add frontend/scripts/lib/parseArgs.mjs frontend/scripts/lib/parseArgs.test.mjs
git commit -m "feat(images): add hero-image CLI arg parser"
```

---

### Task 5: Pipeline core (orchestration)

Ties prompt -> kie -> download -> storage upload -> DB update. All side-effecting deps injected so it is unit-testable and reusable by a future Edge Function. Exported name is `generateAndStoreHeroImage` (distinct from kie's `generateImage`).

**Files:**
- Create: `frontend/scripts/lib/heroImagePipeline.mjs`
- Test: `frontend/scripts/lib/heroImagePipeline.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// frontend/scripts/lib/heroImagePipeline.test.mjs
import { describe, it, expect, vi } from 'vitest'
import { generateAndStoreHeroImage } from './heroImagePipeline.mjs'

function fakeSupabase() {
  const uploads = []
  const updates = []
  return {
    _uploads: uploads,
    _updates: updates,
    storage: {
      createBucket: vi.fn().mockResolvedValue({ error: null }),
      from: () => ({
        upload: vi.fn((path, bytes, opts) => {
          uploads.push({ path, bytes, opts })
          return Promise.resolve({ error: null })
        }),
        getPublicUrl: (path) => ({ data: { publicUrl: `https://store/${path}` } }),
      }),
    },
    from: () => ({
      update: (vals) => ({
        eq: (col, val) => {
          updates.push({ vals, col, val })
          return Promise.resolve({ error: null })
        },
      }),
    }),
  }
}

describe('generateAndStoreHeroImage', () => {
  it('generates, uploads <slug>.jpg, sets hero_image, returns url', async () => {
    const supabase = fakeSupabase()
    const generate = vi.fn().mockResolvedValue('https://cdn/x.png')
    const download = vi.fn().mockResolvedValue(new Uint8Array([1, 2]))
    const res = await generateAndStoreHeroImage(
      { slug: 'la-prueba', name: 'La Prueba', cuisine: 'paella', vibe: ['cozy'] },
      { supabase, kieApiKey: 'k', generate, download },
    )
    expect(res).toEqual({ slug: 'la-prueba', url: 'https://store/la-prueba.jpg', skipped: false })
    expect(supabase._uploads[0].path).toBe('la-prueba.jpg')
    expect(supabase._uploads[0].opts).toMatchObject({ contentType: 'image/jpeg', upsert: true })
    expect(supabase._updates[0]).toEqual({
      vals: { hero_image: 'https://store/la-prueba.jpg' }, col: 'slug', val: 'la-prueba',
    })
    expect(generate).toHaveBeenCalledOnce()
  })

  it('skips when hero_image already set and not forced', async () => {
    const supabase = fakeSupabase()
    const generate = vi.fn()
    const res = await generateAndStoreHeroImage(
      { slug: 'x', name: 'X', cuisine: 'sushi', heroImage: 'https://store/x.jpg' },
      { supabase, kieApiKey: 'k', generate },
    )
    expect(res.skipped).toBe(true)
    expect(generate).not.toHaveBeenCalled()
  })

  it('regenerates when forced even if hero_image is set', async () => {
    const supabase = fakeSupabase()
    const generate = vi.fn().mockResolvedValue('https://cdn/y.png')
    const download = vi.fn().mockResolvedValue(new Uint8Array([3]))
    const res = await generateAndStoreHeroImage(
      { slug: 'x', name: 'X', cuisine: 'sushi', heroImage: 'https://store/x.jpg' },
      { supabase, kieApiKey: 'k', force: true, generate, download },
    )
    expect(res.skipped).toBe(false)
    expect(generate).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run scripts/lib/heroImagePipeline.test.mjs`
Expected: FAIL (cannot find module `./heroImagePipeline.mjs`).

- [ ] **Step 3: Write minimal implementation**

```js
// frontend/scripts/lib/heroImagePipeline.mjs
// Orchestration core: turn a restaurant into a stored hero image + DB update.
// No env / process concerns so it can be reused by a CLI today and a Supabase
// Edge Function later. All side-effecting deps are injected.

import { heroPrompt } from './heroPrompt.mjs'
import { generateImage } from './kieImage.mjs'
import { downloadAsJpeg } from './downloadImage.mjs'

export const BUCKET = 'restaurant-images'

export async function ensureBucket(supabase) {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
  // Ignore "already exists"; surface anything else.
  if (error && !/exist/i.test(error.message || '')) throw error
}

export async function generateAndStoreHeroImage(restaurant, deps) {
  const {
    supabase,
    kieApiKey,
    force = false,
    fetchImpl = fetch,
    generate = generateImage,
    download = downloadAsJpeg,
  } = deps
  const { slug, name, cuisine, vibe = [], heroImage } = restaurant

  if (heroImage && !force) return { slug, url: heroImage, skipped: true }

  const prompt = heroPrompt(cuisine, { vibe, name })
  const imageUrl = await generate({ prompt, aspectRatio: '3:2', apiKey: kieApiKey }, { fetchImpl })
  const bytes = await download(imageUrl, { fetchImpl })

  await ensureBucket(supabase)
  const path = `${slug}.jpg`
  const up = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (up.error) throw up.error

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const url = pub.publicUrl

  const { error: dbErr } = await supabase.from('restaurants').update({ hero_image: url }).eq('slug', slug)
  if (dbErr) throw dbErr

  return { slug, url, skipped: false }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run scripts/lib/heroImagePipeline.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd /Users/max/Projects/FoodMatch
git add frontend/scripts/lib/heroImagePipeline.mjs frontend/scripts/lib/heroImagePipeline.test.mjs
git commit -m "feat(images): add hero-image pipeline orchestration core"
```

---

### Task 6: CLI wrapper

Thin glue: parse `.env`, build the service-role client, read the target restaurant(s) from the DB, and call the pipeline. Verified with `--dry-run` (no spend, no kie key needed).

**Files:**
- Create: `frontend/scripts/generateHeroImage.mjs`

- [ ] **Step 1: Write the CLI**

```js
// frontend/scripts/generateHeroImage.mjs
// Generate a food-forward hero image for a restaurant (or many), upload it to
// Supabase Storage, and set restaurants.hero_image. Server-side only: uses the
// service-role key + kie.ai key from frontend/.env. See the design spec.
//
// Usage (from frontend/):
//   node scripts/generateHeroImage.mjs <slug>            one restaurant
//   node scripts/generateHeroImage.mjs --missing         every null hero_image
//   node scripts/generateHeroImage.mjs <slug> --force    regenerate even if set
//   node scripts/generateHeroImage.mjs <slug> --dry-run  print prompt only, no spend
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from './lib/parseArgs.mjs'
import { heroPrompt } from './lib/heroPrompt.mjs'
import { generateAndStoreHeroImage } from './lib/heroImagePipeline.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, '../.env'), 'utf8')
    .split('\n')
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
)

const args = parseArgs(process.argv.slice(2))
if (!args.slug && !args.missing) {
  console.error('Usage: node scripts/generateHeroImage.mjs <slug> | --missing [--force] [--dry-run]')
  process.exit(1)
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const cols = 'slug,name,cuisine,vibe,hero_image'
let targets = []
if (args.missing) {
  const { data, error } = await supabase.from('restaurants').select(cols).is('hero_image', null)
  if (error) { console.error('query failed:', error); process.exit(1) }
  targets = data
} else {
  const { data, error } = await supabase.from('restaurants').select(cols).eq('slug', args.slug).maybeSingle()
  if (error) { console.error('query failed:', error); process.exit(1) }
  if (!data) { console.error(`no restaurant with slug "${args.slug}"`); process.exit(1) }
  targets = [data]
}

console.log(`${targets.length} target(s).`)
let ok = 0, skip = 0, fail = 0
for (const row of targets) {
  const restaurant = {
    slug: row.slug, name: row.name, cuisine: row.cuisine,
    vibe: row.vibe ?? [], heroImage: row.hero_image ?? undefined,
  }
  if (args.dryRun) {
    console.log(`\n[${row.slug}] ${heroPrompt(restaurant.cuisine, { vibe: restaurant.vibe, name: restaurant.name })}`)
    continue
  }
  if (!env.KIE_API_KEY) { console.error('KIE_API_KEY missing in .env; aborting.'); process.exit(1) }
  try {
    const res = await generateAndStoreHeroImage(restaurant, {
      supabase, kieApiKey: env.KIE_API_KEY, force: args.force,
    })
    if (res.skipped) { skip++; console.log(`- ${row.slug}: skipped (already set)`) }
    else { ok++; console.log(`+ ${row.slug}: ${res.url}`) }
  } catch (e) {
    fail++; console.error(`x ${row.slug}: ${e.message}`)
  }
}
if (!args.dryRun) console.log(`\nDone. ${ok} generated, ${skip} skipped, ${fail} failed.`)
```

- [ ] **Step 2: Smoke-test with --dry-run (no spend, needs only Supabase env)**

Run (pick any real slug; list a few candidates first):
```bash
cd frontend
node scripts/generateHeroImage.mjs --missing --dry-run | head -8
```
Expected: prints `N target(s).` then one `[slug] <prompt text>` line per restaurant, with the prompt containing "Professional food photography". No network image calls, no errors.

If `.env` is missing `VITE_SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, the script throws on the DB query; ensure those exist (they already do for `db:migrate`).

- [ ] **Step 3: Commit**

```bash
cd /Users/max/Projects/FoodMatch
git add frontend/scripts/generateHeroImage.mjs
git commit -m "feat(images): add generateHeroImage CLI (slug/--missing/--force/--dry-run)"
```

---

### Task 7: Config, env, and re-seed safety note

Document the new secret, add an npm script, and make explicit that re-seeding never clobbers generated images.

**Files:**
- Modify: `frontend/.env.example` (append `KIE_API_KEY`)
- Modify: `frontend/package.json:16` (add `hero-image` script)
- Modify: `frontend/scripts/migrateToSupabase.mjs:34` (comment only)

- [ ] **Step 1: Append KIE_API_KEY to `frontend/.env.example`**

Add at the end of the file:
```bash
# kie.ai API key for AI image generation (scripts/generateHeroImage.mjs).
# SECRET, server-side only, NOT VITE_ prefixed so Vite never bundles it.
# Rotate this key if it was ever shared in chat or elsewhere.
KIE_API_KEY=your-kie-ai-key
```

- [ ] **Step 2: Add the npm script**

In `frontend/package.json`, in `"scripts"`, add after the `db:migrate` line:
```json
    "db:migrate": "node scripts/migrateToSupabase.mjs",
    "hero-image": "node scripts/generateHeroImage.mjs"
```
(Keep valid JSON: the line before `hero-image` must end with a comma.)

- [ ] **Step 3: Add the re-seed safety comment**

In `frontend/scripts/migrateToSupabase.mjs`, immediately above the `restaurants.push({` line (currently line 34), add:
```js
  // NOTE: hero_image is intentionally NOT written here. Generated cover images
  // are owned by scripts/generateHeroImage.mjs; omitting the column from this
  // upsert means re-seeding never clobbers them.
```

- [ ] **Step 4: Verify nothing broke**

Run:
```bash
cd frontend
node -e "require('./package.json')" && echo "package.json valid"
npm test
```
Expected: "package.json valid", and the full vitest suite passes (existing tests + the four new lib test files).

- [ ] **Step 5: Commit**

```bash
cd /Users/max/Projects/FoodMatch
git add frontend/.env.example frontend/package.json frontend/scripts/migrateToSupabase.mjs
git commit -m "chore(images): document KIE_API_KEY, add hero-image script, note re-seed safety"
```

---

### Task 8: Lock the app contract with a regression test

The app already maps `hero_image` -> `heroImage` ([supabase.ts:73](frontend/src/lib/supabase.ts:73)). Add a test so this cannot silently regress.

**Files:**
- Modify: `frontend/src/lib/supabase.test.ts` (add one test case)

- [ ] **Step 1: Add the test case**

Append to `frontend/src/lib/supabase.test.ts`. Ensure `rowToRestaurant` and the `RestaurantRow` type are imported from `'./supabase'` (add to the existing import if needed), and `describe/it/expect` from `'vitest'`:

```ts
describe('rowToRestaurant hero_image mapping', () => {
  const base: RestaurantRow = {
    id: 'r1', slug: 'r1', name: 'R1', description: '', cuisine: 'paella',
    secondary_cuisines: [], tags: [], vibe: [], best_for: [],
    area: 'Ruzafa', city: 'Valencia', address: '',
    price_level: 2, average_spend: 20, rating: 4, review_count: 0,
    image_placeholder: 'lime-muted', hero_image: 'https://store/r1.jpg',
    instagram: null, phone: null, whatsapp: null, hours_kind: 'standard',
    vegetarian_friendly: false, vegan_friendly: false, gluten_free_options: false,
    is_partner: false,
  }

  it('maps hero_image to heroImage', () => {
    expect(rowToRestaurant(base).heroImage).toBe('https://store/r1.jpg')
  })

  it('maps a null hero_image to undefined', () => {
    expect(rowToRestaurant({ ...base, hero_image: null }).heroImage).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the test**

Run: `cd frontend && npx vitest run src/lib/supabase.test.ts`
Expected: PASS (existing cases plus the two new ones).

- [ ] **Step 3: Full suite + lint**

Run:
```bash
cd frontend
npm test
npm run lint
```
Expected: all tests pass; `tsc --noEmit` reports no errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/max/Projects/FoodMatch
git add frontend/src/lib/supabase.test.ts
git commit -m "test(images): lock hero_image -> heroImage mapping"
```

---

### Task 9: Live proof (manual, gated on the kie key + spend approval)

Generate ONE real cover end to end and confirm the app renders it. This is the only step that spends money. Do not run it until the user has put a (rotated) `KIE_API_KEY` in `frontend/.env` and approved the small spend.

- [ ] **Step 1: Confirm the kie model id**

Verify `KIE_MODEL` in `frontend/scripts/lib/kieImage.mjs` matches the model that produced `website/img/hero-*.jpg`. If unsure, generate a one-off test image via the kie.ai dashboard/docs with that model before the paid run here.

- [ ] **Step 2: Pick a target slug and preview the prompt (no spend)**

```bash
cd frontend
node scripts/generateHeroImage.mjs --missing --dry-run | head -5
# choose one slug from the output, e.g. SLUG=<slug>
node scripts/generateHeroImage.mjs <slug> --dry-run
```
Expected: a sensible food-forward prompt for that restaurant's cuisine.

- [ ] **Step 3: Generate for real (one restaurant)**

```bash
cd frontend
node scripts/generateHeroImage.mjs <slug>
```
Expected: `+ <slug>: https://<project>.supabase.co/storage/v1/object/public/restaurant-images/<slug>.jpg` and `Done. 1 generated, 0 skipped, 0 failed.`

- [ ] **Step 4: Verify storage + DB + render**

```bash
# the public URL returns image bytes
curl -sS -o /dev/null -w "%{http_code} %{content_type}\n" "<public-url-from-step-3>"
```
Expected: `200 image/jpeg`.

Then confirm the DB column is set and the app shows the photo:
```bash
cd frontend
node -e "import('@supabase/supabase-js').then(async ({createClient})=>{const fs=await import('node:fs');const env=Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').map(l=>l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map(m=>[m[1],m[2]]));const s=createClient(env.VITE_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});const {data}=await s.from('restaurants').select('slug,hero_image').eq('slug','<slug>').single();console.log(data)})"
```
Expected: `{ slug: '<slug>', hero_image: 'https://.../restaurant-images/<slug>.jpg' }`.

Finally, run the app (`npm run dev`) with Supabase env set, open that restaurant, and confirm `RestaurantCover` shows the photo instead of the gradient. (If the dev app falls back to seed data, the seed copy has no `heroImage`; verify against live Supabase data, e.g. the detail page which reads `getRestaurantBySlug` from Supabase.)

- [ ] **Step 5: Report results to the user** (cost spent, URL, screenshot). No commit (no code change in this task).

---

## Self-Review

**Spec coverage:**
- Supabase Storage bucket + public URL in `hero_image`: Task 5 (`ensureBucket`, upload, `getPublicUrl`, DB update), proven in Task 9.
- Reusable Node generator + CLI (`--missing`/`--force`/`--dry-run`): Tasks 4, 5, 6.
- Food-forward per-cuisine prompt map + style suffix + default + accent keys: Task 1.
- kie create/poll + malformed-JSON URL extraction: Task 2.
- weserv download with fallback: Task 3.
- Secrets (`KIE_API_KEY` in `.env`/`.env.example`, rotate note): Task 7.
- Re-seed does not clobber `hero_image`: Task 7 (comment; behavior already true since the column is omitted from the upsert payload).
- App renders `heroImage` (no change) + regression lock: Task 8.
- Idempotency (skip if set unless `--force`): Task 5 tests.
- Live proof gated on spend: Task 9.
- Out of scope (200-batch, website-reads-DB, Edge Function auto-trigger): not implemented, as intended.

**Placeholder scan:** No TBD/TODO. The one deliberate "confirm before spending" is the kie model id (Task 9 Step 1), which is a verification action with concrete instructions, not a code placeholder.

**Type/name consistency:** kie's network call is `generateImage`; the pipeline orchestrator is `generateAndStoreHeroImage` (imported under that name in the CLI). Bucket constant `BUCKET = 'restaurant-images'` used consistently. `parseArgs` returns `{ slug, missing, force, dryRun }`, matching the CLI usage. `heroPrompt(cuisine, { vibe, name })` signature matches every call site.
