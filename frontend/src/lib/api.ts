// MVP API layer.
// For now everything is mocked from seed data and localStorage.
// All access goes through this file so the swap to Supabase / backend later
// is a one-file change in the implementation, not the call sites.

import { SEED_RESTAURANTS } from '../data/seedRestaurants'
import type { Restaurant } from '../types/restaurant'
import type { FoodIntent, SearchEvent } from '../types/search'
import type { RestaurantLead, UserLead } from '../types/profile'
import { parseFoodIntent } from './foodIntent'
import { rankRestaurants } from './ranking'
import { addRecentSearch, addRestaurantLead, addUserLead } from './storage'

function nowIso(): string {
  return new Date().toISOString()
}

function id(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2)
}

export const api = {
  // ---------- Restaurants ----------

  listRestaurants(): Restaurant[] {
    return SEED_RESTAURANTS
  },

  getRestaurantBySlug(slug: string): Restaurant | undefined {
    return SEED_RESTAURANTS.find((r) => r.slug === slug)
  },

  getRestaurantById(id: string): Restaurant | undefined {
    return SEED_RESTAURANTS.find((r) => r.id === id)
  },

  getRestaurantsByIds(ids: string[]): Restaurant[] {
    const set = new Set(ids)
    return SEED_RESTAURANTS.filter((r) => set.has(r.id))
  },

  // ---------- Search ----------

  search(query: string, opts: { hardFilterOpenNow?: boolean } = {}): {
    intent: FoodIntent
    results: Restaurant[]
    rankedResults: ReturnType<typeof rankRestaurants>
    event: SearchEvent
  } {
    const intent = parseFoodIntent(query)
    const rankedResults = rankRestaurants(intent, SEED_RESTAURANTS, {
      hardFilterOpenNow: opts.hardFilterOpenNow ?? intent.mustBeOpenNow,
      minScore: 10,
    })
    const results = rankedResults
      .map((rr) => SEED_RESTAURANTS.find((r) => r.id === rr.restaurantId))
      .filter((x): x is Restaurant => Boolean(x))

    const event: SearchEvent = {
      id: id(),
      query,
      intent,
      resultIds: results.map((r) => r.id),
      topMatchId: results[0]?.id || null,
      createdAt: nowIso(),
      resultCount: results.length,
    }
    addRecentSearch(event)

    return { intent, results, rankedResults, event }
  },

  searchByIntent(intent: FoodIntent, opts: { hardFilterOpenNow?: boolean } = {}): {
    results: Restaurant[]
    rankedResults: ReturnType<typeof rankRestaurants>
  } {
    const rankedResults = rankRestaurants(intent, SEED_RESTAURANTS, {
      hardFilterOpenNow: opts.hardFilterOpenNow ?? intent.mustBeOpenNow,
      minScore: 10,
    })
    const results = rankedResults
      .map((rr) => SEED_RESTAURANTS.find((r) => r.id === rr.restaurantId))
      .filter((x): x is Restaurant => Boolean(x))
    return { results, rankedResults }
  },

  // ---------- Leads ----------

  submitUserLead(lead: Omit<UserLead, 'createdAt'>): UserLead {
    const stored: UserLead = { ...lead, createdAt: nowIso() }
    addUserLead(stored)
    return stored
  },

  submitRestaurantLead(lead: Omit<RestaurantLead, 'createdAt'>): RestaurantLead {
    const stored: RestaurantLead = { ...lead, createdAt: nowIso() }
    addRestaurantLead(stored)
    return stored
  },
}
