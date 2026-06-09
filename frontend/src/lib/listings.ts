// Public-listing positioning for the MVP.
// FoodMatch shows restaurants from public information so the app looks
// populated and useful early. Owners can later claim/upgrade a listing.
// This is modelled through copy + the existing `isPartner` flag; there is
// no scraping or external ingestion in the MVP.

export type ListingTier = 'verified' | 'public'

