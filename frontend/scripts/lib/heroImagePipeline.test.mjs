import { describe, it, expect, vi } from 'vitest'
import { generateAndStoreHeroImage, ensureBucket } from './heroImagePipeline.mjs'

function fakeSupabase({ updateRows = [{ id: 'id-1' }] } = {}) {
  const uploads = []
  const updates = []
  return {
    _uploads: uploads,
    _updates: updates,
    storage: {
      createBucket: vi.fn().mockResolvedValue({ error: null }),
      from: () => ({
        upload: vi.fn((path, bytes, opts) => {
          uploads.push({ path, bytes, opts })
          return Promise.resolve({ error: null })
        }),
        getPublicUrl: (path) => ({ data: { publicUrl: `https://store/${path}` } }),
      }),
    },
    from: () => ({
      update: (vals) => ({
        eq: (col, val) => ({
          select: () => {
            updates.push({ vals, col, val })
            return Promise.resolve({ data: updateRows, error: null })
          },
        }),
      }),
    }),
  }
}

describe('generateAndStoreHeroImage', () => {
  it('generates, uploads <slug>.jpg, sets hero_image, returns url', async () => {
    const supabase = fakeSupabase()
    const generate = vi.fn().mockResolvedValue('https://cdn/x.png')
    const download = vi.fn().mockResolvedValue(new Uint8Array([1, 2]))
    const res = await generateAndStoreHeroImage(
      { slug: 'la-prueba', name: 'La Prueba', cuisine: 'paella', vibe: ['cozy'] },
      { supabase, kieApiKey: 'k', generate, download },
    )
    expect(res).toEqual({ slug: 'la-prueba', url: 'https://store/la-prueba.jpg', skipped: false })
    expect(supabase._uploads[0].path).toBe('la-prueba.jpg')
    expect(supabase._uploads[0].opts).toMatchObject({ contentType: 'image/jpeg', upsert: true })
    expect(supabase._updates[0]).toEqual({
      vals: { hero_image: 'https://store/la-prueba.jpg' }, col: 'slug', val: 'la-prueba',
    })
    expect(generate).toHaveBeenCalledOnce()
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({ aspectRatio: '3:2' }),
      expect.anything(),
    )
  })

  it('skips when hero_image already set and not forced', async () => {
    const supabase = fakeSupabase()
    const generate = vi.fn()
    const res = await generateAndStoreHeroImage(
      { slug: 'x', name: 'X', cuisine: 'sushi', heroImage: 'https://store/x.jpg' },
      { supabase, kieApiKey: 'k', generate },
    )
    expect(res.skipped).toBe(true)
    expect(generate).not.toHaveBeenCalled()
  })

  it('regenerates when forced even if hero_image is set', async () => {
    const supabase = fakeSupabase()
    const generate = vi.fn().mockResolvedValue('https://cdn/y.png')
    const download = vi.fn().mockResolvedValue(new Uint8Array([3]))
    const res = await generateAndStoreHeroImage(
      { slug: 'x', name: 'X', cuisine: 'sushi', heroImage: 'https://store/x.jpg' },
      { supabase, kieApiKey: 'k', force: true, generate, download },
    )
    expect(res.skipped).toBe(false)
    expect(generate).toHaveBeenCalledOnce()
  })

  it('throws when no restaurant row matches the slug', async () => {
    const supabase = fakeSupabase({ updateRows: [] })
    const generate = vi.fn().mockResolvedValue('https://cdn/x.png')
    const download = vi.fn().mockResolvedValue(new Uint8Array([1]))
    await expect(
      generateAndStoreHeroImage(
        { slug: 'ghost', name: 'Ghost', cuisine: 'sushi' },
        { supabase, kieApiKey: 'k', generate, download },
      ),
    ).rejects.toThrow('no restaurant row found for slug: ghost')
  })
})

describe('ensureBucket', () => {
  it('ignores a 409 (bucket already exists)', async () => {
    const supabase = { storage: { createBucket: vi.fn().mockResolvedValue({ error: { status: 409, message: 'The resource already exists' } }) } }
    await expect(ensureBucket(supabase)).resolves.toBeUndefined()
  })
  it('re-throws non-duplicate errors', async () => {
    const supabase = { storage: { createBucket: vi.fn().mockResolvedValue({ error: { status: 403, message: 'Forbidden' } }) } }
    await expect(ensureBucket(supabase)).rejects.toMatchObject({ status: 403 })
  })
})
