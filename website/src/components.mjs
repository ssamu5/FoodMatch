// Reusable HTML building blocks for the static site. Pure string templates.
import { t, localePath, LANGS } from './i18n.mjs'
import { cuisineLabel } from './data.mjs'

const SITE = 'https://foodmatch.es'

export function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// Deterministic cuisine-themed cover (mirrors the app's RestaurantCover).
const COVER_THEMES = {
  burgers: ['#7a3b16', '#2a1408'], pizza: ['#8c2f24', '#2a0f0c'], pasta: ['#83351f', '#241009'],
  'Spanish tapas': ['#9a4a1c', '#2c1408'], paella: ['#a6671a', '#2e1c08'], seafood: ['#1f4e5f', '#0c1f26'],
  Mediterranean: ['#2f6b5c', '#0f241f'], sushi: ['#26324f', '#0e1320'], 'Asian fusion': ['#3a2752', '#150e22'],
  Indian: ['#8a3d12', '#2a1206'], Mexican: ['#7d3a1c', '#241009'], steak: ['#5e2326', '#1c0a0b'],
  'healthy bowls': ['#2f7a4a', '#0f241a'], vegan: ['#357a3a', '#102414'], vegetarian: ['#3f7a2f', '#13240f'],
  brunch: ['#8a6a2f', '#2a1f0c'], coffee: ['#5a3a22', '#1e120a'], 'menú del día': ['#9a5a1c', '#2c1808'],
  bar: ['#6a2f3a', '#1c0c12'],
}
const CONNECTORS = new Set(['la', 'el', 'los', 'las', 'de', 'del', 'y', 'the', 'a', 'and'])

export function monogram(name = '') {
  const words = name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter(Boolean)
  const sig = words.filter((w) => !CONNECTORS.has(w.toLowerCase()))
  const pick = (sig.length ? sig : words).slice(0, 2)
  return pick.map((w) => (w[0] || '').toUpperCase()).join('') || 'F'
}

export function coverStyle(cuisine) {
  const [from, to] = COVER_THEMES[cuisine] || ['#3a3a3a', '#1a1a1a']
  return `background:linear-gradient(135deg,${from} 0%,${to} 100%)`
}

export function priceMark(level = 2) {
  return '€'.repeat(Math.max(1, Math.min(4, level)))
}

