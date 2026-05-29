import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Restaurant } from '../types/restaurant'
import type { MatchScore } from '../types/search'
import OpenBadge from './OpenBadge'
import { isSaved, saveRestaurant, unsaveRestaurant } from '../lib/storage'
import { track } from '../lib/analytics'
import { hapticSuccess, hapticTap } from '../lib/native'

interface RestaurantCardProps {
  restaurant: Restaurant
  score?: MatchScore
  rank?: number
  onOpen?: () => void
  /** When set, the corner control is a remove (x) button instead of the
   *  save heart. Used on the Saved page. */
  onRemove?: () => void
}

function priceMark(level: 1 | 2 | 3 | 4): string {
  return '€'.repeat(level)
}

// Picks a gradient based on the imagePlaceholder hint.
function gradientFor(seed: string): string {
  switch (seed) {
    case 'lime-bright':
      return 'linear-gradient(135deg, #a3ff12 0%, #6b9300 55%, #2f2f2f 100%)'
    case 'lime-dark':
      return 'linear-gradient(135deg, #3a3a3a 0%, #1f1f1f 80%)'
    case 'lime-deep':
      return 'linear-gradient(135deg, #4a4a4a 0%, #1a1a1a 80%)'
    case 'lime-warm':
      return 'linear-gradient(135deg, #5a8e00 0%, #2a2a2a 70%)'
    case 'lime-muted':
    default:
      return 'linear-gradient(135deg, #3a3a3a 0%, #222222 80%)'
  }
}

export default function RestaurantCard({ restaurant, score, rank, onOpen, onRemove }: RestaurantCardProps) {
  const link = `/restaurant/${restaurant.slug}`
  const [saved, setSaved] = useState(() => isSaved(restaurant.id))

  function toggleSave() {
    if (saved) {
      unsaveRestaurant(restaurant.id)
      setSaved(false)
      track('restaurant_unsaved', { restaurantId: restaurant.id, source: 'card' })
      void hapticTap()
    } else {
      saveRestaurant(restaurant.id)
      setSaved(true)
      track('restaurant_saved', { restaurantId: restaurant.id, source: 'card' })
      void hapticSuccess()
    }
  }

  return (
    <Link
      to={link}
      onClick={onOpen}
      className="group block w-full rounded-3xl glass glass-hover transition active:scale-[0.99]"
    >
      <div className="flex gap-4 p-3.5">
        <div
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/5"
          style={{ background: gradientFor(restaurant.imagePlaceholder) }}
        >
          {restaurant.isPartner && (
            <span className="absolute left-1 top-1 rounded-full bg-tomate px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cream">
              Partner
            </span>
          )}
          {typeof rank === 'number' && (
            <span className="absolute bottom-1 right-1 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium text-cream backdrop-blur-sm">
              #{rank}
            </span>
          )}

          {onRemove ? (
            <button
              type="button"
              aria-label="Remove from saved"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onRemove()
              }}
              className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink/45 text-cream backdrop-blur-sm transition hover:bg-ink/70 active:scale-90"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              aria-label={saved ? 'Remove from saved' : 'Save'}
              aria-pressed={saved}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleSave()
              }}
              className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink/45 backdrop-blur-sm transition hover:bg-ink/70 active:scale-90"
            >
              <HeartIcon filled={saved} className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate font-display text-[15px] font-semibold leading-tight text-tinta">
              {restaurant.name}
            </h3>
            {score && (
              <span className="shrink-0 rounded-full bg-tomate/10 px-2 py-0.5 text-[11px] font-semibold text-fresco">
                {score.score}
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate text-[12px] text-tinta/70">
            {restaurant.cuisine} · {restaurant.area}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-tinta/70">
            <span className="font-mono">{priceMark(restaurant.priceLevel)}</span>
            <span aria-hidden>·</span>
            <span>★ {restaurant.rating.toFixed(1)}</span>
            <span aria-hidden>·</span>
            <span>~€{restaurant.averageSpend}</span>
            <OpenBadge restaurant={restaurant} />
          </div>

          {score && score.reasons.length > 0 && (
            <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-tinta">
              {score.reasons.slice(0, 2).join(' · ')}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

function HeartIcon({ filled, className }: { filled?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? '#e63946' : 'none'}
      stroke={filled ? '#e63946' : 'currentColor'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={['text-cream', className || ''].join(' ')}
      aria-hidden="true"
    >
      <path d="M12 21s-7-4.35-9.5-8.5C1 9.5 2.5 6 6 6c2 0 3.2 1.2 4 2.3C10.8 7.2 12 6 14 6c3.5 0 5 3.5 3.5 6.5C19 16.65 12 21 12 21z" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
