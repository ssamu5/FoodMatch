import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import PromptComposer from '../components/PromptComposer'
import { STARTER_CHIPS } from '../lib/foodIntent'
import { track } from '../lib/analytics'

export default function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    track('landing_viewed')
  }, [])

  function handleSubmit(query: string) {
    navigate(`/ask?q=${encodeURIComponent(query)}`)
  }

  return (
    <AppShell>
      <section className="pt-8 sm:pt-12">
        <div className="space-y-3 animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-lime/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-lime ring-1 ring-lime/30">
            <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-soft" />
            Valencia · live
          </span>

          <h1 className="font-display text-[44px] font-bold leading-[0.95] tracking-tight text-cream">
            Tell us what you crave.
            <span className="block text-lime">We find the table.</span>
          </h1>

          <p className="max-w-sm pt-1 text-[15px] leading-relaxed text-ink-200">
            FoodMatch reads your craving, budget, area, and mood, then picks the few restaurants worth your night.
          </p>
        </div>

        <div className="mt-6">
          <PromptComposer
            placeholder="A juicy burger and beer near Ruzafa, under €20"
            starterChips={STARTER_CHIPS}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="mt-6 flex flex-col gap-2 text-[13px] text-ink-200">
          <Link to="/results" className="btn-ghost h-11">
            Browse all restaurants
          </Link>
          <Link to="/restaurants" className="text-center text-ink-200 underline-offset-4 hover:text-cream hover:underline">
            For restaurants &rarr;
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink-300">How it works</h2>
        <ol className="space-y-3 text-[14px] text-cream">
          <li className="rounded-2xl glass p-4">
            <span className="font-mono text-lime">01.</span> Describe what you want, the way you'd say it to a friend.
          </li>
          <li className="rounded-2xl glass p-4">
            <span className="font-mono text-lime">02.</span> FoodMatch parses your craving and ranks Valencia restaurants for you.
          </li>
          <li className="rounded-2xl glass p-4">
            <span className="font-mono text-lime">03.</span> You see a clear best match, a short shortlist, and a reason for each pick.
          </li>
        </ol>
      </section>
    </AppShell>
  )
}
