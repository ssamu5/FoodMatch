import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccount, markWelcomeSeen, saveAccount } from '../lib/storage'
import { api } from '../lib/api'
import { track } from '../lib/analytics'
import type { Account } from '../types/profile'

// First-run welcome + lightweight sign-in. Shown once (see hasSeenWelcome).
// Not real auth: a local on-device profile so the app feels like a product
// and saves/greetings personalise. Real accounts + sync come later.
export default function Welcome() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'intro' | 'signup'>('intro')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  function finish() {
    markWelcomeSeen()
    navigate('/', { replace: true })
  }

  function skip() {
    track('account_signed_out', { reason: 'skipped_welcome' })
    finish()
  }

  function createAccount() {
    const displayName = name.trim()
    if (!displayName) return
    const acct: Account = {
      displayName,
      email: email.trim() || null,
      createdAt: new Date().toISOString(),
    }
    saveAccount(acct)
    track('account_created', { hasEmail: Boolean(acct.email), source: 'welcome' })
    if (acct.email) {
      api.submitUserLead({ email: acct.email, source: 'other' })
      track('user_lead_submitted', { source: 'welcome' })
    }
    finish()
  }

  // Already signed in (e.g. navigated here manually): bounce home.
  if (getAccount()) {
    finish()
    return null
  }

  return (
    <div className="relative min-h-full">
      <main className="relative z-10 mx-auto flex min-h-full max-w-md flex-col px-6 pb-10 pt-16 safe-top">
        {/* brand */}
        <div className="animate-fade-up">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-tomate font-display text-[24px] font-bold text-cream shadow-warm">
            <span>f</span><span className="italic">m</span>
          </span>
          <h1 className="mt-5 font-display text-[40px] font-bold leading-[0.98] tracking-tight text-tinta">
            Bienvenido a<br />
            food<span className="italic text-tomate">match</span>.
          </h1>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-tinta/75">
            Tu asistente para encontrar dónde comer en Valencia. Dile a Foody qué te apetece y te lleva a la mesa que encaja.
          </p>
        </div>

        {step === 'intro' ? (
          <div className="mt-8 space-y-3 animate-fade-up">
            <div className="space-y-2.5">
              {[
                ['Buscas por antojo', 'Hamburguesa cerca de Ruzafa, menú del día, cena romántica...'],
                ['Foody elige por ti', 'La mejor opción y una lista corta, con el porqué de cada una.'],
                ['Guarda y reserva', 'Guarda tus sitios y reserva o pide por WhatsApp en un toque.'],
              ].map(([title, body], i) => (
                <div key={title} className="flex gap-3 rounded-2xl glass p-3.5">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tomate/12 text-[12px] font-bold text-tomate">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-tinta">{title}</p>
                    <p className="text-[12px] leading-relaxed text-tinta/65">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button onClick={() => setStep('signup')} className="btn-tomate h-12 w-full text-[15px]">
                Crear mi perfil
              </button>
              <button onClick={skip} className="mt-2 h-11 w-full text-[13px] text-tinta/60 hover:text-tinta">
                Entrar sin perfil
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 animate-fade-up">
            <div className="rounded-3xl glass p-5">
              <h2 className="font-display text-[20px] font-bold text-tinta">Crea tu perfil</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-tinta/65">
                Para guardar tus sitios y recibir mejores recomendaciones. Sin contraseña: se queda en este dispositivo durante el piloto.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  createAccount()
                }}
                className="mt-3 space-y-2"
              >
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="liquid-input w-full rounded-2xl px-3.5 py-3 text-[15px]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (opcional)"
                  className="liquid-input w-full rounded-2xl px-3.5 py-3 text-[15px]"
                />
                <button type="submit" disabled={!name.trim()} className="btn-tomate h-12 w-full text-[15px]">
                  Empezar
                </button>
              </form>
            </div>
            <button onClick={() => setStep('intro')} className="mt-3 h-11 w-full text-[13px] text-tinta/60 hover:text-tinta">
              &larr; Atrás
            </button>
          </div>
        )}

        <div className="flex-1" />
        <p className="pt-6 text-center text-[11px] text-tinta/45">
          Piloto en Valencia · sin compromiso
        </p>
      </main>
    </div>
  )
}
