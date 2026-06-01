import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { api } from '../lib/api'
import { track } from '../lib/analytics'
import { openExternal } from '../lib/native'

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

interface Step {
  key: FieldKey
  // Foody's message (Spanish).
  ask: (data: Partial<Record<FieldKey, string>>) => string
  placeholder?: string
  // Tap options. If present, the user can tap instead of typing.
  options?: string[]
  optional?: boolean
  // free-text allowed alongside options
  allowFreeText?: boolean
  kind?: 'text' | 'email' | 'tel' | 'url'
}

const AREAS = ['Ruzafa', 'El Carmen', 'Cánovas', 'Benimaclet', 'Centro', 'Marina / playa', 'Otra zona']
const CUISINES = [
  'Tapas', 'Arroces / paella', 'Menú del día', 'Hamburguesas', 'Pizza',
  'Sushi', 'Brunch', 'Cafetería', 'Bar', 'Saludable', 'Mexicana', 'Otra',
]
const PRICE_BANDS = ['€ (hasta 15)', '€€ (15-30)', '€€€ (30-50)', '€€€€ (50+)']

const STEPS: Step[] = [
  {
    key: 'restaurantName',
    ask: () => '¡Hola! Soy Foody. Te ayudo a poner tu restaurante en FoodMatch en un minuto, sin complicaciones. ¿Cómo se llama tu restaurante?',
    placeholder: 'Casa Carmela',
  },
  {
    key: 'area',
    ask: (d) => `Genial, ${d.restaurantName || ''}. ¿En qué zona de Valencia estáis?`,
    options: AREAS,
    allowFreeText: true,
    placeholder: 'Tu barrio',
  },
  {
    key: 'cuisine',
    ask: () => '¿Qué tipo de comida hacéis? Toca la que mejor encaje.',
    options: CUISINES,
    allowFreeText: true,
    placeholder: 'Tu especialidad',
  },
  {
    key: 'priceBand',
    ask: () => '¿Cuánto se suele gastar una persona? Una idea aproximada vale.',
    options: PRICE_BANDS,
  },
  {
    key: 'ownerName',
    ask: () => 'Perfecto. ¿Y tú cómo te llamas? Para saber con quién hablamos.',
    placeholder: 'Tu nombre',
  },
  {
    key: 'phone',
    ask: (d) => `Encantado, ${d.ownerName || ''}. ¿Un teléfono o WhatsApp de contacto?`,
    placeholder: '+34 600 123 456',
    kind: 'tel',
  },
  {
    key: 'email',
    ask: () => '¿Y un email? Te escribimos para terminar de montar la ficha.',
    placeholder: 'hola@turestaurante.com',
    kind: 'email',
  },
  {
    key: 'instagramOrWebsite',
    ask: () => '¿Tenéis Instagram o web? Así cogemos vuestras fotos y no tenéis que subir nada.',
    placeholder: '@turestaurante',
    optional: true,
  },
  {
    key: 'menuLink',
    ask: () => '¿La carta está en algún sitio online (web, PDF, foto en Instagram)? Pega el enlace si lo tienes.',
    placeholder: 'Enlace a la carta (opcional)',
    optional: true,
    kind: 'url',
  },
  {
    key: 'hasPhotos',
    ask: () => 'Última cosa: ¿queréis que usemos vuestras fotos de Instagram para la ficha?',
    options: ['Sí, usad nuestras fotos', 'Prefiero enviarlas yo', 'Todavía no tengo'],
  },
]

interface ChatLine {
  from: 'foody' | 'user'
  text: string
}

export default function RestaurantSetup() {
  const navigate = useNavigate()
  const [stepIdx, setStepIdx] = useState(0)
  const [data, setData] = useState<Partial<Record<FieldKey, string>>>({})
  const [input, setInput] = useState('')
  const [done, setDone] = useState(false)
  const [lines, setLines] = useState<ChatLine[]>([{ from: 'foody', text: STEPS[0].ask({}) }])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    track('onboarding_started')
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [lines, done])

  const step = STEPS[stepIdx]
  const progress = Math.round((stepIdx / STEPS.length) * 100)

  function commit(rawValue: string) {
    const value = rawValue.trim()
    if (!value && !step.optional) return

    const display = value || 'Lo dejamos para luego'
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
      setLines((l) => [...l, { from: 'foody', text: STEPS[nextIdx].ask(nextData) }])
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
      { from: 'foody', text: `¡Listo, ${finalData.ownerName || ''}! Ya tengo lo básico de ${finalData.restaurantName || 'tu restaurante'}. Nosotros montamos la ficha y te escribimos en 48h para repasarla. No tienes que subir nada.` },
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
        ['Restaurante', data.restaurantName],
        ['Zona', data.area],
        ['Comida', data.cuisine],
        ['Precio medio', data.priceBand],
        ['Contacto', [data.ownerName, data.phone].filter(Boolean).join(' · ')],
        ['Email', data.email],
        ['Instagram / web', data.instagramOrWebsite],
        ['Carta', data.menuLink],
      ].filter(([, v]) => Boolean(v)) as Array<[string, string]>,
    [data],
  )

  return (
    <AppShell hideNav>
      {/* header */}
      <section className="pt-2">
        <div className="flex items-center justify-between">
          <Link to="/restaurants" className="text-[13px] text-tinta/60 hover:text-tinta">
            &larr; Atrás
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-tomate">
            <span className="h-1.5 w-1.5 rounded-full bg-tomate animate-pulse-soft" />
            Foody te ayuda
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
                <button key={opt} type="button" className="chip" onClick={() => commit(opt)}>
                  {opt}
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
                placeholder={step.placeholder || 'Escribe aquí...'}
                type={step.kind === 'email' ? 'email' : step.kind === 'tel' ? 'tel' : step.kind === 'url' ? 'url' : 'text'}
                inputMode={step.kind === 'tel' ? 'tel' : step.kind === 'email' ? 'email' : 'text'}
                className="liquid-input flex-1 rounded-2xl px-3.5 py-3 text-[15px]"
              />
              <button
                type="submit"
                disabled={!input.trim() && !step.optional}
                className="btn-lime h-12 shrink-0 px-4 text-[14px]"
              >
                {step.optional && !input.trim() ? 'Saltar' : 'Enviar'}
              </button>
            </form>
          )}
          {step.optional && step.options && (
            <button
              type="button"
              onClick={() => commit('')}
              className="mt-2 text-center text-[12px] text-tinta/50 hover:text-tinta"
            >
              Saltar este paso
            </button>
          )}
          <p className="mt-2 text-center text-[11px] text-tinta/45">
            Paso {Math.min(stepIdx + 1, STEPS.length)} de {STEPS.length} · sin compromiso
          </p>
        </section>
      ) : (
        <section className="mt-4 space-y-3">
          <div className="rounded-3xl stamp-card p-5">
            <h2 className="font-display text-[20px] font-bold text-tinta">Resumen de tu ficha</h2>
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
            Enviar resumen por WhatsApp
          </button>
          <button onClick={() => navigate('/restaurants')} className="btn-ghost h-12 w-full text-[14px]">
            Volver
          </button>
          <p className="text-center text-[11px] text-tinta/45">
            ¿Algo mal? Escríbenos a{' '}
            <a href={`mailto:${FOODMATCH_EMAIL}`} className="underline underline-offset-2 hover:text-tinta">
              {FOODMATCH_EMAIL}
            </a>
          </p>
        </section>
      )}
    </AppShell>
  )
}
