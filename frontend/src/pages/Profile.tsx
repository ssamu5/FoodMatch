import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import LanguageToggle from '../components/LanguageToggle'
import { useT, useLang } from '../lib/i18n'
import { getAccount, getTasteProfile } from '../lib/storage'
import { saveProfile, syncProfile } from '../lib/userData'
import { logout } from '../lib/auth'
import AuthForm from '../components/AuthForm'
import { api } from '../lib/api'
import { track } from '../lib/analytics'
import { getMyRestaurants, claimRestaurant, updateMyRestaurant } from '../lib/restaurateur'
import type { Account, TasteProfile } from '../types/profile'
import type { Area, Cuisine, Vibe, Restaurant } from '../types/restaurant'

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}

const CUISINES: Cuisine[] = [
  'Spanish tapas', 'paella', 'menú del día', 'sushi', 'burgers', 'pizza', 'pasta',
  'healthy bowls', 'vegan', 'vegetarian', 'brunch', 'coffee', 'bar',
  'Mexican', 'Indian', 'Asian fusion', 'Mediterranean', 'seafood', 'steak',
]
const AREAS: Area[] = ['Ruzafa', 'El Carmen', 'Canovas', 'Benimaclet', 'City center', 'Marina / beach']
const VIBES: Vibe[] = ['romantic', 'casual', 'lively', 'quiet', 'family', 'work', 'outdoor', 'cozy']

