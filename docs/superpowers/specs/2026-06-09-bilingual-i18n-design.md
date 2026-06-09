# Spec: Bilingual EN/ES app (UI internationalization)

Date: 2026-06-09
Status: Approved (brainstorm), pending implementation plan
Increment: 1 of 2 in the current push. The Uber Eats-style redesign is a
separate, later spec and is out of scope here.

## Goal

Make the FoodMatch app render consistently in either Spanish or English, with a
language toggle the user can flip at any time. Today the UI is an inconsistent
mix (Spanish onboarding, English search/detail). After this work there is one
clean Spanish version and one clean English version of every interface string,
defaulting to Spanish, with the choice remembered across launches.

## Decisions (from brainstorm)

- Bilingual layer ships first, before the redesign, as a self-contained increment.
- Default language is Spanish; English is the toggle. Resolution order:
  persisted user choice, else Spanish. No auto-detect.
- Scope is interface text only. Restaurant data (names, descriptions, dishes,
  area names) stays exactly as entered.
- Approach is a lightweight in-house i18n layer (no new dependencies), not a
  library like react-i18next.

## Non-goals (out of scope)

- Translating restaurant data, menus, or any user/owner generated content.
- The marketing `website/` (already bilingual, separate codebase).
- The Uber Eats-style redesign (next increment).
- Deepening the natural-language search parser's keyword coverage. The parser
  already accepts English input (the current placeholder and quick chips are
  English and it ranks queries like "sushi in Ruzafa" and "paella" against live
  data). Parser language coverage is a separate concern.
- Locale-aware number/date/currency formatting beyond the simple count
  pluralization described below. Prices stay euro-formatted as today. No RTL.

## Approach: in-house i18n

For a roughly 10-page app translating only UI chrome, a small in-house layer is
simpler than a library: zero added bundle weight (matters for the Capacitor
build), full control, and it composes with the existing React-context and
`storage.ts` patterns. If advanced needs appear later (lazy namespaces, rich
plural categories), migrating to react-i18next is straightforward because all
strings are already keyed.

## Architecture

Units, each with one clear responsibility:

### 1. Locale dictionaries: `src/locales/es.ts`, `src/locales/en.ts`
- Nested objects of UI strings grouped by area: `welcome`, `home`, `ask`,
  `results`, `detail`, `saved`, `profile`, `partner`, `setup`, `admin`, `nav`,
  `common`.
- Spanish (`es.ts`) is the source of truth. `en.ts` mirrors its key structure.
- A shared `Dictionary` type in `src/locales/types.ts` describes the shape so
  both files conform and editors autocomplete keys.
- Leaf values are either a plain string or a plural object `{ one, other }`.
- Interpolation placeholders use `{name}` syntax, e.g.
  `"found {count} matches"`.

### 2. i18n core: `src/lib/i18n.tsx`
- `type Lang = 'es' | 'en'`.
- `LanguageProvider`: React context provider holding `{ lang, setLang }`.
  Initializes `lang` from `getLanguage()` (storage), defaulting to `'es'`.
  `setLang` updates state and calls `setLanguage()` to persist.
- `useLang(): { lang, setLang }` for the toggle.
- `useT(): { t, tn }`:
  - `t(key: string, vars?: Record<string, string | number>): string` resolves a
    dot path in the active dictionary, interpolates `{var}` placeholders, and on
    a missing key falls back to the Spanish dictionary, then to the raw key
    (so a gap is visible, never a crash).
  - `tn(key: string, count: number, vars?): string` resolves the `{ one, other }`
    form by `count === 1 ? one : other`, with `{count}` auto-provided plus any
    extra `vars`.

### 3. Persistence: extend `src/lib/storage.ts`
- Add `KEY_LANG = 'foodmatch.lang'`.
- `getLanguage(): Lang` via `safeGet`, defaulting to `'es'`; validate the stored
  value is `'es' | 'en'` else default.
- `setLanguage(lang: Lang): void` via `safeSet`.
- Reuses the existing safe localStorage-with-memory-fallback pattern, so a
  blocked storage environment still works in-session.

