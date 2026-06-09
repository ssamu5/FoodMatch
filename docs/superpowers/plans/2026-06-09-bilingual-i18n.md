# Bilingual EN/ES App (UI i18n) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every interface string render in Spanish or English from keyed dictionaries, with a persisted language toggle defaulting to Spanish.

**Architecture:** A small in-house i18n layer (no new dependencies). Pure `translate`/`translatePlural` functions resolve dot-keyed strings from `es`/`en` dictionaries with interpolation and two-form pluralization; a `LanguageProvider` context holds the active language (from `storage.ts`, default `es`) and `useT()` exposes `t`/`tn` to components. A `LanguageToggle` lives in the header and Profile. Strings are extracted screen by screen; a dictionary-parity test guarantees no key is left untranslated.

**Tech Stack:** React 18 + TypeScript + Vite + Vitest. Existing patterns: React context (see `src/lib/theme`), `src/lib/storage.ts` safe localStorage helpers.

**Spec:** `docs/superpowers/specs/2026-06-09-bilingual-i18n-design.md`

---

## File structure

- Create `src/locales/types.ts` — `Lang`, `PluralForms`, `Dictionary` types. No deps.
- Create `src/locales/es.ts` — Spanish dictionary (source of truth).
- Create `src/locales/en.ts` — English dictionary (mirrors es key structure).
- Create `src/locales/locales.test.ts` — dictionary-parity guard.
- Create `src/lib/i18n.tsx` — pure `translate`/`translatePlural`, `LanguageProvider`, `useLang`, `useT`.
- Create `src/lib/i18n.test.ts` — unit tests for resolution, interpolation, pluralization, persistence.
- Create `src/components/LanguageToggle.tsx` — ES | EN control.
- Modify `src/lib/storage.ts` — add `getLanguage`/`setLanguage`.
- Modify `src/App.tsx` — wrap tree in `LanguageProvider`.
- Modify `src/components/AppShell.tsx`, `BottomNav.tsx`, `ThemeToggle.tsx` — chrome strings + toggle placement.
- Modify each page under `src/pages/` — replace hardcoded strings with `t`/`tn`.

Convention: dictionary keys are dot paths grouped by area, e.g. `nav.saved`, `home.heroTitle`, `results.found`. Plural entries are `{ one, other }` and resolved with `tn`. Interpolation uses `{name}` placeholders. The brand word "FoodMatch" and restaurant data are NOT translated.

---

## Task 1: Language persistence in storage

**Files:**
- Modify: `src/lib/storage.ts` (append a new section)
- Test: `src/lib/i18n.test.ts` (create; persistence cases here)

- [ ] **Step 1: Write the failing test**

Create `src/lib/i18n.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getLanguage, setLanguage } from './storage'

describe('language persistence', () => {
  it('defaults to Spanish when nothing is stored', () => {
    setLanguage('es') // normalize any prior state
    expect(getLanguage()).toBe('es')
  })

  it('round-trips a chosen language', () => {
    setLanguage('en')
    expect(getLanguage()).toBe('en')
    setLanguage('es')
    expect(getLanguage()).toBe('es')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/i18n.test.ts`
Expected: FAIL with `getLanguage`/`setLanguage` not exported from `./storage`.

- [ ] **Step 3: Implement in `src/lib/storage.ts`**

Append at the end of the file:

```ts
// ---------- Language ----------

const KEY_LANG = 'foodmatch.lang'

export function getLanguage(): 'es' | 'en' {
  return safeGet<'es' | 'en'>(KEY_LANG, 'es') === 'en' ? 'en' : 'es'
}

export function setLanguage(lang: 'es' | 'en'): void {
  safeSet(KEY_LANG, lang)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/i18n.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/lib/i18n.test.ts
git commit -m "feat(i18n): persist language choice in storage (default Spanish)"
```

---

## Task 2: Locale types, seed dictionaries, and parity guard

**Files:**
- Create: `src/locales/types.ts`
- Create: `src/locales/es.ts`
- Create: `src/locales/en.ts`
- Test: `src/locales/locales.test.ts`

This task establishes the dictionary shape, the parity test, and the first real keys (`common` and `nav`). Later tasks append more areas to `es.ts`/`en.ts`.

- [ ] **Step 1: Create `src/locales/types.ts`**

```ts
export type Lang = 'es' | 'en'

export interface PluralForms {
  one: string
  other: string
}

export type DictNode = string | PluralForms | { [key: string]: DictNode }

export interface Dictionary {
  [key: string]: DictNode
}
```

- [ ] **Step 2: Create `src/locales/es.ts` (source of truth)**

