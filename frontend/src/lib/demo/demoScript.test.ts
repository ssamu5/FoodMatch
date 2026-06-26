import { describe, it, expect } from 'vitest'
import { DEMO_STEPS, DEMO_TOTAL, matchStepIndex } from './demoScript'

describe('demoScript', () => {
  it('has the expected ordered beats', () => {
    expect(DEMO_STEPS.map((s) => s.id)).toEqual(['ask', 'shortlist', 'listing', 'business', 'close'])
    expect(DEMO_TOTAL).toBe(5)
  })

  it('matches home to the ask step', () => {
    expect(matchStepIndex('/')).toBe(0)
  })

  it('matches the ask page to the shortlist step (ignoring query)', () => {
    expect(matchStepIndex('/ask')).toBe(1)
  })

  it('matches any restaurant detail to the listing step', () => {
    expect(matchStepIndex('/restaurant/hana-sushi')).toBe(2)
    expect(matchStepIndex('/restaurant/anything-else')).toBe(2)
  })

  it('matches the restaurateur page to the business step', () => {
    expect(matchStepIndex('/restaurants')).toBe(3)
  })

  it('returns -1 for paths not in the tour', () => {
    expect(matchStepIndex('/saved')).toBe(-1)
    expect(matchStepIndex('/demo')).toBe(-1)
  })

  it('never matches the closing step by route', () => {
    expect(DEMO_STEPS[DEMO_TOTAL - 1].match('/anything')).toBe(false)
  })
})
