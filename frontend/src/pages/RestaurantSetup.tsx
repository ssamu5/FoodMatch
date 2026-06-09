import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { api } from '../lib/api'
import { track } from '../lib/analytics'
import { openExternal } from '../lib/native'
import { useT } from '../lib/i18n'

const FOODMATCH_EMAIL = 'hola@foodmatch.es'

// A guided, conversational onboarding for restaurant owners. Designed for
// non-technical users: one question at a time, tap-to-answer chips wherever
// possible, plain Spanish, and an "almost done for you" feeling. It collects
// the same RestaurantLead the classic form does, plus a few extras.

type FieldKey =
  | 'restaurantName'
  | 'area'
  | 'cuisine'
  | 'priceBand'
  | 'ownerName'
  | 'phone'
  | 'email'
  | 'instagramOrWebsite'
  | 'menuLink'
  | 'hasPhotos'

interface StepOption {
  // The value committed to state and sent to the API (always the original Spanish string).
  value: string
  // The i18n key used to look up the translated display label.
  labelKey: string
}

interface Step {
  key: FieldKey
  // i18n key for Foody's message.
  askKey: string
  // Whether ask() needs dynamic data interpolation ({name} etc.).
  askVars?: (data: Partial<Record<FieldKey, string>>) => Record<string, string>
  placeholderKey?: string
  options?: StepOption[]
  optional?: boolean
  allowFreeText?: boolean
  kind?: 'text' | 'email' | 'tel' | 'url'
}

// Option lists: value is always the original Spanish string (committed to state
// and API); labelKey resolves the translated display label.
const AREA_OPTIONS: StepOption[] = [
  { value: 'Ruzafa', labelKey: 'setup.optionAreaRuzafa' },
  { value: 'El Carmen', labelKey: 'setup.optionAreaCarmen' },
  { value: 'Cánovas', labelKey: 'setup.optionAreaCanovas' },
  { value: 'Benimaclet', labelKey: 'setup.optionAreaBenimaclet' },
  { value: 'Centro', labelKey: 'setup.optionAreaCentro' },
  { value: 'Marina / playa', labelKey: 'setup.optionAreaMarina' },
  { value: 'Otra zona', labelKey: 'setup.optionAreaOther' },
]

const CUISINE_OPTIONS: StepOption[] = [
  { value: 'Tapas', labelKey: 'setup.optionCuisineTapas' },
  { value: 'Arroces / paella', labelKey: 'setup.optionCuisineArroces' },
  { value: 'Menú del día', labelKey: 'setup.optionCuisineMenu' },
  { value: 'Hamburguesas', labelKey: 'setup.optionCuisineHamburguesas' },
  { value: 'Pizza', labelKey: 'setup.optionCuisinePizza' },
  { value: 'Sushi', labelKey: 'setup.optionCuisineSushi' },
  { value: 'Brunch', labelKey: 'setup.optionCuisineBrunch' },
  { value: 'Cafetería', labelKey: 'setup.optionCuisineCafeteria' },
  { value: 'Bar', labelKey: 'setup.optionCuisineBar' },
  { value: 'Saludable', labelKey: 'setup.optionCuisineSaludable' },
  { value: 'Mexicana', labelKey: 'setup.optionCuisineMexicana' },
  { value: 'Otra', labelKey: 'setup.optionCuisineOther' },
]

const PRICE_BAND_OPTIONS: StepOption[] = [
  { value: '€ (hasta 15)', labelKey: 'setup.optionPrice1' },
  { value: '€€ (15-30)', labelKey: 'setup.optionPrice2' },
  { value: '€€€ (30-50)', labelKey: 'setup.optionPrice3' },
  { value: '€€€€ (50+)', labelKey: 'setup.optionPrice4' },
]

const PHOTOS_OPTIONS: StepOption[] = [
  { value: 'Sí, usad nuestras fotos', labelKey: 'setup.optionPhotosYes' },
  { value: 'Prefiero enviarlas yo', labelKey: 'setup.optionPhotosMe' },
  { value: 'Todavía no tengo', labelKey: 'setup.optionPhotosNo' },
]

