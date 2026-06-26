import { useNavigate } from 'react-router-dom'
import { markWelcomeSeen } from '../lib/storage'
import { useDemo } from '../lib/demo/DemoContext'
import { useT } from '../lib/i18n'
import LanguageToggle from '../components/LanguageToggle'
import ThemeToggle from '../components/ThemeToggle'

// Investor-framed entry to the guided demo (route: /demo). "Start" enters demo
// mode and drops into the real app at the first beat; "Explore on my own" skips
// the guide but still opens the working app.
export default function DemoIntro() {
  const navigate = useNavigate()
  const { enter } = useDemo()
  const { t } = useT()

  function skip() {
    markWelcomeSeen()
    navigate('/', { replace: true })
  }

  return (
    <div className="relative min-h-full">
      <main className="relative z-10 mx-auto flex min-h-full max-w-md flex-col px-6 pb-10 pt-16 safe-top">
        <div className="flex items-center justify-between animate-fade-up">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-tomate font-display text-[24px] font-bold text-cream shadow-warm">
            <span>f</span>
            <span className="italic">m</span>
          </span>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-10 animate-fade-up">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-tomate">
            {t('demo.introEyebrow')}
          </p>
          <h1 className="mt-3 font-display text-[34px] font-bold leading-[1.04] tracking-tight text-tinta">
            {t('demo.introTitle')}
          </h1>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-tinta/75">
            {t('demo.introBody')}
          </p>
        </div>

        <div className="flex-1" />

        <div className="animate-fade-up">
          <button onClick={enter} className="btn-tomate h-12 w-full text-[15px]">
            {t('demo.introStart')}
          </button>
          <button
            onClick={skip}
            className="mt-2 h-11 w-full text-[13px] text-tinta/55 transition-colors hover:text-tinta"
          >
            {t('demo.introSkip')}
          </button>
        </div>
      </main>
    </div>
  )
}
