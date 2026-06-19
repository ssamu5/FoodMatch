// Staged search pipeline: filter -> shortlist -> rank -> explain.
//
// The expensive ranker (and a future LLM re-ranker) only ever sees the
// SHORTLIST, never the whole database. The coarse `filter` stage is the seam
// a real SQL `WHERE` slots into: today SeedSource filters in memory; a future
// SupabaseSource would issue a query with the same HardFilter contract.
//
// Synchronous by design (seed data is in-memory, instant). When the DB lands,
// the source becomes async and only this file + api.ts change; pages do not.

import type { Restaurant, Cuisine, Area } from '../types/restaurant'
import type { FoodIntent, RankedResult } from '../types/search'
import { rankRestaurants, isOpenAt } from './ranking'
import { formatReason } from './reasonFormatter'
import { firstMatchingDish, textMatchesDish } from './searchLexicon'

export interface HardFilter {
  cuisines?: Cuisine[]
  dishes?: string[]
  area?: Area | null
  maxSpendEur?: number | null
  openNow?: boolean
  avoidCuisines?: Cuisine[]
}

export interface RestaurantSource {
  all(): Promise<Restaurant[]>
  find(filter: HardFilter): Promise<Restaurant[]>
}

export interface PipelineDiagnostics {
  total: number
  filtered: number
  shortlisted: number
  ranked: number
  ms: number
  widened: boolean
}

export interface PipelineResult {
  results: Restaurant[]
  ranked: RankedResult[]
  diagnostics: PipelineDiagnostics
}

function restaurantSearchText(r: Restaurant): string {
  return [
    r.name,
    r.description,
    ...(r.menu?.map((d) => d.name) ?? []),
    ...(r.menuHighlights ?? []),
    ...r.tags,
    ...r.bestFor,
    r.cuisine,
    ...(r.secondaryCuisines ?? []),
  ].join(' ')
}

function matchesFilter(r: Restaurant, f: HardFilter): boolean {
  if (f.openNow && !isOpenAt(r)) return false
  if (f.avoidCuisines) {
    const sec = r.secondaryCuisines ?? []
    if (f.avoidCuisines.includes(r.cuisine) || sec.some((c) => f.avoidCuisines!.includes(c))) return false
  }
  if (f.area && r.area !== f.area) return false
  if (f.maxSpendEur != null && r.averageSpend > f.maxSpendEur * 1.2) return false
  if (f.cuisines && f.cuisines.length) {
    const sec = r.secondaryCuisines ?? []
    if (!f.cuisines.includes(r.cuisine) && !sec.some((c) => f.cuisines!.includes(c))) return false
  }
  if (f.dishes && f.dishes.length) {
    const hay = restaurantSearchText(r)
    if (!firstMatchingDish(f.dishes, hay)) return false
  }
  return true
}

// In-memory source backed by the seed array. SQL-backed source replaces this.
export class SeedSource implements RestaurantSource {
  constructor(private rows: Restaurant[]) {}
  async all(): Promise<Restaurant[]> {
    return this.rows
  }
  async find(filter: HardFilter): Promise<Restaurant[]> {
    return this.rows.filter((r) => matchesFilter(r, filter))
  }
}

function hardFilterFromIntent(intent: FoodIntent): HardFilter {
  return {
    cuisines: intent.cuisines,
    dishes: intent.dishes,
    area: intent.area,
    maxSpendEur: intent.maxSpendEur,
    openNow: intent.mustBeOpenNow,
    avoidCuisines: intent.avoidCuisines,
  }
}

// Cheap pre-score for the shortlist cap: count of hard signals a row hits.
function cheapScore(r: Restaurant, intent: FoodIntent): number {
  let n = 0
  if (intent.dishes.length) {
    const dishHits = intent.dishes.filter((d) => textMatchesDish(restaurantSearchText(r), d)).length
    n += (dishHits / intent.dishes.length) * 5
  }
  if (intent.cuisines.includes(r.cuisine)) n += 3
  if (r.secondaryCuisines?.some((c) => intent.cuisines.includes(c))) n += 2
  if (intent.area && r.area === intent.area) n += 2
  if (intent.maxSpendEur != null && r.averageSpend <= intent.maxSpendEur) n += 2
  if (intent.dietary.includes('gluten-free') && r.glutenFreeOptions) n += 2
  if (intent.dietary.includes('vegan') && r.veganFriendly) n += 2
  if (intent.dietary.includes('vegetarian') && r.vegetarianFriendly) n += 1
  if (intent.vibe.some((v) => r.vibe.includes(v))) n += 1
  if (r.isPartner) n += 0.4
  n += r.rating // rating (0-5) as a tie-break; deliberately below hard-signal weights
  return n
}

