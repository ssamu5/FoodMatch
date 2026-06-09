import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import PromptComposer from '../components/PromptComposer'
import { getAccount } from '../lib/storage'
import { track } from '../lib/analytics'
import { useT } from '../lib/i18n'

export default function Home() {
  const navigate = useNavigate()
  const account = getAccount()
  const { t } = useT()

  useEffect(() => {
    track('landing_viewed')
  }, [])

  function handleSubmit(query: string) {
    navigate(`/ask?q=${encodeURIComponent(query)}`)
  }

  const starterChips = [
    { label: t('home.chipDinner'), query: 'Dinner under €20' },
    { label: t('home.chipDate'), query: 'Date night sushi' },
    { label: t('home.chipHealthy'), query: 'Healthy lunch near me' },
    { label: t('home.chipGroup'), query: 'Group dinner tonight' },
  ]

  return (
    <AppShell hideNav>
      <section className="pt-10 sm:pt-14">
        <div className="space-y-4 animate-fade-up">
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-tomate">
            {t('home.city')}
          </span>

          <h1 className="font-display text-[44px] font-bold leading-[0.96] tracking-tight text-tinta">
            {account ? t('home.heroGreeting', { name: account.displayName }) : t('home.heroTitle')}
            <span className="block italic font-light text-tomate">{t('home.heroSub')}</span>
          </h1>

          <p className="max-w-sm text-[15px] leading-relaxed text-tinta/70">
            {t('home.heroDesc')}
          </p>
        </div>

        <div className="mt-7">
          <PromptComposer
            placeholder={t('home.placeholder')}
            starterChips={starterChips}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="mt-6 flex items-center justify-between text-[13px]">
          <Link to="/results" className="font-medium text-tinta underline-offset-4 hover:underline">
            {t('home.browseAll')}
          </Link>
          <Link to="/restaurants" className="text-tinta/55 underline-offset-4 hover:text-tinta hover:underline">
            {t('common.forRestaurants')} &rarr;
          </Link>
        </div>
      </section>
    </AppShell>
  )
}
