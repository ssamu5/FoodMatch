import { describe, it, expect } from 'vitest'
import { heroPrompt } from './heroPrompt.mjs'

describe('heroPrompt', () => {
  it('uses the cuisine-specific subject and the shared style suffix', () => {
    const p = heroPrompt('paella', {})
    expect(p).toContain('Valencian seafood paella')
    expect(p).toContain('Professional food photography')
    expect(p).toContain('No text, no logos')
  })

  it('falls back to a default subject for unknown cuisines', () => {
    expect(heroPrompt('fondue', {})).toContain('appetising signature dish')
  })

  it('matches accented cuisine keys exactly', () => {
    expect(heroPrompt('menú del día', {})).toContain('menu del dia plate')
  })

  it('weaves in up to two vibe words when provided', () => {
    const p = heroPrompt('sushi', { vibe: ['minimalist', 'romantic', 'loud'] })
    expect(p).toContain('The mood is minimalist, romantic.')
  })
})
