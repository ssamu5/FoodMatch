// Deterministic ranking for FoodMatch.
// Scoring weights from the MVP spec:
//   cuisine match: 30
//   area/distance:  20
//   budget:         20
//   vibe/occasion:  15
//   dietary:        10
//   rating:          5
// Total max: 100.

import type { FoodIntent, MatchScore, RankedResult } from '../types/search'
import type { Restaurant, Vibe } from '../types/restaurant'

// ---------- Helpers ----------

function pricelevelFromBudget(maxSpendEur: number | null): 1 | 2 | 3 | 4 | null {
  if (maxSpendEur === null) return null
  if (maxSpendEur <= 15) return 1
  if (maxSpendEur <= 30) return 2
  if (maxSpendEur <= 55) return 3
  return 4
}

// Open/closed status with "soon" hints for the card badge.
//   open    -> closesSoon true if <= 45 min to close
//   closed  -> opensSoon  true if opening within <= 60 min today
//   unknown -> restaurant has no opening data (render nothing)
export type OpenStatus =
  | { state: 'open'; closesSoon: boolean }
  | { state: 'closed'; opensSoon: boolean }
  | { state: 'unknown' }

const CLOSES_SOON_MIN = 45
const OPENS_SOON_MIN = 60

function getOpenStatus(r: Restaurant, date = new Date()): OpenStatus {
  if (!r.opening) return { state: 'unknown' }
  const day = date.getDay()
  const todays = r.opening.weeklySchedule.find((s) => s.dayOfWeek === day)
  const minutesNow = date.getHours() * 60 + date.getMinutes()

  if (todays && todays.open !== todays.close) {
    const [oh, om] = todays.open.split(':').map(Number)
    const [ch, cm] = todays.close.split(':').map(Number)
    const openMin = oh * 60 + om
    let closeMin = ch * 60 + cm
    if (closeMin <= openMin) closeMin += 24 * 60 // wraps past midnight
    const effective = minutesNow < openMin ? minutesNow + 24 * 60 : minutesNow
    if (effective >= openMin && effective <= closeMin) {
      return { state: 'open', closesSoon: closeMin - effective <= CLOSES_SOON_MIN }
    }
    if (minutesNow < openMin) {
      return { state: 'closed', opensSoon: openMin - minutesNow <= OPENS_SOON_MIN }
    }
  }
  return { state: 'closed', opensSoon: false }
}

// Boolean convenience used by scoring + hard filters. Delegates to
// getOpenStatus; 'unknown' counts as open (no data = don't exclude).
function isOpenAt(r: Restaurant, date = new Date()): boolean {
  return getOpenStatus(r, date).state !== 'closed'
}

// ---------- Score components ----------

// Dish match. A restaurant scores when its structured menu (or, fallback,
// menuHighlights) contains a requested dish term. Neutral credit when no
// dish was requested, so existing craving queries are unaffected.
function scoreDish(intent: FoodIntent, r: Restaurant): { points: number; reason?: string } {
  if (intent.dishes.length === 0) return { points: 6 } // neutral
  const haystack = [
    ...(r.menu?.map((d) => d.name) ?? []),
    ...(r.menuHighlights ?? []),
    ...r.tags,
  ]
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  const hit = intent.dishes.find((d) => haystack.includes(d))
  if (hit) return { points: 12, reason: `serves ${hit}` }
  return { points: 0 }
}

function scoreCuisine(intent: FoodIntent, r: Restaurant): { points: number; reason?: string; warning?: string } {
  if (intent.avoidCuisines.includes(r.cuisine)) {
    return { points: -15, warning: `You said no ${r.cuisine}` }
  }
  if (intent.cuisines.length === 0) {
    return { points: 12 } // partial neutral credit when user didn't specify cuisine
  }
  if (intent.cuisines.includes(r.cuisine)) {
    return { points: 24, reason: `${r.cuisine} match` }
  }
  if (r.secondaryCuisines && r.secondaryCuisines.some((s) => intent.cuisines.includes(s))) {
    return { points: 14, reason: `also serves ${intent.cuisines.find((c) => r.secondaryCuisines?.includes(c))}` }
  }
  return { points: 0 }
}

function scoreArea(intent: FoodIntent, r: Restaurant): { points: number; reason?: string } {
  if (intent.distancePreference === 'near_me') {
    // No real geo signal in MVP. Treat near_me as "anywhere with mild center bias".
    if (r.area === 'City center') return { points: 14, reason: 'central location' }
    return { points: 10 }
  }
  if (intent.area && r.area === intent.area) {
    return { points: 18, reason: `in ${r.area}` }
  }
  if (intent.area) {
    // Different area to the one requested
    return { points: 4 }
  }
  return { points: 10 } // no preference, gentle baseline
}

