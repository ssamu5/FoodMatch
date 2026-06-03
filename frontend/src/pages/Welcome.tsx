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
  const [step, setStep] = useState<'role' | 'intro' | 'signup'>('role')
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

  function chooseDiner() {
    track('onboarding_step', { field: 'role', answered: true })
    setStep('intro')
  }

  function chooseRestaurant() {
    track('onboarding_step', { field: 'role', answered: true })
    markWelcomeSeen()
    navigate('/restaurants', { replace: true })
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
            {step === 'role'
              ? 'Descubre dónde comer en Valencia, y ayuda a los restaurantes locales a que los encuentren.'
              : 'Tu asistente para encontrar dónde comer en Valencia. Dile a Foody qué te apetece y te lleva a la mesa que encaja.'}
          </p>
        </div>

        {step === 'role' ? (
          <div className="mt-9 animate-fade-up">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-tinta/45">
              ¿Cómo usas FoodMatch?
            </p>
            <div className="mt-3 space-y-3">
              <button
                onClick={chooseDiner}
                className="flex w-full items-center gap-4 rounded-3xl border border-tinta/10 bg-surface p-4 text-left shadow-soft transition hover:shadow-softMd active:scale-[0.99]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-tomate/12 text-tomate">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true"><path d="M6 3v6a2 2 0 0 0 2 2v10M6 3v6M9 3v6M18 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4v9" /></svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[18px] font-bold text-tinta">Quiero comer fuera</span>
                  <span className="block text-[13px] text-tinta/60">Descubre tu próximo sitio en Valencia.</span>
                </span>
                <span aria-hidden="true" className="text-[18px] text-tinta/40">→</span>
              </button>

              <button
                onClick={chooseRestaurant}
                className="flex w-full items-center gap-4 rounded-3xl border border-tinta/10 bg-surface p-4 text-left shadow-soft transition hover:shadow-softMd active:scale-[0.99]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-azulejo/12 text-azulejo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true"><path d="M3 9 4.5 4h15L21 9M4 9v10h16V9M4 9h16M9 19v-5h6v5" /></svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[18px] font-bold text-tinta">Tengo un restaurante</span>
                  <span className="block text-[13px] text-tinta/60">Que te encuentren los clientes correctos.</span>
                </span>
                <span aria-hidden="true" className="text-[18px] text-tinta/40">→</span>
              </button>
            </div>
          </div>
        ) : step === 'intro' ? (
          <div className="mt-10 animate-fade-up">
            <ul className="space-y-3.5">
              {[
                ['Buscas por antojo', 'Dilo como a un amigo: "hamburguesa por Ruzafa, menú del día, cena tranquila".'],
                ['Foody elige por ti', 'La mejor opción y una lista corta, con el porqué de cada una.'],
                ['Guarda y reserva', 'Guarda tus sitios y reserva por WhatsApp en un toque.'],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-tomate" aria-hidden="true" />
                  <div>
                    <p className="text-[15px] font-semibold text-tinta">{title}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-tinta/60">{body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-9">
              <button onClick={() => setStep('signup')} className="btn-tomate h-12 w-full text-[15px]">
                Crear mi perfil
              </button>
              <button onClick={skip} className="mt-2 h-11 w-full text-[13px] text-tinta/55 hover:text-tinta">
                Entrar sin perfil
              </button>
              <button onClick={() => setStep('role')} className="mt-1 h-9 w-full text-[12px] text-tinta/40 hover:text-tinta">
                &larr; Atrás
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
