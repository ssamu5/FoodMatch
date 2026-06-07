import { describe, expect, it } from 'vitest'
import { SEED_RESTAURANTS } from '../data/seedRestaurants'
import { parseFoodIntent } from './foodIntent'
import { SeedSource, runSearchPipeline } from './searchPipeline'

const source = new SeedSource(SEED_RESTAURANTS)

describe('search pipeline', () => {
  it('reports per-stage diagnostics, never expanding total', async () => {
    const intent = parseFoodIntent('tapas')
    const { diagnostics } = await runSearchPipeline(intent, source)
    expect(diagnostics.total).toBe(SEED_RESTAURANTS.length)
    expect(diagnostics.filtered).toBeLessThanOrEqual(diagnostics.total)
    expect(diagnostics.shortlisted).toBeLessThanOrEqual(diagnostics.total)
    expect(diagnostics.ranked).toBeLessThanOrEqual(diagnostics.shortlisted)
    expect(diagnostics.widened).toBe(false)
  })

  it('surfaces dish-serving restaurants for a dish query', async () => {
    const intent = parseFoodIntent('paella')
    const { results } = await runSearchPipeline(intent, source)
    expect(results.length).toBeGreaterThan(0)
    const top = results[0]
    const servesPaella =
      top.cuisine === 'paella' ||
      (top.menu ?? []).some((d) => d.name.toLowerCase().includes('paella'))
    expect(servesPaella).toBe(true)
  })

  it('caps the shortlist below the candidate set when asked', async () => {
    const intent = parseFoodIntent('')
    const { diagnostics } = await runSearchPipeline(intent, source, { shortlistCap: 20 })
    expect(diagnostics.shortlisted).toBeLessThanOrEqual(20)
  })

  it('scores a dish whose name maps to a cuisine even if menu items omit the word', async () => {
    // 'nigiri' -> intent.dishes = ['sushi']; a sushi restaurant's menu lists
    // "Nigiri salmón" etc., none containing the literal "sushi". The dish
    // bonus must still apply (haystack includes r.cuisine).
    const intent = parseFoodIntent('nigiri')
    expect(intent.dishes).toContain('sushi')
    const { results, ranked } = await runSearchPipeline(intent, source)
    expect(results.length).toBeGreaterThan(0)
    const top = ranked[0]
    expect(top.score.reasons.join(' ')).toMatch(/serves sushi/)
  })

  it('widens rather than returning empty when the hard filter is too narrow', async () => {
    // 'sushi Ruzafa under 15' matches 0 rows exactly (no sushi in Ruzafa under 15 EUR),
    // so the pipeline widens to the full set rather than returning an empty page.
    const intent = parseFoodIntent('sushi Ruzafa under 15')
    const { results, diagnostics } = await runSearchPipeline(intent, source)
    expect(results.length).toBeGreaterThan(0)
    expect(diagnostics.widened).toBe(true)
  })

  it('bounds the shortlist regardless of how many candidates the source returns', async () => {
    const many = Array.from({ length: 500 }, (_, i) => ({ ...SEED_RESTAURANTS[i % SEED_RESTAURANTS.length], id: `mock-${i}` }))
    const bigSource = new SeedSource(many)
    const intent = parseFoodIntent('')
    const { diagnostics } = await runSearchPipeline(intent, bigSource, { shortlistCap: 25 })
    expect(diagnostics.total).toBe(500)
    expect(diagnostics.shortlisted).toBe(25)
    expect(diagnostics.ranked).toBeLessThanOrEqual(25)
  })
})
