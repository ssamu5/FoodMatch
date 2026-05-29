# FoodMatch Functional Mobile MVP - Progress

Branch: `feat/functional-mobile-mvp`
Started: 2026-05-29
Executor: Claude (Opus 4.8), executing-plans skill

---

## Task 1: Baseline health check

Ran on a clean checkout of `feat/functional-mobile-mvp` (branched from
`main` @ `b61b88f`).

| Check | Command | Result |
|-------|---------|--------|
| Lint  | `cd frontend && npm run lint` (`tsc --noEmit`) | PASS, no errors |
| Build | `cd frontend && npm run build` (`vite build`) | PASS, built in ~0.67s, bundle 271.97 kB (gzip 82.89 kB) |

Capacitor: v8.3.4 (core/cli/ios), `@capacitor/android` NOT installed, no
`ios:open`/`android:*` npm scripts yet. iOS project present under
`frontend/ios/`.

**No failures to understand. Safe to proceed.**

### Plan-vs-reality reconciliation

A large part of the plan's user-facing layer was already implemented in
the prior session (commits `8506b87`, `b61b88f`). To avoid redoing work
and risking regressions, those items are verified rather than rebuilt:

| Plan task | Status before this run |
|-----------|------------------------|
| T2 mobile shell (safe areas, bottom nav, theme) | Present (safe-top/safe-bottom, BottomNav, light/dark/system) |
| T4 open status + save on cards | Present (OpenBadge, heart save) |
| T5 personalised detail explanation | Present ("Why this fits your search") |
| T6 saved mgmt + storage | Present (save/remove/clear) |
| T7 partner form + persistence | Present (localStorage via api) |
| T8 analytics buffer + admin summary | Present (track + summarizeEvents + Admin) |
| T10 iOS Capacitor | Present |

### Genuine gaps this run targets (user's stated priority order)

1. WhatsApp lead CTA (craving-aware deep link) - the monetization wedge. NEW.
2. Restaurant detail menu highlights. NEW (cuisine-based, labelled demo).
3. Share action wired through Capacitor Share + analytics. Partial.
4. Partner page mailto/WhatsApp fallback. NEW.
5. Admin JSON export/copy. NEW.
6. Preference-based browse when no query present. NEW.
7. Android Capacitor project + APK attempt. NEW.
8. iOS sync re-verify. 

### Latent bug found
`Admin.tsx` used `hover:text-bad` (undefined Tailwind color; config has
`warn`). Fixed to `hover:text-tomate` during T7/T8 work.

---

## Implementation log

### Delivered this run

**WhatsApp lead CTA (the wedge) - NEW**
- `frontend/src/lib/leads.ts` (new): `buildWhatsAppUrl`, `buildLeadMessage`,
  `lastCraving`, `hasVerifiedWhatsApp`, `menuHighlightsFor`.
- `buildWhatsAppUrl` uses the restaurant's verified `whatsapp` number when
  present; otherwise a numberless `https://wa.me/?text=...` so the demo
  never dead-ends on a fake number.
- `frontend/src/lib/native.ts`: added `openExternal(url)` (`_system` on
  native, new tab on web) for WhatsApp / mailto / maps deep links.
- `RestaurantDetail.tsx`: prominent green "Reservar o pedir por WhatsApp"
  CTA with craving-aware Spanish message, honest demo-number label,
  `whatsapp_lead_clicked` analytics + haptic.
- Verified live: CTA produced
  `https://wa.me/?text=Hola Burger Republik, os he encontrado en FoodMatch...
  Buscaba: "juicy burger in Ruzafa under 20". Teneis disponibilidad? Gracias!`

**Menu highlights - NEW**
- `types/restaurant.ts`: optional `menuHighlights?: string[]` and `whatsapp?`.
- `menuHighlightsFor()` returns explicit data when present, else a curated
  cuisine preset, surfaced on the detail page tagged "sample" when derived.

**Partner page direct-contact fallback - NEW**
- `RestaurantPartner.tsx`: "WhatsApp us" + "Email us" buttons (prefilled
  wa.me / mailto), `partner_interest_started` analytics. Form persistence
  via `api.submitRestaurantLead` was already present.

