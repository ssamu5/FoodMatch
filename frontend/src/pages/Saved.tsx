import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import RestaurantCard from '../components/RestaurantCard'
import EmptyState from '../components/EmptyState'
import { api } from '../lib/api'
import { getRecentSearches, getSavedIds } from '../lib/storage'
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

  return (
    <AppShell>
      <section className="pt-2">
        <h1 className="font-display text-[28px] font-bold leading-tight text-cream">Saved</h1>
        <p className="mt-1 text-[13px] text-ink-200">
          Your bookmarked restaurants and recent searches, stored on this device.
        </p>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink-300">Restaurants</h2>
        {saved.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            hint="Open a restaurant from any list and tap Save to keep it here."
          />
        ) : (
          <div className="space-y-2">
            {saved.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-7">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink-300">Recent searches</h2>
        {recent.length === 0 ? (
          <EmptyState title="No recent searches" hint="Ask FoodMatch what you're craving to start." />
        ) : (
          <ul className="space-y-2">
            {recent.map((e) => (
              <li key={e.id}>
                <Link
                  to={`/ask?q=${encodeURIComponent(e.query)}`}
                  className="block rounded-2xl glass glass-hover p-3 text-[13px] text-cream"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate">{e.query}</span>
                    <span className="shrink-0 text-[11px] text-ink-200">{e.resultCount} results</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  )
}
