import { describe, expect, it } from 'vitest'
import { SEED_RESTAURANTS } from '../data/seedRestaurants'
import { parseFoodIntent } from './foodIntent'
import { SeedSource, runSearchPipeline } from './searchPipeline'

const source = new SeedSource(SEED_RESTAURANTS)

describe('search pipeline', () => {
  it('reports per-stage diagnostics with total >= filtered >= shortlisted >= ranked', () => {
    const intent = parseFoodIntent('paella near Marina')
    const { diagnostics } = runSearchPipeline(intent, source)
    expect(diagnostics.total).toBe(SEED_RESTAURANTS.length)
    expect(diagnostics.total).toBeGreaterThanOrEqual(diagnostics.filtered)
    expect(diagnostics.filtered).toBeGreaterThanOrEqual(diagnostics.shortlisted)
    expect(diagnostics.shortlisted).toBeGreaterThanOrEqual(diagnostics.ranked)
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
    const intent = parseFoodIntent('caviar')
    const { results } = runSearchPipeline(intent, source)
    expect(results.length).toBeGreaterThan(0)
  })
})
