import { describe, it, expect } from 'vitest'
import { pendingFirst, type ClaimRow } from './admin'

const mk = (id: number, status: string, created_at: string): ClaimRow => ({
  id, restaurant_slug: 's' + id, restaurant_name: 'R' + id, owner_name: 'O', email: 'e@x.com',
  phone: null, area: null, cuisine: null, status, created_at,
})

describe('pendingFirst', () => {
  it('puts pending claims before resolved ones, newest first within a group', () => {
    const claims = [
      mk(1, 'approved', '2026-01-03T00:00:00Z'),
      mk(2, 'pending', '2026-01-01T00:00:00Z'),
      mk(3, 'pending', '2026-01-02T00:00:00Z'),
      mk(4, 'rejected', '2026-01-04T00:00:00Z'),
    ]
    const out = pendingFirst(claims).map((c) => c.id)
    expect(out).toEqual([3, 2, 4, 1])
  })
  it('does not mutate the input', () => {
    const claims = [mk(1, 'approved', 'a'), mk(2, 'pending', 'b')]
    const copy = [...claims]
    pendingFirst(claims)
    expect(claims).toEqual(copy)
  })
})
