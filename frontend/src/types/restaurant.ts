// Seed/demo data shape for the MVP.
// When the backend lands, this maps 1:1 to the API restaurant resource.

export type PriceLevel = 1 | 2 | 3 | 4

export type Area =
  | 'Ruzafa'
  | 'El Carmen'
  | 'Canovas'
  | 'Benimaclet'
  | 'City center'
  | 'Marina / beach'

export type Cuisine =
  | 'Spanish tapas'
  | 'paella'
  | 'sushi'
  | 'burgers'
  | 'pizza'
  | 'pasta'
  | 'healthy bowls'
  | 'vegan'
  | 'vegetarian'
  | 'brunch'
  | 'coffee'
  | 'Mexican'
  | 'Indian'
  | 'Asian fusion'
  | 'Mediterranean'
  | 'seafood'
  | 'steak'
  | 'menú del día'
  | 'bar'

export type Vibe =
  | 'romantic'
  | 'casual'
  | 'lively'
  | 'quiet'
  | 'date'
  | 'group'
  | 'solo'
  | 'family'
  | 'work'
  | 'late night'
  | 'outdoor'
  | 'view'
  | 'cozy'
  | 'cheap eats'

export interface OpeningInfo {
  // Simplified opening info for MVP.
  // dayOfWeek 0 = Sunday, 6 = Saturday
  weeklySchedule: Array<{
    dayOfWeek: number
    open: string  // "HH:MM" 24h
    close: string // "HH:MM" 24h, may wrap past midnight
  }>
  notes?: string
}

export interface Dish {
  name: string
  priceEur?: number
  tags?: string[]
}

export interface Restaurant {
  id: string
  slug: string
  name: string
  description: string
  descriptionEs?: string // Spanish blurb (peninsular). Optional; see lib/descriptions.

  cuisine: Cuisine
  secondaryCuisines?: Cuisine[]
  tags: string[]
  vibe: Vibe[]
  bestFor: string[]      // "first dates", "groups of 6", "long lunch", etc

  area: Area
  city: string           // always "Valencia" for V1 seed
  address: string

  priceLevel: PriceLevel // 1 = cheap, 4 = high-end
  averageSpend: number   // EUR per person

  rating: number         // 0-5
  reviewCount: number

  imagePlaceholder: string // gradient seed (lime variants) for now
  heroImage?: string        // real photo URL when a restaurant claims its listing. Falls back to a generated cuisine cover.

  website?: string
  instagram?: string
  phone?: string
  whatsapp?: string      // verified WhatsApp number (E.164-ish). Absent in seed/demo data.

  menuHighlights?: string[] // 2-4 signature dishes. Falls back to a cuisine preset when absent.
  menu?: Dish[]             // structured menu; the field a restaurant edits after claiming. Sample data until verified.

  opening?: OpeningInfo

  // Dietary
  vegetarianFriendly: boolean
  veganFriendly: boolean
  glutenFreeOptions: boolean

  isPartner: boolean    // FoodMatch partner with verified content
}
