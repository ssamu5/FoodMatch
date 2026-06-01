// Deterministic generator for the FoodMatch demo restaurant database.
// Produces ~200 fictional Valencia restaurants across Samuel's categories.
// Run: node scripts/genSeed.mjs > src/data/seedRestaurants.ts
//
// All data is INVENTED for MVP/demo use. No real names, addresses, phones,
// or photos. Deterministic (seeded PRNG) so re-running yields the same file
// and diffs stay reviewable.

// ---------- seeded PRNG (mulberry32) ----------
let _s = 0x9e3779b9
function srand(seed) { _s = seed >>> 0 }
function rnd() {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
function pick(arr) { return arr[Math.floor(rnd() * arr.length)] }
function pickN(arr, n) {
  const copy = [...arr]; const out = []
  for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(rnd() * copy.length), 1)[0])
  return out
}
function int(min, max) { return Math.floor(rnd() * (max - min + 1)) + min }
function chance(p) { return rnd() < p }

srand(20260601)

// ---------- vocab ----------
const AREAS = ['Ruzafa', 'El Carmen', 'Canovas', 'Benimaclet', 'City center', 'Marina / beach']

// streets per area (invented but plausible Valencia-style)
const STREETS = {
  'Ruzafa': ['Carrer de Cadis', 'Carrer de Sueca', 'Carrer de Cuba', 'Carrer de Puerto Rico', 'Carrer de Literat Azorín'],
  'El Carmen': ['Carrer de Quart', 'Carrer dels Cavallers', 'Plaça del Tossal', 'Carrer Baix', 'Carrer Alta'],
  'Canovas': ['Carrer de Conca', 'Carrer de Salamanca', 'Carrer de Jorge Juan', 'Carrer de Cirilo Amorós'],
  'Benimaclet': ['Carrer de Baró de San Petrillo', 'Carrer de Rubau', 'Plaça de Benimaclet', 'Carrer de Murta'],
  'City center': ['Plaça de la Reina', 'Carrer de la Pau', 'Carrer de San Vicente Mártir', 'Plaça de l\'Ajuntament', 'Carrer de Colón'],
  'Marina / beach': ['Passeig Marítim', 'Carrer de Pavia', 'Carrer del Rosari', 'Carrer de la Reina', 'Avinguda de Neptú'],
}

