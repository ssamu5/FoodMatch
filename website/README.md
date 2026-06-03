# FoodMatch website

Static, bilingual (ES/EN), SEO-first marketing site + public restaurant pages
for **foodmatch.es**. No framework runtime, no CDN dependency: a small Node
generator renders plain HTML + one stylesheet into `dist/`.

## Why a generator (not a SPA / not Next)

The diner app lives in `../frontend` and is a **Capacitor-wrapped React SPA**
(it ships to iOS/Android). A SPA can't be crawled/indexed well, and adding SSR
there would break the mobile build. So public, indexable restaurant pages live
here as pre-rendered HTML. The generator reuses the **same restaurant slugs**
as the app (it parses `../frontend/src/data/seedRestaurants.ts`), so
`/valencia/<slug>` on the web and `/restaurant/<slug>` in the app stay aligned.

## Build

```bash
cd website
npm run build      # -> dist/
npm run preview    # build + serve dist/ at http://localhost:8899
```

Output (410 pages today): ES at `/`, EN under `/en`.

| Route | Page |
|-------|------|
| `/` , `/en` | Main landing (dual CTA: diners vs restaurants) |
| `/descubrir` , `/en/descubrir` | Diner landing |
| `/restaurantes` , `/en/restaurantes` | Restaurant landing |
| `/valencia` , `/en/valencia` | Explore index (browse by area/cuisine) |
| `/valencia/<slug>` , `/en/valencia/<slug>` | Public restaurant page (SEO) |
| `/reclamar` , `/en/reclamar` | Claim / add restaurant |
| `/sitemap.xml`, `/robots.txt` | Generated |

Every page has: localized `<title>` + meta description, canonical URL,
`hreflang` (es / en / x-default), Open Graph tags. Restaurant pages add
`Restaurant` JSON-LD (schema.org) with address, hours, price range, rating.

## Data source

`src/placesService.mjs` is the single seam. Today it returns the curated pilot
dataset. To wire **Google Places** later, implement `fetchFromGooglePlaces()`
and set `FOODMATCH_DATA_SOURCE=google` (needs `GOOGLE_PLACES_API_KEY`, see
`.env.example`). We never scrape or store menus: restaurants upload those when
they claim a listing. No API keys are committed.

## Deploy (Vercel) — safe cutover

The repo still contains the **legacy** single-page `index.html` and the live
`vercel.json` that serves it, so the current production site is untouched by
this work. To cut over to the new generated site:

1. In the Vercel project settings (or `vercel.json`), set:
   - **Build command:** `node build.mjs`
   - **Output directory:** `dist`
2. Redeploy. `cleanUrls` + the existing security headers can stay.
3. Once verified, the legacy `index.html` can be removed.

`dist/` is git-ignored (build artifact). Vercel builds it on deploy.

## Structure

```
website/
  build.mjs            # generator (entry)
  src/
    data.mjs           # parses the app seed -> restaurant objects (+ labels)
    i18n.mjs           # ES/EN copy dictionary + locale path helper
    components.mjs     # page shell (SEO head), header, footer, cards
    pages.mjs          # body templates per page + JSON-LD
    placesService.mjs  # data seam (seed today, Google Places later)
    styles.css         # design system (warm Mediterranean)
  .env.example         # documents future env vars (no secrets)
```
