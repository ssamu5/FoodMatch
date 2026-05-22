import { useState, type FormEvent } from 'react'
import AppShell from '../components/AppShell'
import { api } from '../lib/api'
import { track } from '../lib/analytics'

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

  if (submitted) {
    return (
      <AppShell>
        <section className="pt-10 text-center">
          <h1 className="font-display text-[32px] font-bold leading-tight text-tinta">Got it.</h1>
          <p className="mt-2 text-[14px] text-tinta/70">
            We'll be in touch within 48 hours to walk through how FoodMatch can put your restaurant in front of the right diners.
          </p>
          <div className="mt-8 rounded-3xl glass p-5 text-left">
            <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">What you submitted</h2>
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
    <AppShell>
      <section className="pt-2">
        <h1 className="font-display text-[30px] font-bold leading-tight text-tinta">
          Get your restaurant <span className="text-tomate">found</span>.
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-tinta/70">
          FoodMatch sends curious, hungry diners straight to the best fit for their craving. Zero commission, flat monthly subscription, founder pricing for the first 100 partners in Valencia.
        </p>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-2 text-[13px]">
        <div className="rounded-2xl glass p-3">
          <div className="font-display text-[18px] font-bold text-tomate">0%</div>
          <p className="mt-1 text-tinta/70">commission on bookings</p>
        </div>
        <div className="rounded-2xl glass p-3">
          <div className="font-display text-[18px] font-bold text-tomate">2 months</div>
          <p className="mt-1 text-tinta/70">free for the first 100</p>
        </div>
      </section>

      <section className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-3 rounded-3xl glass p-5">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/50">Restaurant name *</label>
            <input
              required
              value={form.restaurantName}
              onChange={(e) => update('restaurantName', e.target.value)}
              className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              placeholder="Casa Carmela"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/50">Your name *</label>
              <input
                required
                value={form.ownerName}
                onChange={(e) => update('ownerName', e.target.value)}
                className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
                placeholder="Carmen"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/50">Phone / WhatsApp</label>
              <input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
                placeholder="+34 600 123 456"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/50">Email *</label>
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
            <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/50">Instagram or website</label>
            <input
              value={form.instagramOrWebsite}
              onChange={(e) => update('instagramOrWebsite', e.target.value)}
              className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              placeholder="@casacarmela_vlc"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/50">Area</label>
              <input
                value={form.area}
                onChange={(e) => update('area', e.target.value)}
                className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
                placeholder="Ruzafa"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/50">City</label>
              <input
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-tinta/50">Message (optional)</label>
            <textarea
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              rows={3}
              className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              placeholder="Anything we should know about your restaurant?"
            />
          </div>
          <button type="submit" className="btn-lime h-12 w-full">
            Apply for FoodMatch Partners
          </button>
          <p className="text-center text-[11px] text-tinta/50">
            We respond within 48 hours. GDPR friendly, data stays in EU.
          </p>
        </form>
      </section>
    </AppShell>
  )
}
