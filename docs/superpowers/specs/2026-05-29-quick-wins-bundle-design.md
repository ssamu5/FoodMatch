# Quick-wins bundle

Date: 2026-05-29
Author: Max

## Context

Six small, independent improvements to the FoodMatch MVP, grouped into a
single pass because each is low-risk and self-contained. Found while
surveying the repo after the dark-mode work. Sensible defaults chosen by
me; this spec is for review before implementation.

## Goal

Tighten existing screens: surface open/closed status, let users manage
their Saved list in place, validate the one form we have, delete dead
code, make the detail page reflect the user's actual search, and shorten
the save loop.

## Non-goals

- Geolocation / real distance (its own spec, next).
- Any backend or data-source change.
- Restyling. These slot into the current visual language.

---

## Item 1: Open / closed badge on cards

### What

A small status pill on `RestaurantCard` and `MatchCard`:
- "Open now" (fresco green dot)
- "Closes soon" (mostaza, when within 45 min of close)
- "Closed" (muted, tinta/50)
- nothing at all when the restaurant has no `opening` data (avoid a
  misleading "Open")

### How

New pure helper in `ranking.ts`, built on the existing `isOpenAt` logic:

```ts
export type OpenStatus =
  | { state: 'open'; closesSoon: boolean }
  | { state: 'closed'; opensSoon: boolean }
  | { state: 'unknown' }

export function getOpenStatus(r: Restaurant, date?: Date): OpenStatus
```

- `unknown` when `!r.opening`.
- `closesSoon` true if open and the close time is <= 45 min away.
- `opensSoon` true if closed but today's opening is <= 60 min away.

A tiny presentational `OpenBadge` component (`components/OpenBadge.tsx`)
takes a `Restaurant`, calls `getOpenStatus`, and renders the pill (or
null for `unknown`). Reused by both cards.

- `RestaurantCard`: badge goes in the meta row next to price/rating.
- `MatchCard`: badge goes under the name in the hero overlay, using the
  static `cream` token so it stays readable over the dark image gradient.

### Why this default

A food app at 22:30 lives or dies on "is it still open." `isOpenAt`
already exists; this just exposes it. "Closes soon" is the highest-value
state and costs almost nothing to compute.

---

## Item 2: Remove rows in place on Saved

### What

- Each saved restaurant row gets a small ✕ button to unsave without
  opening it.
- Each recent-search row gets a ✕ to remove that single search.
- A "Clear all" text button on the recent-searches header (uses the
  existing `clearRecentSearches`).

### How

- `storage.ts`: add `removeRecentSearch(query: string): SearchEvent[]`
  (mirror of `addRecentSearch`, filters by query).
- `Saved.tsx`: hold `saved` and `recent` in state (already does), wire
  the ✕ handlers to `unsaveRestaurant` / `removeRecentSearch` and update
  state so the row disappears immediately.
- The restaurant row currently is a full-card `Link` (via
  `RestaurantCard`). To add a remove button without nesting a button in
  a link, the ✕ sits as a sibling overlay in the top-right corner of the
  row wrapper, with `preventDefault` + `stopPropagation`.

### Why this default

Today the only way to unsave is: open restaurant, tap Saved, go back.
Three taps for a one-tap intent.

---

## Item 3: Email validation on Profile

### What

The "Weekly Valencia picks" email field rejects malformed input with an
inline message ("Enter a valid email") instead of silently accepting
`asdf`.

### How

