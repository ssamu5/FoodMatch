# FoodMatch Functional Mobile MVP Implementation Plan

> **For Hermes/Claude Code:** Build this task-by-task in the existing FoodMatch repository. Prioritize a real testable iOS/Android MVP over speculative marketplace features.

**Goal:** Ship a functional FoodMatch MVP that runs as a polished mobile app on iOS and builds an Android APK, allowing Valencia users to describe a craving, get ranked restaurant matches, inspect detail pages, save places, and send order/reservation leads through WhatsApp.

**Architecture:** Keep the MVP frontend-first with local seed data and Capacitor mobile wrappers so it can be installed/tested immediately. Use the existing React/Vite/Tailwind app, existing ranking/parser modules, and existing Capacitor iOS setup. Add Android Capacitor support and only add backend work where it directly supports a functional demo. Restaurant monetization starts with lead generation/contact capture, not full payments.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, React Router, Capacitor iOS/Android, localStorage, WhatsApp deep links, optional Express/Prisma backend later.

---

## Product scope — real MVP, not bloated v1

### User-facing MVP
1. Mobile-first landing page with Foody prompt.
2. Natural-language craving parser: cuisine, area, budget, vibe, dietary, open-now.
3. Ranked result list with clear “why this matches you”.
4. Restaurant detail page with menu highlights, opening status, pricing, vibe, map/address placeholder, and CTA.
5. Save/favorite restaurants locally.
6. Profile/preferences stored locally: dietary preferences, budget, favorite areas.
7. WhatsApp lead CTA: “Reserve / order via WhatsApp” prefilled with restaurant + user intent.
8. Share result CTA using Capacitor Share where available.
9. Basic restaurant partner/admin demo pages: explain value, collect restaurant interest/contact locally or via mailto/WhatsApp.
10. App builds:
    - Web production build passes.
    - iOS Capacitor project syncs.
    - Android Capacitor project exists and can produce a debug APK.

### Explicitly out of scope for this MVP
- Stripe/payments.
- Real user accounts/JWT unless already working cleanly.
- Live restaurant inventory.
- Real AI API calls before product validation.
- Complex backend deployment.
- App Store / Play Store release; debug/TestFlight-ready artifacts only.

---

## Implementation tasks

### Task 1: Baseline health check

**Objective:** Establish the current working state before changing code.

**Files:**
- Read: `frontend/package.json`
- Read: `frontend/src/App.tsx`
- Read: `frontend/src/data/seedRestaurants.ts`
- Read: `frontend/src/lib/ranking.ts`
- Read: `frontend/src/lib/foodIntent.ts`

**Steps:**
1. Run `cd frontend && npm run lint`.
2. Run `cd frontend && npm run build`.
3. Record failures in `docs/plans/2026-05-29-functional-mobile-mvp-progress.md`.
4. Do not start refactors until failures are understood.

**Verification:** Current build/lint status is documented.

---

### Task 2: Harden the mobile app shell

**Objective:** Make the web app behave like a native-feeling mobile app.

**Files:**
- Modify: `frontend/src/components/AppShell.tsx`
- Modify: `frontend/src/components/BottomNav.tsx`
- Modify: `frontend/src/index.css` or global stylesheet
- Modify: `frontend/src/lib/native.ts`

**Steps:**
1. Ensure safe-area padding for iOS notch/bottom bar.
2. Ensure bottom nav is reachable with thumb and does not cover content.
3. Ensure all pages have consistent max-width/mobile frame.
4. Add haptic feedback only where already supported and gracefully no-op on web.
5. Verify light/dark/system theme still works.

**Verification:** `npm run lint && npm run build` passes.

---

### Task 3: Make the Foody prompt produce practical result URLs

**Objective:** From landing, the user enters one sentence and lands on useful matches.

**Files:**
- Modify: `frontend/src/pages/Home.tsx`
- Modify: `frontend/src/pages/Ask.tsx`
- Modify: `frontend/src/pages/Results.tsx`
- Modify: `frontend/src/lib/foodIntent.ts`

**Steps:**
1. Confirm prompt submission preserves query in URL.
2. If `/ask` is redundant, make it a helpful transition/explanation page or route directly to `/results?q=...`.
3. Improve parser examples for Valencia: Ruzafa, El Carmen, City center, beach, budget, vegan, halal, date night, group dinner, quick lunch.
4. Add empty-state suggestions that rewrite the query.

**Verification:** Manual queries produce believable matches:
- “burger and beer near Ruzafa under 20”
- “romantic Italian date night city center”
- “vegan lunch open now”

---

### Task 4: Upgrade result cards into decision cards

**Objective:** Each card must explain why it was recommended and push toward action.

**Files:**
- Modify: `frontend/src/components/RestaurantCard.tsx`
- Modify: `frontend/src/components/MatchCard.tsx`
- Modify: `frontend/src/lib/ranking.ts`
- Modify: `frontend/src/types/search.ts`

**Steps:**
1. Show rank, score, price, cuisine, area, open status.
2. Show 2–3 match reasons from ranking output.
3. Add “View”, “Save”, “WhatsApp”, and “Share” actions.
4. Avoid fake precision: use simple honest labels like “Best match”, “Budget fit”, “Near your area”.

