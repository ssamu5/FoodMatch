import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import RestaurantCard from '../components/RestaurantCard'
import EmptyState from '../components/EmptyState'
import { api } from '../lib/api'
import { useT } from '../lib/i18n'
import {
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from '../lib/storage'
import { syncFavorites, removeFavorite } from '../lib/userData'
import { track } from '../lib/analytics'
import type { SearchEvent } from '../types/search'
import type { Restaurant } from '../types/restaurant'

export default function Saved() {
  const { t, tn } = useT()
  const [saved, setSaved] = useState<Restaurant[]>([])
  const [recent, setRecent] = useState<SearchEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(false)
      try {
        const ids = await syncFavorites()
        const rows = await api.getRestaurantsByIds(ids)
        if (cancelled) return
        setSaved(rows)
      } catch {
        if (cancelled) return
        setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    setRecent(getRecentSearches())
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  function removeSaved(id: string) {
    void removeFavorite(id)
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
        <h1 className="font-display text-[28px] font-bold leading-tight text-tinta">{t('saved.heading')}</h1>
        <p className="mt-1 text-[13px] text-tinta/70">
          {t('saved.subtitle')}
        </p>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('saved.sectionRestaurants')}</h2>
        {loading ? (
          <div className="space-y-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4 rounded-3xl glass p-3.5">
                <div className="h-20 w-20 shrink-0 animate-pulse-soft rounded-2xl bg-tinta/10" />
                <div className="flex flex-1 flex-col justify-center gap-2.5">
                  <div className="h-4 w-2/3 animate-pulse-soft rounded-full bg-tinta/10" />
                  <div className="h-3 w-1/2 animate-pulse-soft rounded-full bg-tinta/10" />
                  <div className="h-3 w-1/3 animate-pulse-soft rounded-full bg-tinta/10" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title={t('saved.errorTitle')}
            hint={t('saved.errorHint')}
            action={{ label: t('saved.retry'), onClick: () => setReloadKey((k) => k + 1) }}
          />
        ) : saved.length === 0 ? (
          <EmptyState
            title={t('saved.emptyTitle')}
            hint={t('saved.emptyHint')}
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
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('saved.sectionRecent')}</h2>
          {recent.length > 0 && (
            <button
              type="button"
              onClick={clearAllRecent}
              className="-mx-2 -my-1.5 inline-flex items-center rounded-lg px-2 py-1.5 text-[11px] text-tinta/60 underline-offset-4 transition hover:text-tinta hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomate/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              {t('saved.clearAll')}
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <EmptyState title={t('saved.noRecentTitle')} hint={t('saved.noRecentHint')} />
        ) : (
          <ul className="space-y-2">
            {recent.map((e) => (
              <li key={e.id} className="relative">
                <Link
                  to={`/ask?q=${encodeURIComponent(e.query)}`}
                  className="flex min-h-[44px] items-center rounded-2xl glass glass-hover py-3 pl-3 pr-12 text-[13px] text-tinta"
                >
                  <div className="flex w-full items-baseline justify-between gap-2">
                    <span className="truncate">{e.query}</span>
                    <span className="shrink-0 text-[11px] text-tinta/70">{tn('saved.resultCount', e.resultCount)}</span>
                  </div>
                </Link>
                <button
                  type="button"
                  aria-label={t('saved.removeSearch', { query: e.query })}
                  onClick={() => removeRecent(e.query)}
                  className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-tinta/50 transition hover:bg-creamy hover:text-tinta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomate/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:scale-90"
                >
                  <span className="absolute -inset-2" aria-hidden="true" />
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