- `Profile.tsx`: a `isValidEmail(s)` check using
  `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- On submit: if invalid, set an `error` string, render it under the
  field in `text-tomate`, do not call the API.
- Clear the error when the user edits the field.
- The Subscribe button stays disabled on empty (unchanged); validation
  covers the non-empty-but-invalid case.

### Why this default

One regex, one error line. Standard and good enough for a marketing
opt-in; no need for a validation library.

---

## Item 4: Delete dead code in Profile

### What

Remove the unused `update` helper (Profile.tsx lines ~30-32) and the
`<span hidden>{typeof update}</span>` hack (lines ~187-188) that exists
only to silence the unused-variable warning.

### How

Delete both. `tsc --noEmit` confirms nothing else references `update`.

### Why

Dead code that documents its own deadness. Just remove it.

---

## Item 5: Personalised explanation on RestaurantDetail

### What

When the user arrives at a detail page from a search, show Foody's
actual reasoning for *this* restaurant against *their* query, with the
matched-reason chips, instead of only the generic "Best for X. Typical
spend Y."

### How

- When a search is submitted (`Ask.tsx` / `Results.tsx` `handleSubmit`),
  store the raw query in `sessionStorage` under
  `foodmatch.lastIntentQuery`.
- `RestaurantDetail.tsx`: on mount, read that key. If present, parse it
  with `parseFoodIntent`, call `scoreRestaurant(intent, r)` and
  `buildMatchExplanation(intent, r, score)`, and render a "Why this fits
  your search" block (explanation sentence + reason chips + any
  warnings) above the existing generic "Why FoodMatch picks it" section.
- If absent (e.g. opened cold from Saved), show only the generic section,
  exactly as today.

### Why sessionStorage over URL plumbing

`RestaurantCard` is rendered from Ask, Results, Saved, and the shortlist.
Threading `?from=<query>` through every call site is more surface area
and more bug risk. sessionStorage is read in one place, clears itself per
tab/session (so a week-old save never shows a stale "matches your
search"), and degrades cleanly to the generic copy.

---

## Item 6: Save from the card

### What

A heart button on `RestaurantCard` so users can save straight from any
list without opening the restaurant. Tapping it toggles saved state with
the same haptic feedback the detail page uses.

### How

- `RestaurantCard.tsx`: a heart button in the top-right corner of the
  card. Filled tomate when saved, outline when not.
- Local `saved` state seeded from `isSaved(restaurant.id)`; click calls
  `saveRestaurant` / `unsaveRestaurant`, fires the existing
  `restaurant_saved` / `restaurant_unsaved` analytics, and triggers
  `hapticSuccess` / `hapticTap` from `lib/native`.
- The card is a `Link`; the heart calls `preventDefault` +
  `stopPropagation` so tapping it never navigates.

### Why this default

The save action is currently buried one level deep. Heart-on-card is the
universal pattern (Airbnb, Maps, every listing app) and the haptic is
already wired, just not reused.

---

## Files touched

- `frontend/src/lib/ranking.ts` (add `getOpenStatus`)
- `frontend/src/lib/storage.ts` (add `removeRecentSearch`)
- `frontend/src/components/OpenBadge.tsx` (new)
- `frontend/src/components/RestaurantCard.tsx` (badge + heart)
- `frontend/src/components/MatchCard.tsx` (badge)
- `frontend/src/pages/Saved.tsx` (remove handlers)
- `frontend/src/pages/Profile.tsx` (validation + dead-code removal)
- `frontend/src/pages/RestaurantDetail.tsx` (personalised block)
- `frontend/src/pages/Ask.tsx`, `frontend/src/pages/Results.tsx`
  (store last query in sessionStorage)

## Testing

Manual:
1. Card shows "Open now" / "Closes soon" / "Closed" matching seed
   opening hours; nothing when a restaurant has no hours.
2. Saved: ✕ removes a restaurant and a recent search instantly;
   "Clear all" empties recents.
3. Profile: `asdf` shows an error and does not submit; a valid address
   submits and shows the saved-at line.
4. Profile: no TS warning, no hidden span in the DOM.
5. Detail opened from a search shows the personalised block with chips;
   opened from Saved shows only the generic section.
6. Heart on a card toggles saved, persists to Saved tab, fires haptic on
   device, never navigates.

No automated tests (no harness yet; out of scope).

## Risk

Low. Every item is additive or a deletion of provably-dead code. The
only shared new code is `getOpenStatus` (pure) and `OpenBadge`
(presentational).
