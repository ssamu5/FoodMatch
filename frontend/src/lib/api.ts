// MVP API layer.
// Read methods are async and route through Supabase when env is configured,
// falling back to seed data on missing-env or any error so the app never breaks.
// All access goes through this file so the swap to a real backend
// is a one-file change in the implementation, not the call sites.

import { SEED_RESTAURANTS } from '../data/seedRestaurants'
import type { Restaurant } from '../types/restaurant'
import type { FoodIntent, SearchEvent } from '../types/search'
import type { RestaurantLead, UserLead } from '../types/profile'
import { parseFoodIntent } from './foodIntent'
import { rankRestaurants } from './ranking'
import { SeedSource, runSearchPipeline } from './searchPipeline'
import { addRecentSearch, addRestaurantLead, addUserLead } from './storage'
import { supabase, supabaseEnabled } from './supabase'
import { SupabaseSource } from './supabaseSource'

const seedSource = new SeedSource(SEED_RESTAURANTS)
const liveSource = supabaseEnabled && supabase ? new SupabaseSource(supabase) : null
const restaurantSource = liveSource ?? seedSource

function nowIso(): string {
  return new Date().toISOString()
}

function id(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2)
}

export const api = {
  // ---------- Restaurants ----------

  async listRestaurants(): Promise<Restaurant[]> {
    if (liveSource) {
      try {
        return await liveSource.all()
      } catch (e) {
        console.warn('[api] supabase listRestaurants failed, using seed', e)
      }
    }
    return SEED_RESTAURANTS
  },

  async getRestaurantBySlug(slug: string): Promise<Restaurant | undefined> {
    if (liveSource && supabase) {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*, dishes(name, price_eur, tags, sort)')
          .eq('slug', slug)
          .maybeSingle()
        if (error) throw error
        if (data) {
          const { rowToRestaurant } = await import('./supabase')
          return rowToRestaurant(data as Parameters<typeof rowToRestaurant>[0])
        }
        return undefined
      } catch (e) {
        console.warn('[api] supabase getRestaurantBySlug failed, using seed', e)
      }
    }
    return SEED_RESTAURANTS.find((r) => r.slug === slug)
  },

  async getRestaurantById(id: string): Promise<Restaurant | undefined> {
    const all = await this.listRestaurants()
    return all.find((r) => r.id === id)
  },

  async getRestaurantsByIds(ids: string[]): Promise<Restaurant[]> {
    const set = new Set(ids)
    const all = await this.listRestaurants()
    return all.filter((r) => set.has(r.id))
  },

  // ---------- Search ----------

  async search(query: string, _opts: { hardFilterOpenNow?: boolean } = {}): Promise<{
    intent: FoodIntent
    results: Restaurant[]
    rankedResults: ReturnType<typeof rankRestaurants>
    event: SearchEvent
  }> {
    const intent = parseFoodIntent(query)
    const { results, rankedResults } = await this.searchByIntent(intent)
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

  async searchByIntent(intent: FoodIntent, _opts: { hardFilterOpenNow?: boolean } = {}): Promise<{
    results: Restaurant[]
    rankedResults: ReturnType<typeof rankRestaurants>
  }> {
    try {
      const p = await runSearchPipeline(intent, restaurantSource, { minScore: 10 })
      return { results: p.results, rankedResults: p.ranked }
    } catch (e) {
      console.warn('[api] supabase search failed, using seed', e)
      const p = await runSearchPipeline(intent, seedSource, { minScore: 10 })
      return { results: p.results, rankedResults: p.ranked }
    }
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
    if (supabaseEnabled && supabase) {
      const anyLead = lead as Record<string, unknown>
      supabase.from('restaurant_claims').insert({
        restaurant_slug: (anyLead.restaurantSlug as string) ?? null,
        restaurant_name: lead.restaurantName,
        owner_name: lead.ownerName,
        email: lead.email,
        phone: lead.phone ?? null,
        area: lead.area ?? null,
        cuisine: lead.cuisine ?? null,
        price_band: lead.priceBand ?? null,
        menu_link: lead.menuLink ?? null,
        has_photos: lead.hasPhotos ?? null,
        message: lead.message ?? null,
        source: lead.source ?? 'form',
      }).then(({ error }) => { if (error) console.warn('[api] claim insert failed', error) })
    }
    return stored
  },
}
