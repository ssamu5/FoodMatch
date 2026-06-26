// The investor demo is a guided layer over the REAL, clickable app. Each step is
// an app state the user reaches by clicking; the runner derives the current step
// from the route so real interactions advance the narration. Captions live in the
// locales under demo.<id>.title / demo.<id>.body.

export interface DemoStep {
  id: string
  // True when the app is at this step's location. Used to auto-advance the
  // narration as the user clicks through the real app.
  match: (path: string) => boolean
  // Canonical route for the Next/Back buttons to navigate to. null means the step
  // overlays wherever the user is (e.g. the closing card).
  route: string | null
  // Optional element to ring with the spotlight, addressed by a data-demo selector.
  spotlight?: string
}

// A curated query that yields a strong, recognisable shortlist (the romantic
// sushi flow). foodIntent parses Spanish and English, so this is safe in both.
export const DEMO_QUERY = 'Cena romántica sushi'

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 'ask',
    route: '/',
    match: (p) => p === '/',
    spotlight: '[data-demo="starter-chip-1"]',
  },
  {
    id: 'shortlist',
    route: `/ask?q=${encodeURIComponent(DEMO_QUERY)}`,
    match: (p) => p === '/ask',
    spotlight: '[data-demo="top-match"]',
  },
  {
    id: 'listing',
    route: '/restaurant/hana-sushi',
    match: (p) => p.startsWith('/restaurant/'),
    spotlight: '[data-demo="whatsapp"]',
  },
  {
    id: 'business',
    route: '/restaurants',
    match: (p) => p === '/restaurants',
  },
  {
    id: 'close',
    route: null,
    match: () => false,
  },
]

export const DEMO_TOTAL = DEMO_STEPS.length

// The furthest step whose route matches the current path, or -1 if none. Only
// the pathname is considered (query strings are ignored).
export function matchStepIndex(path: string): number {
  let found = -1
  DEMO_STEPS.forEach((s, i) => {
    if (s.match(path)) found = i
  })
  return found
}
