import { describe, it, expect } from 'vitest'
import { parseArgs } from './parseArgs.mjs'

describe('parseArgs', () => {
  it('reads a slug positional', () => {
    expect(parseArgs(['la-prueba'])).toEqual({ slug: 'la-prueba', missing: false, force: false, dryRun: false })
  })
  it('reads flags', () => {
    expect(parseArgs(['--missing', '--force', '--dry-run'])).toEqual({ slug: null, missing: true, force: true, dryRun: true })
  })
  it('combines a slug with flags', () => {
    expect(parseArgs(['la-prueba', '--force'])).toEqual({ slug: 'la-prueba', missing: false, force: true, dryRun: false })
  })
})
