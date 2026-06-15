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
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { taskId: 't1' } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { state: 'waiting' } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { state: 'success', resultJson: '{"resultUrls":["https://cdn/x.png"]}' } }) })
    const url = await generateImage(
      { prompt: 'p', apiKey: 'k' },
      { fetchImpl, sleepImpl: async () => {}, pollMs: 0 },
    )
    expect(url).toBe('https://cdn/x.png')
    expect(fetchImpl).toHaveBeenCalledTimes(3)
  })
  it('throws when the task fails', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { taskId: 't1' } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { state: 'fail', failMsg: 'nope' } }) })
    await expect(
      generateImage({ prompt: 'p', apiKey: 'k' }, { fetchImpl, sleepImpl: async () => {} }),
    ).rejects.toThrow('kie: task failed')
  })

  it('throws after maxPolls is exhausted', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { taskId: 't1' } }) })
      .mockResolvedValue({ ok: true, json: async () => ({ data: { state: 'waiting' } }) })
    await expect(
      generateImage({ prompt: 'p', apiKey: 'k' }, { fetchImpl, sleepImpl: async () => {}, maxPolls: 2 }),
    ).rejects.toThrow('kie: timed out')
    expect(fetchImpl).toHaveBeenCalledTimes(3) // 1 create + 2 polls
  })

  it('throws a clear error when a poll returns a non-ok HTTP status', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { taskId: 't1' } }) })
      .mockResolvedValueOnce({ ok: false, status: 503 })
    await expect(
      generateImage({ prompt: 'p', apiKey: 'k' }, { fetchImpl, sleepImpl: async () => {} }),
    ).rejects.toThrow('kie: poll HTTP 503')
  })
})
