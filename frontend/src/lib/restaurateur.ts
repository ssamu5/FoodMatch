import { supabase, supabaseEnabled, rowToRestaurant } from './supabase'
import type { Restaurant } from '../types/restaurant'

async function uid(): Promise<string | null> {
  if (!supabaseEnabled || !supabase) return null
  try {
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null
  }
}

export interface RestaurantEdit {
  slug: string
  name: string
  description: string
  descriptionEs: string
  address: string
  phone: string
  instagram: string
  whatsapp: string
}

// Restaurants owned by the signed-in user.
export async function getMyRestaurants(): Promise<Restaurant[]> {
  const id = await uid()
  if (!id || !supabase) return []
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*, dishes(name, price_eur, tags, sort)')
      .eq('owner_id', id)
    if (error) throw error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any) => rowToRestaurant(row))
  } catch (e) {
    console.warn('[restaurateur] getMyRestaurants failed', e)
    return []
  }
}

export async function claimRestaurant(slug: string): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'no supabase' }
  try {
    const { error } = await supabase.rpc('claim_restaurant', { p_slug: slug.trim() })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export async function updateMyRestaurant(edit: RestaurantEdit): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'no supabase' }
  try {
    const { error } = await supabase.rpc('update_my_restaurant', {
      p_slug: edit.slug,
      p_name: edit.name,
      p_description: edit.description,
      p_description_es: edit.descriptionEs,
      p_address: edit.address,
      p_phone: edit.phone,
      p_instagram: edit.instagram,
      p_whatsapp: edit.whatsapp,
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