function scoreBudget(intent: FoodIntent, r: Restaurant): { points: number; reason?: string; warning?: string } {
  const targetLevel = intent.budgetLevel ?? pricelevelFromBudget(intent.maxSpendEur)
  if (!targetLevel && intent.maxSpendEur === null) {
    return { points: 12 } // neutral when no budget signal
  }
  if (intent.maxSpendEur !== null) {
    if (r.averageSpend <= intent.maxSpendEur) {
      const slack = intent.maxSpendEur - r.averageSpend
      const points = 18 - Math.min(8, slack * 0.4) // strong fit, slight ding if way under
      return { points: Math.round(points), reason: `~€${r.averageSpend} fits €${intent.maxSpendEur} budget` }
    }
    // Over budget
    if (r.averageSpend <= intent.maxSpendEur * 1.2) {
      return { points: 8, warning: `slightly over your €${intent.maxSpendEur} budget` }
    }
    return { points: -5, warning: `over your €${intent.maxSpendEur} budget` }
  }
  if (targetLevel) {
    if (r.priceLevel === targetLevel) return { points: 18, reason: `price level matches` }
    if (Math.abs(r.priceLevel - targetLevel) === 1) return { points: 10 }
    return { points: 0 }
  }
  return { points: 10 }
}

function scoreVibeAndOccasion(intent: FoodIntent, r: Restaurant): { points: number; reason?: string } {
  let pts = 0
  const matched: string[] = []
  const wanted: Vibe[] = [...intent.vibe]
  if (intent.occasion === 'date' && !wanted.includes('date')) wanted.push('date')
  if (intent.occasion === 'family' && !wanted.includes('family')) wanted.push('family')
  if (intent.occasion === 'friends' && !wanted.includes('group')) wanted.push('group')
  if (intent.occasion === 'solo' && !wanted.includes('solo')) wanted.push('solo')
  if (intent.occasion === 'work' && !wanted.includes('work')) wanted.push('work')

  for (const v of wanted) {
    if (r.vibe.includes(v)) {
      pts += 5
      matched.push(v)
    }
  }
  if (wanted.length === 0) pts = 9 // neutral when no vibe signal
  pts = Math.min(pts, 13)
  return matched.length > 0
    ? { points: pts, reason: `${matched.slice(0, 2).join(', ')} vibe` }
    : { points: pts }
}

function scoreDietary(intent: FoodIntent, r: Restaurant): { points: number; reason?: string; warning?: string } {
  if (intent.dietary.length === 0) return { points: 7 }
  let ok = true
  const okFlags: string[] = []
  for (const d of intent.dietary) {
    if (d === 'vegan' && !r.veganFriendly) ok = false
    else if (d === 'vegetarian' && !r.vegetarianFriendly) ok = false
    else if (d === 'gluten-free' && !r.glutenFreeOptions) ok = false
    else okFlags.push(d)
  }
  if (!ok) return { points: -5, warning: `may not cover your ${intent.dietary.join(', ')} needs` }
  return { points: 10, reason: `${okFlags.join(' + ')} options` }
}

function scoreRating(r: Restaurant): { points: number; reason?: string } {
  // 5 points max. Rating 4.5+ = 5, 4.0 = 3, 3.5 = 1.5, etc.
  const pts = Math.max(0, Math.min(5, (r.rating - 3.5) * 5))
  return { points: Math.round(pts * 10) / 10, reason: r.rating >= 4.5 ? `rated ${r.rating}★` : undefined }
}

// ---------- Public API ----------

export function scoreRestaurant(intent: FoodIntent, r: Restaurant): MatchScore {
  const reasons: string[] = []
  const warnings: string[] = []
  let total = 0

  const parts = [
    scoreDish(intent, r),
    scoreCuisine(intent, r),
    scoreArea(intent, r),
    scoreBudget(intent, r),
    scoreVibeAndOccasion(intent, r),
    scoreDietary(intent, r),
    scoreRating(r),
  ]
  for (const p of parts as Array<{ points: number; reason?: string; warning?: string }>) {
    total += p.points
    if (p.reason) reasons.push(p.reason)
    if (p.warning) warnings.push(p.warning)
  }

  // Open-now hard filter is enforced upstream in rankRestaurants when requested.
  // Soft penalty if mustBeOpenNow but not open.
  if (intent.mustBeOpenNow && !isOpenAt(r)) {
    total -= 20
    warnings.push('closed right now')
  }

  // Clamp final score 0..100
  total = Math.max(0, Math.min(100, Math.round(total)))

  return { score: total, reasons, warnings }
}

export function rankRestaurants(
  intent: FoodIntent,
  restaurants: Restaurant[],
  opts: { hardFilterOpenNow?: boolean; minScore?: number } = {},
): RankedResult[] {
  const minScore = opts.minScore ?? 0
  const filtered = opts.hardFilterOpenNow ? restaurants.filter((r) => isOpenAt(r)) : restaurants

  const scored = filtered.map((r) => ({
    restaurantId: r.id,
    score: scoreRestaurant(intent, r),
  }))

  return scored
    .filter((s) => s.score.score >= minScore)
    .sort((a, b) => b.score.score - a.score.score)
}

export function buildMatchExplanation(
  intent: FoodIntent,
  r: Restaurant,
  score: MatchScore,
): string {
  // Short, plain, useful one-liner explanation for the top match.
  // Falls back to a generic sentence if no specific reasons emerged.
  const positives = score.reasons.slice(0, 3)
  const lead = positives.length > 0 ? positives.join(' • ') : `${r.cuisine} in ${r.area}`
  const fit =
    intent.maxSpendEur !== null && r.averageSpend <= intent.maxSpendEur
      ? ` Fits your €${intent.maxSpendEur} budget at ~€${r.averageSpend} per person.`
      : ` Around €${r.averageSpend} per person.`
  return `${lead}.${fit}`
}

export { isOpenAt, getOpenStatus }
