# Investor demo mode (guided, interactive)

Status: design approved (pending spec review)
Date: 2026-06-21
Owner: Max (CTO)

## Summary

A guided, **fully interactive** demo mode inside the FoodMatch app for live
investor and partner pitches. It is the real, clickable application (real
natural-language search, real navigation, real WhatsApp deep link) running on
curated, real-looking data, with a light **coach-mark layer** on top that
narrates the story and points to the best next action. The presenter (or the
investor) actually clicks through the product. The guide can be skipped at any
time to free-explore.

This is explicitly NOT a passive auto-playing reel and NOT a set of
screenshots. The differentiator we are showing, the conversational search to a
short ranked shortlist, only lands if the person uses it themselves.

## Key principles

- **Real app, real clicks.** No hijacked navigation. The user performs the
  actual interactions; the guide reacts to where they are.
- **Guidance is additive and optional.** Coach-marks suggest and narrate; the
  app underneath is the normal, working app. "Skip tour" / "Exit" returns to
  plain free-exploration with the curated data still in place.
- **Isolation.** All demo code lives in its own module and overlay. The real
  screens stay clean; they read demo state only where strictly needed (a
  curated featured query/restaurant), behind a small hook.
- **Bilingual.** All captions in ES (default) and EN via the existing i18n,
  honoring the language toggle.

## Activation and exit

- Route `/demo` mounts the app with demo mode active: a short investor-framed
  splash (one-line value prop + "Start" / "Empezar"), then into the live app at
  the first coach-mark.
- A subtle "Investor demo" link in the Welcome footer (small, easy to find when
  presenting, ignorable by normal users).
- "Exit" / "Skip tour" on the overlay clears the guide but keeps demo data;
  the app is fully usable. Re-entering `/demo` restarts the guide.

## Architecture

Four small units, separate from the screens:

- `lib/demo/demoScript.ts` - the ordered steps. Each step:
  `{ id, match (route or predicate), captionKey, hint?, spotlight? }`.
  `match` decides which step is "current" given the app's location/state, so the
  guide is **state-driven**, not a navigator. `spotlight` is a CSS selector or
  `data-demo` id to ring/point at. Captions are i18n keys.
- `lib/demo/DemoContext.tsx` - React context: `active`, `stepIndex`,
  `enter()`, `exit()`, `next()`, `back()`, and `seenSteps`. Persists "active"
  in sessionStorage so a refresh mid-pitch does not drop the guide.
- `components/demo/DemoOverlay.tsx` - a fixed, non-blocking caption card
  (talking point + step dots + Next / Back / Skip) plus a lightweight spotlight
  (a highlight ring + dimmed scrim with a cutout around the target; pointer
  events pass through to the real control so clicks still work).
- `components/demo/useDemoStep.ts` - derives the current step from the route +
  any demo state and advances `seenSteps` when the user takes the real action
  (e.g. arriving at `/results`, opening a detail). Next/Back are manual
  overrides; real actions auto-advance the narration.

Wiring: `DemoProvider` wraps the app inside `BrowserRouter`. `DemoOverlay`
renders once at the shell level and shows only when `active`. Screens add a few
`data-demo="..."` hooks (e.g. on the top match card, the WhatsApp button) for
spotlight targeting. No screen logic changes.

## Curated data

- A featured suggestion query that yields a strong shortlist, surfaced as the
  highlighted starter chip on Home so the user taps a real chip and runs a real
  search. Candidate: "cena romantica japonesa cerca del centro, sobre 40 euros".
- A flagship restaurant for the detail beat (e.g. Hana Sushi) that already reads
  well bilingually after the description work.
- Covers use the existing branded gradient monograms for now. AI hero images
  (kie.ai pipeline) are a drop-in upgrade once the key is live; the spec marks
  the slot but does not block on it.

## Guided flow (beats)

Each beat = an app state the user reaches by clicking, plus a coach-mark.

1. **Problem** (splash / Home). "Finding where to eat in Valencia means 200
   generic results." CTA: "Ask FoodMatch instead."
2. **Ask naturally** (Home). Spotlight the curated starter chip. "Diners just
   say what they want, in Spanish or English." Advance: user runs the search.
3. **Short ranked shortlist** (`/results`). Spotlight the top match + its
   reasons. "Not 200 results. A handful, ranked, each with why it fits."
   Advance: user opens a detail.
4. **Beautiful local listing** (`/restaurant/:slug`). Spotlight the WhatsApp
   CTA. "Accurate local info, why it matches, one tap to reach the restaurant."
   Advance: user continues (Next) or taps WhatsApp.
5. **The business** (restaurateur view). "Restaurants claim and manage their own
   listing. They pay; diners never do." Skippable.
6. **Model + ask** (closing card). "Free for diners, SaaS for restaurants. Live
   pilot in Valencia." Includes the raise/ask line, editable.

## Controls

- Tap Next / Back, step dots, Skip/Exit; keyboard left/right and Esc.
- Real user actions (search, open detail) auto-advance the narration so the
  guide never blocks a natural click.
- The overlay is non-modal: the underlying control is always clickable.

## Edge cases

- User navigates off-script: the state-driven matcher shows the closest relevant
  caption or a neutral "explore freely, Next to continue" card.
- Back button / refresh: sessionStorage keeps `active` and `stepIndex`.
- Empty/odd search: the curated chip guarantees a good shortlist for the scripted
  path; free typing still works (it is the real app).
- Reduced motion: spotlight uses opacity only; respects the existing guard.

## Testing

- Unit: `demoScript` matcher resolves the right step for each route/state;
  `DemoContext` next/back/exit transitions; sessionStorage persistence.
- i18n: ES/EN parity for all new caption keys (existing locales parity test).
- Manual/preview: click through all 6 beats in ES and EN, light and dark, on
  mobile viewport; confirm spotlighted controls remain clickable; confirm Exit
  yields a fully working app.

## Out of scope (MVP)

- Pixel-perfect spotlight masking (use a ring + soft scrim cutout).
- Auto-play / unattended kiosk mode (interactive by design; can add later).
- Demo analytics, multi-restaurant scripted deep-dives, AI hero images
  (separate, gated on the kie.ai key).

## Follow-ups

- Drop in AI hero images for the flagship demo restaurants when the kie.ai key
  is rotated.
- Optional: a curated demo dataset (8-12 flagship restaurants) if the live 200
  placeholders ever look thin during a pitch.