```ts
import type { Dictionary } from './types'

export const es: Dictionary = {
  common: {
    appName: 'FoodMatch',
    back: 'Atras',
    cancel: 'Cancelar',
    save: 'Guardar',
    saved: 'Guardado',
    open: 'Abierto',
    closed: 'Cerrado',
    closesSoon: 'Cierra pronto',
    opensSoon: 'Abre pronto',
    viewDetails: 'Ver detalles',
    forRestaurants: 'Para restaurantes',
  },
  nav: {
    discover: 'Descubre',
    ask: 'Pregunta',
    saved: 'Guardados',
    you: 'Tu',
  },
  language: {
    label: 'Idioma',
    switchToEnglish: 'Cambiar a ingles',
    switchToSpanish: 'Cambiar a espanol',
  },
}
```

(Spanish accents are intentionally omitted in some words here to avoid encoding pitfalls in the plan; when implementing, write proper Spanish with accents, e.g. "Atrás", "Tú", "español", "inglés". Native-speaker review is a noted follow-up.)

- [ ] **Step 3: Create `src/locales/en.ts` (mirror of es keys)**

```ts
import type { Dictionary } from './types'

export const en: Dictionary = {
  common: {
    appName: 'FoodMatch',
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    saved: 'Saved',
    open: 'Open',
    closed: 'Closed',
    closesSoon: 'Closes soon',
    opensSoon: 'Opens soon',
    viewDetails: 'View details',
    forRestaurants: 'For restaurants',
  },
  nav: {
    discover: 'Discover',
    ask: 'Ask',
    saved: 'Saved',
    you: 'You',
  },
  language: {
    label: 'Language',
    switchToEnglish: 'Switch to English',
    switchToSpanish: 'Switch to Spanish',
  },
}
```

- [ ] **Step 4: Write the parity test `src/locales/locales.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { es } from './es'
import { en } from './en'

// Flatten to leaf key paths. A string is a leaf; a { one, other } plural object
// is also a leaf (not a namespace); everything else recurses.
function flattenKeys(node: unknown, prefix = ''): string[] {
  if (typeof node === 'string') return [prefix]
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>
    if ('one' in obj && 'other' in obj) return [prefix]
    return Object.keys(obj).flatMap((k) =>
      flattenKeys(obj[k], prefix ? `${prefix}.${k}` : k),
    )
  }
  return []
}

describe('locale dictionaries', () => {
  it('es and en have identical key sets', () => {
    expect(flattenKeys(en).sort()).toEqual(flattenKeys(es).sort())
  })
})
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/locales/locales.test.ts`
Expected: PASS (es and en match).

- [ ] **Step 6: Commit**

```bash
git add src/locales/types.ts src/locales/es.ts src/locales/en.ts src/locales/locales.test.ts
git commit -m "feat(i18n): locale types, seed es/en dictionaries, parity test"
```

---

## Task 3: i18n core (translate, pluralize, provider, hooks)

**Files:**
- Create: `src/lib/i18n.tsx`
- Test: `src/lib/i18n.test.ts` (add resolution/interpolation/plural cases)

- [ ] **Step 1: Add two temporary fixture keys to `es.ts` and `en.ts`**

The interpolation and plural mechanisms need real keys to assert against, but no
real interpolated/plural key exists yet (they arrive in Task 6). Add these two
fixture keys to BOTH dictionaries so the parity test stays green. Task 11 Step 4
rewires the assertions to real keys and deletes these.

es.ts (add at top level):
```ts
  greeting: 'Hola {name}',
  plural: { one: '{count} elemento', other: '{count} elementos' },
```
en.ts (add at top level):
```ts
  greeting: 'Hi {name}',
  plural: { one: '{count} item', other: '{count} items' },
```

- [ ] **Step 2: Add failing tests to `src/lib/i18n.test.ts`**

Append:

```ts
import { translate, translatePlural } from './i18n'

describe('translate', () => {
  it('returns the string for each language', () => {
    expect(translate('es', 'nav.saved')).toBe('Guardados')
    expect(translate('en', 'nav.saved')).toBe('Saved')
  })

  it('interpolates {vars}', () => {
    expect(translate('en', 'greeting', { name: 'Sam' })).toBe('Hi Sam')
  })

  it('falls back to the raw key for missing keys', () => {
    expect(translate('en', 'nope.missing')).toBe('nope.missing')
  })
})

describe('translatePlural', () => {
  it('selects one vs other and injects {count}', () => {
    expect(translatePlural('en', 'plural', 1)).toBe('1 item')
    expect(translatePlural('en', 'plural', 3)).toBe('3 items')
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `npx vitest run src/lib/i18n.test.ts`
Expected: FAIL with `translate`/`translatePlural` not exported from `./i18n`.

- [ ] **Step 4: Implement `src/lib/i18n.tsx`**

```tsx
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

