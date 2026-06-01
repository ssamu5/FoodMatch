import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import PromptComposer from '../components/PromptComposer'
import { STARTER_CHIPS } from '../lib/foodIntent'
import { getAccount } from '../lib/storage'
import { track } from '../lib/analytics'

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
      <section className="pt-10 sm:pt-14">
        <div className="space-y-4 animate-fade-up">
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-tomate">
            Valencia
          </span>

          <h1 className="font-display text-[44px] font-bold leading-[0.96] tracking-tight text-tinta">
            {account ? `Hola, ${account.displayName}.` : 'Tell us what you crave.'}
            <span className="block italic font-light text-tomate">We find the table.</span>
          </h1>

          <p className="max-w-sm text-[15px] leading-relaxed text-tinta/70">
            Describe the moment the way you would to a friend. Foody returns the few spots that fit.
          </p>
        </div>

        <div className="mt-7">
          <PromptComposer
            placeholder="A juicy burger and beer near Ruzafa, under €20"
            starterChips={STARTER_CHIPS}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="mt-6 flex items-center justify-between text-[13px]">
          <Link to="/results" className="font-medium text-tinta underline-offset-4 hover:underline">
            Browse all restaurants
          </Link>
          <Link to="/restaurants" className="text-tinta/55 underline-offset-4 hover:text-tinta hover:underline">
            For restaurants →
          </Link>
        </div>
      </section>
    </AppShell>
  )
}
