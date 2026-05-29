# FoodMatch Final MVP Finish Handoff

Context: Max asked Hermes to correctly finish the FoodMatch MVP. Continue on branch `feat/functional-mobile-mvp` in `/Users/max/Projects/FoodMatch`. Preserve existing work and do not open a PR unless Max explicitly asks.

## Current local state to preserve

Hermes already made a small final hardening pass before handing off:

- Fixed restaurant partner pricing copy from stale “2 months free” to the current founder offer: `€69/mo`, locked for 24 months.
- Added `npm test` using Vitest.
- Added `frontend/src/lib/mvp.test.ts` covering:
  - craving parser for “burger and beer near Ruzafa under 20”
  - ranking to Burger Republik
  - preference-based browse to Kintaro Sushi
  - WhatsApp lead message/url behavior
  - menu highlight fallback
- Fixed a React hook dependency in `Results.tsx` (`usingPreferences`).
- Verified:
  - `cd frontend && npm run lint` PASS
  - `cd frontend && npm test` PASS, 6 tests
  - `cd frontend && npm run build` PASS
  - `cd frontend && npx cap sync` PASS for iOS + Android

Current known untracked/non-final files:

- `.claude/launch.json`
- `FOUNDERS_DOCUMENT_V2.pdf`
- `USER_GUIDE_V2.pdf`
- `frontend/src/lib/mvp.test.ts`

Do not delete PDFs unless clearly disposable; inspect and decide whether they should be committed as deliverables or ignored.

## Definition of correctly finished MVP

Finish the MVP as a demo/investor-ready, installable FoodMatch mobile app without adding speculative marketplace/payment/backend scope.

Must-have acceptance criteria:

1. User flow works end-to-end on mobile web size:
   - landing/prompt → results → detail → save → WhatsApp lead
   - preferences → browse without query → personalized results
   - partner page → submit locally + direct WhatsApp/email fallback
   - admin page → lead/event summary + JSON export
2. Pricing and partner copy is consistent with the current offer:
   - `€69/mo` founder price
   - locked for 24 months / first 100 partners if mentioned
   - no stale “2 months free” copy remains unless intentionally explained somewhere as historical.
3. Data is honest:
   - Seed restaurant data can remain fictional/demo, but UI/docs must not imply fake WhatsApp numbers or fake real menus are verified.
   - Do not fabricate real restaurant phone numbers.
4. Verification is reproducible:
   - `npm run lint`, `npm test`, `npm run build`, `npx cap sync` pass.
   - APK build attempt is documented honestly. If Android SDK/JDK are missing, leave clear instructions instead of pretending APK exists.
5. Repo is clean and reviewable:
   - Decide whether `.claude/launch.json` belongs in `.gitignore` or committed; prefer ignore if local-only.
   - Decide what to do with `FOUNDERS_DOCUMENT_V2.pdf` and `USER_GUIDE_V2.pdf` after inspecting them.
   - Update `docs/plans/2026-05-29-functional-mobile-mvp-progress.md` with final verification, changed files, remaining blockers, and “ready/not ready” status.

## Suggested next steps

1. Start with `git status --short` and inspect the diff from Hermes.
2. Search for stale partner/pricing copy:
   - `2 months`, `free for the first`, `€69`, `69/mo`, `24 months`, `founder price`.
   - Update any stale user-facing docs/pages.
3. Run/extend final tests only where high leverage. Avoid over-engineering.
4. Do a quick manual smoke using Vite preview if possible, mobile viewport if available:
   - Query: `juicy burger in Ruzafa under 20`
   - Query: `date night sushi in Ruzafa`
   - Partner page direct contact buttons exist.
   - Admin export button exists.
5. Attempt APK build only if JDK/Android SDK are available:
   - `cd frontend && npm run android:apk`
   - If it fails due to missing local tooling, document exact missing tooling and output path expected.
6. Commit final MVP changes only if the repository convention/current session expects it; otherwise leave a clean, documented working tree for Max to review.

## Final output required

When done, report back with:

- What changed
- Commands run and pass/fail status
- Whether an APK exists; if yes, exact path; if no, exact blocker
- Any remaining non-code decisions Max must make
- Whether the MVP is ready for demo/review
