import { describe, expect, it } from 'vitest'
import { SEED_RESTAURANTS } from '../data/seedRestaurants'
import { parseFoodIntent } from './foodIntent'
import { SeedSource, runSearchPipeline } from './searchPipeline'

const source = new SeedSource(SEED_RESTAURANTS)

describe('search pipeline', () => {
  it('reports per-stage diagnostics, never expanding total', () => {
    const intent = parseFoodIntent('tapas')
    const { diagnostics } = runSearchPipeline(intent, source)
    expect(diagnostics.total).toBe(SEED_RESTAURANTS.length)
    expect(diagnostics.filtered).toBeLessThanOrEqual(diagnostics.total)
    expect(diagnostics.shortlisted).toBeLessThanOrEqual(diagnostics.total)
    expect(diagnostics.ranked).toBeLessThanOrEqual(diagnostics.shortlisted)
    expect(diagnostics.widened).toBe(false)
  })

  it('surfaces dish-serving restaurants for a dish query', () => {
    const intent = parseFoodIntent('paella')
    const { results } = runSearchPipeline(intent, source)
    expect(results.length).toBeGreaterThan(0)
    const top = results[0]
    const servesPaella =
      top.cuisine === 'paella' ||
      (top.menu ?? []).some((d) => d.name.toLowerCase().includes('paella'))
    expect(servesPaella).toBe(true)
  })

  it('caps the shortlist below the candidate set when asked', () => {
    const intent = parseFoodIntent('')
    const { diagnostics } = runSearchPipeline(intent, source, { shortlistCap: 20 })
    expect(diagnostics.shortlisted).toBeLessThanOrEqual(20)
  })

  it('widens rather than returning empty when the hard filter is too narrow', () => {
    // 'sushi Ruzafa under 15' matches 0 rows exactly (no sushi in Ruzafa under 15 EUR),
    // so the pipeline widens to the full set rather than returning an empty page.
    const intent = parseFoodIntent('sushi Ruzafa under 15')
    const { results, diagnostics } = runSearchPipeline(intent, source)
    expect(results.length).toBeGreaterThan(0)
    expect(diagnostics.widened).toBe(true)
  })

  it('bounds the shortlist regardless of how many candidates the source returns', () => {
    const many = Array.from({ length: 500 }, (_, i) => ({ ...SEED_RESTAURANTS[i % SEED_RESTAURANTS.length], id: `mock-${i}` }))
    const bigSource = new SeedSource(many)
    const intent = parseFoodIntent('')
    const { diagnostics } = runSearchPipeline(intent, bigSource, { shortlistCap: 25 })
    expect(diagnostics.total).toBe(500)
    expect(diagnostics.shortlisted).toBe(25)
    expect(diagnostics.ranked).toBeLessThanOrEqual(25)
  })
})
