// frontend/scripts/generateHeroImage.mjs
// Generate a food-forward hero image for a restaurant (or many), upload it to
// Supabase Storage, and set restaurants.hero_image. Server-side only: uses the
// service-role key + kie.ai key from frontend/.env. See the design spec.
//
// Usage (from frontend/):
//   node scripts/generateHeroImage.mjs <slug>            one restaurant
//   node scripts/generateHeroImage.mjs --missing         every null hero_image
//   node scripts/generateHeroImage.mjs <slug> --force    regenerate even if set
//   node scripts/generateHeroImage.mjs <slug> --dry-run  print prompt only, no spend
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from './lib/parseArgs.mjs'
import { heroPrompt } from './lib/heroPrompt.mjs'
import { generateAndStoreHeroImage } from './lib/heroImagePipeline.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, '../.env'), 'utf8')
    .split('\n')
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
)

const args = parseArgs(process.argv.slice(2))
if (!args.slug && !args.missing) {
  console.error('Usage: node scripts/generateHeroImage.mjs <slug> | --missing [--force] [--dry-run]')
  process.exit(1)
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const cols = 'slug,name,cuisine,vibe,hero_image'
let targets = []
if (args.missing) {
  const { data, error } = await supabase.from('restaurants').select(cols).is('hero_image', null)
  if (error) { console.error('query failed:', error); process.exit(1) }
  targets = data
} else {
  const { data, error } = await supabase.from('restaurants').select(cols).eq('slug', args.slug).maybeSingle()
  if (error) { console.error('query failed:', error); process.exit(1) }
  if (!data) { console.error(`no restaurant with slug "${args.slug}"`); process.exit(1) }
  targets = [data]
}

console.log(`${targets.length} target(s).`)
let ok = 0, skip = 0, fail = 0
for (const row of targets) {
  const restaurant = {
    slug: row.slug, name: row.name, cuisine: row.cuisine,
    vibe: row.vibe ?? [], heroImage: row.hero_image ?? undefined,
  }
  if (args.dryRun) {
    console.log(`\n[${row.slug}] ${heroPrompt(restaurant.cuisine, { vibe: restaurant.vibe, name: restaurant.name })}`)
    continue
  }
  if (!env.KIE_API_KEY) { console.error('KIE_API_KEY missing in .env; aborting.'); process.exit(1) }
  try {
    const res = await generateAndStoreHeroImage(restaurant, {
      supabase, kieApiKey: env.KIE_API_KEY, force: args.force,
    })
    if (res.skipped) { skip++; console.log(`- ${row.slug}: skipped (already set)`) }
    else { ok++; console.log(`+ ${row.slug}: ${res.url}`) }
  } catch (e) {
    fail++; console.error(`x ${row.slug}: ${e.message}`)
  }
}
if (!args.dryRun) console.log(`\nDone. ${ok} generated, ${skip} skipped, ${fail} failed.`)
