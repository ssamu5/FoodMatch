import type { Cuisine, Area, Vibe } from './restaurant'

export type Occasion = 'date' | 'solo' | 'friends' | 'family' | 'work'
export type TimePref = 'now' | 'lunch' | 'dinner' | 'late'
export type DistancePref = 'near_me' | 'area' | 'anywhere'

export interface FoodIntent {
  rawQuery: string
  cuisines: Cuisine[]
  dishes: string[]         // specific dish terms the user asked for, e.g. ['paella']
  avoidCuisines: Cuisine[]
  budgetLevel: 1 | 2 | 3 | 4 | null
  maxSpendEur: number | null
  area: Area | null
  city: string             // defaults to 'Valencia'
  distancePreference: DistancePref
  vibe: Vibe[]
  occasion: Occasion | null
  dietary: ('vegetarian' | 'vegan' | 'gluten-free')[]
  time: TimePref | null
  mustBeOpenNow: boolean
}

// Structured reason/warning tokens emitted by the ranker.
// Use formatReason/formatWarning in lib/reasonFormatter.ts to localize them.
export type ReasonToken =
  | { key: 'cuisineMatch'; vars: { cuisine: string } }
  | { key: 'alsoServes'; vars: { cuisine: string } }
  | { key: 'servesOne'; vars: { dish: string } }
  | { key: 'servesMany'; vars: { dish1: string; dish2: string } }
  | { key: 'vibe'; vars: { vibe: string } }
  | { key: 'rated'; vars: { rating: string } }
  | { key: 'areaIn'; vars: { area: string } }
  | { key: 'centralLocation' }
  | { key: 'budgetFits'; vars: { spend: string } }
  | { key: 'priceLevelMatches' }
  | { key: 'dietary'; vars: { flags: string } }

export type WarningToken =
  | { key: 'closedNow' }
  | { key: 'slightlyOver'; vars: { budget: string } }
  | { key: 'over'; vars: { budget: string } }
  | { key: 'mayNotCover'; vars: { flags: string } }

export interface MatchScore {
  score: number          // 0-100
  reasons: ReasonToken[]
  warnings: WarningToken[]
}

export interface RankedResult {
  restaurantId: string
  score: MatchScore
}

export interface SearchEvent {
  id: string             // uuid-ish
  query: string
  intent: FoodIntent
  resultIds: string[]
  topMatchId: string | null
  createdAt: string
  resultCount: number
}