export default function Profile() {
  const { t } = useT()
  const { lang } = useLang()
  const [profile, setProfile] = useState<TasteProfile>(() => getTasteProfile())
  const [emailDraft, setEmailDraft] = useState(profile.email || '')
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const [account, setAccount] = useState<Account | null>(() => getAccount())

  // Restaurateur dashboard state
  const [myRestaurants, setMyRestaurants] = useState<Restaurant[]>([])
  const [claimSlug, setClaimSlug] = useState('')
  const [manageMsg, setManageMsg] = useState<string | null>(null)
  // Per-restaurant edit drafts keyed by slug
  const [editDrafts, setEditDrafts] = useState<Record<string, Partial<Restaurant>>>({})
  // In-flight flags so buttons can show progress and block double-submits.
  const [savingSlug, setSavingSlug] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [loadingRestaurants, setLoadingRestaurants] = useState(false)

  useEffect(() => {
    setEmailDraft(profile.email || '')
  }, [profile.email])

  useEffect(() => {
    let cancelled = false
    syncProfile().then((p) => { if (!cancelled) setProfile(p) }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!account) return
    let cancelled = false
    setLoadingRestaurants(true)
    getMyRestaurants().then((list) => {
      if (!cancelled) setMyRestaurants(list)
    }).catch(() => {}).finally(() => {
      if (!cancelled) setLoadingRestaurants(false)
    })
    return () => { cancelled = true }
  }, [account])

  function onAuthSuccess() {
    const acct = getAccount()
    setAccount(acct)
    if (acct?.email) {
      api.submitUserLead({ email: acct.email, source: 'other' })
      track('user_lead_submitted', { source: 'account' })
    }
  }

  async function signOut() {
    await logout()
    setAccount(null)
    track('account_signed_out')
  }

  function toggle<T>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
  }

  function persist(next: TasteProfile = profile) {
    void saveProfile(next)
    setSavedAt(new Date().toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-US'))
  }

  function submitEmail() {
    if (!emailDraft.trim()) return
    const next = { ...profile, email: emailDraft.trim() }
    setProfile(next)
    void saveProfile(next)
    api.submitUserLead({ email: emailDraft.trim(), source: 'profile_email' })
    track('user_lead_submitted', { source: 'profile_email' })
    setSavedAt(new Date().toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-US'))
  }

  // Restaurateur helpers
  function draftFor(r: Restaurant): Restaurant {
    return { ...r, ...editDrafts[r.slug] }
  }

  function patchDraft(slug: string, patch: Partial<Restaurant>) {
    setEditDrafts((prev) => ({ ...prev, [slug]: { ...prev[slug], ...patch } }))
  }

  async function handleSave(r: Restaurant) {
    if (savingSlug) return
    const d = draftFor(r)
    setManageMsg(null)
    setSavingSlug(r.slug)
    try {
      const res = await updateMyRestaurant({
        slug: r.slug,
        name: d.name ?? '',
        description: d.description ?? '',
        descriptionEs: d.descriptionEs ?? '',
        address: d.address ?? '',
        phone: d.phone ?? '',
        instagram: d.instagram ?? '',
        whatsapp: d.whatsapp ?? '',
      })
      if (res.ok) {
        const list = await getMyRestaurants()
        setMyRestaurants(list)
        setEditDrafts((prev) => { const n = { ...prev }; delete n[r.slug]; return n })
        setManageMsg(t('profile.msgSaved'))
      } else {
        setManageMsg(t('profile.msgSaveError'))
      }
    } finally {
      setSavingSlug(null)
    }
  }

  async function handleClaim() {
    if (claiming || !claimSlug.trim()) return
    setManageMsg(null)
    setClaiming(true)
    try {
      const res = await claimRestaurant(claimSlug)
      if (res.ok) {
        const list = await getMyRestaurants()
        setMyRestaurants(list)
        setClaimSlug('')
        setManageMsg(t('profile.msgClaimed'))
      } else {
        setManageMsg(t('profile.msgClaimError'))
      }
    } finally {
      setClaiming(false)
    }
  }

  return (
    <AppShell>
      <section className="pt-2">
        <h1 className="font-display text-[28px] font-bold leading-tight text-tinta">{t('profile.heading')}</h1>
        <p className="mt-1 text-[13px] text-tinta/70">
          {t('profile.subtitle')}
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
                  {t('profile.greeting', { name: account.displayName })}
                </p>
                <p className="truncate text-[12px] text-tinta/60">
                  {account.email ?? t('profile.signedInOnDevice')}
                </p>
              </div>
            </div>
            <button type="button" onClick={signOut} className="btn-ghost mt-4 h-10 w-full text-[13px]">
              {t('profile.signOut')}
            </button>
          </>
        ) : (
          <>
            <h2 className="font-display text-[20px] font-bold leading-tight text-tinta">{t('profile.createProfileHeading')}</h2>
            <p className="mt-1 mb-3 text-[13px] leading-relaxed text-tinta/70">
              {t('profile.createProfileBody')}
            </p>
            <AuthForm onSuccess={onAuthSuccess} />
          </>
        )}
      </section>

      <section className="mt-7">
        <h2 className="font-display text-[20px] font-bold leading-tight text-tinta">{t('profile.tasteHeading')}</h2>
        <p className="mt-1 text-[13px] text-tinta/70">
          {t('profile.tasteSubtitle')}
        </p>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('profile.sectionCuisines')}</h2>
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
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('profile.sectionBudget')}</h2>
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
            {t('profile.noPreference')}
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
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('profile.sectionAreas')}</h2>
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
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('profile.sectionDietary')}</h2>
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
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('profile.sectionVibe')}</h2>
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

      <section className="mt-5">
        <div className="flex items-center justify-between rounded-2xl glass px-4 py-3">
          <span className="text-[13px] text-tinta">{t('language.label')}</span>
          <LanguageToggle />
        </div>
      </section>

      {/* Restaurateur dashboard */}
      <section className="mt-7">
        <h2 className="font-display text-[20px] font-bold leading-tight text-tinta">{t('profile.manageHeading')}</h2>
        <p className="mt-1 text-[13px] text-tinta/70">
          {account ? t('profile.manageBodySignedIn') : t('profile.manageBodySignedOut')}
        </p>
      </section>

      {account && (
        <section className="mt-4 flex flex-col gap-4">
          {myRestaurants.map((r) => {
            const d = draftFor(r)
            return (
              <div key={r.slug} className="rounded-2xl glass p-4">
                <h3 className="mb-3 font-display text-[16px] font-bold leading-tight text-tinta">{draftFor(r).name || r.name || r.slug}</h3>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={d.name ?? ''}
                    onChange={(e) => patchDraft(r.slug, { name: e.target.value })}
                    placeholder={t('profile.fieldName')}
                    className="liquid-input w-full rounded-full px-4 py-2 text-[14px] focus:outline-none"
                  />
                  <textarea
                    value={d.description ?? ''}
                    onChange={(e) => patchDraft(r.slug, { description: e.target.value })}
                    placeholder={t('profile.fieldDescription')}
                    rows={3}
                    className="liquid-input w-full rounded-2xl px-4 py-2 text-[14px] focus:outline-none resize-none"
                  />
                  <textarea
                    value={d.descriptionEs ?? ''}
                    onChange={(e) => patchDraft(r.slug, { descriptionEs: e.target.value })}
                    placeholder={t('profile.fieldDescriptionEs')}
                    rows={3}
                    className="liquid-input w-full rounded-2xl px-4 py-2 text-[14px] focus:outline-none resize-none"
                  />
                  <input
                    type="text"
                    value={d.address ?? ''}
                    onChange={(e) => patchDraft(r.slug, { address: e.target.value })}
                    placeholder={t('profile.fieldAddress')}
                    className="liquid-input w-full rounded-full px-4 py-2 text-[14px] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={d.phone ?? ''}
                    onChange={(e) => patchDraft(r.slug, { phone: e.target.value })}
                    placeholder={t('profile.fieldPhone')}
                    className="liquid-input w-full rounded-full px-4 py-2 text-[14px] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={d.instagram ?? ''}
                    onChange={(e) => patchDraft(r.slug, { instagram: e.target.value })}
                    placeholder={t('profile.fieldInstagram')}
                    className="liquid-input w-full rounded-full px-4 py-2 text-[14px] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={d.whatsapp ?? ''}
                    onChange={(e) => patchDraft(r.slug, { whatsapp: e.target.value })}
                    placeholder={t('profile.fieldWhatsapp')}
                    className="liquid-input w-full rounded-full px-4 py-2 text-[14px] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleSave(r)}
                  disabled={savingSlug === r.slug || !editDrafts[r.slug] || !(draftFor(r).name ?? '').trim()}
                  className="btn-lime mt-3 h-10 w-full text-[13px]"
                >
                  {savingSlug === r.slug ? t('auth.working') : t('profile.save')}
                </button>
              </div>
            )
          })}

          {myRestaurants.length === 0 && (
            <p className="text-[13px] text-tinta/70">
              {loadingRestaurants ? t('auth.working') : t('profile.noListings')}
            </p>
          )}

          <div className="rounded-2xl glass p-4">
            <h3 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('profile.claimHeading')}</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={claimSlug}
                onChange={(e) => setClaimSlug(e.target.value)}
                placeholder={t('profile.claimSlugPlaceholder')}
                className="liquid-input flex-1 rounded-full px-4 py-2 text-[14px] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => void handleClaim()}
                disabled={claiming || !claimSlug.trim()}
                className="btn-lime h-10 px-4 text-[13px]"
              >
                {claiming ? t('auth.working') : t('profile.claim')}
              </button>
            </div>
          </div>

          {manageMsg && (
            <p className="text-[12px] text-tinta/70">{manageMsg}</p>
          )}
        </section>
      )}

      <section className="mt-6 rounded-2xl glass p-4">
        <h2 className="text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('profile.weeklyPicksHeading')}</h2>
        <p className="mt-1 text-[13px] text-tinta/70">
          {t('profile.weeklyPicksBody')}
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="email"
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            placeholder={t('profile.emailPlaceholderPicks')}
            className="liquid-input flex-1 rounded-full px-4 py-2 text-[14px] focus:outline-none"
          />
          <button type="button" onClick={submitEmail} className="btn-lime h-10 px-4 text-[13px]" disabled={!emailDraft.trim()}>
            {t('profile.subscribe')}
          </button>
        </div>
        {savedAt && <p className="mt-2 animate-fade-up text-[11px] text-tinta/70">{t('profile.savedAt', { time: savedAt })}</p>}
      </section>
    </AppShell>
  )
}
