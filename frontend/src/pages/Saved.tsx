import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import RestaurantCard from '../components/RestaurantCard'
import EmptyState from '../components/EmptyState'
import { api } from '../lib/api'
import {
  clearRecentSearches,
  getRecentSearches,
  getSavedIds,
  removeRecentSearch,
  unsaveRestaurant,
} from '../lib/storage'
import { track } from '../lib/analytics'
import type { SearchEvent } from '../types/search'
import type { Restaurant } from '../types/restaurant'

export default function Saved() {
  const [saved, setSaved] = useState<Restaurant[]>([])
  const [recent, setRecent] = useState<SearchEvent[]>([])

  useEffect(() => {
    const ids = getSavedIds()
    setSaved(api.getRestaurantsByIds(ids))
    setRecent(getRecentSearches())
  }, [])

  function removeSaved(id: string) {
    unsaveRestaurant(id)
    setSaved((list) => list.filter((r) => r.id !== id))
    track('restaurant_unsaved', { restaurantId: id, source: 'saved' })
  }

  function removeRecent(query: string) {
    removeRecentSearch(query)
    setRecent((list) => list.filter((e) => e.query !== query))
  }

  function clearAllRecent() {
    clearRecentSearches()
    setRecent([])
  }

  return (
    <AppShell>
      <section className="pt-2">
        <h1 className="font-display text-[28px] font-bold leading-tight text-tinta">Saved</h1>
        <p className="mt-1 text-[13px] text-tinta/70">
          Your bookmarked restaurants and recent searches, stored on this device.
        </p>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">Restaurants</h2>
        {saved.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            hint="Open a restaurant from any list and tap Save to keep it here."
          />
        ) : (
          <div className="space-y-2">
            {saved.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} onRemove={() => removeSaved(r.id)} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-7">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-tinta/50">Recent searches</h2>
          {recent.length > 0 && (
            <button
              type="button"
              onClick={clearAllRecent}
              className="text-[11px] text-tinta/60 underline-offset-4 hover:text-tinta hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <EmptyState title="No recent searches" hint="Ask FoodMatch what you're craving to start." />
        ) : (
          <ul className="space-y-2">
            {recent.map((e) => (
              <li key={e.id} className="relative">
                <Link
                  to={`/ask?q=${encodeURIComponent(e.query)}`}
                  className="block rounded-2xl glass glass-hover py-3 pl-3 pr-12 text-[13px] text-tinta"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate">{e.query}</span>
                    <span className="shrink-0 text-[11px] text-tinta/70">{e.resultCount} results</span>
                  </div>
                </Link>
                <button
                  type="button"
                  aria-label={`Remove search "${e.query}"`}
                  onClick={() => removeRecent(e.query)}
                  className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-tinta/50 transition hover:bg-creamy hover:text-tinta active:scale-90"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
