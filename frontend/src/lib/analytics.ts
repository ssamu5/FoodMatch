// Local analytics buffer.
// MVP version stores events in localStorage so the admin page can show stats
// without a backend. The `track` function is the single integration point;
// when Supabase or a real analytics backend lands, replace the body of `track`
// with the network call and keep the existing call sites untouched.

import type { AnalyticsEvent, AnalyticsEventType } from '../types/profile'
import { getDeviceId } from './deviceId'

const KEY = 'foodmatch.analytics'
const MAX_EVENTS = 2000

function readAll(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as AnalyticsEvent[]
  } catch {
    return []
  }
}

function writeAll(events: AnalyticsEvent[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
  } catch {
    /* quota */
  }
}

export function track(
  type: AnalyticsEventType,
  payload?: Record<string, unknown>,
): void {
  const event: AnalyticsEvent = {
    type,
    deviceId: getDeviceId(),
    createdAt: new Date().toISOString(),
    payload,
  }
  const events = readAll()
  events.push(event)
  writeAll(events)

  // When the backend is wired, replace with:
  //   fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) })
  // eslint-disable-next-line no-console
  if (typeof console !== 'undefined') console.debug('[analytics]', type, payload || '')
}

export function getEvents(): AnalyticsEvent[] {
  return readAll()
}

export function clearEvents(): void {
  writeAll([])
}

// Helpers for the admin view

function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function summarizeEvents() {
  const events = readAll()
  const today = startOfToday()
  const todayEvents = events.filter((e) => new Date(e.createdAt).getTime() >= today)

  const byType: Record<string, number> = {}
  for (const e of events) byType[e.type] = (byType[e.type] || 0) + 1

  // Top clicked restaurants
  const restaurantClicks: Record<string, number> = {}
  for (const e of events) {
    if (e.type === 'restaurant_opened') {
      const id = (e.payload?.restaurantId as string) || 'unknown'
      restaurantClicks[id] = (restaurantClicks[id] || 0) + 1
    }
  }

  // No-result searches
  const noResultQueries: string[] = []
  for (const e of events) {
    if (e.type === 'no_results') {
      const q = (e.payload?.query as string) || ''
      if (q) noResultQueries.push(q)
    }
  }

  // Top cuisines and areas from prompt_submitted intents
  const cuisineCounts: Record<string, number> = {}
  const areaCounts: Record<string, number> = {}
  for (const e of events) {
    if (e.type === 'prompt_submitted') {
      const cuisines = (e.payload?.cuisines as string[]) || []
      cuisines.forEach((c) => {
        cuisineCounts[c] = (cuisineCounts[c] || 0) + 1
      })
      const area = e.payload?.area as string | null | undefined
      if (area) areaCounts[area] = (areaCounts[area] || 0) + 1
    }
  }

  return {
    total: events.length,
    today: todayEvents.length,
    searches: byType['prompt_submitted'] || 0,
    searchesToday: todayEvents.filter((e) => e.type === 'prompt_submitted').length,
    byType,
    restaurantClicks,
    noResultQueries: noResultQueries.slice(-20).reverse(),
    cuisineCounts,
    areaCounts,
  }
}
