// Deterministic intent parser for FoodMatch.
// Pure JS keyword matching. No LLM in V1.
// When a runtime AI is wired later, it can replace or augment this function
// while keeping the same FoodIntent return shape.

import type {
  FoodIntent,
  Occasion,
  TimePref,
  DistancePref,
} from '../types/search'
import type { Area, Cuisine, Vibe } from '../types/restaurant'
import type { TasteProfile } from '../types/profile'

// ---------- Vocab dictionaries ----------

// Map keywords to canonical cuisine values.
const CUISINE_KEYWORDS: Array<{ canonical: Cuisine; keywords: string[] }> = [
  { canonical: 'Spanish tapas', keywords: ['tapas', 'tapa', 'pintxos', 'pinchos', 'spanish'] },
  { canonical: 'paella', keywords: ['paella', 'arroz', 'rice dish', 'arroz a banda', 'arroz negro'] },
  { canonical: 'sushi', keywords: ['sushi', 'sashimi', 'omakase', 'maki', 'japanese', 'japonesa'] },
  { canonical: 'burgers', keywords: ['burger', 'burgers', 'hamburger', 'hamburguesa', 'smashburger', 'smash burger'] },
  { canonical: 'pizza', keywords: ['pizza', 'pizzas', 'neapolitan', 'pizzeria'] },
  { canonical: 'pasta', keywords: ['pasta', 'spaghetti', 'carbonara', 'linguine', 'italian', 'italiana'] },
  { canonical: 'healthy bowls', keywords: ['healthy', 'bowl', 'bowls', 'poke', 'salad', 'salads', 'saludable', 'light', 'ligero'] },
  { canonical: 'vegan', keywords: ['vegan', 'plant-based', 'vegana', 'veganos'] },
  { canonical: 'vegetarian', keywords: ['vegetarian', 'vegetariano', 'veggie', 'meat-free'] },
  { canonical: 'brunch', keywords: ['brunch', 'breakfast', 'desayuno', 'morning'] },
  { canonical: 'coffee', keywords: ['coffee', 'cafe', 'café', 'espresso', 'flat white', 'latte'] },
  { canonical: 'Mexican', keywords: ['mexican', 'tacos', 'taqueria', 'taco', 'mexicano', 'mexicana', 'burrito', 'quesadilla'] },
  { canonical: 'Indian', keywords: ['indian', 'curry', 'tandoor', 'tikka', 'naan', 'india', 'indio'] },
  { canonical: 'Asian fusion', keywords: ['asian', 'asiatica', 'asiático', 'thai', 'vietnamese', 'pho', 'ramen', 'korean', 'bibimbap'] },
  { canonical: 'Mediterranean', keywords: ['mediterranean', 'mediterránea', 'mediterranea'] },
  { canonical: 'seafood', keywords: ['seafood', 'fish', 'mariscos', 'pescado', 'octopus', 'squid', 'prawns'] },
  { canonical: 'steak', keywords: ['steak', 'steakhouse', 'asador', 'parrilla', 'grill', 'carne'] },
  { canonical: 'menú del día', keywords: ['menu del dia', 'menu of the day', 'daily menu', 'set menu', 'menu', 'lunch menu', 'menu economico'] },
  { canonical: 'bar', keywords: ['bar', 'bars', 'cerveza', 'beer', 'cana', 'wine bar', 'vermut', 'vermouth', 'cocktail', 'cocktails', 'copas'] },
]

const AREA_KEYWORDS: Array<{ canonical: Area; keywords: string[] }> = [
  { canonical: 'Ruzafa', keywords: ['ruzafa', 'russafa'] },
  { canonical: 'El Carmen', keywords: ['carmen', 'el carmen', 'old town', 'casco antiguo'] },
  { canonical: 'Canovas', keywords: ['canovas', 'cánovas'] },
  { canonical: 'Benimaclet', keywords: ['benimaclet'] },
  { canonical: 'City center', keywords: ['center', 'centre', 'centro', 'downtown', 'city center', 'centro ciudad', 'mercado central'] },
  { canonical: 'Marina / beach', keywords: ['beach', 'playa', 'marina', 'malvarrosa', 'cabanyal', 'sea', 'mar'] },
]

