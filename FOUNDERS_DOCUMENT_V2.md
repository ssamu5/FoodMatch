# FoodMatch
## Founders Document V2 (Focused)

**Version:** 2.0
**Date:** 6 May 2026
**Authors:** Max (CTO) and Samuel (CEO)
**Status:** Internal working document, supersedes V1 of 1 May 2026

---

## 0. What changed and why

V1 was ambitious. It described a platform that would be Instagram, Eventbrite, TheFork, and Yelp combined for Spanish Gen Z. Reading it back honestly, it was five products written like one.

We are two founders. We have zero paying customers. We have no users yet. We have a sprint 1 prototype.

Two founders cannot build five products. Two founders can build one product brilliantly. That is what V2 is about.

The single product we are building is conversational AI restaurant discovery for Valencia, in Spanish and English, that helps a hungry person decide where to eat in under a minute.

Everything else (social feeds, ranks, events, food truck tracking, influencer section, premium user subscriptions) is parked in the "future" section. Not killed forever. Parked until the wedge works.

If we master the wedge, the rest becomes possible. If we try to do everything, we ship nothing well, and the wedge dies along with the rest.

---

## 1. Executive Summary

**What we are building**

FoodMatch is a conversational AI restaurant discovery app for Valencia. A user speaks or types "where can I eat good paella tonight, somewhere quiet, around 25 euros," and gets three real, current, accurate options. In Spanish or English. Including the small restaurants Google does not surface and TheFork does not list.

**Who we are building it for**

Two users, in this order:

1. **Restaurants in Valencia who pay us €99/month** to be properly indexed, managed, and discoverable. Especially small independents who get squeezed by TheFork commissions.
2. **Tourists and locals in Valencia** who use the app for free to find places to eat.

The restaurant pays. The user does not. This is a B2B SaaS product that uses a free consumer app as its acquisition channel.

**Why we win**

- Google Maps gives lists, not decisions. We give decisions in plain Spanish or English.
- TheFork has 1 to 2 percent of restaurants in any city and pushes them into a discount race. We have full coverage and do not require discounts.
- Instagram has the photos but no decision flow. We have the decision flow.
- Pure AI tools (ChatGPT, Perplexity) do not know what is open right now in Valencia, what just changed the menu, what is fully booked. We do.

**Why now**

- AI conversational search is finally good enough to answer "where can I eat" naturally (Claude, GPT-4 era).
- Google AI Mode is rolling out in 5 countries already and will land in Spain in 6 to 18 months. We have a window.
- Valencia is Spanish Capital of Gastronomy adjacent (Alicante 2025, Valencia gastronomic momentum continues into 2026 and 2027).
- World Cup 2026 brings tourism and event-driven dining demand to Spain.

**What we are not doing**

We are not building a social network, an events platform, a food truck tracker, an influencer marketplace, or a takeaway delivery business. Those are different companies. We may build them in years 2 to 4 if the wedge succeeds. Section 10 lists the parked ideas explicitly.

---

## 2. The Wedge (One Function, Mastered)

The principle: do one thing extraordinarily well before doing anything else.

Our one thing: **a hungry person in Valencia gets a great restaurant recommendation in under a minute, in their own language, including small places they would not otherwise find.**

Everything in V1 that is not in service of that sentence is parked.

**What this means concretely:**

The MVP is three components:

- **Discovery layer:** an indexed, multilingual database of every restaurant in Valencia, with current hours, current menu, current prices, real photos, dietary tags, neighborhood, ambiance.
- **Conversational interface:** a chat UI where the user asks in natural Spanish or English and gets relevant, ranked recommendations with photos and key facts.
- **Restaurant panel:** the dashboard each Pro restaurant uses to manage their listing, see analytics, respond to reviews, and (optionally) buy boost.

That is the entire product surface for V1. Nothing else.

---

## 3. Why This Wedge Wins (Honest Competitive Analysis)

We do not pretend to be everything. Here is the real comparison, restricted to the function we are building.

| Aspect | Google Maps | TheFork | ChatGPT/Perplexity | FoodMatch |
|---|---|---|---|---|
| Coverage of Valencia restaurants | High but shallow | 1 to 2 percent | Inferred from web | Target: 100 percent |
| Real-time accuracy of hours and menu | Often stale | Listed only | None | Updated by restaurants in panel |
| Natural language understanding | None (keyword) | None | Excellent | Excellent |
| Multilingual menu and reviews | Auto-translation only | Limited | None | Native ES/EN, expanding to DE/FR/NL |
| Knows what is fully booked tonight | No | Yes (booked through them only) | No | Planned for year 2 |
| Surfaces small independents | Skewed to popular | Excludes them | Random | Designed for them |

