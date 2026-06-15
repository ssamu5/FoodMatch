import { describe, it, expect, vi } from 'vitest'
import { extractImageUrl, generateImage } from './kieImage.mjs'

describe('extractImageUrl', () => {
  it('pulls the image URL out of malformed resultJson', () => {
    const malformed = '{"resultUrls":["https://tempfile.aiquickdraw.com/abc123.png"]} junk'
    expect(extractImageUrl(malformed)).toBe('https://tempfile.aiquickdraw.com/abc123.png')
  })
  it('returns null when no URL is present', () => {
    expect(extractImageUrl('{"state":"success"}')).toBeNull()
  })
})

describe('generateImage', () => {
  it('creates a task then polls until success and returns the URL', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ json: async () => ({ data: { taskId: 't1' } }) })
      .mockResolvedValueOnce({ json: async () => ({ data: { state: 'waiting' } }) })
      .mockResolvedValueOnce({ json: async () => ({ data: { state: 'success', resultJson: '{"resultUrls":["https://cdn/x.png"]}' } }) })
    const url = await generateImage(
      { prompt: 'p', apiKey: 'k' },
      { fetchImpl, sleepImpl: async () => {}, pollMs: 0 },
    )
    expect(url).toBe('https://cdn/x.png')
    expect(fetchImpl).toHaveBeenCalledTimes(3)
  })
  it('throws when the task fails', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ json: async () => ({ data: { taskId: 't1' } }) })
      .mockResolvedValueOnce({ json: async () => ({ data: { state: 'fail', failMsg: 'nope' } }) })
    await expect(
      generateImage({ prompt: 'p', apiKey: 'k' }, { fetchImpl, sleepImpl: async () => {} }),
    ).rejects.toThrow('kie: task failed')
  })
})
