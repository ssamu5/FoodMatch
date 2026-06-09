import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import type { Lang, PluralForms, Dictionary } from '../locales/types'
import { es } from '../locales/es'
import { en } from '../locales/en'
import { getLanguage, setLanguage } from './storage'

const DICTS: Record<Lang, Dictionary> = { es, en }

function lookup(dict: Dictionary, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object' && part in (node as object)) {
      return (node as Record<string, unknown>)[part]
    }
    return undefined
  }, dict)
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  )
}

function isPlural(v: unknown): v is PluralForms {
  return !!v && typeof v === 'object' && 'one' in v && 'other' in v
}

function resolve(lang: Lang, key: string): string | PluralForms | undefined {
  const v = lookup(DICTS[lang], key)
  if (typeof v === 'string' || isPlural(v)) return v
  if (lang !== 'es') {
    const esv = lookup(DICTS.es, key)
    if (typeof esv === 'string' || isPlural(esv)) return esv
  }
  return undefined
}

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const v = resolve(lang, key)
  if (typeof v === 'string') return interpolate(v, vars)
  return key
}

export function translatePlural(
  lang: Lang,
  key: string,
  count: number,
  vars?: Record<string, string | number>,
): string {
  const v = resolve(lang, key)
  const merged = { count, ...(vars || {}) }
  if (isPlural(v)) return interpolate(count === 1 ? v.one : v.other, merged)
  if (typeof v === 'string') return interpolate(v, merged)
  return key
}

interface LanguageCtx {
  lang: Lang
  setLang: (l: Lang) => void
}

const LanguageContext = createContext<LanguageCtx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => getLanguage())
  const setLang = useCallback((l: Lang) => {
    setLanguage(l)
    setLangState(l)
  }, [])
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang(): LanguageCtx {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}

export function useT() {
  const { lang } = useLang()
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  )
  const tn = useCallback(
    (key: string, count: number, vars?: Record<string, string | number>) =>
      translatePlural(lang, key, count, vars),
    [lang],
  )
  return { t, tn }
}