**Verification:** Cards are readable on mobile and actions work on web.

---

### Task 5: Complete restaurant detail pages

**Objective:** Detail page should be strong enough to show investors/users as a real app.

**Files:**
- Modify: `frontend/src/pages/RestaurantDetail.tsx`
- Modify: `frontend/src/data/seedRestaurants.ts`
- Modify: `frontend/src/types/restaurant.ts`

**Steps:**
1. Ensure each seed restaurant has slug, image, cuisines, area, price, rating, opening hours, short description, menu highlights, phone/WhatsApp placeholder, and tags.
2. Detail page shows hero, match explanation, menu highlights, practical info, and CTA.
3. CTA opens WhatsApp URL with prefilled text including restaurant name and last user craving.
4. Add fallback if restaurant slug not found.

**Verification:** Every restaurant in seed data opens a useful detail page.

---

### Task 6: Local saved places and preferences

**Objective:** Provide retention without needing auth.

**Files:**
- Modify: `frontend/src/lib/storage.ts`
- Modify: `frontend/src/pages/Saved.tsx`
- Modify: `frontend/src/pages/Profile.tsx`
- Modify: `frontend/src/types/profile.ts`

**Steps:**
1. Store saved restaurant IDs in localStorage.
2. Store preferences: dietary, budget, favorite areas, default vibe.
3. Results ranking should optionally use preferences if no query is present.
4. Saved page shows saved cards and useful empty state.

**Verification:** Save persists after reload.

---

### Task 7: Restaurant partner MVP

**Objective:** Make FoodMatch credible as a startup: two-sided marketplace story without overbuilding.

**Files:**
- Modify: `frontend/src/pages/RestaurantPartner.tsx`
- Modify: `frontend/src/pages/Admin.tsx`

**Steps:**
1. Partner page explains: get matched with high-intent diners, receive WhatsApp leads, early Valencia pilot.
2. Add simple interest form with localStorage persistence and mailto/WhatsApp fallback.
3. Admin page shows demo metrics from local analytics: searches, saved places, lead clicks.

**Verification:** A restaurant owner can understand the value in under 30 seconds.

---

### Task 8: Analytics learning loop

**Objective:** Capture enough behavior to learn what users want.

**Files:**
- Modify: `frontend/src/lib/analytics.ts`
- Use existing calls in pages/components.

**Steps:**
1. Store anonymous events locally with timestamp and device ID.
2. Track landing viewed, prompt submitted, results viewed, filters applied, restaurant opened, saved, WhatsApp lead clicked, share clicked.
3. Add lightweight admin view to export/copy JSON.

**Verification:** Events appear in localStorage and admin demo view.

---

### Task 9: Add Android Capacitor support

**Objective:** Create an Android project and produce an APK build path.

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/capacitor.config.ts`
- Create/update: `frontend/android/` via Capacitor

**Steps:**
1. Install `@capacitor/android` matching current Capacitor version.
2. Add scripts:
   - `cap:sync`: `npm run build && npx cap sync`
   - `ios:open`: `npm run build && npx cap sync ios && npx cap open ios`
   - `android:open`: `npm run build && npx cap sync android && npx cap open android`
   - `android:apk`: build debug APK via Gradle if Android project exists.
3. Run `npx cap add android` if `android/` is missing.
4. Run `npm run build && npx cap sync`.
5. Build debug APK if Android SDK/Gradle are available. If not, document exact blocker and next command.

**Verification:** Android folder exists, Capacitor sync succeeds, APK either exists or blocker is documented.

---

### Task 10: iOS sync verification

**Objective:** Keep iOS project build-ready.

**Files:**
- Existing: `frontend/ios/`
- Modify: `frontend/capacitor.config.ts` if needed.

**Steps:**
1. Run `npm run build && npx cap sync ios`.
2. Do not require signing/App Store setup.
3. Document next Xcode command if manual signing is needed.

**Verification:** iOS Capacitor sync succeeds.

---

### Task 11: Smoke-test MVP flows

**Objective:** Prove the MVP is usable end-to-end.

**Steps:**
1. Run web app locally.
2. Test landing → query → results → detail → save → WhatsApp/share.
3. Test saved page reload persistence.
4. Test partner page interest form.
5. Run final `npm run lint && npm run build`.
6. Save screenshots or notes to `docs/plans/2026-05-29-functional-mobile-mvp-progress.md`.

**Verification:** Progress doc contains final status, build outputs, APK path/blocker, and remaining issues.

---

## Acceptance criteria

- `frontend npm run lint` passes.
- `frontend npm run build` passes.
- iOS Capacitor sync passes.
- Android Capacitor project exists.
- Debug APK is generated, or the exact Android SDK/tooling blocker is documented.
- User can complete: craving → matches → detail → save → WhatsApp lead.
- App feels like FoodMatch/Foody, not a generic restaurant template.
- No fake claims: if data is seed/demo, UI labels it honestly enough for an MVP demo.
