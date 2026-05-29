import type { Cuisine, Restaurant } from '../types/restaurant'

/**
 * Visual cover for a restaurant. Fills its (relative) parent via absolute
 * inset so existing overlays/badges keep working.
 *
 * - If the restaurant has a real `heroImage` (set when a listing is claimed),
 *   render that photo.
 * - Otherwise render a deterministic, cuisine-coloured cover with the
 *   restaurant's monogram. This keeps every card identifiable and on-brand
 *   without shipping fake stock photos for demo data.
 */
interface RestaurantCoverProps {
  restaurant: Restaurant
  variant?: 'thumb' | 'hero'
  className?: string
}

type CoverTheme = { from: string; to: string; accent: string }

// Food-evocative palettes per cuisine. Dark enough for cream/white overlays.
const COVER_THEMES: Record<Cuisine, CoverTheme> = {
  burgers: { from: '#7a3b16', to: '#2a1408', accent: '#f2a93b' },
  pizza: { from: '#8c2f24', to: '#2a0f0c', accent: '#e63946' },
  pasta: { from: '#83351f', to: '#241009', accent: '#f2a93b' },
  'Spanish tapas': { from: '#9a4a1c', to: '#2c1408', accent: '#f2a93b' },
  paella: { from: '#a6671a', to: '#2e1c08', accent: '#f2c14e' },
  seafood: { from: '#1f4e5f', to: '#0c1f26', accent: '#4bb3c7' },
  Mediterranean: { from: '#2f6b5c', to: '#0f241f', accent: '#6fcf97' },
  sushi: { from: '#26324f', to: '#0e1320', accent: '#6f8cff' },
  'Asian fusion': { from: '#3a2752', to: '#150e22', accent: '#b07cff' },
  Indian: { from: '#8a3d12', to: '#2a1206', accent: '#f2a93b' },
  Mexican: { from: '#7d3a1c', to: '#241009', accent: '#f2c14e' },
  steak: { from: '#5e2326', to: '#1c0a0b', accent: '#d9694d' },
  'healthy bowls': { from: '#2f7a4a', to: '#0f241a', accent: '#7fdca0' },
  vegan: { from: '#357a3a', to: '#102414', accent: '#8fe08f' },
  vegetarian: { from: '#3f7a2f', to: '#13240f', accent: '#9fe07f' },
  brunch: { from: '#8a6a2f', to: '#2a1f0c', accent: '#f2c14e' },
  coffee: { from: '#5a3a22', to: '#1e120a', accent: '#c79a6b' },
}

const DEFAULT_THEME: CoverTheme = { from: '#3a3a3a', to: '#1a1a1a', accent: '#f2a93b' }

const CONNECTORS = new Set(['la', 'el', 'los', 'las', 'de', 'del', 'y', 'the', 'a', 'and'])

function monogram(name: string): string {
  const words = name
    .replace(/[^A-Za-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
  const significant = words.filter((w) => !CONNECTORS.has(w.toLowerCase()))
  const pick = (significant.length ? significant : words).slice(0, 2)
  const mark = pick.map((w) => w[0]?.toUpperCase() ?? '').join('')
  return mark || 'F'
}

export default function RestaurantCover({ restaurant, variant = 'thumb', className }: RestaurantCoverProps) {
  const isHero = variant === 'hero'

  if (restaurant.heroImage) {
    return (
      <img
        src={restaurant.heroImage}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className={['absolute inset-0 h-full w-full object-cover', className || ''].join(' ')}
      />
    )
  }

  const theme = COVER_THEMES[restaurant.cuisine] ?? DEFAULT_THEME
  const mark = monogram(restaurant.name)

  return (
    <div
      aria-hidden="true"
      className={['absolute inset-0 overflow-hidden', className || ''].join(' ')}
      style={{ background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)` }}
    >
      {/* soft glow for depth */}
      <div
        className="absolute rounded-full"
        style={{
          width: isHero ? 220 : 96,
          height: isHero ? 220 : 96,
          top: isHero ? -40 : -22,
          right: isHero ? -30 : -18,
          background: theme.accent,
          opacity: 0.28,
          filter: `blur(${isHero ? 34 : 16}px)`,
        }}
      />
      {/* faint diagonal texture */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.06,
          backgroundImage:
            'repeating-linear-gradient(135deg, #fff 0, #fff 1px, transparent 1px, transparent 10px)',
        }}
      />
      {/* monogram watermark */}
      <span
        className="absolute font-display font-bold leading-none text-cream"
        style={{
          opacity: 0.9,
          fontSize: isHero ? 64 : 30,
          left: isHero ? 18 : '50%',
          top: isHero ? 'auto' : '50%',
          bottom: isHero ? 14 : 'auto',
          transform: isHero ? 'none' : 'translate(-50%, -50%)',
          letterSpacing: '-0.02em',
          textShadow: '0 1px 12px rgba(0,0,0,0.25)',
        }}
      >
        {mark}
      </span>
    </div>
  )
}
