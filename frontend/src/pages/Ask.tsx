import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import PromptComposer from '../components/PromptComposer'
import MatchCard from '../components/MatchCard'
import RestaurantCard from '../components/RestaurantCard'
import EmptyState from '../components/EmptyState'
import { api } from '../lib/api'
import { applyRefinement, parseFoodIntent } from '../lib/foodIntent'
import { buildMatchExplanation } from '../lib/ranking'
import { track } from '../lib/analytics'
import type { Restaurant } from '../types/restaurant'
import type { FoodIntent, RankedResult } from '../types/search'

const REFINEMENTS = ['cheaper', 'closer', 'romantic', 'open now', 'vegetarian']

export default function Ask() {
  const [params, setParams] = useSearchParams()
  const initialQuery = params.get('q') || ''
  const navigate = useNavigate()

  const [query, setQuery] = useState(initialQuery)
  const [intent, setIntent] = useState<FoodIntent>(() => parseFoodIntent(initialQuery))

  useEffect(() => {
    // Persist query in URL for shareability
    if (query) {
      setParams({ q: query }, { replace: true })
      // Carry the query so RestaurantDetail can explain the match.
      try {
        sessionStorage.setItem('foodmatch.lastIntentQuery', query)
      } catch {
        /* sessionStorage may be blocked */
      }
    }
  }, [query, setParams])

  const [results, setResults] = useState<Restaurant[]>([])
  const [rankedResults, setRankedResults] = useState<RankedResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) {
      setResults([])
      setRankedResults([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    api.searchByIntent(intent).then((r) => {
      if (cancelled) return
      setResults(r.results)
      setRankedResults(r.rankedResults)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [intent, query])

  useEffect(() => {
    if (!query || loading) return
    if (results.length === 0) {
      track('no_results', { query, intent: { cuisines: intent.cuisines, area: intent.area } })
    } else {
      track('prompt_submitted', {
        query,
        cuisines: intent.cuisines,
        area: intent.area,
        budgetLevel: intent.budgetLevel,
        maxSpendEur: intent.maxSpendEur,
        topMatchId: results[0]?.id || null,
        resultCount: results.length,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, loading])

  const top = results[0]
  const topScore = rankedResults[0]?.score
  const shortlist = results.slice(1, 6)

  function handleSubmit(q: string) {
    setQuery(q)
    setIntent(parseFoodIntent(q))
  }

  function handleRefine(label: string) {
    setIntent((i) => applyRefinement(i, label))
    track('filter_applied', { source: 'refinement_chip', label })
  }

  return (
    <AppShell>
      <section className="pt-2">
        <PromptComposer
          initialValue={query}
          placeholder="Tell FoodMatch what you're craving..."
          starterChips={!query ? undefined : undefined}
          refinementChips={query ? REFINEMENTS : undefined}
          onSubmit={handleSubmit}
          onRefine={handleRefine}
          autoFocus={!query}
          compact={Boolean(query)}
        />
      </section>

      {!query && (
        <section className="mt-8 space-y-3">
          <EmptyState
            title="FoodMatch is ready."
            hint='Tell me what you crave in Valencia. Try "vegan brunch in Russafa under €15", "date night quiet paella by the sea", or "tapas open now near me".'
          />
        </section>
      )}

      {query && loading && (
        <section className="mt-6 flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-tinta/50">
          <span className="h-2 w-2 rounded-full bg-tomate shadow-glow animate-pulse-soft" />
          Finding your matches...
        </section>
      )}

      {query && !loading && (
        <section className="mt-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] uppercase tracking-[0.18em] text-tinta/50">
              FoodMatch found {results.length} match{results.length === 1 ? '' : 'es'}
            </h2>
            <button
              onClick={() => navigate(`/results?q=${encodeURIComponent(query)}`)}
              className="text-[12px] text-tinta/70 hover:text-tinta"
            >
              See all &rarr;
            </button>
          </div>

          {top && topScore && (
            <MatchCard
              restaurant={top}
              score={topScore}
              explanation={buildMatchExplanation(intent, top, topScore)}
            />
          )}

          {!top && (
            <EmptyState
              title="No matches"
              hint="Try loosening cuisine, area, or budget. The starter chips on the home page are good starting points."
              action={{ label: 'Back to home', onClick: () => navigate('/') }}
            />
          )}

          {shortlist.length > 0 && (
            <div>
              <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-tinta/50">Shortlist</h3>
              <div className="space-y-2">
                {shortlist.map((r, idx) => {
                  const s = rankedResults.find((rr) => rr.restaurantId === r.id)?.score
                  return (
                    <RestaurantCard
                      key={r.id}
                      restaurant={r}
                      score={s}
                      rank={idx + 2}
                      onOpen={() => track('restaurant_opened', { restaurantId: r.id, source: 'shortlist' })}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </section>
      )}
    </AppShell>
  )
}
