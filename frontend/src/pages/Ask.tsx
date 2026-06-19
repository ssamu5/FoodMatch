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
import { useT, useLang } from '../lib/i18n'
import type { Restaurant } from '../types/restaurant'
import type { FoodIntent, RankedResult } from '../types/search'

export default function Ask() {
  const [params, setParams] = useSearchParams()
  const initialQuery = params.get('q') || ''
  const navigate = useNavigate()
  const { t, tn } = useT()
  const { lang } = useLang()

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
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!query) {
      setResults([])
      setRankedResults([])
      setLoading(false)
      setError(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(false)
    api
      .searchByIntent(intent)
      .then((r) => {
        if (cancelled) return
        setResults(r.results)
        setRankedResults(r.rankedResults)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setResults([])
        setRankedResults([])
        setError(true)
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

  // Map from translated label back to the English logic key used by applyRefinement.
  const refinementLabelToKey: Record<string, string> = {
    [t('ask.refineCheaper')]: 'cheaper',
    [t('ask.refineCloser')]: 'closer',
    [t('ask.refineRomantic')]: 'romantic',
    [t('ask.refineOpenNow')]: 'open now',
    [t('ask.refineVegetarian')]: 'vegetarian',
  }

  const refinementLabels = [
    t('ask.refineCheaper'),
    t('ask.refineCloser'),
    t('ask.refineRomantic'),
    t('ask.refineOpenNow'),
    t('ask.refineVegetarian'),
  ]

  function handleRefine(label: string) {
    const key = refinementLabelToKey[label] ?? label
    setIntent((i) => applyRefinement(i, key))
    track('filter_applied', { source: 'refinement_chip', label: key })
  }

  return (
    <AppShell>
      <section className="pt-2">
        <PromptComposer
          initialValue={query}
          placeholder={t('ask.placeholder')}
          refinementChips={query ? refinementLabels : undefined}
          onSubmit={handleSubmit}
          onRefine={handleRefine}
          autoFocus={!query}
          compact={Boolean(query)}
        />
      </section>

      {!query && (
        <section className="mt-8 space-y-3">
          <EmptyState
            title={t('ask.emptyTitle')}
            hint={t('ask.emptyHint')}
          />
        </section>
      )}

      {query && loading && (
        <section className="mt-6 space-y-5" aria-busy="true" aria-label={t('ask.loading')}>
          <div className="h-7 w-40 rounded-full glass animate-pulse-soft" />
          <div className="overflow-hidden rounded-4xl glass animate-pulse-soft">
            <div className="h-44 w-full bg-tinta/5 sm:h-56" />
            <div className="space-y-3 px-5 pb-5 pt-4">
              <div className="h-4 w-3/4 rounded-full bg-tinta/8" />
              <div className="h-4 w-1/2 rounded-full bg-tinta/8" />
            </div>
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-3xl glass animate-pulse-soft" />
            ))}
          </div>
        </section>
      )}

      {query && error && !loading && (
        <section className="mt-6 space-y-3">
          <EmptyState
            title={t('ask.errorTitle')}
            hint={t('ask.errorHint')}
            action={{ label: t('common.retry'), onClick: () => handleSubmit(query) }}
          />
        </section>
      )}

      {query && !loading && !error && (
        <section className="mt-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] uppercase tracking-[0.18em] text-tinta/50">
              {tn('results.found', results.length)}
            </h2>
            <button
              onClick={() => navigate(`/results?q=${encodeURIComponent(query)}`)}
              className="text-[12px] text-tinta/70 hover:text-tinta"
            >
              {t('ask.seeAll')} <span aria-hidden="true">&rarr;</span>
            </button>
          </div>

          {top && topScore && (
            <MatchCard
              restaurant={top}
              score={topScore}
              explanation={buildMatchExplanation(intent, top, topScore, lang)}
            />
          )}

          {!top && (
            <EmptyState
              title={t('ask.noMatchTitle')}
              hint={t('ask.noMatchHint')}
              action={{ label: t('ask.backHome'), onClick: () => navigate('/') }}
            />
          )}

          {shortlist.length > 0 && (
            <div>
              <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-tinta/50">{t('ask.shortlist')}</h3>
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
