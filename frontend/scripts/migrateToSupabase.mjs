// One-time load of seed restaurants + dishes into Supabase via service role.
// Idempotent: upsert restaurants, replace dishes. Run: npm run db:migrate
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, '../.env'), 'utf8')
    .split('\n')
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
)
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const seedTxt = readFileSync(resolve(__dirname, '../src/data/seedRestaurants.ts'), 'utf8')
const blocks = seedTxt.split(/\n\s{2}\{\n/).slice(1)
const str = (b, k) => (b.match(new RegExp(`${k}: '((?:[^'\\\\]|\\\\.)*)'`)) || [])[1]?.replace(/\\'/g, "'")
const num = (b, k) => { const m = b.match(new RegExp(`${k}: (-?[0-9.]+)`)); return m ? Number(m[1]) : null }
const bool = (b, k) => { const m = b.match(new RegExp(`${k}: (true|false)`)); return m ? m[1] === 'true' : false }
const arr = (b, k) => { const m = b.match(new RegExp(`${k}: \\[([^\\]]*)\\]`)); return m ? [...m[1].matchAll(/'((?:[^'\\\\]|\\\\.)*)'/g)].map((x) => x[1].replace(/\\'/g, "'")) : [] }

const restaurants = []
const allDishes = []
for (const raw of blocks) {
  const b = raw.split(/\n\s{2}\},/)[0]
  const id = str(b, 'id'); const slug = str(b, 'slug')
  if (!id || !slug) continue
  const hoursKind = /brunchHours\(\)/.test(b) ? 'brunch' : /standardOpening\(true\)/.test(b) ? 'late' : 'standard'
  restaurants.push({
    id, slug,
    name: str(b, 'name'),
    description: str(b, 'description') || '',
    cuisine: str(b, 'cuisine'),
    secondary_cuisines: arr(b, 'secondaryCuisines'),
    tags: arr(b, 'tags'),
    vibe: arr(b, 'vibe'),
    best_for: arr(b, 'bestFor'),
    area: str(b, 'area'),
    city: str(b, 'city') || 'Valencia',
    address: str(b, 'address') || '',
    price_level: num(b, 'priceLevel') ?? 2,
    average_spend: num(b, 'averageSpend') ?? 20,
    rating: num(b, 'rating') ?? 4.0,
    review_count: num(b, 'reviewCount') ?? 0,
    image_placeholder: str(b, 'imagePlaceholder') || 'lime-muted',
    instagram: str(b, 'instagram') || null,
    phone: str(b, 'phone') || null,
    hours_kind: hoursKind,
    vegetarian_friendly: bool(b, 'vegetarianFriendly'),
    vegan_friendly: bool(b, 'veganFriendly'),
    gluten_free_options: bool(b, 'glutenFreeOptions'),
    is_partner: bool(b, 'isPartner'),
  })
  const menuMatch = b.match(/menu: \[([\s\S]*?)\]/)
  if (menuMatch) {
    const items = [...menuMatch[1].matchAll(/\{ name: '((?:[^'\\\\]|\\\\.)*)', priceEur: ([0-9.]+) \}/g)]
    items.forEach((m, i) => allDishes.push({ restaurant_id: id, name: m[1].replace(/\\'/g, "'"), price_eur: Number(m[2]), sort: i }))
  }
}

console.log(`Parsed ${restaurants.length} restaurants, ${allDishes.length} dishes.`)
if (restaurants.length !== 200) { console.error('Expected 200 restaurants, aborting.'); process.exit(1) }

for (let i = 0; i < restaurants.length; i += 100) {
  const chunk = restaurants.slice(i, i + 100)
  const { error } = await supabase.from('restaurants').upsert(chunk, { onConflict: 'id' })
  if (error) { console.error('restaurants upsert error:', error); process.exit(1) }
}
{
  const { error: delErr } = await supabase.from('dishes').delete().neq('restaurant_id', '')
  if (delErr) { console.error('dishes delete error:', delErr); process.exit(1) }
  for (let i = 0; i < allDishes.length; i += 500) {
    const chunk = allDishes.slice(i, i + 500)
    const { error } = await supabase.from('dishes').insert(chunk)
    if (error) { console.error('dishes insert error:', error); process.exit(1) }
  }
}

const { count: rCount } = await supabase.from('restaurants').select('*', { count: 'exact', head: true })
const { count: dCount } = await supabase.from('dishes').select('*', { count: 'exact', head: true })
console.log(`DB now has ${rCount} restaurants, ${dCount} dishes.`)
