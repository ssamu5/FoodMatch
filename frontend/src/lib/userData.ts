// Per-user data sync for favorites and the taste profile.
// Local-first: localStorage stays the synchronous cache (instant UI + offline).
// When signed in via Supabase, mirror to the favorites / taste_profiles tables
// (RLS: each user owns their rows) and reconcile local <-> server on login.

import { supabase, supabaseEnabled } from './supabase'
import {
  getSavedIds,
  setSavedIds,
  saveRestaurant,
  unsaveRestaurant,
  getTasteProfile,
  saveTasteProfile,
} from './storage'
import type { TasteProfile } from '../types/profile'

interface TasteRow {
  user_id: string
  favorite_cuisines: string[]
  preferred_areas: string[]
  dietary: string[]
  vibe_preferences: string[]
  budget_comfort: number | null
  email: string | null
  updated_at: string
}

export async function currentUserId(): Promise<string | null> {
  if (!supabaseEnabled || !supabase) return null
  try {
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null
  }
}

// Union of two id lists, order preserved (local first), deduped.
export function mergeFavoriteIds(local: string[], remote: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of [...local, ...remote]) {
    if (!seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  return out
}

export function rowToTasteProfile(row: TasteRow): TasteProfile {
  return {
    favoriteCuisines: (row.favorite_cuisines ?? []) as TasteProfile['favoriteCuisines'],
    preferredAreas: (row.preferred_areas ?? []) as TasteProfile['preferredAreas'],
    dietary: (row.dietary ?? []) as TasteProfile['dietary'],
    vibePreferences: (row.vibe_preferences ?? []) as TasteProfile['vibePreferences'],
    budgetComfort: (row.budget_comfort ?? null) as TasteProfile['budgetComfort'],
    email: row.email ?? null,
    updatedAt: row.updated_at ?? new Date(0).toISOString(),
  }
}

export function tasteProfileToRow(userId: string, p: TasteProfile): TasteRow {
  return {
    user_id: userId,
    favorite_cuisines: p.favoriteCuisines,
    preferred_areas: p.preferredAreas,
    dietary: p.dietary,
    vibe_preferences: p.vibePreferences,
    budget_comfort: p.budgetComfort,
    email: p.email,
    updated_at: p.updatedAt || new Date().toISOString(),
  }
}

// ---------- favorites ----------
export async function addFavorite(id: string): Promise<void> {
  saveRestaurant(id)
  const uid = await currentUserId()
  if (!uid || !supabase) return
  try {
    await supabase.from('favorites').upsert({ user_id: uid, restaurant_id: id })
  } catch (e) {
    console.warn('[userData] addFavorite remote failed', e)
  }
}

export async function removeFavorite(id: string): Promise<void> {
  unsaveRestaurant(id)
  const uid = await currentUserId()
  if (!uid || !supabase) return
  try {
    await supabase.from('favorites').delete().eq('user_id', uid).eq('restaurant_id', id)
  } catch (e) {
    console.warn('[userData] removeFavorite remote failed', e)
  }
}

// Reconcile local + server favorites. Returns merged ids and persists them locally.
export async function syncFavorites(): Promise<string[]> {
  const local = getSavedIds()
  const uid = await currentUserId()
  if (!uid || !supabase) return local
  try {
    const { data, error } = await supabase.from('favorites').select('restaurant_id')
    if (error) throw error
    const remote = (data ?? []).map((r: { restaurant_id: string }) => r.restaurant_id)
    const merged = mergeFavoriteIds(local, remote)
    const remoteSet = new Set(remote)
    const localOnly = local.filter((x) => !remoteSet.has(x))
    if (localOnly.length) {
      await supabase
        .from('favorites')
        .upsert(localOnly.map((restaurant_id) => ({ user_id: uid, restaurant_id })))
    }
    setSavedIds(merged)
    return merged
  } catch (e) {
    console.warn('[userData] syncFavorites failed', e)
    return local
  }
}

// ---------- taste profile ----------
export async function saveProfile(profile: TasteProfile): Promise<void> {
  saveTasteProfile(profile) // local; stamps updatedAt
  const uid = await currentUserId()
  if (!uid || !supabase) return
  try {
    await supabase.from('taste_profiles').upsert(tasteProfileToRow(uid, getTasteProfile()))
  } catch (e) {
    console.warn('[userData] saveProfile remote failed', e)
  }
}

// Reconcile local + server profile (newest wins). Returns the winner, persisted locally.
export async function syncProfile(): Promise<TasteProfile> {
  const local = getTasteProfile()
  const uid = await currentUserId()
  if (!uid || !supabase) return local
  try {
    const { data, error } = await supabase
      .from('taste_profiles')
      .select('*')
      .eq('user_id', uid)
      .maybeSingle()
    if (error) throw error
    if (!data) {
      await supabase.from('taste_profiles').upsert(tasteProfileToRow(uid, local))
      return local
    }
    const remote = rowToTasteProfile(data as TasteRow)
    const remoteWins = remote.updatedAt >= local.updatedAt
    const winner = remoteWins ? remote : local
    saveTasteProfile(winner)
    if (!remoteWins) {
      await supabase.from('taste_profiles').upsert(tasteProfileToRow(uid, local))
    }
    return winner
  } catch (e) {
    console.warn('[userData] syncProfile failed', e)
    return local
  }
}

// Call right after a successful Supabase login/register.
export async function syncOnLogin(): Promise<void> {
  await syncFavorites()
  await syncProfile()
}
