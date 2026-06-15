// kie.ai GPT-image client. createTask -> poll recordInfo -> extract result URL.
// The recordInfo JSON is malformed (double-encoded param), so the image URL is
// extracted by regex rather than JSON.parse.

const CREATE_URL = 'https://api.kie.ai/api/v1/jobs/createTask'
const RECORD_URL = 'https://api.kie.ai/api/v1/jobs/recordInfo'

// Reuse the model that produced website/img/hero-*.jpg. Confirm this value
// against kie.ai before any paid run.
export const KIE_MODEL = 'gpt-image-2-text-to-image'

export function extractImageUrl(resultJson) {
  if (!resultJson) return null
  const text = typeof resultJson === 'string' ? resultJson : JSON.stringify(resultJson)
  const m = text.match(/https:\/\/[^"\\\s]+\.(?:png|jpe?g)/i)
  return m ? m[0] : null
}

const defaultSleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function generateImage(
  { prompt, aspectRatio = '3:2', apiKey },
  { fetchImpl = fetch, pollMs = 3000, maxPolls = 60, sleepImpl = defaultSleep } = {},
) {
  if (!apiKey) throw new Error('kie: missing apiKey')

  const createRes = await fetchImpl(CREATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: KIE_MODEL, input: { prompt, aspect_ratio: aspectRatio } }),
  })
  const createBody = await createRes.json()
  const taskId = createBody?.data?.taskId ?? createBody?.taskId
  if (!taskId) throw new Error(`kie: no taskId in createTask response: ${JSON.stringify(createBody)}`)

  for (let i = 0; i < maxPolls; i++) {
    const infoRes = await fetchImpl(`${RECORD_URL}?taskId=${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    const info = await infoRes.json()
    const state = info?.data?.state ?? info?.state
    if (state === 'success') {
      const url = extractImageUrl(info?.data?.resultJson ?? info)
      if (!url) throw new Error('kie: success but no image URL found')
      return url
    }
    if (state === 'fail' || state === 'failed') {
      throw new Error(`kie: task failed: ${JSON.stringify(info?.data ?? info)}`)
    }
    await sleepImpl(pollMs)
  }
  throw new Error('kie: timed out waiting for image')
}
