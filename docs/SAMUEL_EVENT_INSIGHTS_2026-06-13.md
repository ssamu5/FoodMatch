# Samuel Event Insights: MVP Workshop

Date received: 2026-06-13
Source: photos Samuel shared from an MVP/startup workshop.
Speaker shown: Keivan Shakory Tabrizi.
Context for FoodMatch: use these notes to keep FoodMatch focused on a lean MVP, fast validation, and avoiding overbuilt features before proof of demand.

Original images saved in this repo:

- `docs/assets/samuel-event-insights-2026-06-13/01-speaker-intro-keivan-shakory-tabrizi.jpg`
- `docs/assets/samuel-event-insights-2026-06-13/02-what-is-an-mvp.jpg`
- `docs/assets/samuel-event-insights-2026-06-13/03-bad-mvps.jpg`
- `docs/assets/samuel-event-insights-2026-06-13/04-good-mvps.jpg`
- `docs/assets/samuel-event-insights-2026-06-13/05-pareto-principle.jpg`
- `docs/assets/samuel-event-insights-2026-06-13/06-prompting-your-way-to-mvp.jpg`
- `docs/assets/samuel-event-insights-2026-06-13/07-prompting-details-lovable.jpg`
- `docs/assets/samuel-event-insights-2026-06-13/08-checklist-before-you-go-live.jpg`
- `docs/assets/samuel-event-insights-2026-06-13/09-make-it-better-than-99-percent.jpg`

## 1. Speaker intro

Slide text:

- Keivan Shakory Tabrizi
- MVP

## 2. What is an MVP and why build one?

Slide title:

- What Is an MVP and Why Build One?

Process shown:

- Problem-Solution Fit
- Minimum Viable Product
- Product-Market Fit

Reasons to build:

- Test your hypotheses
- Ship key features
- Validate willingness to commit

Bottom note:

> An MVP is a focused experiment designed to validate assumptions cheaply. It is NOT a finished product.

FoodMatch takeaway:

- FoodMatch MVP should not try to become the final app immediately.
- The first goal is to validate whether people actually want craving-first dish discovery and whether restaurants care about high-intent dish leads.

## 3. Bad MVPs

Slide title:

- Bad MVPs

Example 1: Google Glass

- Expensive, polished hardware
- Shipped wide before checking if user wants it
- Over-built, under-validated

Example 2: Kebabble Farsi Learning App

- Cheap, vibe-coded app
- No hypothesis, main feature missing
- No usage due to entry barrier

Bottom pattern:

> The pattern: full-on built before having validated core assumptions.

FoodMatch takeaway:

- Do not spend months building a polished consumer app before proving demand.
- Avoid building complex personalization, maps, accounts, restaurant dashboards, and monetization before proving people want the core recommendation flow.

## 4. Good MVPs

Slide title:

- Good MVPs

Airbnb example:

Quote:

> Travellers would willingly compromise on the privacy and predictability of a hotel room if given a cheaper alternative.

MVP:

- Founders' apartment + air mattresses
- Phone-pictures + basic landing page

Cargo bike / delivery example:

Quote:

> Berliners would rent e-cargo bikes on-demand to go grocery shopping or bring their kids to kindergarten.

MVP:

- 2 “fake” bikes + sign “Rent me”
- Branding + basic landing page

Bottom pattern:

> The pattern: test the demand with the least possible effort.

FoodMatch takeaway:

- A good FoodMatch MVP can be concierge-like and manual behind the scenes.
- Example MVP: user sends a craving in WhatsApp, Telegram, or a simple form. FoodMatch returns 3 dish recommendations with reasons. The team can manually curate results at first.
- Restaurant-side validation can start with a small landing page and manual lead tracking before a dashboard exists.

## 5. The Pareto Principle for MVPs

Slide title:

- The Pareto Principle for MVPs

Graphic:

- 20% effort
- 80% results

Build:

- Core Value Proposition & USP
- “The one thing that makes my product worth using.”

Cut:

- Everything else.
- Onboarding flows, settings pages, nice-to-haves...

Bottom warning:

> Don’t get lost in the details. Cut everything that doesn’t directly test your core hypothesis.

FoodMatch takeaway:

Core FoodMatch hypothesis:

> People prefer describing a craving and getting dish-level recommendations over scrolling restaurant lists.

Build only what tests this:

- Craving input
- Dish-level matching
- 3 recommendations
- Short evidence for each recommendation
- Basic feedback: good / bad / tried it / saved it

Cut for now:

- Full accounts
- Restaurant dashboard
- Complex loyalty features
- Advanced social feed
- Overdesigned onboarding
- Fully automated scraping if manual curation validates faster

## 6. Prompting your way to an MVP

Slide title:

- Prompting Your Way to an MVP

Subtitle:

- In 2026, you don’t need a dev team to start.

Workflow shown:

1. Pre-Prompt your favorite AI model and data dump
2. Answer questions and receive full-built prompt
3. Paste into Lovable and refine

Prompt example visible:

> Write me a Lovable prompt to build a Web App for the following business idea: [TEXT + DATA DUMP]. Ask me up to 10 relevant questions before writing the prompt, both from a business and technical perspective. Act both as an expert in [YOUR DOMAIN] as well as in building lean but functional MVPs.

Bottom note:

> The Pre-Prompt is the key. It guides you to a usable, specific prompt which lays the foundation for your MVP.

Small note:

> Our favorite prompt does not fit well onto this slide, it can be shared later [?]

