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

// Shown on public (unclaimed) restaurant detail pages.
export const PUBLIC_LISTING_NOTE =
  'This profile is built from publicly available information so diners can discover the place. If you run it, you can claim the listing to verify details, add photos and menu, and see demand insights.'

// Shown on verified partner detail pages.
export const VERIFIED_LISTING_NOTE =
  'Details on this listing are managed by the restaurant as a FoodMatch partner.'
