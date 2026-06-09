// Public-listing positioning for the MVP.
// FoodMatch shows restaurants from public information so the app looks
// populated and useful early. Owners can later claim/upgrade a listing.
// This is modelled through copy + the existing `isPartner` flag; there is
// no scraping or external ingestion in the MVP.

import type { Restaurant } from '../types/restaurant'

export type ListingTier = 'verified' | 'public'

export function listingTier(r: Restaurant): ListingTier {
  return r.isPartner ? 'verified' : 'public'
}

export function listingTierLabel(r: Restaurant): string {
  return r.isPartner ? 'Verified partner' : 'Public listing'
}
