import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import PromptComposer from '../components/PromptComposer'
import RestaurantCard from '../components/RestaurantCard'
import EmptyState from '../components/EmptyState'
import FilterDrawer, { type SortKey } from '../components/FilterDrawer'
import { api } from '../lib/api'
import { parseFoodIntent } from '../lib/foodIntent'
import { rankRestaurants } from '../lib/ranking'
import { SEED_RESTAURANTS } from '../data/seedRestaurants'
import { track } from '../lib/analytics'
import type { FoodIntent } from '../types/search'

export default function Results() {
  const [params, setParams] = useSearchParams()
  const initialQuery = params.get('q') || ''
  const navigate = useNavigate()

  const [query, setQuery] = useState(initialQuery)
  const [intent, setIntent] = useState<FoodIntent>(() =>
    initialQuery ? parseFoodIntent(initialQuery) : parseFoodIntent(''),
  )
  const [sort, setSort] = useState<SortKey>('best')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const ranked = useMemo(() => {
    const r = query
      ? rankRestaurants(intent, SEED_RESTAURANTS, { hardFilterOpenNow: intent.mustBeOpenNow, minScore: 0 })
      : rankRestaurants(intent, SEED_RESTAURANTS, { hardFilterOpenNow: false, minScore: 0 })
    // Sorting
    const items = r
      .map((rr) => ({
        rr,
        restaurant: SEED_RESTAURANTS.find((x) => x.id === rr.restaurantId)!,
      }))
      .filter((x) => Boolean(x.restaurant))

    if (sort === 'cheapest') items.sort((a, b) => a.restaurant.averageSpend - b.restaurant.averageSpend)
    else if (sort === 'rating') items.sort((a, b) => b.restaurant.rating - a.restaurant.rating)
    else if (sort === 'closest') {
      // No geo data in MVP. Closest = matching area first, then City center.
      items.sort((a, b) => {
        const ra = a.restaurant
        const rb = b.restaurant
        const aArea = intent.area && ra.area === intent.area ? 1 : 0
        const bArea = intent.area && rb.area === intent.area ? 1 : 0
        if (bArea !== aArea) return bArea - aArea
        const aCenter = ra.area === 'City center' ? 1 : 0
        const bCenter = rb.area === 'City center' ? 1 : 0
        return bCenter - aCenter
      })
    }
    // 'best' uses score (default rr order)
    return items
  }, [intent, query, sort])

  useEffect(() => {
    void api // ensure import retained
    if (query) {
      setParams({ q: query }, { replace: true })
    }
  }, [query, setParams])

  useEffect(() => {
    track('result_viewed', { query, resultCount: ranked.length })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, ranked.length])

  function handleSubmit(q: string) {
    setQuery(q)
    setIntent(parseFoodIntent(q))
  }

  const summary = useMemo(() => {
    if (!query) return 'Browsing all Valencia restaurants'
    const parts: string[] = []
    if (intent.cuisines.length) parts.push(intent.cuisines.join(', '))
    if (intent.area) parts.push(`in ${intent.area}`)
    if (intent.maxSpendEur) parts.push(`under €${intent.maxSpendEur}`)
    if (intent.mustBeOpenNow) parts.push('open now')
    if (intent.dietary.length) parts.push(intent.dietary.join('+'))
    return parts.join(' · ') || query
  }, [intent, query])

  return (
    <AppShell>
      <section className="space-y-3">
        <PromptComposer
          initialValue={query}
          placeholder="What are you in the mood for?"
          onSubmit={handleSubmit}
          compact
        />

        <div className="flex items-center justify-between rounded-2xl glass px-3 py-2 text-[12px]">
          <span className="truncate text-tinta">{summary}</span>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="ml-2 inline-flex items-center gap-1.5 text-tinta/70 hover:text-tinta"
          >
            <FilterIcon className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>
      </section>

      {ranked.length === 0 && (
        <section className="mt-6">
          <EmptyState
            title="No matches with those filters"
            hint="Loosen one of the constraints. Cuisine and area are the strongest filters."
            action={{ label: 'Back to home', onClick: () => navigate('/') }}
          />
        </section>
      )}

      <section className="mt-5 space-y-2">
        {ranked.map(({ restaurant, rr }, idx) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            score={rr.score}
            rank={idx + 1}
            onOpen={() => track('restaurant_opened', { restaurantId: restaurant.id, source: 'results' })}
          />
        ))}
      </section>

      <FilterDrawer
        open={filtersOpen}
        intent={intent}
        sortKey={sort}
        onClose={() => setFiltersOpen(false)}
        onApply={(next, s) => {
          setIntent(next)
          setSort(s)
          track('filter_applied', {
            cuisines: next.cuisines,
            area: next.area,
            budgetLevel: next.budgetLevel,
            vibe: next.vibe,
            dietary: next.dietary,
            sort: s,
          })
        }}
      />
    </AppShell>
  )
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 5h18M6 12h12M10 19h4" />
    </svg>
  )
}
