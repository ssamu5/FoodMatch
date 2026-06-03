import { describe, expect, it, vi } from 'vitest'
import { SEED_RESTAURANTS } from '../data/seedRestaurants'
import { parseFoodIntent, intentFromProfile, profileHasSignal } from './foodIntent'
import { buildLeadMessage, buildWhatsAppUrl, hasVerifiedWhatsApp, menuHighlightsFor } from './leads'
import { rankRestaurants } from './ranking'
import { getSavedIds, saveRestaurant, unsaveRestaurant } from './storage'
import type { TasteProfile } from '../types/profile'

// Data-driven fixtures: derive concrete restaurants from the CURRENT seed so
// these tests survive a seed regeneration (slugs/names change, the shape and
// ranking behaviour do not).
const firstByCuisine = (cuisine: string) => {
  const r = SEED_RESTAURANTS.find((x) => x.cuisine === cuisine)
  if (!r) throw new Error(`No seed restaurant for cuisine: ${cuisine}`)
  return r
}
const aBurgerSpot = firstByCuisine('burgers')

describe('FoodMatch MVP craving flow', () => {
  it('parses a concrete Valencia craving into ranking signals', () => {
    const intent = parseFoodIntent('burger and beer near Ruzafa under 20')

    expect(intent.cuisines).toContain('burgers')
    expect(intent.area).toBe('Ruzafa')
    expect(intent.maxSpendEur).toBe(20)
    expect(intent.budgetLevel).toBe(2)
  })

  it('ranks a Ruzafa burger query toward a Ruzafa burger spot', () => {
    const intent = parseFoodIntent('juicy burger in Ruzafa under 20')
    const [top] = rankRestaurants(intent, SEED_RESTAURANTS)
    const topR = SEED_RESTAURANTS.find((r) => r.id === top.restaurantId)!

    // The best match should be a burger place in Ruzafa, with a reason that
    // names the cuisine, area, or budget fit.
    expect(topR.cuisine).toBe('burgers')
    expect(topR.area).toBe('Ruzafa')
    expect(top.score.reasons.join(' ')).toMatch(/burgers|Ruzafa|budget/i)
  })

  it('uses saved taste profile when browsing without a query', () => {
    const profile: TasteProfile = {
      dietary: [],
      budgetComfort: 4,
      preferredAreas: ['Ruzafa'],
      favoriteCuisines: ['sushi'],
      vibePreferences: ['date'],
      email: null,
      updatedAt: '2026-05-29T00:00:00.000Z',
    }

    expect(profileHasSignal(profile)).toBe(true)
    const intent = intentFromProfile(profile)
    const [top] = rankRestaurants(intent, SEED_RESTAURANTS)

    expect(intent.rawQuery).toBe('')
    expect(intent.cuisines).toEqual(['sushi'])
    expect(intent.area).toBe('Ruzafa')
    // Top pick should be a sushi spot in the preferred area.
    const topR = SEED_RESTAURANTS.find((r) => r.id === top.restaurantId)!
    expect(topR.cuisine).toBe('sushi')
    expect(topR.area).toBe('Ruzafa')
  })
})

describe('FoodMatch MVP lead generation', () => {
  it('builds a WhatsApp reservation/order message with the diner craving', () => {
    const restaurant = aBurgerSpot
    const message = buildLeadMessage(restaurant, 'juicy burger in Ruzafa under 20')

    expect(message).toContain(restaurant.name)
    expect(message).toContain('juicy burger in Ruzafa under 20')
    expect(message).toContain('Teneis disponibilidad?')
  })

  it('falls back to numberless WhatsApp for unverified demo restaurants', () => {
    const restaurant = aBurgerSpot
    const url = buildWhatsAppUrl(restaurant, 'juicy burger')

    expect(hasVerifiedWhatsApp(restaurant)).toBe(false)
    expect(url).toMatch(/^https:\/\/wa\.me\/\?text=/)
    expect(decodeURIComponent(url)).toContain(restaurant.name)
  })

  it('prefers explicit menu highlights and otherwise provides cuisine samples', () => {
    const restaurant = aBurgerSpot

    expect(menuHighlightsFor(restaurant).length).toBeGreaterThanOrEqual(2)
    expect(menuHighlightsFor(restaurant).join(' ')).toMatch(/burger|fries|beer/i)
  })
})

describe('FoodMatch MVP local state', () => {
  it('keeps saves usable in-session when localStorage is blocked', () => {
    const getSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })

    try {
      const id = aBurgerSpot.id
      unsaveRestaurant(id)

      saveRestaurant(id)
      expect(getSavedIds()).toContain(id)

      unsaveRestaurant(id)
      expect(getSavedIds()).not.toContain(id)
    } finally {
      getSpy.mockRestore()
      setSpy.mockRestore()
    }
  })
})
