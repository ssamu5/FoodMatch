# Three-way theme cycle (light / dark / system)

Date: 2026-05-29
Author: Max

## Context

Commit `72cfbc9` shipped a binary light/dark toggle for the FoodMatch app.
The current implementation has one real UX gap: once the user explicitly
picks `light` or `dark`, there is no way back to "follow my OS" short of
clearing local storage. The OS-preference listener is wired but it only
fires while the user has no stored choice, which is rarely the state a
returning user is in.

## Goal

Promote "follow the OS" from an implicit default to a first-class third
state the user can cycle to.

## Non-goals

- Move the control out of the header. The current placement works.
- Add a Profile/Settings page entry for theme. Out of scope for this pass.
- Capacitor `StatusBar` style or splash colour sync. Falls under the
  "native iOS fidelity" axis, separate spec.
- Reduced-motion adaptations for theme transition. Not a known issue
  today.

## Design

### State model

Two distinct values, distinct purposes:

- `ThemeMode = 'light' | 'dark' | 'system'`. What the user picked. This
  is the persisted preference.
- `Theme = 'light' | 'dark'`. What is actually applied to the DOM right
  now (the `.dark` class on `<html>` either exists or doesn't).

`mode` is the source of truth for preference. `theme` is derived: if
`mode` is `'system'`, `theme` follows `prefers-color-scheme` live;
otherwise `theme === mode`.

### Hook API

`src/lib/theme.ts` exports:

```ts
type ThemeMode = 'light' | 'dark' | 'system'
type Theme = 'light' | 'dark'

function useTheme(): {
  mode: ThemeMode    // user preference
  theme: Theme       // currently applied
  setMode: (next: ThemeMode) => void
  cycle: () => void  // light -> dark -> system -> light
}
```

`cycle` advances in the order `light -> dark -> system -> light`.
`setMode` persists and applies immediately. When `mode === 'system'`,
the hook stays subscribed to the OS media query and updates `theme`
whenever it changes. When `mode` is locked to `'light'` or `'dark'`, the
OS listener still runs but does not mutate state.

### Pre-paint script (`index.html`)

Resolves `'system'` to the current OS preference before React mounts,
same flash-prevention strategy as today:

```js
var stored = localStorage.getItem('fm.theme'); // 'light' | 'dark' | 'system' | null
var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
var mode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
var theme = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
if (theme === 'dark') document.documentElement.classList.add('dark');
document.documentElement.setAttribute('data-theme', theme);
document.documentElement.setAttribute('data-mode', mode);
```

`data-mode` is added so the toggle can read it on first render without
needing a JS-side preference probe.

### Toggle component (`ThemeToggle.tsx`)

Same round button, same place in the header. The icon reflects `mode`,
not `theme`:

- `light` -> sun icon
- `dark` -> moon icon
- `system` -> monitor glyph

`aria-label` and `title` describe the next mode in the cycle so the
behaviour is discoverable on hover and to screen readers:

- in `light`: "Switch to dark mode"
- in `dark`: "Switch to system mode"
- in `system`: "Switch to light mode"

### Persistence

Same storage key `fm.theme`. Values widen from `'light' | 'dark'` to
`'light' | 'dark' | 'system'`. No migration code needed: a stale
`'light'` or `'dark'` from the previously shipped version still parses
as a valid locked mode.

### Default

First visit with no stored value: `mode = 'system'`. Resolved theme is
whatever the OS reports. Identical to current behaviour, just makes the
third state explicit.

### Analytics

`track('theme_changed', { to: mode })` where `mode` is now one of three
values. The `AnalyticsEventType` union does not change.

### Cross-tab sync

`storage` event listener already exists. Update the type guard to
accept `'system'` in addition to `'light'` and `'dark'`. When the value
flips to `'system'` in another tab, this tab re-evaluates the OS
preference and applies it.

## Edge cases

- localStorage blocked (private browsing): `mode` stays in-memory and
  resets to `'system'` per page load. Acceptable.
- OS preference changes while a `'system'` user is on the page: handled
  by the live media-query listener.
- Stale `'light' | 'dark'` value from the v1 shipped today: treated as a
  locked pick. User can cycle to `'system'` if they want it back.
- iOS `theme-color` meta: the `<meta media="...">` variants already do
  the right thing without JS. No change needed.

## Testing

Manual checklist:

1. Fresh browser (no storage): page renders matching OS preference,
   toggle shows monitor icon.
2. Click toggle: sun icon, light theme applied, OS preference change
   no longer affects page.
3. Click again: moon icon, dark theme.
4. Click again: monitor icon, theme reflects OS preference and follows
   live OS changes.
5. Open second tab, click toggle in one: the other tab reflects the
   change.
6. Refresh: state persists.

No automated tests are added. The project has no test harness yet and
adding one is out of scope.

## Files touched

- `frontend/src/lib/theme.ts` (rewrite)
- `frontend/src/components/ThemeToggle.tsx` (rewrite icon + label
  logic, cycle handler)
- `frontend/index.html` (pre-paint script update)

## Risk

Low. The change is additive: the binary toggle becomes a three-way
cycle, existing stored values still work, and the OS listener already
exists in the current implementation.
