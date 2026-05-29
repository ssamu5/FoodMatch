import { describe, expect, it } from 'vitest'
import { SEED_RESTAURANTS } from '../data/seedRestaurants'
import { parseFoodIntent, intentFromProfile, profileHasSignal } from './foodIntent'
import { buildLeadMessage, buildWhatsAppUrl, hasVerifiedWhatsApp, menuHighlightsFor } from './leads'
import { rankRestaurants } from './ranking'
import type { TasteProfile } from '../types/profile'

const bySlug = (slug: string) => {
  const restaurant = SEED_RESTAURANTS.find((r) => r.slug === slug)
  if (!restaurant) throw new Error(`Missing seed restaurant: ${slug}`)
  return restaurant
}

describe('FoodMatch MVP craving flow', () => {
  it('parses a concrete Valencia craving into ranking signals', () => {
    const intent = parseFoodIntent('burger and beer near Ruzafa under 20')

    expect(intent.cuisines).toContain('burgers')
    expect(intent.area).toBe('Ruzafa')
    expect(intent.maxSpendEur).toBe(20)
    expect(intent.budgetLevel).toBe(2)
  })

  it('ranks a Ruzafa burger query toward Burger Republik', () => {
    const intent = parseFoodIntent('juicy burger in Ruzafa under 20')
    const [top] = rankRestaurants(intent, SEED_RESTAURANTS)

    expect(top.restaurantId).toBe(bySlug('burger-republik').id)
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
    expect(top.restaurantId).toBe(bySlug('kintaro-sushi').id)
  })
})

describe('FoodMatch MVP lead generation', () => {
  it('builds a WhatsApp reservation/order message with the diner craving', () => {
    const restaurant = bySlug('burger-republik')
    const message = buildLeadMessage(restaurant, 'juicy burger in Ruzafa under 20')

    expect(message).toContain('Burger Republik')
    expect(message).toContain('juicy burger in Ruzafa under 20')
    expect(message).toContain('Teneis disponibilidad?')
  })

  it('falls back to numberless WhatsApp for unverified demo restaurants', () => {
    const restaurant = bySlug('burger-republik')
    const url = buildWhatsAppUrl(restaurant, 'juicy burger')

    expect(hasVerifiedWhatsApp(restaurant)).toBe(false)
    expect(url).toMatch(/^https:\/\/wa\.me\/\?text=/)
    expect(decodeURIComponent(url)).toContain('Burger Republik')
  })

  it('prefers explicit menu highlights and otherwise provides cuisine samples', () => {
    const restaurant = bySlug('burger-republik')

    expect(menuHighlightsFor(restaurant).length).toBeGreaterThanOrEqual(2)
    expect(menuHighlightsFor(restaurant).join(' ')).toMatch(/burger|fries|beer/i)
  })
})
