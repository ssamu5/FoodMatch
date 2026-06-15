// Orchestration core: turn a restaurant into a stored hero image + DB update.
// No env / process concerns so it can be reused by a CLI today and a Supabase
// Edge Function later. All side-effecting deps are injected.

import { heroPrompt } from './heroPrompt.mjs'
import { generateImage } from './kieImage.mjs'
import { downloadAsJpeg } from './downloadImage.mjs'

export const BUCKET = 'restaurant-images'

export async function ensureBucket(supabase) {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
  // Ignore "already exists" (HTTP 409, or a message that says so); surface anything else.
  if (error && error.status !== 409 && !/exist/i.test(error.message || '')) throw error
}

export async function generateAndStoreHeroImage(restaurant, deps) {
  const {
    supabase,
    kieApiKey,
    force = false,
    fetchImpl = fetch,
    generate = generateImage,
    download = downloadAsJpeg,
  } = deps
  const { slug, name, cuisine, vibe = [], heroImage } = restaurant

  if (heroImage && !force) return { slug, url: heroImage, skipped: true }

  // Ensure the storage bucket exists BEFORE spending on image generation, so a
  // storage misconfiguration fails fast without wasting a paid generation.
  await ensureBucket(supabase)

  const prompt = heroPrompt(cuisine, { vibe, name })
  const imageUrl = await generate({ prompt, aspectRatio: '3:2', apiKey: kieApiKey }, { fetchImpl })
  const bytes = await download(imageUrl, { fetchImpl })

  const path = `${slug}.jpg`
  const up = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (up.error) throw up.error

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const url = pub.publicUrl

  const { data: updated, error: dbErr } = await supabase
    .from('restaurants')
    .update({ hero_image: url })
    .eq('slug', slug)
    .select('id')
  if (dbErr) throw dbErr
  if (!updated || updated.length === 0) throw new Error(`no restaurant row found for slug: ${slug}`)

  return { slug, url, skipped: false }
}
