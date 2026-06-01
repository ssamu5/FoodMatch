// Typed localStorage wrappers for FoodMatch MVP state.
// Saves and recent searches live entirely client-side until Supabase backend exists.

import type { Account, TasteProfile, UserLead, RestaurantLead } from '../types/profile'
import type { SearchEvent } from '../types/search'

const KEY_SAVED = 'foodmatch.savedRestaurants'
const KEY_RECENT_SEARCHES = 'foodmatch.recentSearches'
const KEY_PROFILE = 'foodmatch.tasteProfile'
const KEY_USER_LEADS = 'foodmatch.userLeads'
const KEY_RESTAURANT_LEADS = 'foodmatch.restaurantLeads'
const KEY_ACCOUNT = 'foodmatch.account'

const memoryStore = new Map<string, string>()

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key) ?? memoryStore.get(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    try {
      const raw = memoryStore.get(key)
      if (!raw) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }
}

function safeSet(key: string, value: unknown): void {
  const serialized = JSON.stringify(value)
  memoryStore.set(key, serialized)
  try {
    localStorage.setItem(key, serialized)
  } catch {
    /* quota exceeded or storage blocked; in-memory fallback keeps this session usable */
  }
}

// ---------- Saved restaurants ----------

export function getSavedIds(): string[] {
  return safeGet<string[]>(KEY_SAVED, [])
}

export function isSaved(id: string): boolean {
  return getSavedIds().includes(id)
}

export function saveRestaurant(id: string): string[] {
  const current = getSavedIds()
  if (current.includes(id)) return current
  const updated = [id, ...current]
  safeSet(KEY_SAVED, updated)
  return updated
}

export function unsaveRestaurant(id: string): string[] {
  const updated = getSavedIds().filter((x) => x !== id)
  safeSet(KEY_SAVED, updated)
  return updated
}

// ---------- Recent searches ----------

const MAX_RECENT = 12

export function getRecentSearches(): SearchEvent[] {
  return safeGet<SearchEvent[]>(KEY_RECENT_SEARCHES, [])
}

export function addRecentSearch(event: SearchEvent): SearchEvent[] {
  const list = getRecentSearches()
  // Dedupe by query string, keep newest at top
  const filtered = list.filter((e) => e.query !== event.query)
  const updated = [event, ...filtered].slice(0, MAX_RECENT)
  safeSet(KEY_RECENT_SEARCHES, updated)
  return updated
}

export function removeRecentSearch(query: string): SearchEvent[] {
  const updated = getRecentSearches().filter((e) => e.query !== query)
  safeSet(KEY_RECENT_SEARCHES, updated)
  return updated
}

export function clearRecentSearches(): void {
  safeSet(KEY_RECENT_SEARCHES, [])
}

// ---------- Taste profile ----------

const EMPTY_PROFILE: TasteProfile = {
  favoriteCuisines: [],
  budgetComfort: null,
  preferredAreas: [],
  dietary: [],
  vibePreferences: [],
  email: null,
  updatedAt: new Date(0).toISOString(),
}

export function getTasteProfile(): TasteProfile {
  return safeGet<TasteProfile>(KEY_PROFILE, EMPTY_PROFILE)
}

export function saveTasteProfile(profile: TasteProfile): void {
  safeSet(KEY_PROFILE, { ...profile, updatedAt: new Date().toISOString() })
}

// ---------- Account (local demo identity for the pilot) ----------

export function getAccount(): Account | null {
  return safeGet<Account | null>(KEY_ACCOUNT, null)
}

export function saveAccount(account: Account): void {
  safeSet(KEY_ACCOUNT, account)
}

export function clearAccount(): void {
  try {
    localStorage.removeItem(KEY_ACCOUNT)
  } catch {
    /* ignore */
  }
  memoryStore.delete(KEY_ACCOUNT)
}

// First-run welcome: shown once. Set when the user signs in OR skips, so we
// never nag on later launches.
const KEY_WELCOME_SEEN = 'foodmatch.welcomeSeen'

export function hasSeenWelcome(): boolean {
  if (getAccount()) return true
  return safeGet<boolean>(KEY_WELCOME_SEEN, false) === true
}

export function markWelcomeSeen(): void {
  safeSet(KEY_WELCOME_SEEN, true)
}

// ---------- Leads (stored locally until backend exists) ----------

export function getUserLeads(): UserLead[] {
  return safeGet<UserLead[]>(KEY_USER_LEADS, [])
}

export function addUserLead(lead: UserLead): UserLead[] {
  const list = getUserLeads()
  const updated = [lead, ...list]
  safeSet(KEY_USER_LEADS, updated)
  return updated
}

export function getRestaurantLeads(): RestaurantLead[] {
  return safeGet<RestaurantLead[]>(KEY_RESTAURANT_LEADS, [])
}

export function addRestaurantLead(lead: RestaurantLead): RestaurantLead[] {
  const list = getRestaurantLeads()
  const updated = [lead, ...list]
  safeSet(KEY_RESTAURANT_LEADS, updated)
  return updated
}