const STEPS: Step[] = [
  {
    key: 'restaurantName',
    askKey: 'setup.step1Ask',
    placeholderKey: 'setup.placeholderRestaurantName',
  },
  {
    key: 'area',
    askKey: 'setup.step2Ask',
    askVars: (d) => ({ name: d.restaurantName || '' }),
    options: AREA_OPTIONS,
    allowFreeText: true,
    placeholderKey: 'setup.placeholderArea',
  },
  {
    key: 'cuisine',
    askKey: 'setup.step3Ask',
    options: CUISINE_OPTIONS,
    allowFreeText: true,
    placeholderKey: 'setup.placeholderCuisine',
  },
  {
    key: 'priceBand',
    askKey: 'setup.step4Ask',
    options: PRICE_BAND_OPTIONS,
  },
  {
    key: 'ownerName',
    askKey: 'setup.step5Ask',
    placeholderKey: 'setup.placeholderOwnerName',
  },
  {
    key: 'phone',
    askKey: 'setup.step6Ask',
    askVars: (d) => ({ name: d.ownerName || '' }),
    placeholderKey: 'setup.placeholderPhone',
    kind: 'tel',
  },
  {
    key: 'email',
    askKey: 'setup.step7Ask',
    placeholderKey: 'setup.placeholderEmail',
    kind: 'email',
  },
  {
    key: 'instagramOrWebsite',
    askKey: 'setup.step8Ask',
    placeholderKey: 'setup.placeholderInstagram',
    optional: true,
  },
  {
    key: 'menuLink',
    askKey: 'setup.step9Ask',
    placeholderKey: 'setup.placeholderMenuLink',
    optional: true,
    kind: 'url',
  },
  {
    key: 'hasPhotos',
    askKey: 'setup.step10Ask',
    options: PHOTOS_OPTIONS,
  },
]

interface ChatLine {
  from: 'foody' | 'user'
  text: string
}