// category -> config
// weight controls how many of the 200 fall in each category.
// Names are built as `first` + ' ' + `second`, ALWAYS in that order (never
// reversed). An empty-string second means the first stands alone. Every
// first/second pair is curated to read as a real, grammatical name.
const CATEGORIES = [
  { cuisine: 'burgers',        weight: 16, price: [1,2], vibes: ['casual','lively','group','cheap eats'], best: ['groups','quick bite','casual dinner'], first: ['Smash','Brava','Doble','Goloso','Patilla','La Brasa'], second: ['Burger','Burgers','Burger House','& Co',''] },
  { cuisine: 'pizza',          weight: 16, price: [1,3], vibes: ['casual','family','group','cozy'], best: ['families','sharing','casual dinner'], first: ['Forno','Bella','Da Vero','Napoli','Vesuvio','La'], second: ['Pizza','Pizzería','Napoletana','Pizza Co',''] },
  { cuisine: 'sushi',          weight: 12, price: [2,4], vibes: ['date','quiet','romantic'], best: ['date night','special occasions'], first: ['Kenko','Sakura','Umi','Nori','Kaito','Hana','Kintaro'], second: ['Sushi','Omakase','Sushi Bar','Izakaya',''] },
  { cuisine: 'Spanish tapas',  weight: 20, price: [2,3], vibes: ['lively','date','cozy','group'], best: ['sharing','wine night','long dinners'], first: ['Casa','Bar','Bodega','Taberna','Tasca','Mesón'], second: ['Pepe','Manolo','Carmela','del Mercat','del Carmen','de Ruzafa','Tradició'] },
  { cuisine: 'menú del día',   weight: 18, price: [1,2], vibes: ['casual','work','solo'], best: ['weekday lunch','work lunch','quick lunch'], first: ['Casa','Restaurante','Cantina','El Racó','La Cuina','Mesón'], second: ['Familiar','del Mercat','de Sempre','Pepe','Carmela',''] },
  { cuisine: 'cafeteria',      weight: 0,  price: [1,2], vibes: [], best: [], first: [], second: [] }, // mapped into coffee below
  { cuisine: 'coffee',         weight: 16, price: [1,2], vibes: ['work','quiet','casual','solo'], best: ['coffee & laptop','breakfast','casual meetup'], first: ['Origen','Tostado','Grano','Lento','Bruna','Mistela'], second: ['Café','Coffee','Roasters','Coffee Bar','Tostadero'] },
  { cuisine: 'brunch',         weight: 14, price: [2,3], vibes: ['casual','family','outdoor','cozy'], best: ['weekend brunch','breakfast','catch-ups'], first: ['Sunny','Honey','Citrus','Bruna','Daily','Almorzar'], second: ['Brunch','Brunch Club','Kitchen','& Co',''] },
  { cuisine: 'bar',            weight: 18, price: [1,3], vibes: ['lively','late night','group','outdoor'], best: ['drinks','after work','night out'], first: ['Bar','Vermutería','Cervecería','Tasca','La Tasca','El Rincón'], second: ['Manolo','Central','de Copas','Nocturna','del Barri',''] },
  { cuisine: 'healthy bowls',  weight: 10, price: [2,3], vibes: ['casual','work','solo','outdoor'], best: ['healthy lunch','post-gym','light bite'], first: ['Verde','Fresh','Raíz','Nutre','Vital','Bloom'], second: ['Bowls','Poke','Kitchen','& Greens',''] },
  { cuisine: 'Mexican',        weight: 8,  price: [1,3], vibes: ['lively','group','casual'], best: ['groups','margaritas','casual dinner'], first: ['Taquería','La Cantina','Casa','Maíz','Agave','El Mero'], second: ['Mexicana','del Sur','Cantina','Mero',''] },
  { cuisine: 'Asian fusion',   weight: 8,  price: [2,3], vibes: ['casual','date','lively'], best: ['sharing','date night','casual dinner'], first: ['Wok','Bao','Lucky','Bambú','Zen','Mango'], second: ['Asian','Fusion','Noodle Bar','Street Food',''] },
  { cuisine: 'paella',         weight: 10, price: [2,4], vibes: ['family','outdoor','view','group'], best: ['Sunday lunch','families','tourists'], first: ['Casa','Arrocería','Barraca','La','El Palmar'], second: ['Valenciana','del Mar','de l\'Albufera','Carmela',''] },
  { cuisine: 'seafood',        weight: 8,  price: [2,4], vibes: ['date','view','family'], best: ['fresh fish','date night','sea view'], first: ['Marisquería','La Lonja','El Puerto','Cala Mar','La Pescadería'], second: ['del Puerto','Central','de la Mar',''] },
  { cuisine: 'Mediterranean',  weight: 8,  price: [2,3], vibes: ['date','cozy','outdoor'], best: ['date night','long lunch','sharing'], first: ['Oliva','Sal','Terra','Mare','Mediterrània'], second: ['Mediterránea','Kitchen','& Co','Taula',''] },
  { cuisine: 'vegan',          weight: 6,  price: [2,3], vibes: ['casual','cozy','outdoor'], best: ['plant-based','healthy lunch','brunch'], first: ['Raíz','Verde','Planta','Bloom','Bruma'], second: ['Vegana','Plant Kitchen','& Roots','Green',''] },
  { cuisine: 'steak',          weight: 6,  price: [3,4], vibes: ['date','group','cozy'], best: ['meat lovers','date night','celebrations'], first: ['La Brasa','El Asador','Fuego','Carbón','El Fogón'], second: ['Steakhouse','Parrilla','Grill',''] },
  { cuisine: 'Indian',         weight: 5,  price: [1,3], vibes: ['casual','family','group'], best: ['spice lovers','groups','casual dinner'], first: ['Taj','Mumbai','Bombay','Masala','Spice'], second: ['Tandoori','Curry House','Kitchen',''] },
  { cuisine: 'pasta',          weight: 9,  price: [2,3], vibes: ['date','cozy','casual'], best: ['date night','comfort food','casual dinner'], first: ['Mamma','Nonna','Bella','Da Vero','Trattoria'], second: ['Pasta','Trattoria','Cucina','& Co',''] },
]

const COVER_SEEDS = ['lime-bright','lime-dark','lime-deep','lime-warm','lime-muted']

