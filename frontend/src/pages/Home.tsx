import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import PromptComposer from '../components/PromptComposer'
import { STARTER_CHIPS } from '../lib/foodIntent'
import { getAccount } from '../lib/storage'
import { track } from '../lib/analytics'

const TRUST_SIGNALS = [
  {
    title: 'Valencia-first',
    copy: 'Focused on one city, one habit: matching hungry people with the right table faster.',
  },
  {
    title: 'Validation-led',
    copy: 'Every search, save, WhatsApp tap, and restaurant lead becomes evidence for what diners actually want.',
  },
  {
    title: 'Restaurant-ready',
    copy: 'A clean partner flow for early restaurants to join the pilot without commissions or marketplace noise.',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const account = getAccount()

  useEffect(() => {
    track('landing_viewed')
  }, [])

  function handleSubmit(query: string) {
    navigate(`/ask?q=${encodeURIComponent(query)}`)
  }

  return (
    <AppShell hideNav>
      <section className="pt-8 sm:pt-12">
        <div className="space-y-3 animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-tomate/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-tomate ring-1 ring-tomate/40">
            <span className="h-1.5 w-1.5 rounded-full bg-tomate animate-pulse-soft" />
            FoodMatch · Valencia pilot
          </span>

          <h1 className="font-display text-[46px] font-bold leading-[0.95] tracking-tight text-tinta">
            Tell us what you crave.
            <span className="block italic font-light text-tomate">We find the table.</span>
          </h1>

          <p className="max-w-sm pt-1 text-[15px] leading-relaxed text-tinta/75">
            {account ? (
              <>
                <span className="font-semibold text-tinta">Hola, {account.displayName}.</span> Tell FoodMatch the moment and it returns the few Valencia places that actually fit.
              </>
            ) : (
              <>
                <span className="font-semibold text-tinta">FoodMatch</span> is a polished restaurant discovery assistant for Valencia: diners describe the moment, FoodMatch returns the few places that actually fit.
              </>
            )}
          </p>
        </div>

        <div className="mt-6">
          <PromptComposer
            placeholder="A juicy burger and beer near Ruzafa, under €20"
            starterChips={STARTER_CHIPS}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 text-[13px] text-tinta/70 sm:grid-cols-2">
          <Link to="/results" className="btn-ghost h-11">
            Browse Valencia restaurants
          </Link>
          <Link to="/restaurants" className="btn-ghost h-11">
            Join as a restaurant
          </Link>
        </div>
      </section>

      <div className="squiggle my-10" aria-hidden="true" />

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-tinta/55">Why it feels different</h2>
          <span className="text-[11px] font-semibold text-tomate">Built to validate demand</span>
        </div>
        <ol className="space-y-3 text-[14px] text-tinta">
          <li className="rounded-2xl glass p-4">
            <span className="display italic text-tomate text-[18px] mr-1">i.</span> Describe what you want, the way you'd say it to a friend.
          </li>
          <li className="rounded-2xl glass p-4">
            <span className="display italic text-mostaza text-[18px] mr-1">ii.</span> FoodMatch parses craving, budget, area, vibe, and dietary hints.
          </li>
          <li className="rounded-2xl glass p-4">
            <span className="display italic text-fresco text-[18px] mr-1">iii.</span> You get a clear best match, a short shortlist, and a reason for each pick.
          </li>
        </ol>
      </section>

      <section className="mt-8 rounded-3xl stamp-card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tomate">Professional pilot</p>
        <h2 className="mt-2 font-display text-[25px] font-bold leading-tight text-tinta">
          Built for restaurant conversations, not just a demo screen.
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-tinta/75">
          The product is intentionally narrow: prove that Valencia diners will search by craving and that restaurants want qualified discovery before scaling to more cities.
        </p>
        <div className="mt-4 space-y-2">
          {TRUST_SIGNALS.map((signal) => (
            <div key={signal.title} className="rounded-2xl bg-creamy/60 p-3 ring-1 ring-tinta/10">
              <h3 className="text-[13px] font-semibold text-tinta">{signal.title}</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-tinta/70">{signal.copy}</p>
            </div>
          ))}
        </div>
        <Link to="/restaurants" className="btn-lime mt-5 h-11 w-full text-[13px]">
          See the restaurant pilot →
        </Link>
      </section>
    </AppShell>
  )
}
