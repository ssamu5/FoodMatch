import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import { getTasteProfile, saveTasteProfile } from '../lib/storage'
import { api } from '../lib/api'
import { track } from '../lib/analytics'
import type { TasteProfile } from '../types/profile'
import type { Area, Cuisine, Vibe } from '../types/restaurant'

const CUISINES: Cuisine[] = [
  'Spanish tapas', 'paella', 'sushi', 'burgers', 'pizza', 'pasta',
  'healthy bowls', 'vegan', 'vegetarian', 'brunch', 'coffee',
  'Mexican', 'Indian', 'Asian fusion', 'Mediterranean', 'seafood', 'steak',
]
const AREAS: Area[] = ['Ruzafa', 'El Carmen', 'Canovas', 'Benimaclet', 'City center', 'Marina / beach']
const VIBES: Vibe[] = ['romantic', 'casual', 'lively', 'quiet', 'family', 'work', 'outdoor', 'cozy']

export default function Profile() {
  const [profile, setProfile] = useState<TasteProfile>(() => getTasteProfile())
  const [emailDraft, setEmailDraft] = useState(profile.email || '')
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => {
    setEmailDraft(profile.email || '')
  }, [profile.email])

  function toggle<T>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
  }

  function update<K extends keyof TasteProfile>(key: K, value: TasteProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }))
  }

  function persist(next: TasteProfile = profile) {
    saveTasteProfile(next)
    setSavedAt(new Date().toLocaleTimeString())
  }

  function submitEmail() {
    if (!emailDraft.trim()) return
    const next = { ...profile, email: emailDraft.trim() }
    setProfile(next)
    saveTasteProfile(next)
    api.submitUserLead({ email: emailDraft.trim(), source: 'profile_email' })
    track('user_lead_submitted', { source: 'profile_email' })
    setSavedAt(new Date().toLocaleTimeString())
  }

  return (
    <AppShell>
      <section className="pt-2">
        <h1 className="font-display text-[28px] font-bold leading-tight text-tinta">Your taste</h1>
        <p className="mt-1 text-[13px] text-tinta/70">
          Tell FoodMatch what you usually love. We use it as a soft signal on every search.
        </p>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">Favorite cuisines</h2>
        <div className="flex flex-wrap gap-1.5">
          {CUISINES.map((c) => (
            <button
              key={c}
              type="button"
              className={['chip', profile.favoriteCuisines.includes(c) ? 'active' : ''].join(' ')}
              onClick={() => {
                const next = { ...profile, favoriteCuisines: toggle(profile.favoriteCuisines, c) }
                setProfile(next)
                persist(next)
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">Budget comfort</h2>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className={['chip', profile.budgetComfort === null ? 'active' : ''].join(' ')}
            onClick={() => {
              const next = { ...profile, budgetComfort: null }
              setProfile(next)
              persist(next)
            }}
          >
            No preference
          </button>
          {[1, 2, 3, 4].map((l) => (
            <button
              key={l}
              type="button"
              className={['chip', profile.budgetComfort === l ? 'active' : ''].join(' ')}
              onClick={() => {
                const next = { ...profile, budgetComfort: l as 1 | 2 | 3 | 4 }
                setProfile(next)
                persist(next)
              }}
            >
              {'€'.repeat(l)}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">Preferred areas</h2>
        <div className="flex flex-wrap gap-1.5">
          {AREAS.map((a) => (
            <button
              key={a}
              type="button"
              className={['chip', profile.preferredAreas.includes(a) ? 'active' : ''].join(' ')}
              onClick={() => {
                const next = { ...profile, preferredAreas: toggle(profile.preferredAreas, a) }
                setProfile(next)
                persist(next)
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">Dietary</h2>
        <div className="flex flex-wrap gap-1.5">
          {(['vegetarian', 'vegan', 'gluten-free'] as const).map((d) => (
            <button
              key={d}
              type="button"
              className={['chip', profile.dietary.includes(d) ? 'active' : ''].join(' ')}
              onClick={() => {
                const next = { ...profile, dietary: toggle(profile.dietary, d) }
                setProfile(next)
                persist(next)
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">Vibe</h2>
        <div className="flex flex-wrap gap-1.5">
          {VIBES.map((v) => (
            <button
              key={v}
              type="button"
              className={['chip', profile.vibePreferences.includes(v) ? 'active' : ''].join(' ')}
              onClick={() => {
                const next = { ...profile, vibePreferences: toggle(profile.vibePreferences, v) }
                setProfile(next)
                persist(next)
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl glass p-4">
        <h2 className="text-[11px] uppercase tracking-[0.15em] text-tinta/50">Weekly Valencia picks</h2>
        <p className="mt-1 text-[13px] text-tinta/70">
          Optional. Email me one short list of best spots per week. Unsubscribe anytime.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="email"
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            placeholder="you@email.com"
            className="liquid-input flex-1 rounded-full px-4 py-2 text-[14px] focus:outline-none"
          />
          <button onClick={submitEmail} className="btn-lime h-10 px-4 text-[13px]" disabled={!emailDraft.trim()}>
            Subscribe
          </button>
        </div>
        {savedAt && <p className="mt-2 text-[11px] text-tinta/70">Saved at {savedAt}.</p>}
        {/* Ignore unused update fn to satisfy TS */}
        <span hidden>{typeof update}</span>
      </section>
    </AppShell>
  )
}
