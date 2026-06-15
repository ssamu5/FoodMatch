import { describe, expect, it } from 'vitest'
import { rowToRestaurant, type RestaurantRow } from './supabase'
import { openingFromHoursKind } from './openingHours'
import { isOpenAt } from './ranking'

function baseRow(overrides: Partial<RestaurantRow> = {}): RestaurantRow {
  return {
    id: 'r1', slug: 'r1', name: 'R1', description: '', cuisine: 'burgers',
    secondary_cuisines: [], tags: [], vibe: [], best_for: [], area: 'Ruzafa',
    city: 'Valencia', address: '', price_level: 2, average_spend: 20, rating: 4.2,
    review_count: 0, image_placeholder: 'lime', hero_image: null, instagram: null,
    phone: null, whatsapp: null, hours_kind: 'standard', vegetarian_friendly: false,
    vegan_friendly: false, gluten_free_options: false, is_partner: false,
    ...overrides,
  }
}

// Jan 2024: the 1st is a Monday, the 5th is a Friday. Built from local-time
// components, read back with local getDay()/getHours() inside isOpenAt.
const MON_21 = new Date(2024, 0, 1, 21, 0)
const MON_10 = new Date(2024, 0, 1, 10, 0)
const FRI_0100 = new Date(2024, 0, 5, 1, 0)

describe('rowToRestaurant opening reconstruction', () => {
  it('reconstructs opening from hours_kind so open-now is no longer a no-op', () => {
    const r = rowToRestaurant(baseRow({ hours_kind: 'late' }))
    expect(r.opening).toEqual(openingFromHoursKind('late'))
  })

  it('standard rows are open in the evening and closed before lunch', () => {
    const r = rowToRestaurant(baseRow({ hours_kind: 'standard' }))
    expect(isOpenAt(r, MON_21)).toBe(true)
    expect(isOpenAt(r, MON_10)).toBe(false)
  })

  it('brunch rows are open in the morning and closed at night (differs from standard)', () => {
    const r = rowToRestaurant(baseRow({ hours_kind: 'brunch' }))
    expect(isOpenAt(r, MON_10)).toBe(true)
    expect(isOpenAt(r, MON_21)).toBe(false)
  })

  it('late rows stay open past midnight when standard rows have closed', () => {
    const late = rowToRestaurant(baseRow({ hours_kind: 'late' }))
    const standard = rowToRestaurant(baseRow({ hours_kind: 'standard' }))
    expect(isOpenAt(late, FRI_0100)).toBe(true)
    expect(isOpenAt(standard, FRI_0100)).toBe(false)
  })
})

describe('rowToRestaurant hero_image mapping', () => {
  const base: RestaurantRow = {
    id: 'r1', slug: 'r1', name: 'R1', description: '', cuisine: 'paella',
    secondary_cuisines: [], tags: [], vibe: [], best_for: [],
    area: 'Ruzafa', city: 'Valencia', address: '',
    price_level: 2, average_spend: 20, rating: 4, review_count: 0,
    image_placeholder: 'lime-muted', hero_image: 'https://store/r1.jpg',
    instagram: null, phone: null, whatsapp: null, hours_kind: 'standard',
    vegetarian_friendly: false, vegan_friendly: false, gluten_free_options: false,
    is_partner: false,
  }

  it('maps hero_image to heroImage', () => {
    expect(rowToRestaurant(base).heroImage).toBe('https://store/r1.jpg')
  })

  it('maps a null hero_image to undefined', () => {
    expect(rowToRestaurant({ ...base, hero_image: null }).heroImage).toBeUndefined()
  })
})
