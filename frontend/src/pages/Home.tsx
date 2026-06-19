import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import PromptComposer from '../components/PromptComposer'
import { getAccount } from '../lib/storage'
import { track } from '../lib/analytics'
import { useT, useLang } from '../lib/i18n'

// Per-language queries for suggestion chips. Spanish queries parse correctly
// via foodIntent.ts which already understands Spanish keywords.
const CHIP_QUERIES: Record<string, string[]> = {
  es: [
    'Cena por menos de 20 euros',
    'Cena romántica sushi',
    'Almuerzo sano cerca de mí',
    'Cena en grupo esta noche',
  ],
  en: [
    'Dinner under €20',
    'Date night sushi',
    'Healthy lunch near me',
    'Group dinner tonight',
  ],
}

export default function Home() {
  const navigate = useNavigate()
  const account = getAccount()
  const { t } = useT()
  const { lang } = useLang()

  useEffect(() => {
    track('landing_viewed')
  }, [])

  function handleSubmit(query: string) {
    navigate(`/ask?q=${encodeURIComponent(query)}`)
  }

  const queries = CHIP_QUERIES[lang] ?? CHIP_QUERIES.es
  const starterChips = [
    { label: t('home.chipDinner'), query: queries[0] },
    { label: t('home.chipDate'), query: queries[1] },
    { label: t('home.chipHealthy'), query: queries[2] },
    { label: t('home.chipGroup'), query: queries[3] },
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
            {t('common.forRestaurants')} <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>
    </AppShell>
  )
}
