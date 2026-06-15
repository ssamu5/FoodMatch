import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { api } from '../lib/api'
import { track } from '../lib/analytics'
import { openExternal } from '../lib/native'
import { useT } from '../lib/i18n'

const FOODMATCH_EMAIL = 'hola@foodmatch.es'

export default function RestaurantPartner() {
  const { t } = useT()

  const PARTNER_BENEFITS = [
    t('partner.benefit1'),
    t('partner.benefit2'),
    t('partner.benefit3'),
  ]

  const PILOT_STEPS = [
    t('partner.pilotStep1'),
    t('partner.pilotStep2'),
    t('partner.pilotStep3'),
  ]

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
            {t('partner.successBadge')}
          </span>
          <h1 className="mt-3 font-display text-[32px] font-bold leading-tight text-tinta">{t('partner.successHeading')}</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-tinta/70">
            {t('partner.successBody')}
          </p>
          <div className="mt-8 rounded-3xl glass p-5 text-left">
            <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/65">{t('partner.successReviewHeading')}</h2>
            <div className="space-y-1 text-[13px] text-tinta">
              <p><span className="text-tinta/70">{t('partner.successFieldRestaurant')}:</span> {form.restaurantName}</p>
              <p><span className="text-tinta/70">{t('partner.successFieldOwner')}:</span> {form.ownerName}</p>
              <p><span className="text-tinta/70">{t('partner.successFieldEmail')}:</span> {form.email}</p>
              {form.phone && <p><span className="text-tinta/70">{t('partner.successFieldPhone')}:</span> {form.phone}</p>}
              {form.area && <p><span className="text-tinta/70">{t('partner.successFieldArea')}:</span> {form.area}, {form.city}</p>}
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
          {t('partner.badge')}
        </span>
        <h1 className="mt-3 font-display text-[31px] font-bold leading-tight text-tinta">
          {t('partner.headingPre')}{' '}<span className="text-tomate">{t('partner.headingVibe')}</span>{t('partner.headingPost')}
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-tinta/75">
          {t('partner.intro')}
        </p>
      </section>

      {/* Primary path: guided assistant. The "almost done for you" route for
          non-technical owners. */}
      <section className="mt-5">
        <Link
          to="/restaurants/setup"
          onClick={() => track('partner_interest_started', { method: 'assistant_cta' })}
          className="flex items-center gap-3 rounded-3xl bg-tomate p-4 text-cream shadow-warm transition active:scale-[0.99]"
        >
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream/15 font-display text-[19px] font-bold">
            F
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[17px] font-bold leading-tight">{t('partner.assistantCtaTitle')}</span>
            <span className="block text-[12px] text-cream/85">{t('partner.assistantCtaSub')}</span>
          </span>
          <span aria-hidden="true" className="text-[18px]">&rarr;</span>
        </Link>
      </section>

      <section className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
        <div className="rounded-2xl glass p-3">
          <div className="font-display text-[18px] font-bold text-tomate">0%</div>
          <p className="mt-1 text-tinta/70">{t('partner.statCommission')}</p>
        </div>
        <div className="rounded-2xl glass p-3">
          <div className="font-display text-[18px] font-bold text-tomate">€69/mo</div>
          <p className="mt-1 text-tinta/75">{t('partner.statPriceNote')}</p>
        </div>
      </section>

      <section className="mt-5 rounded-3xl stamp-card p-5">
        <h2 className="font-display text-[23px] font-bold leading-tight text-tinta">{t('partner.whyJoinHeading')}</h2>
        <div className="mt-4 space-y-3">
          {PARTNER_BENEFITS.map((benefit, idx) => (
            <div key={idx} className="flex gap-3 text-[13px] leading-relaxed text-tinta/78">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tomate text-[11px] font-bold text-cream">
                {idx + 1}
              </span>
              <p>{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans + pricing (revenue streams surfaced for restaurateurs). Maps to
          the Plan / Subscription / Payment / BoostSlot models in the backend. */}
      <section className="mt-5">
        <h2 className="font-display text-[23px] font-bold leading-tight text-tinta">{t('partner.plansHeading')}</h2>
        <p className="mt-1 text-[13px] text-tinta/70">{t('partner.plansSubtitle')}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {/* Free */}
          <div className="flex flex-col rounded-3xl glass p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-tinta/55">{t('partner.planFreeName')}</p>
            <p className="mt-1.5 font-display text-[26px] font-bold leading-none text-tinta">
              {t('partner.planFreePrice')}<span className="ml-1 text-[12px] font-medium text-tinta/55">{t('partner.planFreeUnit')}</span>
            </p>
            <p className="mt-1 text-[12px] text-tinta/65">{t('partner.planFreeTagline')}</p>
            <ul className="mt-3 space-y-1.5 text-[12.5px] text-tinta/75">
              {[t('partner.planFreeF1'), t('partner.planFreeF2'), t('partner.planFreeF3')].map((f, i) => (
                <li key={i} className="flex gap-2"><span className="text-fresco">+</span><span>{f}</span></li>
              ))}
            </ul>
          </div>

          {/* Founder (highlighted) */}
          <div className="relative flex flex-col rounded-3xl stamp-card p-4 ring-2 ring-tomate/60">
            <span className="absolute -top-2.5 left-4 inline-flex rounded-full bg-tomate px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cream shadow-warm">
              {t('partner.planFounderBadge')}
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-tomate">{t('partner.planFounderName')}</p>
            <p className="mt-1.5 font-display text-[26px] font-bold leading-none text-tinta">
              {t('partner.planFounderPrice')}<span className="ml-1 text-[12px] font-medium text-tinta/55">{t('partner.planFounderUnit')}</span>
            </p>
            <p className="mt-1 text-[12px] text-tinta/65">{t('partner.planFounderTagline')}</p>
            <ul className="mt-3 space-y-1.5 text-[12.5px] text-tinta/80">
              {[t('partner.planFounderF1'), t('partner.planFounderF2'), t('partner.planFounderF3'), t('partner.planFounderF4')].map((f, i) => (
                <li key={i} className="flex gap-2"><span className="text-tomate">+</span><span>{f}</span></li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="flex flex-col rounded-3xl glass p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-tinta/55">{t('partner.planProName')}</p>
            <p className="mt-1.5 font-display text-[26px] font-bold leading-none text-tinta">
              {t('partner.planProPrice')}<span className="ml-1 text-[12px] font-medium text-tinta/55">{t('partner.planProUnit')}</span>
            </p>
            <p className="mt-1 text-[12px] text-tinta/65">{t('partner.planProTagline')}</p>
            <ul className="mt-3 space-y-1.5 text-[12.5px] text-tinta/75">
              {[t('partner.planFounderF2'), t('partner.planFounderF3'), t('partner.planFounderF4')].map((f, i) => (
                <li key={i} className="flex gap-2"><span className="text-fresco">+</span><span>{f}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Boost add-on */}
        <div className="mt-3 flex items-start gap-3 rounded-2xl bg-creamy/60 p-4 ring-1 ring-tinta/10">
          <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full bg-mostaza/20 px-2 py-0.5 text-[11px] font-bold text-mostaza ring-1 ring-mostaza/40">
            {t('partner.planBoostPrice')}{t('partner.planBoostUnit')}
          </span>
          <div>
            <p className="text-[13px] font-semibold text-tinta">{t('partner.planBoostName')}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-tinta/70">{t('partner.planBoostBody')}</p>
          </div>
        </div>

        <p className="mt-3 rounded-2xl bg-tomate/8 px-3 py-2 text-center text-[12.5px] font-semibold text-tomateDeep ring-1 ring-tomate/20">
          {t('partner.planCommission')}
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-tinta/55">{t('partner.planFootnote')}</p>
      </section>

      <section className="mt-5 rounded-3xl glass p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tinta/65">{t('partner.pilotHeading')}</h2>
        <div className="mt-3 grid gap-2">
          {PILOT_STEPS.map((step, idx) => (
            <div key={idx} className="rounded-2xl bg-creamy/60 px-3 py-2 text-[13px] text-tinta ring-1 ring-tinta/10">
              <span className="font-semibold text-tomate">0{idx + 1}.</span> {step}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-tinta/65">
          {t('partner.pilotNote')}
        </p>
      </section>

      <section className="mt-5 rounded-3xl glass p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tinta/65">{t('partner.listingsHeading')}</h2>
        <div className="mt-3 space-y-2">
          <div className="rounded-2xl bg-creamy/60 px-3 py-2.5 text-[13px] ring-1 ring-tinta/10">
            <span className="font-semibold text-tinta">{t('partner.listingPublicTitle')}</span>{' '}
            <span className="text-tinta/70">{t('partner.listingPublicBody')}</span>
          </div>
          <div className="rounded-2xl bg-creamy/60 px-3 py-2.5 text-[13px] ring-1 ring-tinta/10">
            <span className="font-semibold text-tinta">{t('partner.listingClaimTitle')}</span>{' '}
            <span className="text-tinta/70">{t('partner.listingClaimBody')}</span>
          </div>
          <div className="rounded-2xl bg-creamy/60 px-3 py-2.5 text-[13px] ring-1 ring-tinta/10">
            <span className="font-semibold text-tinta">{t('partner.listingFounderTitle')}</span>{' '}
            <span className="text-tinta/70">{t('partner.listingFounderBody')}</span>
          </div>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-tinta/60">
          {t('partner.listingFairness')}
          <a href={`mailto:${FOODMATCH_EMAIL}?subject=FoodMatch%20listing`} className="underline underline-offset-2 hover:text-tinta">
            {FOODMATCH_EMAIL}
          </a>
          {t('partner.listingFairnessPost')}
        </p>
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center gap-3">
          <span className="h-px flex-1 bg-tinta/15" />
          <span className="text-[11px] uppercase tracking-[0.15em] text-tinta/45">{t('partner.dividerFillIn')}</span>
          <span className="h-px flex-1 bg-tinta/15" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 rounded-3xl glass p-5">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">{t('partner.fieldRestaurantName')}</label>
            <input
              required
              value={form.restaurantName}
              onChange={(e) => update('restaurantName', e.target.value)}
              className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              placeholder={t('partner.placeholderRestaurantName')}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">{t('partner.fieldYourName')}</label>
              <input
                required
                value={form.ownerName}
                onChange={(e) => update('ownerName', e.target.value)}
                className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
                placeholder={t('partner.placeholderYourName')}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">{t('partner.fieldPhone')}</label>
              <input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
                placeholder={t('partner.placeholderPhone')}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">{t('partner.fieldEmail')}</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              placeholder={t('partner.placeholderEmail')}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">{t('partner.fieldInstagram')}</label>
            <input
              value={form.instagramOrWebsite}
              onChange={(e) => update('instagramOrWebsite', e.target.value)}
              className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              placeholder={t('partner.placeholderInstagram')}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">{t('partner.fieldArea')}</label>
              <input
                value={form.area}
                onChange={(e) => update('area', e.target.value)}
                className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
                placeholder={t('partner.placeholderArea')}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">{t('partner.fieldCity')}</label>
              <input
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/65">{t('partner.fieldMessage')}</label>
            <textarea
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              rows={3}
              className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              placeholder={t('partner.placeholderMessage')}
            />
          </div>
          <button type="submit" className="btn-lime h-12 w-full">
            {t('partner.submitButton')}
          </button>
          <p className="text-center text-[11px] leading-relaxed text-tinta/65">
            {t('partner.gdprNote')}
          </p>
        </form>
      </section>

      <section className="mt-4">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-tinta/15" />
          <span className="text-[11px] uppercase tracking-[0.15em] text-tinta/40">{t('partner.dividerOr')}</span>
          <span className="h-px flex-1 bg-tinta/15" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={contactWhatsApp} className="btn-ghost h-12">
            {t('partner.whatsappButton')}
          </button>
          <button type="button" onClick={contactEmail} className="btn-ghost h-12">
            {t('partner.emailButton')}
          </button>
        </div>
      </section>
    </AppShell>
  )
}