// Resolve to a string or plural form, falling back es -> raw.
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
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run src/lib/i18n.test.ts`
Expected: PASS. The greeting/plural fixture keys make the interpolation and plural cases pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/i18n.tsx src/lib/i18n.test.ts src/locales/es.ts src/locales/en.ts
git commit -m "feat(i18n): translate/pluralize core, LanguageProvider, useT hook"
```

---

## Task 4: LanguageToggle + root wiring + shell chrome strings

**Files:**
- Create: `src/components/LanguageToggle.tsx`
- Modify: `src/App.tsx` (wrap in `LanguageProvider`)
- Modify: `src/components/AppShell.tsx` (place toggle next to ThemeToggle)
- Modify: `src/components/BottomNav.tsx` (nav labels via `t`)
- Modify: `src/components/ThemeToggle.tsx` (aria labels via `t`)

- [ ] **Step 1: Create `src/components/LanguageToggle.tsx`**

```tsx
import { useLang, useT } from '../lib/i18n'

interface LanguageToggleProps {
  className?: string
}

export default function LanguageToggle({ className }: LanguageToggleProps) {
  const { lang, setLang } = useLang()
  const { t } = useT()
  const next = lang === 'es' ? 'en' : 'es'
  const aria = next === 'en' ? t('language.switchToEnglish') : t('language.switchToSpanish')
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={aria}
      title={aria}
      className={[
        'inline-flex h-9 items-center justify-center rounded-full px-3',
        'border border-tinta/15 bg-paper/60 text-tinta text-xs font-semibold',
        'transition hover:bg-creamy hover:border-tinta/30 active:scale-95',
        className || '',
      ].join(' ')}
    >
      {lang.toUpperCase()}
    </button>
  )
}
```

- [ ] **Step 2: Wrap the app in `LanguageProvider` (`src/App.tsx`)**

Add the import:

```tsx
import { LanguageProvider } from './lib/i18n'
```

Change the `return (` block so the provider wraps `BrowserRouter`:

```tsx
  return (
    <LanguageProvider>
      <BrowserRouter>
        {/* existing <Routes> ... unchanged ... */}
      </BrowserRouter>
    </LanguageProvider>
  )
```

- [ ] **Step 3: Place the toggle in the header (`src/components/AppShell.tsx`)**

Add the import:

```tsx
import LanguageToggle from './LanguageToggle'
```

In the header actions `div`, add `LanguageToggle` before `ThemeToggle`, and translate the "For restaurants" link via `useT`. Add `const { t } = useT()` at the top of the component (import `useT` from `../lib/i18n`). The actions block becomes:

```tsx
          <div className="flex items-center gap-2">
            {headerSlot}
            {!isHome && (
              <Link to="/restaurants" className="hidden text-xs text-tinta/70 hover:text-tinta sm:inline-block">
                {t('common.forRestaurants')}
              </Link>
            )}
            <LanguageToggle />
            <ThemeToggle />
          </div>
```

- [ ] **Step 4: Translate nav labels (`src/components/BottomNav.tsx`)**

Replace the module-level `links` array's literal labels with keys, and resolve them inside the component. Change the array to:

```tsx
const links = [
  { to: '/', labelKey: 'nav.discover', icon: SearchIcon },
  { to: '/ask', labelKey: 'nav.ask', icon: SparkIcon },
  { to: '/saved', labelKey: 'nav.saved', icon: BookmarkIcon },
  { to: '/profile', labelKey: 'nav.you', icon: UserIcon },
] as const
```

Add `import { useT } from '../lib/i18n'`, add `const { t } = useT()` at the top of `BottomNav`, and change the label span to `<span>{t(l.labelKey)}</span>`.

- [ ] **Step 5: Translate ThemeToggle aria labels (`src/components/ThemeToggle.tsx`)**

Move the human labels into keys. Add to `es.ts`/`en.ts` under a new `theme` area:

es: `theme: { switchToDark: 'Cambiar a modo oscuro', switchToLight: 'Cambiar a modo claro', switchToSystem: 'Cambiar a modo del sistema' }`
en: `theme: { switchToDark: 'Switch to dark mode', switchToLight: 'Switch to light mode', switchToSystem: 'Switch to system mode' }`

In `ThemeToggle.tsx`, replace the `NEXT` record's `label` strings with key names (`'theme.switchToDark'` etc.), add `const { t } = useT()`, and use `t(label)` for `aria-label`/`title`.