const TAGS_BY = {
  burgers: ['smash','craft beer','double patty','dirty fries','American'],
  pizza: ['wood-fired','Neapolitan','sourdough','burrata','Italian'],
  sushi: ['omakase','fresh fish','counter','nigiri','Japanese'],
  'Spanish tapas': ['small plates','natural wine','vermut','tradición','sharing'],
  'menú del día': ['casero','3 platos','económico','de mercado','diario'],
  coffee: ['specialty coffee','flat white','brunch','laptop-friendly','pastries'],
  brunch: ['avocado toast','pancakes','mimosas','weekend','eggs'],
  bar: ['cañas','vermut','cocktails','terraza','tardeo'],
  'healthy bowls': ['poke','vegan options','smoothies','gluten-free','post-gym'],
  Mexican: ['tacos','margaritas','guac','spicy','sharing'],
  'Asian fusion': ['ramen','bao','wok','street food','noodles'],
  paella: ['arroz','leña','terraza','tradicional','Sunday'],
  seafood: ['fresh fish','marisco','puerto','a la plancha','del día'],
  Mediterranean: ['mezze','olive oil','seasonal','sharing','terraza'],
  vegan: ['plant-based','vegano','gluten-free','smoothies','sin lactosa'],
  steak: ['a la brasa','dry-aged','parrilla','carne','grill'],
  Indian: ['curry','tandoor','naan','vegetariano','picante'],
  pasta: ['fresh pasta','tiramisu','Italian','trattoria','vino'],
}

const DESCS = {
  burgers: 'Smash burgers, hand-cut fries and craft beer. Counter service, busy at weekends.',
  pizza: 'Wood-fired pizzas with a thin, blistered crust. Good for sharing and families.',
  sushi: 'Sushi counter with daily fresh fish. Reservations recommended for the omakase.',
  'Spanish tapas': 'Traditional Valencian tapas and small plates with natural wines by the glass.',
  'menú del día': 'Honest home-style cooking. Three-course menú del día at lunch, busy with locals.',
  coffee: 'Specialty coffee, pastries and a calm spot to work or meet a friend.',
  brunch: 'All-day brunch: eggs, toasts, pancakes and good coffee. Popular at weekends.',
  bar: 'Neighbourhood bar for cañas, vermut and cocktails. Terrace and late hours.',
  'healthy bowls': 'Poke and grain bowls, smoothies and lighter plates. Fast and fresh.',
  Mexican: 'Tacos, guac and margaritas. Lively and good for groups.',
  'Asian fusion': 'Pan-Asian small plates, ramen and bao in a casual room.',
  paella: 'Valencian rice dishes cooked over fire. Best at Sunday lunch, terrace seating.',
  seafood: 'Fresh fish and shellfish from the market, simply grilled. Near the port.',
  Mediterranean: 'Seasonal Mediterranean plates, olive oil and a relaxed terrace.',
  vegan: '100% plant-based kitchen: bowls, burgers and house desserts.',
  steak: 'Grilled meats and steaks over coals. For meat lovers and celebrations.',
  Indian: 'North Indian curries, tandoori and plenty of vegetarian options.',
  pasta: 'Fresh pasta and Italian classics in a cosy trattoria setting.',
}

// secondary cuisine pairings (plausible cross-listings)
const SECONDARY = {
  'Spanish tapas': ['Mediterranean','bar'],
  bar: ['Spanish tapas'],
  paella: ['seafood','Mediterranean'],
  seafood: ['paella','Mediterranean'],
  brunch: ['coffee','healthy bowls'],
  coffee: ['brunch'],
  'healthy bowls': ['vegan','vegetarian'],
  vegan: ['healthy bowls','vegetarian'],
  pizza: ['pasta'],
  pasta: ['pizza'],
  'menú del día': ['Spanish tapas'],
}

// build weighted category list, then deterministically shuffle so taking the
// first TARGET does not truncate whichever category sits last in the array.
const pool = []
for (const c of CATEGORIES) {
  if (!c.weight) continue
  for (let i = 0; i < c.weight; i++) pool.push(c)
}
for (let i = pool.length - 1; i > 0; i--) {
  const j = Math.floor(rnd() * (i + 1))
  ;[pool[i], pool[j]] = [pool[j], pool[i]]
}

const TARGET = 200
const usedNames = new Set()
const usedSlugs = new Set()

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// Light Valencia flavour suffixes. Only appended to standalone (no-second)
// names so we never produce "... del Mercat del Mercat".
const FLAVOUR = ['VLC', 'València', 'Russafa', 'Ruzafa', 'del Mercat', 'Centre']

