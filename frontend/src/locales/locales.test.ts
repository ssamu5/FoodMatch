import { describe, expect, it } from 'vitest'
import { es } from './es'
import { en } from './en'

// Flatten to leaf key paths. A string is a leaf; a { one, other } plural object
// is also a leaf (not a namespace); everything else recurses.
function flattenKeys(node: unknown, prefix = ''): string[] {
  if (typeof node === 'string') return [prefix]
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>
    if ('one' in obj && 'other' in obj) return [prefix]
    return Object.keys(obj).flatMap((k) =>
      flattenKeys(obj[k], prefix ? `${prefix}.${k}` : k),
    )
  }
  return []
}

describe('locale dictionaries', () => {
  it('es and en have identical key sets', () => {
    expect(flattenKeys(en).sort()).toEqual(flattenKeys(es).sort())
  })
})
