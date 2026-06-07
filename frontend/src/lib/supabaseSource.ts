import type { SupabaseClient } from '@supabase/supabase-js'
import type { Restaurant } from '../types/restaurant'
import type { HardFilter, RestaurantSource } from './searchPipeline'
import { rowToRestaurant, type RestaurantRow } from './supabase'

const SELECT = '*, dishes(name, price_eur, tags, sort)'

// Reads restaurants (+ nested dishes) from Supabase. The coarse filter runs
// server-side (the SQL WHERE seam); ranking happens client-side on the result.
export class SupabaseSource implements RestaurantSource {
  constructor(private client: SupabaseClient) {}

  async all(): Promise<Restaurant[]> {
    const { data, error } = await this.client.from('restaurants').select(SELECT)
    if (error) throw error
    return (data as RestaurantRow[]).map(rowToRestaurant)
  }

  async find(filter: HardFilter): Promise<Restaurant[]> {
    let q = this.client.from('restaurants').select(SELECT)
    if (filter.area) q = q.eq('area', filter.area)
    if (filter.maxSpendEur != null) q = q.lte('average_spend', Math.round(filter.maxSpendEur * 1.2))
    if (filter.cuisines && filter.cuisines.length) {
      const list = filter.cuisines.map((c) => `"${c}"`).join(',')
      q = q.or(`cuisine.in.(${list}),secondary_cuisines.ov.{${filter.cuisines.join(',')}}`)
    }
    const { data, error } = await q
    if (error) throw error
    let rows = (data as RestaurantRow[]).map(rowToRestaurant)
    if (filter.avoidCuisines && filter.avoidCuisines.length) {
      rows = rows.filter(
        (r) =>
          !filter.avoidCuisines!.includes(r.cuisine) &&
          !(r.secondaryCuisines ?? []).some((c) => filter.avoidCuisines!.includes(c)),
      )
    }
    return rows
  }
}
