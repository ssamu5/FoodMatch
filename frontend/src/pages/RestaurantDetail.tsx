import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import EmptyState from '../components/EmptyState'
import { api } from '../lib/api'
import { isSaved, saveRestaurant, unsaveRestaurant } from '../lib/storage'
import { track } from '../lib/analytics'
import { hapticSuccess, hapticTap, shareNative } from '../lib/native'

function priceMark(level: 1 | 2 | 3 | 4): string {
  return '€'.repeat(level)
}

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
    default:
      return 'linear-gradient(135deg, #3a3a3a 0%, #222222 80%)'
  }
}

const FEEDBACK = ['Good match', 'Too expensive', 'Too far', 'Not my vibe'] as const

export default function RestaurantDetail() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const r = api.getRestaurantBySlug(slug)

  const [saved, setSaved] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null)

  useEffect(() => {
    if (r) setSaved(isSaved(r.id))
  }, [r])

  if (!r) {
    return (
      <AppShell>
        <div className="pt-8">
          <EmptyState
            title="Restaurant not found"
            hint="It may have been removed or the link is invalid."
            action={{ label: 'Back to home', onClick: () => navigate('/') }}
          />
        </div>
      </AppShell>
    )
  }

  function toggleSave() {
    if (!r) return
    if (saved) {
      unsaveRestaurant(r.id)
      setSaved(false)
      track('restaurant_unsaved', { restaurantId: r.id })
      void hapticTap()
    } else {
      saveRestaurant(r.id)
      setSaved(true)
      track('restaurant_saved', { restaurantId: r.id })
      void hapticSuccess()
    }
  }

  function share() {
    if (!r) return
    void shareNative({
      title: r.name,
      text: `${r.name} on FoodMatch`,
      url: window.location.href,
    })
  }

  function sendFeedback(label: string) {
    setFeedbackSent(label)
    track('feedback_submitted', { restaurantId: r!.id, label })
  }

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(`${r.name} ${r.address} ${r.city}`)}`
  const telUrl = r.phone ? `tel:${r.phone.replace(/\s+/g, '')}` : undefined
  const igUrl = r.instagram ? `https://instagram.com/${r.instagram.replace(/^@/, '')}` : undefined

  return (
    <AppShell>
      <div
        className="relative h-40 w-full overflow-hidden rounded-3xl sm:h-56"
        style={{ background: gradientFor(r.imagePlaceholder) }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950/85" />
        {r.isPartner && (
          <span className="absolute left-3 top-3 rounded-full bg-lime/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-900">
            Partner
          </span>
        )}
      </div>

      <section className="mt-4 space-y-2">
        <h1 className="font-display text-[26px] font-bold leading-tight text-cream">{r.name}</h1>
        <p className="text-[13px] text-ink-200">
          {r.cuisine} · {r.area} · {priceMark(r.priceLevel)} · ★ {r.rating.toFixed(1)} ({r.reviewCount})
        </p>
        <p className="text-[14px] leading-relaxed text-ink-100">{r.description}</p>
      </section>

      <section className="mt-4 rounded-2xl glass p-4">
        <h2 className="text-[11px] uppercase tracking-[0.15em] text-ink-300">Why FoodMatch picks it</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-cream">
          {r.bestFor.length > 0 ? `Best for ${r.bestFor.slice(0, 2).join(' and ')}. ` : ''}
          Typical spend ~€{r.averageSpend}. Vibe: {r.vibe.slice(0, 3).join(', ')}.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {r.bestFor.slice(0, 4).map((b) => (
            <span key={b} className="rounded-full bg-lime/10 px-2.5 py-1 text-[11px] font-medium text-lime-300">
              {b}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => track('outbound_map_clicked', { restaurantId: r.id })}
          className="btn-ghost h-12"
        >
          <PinIcon className="h-4 w-4" /> Open Maps
        </a>
        {telUrl && (
          <a
            href={telUrl}
            onClick={() => track('outbound_call_clicked', { restaurantId: r.id })}
            className="btn-ghost h-12"
          >
            <PhoneIcon className="h-4 w-4" /> Call
          </a>
        )}
        {igUrl && (
          <a
            href={igUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => track('outbound_instagram_clicked', { restaurantId: r.id })}
            className="btn-ghost h-12"
          >
            <InstaIcon className="h-4 w-4" /> Instagram
          </a>
        )}
        {r.website && (
          <a
            href={r.website}
            target="_blank"
            rel="noreferrer"
            onClick={() => track('outbound_website_clicked', { restaurantId: r.id })}
            className="btn-ghost h-12"
          >
            <GlobeIcon className="h-4 w-4" /> Website
          </a>
        )}
        <button onClick={toggleSave} className={['h-12', saved ? 'btn-lime' : 'btn-ghost'].join(' ')}>
          <BookmarkIcon className="h-4 w-4" />
          {saved ? 'Saved' : 'Save'}
        </button>
        <button onClick={share} className="btn-ghost h-12">
          <ShareIcon className="h-4 w-4" /> Share
        </button>
      </section>

      <section className="mt-5 space-y-2">
        <h2 className="text-[11px] uppercase tracking-[0.15em] text-ink-300">Practical info</h2>
        <div className="rounded-2xl glass p-4 text-[13px] text-cream">
          <div className="flex justify-between gap-3 border-b border-white/5 py-2">
            <span className="text-ink-200">Address</span>
            <span className="text-right">{r.address}</span>
          </div>
          <div className="flex justify-between gap-3 border-b border-white/5 py-2">
            <span className="text-ink-200">Price level</span>
            <span>{priceMark(r.priceLevel)} · ~€{r.averageSpend}</span>
          </div>
          <div className="flex justify-between gap-3 border-b border-white/5 py-2">
            <span className="text-ink-200">Dietary</span>
            <span className="text-right">
              {r.vegetarianFriendly ? 'veg ' : ''}
              {r.veganFriendly ? '· vegan ' : ''}
              {r.glutenFreeOptions ? '· gluten-free' : ''}
              {!r.vegetarianFriendly && !r.veganFriendly && !r.glutenFreeOptions ? 'standard menu' : ''}
            </span>
          </div>
          {r.opening?.notes && (
            <div className="flex justify-between gap-3 py-2">
              <span className="text-ink-200">Note</span>
              <span className="text-right">{r.opening.notes}</span>
            </div>
          )}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="text-[11px] uppercase tracking-[0.15em] text-ink-300">Feedback</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FEEDBACK.map((f) => (
            <button
              key={f}
              type="button"
              className={['chip', feedbackSent === f ? 'active' : ''].join(' ')}
              onClick={() => sendFeedback(f)}
              disabled={Boolean(feedbackSent)}
            >
              {f}
            </button>
          ))}
        </div>
        {feedbackSent && (
          <p className="mt-2 text-[12px] text-ink-200">Thanks. Logged: {feedbackSent}.</p>
        )}
      </section>

      <div className="mt-6">
        <Link to="/ask" className="text-[13px] text-ink-200 hover:text-cream">
          &larr; Back to results
        </Link>
      </div>
    </AppShell>
  )
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.55 2.36a2 2 0 0 1-.45 2.11L8.09 9.46a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.76.25 1.55.43 2.36.55A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
function InstaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" />
    </svg>
  )
}
function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 4h12v17l-6-4-6 4z" />
    </svg>
  )
}
function ShareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8 11 16 7M8 13l8 4" />
    </svg>
  )
}
