import { Link } from 'react-router-dom'
import type { Restaurant } from '../types/restaurant'
import type { MatchScore } from '../types/search'

interface RestaurantCardProps {
  restaurant: Restaurant
  score?: MatchScore
  rank?: number
  onOpen?: () => void
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

export default function RestaurantCard({ restaurant, score, rank, onOpen }: RestaurantCardProps) {
  const link = `/restaurant/${restaurant.slug}`
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
          aria-hidden="true"
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

          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-tinta/70">
            <span className="font-mono">{priceMark(restaurant.priceLevel)}</span>
            <span aria-hidden>·</span>
            <span>★ {restaurant.rating.toFixed(1)}</span>
            <span aria-hidden>·</span>
            <span>~€{restaurant.averageSpend}</span>
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
