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

export interface MatchScore {
  score: number          // 0-100
  reasons: string[]
  warnings: string[]
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
