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

export interface HardFilter {
  cuisines?: Cuisine[]
  dishes?: string[]
  area?: Area | null
  maxSpendEur?: number | null
  openNow?: boolean
  avoidCuisines?: Cuisine[]
}

export interface RestaurantSource {
  all(): Restaurant[]
  find(filter: HardFilter): Restaurant[]
}

export interface PipelineDiagnostics {
  total: number
  filtered: number
  shortlisted: number
  ranked: number
  ms: number
}

export interface PipelineResult {
  results: Restaurant[]
  ranked: RankedResult[]
  diagnostics: PipelineDiagnostics
}

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function matchesFilter(r: Restaurant, f: HardFilter): boolean {
  if (f.openNow && !isOpenAt(r)) return false
  if (f.avoidCuisines && f.avoidCuisines.includes(r.cuisine)) return false
  if (f.area && r.area !== f.area) return false
  if (f.maxSpendEur != null && r.averageSpend > f.maxSpendEur * 1.2) return false
  if (f.cuisines && f.cuisines.length) {
    const sec = r.secondaryCuisines ?? []
    if (!f.cuisines.includes(r.cuisine) && !sec.some((c) => f.cuisines!.includes(c))) return false
  }
  if (f.dishes && f.dishes.length) {
    const hay = norm([...(r.menu?.map((d) => d.name) ?? []), ...(r.menuHighlights ?? []), ...r.tags, r.cuisine].join(' '))
    if (!f.dishes.some((d) => hay.includes(norm(d)))) return false
  }
  return true
}

// In-memory source backed by the seed array. SQL-backed source replaces this.
export class SeedSource implements RestaurantSource {
  constructor(private rows: Restaurant[]) {}
  all(): Restaurant[] {
    return this.rows
  }
  find(filter: HardFilter): Restaurant[] {
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
  if (intent.cuisines.includes(r.cuisine)) n += 2
  if (intent.area && r.area === intent.area) n += 1
  if (intent.maxSpendEur != null && r.averageSpend <= intent.maxSpendEur) n += 1
  n += r.rating // tie-break toward better-rated
  return n
}

const MIN_CANDIDATES = 8

export function runSearchPipeline(
  intent: FoodIntent,
  source: RestaurantSource,
  opts: { shortlistCap?: number; minScore?: number } = {},
): PipelineResult {
  const start = Date.now()
  const total = source.all().length
  const cap = opts.shortlistCap ?? 150
  const minScore = opts.minScore ?? 10

  // 1. filter (coarse / SQL-WHERE seam)
  let candidates = source.find(hardFilterFromIntent(intent))

  // widen: if the filter was too aggressive, fall back to all rows so we
  // never return an empty page on a reasonable query.
  if (candidates.length < MIN_CANDIDATES) {
    candidates = source.all()
  }
  const filtered = candidates.length

  // 2. shortlist (cap)
  const shortlist =
    candidates.length > cap
      ? [...candidates].sort((a, b) => cheapScore(b, intent) - cheapScore(a, intent)).slice(0, cap)
      : candidates
  const shortlisted = shortlist.length

  // 3. rank (expensive; only sees the shortlist)
  const ranked = rankRestaurants(intent, shortlist, {
    hardFilterOpenNow: intent.mustBeOpenNow,
    minScore,
  })

  // 4. explain (resolve to restaurants; explanations built by callers/cards)
  const byId = new Map(shortlist.map((r) => [r.id, r]))
  const results = ranked.map((rr) => byId.get(rr.restaurantId)).filter((x): x is Restaurant => Boolean(x))

  return {
    results,
    ranked,
    diagnostics: { total, filtered, shortlisted, ranked: results.length, ms: Date.now() - start },
  }
}
