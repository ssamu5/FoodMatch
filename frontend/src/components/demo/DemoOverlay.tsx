import { useEffect, useState } from 'react'
import { useT } from '../../lib/i18n'
import { useDemo } from '../../lib/demo/DemoContext'
import { DEMO_STEPS } from '../../lib/demo/demoScript'

// A fixed, non-blocking caption card that narrates the guided tour over the real
// app. The wrapper is pointer-events-none so the app stays fully clickable; only
// the card captures clicks. The card is placed on the opposite side of the
// spotlighted element so it never covers it, and the target gets a ring.
export default function DemoOverlay() {
  const { active, stepIndex, total, next, back, exit } = useDemo()
  const { t } = useT()
  const step = active ? DEMO_STEPS[stepIndex] : undefined
  const spotlight = step?.spotlight
  const [cardAtTop, setCardAtTop] = useState(false)

  useEffect(() => {
    if (!active) return
    if (!spotlight) {
      setCardAtTop(false)
      return
    }
    let current: Element | null = null
    let tries = 0
    const id = window.setInterval(() => {
      const node = document.querySelector(spotlight)
      if (node !== current) {
        current?.classList.remove('demo-spotlight')
        current = node
        if (current) {
          current.classList.add('demo-spotlight')
          current.scrollIntoView({ block: 'center', behavior: 'smooth' })
          // After the scroll settles, drop the caption card on the side away from
          // the target so the ringed control stays visible and tappable.
          const el = current
          window.setTimeout(() => {
            const r = el.getBoundingClientRect()
            setCardAtTop(r.top > window.innerHeight * 0.45)
          }, 350)
        }
      }
      if (++tries > 25) window.clearInterval(id)
    }, 200)
    return () => {
      window.clearInterval(id)
      current?.classList.remove('demo-spotlight')
    }
  }, [active, spotlight, stepIndex])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') back()
      else if (e.key === 'Escape') exit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, next, back, exit])

  if (!active || !step) return null
  const isLast = stepIndex === total - 1
  const position = cardAtTop
    ? 'top-0 pt-[max(1rem,env(safe-area-inset-top))]'
    : 'bottom-0 pb-[max(1rem,env(safe-area-inset-bottom))]'

  return (
    <div className={`pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 ${position}`}>
      <div className="pointer-events-auto w-full max-w-md rounded-3xl glass p-4 shadow-stampLg">
        <div className="mb-2.5 flex items-center gap-1.5">
          {DEMO_STEPS.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 rounded-full transition-all ${i === stepIndex ? 'w-5 bg-tomate' : 'w-1.5 bg-tinta/20'}`}
            />
          ))}
          <span className="ml-auto text-[11px] font-semibold uppercase tracking-[0.14em] text-tinta/45">
            {t('demo.label')}
          </span>
        </div>
        <h3 className="font-display text-[18px] font-bold leading-tight text-tinta">
          {t(`demo.${step.id}.title`)}
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed text-tinta/70">{t(`demo.${step.id}.body`)}</p>
        <div className="mt-3.5 flex items-center gap-2">
          <button
            onClick={exit}
            className="text-[12px] font-medium text-tinta/50 transition-colors hover:text-tinta focus-visible:outline-none focus-visible:underline"
          >
            {t('demo.exit')}
          </button>
          <div className="ml-auto flex items-center gap-2">
            {stepIndex > 0 && (
              <button onClick={back} className="btn-ghost px-4 text-[13px]">
                {t('demo.back')}
              </button>
            )}
            <button onClick={next} className="btn-tomate px-5 text-[13px]">
              {isLast ? t('demo.finish') : t('demo.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
