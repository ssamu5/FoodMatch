import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import { clearAccount, getAccount, getTasteProfile, saveAccount, saveTasteProfile } from '../lib/storage'
import { api } from '../lib/api'
import { track } from '../lib/analytics'
import type { Account, TasteProfile } from '../types/profile'
import type { Area, Cuisine, Vibe } from '../types/restaurant'

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'You'.slice(0, 1)
}

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

  const [account, setAccount] = useState<Account | null>(() => getAccount())
  const [nameDraft, setNameDraft] = useState('')
  const [acctEmailDraft, setAcctEmailDraft] = useState('')

  useEffect(() => {
    setEmailDraft(profile.email || '')
  }, [profile.email])

  function createAccount() {
    const name = nameDraft.trim()
    if (!name) return
    const acct: Account = {
      displayName: name,
      email: acctEmailDraft.trim() || null,
      createdAt: new Date().toISOString(),
    }
    saveAccount(acct)
    setAccount(acct)
    track('account_created', { hasEmail: Boolean(acct.email) })
    if (acct.email) {
      api.submitUserLead({ email: acct.email, source: 'other' })
      track('user_lead_submitted', { source: 'account' })
    }
  }

  function signOut() {
    clearAccount()
    setAccount(null)
    setNameDraft('')
    setAcctEmailDraft('')
    track('account_signed_out')
  }

  function toggle<T>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
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
        <h1 className="font-display text-[28px] font-bold leading-tight text-tinta">You</h1>
        <p className="mt-1 text-[13px] text-tinta/70">
          Your FoodMatch profile for the Valencia pilot.
        </p>
      </section>

      <section className="mt-4 rounded-3xl stamp-card p-5">
        {account ? (
          <>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tomate font-display text-[18px] font-bold text-cream">
                {initialsOf(account.displayName)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-[19px] font-bold leading-tight text-tinta">
                  Hola, {account.displayName}
                </p>
                <p className="truncate text-[12px] text-tinta/60">
                  {account.email ?? 'Signed in on this device'}
                </p>
              </div>
            </div>
            <button onClick={signOut} className="btn-ghost mt-4 h-10 w-full text-[13px]">
              Sign out
            </button>
          </>
        ) : (
          <>
            <h2 className="font-display text-[20px] font-bold leading-tight text-tinta">Create your profile</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-tinta/70">
              Keep your saved spots and get craving-aware picks. No password yet, it stays on this device for the pilot.
            </p>
            <div className="mt-3 space-y-2">
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Your name"
                className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              />
              <input
                type="email"
                value={acctEmailDraft}
                onChange={(e) => setAcctEmailDraft(e.target.value)}
                placeholder="Email (optional)"
                className="liquid-input w-full rounded-2xl px-3 py-2.5 text-[14px]"
              />
              <button
                onClick={createAccount}
                disabled={!nameDraft.trim()}
                className="btn-lime h-11 w-full text-[13px]"
              >
                Continue
              </button>
            </div>
            <p className="mt-2 text-[11px] text-tinta/50">
              Demo sign-in for the pilot. Real accounts and sync come later.
            </p>
          </>
        )}
      </section>

      <section className="mt-7">
        <h2 className="font-display text-[20px] font-bold leading-tight text-tinta">Your taste</h2>
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
      </section>
    </AppShell>
  )
}
