import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Restaurant, Cuisine, Area, Dish } from '../types/restaurant'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env as Record<string, string | undefined>
const url: string | undefined = env.VITE_SUPABASE_URL
const anon: string | undefined = env.VITE_SUPABASE_ANON_KEY

export const supabaseEnabled = Boolean(url && anon)

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url as string, anon as string, { auth: { persistSession: false } })
  : null

// Rows come back snake_case, with optional nested dishes.
export interface RestaurantRow {
  id: string
  slug: string
  name: string
  description: string
  cuisine: string
  secondary_cuisines: string[]
  tags: string[]
  vibe: string[]
  best_for: string[]
  area: string
  city: string
  address: string
  price_level: number
  average_spend: number
  rating: number
  review_count: number
  image_placeholder: string
  hero_image: string | null
  instagram: string | null
  phone: string | null
  whatsapp: string | null
  hours_kind: string
  vegetarian_friendly: boolean
  vegan_friendly: boolean
  gluten_free_options: boolean
  is_partner: boolean
  dishes?: Array<{ name: string; price_eur: number | null; tags: string[] | null; sort: number }>
}

export function rowToRestaurant(row: RestaurantRow): Restaurant {
  const menu: Dish[] | undefined = row.dishes && row.dishes.length
    ? [...row.dishes].sort((a, b) => a.sort - b.sort).map((d) => ({
        name: d.name,
        priceEur: d.price_eur ?? undefined,
        tags: d.tags ?? undefined,
      }))
    : undefined
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    cuisine: row.cuisine as Cuisine,
    secondaryCuisines: (row.secondary_cuisines as Cuisine[]) ?? [],
    tags: row.tags ?? [],
    vibe: row.vibe as Restaurant['vibe'],
    bestFor: row.best_for ?? [],
    area: row.area as Area,
    city: row.city,
    address: row.address,
    priceLevel: row.price_level as Restaurant['priceLevel'],
    averageSpend: row.average_spend,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    imagePlaceholder: row.image_placeholder,
    heroImage: row.hero_image ?? undefined,
    instagram: row.instagram ?? undefined,
    phone: row.phone ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    menu,
    vegetarianFriendly: row.vegetarian_friendly,
    veganFriendly: row.vegan_friendly,
    glutenFreeOptions: row.gluten_free_options,
    isPartner: row.is_partner,
  }
}