// ---------- full page shell with SEO head ----------
export function page({ lang, path, title, description, bodyClass = '', head = '', body, ogImage }) {
  const altEs = SITE + localePath('es', path)
  const altEn = SITE + localePath('en', path)
  const canonical = SITE + localePath(lang, path)
  const og = ogImage || `${SITE}/og-default.png`
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${canonical}" />
<link rel="alternate" hreflang="es" href="${altEs}" />
<link rel="alternate" hreflang="en" href="${altEn}" />
<link rel="alternate" hreflang="x-default" href="${altEs}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="FoodMatch" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:locale" content="${lang === 'es' ? 'es_ES' : 'en_US'}" />
<meta property="og:image" content="${og}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="theme-color" content="#f7efe1" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Bricolage+Grotesque:opsz,wght@12..96,300..800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/styles.css" />
${head}
</head>
<body class="${bodyClass}">
<a class="skip-link" href="#main">${lang === 'es' ? 'Saltar al contenido' : 'Skip to content'}</a>
${header(lang, path)}
<main id="main">
${body}
</main>
${footer(lang)}
</body>
</html>`
}

// ---------- header ----------
export function header(lang, path) {
  const L = (p) => localePath(lang, p)
  const other = lang === 'es' ? 'en' : 'es'
  return `<header class="site-header">
  <div class="wrap">
    <a class="brand" href="${L('/')}" aria-label="FoodMatch">
      <span class="brand-mark serif">f<span class="it">m</span></span>
      <span class="serif">food<span class="it" style="color:var(--tomate)">match</span></span>
    </a>
    <nav class="nav-links" aria-label="${lang === 'es' ? 'Principal' : 'Primary'}">
      <a href="${L('/descubrir')}">${t.nav.discover[lang]}</a>
      <a href="${L('/restaurantes')}">${t.nav.forRestaurants[lang]}</a>
      <a href="${L('/valencia')}">${t.nav.explore[lang]}</a>
      <a class="btn btn-primary" style="padding:0.6rem 1.1rem;font-size:0.92rem" href="${L('/reclamar')}">${t.nav.claim[lang]}</a>
    </nav>
    <div class="lang-switch" aria-label="Language">
      <a class="${lang === 'es' ? 'active' : ''}" href="${localePath('es', path)}" hreflang="es">ES</a>
      <a class="${lang === 'en' ? 'active' : ''}" href="${localePath('en', path)}" hreflang="en">EN</a>
    </div>
  </div>
</header>`
}

// ---------- footer ----------
export function footer(lang) {
  const L = (p) => localePath(lang, p)
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="grid grid-2" style="gap:2.5rem">
      <div>
        <div class="brand" style="color:var(--paper)">
          <span class="brand-mark serif">f<span class="it">m</span></span>
          <span class="serif">food<span class="it">match</span></span>
        </div>
        <p style="max-width:32ch;margin-top:0.9rem;color:rgba(248,241,229,0.7);font-size:0.95rem">${t.footer.tagline[lang]}</p>
      </div>
      <div class="grid grid-2" style="gap:1.5rem">
        <div>
          <p style="font-weight:700;margin:0 0 0.6rem">${t.footer.diners[lang]}</p>
          <p style="margin:0.3rem 0"><a href="${L('/descubrir')}">${t.nav.discover[lang]}</a></p>
          <p style="margin:0.3rem 0"><a href="${L('/valencia')}">${t.nav.explore[lang]}</a></p>
        </div>
        <div>
          <p style="font-weight:700;margin:0 0 0.6rem">${t.footer.restaurants[lang]}</p>
          <p style="margin:0.3rem 0"><a href="${L('/restaurantes')}">${t.nav.forRestaurants[lang]}</a></p>
          <p style="margin:0.3rem 0"><a href="${L('/reclamar')}">${t.nav.claim[lang]}</a></p>
        </div>
      </div>
    </div>
    <hr style="border:0;border-top:1px solid rgba(248,241,229,0.14);margin:2.2rem 0 1.4rem" />
    <div style="display:flex;flex-wrap:wrap;gap:0.6rem 1.4rem;font-size:0.82rem;color:rgba(248,241,229,0.6)">
      <a href="${L('/aviso-legal')}">${lang === 'es' ? 'Aviso legal' : 'Legal notice'}</a>
      <a href="${L('/privacidad')}">${lang === 'es' ? 'Privacidad' : 'Privacy'}</a>
      <a href="${L('/cookies')}">Cookies</a>
      <a href="${L('/terminos')}">${lang === 'es' ? 'Términos' : 'Terms'}</a>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem 1.5rem;justify-content:space-between;font-size:0.82rem;color:rgba(248,241,229,0.6);margin-top:0.9rem">
      <span>© 2026 FoodMatch · ${t.footer.rights[lang]}</span>
      <span><a href="mailto:foodmatchinfo@gmail.com">foodmatchinfo@gmail.com</a> · <a href="https://instagram.com/foodmatch_es" target="_blank" rel="noopener">@foodmatch_es</a></span>
    </div>
    <p style="font-size:0.75rem;color:rgba(248,241,229,0.45);margin-top:1rem;max-width:60ch">${t.footer.pilotNote[lang]}</p>
  </div>
</footer>`
}

// ---------- restaurant card (grid) ----------
export function restaurantCard(r, lang) {
  const href = localePath(lang, `/valencia/${r.slug}`)
  return `<a class="r-card card-hover" href="${href}" style="display:block">
  <div class="r-cover" style="${coverStyle(r.cuisine)}">
    ${r.isPartner ? `<span class="badge badge-tomate r-tag" style="background:var(--tomate);color:#fff">${t.detail.partner[lang]}</span>` : ''}
    <span class="r-mono" aria-hidden="true">${esc(monogram(r.name))}</span>
  </div>
  <div class="r-body">
    <div class="r-name">${esc(r.name)}</div>
    <div class="r-meta">${esc(cuisineLabel(r.cuisine, lang))} · ${esc(r.area)}</div>
    <div class="r-stats">
      <span>${priceMark(r.priceLevel)} · ~€${r.averageSpend}</span>
      <span>★ ${r.rating.toFixed(1)}</span>
    </div>
  </div>
</a>`
}
