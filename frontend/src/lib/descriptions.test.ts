import { describe, it, expect } from 'vitest'
import { localizedDescription, DESCRIPTION_ES } from './descriptions'

const KNOWN = 'Sushi counter with daily fresh fish. Reservations recommended for the omakase.'

describe('localizedDescription', () => {
  it('returns the English description in English', () => {
    expect(localizedDescription({ description: KNOWN }, 'en')).toBe(KNOWN)
  })

  it('maps a known placeholder description to Spanish', () => {
    expect(localizedDescription({ description: KNOWN }, 'es')).toBe(DESCRIPTION_ES[KNOWN])
  })

  it('prefers an explicit per-row descriptionEs over the fallback map', () => {
    expect(
      localizedDescription({ description: KNOWN, descriptionEs: 'Texto propio en español' }, 'es'),
    ).toBe('Texto propio en español')
  })

  it('falls back to the original text when no Spanish is available', () => {
    const custom = 'Owner-written description with no translation yet.'
    expect(localizedDescription({ description: custom }, 'es')).toBe(custom)
  })

  it('every Spanish value is free of em and en dashes', () => {
    for (const v of Object.values(DESCRIPTION_ES)) {
      expect(v).not.toMatch(/[–—]/)
    }
  })
})
