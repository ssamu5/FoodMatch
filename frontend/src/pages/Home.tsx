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
          <span className="inline-flex items-center gap-2 rounded-full bg-tomate/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-tomate ring-1 ring-tomate/40">
            <span className="h-1.5 w-1.5 rounded-full bg-tomate animate-pulse-soft" />
            Foody · Valencia
          </span>

          <h1 className="font-display text-[46px] font-bold leading-[0.95] tracking-tight text-tinta">
            Tell us what you crave.
            <span className="block italic font-light text-tomate">We find the table.</span>
          </h1>

          <p className="max-w-sm pt-1 text-[15px] leading-relaxed text-tinta/70">
            Hey, I'm <span className="font-semibold text-tinta">Foody</span>. Tell me your craving, budget, area, and vibe. I pick the few Valencia spots worth your night.
          </p>
        </div>

        <div className="mt-6">
          <PromptComposer
            placeholder="A juicy burger and beer near Ruzafa, under €20"
            starterChips={STARTER_CHIPS}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="mt-6 flex flex-col gap-2 text-[13px] text-tinta/70">
          <Link to="/results" className="btn-ghost h-11">
            Browse all restaurants
          </Link>
          <Link to="/restaurants" className="text-center text-tinta/70 underline-offset-4 hover:text-tinta hover:underline">
            For restaurants &rarr;
          </Link>
        </div>
      </section>

      <div className="squiggle my-10" aria-hidden="true" />

      <section>
        <h2 className="mb-3 text-[11px] uppercase tracking-[0.15em] text-tinta/55">How it works</h2>
        <ol className="space-y-3 text-[14px] text-tinta">
          <li className="rounded-2xl glass p-4">
            <span className="display italic text-tomate text-[18px] mr-1">i.</span> Describe what you want, the way you'd say it to a friend.
          </li>
          <li className="rounded-2xl glass p-4">
            <span className="display italic text-mostaza text-[18px] mr-1">ii.</span> FoodMatch parses your craving and ranks Valencia restaurants for you.
          </li>
          <li className="rounded-2xl glass p-4">
            <span className="display italic text-fresco text-[18px] mr-1">iii.</span> You see a clear best match, a short shortlist, and a reason for each pick.
          </li>
        </ol>
      </section>
    </AppShell>
  )
}
