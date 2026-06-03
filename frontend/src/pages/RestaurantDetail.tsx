import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import EmptyState from '../components/EmptyState'
import RestaurantCover from '../components/RestaurantCover'
import { api } from '../lib/api'
import { isSaved, saveRestaurant, unsaveRestaurant } from '../lib/storage'
import { parseFoodIntent } from '../lib/foodIntent'
import { buildMatchExplanation, scoreRestaurant } from '../lib/ranking'
import { buildWhatsAppUrl, hasVerifiedWhatsApp, lastCraving, menuHighlightsFor } from '../lib/leads'
import { listingTierLabel, PUBLIC_LISTING_NOTE, VERIFIED_LISTING_NOTE } from '../lib/listings'
import { track } from '../lib/analytics'
import { hapticSuccess, hapticTap, openExternal, shareNative } from '../lib/native'

const LAST_QUERY_KEY = 'foodmatch.lastIntentQuery'

function priceMark(level: 1 | 2 | 3 | 4): string {
  return '€'.repeat(level)
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

  // If the user arrived from a search this session, explain why THIS
  // restaurant fits THEIR query. Falls back to null (generic copy only)
  // when there's no session query, e.g. opened cold from Saved.
  const personalised = useMemo(() => {
    if (!r) return null
    let q: string | null = null
    try {
      q = sessionStorage.getItem(LAST_QUERY_KEY)
    } catch {
      /* sessionStorage may be blocked */
    }
    if (!q || !q.trim()) return null
    const intent = parseFoodIntent(q)
    const score = scoreRestaurant(intent, r)
    return { explanation: buildMatchExplanation(intent, r, score), score }
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
    track('share_clicked', { restaurantId: r.id, source: 'detail' })
    void shareNative({
      title: r.name,
      text: `${r.name} on FoodMatch`,
      url: window.location.href,
    })
  }

  function sendWhatsAppLead() {
    if (!r) return
    track('whatsapp_lead_clicked', {
      restaurantId: r.id,
      verifiedNumber: hasVerifiedWhatsApp(r),
      hadCraving: Boolean(lastCraving()),
    })
    void hapticSuccess()
    openExternal(buildWhatsAppUrl(r, lastCraving()))
  }

  function sendFeedback(label: string) {
    setFeedbackSent(label)
    track('feedback_submitted', { restaurantId: r!.id, label })
  }

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(`${r.name} ${r.address} ${r.city}`)}`
  const telUrl = r.phone ? `tel:${r.phone.replace(/\s+/g, '')}` : undefined
  const igUrl = r.instagram ? `https://instagram.com/${r.instagram.replace(/^@/, '')}` : undefined
  const highlights = menuHighlightsFor(r)

  return (
    <AppShell>
      <div className="relative h-40 w-full overflow-hidden rounded-3xl sm:h-56">
        <RestaurantCover restaurant={r} variant="hero" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/20 to-ink/80" aria-hidden="true" />
        <span
          className={[
            'absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            r.isPartner ? 'bg-tomate text-cream' : 'bg-ink/55 text-cream backdrop-blur-sm',
          ].join(' ')}
        >
          {listingTierLabel(r)}
        </span>
      </div>

      <section className="mt-4 space-y-2">
        <h1 className="font-display text-[26px] font-bold leading-tight text-tinta">{r.name}</h1>
        <p className="text-[13px] text-tinta/70">
          {r.cuisine} · {r.area} · {priceMark(r.priceLevel)} · ★ {r.rating.toFixed(1)} ({r.reviewCount})
        </p>
        <p className="text-[14px] leading-relaxed text-tinta">{r.description}</p>
      </section>

      <section className="mt-4">
        <button
          type="button"
          onClick={sendWhatsAppLead}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full font-semibold text-white transition active:scale-[0.99]"
          style={{ background: '#25D366' }}
        >
          <WhatsAppIcon className="h-5 w-5" />
          Reservar o pedir por WhatsApp
        </button>
        <p className="mt-1.5 text-center text-[11px] text-tinta/50">
          {hasVerifiedWhatsApp(r)
            ? 'Opens WhatsApp with your craving ready to send.'
            : 'Opens WhatsApp with a prefilled message. Demo numbers are not connected yet.'}
        </p>
      </section>

      {personalised && (
        <section className="mt-4 rounded-2xl glass p-4">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-tinta/50">Why this fits your search</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-tinta">{personalised.explanation}</p>
          {personalised.score.reasons.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {personalised.score.reasons.slice(0, 4).map((x) => (
                <span key={x} className="rounded-full bg-tomate/10 px-2.5 py-1 text-[11px] font-medium text-fresco">
                  {x}
                </span>
              ))}
            </div>
          )}
          {personalised.score.warnings.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {personalised.score.warnings.slice(0, 2).map((w) => (
                <span key={w} className="rounded-full bg-warn/10 px-2.5 py-1 text-[11px] font-medium text-warn">
                  ! {w}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mt-4 rounded-2xl glass p-4">
        <h2 className="text-[11px] uppercase tracking-[0.15em] text-tinta/50">Why FoodMatch picks it</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-tinta">
          {r.bestFor.length > 0 ? `Best for ${r.bestFor.slice(0, 2).join(' and ')}. ` : ''}
          Typical spend ~€{r.averageSpend}. Vibe: {r.vibe.slice(0, 3).join(', ')}.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {r.bestFor.slice(0, 4).map((b) => (
            <span key={b} className="rounded-full bg-tomate/10 px-2.5 py-1 text-[11px] font-medium text-fresco">
              {b}
            </span>
          ))}
        </div>
      </section>

      {r.menu && r.menu.length > 0 ? (
        <section className="mt-4 rounded-2xl glass p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[11px] uppercase tracking-[0.15em] text-tinta/50">Menu</h2>
            {!r.isPartner && <span className="text-[10px] text-tinta/40">sample</span>}
          </div>
          <ul className="mt-2 divide-y divide-tinta/8">
            {r.menu.slice(0, 8).map((d) => (
              <li key={d.name} className="flex items-baseline justify-between gap-3 py-2">
                <span className="text-[14px] text-tinta">{d.name}</span>
                {d.priceEur != null && (
                  <span className="shrink-0 font-mono text-[13px] text-tinta/60">€{d.priceEur}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        highlights.length > 0 && (
          <section className="mt-4 rounded-2xl glass p-4">
            <h2 className="text-[11px] uppercase tracking-[0.15em] text-tinta/50">Menu highlights</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {highlights.map((h) => (
                <span key={h} className="rounded-full bg-tomate/10 px-2.5 py-1 text-[11px] font-medium text-fresco">
                  {h}
                </span>
              ))}
            </div>
          </section>
        )
      )}

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
        <h2 className="text-[11px] uppercase tracking-[0.15em] text-tinta/50">Practical info</h2>
        <div className="rounded-2xl glass p-4 text-[13px] text-tinta">
          <div className="flex justify-between gap-3 border-b border-tinta/12 py-2">
            <span className="text-tinta/70">Address</span>
            <span className="text-right">{r.address}</span>
          </div>
          <div className="flex justify-between gap-3 border-b border-tinta/12 py-2">
            <span className="text-tinta/70">Price level</span>
            <span>{priceMark(r.priceLevel)} · ~€{r.averageSpend}</span>
          </div>
          <div className="flex justify-between gap-3 border-b border-tinta/12 py-2">
            <span className="text-tinta/70">Dietary</span>
            <span className="text-right">
              {r.vegetarianFriendly ? 'veg ' : ''}
              {r.veganFriendly ? '· vegan ' : ''}
              {r.glutenFreeOptions ? '· gluten-free' : ''}
              {!r.vegetarianFriendly && !r.veganFriendly && !r.glutenFreeOptions ? 'standard menu' : ''}
            </span>
          </div>
          {r.opening?.notes && (
            <div className="flex justify-between gap-3 py-2">
              <span className="text-tinta/70">Note</span>
              <span className="text-right">{r.opening.notes}</span>
            </div>
          )}
        </div>
      </section>

      <section className="mt-5 rounded-2xl glass p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-tinta/50">How this listing works</h2>
          <span
            className={[
              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              r.isPartner ? 'bg-tomate/15 text-tomate' : 'bg-tinta/10 text-tinta/70',
            ].join(' ')}
          >
            {listingTierLabel(r)}
          </span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-tinta/70">
          {r.isPartner ? VERIFIED_LISTING_NOTE : PUBLIC_LISTING_NOTE}
        </p>
        {!r.isPartner && (
          <>
            <Link
              to="/restaurants"
              onClick={() => track('listing_claim_clicked', { restaurantId: r.id })}
              className="btn-ghost mt-3 h-11 w-full text-[13px]"
            >
              Claim or update this listing →
            </Link>
            <p className="mt-2 text-[11px] leading-relaxed text-tinta/50">
              See wrong info? Email {''}
              <a href="mailto:hola@foodmatch.es?subject=FoodMatch%20listing%20correction" className="underline underline-offset-2 hover:text-tinta">
                hola@foodmatch.es
              </a>{' '}
              to correct or remove this listing.
            </p>
          </>
        )}
      </section>

      <section className="mt-5">
        <h2 className="text-[11px] uppercase tracking-[0.15em] text-tinta/50">Feedback</h2>
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
          <p className="mt-2 text-[12px] text-tinta/70">Thanks. Logged: {feedbackSent}.</p>
        )}
      </section>

      <div className="mt-6">
        <Link to="/ask" className="text-[13px] text-tinta/70 hover:text-tinta">
          &larr; Back to results
        </Link>
      </div>
    </AppShell>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
    </svg>
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