**Honest acknowledgments:**

- Google has billions of users. We have zero.
- TheFork has 30,000 restaurants and a 15-year head start.
- ChatGPT can answer "where to eat in Valencia" today. The answer is just generic and wrong about hours.

**Our defensible position:** the depth and freshness of our Valencia-specific index, plus the relationship with each Pro restaurant. Anyone can have an AI chatbot. Almost no one will index 4,000 restaurants in Valencia by hand and keep them updated weekly. That is the moat.

---

## 4. Market Opportunity

Cited from MARKET_RESEARCH.md (verifiable sources at the end of that document).

**Valencia city (launch market):**
- Population: 824,000 (third largest in Spain)
- Metro area: 1.6M
- Restaurants in city: estimated 3,500 to 4,500 (4,506 in province per TripAdvisor)
- Tourists in 2025: 2 million plus
- 56.9 percent international visitors
- 5.9M overnight stays in 2024 (10 percent growth)
- 8 Michelin starred restaurants in city, 2 nearby
- World Design Capital 2022, European Green Capital 2024
- Spain's third largest startup ecosystem ($3.9B), growing 36 percent in 2025
- KM Zero food innovation hub and Lanzadera accelerator both based here

**TAM, SAM, SOM (with assumptions stated):**

- TAM: €9.2B Spanish foodservice market (Mordor Intelligence). Restaurants spend roughly 5 to 10 percent of revenue on marketing. Marketing-related spend in restaurants in Spain is roughly €460M to €920M annually.
- SAM: digital-first restaurants in Valencia and adjacent cities. Roughly 4,500 in Valencia plus 1,700 in Alicante, addressable by us = 6,200 restaurants. At our €99/month, that is €7.4M ARR if we got 100 percent (we will not).
- SOM (realistic Year 2): 250 Pro restaurants paying €99/month plus boost = €330k to €380k ARR. About 4 percent of SAM.

These numbers are smaller than V1 claimed. They are also defensible.

---

## 5. Product (MVP only)

### 5.1 The Discovery Layer

We index every restaurant in Valencia, period. Free tier or paying tier, every restaurant exists in our database with at least:

- Name, address, phone, neighborhood (zip code)
- Cuisine type, price range
- Public hours (from Google Places API + restaurant correction)
- Google rating (rating + count, via Places API, with link out)
- Cuisine and dietary tags

This is non-negotiable because the AI cannot recommend what it does not know about. A 50 percent indexed app gives 50 percent useful recommendations. We start at 100 percent or we do not start.

Pro restaurants enrich their own listing through the panel: real photos, full menu with translations, ambiance tags, response to reviews, etc.

### 5.2 The Conversational Interface

User opens the app. Sees a clean chat input. Types or speaks:

- "Donde como buena paella esta noche, algo tranquilo, unos 25 euros"
- "Vegan brunch in Ruzafa under 20 euros, that's open Sunday"
- "Where can I get a smashburger near the city center"

The AI returns three to five options with:
- Restaurant name and one-line description
- Photo
- Distance from user
- Price range, opening status now
- One paragraph "why this matches your query"
- Link to full profile and to Google Maps for directions

That's the whole interaction. The user gets a decision, not a list. The AI is grounded in our indexed data, not free-form generation, so it cannot hallucinate restaurants that don't exist.

### 5.3 The Restaurant Panel

For Pro restaurants only:

- Edit profile (name, hours, menu, photos, tags)
- See analytics: profile views, queries that surfaced you, language breakdown, time-of-day breakdown
- Respond to reviews (own system + Google review viewer)
- Buy boost (€50/week, max 3 active per zip code, max 2 visible per AI response)

That's it. No CRM, no advanced reservation system, no POS integration in V1. Those are year 2 considerations if revenue justifies.

### 5.4 Two surfaces: mobile for users, web for restaurants

The product runs on two interfaces from day one, each matched to its actual user:

