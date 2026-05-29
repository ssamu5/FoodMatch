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
- **Partner pricing copy** on `/restaurants` was updated from the stale
  “2 months free” version to the current €69/month founder price locked
  for 24 months.
- **No automated test harness** existed initially; Hermes added Vitest and a
  minimal MVP unit suite for ranking, preferences, WhatsApp leads, and menu
  fallbacks.
- 2 moderate npm audit advisories (transitive, dev). Not addressed to
  avoid `--force` breaking changes mid-MVP.

### Status: ready for review on `feat/functional-mobile-mvp`. No PR opened
(per instruction) until you confirm the Android/APK approach.

---

## Hermes final hardening pass (2026-05-29)

Max asked to correctly finish the MVP and instruct the Claude Code session to continue the final pass. Hermes applied the first cleanup before handoff:

- Updated restaurant partner pricing copy from stale “2 months free” to the current founder offer: `€69/mo`, founder price locked for 24 months.
- Added `vitest` and `npm test` for a minimal reproducible MVP test harness.
- Added `frontend/src/lib/mvp.test.ts` covering the core investor-demo loop:
  - craving parser extracts burger/Ruzafa/€20 signals;
  - ranking chooses Burger Republik for a burger/Ruzafa query;
  - saved taste profile drives browse-without-query to Kintaro Sushi;
  - WhatsApp lead messages include restaurant + craving;
  - demo restaurants fall back to numberless WhatsApp links;
  - menu highlight fallback returns useful cuisine samples.
- Fixed `Results.tsx` summary memo dependency to include `usingPreferences`.
- Wrote final Claude handoff plan: `docs/plans/2026-05-29-final-mvp-finish-handoff.md`.

### Verification after Hermes hardening

| Check | Result |
|-------|--------|
| `npm run lint` | PASS |
| `npm test` | PASS, 6 tests |
| `npm run build` | PASS, 280.01 kB (gzip 85.51 kB), ~0.60s |
| `npx cap sync` | PASS, iOS + Android, 6 plugins each platform |

### Remaining final-pass items for Claude

- Sweep for any remaining stale partner/pricing copy in pages/docs.
- Inspect `.claude/launch.json`, `FOUNDERS_DOCUMENT_V2.pdf`, and `USER_GUIDE_V2.pdf` and decide commit vs ignore/remove.
- Re-attempt/document `npm run android:apk` only if Android/JDK tooling is available; otherwise keep the tooling blocker explicit.
  - Hermes re-attempted it: FAILS because macOS cannot locate a Java Runtime. Install JDK 17 before expecting an APK.
- Run a mobile smoke preview and update this progress file with final demo-readiness status.

---

## Claude finishing pass (2026-05-29)

Picked up Hermes' handoff (`2026-05-29-final-mvp-finish-handoff.md`),
preserved all local changes, completed the remaining items.

### Verification (re-run, all green)

| Check | Command | Result |
|-------|---------|--------|
| Lint | `npm run lint` | PASS |
| Tests | `npm test` (vitest) | PASS, 6/6 |
| Build | `npm run build` | PASS, 280.01 kB (gzip 85.51 kB), ~0.62s |
| Cap sync | `npx cap sync` | PASS, iOS + Android, 6 plugins each |
| APK | `npm run android:apk` | FAIL (no JDK) - blocker unchanged, see below |

### Stale-copy sweep (repo-wide)

Searched `2 months`, `months free`, `free for the first`, `€69`, `69/mo`,
`24 months`, `founder price` across `frontend/src` and `website`.

- App: NO stale "2 months free" remains. Partner page shows `€69/mo` +
  "founder price locked for 24 months" (verified live in preview).
- Website (`website/index.html`): intentionally describes the full public
  offer = 2-month free trial THEN €69/mo for 24 months for the first 100,
  €99/mo after. This is internally consistent and explained, not stale.
  Left unchanged. See decision note below.

### Smoke test (mobile preview, 375x812)

- `/restaurants`: €69/mo + 24 months copy, no stale text, WhatsApp/Email
  fallback buttons present.
- Query "date night sushi in Ruzafa": top match Kintaro Sushi, sushi
  shortlist (Sumi Omakase, Sushi Go VLC). "Foody found 35 matches".
- Console: no errors.
- (Prior round verified the full craving -> detail -> WhatsApp wedge,
  menu highlights, admin export/funnel, preference browse.)

### Untracked-file decisions

- `.claude/launch.json`: local-only Vite preview helper. Added `.claude/`
  to `.gitignore`. Not committed.
- `FOUNDERS_DOCUMENT_V2.pdf`: page 1 reads "Internal working document".
  Contains strategy/pricing/competitive analysis. The repo is on GitHub
  (`ssamu5/FoodMatch`), so this is NOT committed. Added to `.gitignore`
  (force-add if you decide to publish). File preserved locally.
- `USER_GUIDE_V2.pdf`: marketing explainer, a deliverable but not MVP code.
  Also gitignored, preserved locally. Force-add if you want it tracked.

### APK status (honest): NOT BUILT - blocked on local tooling

`./gradlew assembleDebug` fails: "Unable to locate a Java Runtime."
`/usr/libexec/java_home` confirms no JDK. No Android SDK either. The
Android Capacitor project exists and syncs cleanly; only the native
compile is blocked. To build on a tooled machine:
1. `brew install --cask temurin@17` (JDK 17) + Android Studio / cmdline-tools.
2. Set `ANDROID_HOME`, run `sdkmanager --licenses`.
3. `cd frontend && npm run build && npx cap sync android && npm run android:apk`.
4. APK output: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.

### Non-code decisions for Max

1. **PDFs**: keep gitignored (current choice) or commit as deliverables?
   The founders doc is internal; recommend keeping it out of a public repo.
2. **Free-trial messaging**: the marketing site offers a 2-month free trial
   before the €69 founder price; the in-app partner page only shows the
   €69/24mo headline. If you want them identical, add the free-trial line
   to the app partner page (or drop it from the site). Left as-is.
3. **APK**: install JDK/Android SDK locally (or use CI / Android Studio) to
   produce the debug APK. iOS device build needs Xcode signing.

### Demo-readiness: READY for demo/review (web + iOS sync).

Full investor-demo loop works end-to-end on mobile web. iOS project
syncs (Xcode 26.2 present). Android project exists and syncs; APK pending
JDK/SDK. No PR opened and nothing pushed, per instruction.

