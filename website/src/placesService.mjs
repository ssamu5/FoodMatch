// placesService — single seam for restaurant data.
//
// TODAY: returns the curated pilot dataset parsed from the app's seed file.
// The whole website builds against this interface, so swapping the source
// later is a one-file change with no template edits.
//
// FUTURE (Google Places API): implement `fetchFromGooglePlaces()` below and
// flip DATA_SOURCE. Requires GOOGLE_PLACES_API_KEY (see .env.example). We do
// NOT call any external API here and ship NO keys. We also never scrape or
// import menus: menus are uploaded/managed by restaurants when they claim a
// listing. Google Places content has usage/attribution terms; honour them
// before enabling (cache policy, photo attribution, "powered by Google").

import { loadRestaurants } from './data.mjs'

const DATA_SOURCE = process.env.FOODMATCH_DATA_SOURCE || 'seed' // 'seed' | 'google'

/**
 * Return all restaurants for the build. Async to match a future network
 * source. Each item is the plain shape used across the templates.
 */
export async function getRestaurants() {
  if (DATA_SOURCE === 'google') {
    // Not implemented on purpose. See fetchFromGooglePlaces().
    throw new Error(
      'Google Places source not implemented yet. Set FOODMATCH_DATA_SOURCE=seed or implement fetchFromGooglePlaces().',
    )
  }
  return loadRestaurants()
}

export async function getRestaurantBySlug(slug) {
  const all = await getRestaurants()
  return all.find((r) => r.slug === slug) || null
}

/* ---------------------------------------------------------------------------
 * FUTURE: Google Places integration sketch (do not enable without review).
 *
 * async function fetchFromGooglePlaces() {
 *   const key = process.env.GOOGLE_PLACES_API_KEY
 *   if (!key) throw new Error('GOOGLE_PLACES_API_KEY missing')
 *   // 1. Text/Nearby Search for restaurants in Valencia (paginate).
 *   // 2. Place Details for: name, formatted_address, geometry, phone,
 *   //    opening_hours, website, rating, user_ratings_total, types, photos.
 *   // 3. Map types -> our `cuisine` enum; derive `area` from address.
 *   // 4. Generate stable slugs (slugify(name) + dedupe), mark isPartner=false.
 *   // 5. Cache results to disk (respect Places caching policy) and add the
 *   //    required "Powered by Google" attribution + photo attributions.
 *   // 6. Do NOT fetch or store menus.
 *   return []
 * }
 * ------------------------------------------------------------------------- */