- [ ] **Step 6: Verify lint, tests, parity, and a manual toggle**

Run: `npm run lint` (expect exit 0), `npx vitest run` (all green incl. parity), `npm run build` (expect success).
Manual: `npm run dev`, confirm the header shows an ES/EN toggle, tapping flips the bottom-nav labels and the "For restaurants" link, and a reload keeps the choice.

- [ ] **Step 7: Commit**

```bash
git add src/components/LanguageToggle.tsx src/App.tsx src/components/AppShell.tsx src/components/BottomNav.tsx src/components/ThemeToggle.tsx src/locales/es.ts src/locales/en.ts
git commit -m "feat(i18n): language toggle, provider wiring, shell + nav strings"
```

---

## Tasks 5 to 10: Convert screens (one task per group)

Each conversion task follows the SAME pattern. For the task's file(s):

1. Read the file and list every user-facing string (visible text, placeholders, `aria-label`/`title`, button labels, empty-state copy, toast/track-free UI text). Do NOT translate restaurant data values or the brand word "FoodMatch".
2. Add a new area object (or extend an existing one) to BOTH `src/locales/es.ts` and `src/locales/en.ts` with a key per string. Spanish is authored properly (with accents); English mirrors the keys.
3. Replace each literal in the JSX with `t('area.key')`, or `tn('area.key', count)` for count-dependent strings. Add `const { t } = useT()` (and `tn` where needed) at the top of each component; import `useT` from the correct relative path.
4. Run `npx vitest run src/locales/locales.test.ts` (parity must stay green) and `npm run lint`.
5. Manual: `npm run dev`, open the screen, toggle ES/EN, confirm every string flips and layout still holds (watch buttons, chips, nav for wrapping).
6. Commit with `feat(i18n): translate <screen(s)>`.

The areas and the strings to start from (extract any others you find in the file):

### Task 5: Welcome + onboarding (`src/pages/Welcome.tsx`)

Area `welcome`. Known strings to key (verify against the file, add the rest):
- es source examples: "Bienvenido a foodmatch.", "Descubre donde comer en Valencia, y ayuda a los restaurantes locales a que los encuentren." (write with accents), "Como usas FoodMatch?", "Quiero comer fuera", "Descubre tu proximo sitio en Valencia.", "Tengo un restaurante", "Que te encuentren los clientes correctos.", "Piloto en Valencia - sin compromiso", "Crear mi perfil", "Entrar sin perfil", the three diner bullets ("Buscas por antojo" + sub, "Foody elige por ti" + sub, "Guarda y reserva" + sub).
- en mirror: "Welcome to foodmatch.", "Discover where to eat in Valencia, and help local restaurants get found.", "How do you use FoodMatch?", "I want to eat out", "Find your next spot in Valencia.", "I have a restaurant", "Get found by the right customers.", "Pilot in Valencia - no commitment", "Create my profile", "Enter without a profile", and the three bullets.
- Note: the brand word stays "foodmatch"/"FoodMatch". Also place a `LanguageToggle` in the Welcome header area (the `fm` logo row) so first-run users can switch before entering. Commit: `feat(i18n): translate welcome/onboarding`.

### Task 6: Search flow (`src/pages/Home.tsx`, `src/pages/Ask.tsx`, `src/pages/Results.tsx`) + search components (`src/components/PromptComposer.tsx`, `MatchCard.tsx`, `RestaurantCard.tsx`, `FilterDrawer.tsx`, `OpenBadge.tsx`, `EmptyState.tsx`)

Areas `home`, `ask`, `results`, `search` (shared), `filters`. Known strings to key (extract the rest from each file):
- Home/hero: "VALENCIA", "Tell us what you crave." / "We find the table.", "Describe the moment the way you would to a friend. Foody returns the few spots that fit.", prompt placeholder "A juicy burger and beer near Ruzafa, under EUR20" (keep the euro), chips "Dinner under EUR20", "Date night sushi", "Healthy lunch near me", "Group dinner tonight", "Browse all restaurants", "For restaurants".
- Results/ask: the count line uses `tn`: add `results.found = { one, other }` (es: "FoodMatch encontro {count} sitio" / "{count} sitios"; en: "FoodMatch found {count} match" / "{count} matches"). Also "See all", "FINDING YOUR MATCHES..." -> `results.loading`, "BEST PICK" -> `results.bestPick`, "SHORTLIST" -> `results.shortlist`, "Best for: {tag}" -> use interpolation `results.bestFor` with `{tag}`, "Why this fits your search" / section labels, refinement chips "cheaper", "closer", "romantic", "open now", "vegetarian", sort labels.
- Open status badge (`OpenBadge.tsx`): reuse `common.open`, `common.closed`, `common.closesSoon`, `common.opensSoon`.
- EmptyState: its message(s) -> `search.empty` or a passed-in key.
- Es examples mirror the above with accents. Commit: `feat(i18n): translate search flow + cards`.