FoodMatch takeaway:

- Use AI to turn Samuel’s VPC/BMC and FoodMatch notes into focused build prompts.
- Before building, ask the AI for the smallest MVP that validates the main FoodMatch hypothesis.
- Feed AI the FoodMatch domain details, target users, Valencia restaurant data, dietary needs, and monetization assumptions.

## 7. Prompting details: Lovable prompt refinement

Slide visible headings:

- Explain your ideas, giving clear instructions.
- Back and forth to refine, have Lovable prompt written for you.

Readable left-side instructions:

- Build a vocabulary flashcard app “Kebabbie” with Lovable Cloud, Mobile-first, dark theme. Only one public “Kebab” for now, without authentication.
- Tinder-style swiping for right/wrong, right = correct (+1), left = wrong (-2), green/red flash, save every swipe immediately.
- Use a best practice algorithm to define which cards need to be revised later on.
- Allow several modes: Classic: 30 random words, Newest: last 14 days, newest first, Daily Challenge: 10 lowest-scoring flashcards daily, checkmark when done.
- Insight page: total cards, total correct, total wrong, accuracy %, current/best streak, top 30 hardest words with translation and score.
- Log every swipe: card, user, correct/wrong, mode, timestamp. Allow CSV import.
- Ask me up to 10 questions before writing the Lovable prompt.

Right-side key quote:

> Before I write the Lovable prompt, I need to resolve several decisions that materially change the architecture. Most of your requirements depend on these answers.

FoodMatch takeaway:

- Good prompting forces product decisions before coding.
- For FoodMatch, ask questions like:
  - Is the first MVP consumer-only or restaurant-side too?
  - Is Valencia the only launch city?
  - Do we recommend dishes manually at first or via AI ranking?
  - What counts as success: saves, clicks, restaurant visits, WhatsApp replies, or paid leads?
  - Do allergies need hard safety filtering in MVP or only preference tagging?

## 8. Checklist before you go live

Slide title:

- Checklist: Before You Go Live

Do’s:

- Test End-2-End with small group before go-live
- Implement payment or clear willingness-to-commit feature
- Limit your MVP to max. 3 core features
- Define business-critical KPIs before launch
- Feel slightly ashamed to ship your MVP
- Stop building when your MVP can give you one clear yes or no on your core hypotheses

Don’ts:

- Add nice-to-have features, keep it lean
- Build for edge cases, cover the 80% main cases
- Build all yourself, pay for commodity software and integrations to gain speed
- Build what users ask for, your hypotheses matter
- Ignore analytics and feedback loops, those are key
- Hope people will magically find your MVP, distribute

FoodMatch takeaway:

Before FoodMatch goes live:

- Test end-to-end with a small group of Valencia users.
- Keep to 3 core features:
  1. Craving input
  2. Dish-level recommendations
  3. Feedback / save / share intent
- Add one willingness-to-commit signal:
  - restaurant booking click,
  - WhatsApp reservation request,
  - “send me this place” save,
  - or restaurant lead payment / letter of intent.
- Define KPIs before launch.

Possible FoodMatch MVP KPIs:

- % of users who submit a craving
- % who click or save a recommendation
- % who ask for directions / reservation
- % who say recommendation matched their craving
- Number of restaurants willing to pay for highlighted dish leads

## 9. Make it better than the other 99%

Slide title:

- Make it better than the other 99%

Technical pitfalls:

- A shiny app on your laptop is not a hosted MVP.
- Live hosting, auth, and payments can be deal breakers.
- Testing might take longer than building. Budget for it.
- Vibe-coded apps often ship with security gaps: exposed keys, weak access rules, and AI hallucinations.

Strategic tips:

- Name the hypotheses you’re validating before you write a single prompt.
- Build the payment or willingness-to-commit test first, not last.
- Set your kill/continue criterion in advance, so you don’t over-build to the deadline.
- Decide on distribution channels before go-live.

Bottom note:

> You’re here to test your assumptions. Don’t get lost in cosmetics and remember: build, measure, learn.

FoodMatch takeaway:

FoodMatch must define kill/continue criteria now.

Suggested hypotheses:

1. Users want dish-first search more than restaurant-first search.
2. Users trust FoodMatch recommendations when each recommendation includes evidence.
3. Tourists and foodies in Valencia will use FoodMatch for specific cravings.
4. Allergy/dietary users value safer filtering enough to become a clear segment.
5. Restaurants will pay for high-intent dish discovery if it drives measurable leads.

Suggested continue criteria for a small test:

- 30 to 50 real users test it.
- At least 40% submit more than one craving.
- At least 30% save/click a recommendation.
- At least 10 users report that FoodMatch found a place faster than Google/TikTok.
- At least 3 restaurants show interest in paying or partnering.

Suggested kill or pivot criteria:

- Users still prefer TikTok/Google after trying it.
- Recommendations are too hard to make accurate at dish level.
- No restaurants care about dish-level lead generation.
- Allergy-safe recommendations create too much liability for the MVP stage.

## Consolidated implication for FoodMatch

The event strongly supports a leaner FoodMatch approach:

- Do not overbuild the full app before validation.
- Treat the MVP as an experiment, not a product launch.
- Focus the first MVP on one core promise: “tell us your craving, get the best nearby dish with evidence.”
- Use manual or semi-automated curation if it gets validation faster.
- Track willingness to commit from both users and restaurants.
- Build distribution into the test from day one, especially Valencia food communities, tourists, hostels/hotels, and restaurant partners.
