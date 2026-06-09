import { describe, expect, it } from 'vitest'
import { getLanguage, setLanguage } from './storage'

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