### Task 7: Restaurant detail (`src/pages/RestaurantDetail.tsx`)

Area `detail`. Known strings: "PUBLIC LISTING", "Reservar o pedir por WhatsApp" (es) / "Book or order via WhatsApp" (en), "Opens WhatsApp with a prefilled message. Demo numbers are not connected yet.", "WHY THIS FITS YOUR SEARCH", "WHY FOODMATCH PICKS IT", "MENU", "sample", "Best for: {tag}" (interpolated), "Around EUR{spend} per person." (interpolated), action buttons "Open Maps", "Call", "Instagram", "Save" (reuse `common.save`), NotFound copy, loading copy. Extract the rest from the file. Commit: `feat(i18n): translate restaurant detail`.

### Task 8: Saved + Profile (`src/pages/Saved.tsx`, `src/pages/Profile.tsx`)

Areas `saved`, `profile`. Known: Saved empty state ("Nothing saved yet" -> es "Aun no has guardado nada"), recent searches heading, counts via `tn`. Profile: headings, the taste-profile fields/labels, account/sign-in copy, and a `LanguageToggle` row labelled `language.label`. Extract the rest. Commit: `feat(i18n): translate saved + profile (with language setting)`.

### Task 9: Restaurant side (`src/pages/RestaurantPartner.tsx`, `src/pages/RestaurantSetup.tsx`)

Areas `partner`, `setup`. These are form-heavy: extract every label, placeholder, helper text, button, validation/empty message, and success copy into keys. Spanish authored properly; English mirrors. Commit: `feat(i18n): translate restaurant partner + setup`.

### Task 10: Admin (`src/pages/Admin.tsx`)

Area `admin`. Internal soft-locked page: extract headings ("Most opened", "WhatsApp leads by restaurant", "Unknown", unlock prompt, etc.) into keys. Commit: `feat(i18n): translate admin`.

---

## Task 11: Full verification and coverage sweep

**Files:** none (verification) unless gaps are found.

- [ ] **Step 1: Full automated gate**

Run: `npm run lint` (exit 0), `npx vitest run` (all green, including `locales.test.ts` parity and `i18n.test.ts`), `npm run build` (success).

- [ ] **Step 2: Untranslated-string sweep**

Search for likely leftover hardcoded UI strings in JSX. Run:

```bash
grep -rnoE ">[A-Z][a-z]+ [A-Za-z ]+<" src/pages src/components | grep -viE "Icon|className" | head -40
```

Review hits: anything that is user-facing copy still hardcoded must be moved into a key (add to `es`/`en`, parity stays green). Restaurant data and the brand word are expected and fine.

- [ ] **Step 3: Manual bilingual pass**

`npm run dev`. For every screen (Welcome, Home/Ask, Results, RestaurantDetail, Saved, Profile, RestaurantPartner, RestaurantSetup, Admin): toggle ES and EN, confirm all visible text flips, the count strings read naturally in both languages, no layout breaks in buttons/chips/nav, and a reload preserves the chosen language. Confirm a fresh install defaults to Spanish.

- [ ] **Step 4: Remove the Task 3 fixture keys**

Task 3 added two fixture keys (`greeting` and `plural`) to `es.ts`/`en.ts`. Now that real keys exist, rewire the i18n tests off them and delete them:
- In `src/lib/i18n.test.ts`, change the interpolation assertion to a real interpolated key (e.g. `translate('en', 'detail.aroundSpend', { spend: 30 })` equals the English copy) and the plural assertion to `translatePlural('en', 'results.found', 1)` and `, 3)` matching the English copy.
- Delete `greeting` and `plural` from both `es.ts` and `en.ts`.
- Re-run `npx vitest run` (parity + i18n tests green).

- [ ] **Step 5: Commit any sweep fixes**

```bash
git add -A
git commit -m "test(i18n): coverage sweep, parity verified, full suite green"
```

---

## Out of scope (do not do here)
- Translating restaurant data, menus, descriptions, or area names.
- The marketing `website/` (already bilingual).
- The Uber Eats-style redesign (separate spec).
- Adding any new runtime dependency.

## Done when
- Every interface string renders from `es`/`en` via `t`/`tn`; toggle in header + Profile; choice persists; Spanish default.
- `i18n.test.ts` and `locales.test.ts` pass; full suite green; lint and build clean.
- No restaurant data translated; no new dependency added.