// Words too generic to stand alone as a restaurant name. If a name would
// reduce to just one of these, we always append a second word or a tag.
const WEAK_ALONE = new Set([
  'Casa', 'Bar', 'La', 'El Racó', 'Smash', 'Forno', 'Wok', 'Bao', 'Zen',
  'Sal', 'Terra', 'Mare', 'Verde', 'Raíz', 'Vital', 'Bloom', 'Masala',
  'Spice', 'Fuego', 'Carbón', 'Mango', 'Lucky', 'Bambú', 'Sunny', 'Honey',
  'Citrus', 'Daily', 'Lento', 'Grano', 'Origen', 'Bruna', 'Mamma', 'Nonna',
  'Bella', 'Sakura', 'Umi', 'Nori', 'Kaito', 'Hana', 'Kenko', 'Taj',
  'Mumbai', 'Bombay', 'Oliva', 'Cafè',
  // generic restaurant-type words that read thin on their own
  'Doble', 'Cantina', 'Cervecería', 'Mesón', 'Vermutería', 'Restaurante',
  'Marisquería', 'Taquería', 'Arrocería', 'Trattoria', 'Tasca', 'Bodega',
])

function makeName(cat) {
  for (let tries = 0; tries < 60; tries++) {
    const first = pick(cat.first)
    let second = pick(cat.second)
    // Never let a weak word stand alone: force a second word (or a tag).
    if (!second && WEAK_ALONE.has(first)) {
      const opts = cat.second.filter(Boolean)
      second = opts.length && chance(0.7) ? pick(opts) : pick(FLAVOUR)
    }
    // Avoid redundant pairs like "Cafè Café" / "Forno Forno".
    if (second && first.toLowerCase() === second.toLowerCase()) continue
    let name = second ? `${first} ${second}` : first
    if (!usedNames.has(name)) { usedNames.add(name); return name }
  }
  const fallback = `${pick(cat.first)} ${pick(FLAVOUR)} ${usedNames.size}`
  usedNames.add(fallback); return fallback
}

const restaurants = []
for (let i = 0; i < TARGET; i++) {
  const cat = pool[i]
  const cuisine = cat.cuisine
  const area = pick(AREAS)
  const name = makeName(cat)
  let slug = slugify(name); let s = slug, k = 2
  while (usedSlugs.has(s)) { s = `${slug}-${k++}` }
  slug = s; usedSlugs.add(slug)

  const priceLevel = int(cat.price[0], cat.price[1])
  const avgByLevel = { 1: int(8, 15), 2: int(15, 28), 3: int(28, 48), 4: int(50, 85) }
  const averageSpend = avgByLevel[priceLevel]
  const rating = Math.round((34 + rnd() * 16)) / 10 // 3.4 - 5.0
  const reviewCount = int(18, 1400)
  const vibes = pickN(cat.vibes.length ? cat.vibes : ['casual'], Math.min(cat.vibes.length, int(2, 3)))
  const bestFor = pickN(cat.best.length ? cat.best : ['casual dinner'], Math.min(cat.best.length, int(1, 2)))
  const tags = pickN(TAGS_BY[cuisine] || ['local'], 3)
  const cover = pick(COVER_SEEDS)
  const isBrunchHours = (cuisine === 'brunch' || cuisine === 'coffee')
  const lateNight = (cuisine === 'bar' || vibes.includes('late night'))

  const veg = cuisine === 'vegan' || cuisine === 'vegetarian' || cuisine === 'healthy bowls' || chance(0.45)
  const vegan = cuisine === 'vegan' || (cuisine === 'healthy bowls' && chance(0.6)) || chance(0.18)
  const gf = cuisine === 'healthy bowls' || chance(0.3)

  const sec = (SECONDARY[cuisine] && chance(0.4)) ? [pick(SECONDARY[cuisine])] : null

  restaurants.push({
    id: `r-${String(i + 1).padStart(3, '0')}`,
    slug, name,
    description: DESCS[cuisine] || 'A Valencia favourite.',
    cuisine,
    secondaryCuisines: sec,
    tags,
    vibe: vibes,
    bestFor,
    area,
    address: `${pick(STREETS[area])} ${int(1, 180)}, ${area === 'Marina / beach' ? 'El Cabanyal' : area}`,
    priceLevel, averageSpend, rating, reviewCount,
    imagePlaceholder: cover,
    instagram: '@' + slug.replace(/-/g, '_') + '_vlc',
    phone: `+34 9${int(60, 63)} ${int(100, 999)} ${int(100, 999)}`,
    hoursKind: isBrunchHours ? 'brunch' : (lateNight ? 'late' : 'standard'),
    vegetarianFriendly: veg,
    veganFriendly: vegan,
    glutenFreeOptions: gf,
    isPartner: chance(0.12),
  })
}