const MIN_CANDIDATES = 8

export interface CompactRerankCandidate {
  id: string
  n: string // name
  c: string // cuisine
  a: string // area
  p: number // average spend
  r: number // rating
  m: string[] // compact menu/tag evidence
  e: string[] // current deterministic reasons
}

export interface CompactRerankPacket {
  query: string
  constraints: {
    area: string | null
    budget: number | null
    dietary: string[]
    dishes: string[]
    vibe: string[]
  }
  candidates: CompactRerankCandidate[]
  estimatedChars: number
  truncated: boolean
}

export async function runSearchPipeline(
  intent: FoodIntent,
  source: RestaurantSource,
  opts: { shortlistCap?: number; minScore?: number } = {},
): Promise<PipelineResult> {
  const start = Date.now()
  const allRows = await source.all()
  const total = allRows.length
  const cap = opts.shortlistCap ?? 150
  const minScore = opts.minScore ?? 10

  // 1. filter (coarse / SQL-WHERE seam)
  let candidates = await source.find(hardFilterFromIntent(intent))
  const filtered = candidates.length // true post-filter count, before any widening

  // widen: if the filter was too aggressive, fall back to all rows so we
  // never return an empty page on a reasonable query.
  const widened = candidates.length < MIN_CANDIDATES
  if (widened) {
    candidates = allRows
  }

  // 2. shortlist (cap)
  const shortlist =
    candidates.length > cap
      ? [...candidates].sort((a, b) => cheapScore(b, intent) - cheapScore(a, intent)).slice(0, cap)
      : candidates
  const shortlisted = shortlist.length

  // 3. rank (expensive; only sees the shortlist)
  const rankedResults = rankRestaurants(intent, shortlist, {
    hardFilterOpenNow: intent.mustBeOpenNow,
    minScore,
  })

  // 4. explain (resolve to restaurants; explanations built by callers/cards)
  const byId = new Map(shortlist.map((r) => [r.id, r]))
  const results = rankedResults.map((rr) => byId.get(rr.restaurantId)).filter((x): x is Restaurant => Boolean(x))

  return {
    results,
    ranked: rankedResults,
    diagnostics: { total, filtered, shortlisted, ranked: results.length, ms: Date.now() - start, widened },
  }
}

function compactEvidence(r: Restaurant, intent: FoodIntent): string[] {
  const menuNames = r.menu?.map((d) => d.name) ?? []
  const dishHits = intent.dishes.length
    ? menuNames.filter((name) => firstMatchingDish(intent.dishes, name)).slice(0, 3)
    : []
  const tags = [...r.tags, ...r.bestFor].slice(0, 3)
  const fallbackMenu = menuNames.slice(0, Math.max(0, 3 - dishHits.length))
  return Array.from(new Set([...dishHits, ...fallbackMenu, ...tags])).slice(0, 5)
}

export function buildCompactRerankPacket(
  intent: FoodIntent,
  restaurants: Restaurant[],
  ranked: RankedResult[],
  opts: { limit?: number; charBudget?: number } = {},
): CompactRerankPacket {
  const limit = opts.limit ?? 8
  const charBudget = opts.charBudget ?? 2400
  const rankedById = new Map(ranked.map((rr) => [rr.restaurantId, rr]))
  const base: CompactRerankPacket = {
    query: intent.rawQuery,
    constraints: {
      area: intent.area,
      budget: intent.maxSpendEur,
      dietary: intent.dietary,
      dishes: intent.dishes,
      vibe: intent.vibe,
    },
    candidates: [],
    estimatedChars: 0,
    truncated: false,
  }

  for (const r of restaurants.slice(0, limit)) {
    const candidate: CompactRerankCandidate = {
      id: r.id,
      n: r.name,
      c: r.cuisine,
      a: r.area,
      p: r.averageSpend,
      r: r.rating,
      m: compactEvidence(r, intent),
      e: (rankedById.get(r.id)?.score.reasons.slice(0, 3) ?? []).map((t) => formatReason(t, 'en')),
    }
    const next = { ...base, candidates: [...base.candidates, candidate] }
    const nextChars = JSON.stringify(next).length
    if (nextChars > charBudget && base.candidates.length > 0) {
      base.truncated = true
      break
    }
    base.candidates.push(candidate)
    base.estimatedChars = JSON.stringify(base).length
    if (base.estimatedChars >= charBudget) {
      base.truncated = true
      break
    }
  }

  base.estimatedChars = JSON.stringify(base).length
  return base
}
