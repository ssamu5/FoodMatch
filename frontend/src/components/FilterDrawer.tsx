import { useEffect, useState } from 'react'
import type { FoodIntent } from '../types/search'
import type { Area, Cuisine, Vibe } from '../types/restaurant'
import { useT, useLang } from '../lib/i18n'
import { cuisineLabel, areaLabel, vibeLabel, dietaryLabel } from '../lib/reasonFormatter'

type SortKey = 'best' | 'closest' | 'cheapest' | 'rating'

interface FilterDrawerProps {
  open: boolean
  intent: FoodIntent
  sortKey: SortKey
  onClose: () => void
  onApply: (next: FoodIntent, sort: SortKey) => void
}

const CUISINE_OPTIONS: Cuisine[] = [
  'Spanish tapas',
  'paella',
  'sushi',
  'burgers',
  'pizza',
  'pasta',
  'healthy bowls',
  'vegan',
  'vegetarian',
  'brunch',
  'coffee',
  'Mexican',
  'Indian',
  'Asian fusion',
  'Mediterranean',
  'seafood',
  'steak',
]

const AREA_OPTIONS: Area[] = [
  'Ruzafa',
  'El Carmen',
  'Canovas',
  'Benimaclet',
  'City center',
  'Marina / beach',
]

const VIBE_OPTIONS: Vibe[] = [
  'romantic',
  'casual',
  'lively',
  'quiet',
  'date',
  'group',
  'family',
  'work',
  'late night',
  'outdoor',
  'cozy',
]

export default function FilterDrawer({ open, intent, sortKey, onClose, onApply }: FilterDrawerProps) {
  const [draft, setDraft] = useState<FoodIntent>(intent)
  const [sort, setSort] = useState<SortKey>(sortKey)
  const { t } = useT()
  const { lang } = useLang()

  const SORTS: { key: SortKey; label: string }[] = [
    { key: 'best', label: t('filters.sortBest') },
    { key: 'closest', label: t('filters.sortClosest') },
    { key: 'cheapest', label: t('filters.sortCheapest') },
    { key: 'rating', label: t('filters.sortRating') },
  ]

  useEffect(() => {
    if (open) {
      setDraft(intent)
      setSort(sortKey)
    }
  }, [open, intent, sortKey])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  function toggleCuisine(c: Cuisine) {
    setDraft((d) => ({
      ...d,
      cuisines: d.cuisines.includes(c) ? d.cuisines.filter((x) => x !== c) : [...d.cuisines, c],
    }))
  }
  function setArea(a: Area | null) {
    setDraft((d) => ({ ...d, area: a, distancePreference: a ? 'area' : 'anywhere' }))
  }
  function setBudget(level: 1 | 2 | 3 | 4 | null) {
    setDraft((d) => ({ ...d, budgetLevel: level }))
  }
  function toggleVibe(v: Vibe) {
    setDraft((d) => ({
      ...d,
      vibe: d.vibe.includes(v) ? d.vibe.filter((x) => x !== v) : [...d.vibe, v],
    }))
  }
  function toggleDietary(k: 'vegetarian' | 'vegan' | 'gluten-free') {
    setDraft((d) => ({
      ...d,
      dietary: d.dietary.includes(k) ? d.dietary.filter((x) => x !== k) : [...d.dietary, k],
    }))
  }
  function toggleOpenNow() {
    setDraft((d) => ({ ...d, mustBeOpenNow: !d.mustBeOpenNow, time: !d.mustBeOpenNow ? 'now' : d.time }))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label={t('filters.ariaLabel')}>
      <button
        type="button"
        aria-label={t('filters.ariaClose')}
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full animate-fade-up rounded-t-4xl border-t border-tinta/15 bg-surface px-5 pb-6 pt-3 sm:mx-auto sm:max-w-md sm:rounded-4xl sm:border sm:mb-6">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-tinta/20" />

        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[18px] font-semibold text-tinta">{t('filters.title')}</h2>
          <button
            onClick={onClose}
            className="-m-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-end p-2 text-[12px] text-tinta/70 hover:text-tinta focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(230,57,70,0.3)]"
          >
            {t('filters.close')}
          </button>
        </div>

        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          <section>
            <h3 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('filters.sectionSort')}</h3>
            <div className="flex flex-wrap gap-1.5">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={sort === s.key}
                  className={['chip', sort === s.key ? 'active' : ''].join(' ')}
                  onClick={() => setSort(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('filters.sectionCuisine')}</h3>
            <div className="flex flex-wrap gap-1.5">
              {CUISINE_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={draft.cuisines.includes(c)}
                  className={['chip', draft.cuisines.includes(c) ? 'active' : ''].join(' ')}
                  onClick={() => toggleCuisine(c)}
                >
                  {cuisineLabel(c, lang)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('filters.sectionArea')}</h3>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                aria-pressed={draft.area === null}
                className={['chip', draft.area === null ? 'active' : ''].join(' ')}
                onClick={() => setArea(null)}
              >
                {t('filters.anywhere')}
              </button>
              {AREA_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-pressed={draft.area === a}
                  className={['chip', draft.area === a ? 'active' : ''].join(' ')}
                  onClick={() => setArea(a)}
                >
                  {areaLabel(a, lang)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('filters.sectionBudget')}</h3>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                aria-pressed={draft.budgetLevel === null}
                className={['chip', draft.budgetLevel === null ? 'active' : ''].join(' ')}
                onClick={() => setBudget(null)}
              >
                {t('filters.any')}
              </button>
              {[1, 2, 3, 4].map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={draft.budgetLevel === l}
                  aria-label={t('filters.budgetLevel', { level: l })}
                  className={['chip', draft.budgetLevel === l ? 'active' : ''].join(' ')}
                  onClick={() => setBudget(l as 1 | 2 | 3 | 4)}
                >
                  {'€'.repeat(l)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('filters.sectionVibe')}</h3>
            <div className="flex flex-wrap gap-1.5">
              {VIBE_OPTIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={draft.vibe.includes(v)}
                  className={['chip', draft.vibe.includes(v) ? 'active' : ''].join(' ')}
                  onClick={() => toggleVibe(v)}
                >
                  {vibeLabel(v, lang)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('filters.sectionDietary')}</h3>
            <div className="flex flex-wrap gap-1.5">
              {(['vegetarian', 'vegan', 'gluten-free'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={draft.dietary.includes(d)}
                  className={['chip', draft.dietary.includes(d) ? 'active' : ''].join(' ')}
                  onClick={() => toggleDietary(d)}
                >
                  {dietaryLabel(d, lang)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('filters.sectionAvailability')}</h3>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                aria-pressed={draft.mustBeOpenNow}
                className={['chip', draft.mustBeOpenNow ? 'active' : ''].join(' ')}
                onClick={toggleOpenNow}
              >
                {t('filters.openNow')}
              </button>
            </div>
          </section>
        </div>

        <div className="mt-4 flex items-center gap-2 pt-2">
          <button
            type="button"
            className="btn-ghost h-11 flex-1"
            onClick={() => {
              setDraft({
                ...draft,
                cuisines: [],
                area: null,
                budgetLevel: null,
                vibe: [],
                dietary: [],
                mustBeOpenNow: false,
                distancePreference: 'anywhere',
              })
              setSort('best')
            }}
          >
            {t('filters.reset')}
          </button>
          <button
            type="button"
            className="btn-lime h-11 flex-1"
            onClick={() => {
              onApply(draft, sort)
              onClose()
            }}
          >
            {t('filters.apply')}
          </button>
        </div>
      </div>
    </div>
  )
}

export type { SortKey }
