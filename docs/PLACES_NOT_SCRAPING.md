# Restaurant data: Google Places API, not scraping

**Question (from investors, via Samuel):** should we scan/scrape every
restaurant in Valencia to populate FoodMatch?

**Short answer: no scraping. Use the Google Places API instead.**

## Why not scraping
- **Legal.** Scraping Google Maps / TheFork breaks their Terms of Service,
  and harvesting business + personal data at scale runs into EU/Spain data
  law (GDPR, LSSI). That is a takedown/liability risk to put under the
  company right as we pitch investors.
- **Quality.** Scraped data is stale, inconsistent, and generic. 200
  clean, well-presented places demo better than 3,000 messy ones.
- **Strategy.** Coverage is Google's game; we will not out-cover Google.
  FoodMatch's edge is curation + the restaurant relationship, the fast
  vibe-led "where should we eat" decision. Scraping does not build that.

## The legitimate path
- **Google Places API** is licensed and paid, with clear terms. It gives
  name, address, phone, hours, location, rating, and photos (with required
  attribution). We seed *basic* public listings from it; restaurants then
  claim and enrich (menu, photos, offers).
- The code seam already exists: `website/src/placesService.mjs` and the
  app's `api` layer are written so the data source swaps in cleanly. See
  `FOODMATCH_DATA_SOURCE` / `GOOGLE_PLACES_API_KEY` in
  `website/.env.example`.
- **Never scrape or import menus.** Menus are uploaded/managed by
  restaurants. Places photos require "Powered by Google" attribution and
  caching limits; honour them before enabling.

## What to tell investors
"We seed basic listings via the licensed Google Places API, then win on
curation and restaurant relationships. We don't scrape, that's a legal and
quality liability, and coverage isn't our moat."
