import { describe, it, expect, vi } from 'vitest'
import { weservUrl, downloadAsJpeg } from './downloadImage.mjs'

describe('weservUrl', () => {
  it('builds a proxied, resized jpg URL without the scheme', () => {
    const u = weservUrl('https://tempfile.aiquickdraw.com/x.png')
    expect(u).toContain('images.weserv.nl')
    expect(u).toContain('output=jpg')
    expect(u).toContain(encodeURIComponent('tempfile.aiquickdraw.com/x.png'))
  })
})

describe('downloadAsJpeg', () => {
  it('returns bytes from the proxy', async () => {
    const bytes = new Uint8Array([1, 2, 3])
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => bytes.buffer })
    const out = await downloadAsJpeg('https://cdn/x.png', { fetchImpl })
    expect(Array.from(out)).toEqual([1, 2, 3])
  })

  it('falls back to the direct URL if the proxy fails', async () => {
    const bytes = new Uint8Array([9])
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => bytes.buffer })
    const out = await downloadAsJpeg('https://cdn/x.png', { fetchImpl })
    expect(Array.from(out)).toEqual([9])
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })
})