**Admin learning loop - NEW + fixes**
- `analytics.ts`: `summarizeEvents` now reports opens, saves, whatsappLeads,
  shares, and `whatsappLeadsByRestaurant`. Added `exportBundle()` (pretty
  JSON of summary + raw events).
- `Admin.tsx`: "Export JSON" (clipboard, with data-URL fallback), new metric
  row (Opens / Saves / WA leads / Shares), "WhatsApp leads by restaurant"
  funnel section. Fixed latent `hover:text-bad` -> `hover:text-tomate`.
- New analytics event types: `whatsapp_lead_clicked`, `share_clicked`,
  `partner_interest_started`. `share_clicked` now fired from detail Share.

**Preference-based browse - NEW**
- `foodIntent.ts`: `profileHasSignal()` + `intentFromProfile()`.
- `Results.tsx`: opening results with no query ranks by saved taste and
  labels the view "Based on your taste". Verified: with a sushi+Ruzafa
  profile, sushi spots ranked first.

### Tests / verification

| Check | Result |
|-------|--------|
| `npm run lint` (tsc) | PASS |
| `npm run build` (vite) | PASS, 280.00 kB (gzip 85.49 kB), ~0.63s |
| `npx cap sync` (ios + android) | PASS, 6 plugins each platform |
| WhatsApp CTA URL (live, preview) | PASS, valid wa.me with craving |
| Menu highlights render | PASS (cuisine fallback, "sample" tag) |
| Partner WhatsApp/Email fallback | PASS (buttons present + wired) |
| Admin export + lead metrics | PASS (Export JSON, WA-leads funnel) |
| Preference browse (no query) | PASS ("Based on your taste", sushi-first) |
| Light + dark theme | PASS (verified prior session, unchanged) |

Smoke flow confirmed end-to-end in mobile preview (375x812):
craving -> ranked matches -> detail -> save -> WhatsApp lead, plus
partner interest and admin funnel.

### Artifacts

- Web build output: `frontend/dist/` (production build passes).
- iOS project: `frontend/ios/` (synced, Xcode 26.2 present on this machine).
- Android project: `frontend/android/` (created via `npx cap add android`,
  synced, 6 plugins detected). New npm scripts: `cap:sync`, `ios:open`,
  `android:open`, `android:apk`.

### APK status: BLOCKED (tooling not installed on build machine)

`./gradlew assembleDebug` fails with: **"Unable to locate a Java Runtime."**
This machine has no JDK, no Android SDK (`ANDROID_HOME`/`ANDROID_SDK_ROOT`
unset, no `~/Library/Android/sdk`), and no system Gradle. The Android
*project* exists and is sync-clean; only the native compile is blocked.

To produce the debug APK on a properly tooled machine:
1. Install JDK 17 (e.g. `brew install --cask temurin@17`) and Android
   Studio (or command-line tools).
2. Set `ANDROID_HOME` (e.g. `~/Library/Android/sdk`) and accept SDK
   licenses (`sdkmanager --licenses`).
3. From `frontend/`: `npm run build && npx cap sync android`.
4. `npm run android:apk` (runs `cd android && ./gradlew assembleDebug`).
5. APK output: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.

Alternatively open in Android Studio: `npm run android:open`, then Run.

### Risks / follow-ups

- **WhatsApp numbers are demo placeholders.** Seed restaurants have no
  verified `whatsapp`, so the CTA uses the numberless picker. Production
  needs real per-restaurant numbers in the `whatsapp` field to deep-link
  a specific chat. UI labels this honestly.
- **Menu highlights are cuisine-derived samples** for most restaurants
  (tagged "sample"). Real menus should populate `menuHighlights` per
  restaurant before any non-demo use.
- **APK not built here** (see above). iOS requires Xcode signing for a
  device/TestFlight build; simulator run works without signing.
- **Partner pricing copy** on `/restaurants` still says "2 months free"
  which predates the €69/24-month founder decision. Left unchanged (not
  in scope); flag for Samuel's review.
- **No automated test harness** in the repo; verification is lint + build
  + manual preview. Adding Vitest + a few ranking/leads unit tests is the
  natural next step.
- 2 moderate npm audit advisories (transitive, dev). Not addressed to
  avoid `--force` breaking changes mid-MVP.

### Status: ready for review on `feat/functional-mobile-mvp`. No PR opened
(per instruction) until you confirm the Android/APK approach.
