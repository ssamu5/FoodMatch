import { useState, type FormEvent } from 'react'
import AppShell from '../components/AppShell'
import { api } from '../lib/api'
import { track } from '../lib/analytics'
import { openExternal } from '../lib/native'

const FOODMATCH_EMAIL = 'hola@foodmatch.es'

const PARTNER_BENEFITS = [
  'Show up when diners search by craving, budget, area, and vibe — not only by cuisine category.',
  'Qualified WhatsApp, website, and discovery intent without a commission on bookings.',
  'Founder pricing for early Valencia partners while the product validates real demand.',
]

const PILOT_STEPS = [
  'Submit your restaurant details',
  'We review fit and improve your listing',
  'You get discovery traffic signals from FoodMatch searches',
]

export default function RestaurantPartner() {
  const [form, setForm] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    instagramOrWebsite: '',
    area: '',
    city: 'Valencia',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.restaurantName.trim() || !form.ownerName.trim() || !form.email.trim()) return
    api.submitRestaurantLead(form)
    track('restaurant_lead_submitted', { area: form.area, city: form.city })
    setSubmitted(true)
  }

  function contactEmail() {
    track('partner_interest_started', { method: 'email' })
    const subject = encodeURIComponent('FoodMatch Partners - interes de restaurante')
    const body = encodeURIComponent(
      [
        `Restaurante: ${form.restaurantName || ''}`,
        `Responsable: ${form.ownerName || ''}`,
        `Telefono/WhatsApp: ${form.phone || ''}`,
        `Zona: ${form.area || ''}, ${form.city || 'Valencia'}`,
        '',
        'Me interesa saber mas sobre FoodMatch Partners.',
      ].join('\n'),
    )
    openExternal(`mailto:${FOODMATCH_EMAIL}?subject=${subject}&body=${body}`)
  }

  function contactWhatsApp() {
    track('partner_interest_started', { method: 'whatsapp' })
    const text = encodeURIComponent(
      `Hola FoodMatch, soy ${form.ownerName || '...'} de ${form.restaurantName || 'mi restaurante'} en ${form.area || 'Valencia'}. Me interesa FoodMatch Partners.`,
    )
    openExternal(`https://wa.me/?text=${text}`)
  }

  if (submitted) {
    return (
      <AppShell hideNav>
        <section className="pt-10 text-center">
          <span className="inline-flex rounded-full bg-tomate/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-tomate ring-1 ring-tomate/30">
            Partner pilot
          </span>
          <h1 className="mt-3 font-display text-[32px] font-bold leading-tight text-tinta">Application received.</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-tinta/70">
            We'll be in touch within 48 hours to walk through how FoodMatch can put your restaurant in front of the right Valencia diners.
          </p>
          <div className="mt-8 rounded-3xl glass p-5 text-left">
            <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/65">What you submitted</h2>
            <div className="space-y-1 text-[13px] text-tinta">
              <p><span className="text-tinta/70">Restaurant:</span> {form.restaurantName}</p>
              <p><span className="text-tinta/70">Owner:</span> {form.ownerName}</p>
              <p><span className="text-tinta/70">Email:</span> {form.email}</p>
              {form.phone && <p><span className="text-tinta/70">Phone:</span> {form.phone}</p>}
              {form.area && <p><span className="text-tinta/70">Area:</span> {form.area}, {form.city}</p>}
            </div>
          </div>
        </section>
      </AppShell>
    )
  }

  return (
    <AppShell hideNav>
      <section className="pt-2">
        <span className="inline-flex rounded-full bg-tomate/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-tomate ring-1 ring-tomate/30">
          Valencia founder partner program
        </span>
        <h1 className="mt-3 font-display text-[31px] font-bold leading-tight text-tinta">
          Get discovered when diners know the <span className="text-tomate">vibe</span>, not the venue.
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-tinta/75">
          FoodMatch is building a cleaner discovery layer for Valencia restaurants. Diners describe what they crave; we match them to the few places that fit and measure real demand before scaling. Your restaurant may already appear from public information. Claiming the listing lets you control the details and see the demand.
        </p>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-2 text-[13px]">
        <div className="rounded-2xl glass p-3">
          <div className="font-display text-[18px] font-bold text-tomate">0%</div>
          <p className="mt-1 text-tinta/70">commission on bookings</p>
        </div>
        <div className="rounded-2xl glass p-3">
          <div className="font-display text-[18px] font-bold text-tomate">€69/mo</div>
          <p className="mt-1 text-tinta/75">+VAT where applicable. Locked for 24 months</p>
        </div>
      </section>

      <section className="mt-5 rounded-3xl stamp-card p-5">
        <h2 className="font-display text-[23px] font-bold leading-tight text-tinta">Why early restaurants join</h2>
        <div className="mt-4 space-y-3">
          {PARTNER_BENEFITS.map((benefit, idx) => (
            <div key={benefit} className="flex gap-3 text-[13px] leading-relaxed text-tinta/78">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tomate text-[11px] font-bold text-cream">
                {idx + 1}
              </span>
              <p>{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-3xl glass p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tinta/65">Pilot process</h2>
        <div className="mt-3 grid gap-2">
          {PILOT_STEPS.map((step, idx) => (
            <div key={step} className="rounded-2xl bg-creamy/60 px-3 py-2 text-[13px] text-tinta ring-1 ring-tinta/10">
              <span className="font-semibold text-tomate">0{idx + 1}.</span> {step}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-tinta/65">
          No inflated promises: the goal is to validate qualified diner intent with a small group of strong Valencia restaurants first.
        </p>
      </section>

      <section className="mt-5 rounded-3xl glass p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tinta/65">How listings work</h2>
        <div className="mt-3 space-y-2">
          <div className="rounded-2xl bg-creamy/60 px-3 py-2.5 text-[13px] ring-1 ring-tinta/10">
            <span className="font-semibold text-tinta">Public listing.</span>{' '}
            <span className="text-tinta/70">We show restaurants from public information so diners can discover them. Free, no signup needed.</span>
          </div>
          <div className="rounded-2xl bg-creamy/60 px-3 py-2.5 text-[13px] ring-1 ring-tinta/10">
            <span className="font-semibold text-tinta">Claim it.</span>{' '}
            <span className="text-tinta/70">Verify the details, fix anything wrong, add photos and menu highlights.</span>
          </div>
          <div className="rounded-2xl bg-creamy/60 px-3 py-2.5 text-[13px] ring-1 ring-tinta/10">
            <span className="font-semibold text-tinta">Founder plan.</span>{' '}
            <span className="text-tinta/70">€69/mo for the first 100: full control plus the demand insights behind your listing.</span>
          </div>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-tinta/60">
          Fairness: public data is only used to help diners find places to eat. If you run a listed restaurant, you can claim, correct, update, or ask us to remove your listing any time at{' '}
          <a href={`mailto:${FOODMATCH_EMAIL}?subject=FoodMatch%20listing`} className="underline underline-offset-2 hover:text-tinta">
            {FOODMATCH_EMAIL}
          </a>.
        </p>
      </section>

      <section className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-3 rounded-3xl glass p-5">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">Restaurant name *</label>
            <input
              required
              value={form.restaurantName}
              onChange={(e) => update('restaurantName', e.target.value)}
              className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              placeholder="Casa Carmela"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">Your name *</label>
              <input
                required
                value={form.ownerName}
                onChange={(e) => update('ownerName', e.target.value)}
                className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
                placeholder="Carmen"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">Phone / WhatsApp</label>
              <input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
                placeholder="+34 600 123 456"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              placeholder="hola@casacarmela.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">Instagram or website</label>
            <input
              value={form.instagramOrWebsite}
              onChange={(e) => update('instagramOrWebsite', e.target.value)}
              className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              placeholder="@casacarmela_vlc"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">Area</label>
              <input
                value={form.area}
                onChange={(e) => update('area', e.target.value)}
                className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
                placeholder="Ruzafa"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">City</label>
              <input
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">Message (optional)</label>
            <textarea
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              rows={3}
              className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              placeholder="What should we know about your restaurant, audience, or best table moments?"
            />
          </div>
          <button type="submit" className="btn-lime h-12 w-full">
            Apply for €69/mo founder pricing
          </button>
          <p className="text-center text-[11px] leading-relaxed text-tinta/65">
            We respond within 48 hours. GDPR friendly: we only use this to contact you about FoodMatch Partners.
          </p>
        </form>
      </section>

      <section className="mt-4">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-tinta/15" />
          <span className="text-[11px] uppercase tracking-[0.15em] text-tinta/40">or reach us directly</span>
          <span className="h-px flex-1 bg-tinta/15" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={contactWhatsApp} className="btn-ghost h-12">
            WhatsApp us
          </button>
          <button type="button" onClick={contactEmail} className="btn-ghost h-12">
            Email us
          </button>
        </div>
      </section>
    </AppShell>
  )
}
