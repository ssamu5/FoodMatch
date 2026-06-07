import { describe, expect, it } from 'vitest'
import { SupabaseSource } from './supabaseSource'
import type { RestaurantRow } from './supabase'

// Minimal mock of the supabase query builder. The builder is thenable so
// `await query` resolves to { data, error }. Chain methods return `this`.
function mockClient(rows: RestaurantRow[]) {
  const builder: any = {
    _rows: rows,
    select() { return this },
    eq() { return this },
    lte() { return this },
    in() { return this },
    or() { return this },
    then(resolve: any) { return resolve({ data: this._rows, error: null }) },
  }
  return { from: () => builder } as any
}

const sampleRow: RestaurantRow = {
  id: 'r-001', slug: 'taberna-pepe', name: 'Taberna Pepe', description: 'Tapas spot',
  cuisine: 'Spanish tapas', secondary_cuisines: [], tags: ['tapas'], vibe: ['lively'], best_for: ['sharing'],
  area: 'Ruzafa', city: 'Valencia', address: 'Calle 1', price_level: 2, average_spend: 20,
  rating: 4.5, review_count: 100, image_placeholder: 'lime-warm', hero_image: null,
  instagram: null, phone: null, whatsapp: null, hours_kind: 'standard',
  vegetarian_friendly: true, vegan_friendly: false, gluten_free_options: false, is_partner: true,
  dishes: [{ name: 'Croquetas', price_eur: 8, tags: [], sort: 0 }],
}

describe('SupabaseSource', () => {
  it('maps rows to Restaurant with nested menu', async () => {
    const src = new SupabaseSource(mockClient([sampleRow]))
    const all = await src.all()
    expect(all).toHaveLength(1)
    expect(all[0].name).toBe('Taberna Pepe')
    expect(all[0].cuisine).toBe('Spanish tapas')
    expect(all[0].menu?.[0]).toEqual({ name: 'Croquetas', priceEur: 8, tags: [] })
    expect(all[0].isPartner).toBe(true)
  })

  it('returns mapped rows from find()', async () => {
    const src = new SupabaseSource(mockClient([sampleRow]))
    const rows = await src.find({ cuisines: ['Spanish tapas'] })
    expect(rows).toHaveLength(1)
    expect(rows[0].slug).toBe('taberna-pepe')
  })

  it('applies avoidCuisines client-side', async () => {
    const src = new SupabaseSource(mockClient([sampleRow]))
    const rows = await src.find({ avoidCuisines: ['Spanish tapas'] })
    expect(rows).toHaveLength(0)
  })
})
