import { describe, it, expect } from 'vitest'
import { mergeFavoriteIds, rowToTasteProfile, tasteProfileToRow } from './userData'
import type { TasteProfile } from '../types/profile'

describe('mergeFavoriteIds', () => {
  it('unions local and remote, deduped, local order first', () => {
    expect(mergeFavoriteIds(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c'])
  })
  it('handles empty inputs', () => {
    expect(mergeFavoriteIds([], ['x'])).toEqual(['x'])
    expect(mergeFavoriteIds(['y'], [])).toEqual(['y'])
    expect(mergeFavoriteIds([], [])).toEqual([])
  })
})

describe('taste profile row mapping', () => {
  const profile: TasteProfile = {
    favoriteCuisines: ['paella'],
    preferredAreas: ['Ruzafa'],
    dietary: ['vegan'],
    vibePreferences: [],
    budgetComfort: 3,
    email: 'a@b.com',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }

  it('round-trips profile -> row -> profile', () => {
    const row = tasteProfileToRow('u1', profile)
    expect(row.user_id).toBe('u1')
    expect(row.favorite_cuisines).toEqual(['paella'])
    expect(row.preferred_areas).toEqual(['Ruzafa'])
    expect(row.budget_comfort).toBe(3)
    const back = rowToTasteProfile(row)
    expect(back.favoriteCuisines).toEqual(['paella'])
    expect(back.dietary).toEqual(['vegan'])
    expect(back.budgetComfort).toBe(3)
    expect(back.email).toBe('a@b.com')
  })

  it('defaults null budget/email and missing arrays', () => {
    const p = rowToTasteProfile({
      user_id: 'u', favorite_cuisines: [], preferred_areas: [], dietary: [],
      vibe_preferences: [], budget_comfort: null, email: null,
      updated_at: '2026-01-01T00:00:00.000Z',
    })
    expect(p.budgetComfort).toBeNull()
    expect(p.email).toBeNull()
    expect(p.favoriteCuisines).toEqual([])
  })
})