- **Consumer side: native mobile app (iOS + Android via React Native / Expo).** This is where tourists and locals live. Voice search, camera search ("photo of a dish, find similar"), push notifications, location services, native maps integration, app store presence, low-friction download from hotel QR codes. Single codebase covers both stores.
- **Restaurant side: web app (responsive, mobile-friendly but desktop-first).** Menu editing, photo uploads, analytics dashboards, review responses, boost purchases. These are desk tasks. A restaurant owner is not editing tomorrow's menu on a phone screen at 11pm.

One backend, one database, one AI layer. Two front-end surfaces optimized for who is actually using them.

### 5.5 What is explicitly out of scope for V1

Read this list carefully. None of it is in V1.

- No friend activity feed
- No leaderboards or user ranks
- No badges or achievements
- No social posts or stories
- No "Confirm Attendance" feature
- No events platform
- No sports event automation
- No food truck real-time tracking (yes, even Samuel's smashburger truck. We will add it as the proof point in year 2.)
- No influencer "Foodies" section
- No premium user subscription
- No takeaway commission revenue
- No POS or CRM integration
- No Madrid, Barcelona, or any city other than Valencia

If a feature request is not in section 5.1 to 5.4, the answer is "year 2 candidate, parked."

---

## 6. Pricing (Two Tiers + Boost Add-On)

V1 had four tiers (€0, €49, €129, €249). That is too many for non-technical restaurant owners who don't shop SaaS plans.

V2 has two tiers and one optional add-on. Final.

### Free Listing

- Auto-indexed from public data
- Basic profile in our database
- Visible in AI responses and search
- No panel access, no editing, no reviews response, no analytics, no fotos uploaded by the restaurant
- Costs us money (LLM calls, hosting), but is necessary because the AI must know about every restaurant to give good recommendations

### Pro - €99/month

Everything in Free, plus:
- Restaurant panel
- Edit profile, hours, menu in real time
- Auto-translation of menu to English, German, French, Dutch
- Upload unlimited photos
- Google reviews integrated (rating + count + link out)
- Own review system inside the app
- Respond to reviews
- Analytics dashboard
- "Verified" badge on profile

No commission on reservations or takeaway. Subscription only.

### Boost (Add-On, only for Pro)

€50 per week per slot. Max 3 active boosts per zip code at a time. Max 2 visible boosted slots per single AI response. Always labeled "Promocionado" so users understand.

Use cases: new restaurant opening, festival weeks (Fallas, Hogueras, San Juan), seasonal menu launches, slow-week recovery.

If all 16 Valencia zip codes had 3 boosts active = 48 slots × €50 = €2,400/week of boost revenue ceiling. About €10.4k/month if fully sold.

### Why this pricing structure (and not V1's four-tier version)

| V1 problem | V2 fix |
|---|---|
| Four tiers force restaurant to comparison-shop | Two tiers, binary decision |
| €49 Basic with "1/month promotion" feels cheap and small | €99 single Pro tier signals real product |
| €129 Pro with WhatsApp integration is over-promised | WhatsApp deferred to year 2 |
| €249 Premium with monthly strategy calls is unsustainable on margin | Cut entirely |
| Four levels = more support load explaining the differences | One level, clean conversation |

### Founders cohort offer (first 100 paying restaurants)

The first 100 restaurants who sign up and convert to Pro get a permanent locked rate of €69/month. They take the risk on us when we have no track record. We thank them by never raising their price.

---

## 7. Go-to-Market Strategy

One playbook, executed fully, before considering anything else.

### Phase 1: Validation (Weeks 1 to 4)

Before writing code or signing customers, we validate the assumptions.

- Samuel does 20 restaurant interviews in Valencia in person
- Asked: "Would you pay €99/month for [the product]?" in concrete terms
- Documented: actual answers, actual quotes, actual % saying yes
- GO/NO GO decision at end of week 4 based on real data

Hard rule: **if fewer than 30 percent of those 20 restaurants would pay €99/month after seeing the pitch, we revisit pricing or product before building anything.**

Samuel has an unusual asset here: he runs El Mesón Smashbursers (food truck). He is one of our target customers and he can talk shop with the others. Use that.

### Phase 2: Pre-launch (Weeks 5 to 12)

Build the MVP. Index 100 percent of Valencia restaurants. Prepare onboarding playbook.

Goals at end of week 12:
- 100 percent of Valencia city restaurants indexed in database
- AI chatbot working with real data
- Pro restaurant panel functional
- 50 to 100 restaurants signed up to "free 2-month trial of Pro"
- Waitlist of 500 to 1,000 users via landing page

### Phase 3: Free Cohort (Months 4 to 6)

The "100 restaurants free for 2 months" idea is the heart of the launch.

How it works:
- First 100 restaurants get full Pro access free for 60 days
- During that time, we generate visible value: queries surfacing them, searches matching them, reviews, profile views
- At day 50, we send the report: "Here is what you got. Here is what continuing costs." (€69/month founders rate)
- Target conversion: 30 to 50 percent of the cohort to paid

Parallel user acquisition: Instagram, TikTok, partnerships with 5 to 10 Valencia hotels for QR codes in rooms, microinfluencers in Valencia food scene.

### Phase 4: Conversion + Growth (Months 7 to 12)

- Convert the free cohort
- Open paid signups to remaining Valencia restaurants
- Marketing scales as revenue covers it
- Apply for KM Zero accelerator (food sector specific, in Valencia)
- Apply for Lanzadera accelerator (Juan Roig backed, in Valencia, takes consumer/food)
- Apply for ENISA loan if SL is certified as empresa emergente

### Phase 5: Decision Point (Month 12)

Two outcomes possible:

- **Working:** 80+ paying restaurants, €8k+ MRR, real user growth, evidence the wedge holds. Then expand to Alicante (Samuel's brand), apply for YC W27 batch (October 2026 application window for January 2027 batch).
- **Not working:** rebuild based on what the data says. Pivot pricing, pivot scope, or change market.

We do not expand to Madrid or Barcelona until the wedge proves itself in Valencia. V1's Year 2 plan of "expand to Madrid and Barcelona" with two founders is not a plan, it's wishful thinking.

---

## 8. Roadmap

| Phase | Timeline | What we ship |
|---|---|---|
| Validation | Weeks 1 to 4 | 20 restaurant interviews, GO/NO GO decision, trademark check, domain bought, SL incorporation started |
| Sprint 0 | Weeks 5 to 6 | Project setup, repo migration to FoodMatch organization, Max gets full code access, Expo + React Native scaffolding |
| Sprint 1 | Weeks 7 to 10 | Indexing pipeline (Google Places + manual), restaurant database, REST/GraphQL backend |
| Sprint 2 | Weeks 11 to 14 | Mobile consumer app shell (Expo), AI chatbot with grounded responses, multilingual support |
| Sprint 3 | Weeks 15 to 18 | Restaurant panel (web), Stripe integration, free trial signup flow |
| Sprint 4 | Weeks 19 to 22 | Reviews system, Google reviews integration, analytics dashboard, push notifications |
| Sprint 5 | Weeks 23 to 26 | Boost feature, polish, marketing site, app store submission (3 to 7 day review window) |
| Sprint 6 | Weeks 27 to 28 | Buffer for app store review, final polish, launch prep |
| Public launch | Week 29 (~mid November 2026) | Live in Valencia, mobile + web |
| Free cohort | Weeks 29 to 37 (Nov 2026 to Jan 2027) | First 100 restaurants free for 2 months |
| Conversion | Week 38+ (Jan 2027) | First paying restaurants at €69/month founders rate |
| Decision point | Month 12 (May 2027) | Working / Not working evaluation |

This timeline is honest. V1's "MVP in months 0 to 6" was generous. Real software takes longer. Mobile adds 2 to 3 weeks vs web-only and an app store review window we cannot control.

---

## 9. Financial Reality

V1's financial section was aspirational and missed major costs. Here is the honest version.

### Year 1 cost structure (Valencia only, two founders, no full-time hires)

**Fixed monthly costs:**
- Cloud infrastructure: €150
- LLM API costs (Claude/GPT, with caching): €300 to €600 (scales with usage)
- Google Places API: €100
- Domain, SSL, email, tools: €100
- Asesor fiscal (after SL exists): €150
- Software stack (Stripe fees included): €100
- Apple Developer account: €82 amortized monthly (€99/year)
- Google Play one-time fee: €25 (first month only, not recurring)
- Mobile push notification service (OneSignal or Expo Push): €0 to €50

Total fixed: about **€1,000 to €1,300/month**

**Variable monthly costs (growth period):**
- Marketing (paid, content, microinfluencers): €500 to €2,000
- Photo service for first 100 Pro restaurants: €0 (deferred to year 2 or charged as add-on)
- Customer support tools: €50

**Founder compensation (per FOUNDER_AGREEMENT.md V2):**
- Phase 1 (months 0 to until €5k MRR): €0 each
- Phase 2 (€5k to €10k MRR): €2,000/month each = €4,000/month combined
- Phase 3 (over €10k MRR): up to €5,000/month each, scaled to MRR

This is the cost line V1 hid. It is real.

### Year 1 revenue (Valencia only)

| Month | Free tier | Pro paying | Boost active | MRR | Notes |
|---|---|---|---|---|---|
| 6 | 1,000 | 0 | 0 | €0 | All restaurants indexed, no paying yet |
| 9 | 1,000 | 30 (founder rate €69) | 5 | €2,320 | Free cohort starts converting |
| 12 | 1,000 | 80 (founder rate) | 15 | €6,270 | Phase 3 founder salary triggers |
| 18 | 1,500 | 200 (mix of €69 and €99) | 30 | €18,000 | Real growth phase |
| 24 | 2,000 | 350 (mix) | 50 | €33,000 | Year 2 end |

ARR at month 24: about €400k. Net of costs (founder salaries Phase 3, marketing, infra): approximately €100k to €150k profit. Not the V1 fantasy of €600k profit. But real.

### Where the money comes from until break-even

Until we hit ~€5k MRR (around month 9 to 12), the company operates from:

- Max's savings (defers compensation)
- Samuel's existing income from El Mesón Smashbursers and freelance flexibility
- Possible ENISA loan (€40k to €100k, repayable, no equity dilution) once SL exists
- Possible Lanzadera or KM Zero acceptance (mentorship, possible cash)
- No external equity round in year 1

V1's "founders work full-time for free until profitability" is not realistic for two adults with rent. The honest plan is: low salary or no salary in months 0 to 6, then €2k/month each as soon as there is any revenue, scaling up.

### Break-even

With founder salaries in Phase 2 (€2k each = €4k combined) plus operating costs (€1,250) plus marketing (€1,000): total burn is around €6,250/month. Break-even MRR: €6,250.

At €69/month founders rate, that's about 90 paying restaurants. At €99 standard rate, that's 65. Both achievable in 12 to 18 months with the playbook.

V1 claimed break-even at month 4 to 6. That ignored founder salaries. With salaries included, break-even is realistically month 12 to 15.

---

## 10. What We Are NOT Building (Yet)

This list is just as important as the build list. These are real ideas, mostly good ideas, that we are deliberately parking until the wedge proves itself.

| Parked feature | Why parked | Possible reactivation |
|---|---|---|
| Friend activity feed, leaderboards, badges, ranks | Cold start kills social features. Need 10k+ users in Valencia first. | Year 2, only if user retention numbers justify. |
| Confirm Attendance to events | Same cold-start problem. Shows "0 going" until critical mass. | Possibly never. The feature is weak on its own. |
| Events platform with sports tracking | A separate product. Eventbrite has done this for 15 years. | Year 2 or 3, integration only, not building. |
| Food truck real-time tracking | Cool idea but tiny audience. (Samuel will be the first one when we add it.) | Year 2, partnered with Samuel's truck as proof of concept. |
| "Foodies" influencer section | Premature. Need brand and audience first. | Year 2 if we ever have an active user base worth attracting influencers to. |
| Premium user subscription (€9.99/month) | No user pays for restaurant search. Try only after restaurant ARR is real. | Year 3 evaluation. |
| Takeaway commission revenue (3 to 5 percent) | Glovo, Just Eat, Uber Eats own this market with €100M+ logistics. We lose. | Never. Stay out of delivery. |
| POS / CRM integration (Lightspeed, Toast, Square, Odoo) | Restaurant tech integrations are expensive and fragile. Add only when 200+ restaurants ask. | Year 2 if customer demand justifies. |
| Madrid, Barcelona, Sevilla expansion | Two founders cannot manage three cities. Each new city needs local relationships. | Year 2 only after Valencia is profitable. |
| Stripe payment processing for orders | We are not running orders in V1, just discovery. | When ordering features ship (year 2 or 3). |
| WhatsApp Business integration | Twilio integration is non-trivial and not core to discovery. | Year 2 add-on for Pro. |
| Voice and image search input | Cool but not critical. Text input is fine. | Year 2 enhancement. |

The discipline: when a feature pulls focus, it goes to this table, not into the V1 build.

---

## 11. Risks We Are Taking Eyes Open

V1 had no risk discussion. Here is the honest one.

**Strategic risks**
- Google AI Mode launches in Spain in 6 to 18 months. When it does, "ask in natural language where to eat in Valencia" gets answered by Google directly. Our defense: depth of local data, restaurant relationships, and multilingual menu translation that Google does not match.
- TheFork could launch a similar AI feature with their existing 30,000-restaurant database. Our defense: small restaurant inclusion (we don't punish them with discounts), faster product iteration (smaller team), Spanish-language quality.

**Execution risks**
- Both founders are remote-first (Max in Germany, Samuel near Valencia). Discipline: weekly fixed sync, demo every Friday, in-person every 2 to 3 months.
- Indexing 4,000+ restaurants by hand is real work. Estimate 3 to 5 weeks of focused effort with scraping, Google Places, and manual cleanup.
- Restaurant onboarding is in-person work. Samuel handles. Cap at 10 to 15 sign-ups per week realistic.
- App store review windows (3 to 7 days for Apple, 1 to 3 for Google) can delay launches and updates. Mitigation: submit early, plan for rejections, use feature flags on the backend so we can ship behavior changes without store updates.
- Mobile + web means two front-ends. Mitigation: shared TypeScript codebase via React Native + React for web, single backend API, common design system.

**Financial risks**
- Until €5k MRR, no founder salary. If that takes 12 months, both founders need savings or side income for that period.
- LLM cost spike from a viral moment without revenue catching up. Mitigation: aggressive caching, hard budget caps, fallback to cheaper models when budget threatened.

**Validation risk**
- We have not yet talked to 20 restaurants. If validation shows less than 30 percent willingness to pay €99/month, we revise pricing or product. Section 7 Phase 1 is non-negotiable.

**Co-founder risks**
- Reading V1 vs V2: we had a misalignment about scope. We resolved this in writing here. We commit to using this document as the source of truth and revising it together when we change direction, never silently.
- Single point of failure on Samuel's GitHub account (still). Migrate to FoodMatch organization with both as owners, this week.

---

## 12. Validation We Need Before Building Further

Before any sprint 1 work, the following must happen:

1. Samuel finishes 20 restaurant interviews in Valencia, documents responses
2. EUIPO and OEPM trademark search on "FoodMatch" for classes 9, 35, 43
3. Domains foodmatch.es secured and pointed to a placeholder landing page
4. Asesor fiscal consulted for SL incorporation strategy
5. Max begins NIE process (longest pole at 8 weeks)
6. GitHub repo migrated to a FoodMatch organization with both as owners
7. Co-founder agreement reviewed and signed (`FOUNDER_AGREEMENT.md`)
8. GO/NO GO decision documented based on real validation data

If any of these are not done, sprint 1 does not start.

---

## 13. Decisions Pending Between Max and Samuel

This document is a proposal. The following items need explicit yes/no from both before signing:

- [ ] V2 supersedes V1 entirely (parking the social/events/etc. features)
- [ ] Two-tier pricing (Free + Pro €99) with Boost add-on at €50/week
- [ ] Founders rate of €69/month for first 100 paying restaurants
- [ ] Free 2-month Pro trial as cold-start mechanism
- [ ] Valencia city as exclusive launch market for first 12 months
- [ ] No expansion to Madrid/Barcelona/Sevilla until Valencia is profitable
- [ ] Founder compensation structure per Section 9 (no salary until €5k MRR, €2k each in Phase 2, scales to €5k each in Phase 3)
- [ ] No takeaway commission, no payment processing in V1
- [ ] Mobile-native consumer app from day one (React Native via Expo) + web restaurant panel
- [ ] Validation phase (Section 7 Phase 1) is non-negotiable before code

If we both say yes to all of the above, we close the V1 chapter and execute V2.

---

## A note from Max to Samuel

Samu,

V1 was good in that it showed how big you think and how you see the dining experience as social, joyful, and broken. That instinct is worth preserving. But two of us cannot build five products at once. If we try, we ship none well, and the thing dies.

The wedge is the discovery problem. You and I both know what it feels like to be hungry at 9pm in a city we don't know, scrolling Google Maps on a phone. We solve that for Valencia, mastered, in 12 months. Then we earn the right to add the social layer, the events, the food trucks (yours first), and everything else you wrote about.

V2 is not less ambition. It is more discipline. Same destination, sharper path.

Read this. Push back where you disagree. Sign where you agree. Then we move.

Max