// ---------- emit TS ----------
function tsStr(s) { return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'" }
function arr(a) { return '[' + a.map(tsStr).join(', ') + ']' }

let out = ''
out += '// =============================================================================\n'
out += '// FoodMatch demo restaurant database for Valencia (auto-generated).\n'
out += '// ~200 PLACEHOLDER FICTION entries for MVP/demo only. Names, addresses,\n'
out += '// phones and Instagram handles are INVENTED. Do not treat as real data.\n'
out += '// Regenerate: node scripts/genSeed.mjs > src/data/seedRestaurants.ts\n'
out += '// =============================================================================\n\n'
out += "import type { Restaurant } from '../types/restaurant'\n\n"

// shared opening builders (kept identical to prior file so isOpenAt logic is stable)
out += 'const standardOpening = (lateNight = false) => ({\n'
out += '  weeklySchedule: [\n'
out += '    { dayOfWeek: 1, open: \'13:00\', close: lateNight ? \'01:30\' : \'23:30\' },\n'
out += '    { dayOfWeek: 2, open: \'13:00\', close: lateNight ? \'01:30\' : \'23:30\' },\n'
out += '    { dayOfWeek: 3, open: \'13:00\', close: lateNight ? \'01:30\' : \'23:30\' },\n'
out += '    { dayOfWeek: 4, open: \'13:00\', close: lateNight ? \'02:00\' : \'23:30\' },\n'
out += '    { dayOfWeek: 5, open: \'13:00\', close: lateNight ? \'02:30\' : \'00:00\' },\n'
out += '    { dayOfWeek: 6, open: \'13:00\', close: lateNight ? \'02:30\' : \'00:00\' },\n'
out += '    { dayOfWeek: 0, open: \'13:00\', close: \'17:00\' },\n'
out += '  ],\n})\n\n'
out += 'const brunchHours = () => ({\n'
out += '  weeklySchedule: [\n'
out += '    { dayOfWeek: 1, open: \'08:30\', close: \'18:00\' },\n'
out += '    { dayOfWeek: 2, open: \'08:30\', close: \'18:00\' },\n'
out += '    { dayOfWeek: 3, open: \'08:30\', close: \'18:00\' },\n'
out += '    { dayOfWeek: 4, open: \'08:30\', close: \'18:00\' },\n'
out += '    { dayOfWeek: 5, open: \'08:30\', close: \'19:00\' },\n'
out += '    { dayOfWeek: 6, open: \'09:00\', close: \'19:00\' },\n'
out += '    { dayOfWeek: 0, open: \'09:00\', close: \'18:00\' },\n'
out += '  ],\n})\n\n'

out += 'export const SEED_RESTAURANTS: Restaurant[] = [\n'
for (const r of restaurants) {
  const opening = r.hoursKind === 'brunch' ? 'brunchHours()' : (r.hoursKind === 'late' ? 'standardOpening(true)' : 'standardOpening()')
  out += '  {\n'
  out += `    id: ${tsStr(r.id)}, slug: ${tsStr(r.slug)},\n`
  out += `    name: ${tsStr(r.name)},\n`
  out += `    description: ${tsStr(r.description)},\n`
  out += `    cuisine: ${tsStr(r.cuisine)},\n`
  if (r.secondaryCuisines) out += `    secondaryCuisines: ${arr(r.secondaryCuisines)},\n`
  out += `    tags: ${arr(r.tags)},\n`
  out += `    vibe: ${arr(r.vibe)},\n`
  out += `    bestFor: ${arr(r.bestFor)},\n`
  out += `    area: ${tsStr(r.area)}, city: 'Valencia',\n`
  out += `    address: ${tsStr(r.address)},\n`
  out += `    priceLevel: ${r.priceLevel}, averageSpend: ${r.averageSpend},\n`
  out += `    rating: ${r.rating.toFixed(1)}, reviewCount: ${r.reviewCount},\n`
  out += `    imagePlaceholder: ${tsStr(r.imagePlaceholder)},\n`
  out += `    instagram: ${tsStr(r.instagram)}, phone: ${tsStr(r.phone)},\n`
  out += `    opening: ${opening},\n`
  out += `    vegetarianFriendly: ${r.vegetarianFriendly}, veganFriendly: ${r.veganFriendly}, glutenFreeOptions: ${r.glutenFreeOptions},\n`
  out += `    isPartner: ${r.isPartner},\n`
  out += '  },\n'
}
out += ']\n'

process.stdout.write(out)