### 4. Toggle UI: `src/components/LanguageToggle.tsx`
- A compact `ES | EN` control. Placed in the app header next to the existing
  `ThemeToggle`, and also listed in the Profile / "You" screen so it is
  discoverable from settings.
- Tapping calls `setLang`; the change is instant (context re-render) and
  persisted.

### 5. Root wiring
- Wrap the app tree in `LanguageProvider` (in `App.tsx`, around or just inside
  the existing shell), so every route and `AppShell` can call `useT()`.

### String extraction
- Replace hardcoded user-facing strings across all pages
  (`Welcome`, `Home`, `Ask`, `Results`, `RestaurantDetail`, `Saved`, `Profile`,
  `RestaurantPartner`, `RestaurantSetup`, `Admin`) and components
  (`BottomNav`, `EmptyState`, `FilterDrawer`, `MatchCard`, `OpenBadge`,
  `PromptComposer`, `RestaurantCard`, `RestaurantCover`, `AppShell`,
  `ThemeToggle` label) with `t(...)` / `tn(...)` calls.
- Includes the Foody prompt placeholder and the quick-suggestion chips
  (e.g. "Dinner under €20" gets an `es` and `en` form).
- Document any string that is intentionally left untranslated (e.g. the brand
  word "FoodMatch", restaurant data) so reviewers know it is deliberate.

## Data flow

`LanguageProvider` (reads `getLanguage()`, default `es`) holds `lang` in
context. Components call `useT()` and render strings from the active dictionary.
`LanguageToggle` calls `setLang`, which updates context (instant re-render) and
calls `setLanguage()` to persist. On next launch, `getLanguage()` restores the
choice.

## Pluralization and interpolation rules

- Both ES and EN use a simple two-form rule: `count === 1` picks `one`, else
  `other`. This covers the app's count strings (match counts, saved counts,
  result counts).
- `{count}` is injected automatically by `tn`; other variables are passed in
  `vars`.
- Example: `results.found = { one: "FoodMatch found {count} match", other:
  "FoodMatch found {count} matches" }`; Spanish:
  `{ one: "FoodMatch encontró {count} sitio", other: "FoodMatch encontró
  {count} sitios" }`.

## Testing (TDD)

Unit tests for the i18n core (`src/lib/i18n.test.ts` or similar):
- `t` returns the correct string for `es` and for `en`.
- Interpolation replaces `{var}` placeholders.
- `tn` selects `one` vs `other` correctly at counts 0, 1, 2 and injects `{count}`.
- Missing key falls back to Spanish, then to the raw key (never throws).
- Persistence round-trip: `setLanguage('en')` then `getLanguage()` returns `'en'`;
  an invalid stored value returns `'es'`.

Dictionary parity guard:
- A test asserting `en` and `es` have identical key sets (deep), so no string is
  left untranslated or orphaned. This is the main safety net for coverage.

Manual verification:
- Toggle flips every visible string on each screen; reload preserves the choice;
  Spanish is shown on a fresh install.

Existing suite (currently 25 tests) must stay green; lint and build clean.

## Risks and edge cases

- Missed strings: the parity test catches missing keys, but a string that was
  never extracted into a key stays hardcoded. Mitigation: extract per-file and
  review screen by screen; the manual toggle pass surfaces leftovers.
- Spanish copy quality: machine-natural Spanish must read well to native diners.
  Source strings should be reviewed by Samuel (native speaker) before launch;
  flagged as a follow-up, not a blocker for the mechanism.
- Layout shift: some EN and ES strings differ in length and may wrap. Spot-check
  the tightest spots (buttons, chips, nav labels) during the manual pass.

## Definition of done

- Every interface string renders from `es`/`en` dictionaries via `t`/`tn`.
- Language toggle in the header and Profile; choice persists; Spanish default.
- i18n unit tests and the dictionary parity test pass; full suite green; lint
  and build clean.
- No restaurant data was translated; no new runtime dependency was added.