const VIBE_KEYWORDS: Array<{ canonical: Vibe; keywords: string[] }> = [
  { canonical: 'romantic', keywords: ['romantic', 'romantica', 'romántica', 'intimate', 'intimo', 'candle'] },
  { canonical: 'casual', keywords: ['casual', 'chill', 'relaxed', 'informal'] },
  { canonical: 'lively', keywords: ['lively', 'fun', 'noisy', 'animado', 'party', 'fiesta'] },
  { canonical: 'quiet', keywords: ['quiet', 'tranquilo', 'calm', 'calmado'] },
  { canonical: 'date', keywords: ['date night', 'date', 'cita', 'romantic'] },
  { canonical: 'group', keywords: ['group', 'groups', 'grupo', 'big group', 'large group'] },
  { canonical: 'solo', keywords: ['solo', 'alone', 'just me', 'by myself'] },
  { canonical: 'family', keywords: ['family', 'kids', 'familia', 'family-friendly', 'familiar', 'niños'] },
  { canonical: 'work', keywords: ['work', 'laptop', 'business lunch', 'meeting', 'trabajo'] },
  { canonical: 'late night', keywords: ['late', 'late night', 'tarde', 'madrugada', 'after midnight'] },
  { canonical: 'outdoor', keywords: ['outdoor', 'terrace', 'terraza', 'al fresco', 'patio'] },
  { canonical: 'view', keywords: ['view', 'vista', 'sea view', 'rooftop'] },
  { canonical: 'cozy', keywords: ['cozy', 'cozy spot', 'acogedor'] },
  { canonical: 'cheap eats', keywords: ['cheap', 'cheap eats', 'barato', 'low cost', 'budget'] },
]

const OCCASION_KEYWORDS: Array<{ canonical: Occasion; keywords: string[] }> = [
  { canonical: 'date', keywords: ['date', 'date night', 'cita', 'anniversary', 'aniversario'] },
  { canonical: 'solo', keywords: ['solo', 'alone', 'just me'] },
  { canonical: 'friends', keywords: ['friends', 'group of friends', 'amigos', 'with friends'] },
  { canonical: 'family', keywords: ['family', 'familia', 'kids', 'parents', 'with kids'] },
  { canonical: 'work', keywords: ['work', 'business lunch', 'meeting', 'colegas', 'work lunch', 'team lunch'] },
]

const TIME_KEYWORDS: Array<{ canonical: TimePref; keywords: string[] }> = [
  { canonical: 'lunch', keywords: ['lunch', 'mediodia', 'mediodía', 'almuerzo', 'midday'] },
  { canonical: 'dinner', keywords: ['dinner', 'cena', 'evening'] },
  { canonical: 'late', keywords: ['late night', 'after midnight', 'madrugada', 'late'] },
  { canonical: 'now', keywords: ['right now', 'now', 'ahora', 'tonight', 'esta noche'] },
]

const DIETARY_KEYWORDS: Array<{ canonical: 'vegetarian' | 'vegan' | 'gluten-free'; keywords: string[] }> = [
  { canonical: 'vegan', keywords: ['vegan', 'vegana', 'vegano', 'plant-based'] },
  { canonical: 'vegetarian', keywords: ['vegetarian', 'vegetariano', 'veggie'] },
  { canonical: 'gluten-free', keywords: ['gluten free', 'gluten-free', 'sin gluten', 'celiac', 'celiaco'] },
]

const OPEN_NOW_KEYWORDS = ['open now', 'right now', 'tonight', 'esta noche', 'ahora']
const NEAR_ME_KEYWORDS = ['near me', 'close', 'cerca', 'cerca de mi', 'closest', 'nearby']

// ---------- Helpers ----------

