import { useState, type FormEvent } from 'react'
import { useT } from '../lib/i18n'
import { activeProvider, login, register, type AuthUser } from '../lib/auth'
import { track } from '../lib/analytics'

type Mode = 'signin' | 'signup'

interface Props {
  // Which tab to show first. Defaults to signup (the common first-run path).
  initialMode?: Mode
  onSuccess: (user: AuthUser) => void
  // Compact variant trims helper text for tight surfaces (e.g. Profile card).
  compact?: boolean
}

// Maps an auth error code (from lib/auth) to a localized message. Unknown codes
// (e.g. raw Supabase messages) fall through to a generic error.
function errorMessage(t: (k: string) => string, code: string): string {
  const known = new Set([
    'nameRequired',
    'invalidEmail',
    'tooShort',
    'emailTaken',
    'passwordRequired',
    'invalidCredentials',
  ])
  return known.has(code) ? t(`auth.error.${code}`) : t('auth.error.generic')
}

export default function AuthForm({ initialMode = 'signup', onSuccess, compact = false }: Props) {
  const { t } = useT()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const isSignup = mode === 'signup'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      const result = isSignup
        ? await register({ email, password, displayName: name })
        : await login({ email, password })
      if (!result.ok) {
        // Supabase signup with email confirmation: this is a success path, not
        // an error. Show a positive "check your inbox" notice.
        if (result.error === 'confirmEmail') {
          setNotice(t('auth.confirmEmail'))
          return
        }
        setError(errorMessage(t, result.error))
        return
      }
      track(isSignup ? 'account_created' : 'account_signed_in', {
        provider: activeProvider(),
        hasEmail: Boolean(result.user.email),
        source: 'auth_form',
      })
      onSuccess(result.user)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {/* Tab switcher */}
      <div className="mb-3 inline-flex rounded-full bg-creamy/70 p-1 ring-1 ring-tinta/10">
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(null) }}
          className={[
            'rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition',
            isSignup ? 'bg-surface text-tinta shadow-soft' : 'text-tinta/55',
          ].join(' ')}
        >
          {t('auth.tabSignup')}
        </button>
        <button
          type="button"
          onClick={() => { setMode('signin'); setError(null) }}
          className={[
            'rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition',
            !isSignup ? 'bg-surface text-tinta shadow-soft' : 'text-tinta/55',
          ].join(' ')}
        >
          {t('auth.tabSignin')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2" noValidate>
        {isSignup && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('auth.namePlaceholder')}
            autoComplete="name"
            className="liquid-input w-full rounded-2xl px-3.5 py-3 text-[15px]"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.emailPlaceholder')}
          autoComplete="email"
          inputMode="email"
          className="liquid-input w-full rounded-2xl px-3.5 py-3 text-[15px]"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('auth.passwordPlaceholder')}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          className="liquid-input w-full rounded-2xl px-3.5 py-3 text-[15px]"
        />

        {error && (
          <p role="alert" className="rounded-xl bg-tomate/10 px-3 py-2 text-[12px] text-tomateDeep">
            {error}
          </p>
        )}

        {notice && (
          <p role="status" className="rounded-xl bg-fresco/12 px-3 py-2 text-[12px] text-fresco">
            {notice}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-tomate h-12 w-full text-[15px]">
          {busy ? t('auth.working') : isSignup ? t('auth.createButton') : t('auth.signinButton')}
        </button>
      </form>

      {!compact && (
        <p className="mt-2 text-[11px] leading-relaxed text-tinta/50">
          {activeProvider() === 'supabase' ? t('auth.noteSupabase') : t('auth.noteDemo')}
        </p>
      )}
    </div>
  )
}
