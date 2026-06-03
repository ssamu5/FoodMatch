# FoodMatch MVP expansion handoff — Samuel voice notes

## Context
Samuel sent two voice notes with product/business direction for FoodMatch. The current strategic direction remains: polished professional MVP/web presence first, Valencia-first, validation-led, restaurant/investor-ready.

## Samuel feedback summary
1. **Bootstrap restaurants from public information**
   - Free/basic listings should use public info restaurants already expose online: name, location, opening hours, menu links, photos, cuisine/category, website/Instagram/phone/WhatsApp where available.
   - Restaurants do not need to manually sign up before being visible in the MVP.
   - This lets FoodMatch look populated and useful earlier.
   - Later, restaurants can claim/upgrade to Pro/Partner plans for more control/features.

2. **Upsell paid plans after user traction**
   - Build the restaurant database and user demand first.
   - Use usage signals/searches/saves/taps as proof.
   - Paid restaurant plan should feel like an upgrade from an existing public listing, not a blocker to initial coverage.

3. **Use existing food apps for UX inspiration**
   - Do not copy functions blindly.
   - Look at how restaurant discovery apps structure listings/cards/details/photos/navigation.
   - Improve layout hierarchy and browsing confidence.

4. **Add account/profile flow to the MVP**
   - Samuel thinks users should be able to register/sign up/sign in and set up a profile.
   - For MVP, avoid overbuilding real auth unless project already has it. A polished local/demo profile flow is acceptable if backend/auth is not ready.
   - The purpose is to make the app feel like a real product and prepare for personalization.

5. **Restaurant cards need stronger main photos**
   - Each restaurant should have a recognizable hero/main image.
   - Prefer food/product/venue images that make the restaurant identifiable.
   - Cards should not feel generic or empty.

## Implementation direction
Please continue the current FoodMatch MVP work and expand it in the highest-impact way without overbuilding.

### Product changes to implement
- Add or improve the concept of **public/basic restaurant listings**:
  - Copy should explain that FoodMatch uses public restaurant information for discovery and lets restaurants claim/upgrade listings.
  - Restaurant partner page should position paid plans as “claim/control/enhance your listing” and access demand insights, not only “apply from zero.”
  - Add privacy/fairness language: public data is used to help diners discover restaurants; restaurants can contact FoodMatch to correct/claim/remove/update their listing.

- Improve **restaurant browse/results cards**:
  - Ensure every visible restaurant has a strong image/visual fallback.
  - Add clear card hierarchy: image, name, cuisine/vibe, area, price/budget cue, match reason or best-for line.
  - Add CTA/tap targets: view details, save, WhatsApp/website if already implemented.

- Add a lightweight **profile/sign-in surface** if no real auth exists:
  - Create a polished demo profile route/page or modal with fields like name, dietary preferences, favorite areas, budget, saved vibes.
  - Make it clear enough for MVP demos without requiring real backend auth if not available.
  - Add navigation entry or CTA from home/results/profile icon if appropriate.

- Strengthen **MVP professionalism**:
  - Landing/app copy should read like a serious Valencia pilot, not just a prototype.
  - Restaurant-side value prop: public listing → claim listing → Pro/Founder plan → insights/control.
  - User-side value prop: craving/profile-aware recommendations.

### Constraints
- Preserve existing local changes.
- Inspect current repo/diff before editing.
- Do not add heavy dependencies unless necessary.
- Do not implement scraping or external data ingestion unless already present and safe. For now, model it through seed data/copy/UI.
- Do not deploy, push, or open a PR unless Max explicitly asks.
- Keep the MVP shippable.

## Likely files to inspect
- `frontend/src/pages/Home.tsx`
- `frontend/src/pages/RestaurantPartner.tsx`
- Results/browse/detail pages under `frontend/src/pages/`
- Restaurant seed/data files under `frontend/src/lib/`, `frontend/src/data/`, or similar
- Routing/nav components under `frontend/src/components/`
- `frontend/index.html`, manifest copy if needed

## Verification
From `/Users/max/Projects/FoodMatch/frontend` or the correct project subdir:
- Run available scripts: lint, typecheck/test if present, build.
- If Capacitor/mobile exists, only sync/build native if this is already part of current workflow and safe.
- Report exactly what passed/failed.

## Closeout report
Please report:
- Key UX/product changes made.
- Files changed.
- Checks/build status.
- Any unresolved tradeoffs/blockers.