function normalize(query: string): string {
  return query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9€\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function contains(haystack: string, needle: string): boolean {
  // Word-boundary friendly contains
  if (!needle) return false
  if (needle.includes(' ')) return haystack.includes(needle)
  const re = new RegExp(`(^|\\s)${needle}(s)?(\\s|$|\\.|,)`, 'i')
  return re.test(haystack)
}

// ---------- Field extractors ----------

function extractCuisines(q: string): Cuisine[] {
  const found = new Set<Cuisine>()
  for (const { canonical, keywords } of CUISINE_KEYWORDS) {
    if (keywords.some((k) => contains(q, k))) found.add(canonical)
  }
  return Array.from(found)
}

function extractAvoidCuisines(q: string): Cuisine[] {
  // Look for "no <cuisine>" / "not <cuisine>" / "without <cuisine>" / "sin <cuisine>"
  const found = new Set<Cuisine>()
  const negators = ['no', 'not', 'without', 'sin', 'avoid', 'except']
  for (const { canonical, keywords } of CUISINE_KEYWORDS) {
    for (const k of keywords) {
      for (const n of negators) {
        const phrase = `${n} ${k}`
        if (q.includes(phrase)) found.add(canonical)
      }
    }
  }
  return Array.from(found)
}

function extractArea(q: string): Area | null {
  for (const { canonical, keywords } of AREA_KEYWORDS) {
    if (keywords.some((k) => contains(q, k))) return canonical
  }
  return null
}

function extractVibe(q: string): Vibe[] {
  const found = new Set<Vibe>()
  for (const { canonical, keywords } of VIBE_KEYWORDS) {
    if (keywords.some((k) => contains(q, k))) found.add(canonical)
  }
  return Array.from(found)
}

function extractOccasion(q: string): Occasion | null {
  for (const { canonical, keywords } of OCCASION_KEYWORDS) {
    if (keywords.some((k) => contains(q, k))) return canonical
  }
  return null
}

function extractTime(q: string): TimePref | null {
  for (const { canonical, keywords } of TIME_KEYWORDS) {
    if (keywords.some((k) => contains(q, k))) return canonical
  }
  return null
}

function extractDietary(q: string): ('vegetarian' | 'vegan' | 'gluten-free')[] {
  const found = new Set<'vegetarian' | 'vegan' | 'gluten-free'>()
  for (const { canonical, keywords } of DIETARY_KEYWORDS) {
    if (keywords.some((k) => contains(q, k))) found.add(canonical)
  }
  return Array.from(found)
}

function extractMustBeOpenNow(q: string): boolean {
  return OPEN_NOW_KEYWORDS.some((k) => q.includes(k))
}

function extractDistance(q: string, area: Area | null): DistancePref {
  if (NEAR_ME_KEYWORDS.some((k) => q.includes(k))) return 'near_me'
  if (area) return 'area'
  return 'anywhere'
}

function extractBudget(q: string): {
  budgetLevel: FoodIntent['budgetLevel']
  maxSpendEur: number | null
} {
  // Match "under €20", "under 20", "less than 20", "max 25", "20 euros", "€20", etc.
  let maxSpendEur: number | null = null

  const moneyPatterns = [
    /under\s*€?\s*(\d{1,4})/i,
    /less than\s*€?\s*(\d{1,4})/i,
    /max(?:imum)?\s*€?\s*(\d{1,4})/i,
    /menos de\s*€?\s*(\d{1,4})/i,
    /hasta\s*€?\s*(\d{1,4})/i,
    /por debajo de\s*€?\s*(\d{1,4})/i,
    /€\s*(\d{1,4})/i,
    /(\d{1,4})\s*(?:€|euros?)/i,
  ]
  for (const re of moneyPatterns) {
    const m = q.match(re)
    if (m && m[1]) {
      const n = Number(m[1])
      if (Number.isFinite(n) && n > 0 && n < 1000) {
        maxSpendEur = n
        break
      }
    }
  }

  // Word-based budget cues
  const cheap = /\b(cheap|barato|barata|cheap eats|budget|low cost|economic|affordable|barata)\b/.test(q)
  const fancy = /\b(fancy|fine dining|high-end|alta cocina|gastronomico|gastronómico|expensive|caro)\b/.test(q)
  const mid = /\b(mid-range|moderate|moderado)\b/.test(q)

  let budgetLevel: FoodIntent['budgetLevel'] = null
  if (maxSpendEur !== null) {
    if (maxSpendEur <= 15) budgetLevel = 1
    else if (maxSpendEur <= 30) budgetLevel = 2
    else if (maxSpendEur <= 55) budgetLevel = 3
    else budgetLevel = 4
  } else if (cheap) budgetLevel = 1
  else if (mid) budgetLevel = 2
  else if (fancy) budgetLevel = 4

  return { budgetLevel, maxSpendEur }
}

// ---------- Main parser ----------

export function parseFoodIntent(query: string, city = 'Valencia'): FoodIntent {
  const q = normalize(query)

  const cuisines = extractCuisines(q)
  const avoidCuisines = extractAvoidCuisines(q)
  // Remove avoided cuisines from cuisines if both detected
  const finalCuisines = cuisines.filter((c) => !avoidCuisines.includes(c))

  const area = extractArea(q)
  const vibe = extractVibe(q)
  const occasion = extractOccasion(q)
  const time = extractTime(q)
  const dietary = extractDietary(q)
  const mustBeOpenNow = extractMustBeOpenNow(q)
  const distancePreference = extractDistance(q, area)
  const { budgetLevel, maxSpendEur } = extractBudget(q)

  return {
    rawQuery: query,
    cuisines: finalCuisines,
    avoidCuisines,
    budgetLevel,
    maxSpendEur,
    area,
    city,
    distancePreference,
    vibe,
    occasion,
    dietary,
    time,
    mustBeOpenNow,
  }
}

// ---------- Preference-based intent ----------

/** True if the saved taste profile carries any usable ranking signal. */
export function profileHasSignal(p: TasteProfile): boolean {
  return (
    p.favoriteCuisines.length > 0 ||
    p.preferredAreas.length > 0 ||
    p.dietary.length > 0 ||
    p.vibePreferences.length > 0 ||
    p.budgetComfort !== null
  )
}

/**
 * Build a FoodIntent from saved preferences, used to personalise the browse
 * view when the user opens results without typing a query.
 */
export function intentFromProfile(p: TasteProfile, city = 'Valencia'): FoodIntent {
  return {
    rawQuery: '',
    cuisines: p.favoriteCuisines,
    avoidCuisines: [],
    budgetLevel: p.budgetComfort,
    maxSpendEur: null,
    area: p.preferredAreas[0] ?? null,
    city,
    distancePreference: p.preferredAreas.length > 0 ? 'area' : 'anywhere',
    vibe: p.vibePreferences,
    occasion: null,
    dietary: p.dietary,
    time: null,
    mustBeOpenNow: false,
  }
}

// ---------- Starter chip presets ----------

export const STARTER_CHIPS: Array<{ label: string; query: string }> = [
  { label: 'Dinner under €20', query: 'Dinner under €20' },
  { label: 'Date night sushi', query: 'Date night sushi' },
  { label: 'Healthy lunch near me', query: 'Healthy lunch near me' },
  { label: 'Group dinner tonight', query: 'Group dinner tonight' },
]

// ---------- Refinement helper ----------

// Mutates intent by applying one of the quick refinement chips on the Ask page.
export function applyRefinement(intent: FoodIntent, refinement: string): FoodIntent {
  const next: FoodIntent = { ...intent }
  switch (refinement) {
    case 'cheaper':
      next.budgetLevel = Math.max(1, ((next.budgetLevel ?? 3) - 1)) as FoodIntent['budgetLevel']
      if (next.maxSpendEur) next.maxSpendEur = Math.max(8, next.maxSpendEur - 8)
      else next.maxSpendEur = 18
      break
    case 'closer':
      next.distancePreference = 'near_me'
      break
    case 'romantic':
      if (!next.vibe.includes('romantic')) next.vibe = [...next.vibe, 'romantic']
      if (!next.vibe.includes('date')) next.vibe = [...next.vibe, 'date']
      break
    case 'open now':
      next.mustBeOpenNow = true
      next.time = 'now'
      break
    case 'vegetarian':
      if (!next.dietary.includes('vegetarian')) next.dietary = [...next.dietary, 'vegetarian']
      break
    default:
      break
  }
  return next
}