export default function RestaurantSetup() {
  const navigate = useNavigate()
  const { t } = useT()

  const [stepIdx, setStepIdx] = useState(0)
  const [data, setData] = useState<Partial<Record<FieldKey, string>>>({})
  const [input, setInput] = useState('')
  const [done, setDone] = useState(false)
  const [lines, setLines] = useState<ChatLine[]>([
    { from: 'foody', text: t('setup.step1Ask') },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    track('onboarding_started')
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [lines, done])

  const step = STEPS[stepIdx]
  const progress = Math.round((stepIdx / STEPS.length) * 100)

  function resolveAsk(s: Step, currentData: Partial<Record<FieldKey, string>>): string {
    const vars = s.askVars ? s.askVars(currentData) : undefined
    return vars ? t(s.askKey, vars) : t(s.askKey)
  }

  function commit(rawValue: string) {
    const value = rawValue.trim()
    if (!value && !step.optional) return

    const display = value || t('setup.skipLater')
    const nextData = { ...data, [step.key]: value }
    setData(nextData)
    setLines((l) => [...l, { from: 'user', text: display }])
    track('onboarding_step', { field: step.key, answered: Boolean(value) })
    setInput('')

    const nextIdx = stepIdx + 1
    if (nextIdx >= STEPS.length) {
      finish(nextData)
      return
    }
    // Foody asks the next question (tiny delay reads as "typing").
    setStepIdx(nextIdx)
    window.setTimeout(() => {
      setLines((l) => [...l, { from: 'foody', text: resolveAsk(STEPS[nextIdx], nextData) }])
    }, 280)
  }

  function finish(finalData: Partial<Record<FieldKey, string>>) {
    const hasPhotos = (finalData.hasPhotos || '').toLowerCase().startsWith('sí')
    api.submitRestaurantLead({
      restaurantName: finalData.restaurantName || '',
      ownerName: finalData.ownerName || '',
      email: finalData.email || '',
      phone: finalData.phone || '',
      instagramOrWebsite: finalData.instagramOrWebsite || undefined,
      area: finalData.area || '',
      city: 'Valencia',
      cuisine: finalData.cuisine || undefined,
      priceBand: finalData.priceBand || undefined,
      menuLink: finalData.menuLink || undefined,
      hasPhotos,
      source: 'assistant',
      message: 'Onboarding via Foody assistant',
    })
    track('onboarding_completed', {
      area: finalData.area,
      cuisine: finalData.cuisine,
      hasPhotos,
    })
    setLines((l) => [
      ...l,
      {
        from: 'foody',
        text: t('setup.finishMessage', {
          ownerName: finalData.ownerName || '',
          restaurantName: finalData.restaurantName || 'tu restaurante',
        }),
      },
    ])
    setDone(true)
  }

  function sendWhatsAppRecap() {
    const text = encodeURIComponent(
      [
        'Hola FoodMatch, acabo de registrar mi restaurante con Foody:',
        `Restaurante: ${data.restaurantName || ''}`,
        `Zona: ${data.area || ''}`,
        `Comida: ${data.cuisine || ''}`,
        `Contacto: ${data.ownerName || ''} ${data.phone || ''}`,
      ].join('\n'),
    )
    openExternal(`https://wa.me/?text=${text}`)
  }

  const reviewRows = useMemo(
    () =>
      [
        [t('setup.reviewLabelRestaurant'), data.restaurantName],
        [t('setup.reviewLabelArea'), data.area],
        [t('setup.reviewLabelCuisine'), data.cuisine],
        [t('setup.reviewLabelPrice'), data.priceBand],
        [t('setup.reviewLabelContact'), [data.ownerName, data.phone].filter(Boolean).join(' · ')],
        [t('setup.reviewLabelEmail'), data.email],
        [t('setup.reviewLabelInstagram'), data.instagramOrWebsite],
        [t('setup.reviewLabelMenu'), data.menuLink],
      ].filter(([, v]) => Boolean(v)) as Array<[string, string]>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, t],
  )

  return (
    <AppShell hideNav>
      {/* header */}
      <section className="pt-2">
        <div className="flex items-center justify-between">
          <Link to="/restaurants" className="text-[13px] text-tinta/60 hover:text-tinta">
            &larr; {t('setup.back')}
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-tomate">
            <span className="h-1.5 w-1.5 rounded-full bg-tomate animate-pulse-soft" />
            {t('setup.foodyLabel')}
          </span>
        </div>
        {/* progress bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-tinta/10">
          <div
            className="h-full rounded-full bg-tomate transition-all duration-500"
            style={{ width: `${done ? 100 : progress}%` }}
          />
        </div>
      </section>

      {/* chat */}
      <section ref={scrollRef} className="mt-4 max-h-[58vh] space-y-3 overflow-y-auto pb-2">
        {lines.map((l, i) => (
          <div key={i} className={l.from === 'foody' ? 'flex items-end gap-2' : 'flex justify-end'}>
            {l.from === 'foody' && (
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tomate font-display text-[14px] font-bold text-cream">
                F
              </span>
            )}
            <div
              className={[
                'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed',
                l.from === 'foody'
                  ? 'bg-creamy text-tinta rounded-bl-md'
                  : 'bg-tomate text-cream rounded-br-md',
              ].join(' ')}
            >
              {l.text}
            </div>
          </div>
        ))}
      </section>

      {/* input / done */}
      {!done ? (
        <section className="mt-3">
          {step.options && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {step.options.map((opt) => (
                <button key={opt.value} type="button" className="chip" onClick={() => commit(opt.value)}>
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          )}
          {(!step.options || step.allowFreeText) && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                commit(input)
              }}
              className="flex items-center gap-2"
            >
              <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={step.placeholderKey ? t(step.placeholderKey) : t('setup.placeholderFreeText')}
                type={step.kind === 'email' ? 'email' : step.kind === 'tel' ? 'tel' : step.kind === 'url' ? 'url' : 'text'}
                inputMode={step.kind === 'tel' ? 'tel' : step.kind === 'email' ? 'email' : 'text'}
                className="liquid-input flex-1 rounded-2xl px-3.5 py-3 text-[15px]"
              />
              <button
                type="submit"
                disabled={!input.trim() && !step.optional}
                className="btn-lime h-12 shrink-0 px-4 text-[14px]"
              >
                {step.optional && !input.trim() ? t('setup.skipButton') : t('setup.sendButton')}
              </button>
            </form>
          )}
          {step.optional && step.options && (
            <button
              type="button"
              onClick={() => commit('')}
              className="mt-2 text-center text-[12px] text-tinta/50 hover:text-tinta"
            >
              {t('setup.skipStep')}
            </button>
          )}
          <p className="mt-2 text-center text-[11px] text-tinta/45">
            {t('setup.progress', { step: Math.min(stepIdx + 1, STEPS.length), total: STEPS.length })}
          </p>
        </section>
      ) : (
        <section className="mt-4 space-y-3">
          <div className="rounded-3xl stamp-card p-5">
            <h2 className="font-display text-[20px] font-bold text-tinta">{t('setup.doneHeading')}</h2>
            <div className="mt-3 space-y-1.5 text-[13px]">
              {reviewRows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-tinta/10 pb-1.5 last:border-0">
                  <span className="text-tinta/60">{k}</span>
                  <span className="text-right font-medium text-tinta">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={sendWhatsAppRecap} className="btn-lime h-12 w-full text-[14px]">
            {t('setup.doneWhatsApp')}
          </button>
          <button onClick={() => navigate('/restaurants')} className="btn-ghost h-12 w-full text-[14px]">
            {t('setup.doneBack')}
          </button>
          <p className="text-center text-[11px] text-tinta/45">
            {t('setup.doneContact')}
            <a href={`mailto:${FOODMATCH_EMAIL}`} className="underline underline-offset-2 hover:text-tinta">
              {FOODMATCH_EMAIL}
            </a>
          </p>
        </section>
      )}
    </AppShell>
  )
}
