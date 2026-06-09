import { describe, expect, it } from 'vitest'
import { getLanguage, setLanguage } from './storage'
import { translate, translatePlural } from './i18n'

describe('language persistence', () => {
  it('defaults to Spanish when nothing is stored', () => {
    setLanguage('es') // normalize any prior state
    expect(getLanguage()).toBe('es')
  })

  it('round-trips a chosen language', () => {
    setLanguage('en')
    expect(getLanguage()).toBe('en')
    setLanguage('es')
    expect(getLanguage()).toBe('es')
  })
})

describe('translate', () => {
  it('returns the string for each language', () => {
    expect(translate('es', 'nav.saved')).toBe('Guardados')
    expect(translate('en', 'nav.saved')).toBe('Saved')
  })

  it('interpolates {vars}', () => {
    expect(translate('en', 'profile.greeting', { name: 'Sam' })).toBe('Hi, Sam')
  })

  it('falls back to the raw key for missing keys', () => {
    expect(translate('en', 'nope.missing')).toBe('nope.missing')
  })
})

describe('translatePlural', () => {
  it('selects one vs other and injects {count}', () => {
    expect(translatePlural('en', 'results.found', 1)).toBe('FoodMatch found 1 match')
    expect(translatePlural('en', 'results.found', 3)).toBe('FoodMatch found 3 matches')
  })
})
