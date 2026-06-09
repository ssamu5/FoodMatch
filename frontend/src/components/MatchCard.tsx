import { Link } from 'react-router-dom'
import type { Restaurant } from '../types/restaurant'
import type { MatchScore } from '../types/search'
import OpenBadge from './OpenBadge'
import RestaurantCover from './RestaurantCover'
import { useT } from '../lib/i18n'

interface MatchCardProps {
  restaurant: Restaurant
  score: MatchScore
  explanation: string
}

function priceMark(level: 1 | 2 | 3 | 4): string {
  return '€'.repeat(level)
}

export default function MatchCard({ restaurant, score, explanation }: MatchCardProps) {
  const { t } = useT()
  return (
    <Link
      to={`/restaurant/${restaurant.slug}`}
      className="group block animate-fade-up overflow-hidden rounded-4xl glass shadow-glass transition hover:shadow-glow"
    >
      <div className="relative h-44 w-full sm:h-56" aria-hidden="true">
        <RestaurantCover restaurant={restaurant} variant="hero" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/30 to-ink/90" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <span className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-tomate">
            {t('results.bestPick')}
          </span>
          <span className="rounded-full bg-tomate px-3 py-1 text-[12px] font-semibold text-cream">
            {score.score}/100
          </span>
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-[22px] font-bold leading-tight text-cream">
              {restaurant.name}
            </h2>
            <p className="text-[12px] text-cream/85">
              {restaurant.cuisine} · {restaurant.area}
            </p>
            <OpenBadge restaurant={restaurant} onImage className="mt-1" />
          </div>
          <div className="text-right text-[12px] text-cream/85">
            <div className="font-mono">{priceMark(restaurant.priceLevel)} · ~€{restaurant.averageSpend}</div>
            <div>★ {restaurant.rating.toFixed(1)} ({restaurant.reviewCount})</div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-4">
        <p className="text-[14px] leading-relaxed text-tinta">{explanation}</p>

        {score.reasons.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {score.reasons.slice(0, 4).map((r) => (
              <span
                key={r}
                className="rounded-full bg-tomate/10 px-2.5 py-1 text-[11px] font-medium text-fresco"
              >
                {r}
              </span>
            ))}
          </div>
        )}

        {score.warnings.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {score.warnings.slice(0, 2).map((w) => (
              <span
                key={w}
                className="rounded-full bg-warn/10 px-2.5 py-1 text-[11px] font-medium text-warn"
              >
                ! {w}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-[12px] text-tinta/70">
          <span>{restaurant.bestFor[0] ? t('results.bestFor', { tag: restaurant.bestFor[0] }) : restaurant.tags.slice(0, 2).join(' · ')}</span>
          <span className="font-medium text-tinta group-hover:text-tomate">{t('common.viewDetails')} &rarr;</span>
        </div>
      </div>
    </Link>
  )
}
