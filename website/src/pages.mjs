// Page body templates. Each returns the inner <main> HTML for page().
import { t, localePath } from './i18n.mjs'
import { esc, monogram, coverStyle, priceMark, restaurantCard } from './components.mjs'
import { cuisineLabel, areaLabel, OPENING_HOURS } from './data.mjs'

const SITE = 'https://foodmatch.es'

// Hero collage: four AI-generated cuisine photos (warm, food-first).
const HERO_TILES = [
  { img: 'tapas', cuisine: 'Spanish tapas' },
  { img: 'burger', cuisine: 'burgers' },
  { img: 'paella', cuisine: 'paella' },
  { img: 'mexican', cuisine: 'Mexican' },
]
function heroCollage(restaurants, lang) {
  return `<div class="collage">
    ${HERO_TILES.map((tile) => {
      const label = cuisineLabel(tile.cuisine, lang)
      return `<div class="tile">
        <img class="tile-img" src="/img/hero-${tile.img}.jpg" alt="${esc(label)}" width="860" height="860" loading="lazy" decoding="async" />
        <span class="tile-label">${esc(label)}</span>
      </div>`
    }).join('')}
  </div>`
}

// ---------- ABOUT / FOUNDERS ----------
export function aboutPage(lang) {
  const L = (p) => localePath(lang, p)
  const c = t.about
  return `
<section class="hero section">
  <div class="wrap" style="max-width:62ch">
    <p class="eyebrow">${c.eyebrow[lang]}</p>
    <h1 class="display-xl">${c.h1a[lang]}<br /><span class="it" style="font-weight:400;color:var(--tomate)">${c.h1b[lang]}</span></h1>
    <p class="lede" style="margin-top:1.2rem">${c.lede[lang]}</p>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <h2 class="display-md center">${c.storyTitle[lang]}</h2>
    <div class="grid grid-3" style="margin-top:2.4rem">
      ${c.story[lang]
        .map(
          ([title, body], i) => `<div class="card card-pad">
        <span class="feature-num" style="color:${['var(--tomate)', 'var(--mostaza)', 'var(--fresco)'][i]}">0${i + 1}</span>
        <h3 class="serif" style="font-size:1.2rem;margin-top:0.5rem">${esc(title)}</h3>
        <p class="muted" style="margin-top:0.4rem">${esc(body)}</p>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap center">
    <h2 class="display-md">${c.foundersTitle[lang]}</h2>
    <p class="lede" style="margin:0.6rem auto 0">${esc(c.foundersSub[lang])}</p>
    <div class="grid grid-2" style="margin-top:2.4rem;text-align:left;max-width:760px;margin-left:auto;margin-right:auto">
      ${c.founders[lang]
        .map(
          (f) => `<div class="card" style="overflow:hidden">
        <div style="aspect-ratio:4/5;overflow:hidden;background:var(--azulejo)">
          <img src="/img/${f.img}.jpg" alt="${esc(f.name)}" loading="lazy" decoding="async" style="display:block;width:100%;height:100%;object-fit:cover;object-position:center" />
        </div>
        <div class="card-pad">
          <div style="display:flex;align-items:baseline;justify-content:space-between;gap:0.5rem">
            <h3 class="serif" style="font-size:1.5rem">${esc(f.name)}</h3>
            <span class="muted" style="font-size:0.85rem">${esc(f.place)}</span>
          </div>
          <p class="muted" style="margin-top:0.5rem">${esc(f.bio)}</p>
        </div>
      </div>`,
        )
        .join('')}
    </div>
    <p class="lede" style="max-width:48ch;margin:2.2rem auto 0">${esc(c.closing[lang])}</p>
  </div>
</section>

<section class="section-tight" style="background:var(--azulejo);color:#fff">
  <div class="wrap center">
    <h2 class="display-md" style="color:#fff">${c.ctaTitle[lang]}</h2>
    <p class="lede" style="margin:0.8rem auto 1.6rem;color:rgba(255,255,255,0.85)">${c.ctaSub[lang]}</p>
    <div style="display:flex;flex-wrap:wrap;gap:0.8rem;justify-content:center">
      <a class="btn" style="background:#fff;color:var(--azulejo)" href="${L('/valencia')}">${c.ctaDiner[lang]} →</a>
      <a class="btn btn-primary" href="${L('/reclamar')}">${c.ctaRestaurant[lang]} →</a>
    </div>
  </div>
</section>`
}

// ---------- MAIN LANDING ----------
export function homePage(lang, restaurants) {
  const L = (p) => localePath(lang, p)
  const c = t.home
  const featured = restaurants.filter((r) => r.isPartner).slice(0, 4)
  return `
<section class="hero section">
  <div class="wrap hero-grid">
    <div>
      <p class="eyebrow">${c.eyebrow[lang]}</p>
      <h1 class="display-xl">${c.h1a[lang]}<br /><span class="it" style="font-weight:400;color:var(--tomate)">${c.h1b[lang]}</span></h1>
      <p class="lede" style="margin-top:1.2rem;max-width:42ch">${c.sub[lang]}</p>
      <div style="display:flex;flex-wrap:wrap;gap:0.8rem;margin-top:1.8rem">
        <a class="btn btn-primary btn-lg" href="${L('/descubrir')}">${c.ctaDiner[lang]}</a>
        <a class="btn btn-ghost btn-lg" href="${L('/restaurantes')}">${c.ctaRestaurant[lang]}</a>
      </div>
    </div>
    ${heroCollage(featured.length >= 4 ? featured : restaurants, lang)}
  </div>
</section>

<section class="section-tight">
  <div class="wrap center">
    <h2 class="display-md">${c.splitTitle[lang]}</h2>
    <p class="lede" style="margin:0.8rem auto 0;max-width:52ch">${c.splitSub[lang]}</p>
    <div class="grid grid-2" style="margin-top:2.4rem;text-align:left">
      <div class="split-card" style="background:linear-gradient(160deg,#fbf6ec,#f1e3cf)">
        <div class="split-icon" style="background:rgba(230,57,70,0.12);color:var(--tomate)">${iconFork()}</div>
        <h3 class="serif">${c.dinerCardTitle[lang]}</h3>
        <p>${c.dinerCardBody[lang]}</p>
        <a class="btn btn-dark" href="${L('/descubrir')}">${c.dinerCardCta[lang]} →</a>
      </div>
      <div class="split-card" style="background:linear-gradient(160deg,#1f4e5f,#163a47);color:#fff">
        <div class="split-icon" style="background:rgba(255,255,255,0.14);color:#fff">${iconStore()}</div>
        <h3 class="serif" style="color:#fff">${c.restCardTitle[lang]}</h3>
        <p style="color:rgba(255,255,255,0.82)">${c.restCardBody[lang]}</p>
        <a class="btn" style="background:#fff;color:var(--azulejo)" href="${L('/restaurantes')}">${c.restCardCta[lang]} →</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="display-md center">${c.howTitle[lang]}</h2>
    <div class="grid grid-3" style="margin-top:2.4rem">
      ${c.how[lang]
        .map(
          ([title, body], i) => `<div class="card card-pad">
        <span class="feature-num" style="color:${['var(--tomate)', 'var(--mostaza)', 'var(--fresco)'][i]}">0${i + 1}</span>
        <h3 class="serif" style="font-size:1.25rem;margin-top:0.5rem">${title}</h3>
        <p class="muted" style="margin-top:0.4rem">${body}</p>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section-tight" style="background:var(--tomate);color:#fff">
  <div class="wrap center">
    <h2 class="display-md" style="color:#fff">${c.statsTitle[lang]}</h2>
    <div class="grid grid-3" style="margin-top:2rem">
      ${c.stats[lang]
        .map(
          ([n, label]) => `<div>
        <div class="serif" style="font-size:clamp(2.4rem,6vw,3.4rem);font-weight:800;line-height:1">${n}</div>
        <p style="color:rgba(255,255,255,0.85);margin-top:0.3rem">${label}</p>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap center">
    <h2 class="display-md">${c.finalTitle[lang]}</h2>
    <p class="lede" style="margin:0.8rem auto 1.8rem;max-width:46ch">${c.finalSub[lang]}</p>
    <div style="display:flex;flex-wrap:wrap;gap:0.8rem;justify-content:center">
      <a class="btn btn-primary btn-lg" href="${L('/valencia')}">${t.explore.viewAll[lang]} →</a>
      <a class="btn btn-ghost btn-lg" href="${L('/reclamar')}">${t.nav.claim[lang]}</a>
    </div>
  </div>
</section>`
}

// ---------- DINER LANDING ----------
export function dinerPage(lang, restaurants) {
  const L = (p) => localePath(lang, p)
  const c = t.diner
  return `
<section class="hero section">
  <div class="wrap">
    <p class="eyebrow">${c.eyebrow[lang]}</p>
    <h1 class="display-lg" style="white-space:pre-line;max-width:18ch">${c.h1[lang]}</h1>
    <p class="lede" style="margin-top:1.2rem;max-width:48ch">${c.sub[lang]}</p>
    <div style="margin-top:1.6rem">
      <a class="btn btn-primary btn-lg" href="${L('/valencia')}">${c.exploreCta[lang]} →</a>
    </div>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <div class="grid grid-2">
      ${c.features[lang]
        .map(
          ([title, body], i) => `<div class="card card-pad" style="display:flex;gap:1rem">
        <span class="badge badge-tomate" style="width:34px;height:34px;justify-content:center;flex:none">${i + 1}</span>
        <div>
          <h3 class="serif" style="font-size:1.2rem">${title}</h3>
          <p class="muted" style="margin-top:0.3rem">${body}</p>
        </div>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <div class="grid grid-4">
      ${restaurants.slice(0, 4).map((r) => restaurantCard(r, lang)).join('')}
    </div>
    <div class="center" style="margin-top:1.8rem">
      <a class="btn btn-ghost" href="${L('/valencia')}">${t.explore.viewAll[lang]} →</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap center card card-pad" style="max-width:680px">
    <h2 class="display-md">${c.appTitle[lang]}</h2>
    <p class="lede" style="margin:0.7rem auto 0;max-width:44ch">${c.appSub[lang]}</p>
  </div>
</section>`
}

// ---------- RESTAURANT LANDING ----------
export function restaurantPage(lang, restaurants) {
  const L = (p) => localePath(lang, p)
  const c = t.rest
  const example = restaurants.find((r) => r.isPartner) || restaurants[0]
  return `
<section class="hero section">
  <div class="wrap hero-grid">
    <div>
      <p class="eyebrow">${c.eyebrow[lang]}</p>
      <h1 class="display-lg" style="white-space:pre-line;max-width:16ch">${c.h1[lang]}</h1>
      <p class="lede" style="margin-top:1.2rem;max-width:44ch">${c.sub[lang]}</p>
      <div style="display:flex;flex-wrap:wrap;gap:0.8rem;margin-top:1.8rem">
        <a class="btn btn-primary btn-lg" href="${L('/reclamar')}">${c.ctaPrimary[lang]}</a>
        <a class="btn btn-ghost btn-lg" href="${L('/valencia/' + example.slug)}">${c.ctaSecondary[lang]}</a>
      </div>
    </div>
    <div class="card" style="overflow:hidden">
      <div class="r-cover" style="${coverStyle(example.cuisine)};aspect-ratio:16/11">
        <span class="badge r-tag" style="background:var(--tomate);color:#fff">${t.detail.partner[lang]}</span>
        <span class="r-mono" aria-hidden="true">${esc(monogram(example.name))}</span>
      </div>
      <div class="r-body">
        <div class="r-name">${esc(example.name)}</div>
        <div class="r-meta">${esc(cuisineLabel(example.cuisine, lang))} · ${esc(example.area)}</div>
        <div class="r-stats"><span>${priceMark(example.priceLevel)} · ~€${example.averageSpend}</span><span>★ ${example.rating.toFixed(1)}</span></div>
      </div>
    </div>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <h2 class="display-md center">${c.benefitsTitle[lang]}</h2>
    <div class="grid grid-2" style="margin-top:2.2rem">
      ${c.benefits[lang]
        .map(
          ([title, body]) => `<div class="card card-pad">
        <h3 class="serif" style="font-size:1.2rem">${title}</h3>
        <p class="muted" style="margin-top:0.4rem">${body}</p>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section-tight" style="background:var(--azulejo);color:#fff">
  <div class="wrap">
    <h2 class="display-md center" style="color:#fff">${c.stepsTitle[lang]}</h2>
    <div class="grid grid-3" style="margin-top:2.2rem">
      ${c.steps[lang]
        .map(
          ([title, body], i) => `<div>
        <div class="serif it" style="font-size:2rem;color:var(--mostaza)">0${i + 1}</div>
        <h3 class="serif" style="font-size:1.2rem;color:#fff;margin-top:0.4rem">${title}</h3>
        <p style="color:rgba(255,255,255,0.8);margin-top:0.3rem">${body}</p>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap center card card-pad" style="max-width:720px">
    <p class="eyebrow">${c.pricingTitle[lang]}</p>
    <p class="lede" style="margin:0.4rem auto 0;max-width:52ch">${c.pricingBody[lang]}</p>
    <div style="margin-top:1.6rem">
      <a class="btn btn-primary btn-lg" href="${L('/reclamar')}">${c.ctaPrimary[lang]}</a>
    </div>
  </div>
</section>`
}

// ---------- EXPLORE / INDEX ----------
export function explorePage(lang, restaurants) {
  const L = (p) => localePath(lang, p)
  const c = t.explore
  const areas = [...new Set(restaurants.map((r) => r.area))]
  const cuisines = [...new Set(restaurants.map((r) => r.cuisine))]
  const featured = restaurants.filter((r) => r.isPartner).slice(0, 8)
  const fill = featured.length >= 8 ? featured : [...featured, ...restaurants.filter((r) => !r.isPartner)].slice(0, 8)
  return `
<section class="section-tight" style="padding-top:clamp(36px,5vw,64px)">
  <div class="wrap">
    <h1 class="display-lg">${c.title[lang]}</h1>
    <p class="lede" style="margin-top:0.8rem;max-width:48ch">${c.sub[lang]}</p>

    <h2 class="serif" style="font-size:1.1rem;margin-top:2.4rem">${c.byArea[lang]}</h2>
    <div style="display:flex;flex-wrap:wrap;gap:0.6rem;margin-top:0.8rem">
      ${areas.map((a) => `<span class="chip">${esc(areaLabel(a, lang))}</span>`).join('')}
    </div>

    <h2 class="serif" style="font-size:1.1rem;margin-top:1.8rem">${c.byCuisine[lang]}</h2>
    <div style="display:flex;flex-wrap:wrap;gap:0.6rem;margin-top:0.8rem">
      ${cuisines.map((cu) => `<span class="chip">${esc(cuisineLabel(cu, lang))}</span>`).join('')}
    </div>
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <h2 class="display-md">${c.featured[lang]}</h2>
    <div class="grid grid-4" style="margin-top:1.6rem">
      ${fill.map((r) => restaurantCard(r, lang)).join('')}
    </div>
    <p class="muted center" style="margin-top:2rem;font-size:0.85rem">${c.demoNote[lang]}</p>
  </div>
</section>`
}

// ---------- RESTAURANT DETAIL ----------
export function detailPage(lang, r, nearby) {
  const L = (p) => localePath(lang, p)
  const c = t.detail
  const hours = OPENING_HOURS[r.hours]
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name} ${r.address} ${r.city}`)}`
  // Phone and Instagram are intentionally NOT published here: the seed data is
  // placeholder (invented numbers/handles), so showing them would expose real
  // strangers. Re-enable per restaurant only for verified/claimed listings.
  const diet = [r.vegetarianFriendly && c.veg[lang], r.veganFriendly && c.vegan[lang], r.glutenFreeOptions && c.gf[lang]].filter(Boolean)
  return `
<article>
  <div class="r-cover" style="${coverStyle(r.cuisine)};aspect-ratio:auto;min-height:clamp(200px,34vw,340px)">
    <div class="wrap" style="width:100%">
      <span class="badge ${r.isPartner ? '' : 'badge-line'}" style="${r.isPartner ? 'background:var(--tomate);color:#fff' : 'background:rgba(255,255,255,0.18);color:#fff'}">${r.isPartner ? c.partner[lang] : c.public[lang]}</span>
      <h1 class="serif" style="color:#fff;font-size:clamp(2rem,5vw,3rem);margin-top:0.6rem;text-shadow:0 2px 18px rgba(0,0,0,0.3)">${esc(r.name)}</h1>
      <p style="color:rgba(255,255,255,0.9);margin-top:0.2rem">${esc(cuisineLabel(r.cuisine, lang))} · ${esc(areaLabel(r.area, lang))} · ${priceMark(r.priceLevel)} · ★ ${r.rating.toFixed(1)}</p>
    </div>
  </div>

  <section class="section-tight">
    <div class="wrap" style="max-width:760px">
      <div style="display:flex;flex-wrap:wrap;gap:0.7rem">
        <a class="btn btn-primary" href="${mapsUrl}" target="_blank" rel="noopener">${c.openMaps[lang]}</a>
      </div>

      <h2 class="serif" style="font-size:1.3rem;margin-top:2.2rem">${c.about[lang]}</h2>
      <p class="lede" style="margin-top:0.6rem">${esc(r.description)}</p>

      <div class="card card-pad" style="margin-top:1.8rem">
        <h2 class="serif" style="font-size:1.1rem;margin-bottom:0.6rem">${c.info[lang]}</h2>
        <div class="info-row"><span class="k">${c.cuisine[lang]}</span><span class="v">${esc(cuisineLabel(r.cuisine, lang))}</span></div>
        <div class="info-row"><span class="k">${c.address[lang]}</span><span class="v">${esc(r.address)}</span></div>
        <div class="info-row"><span class="k">${c.hours[lang]}</span><span class="v">${hours.label[lang]}</span></div>
        <div class="info-row"><span class="k">${c.price[lang]}</span><span class="v">${priceMark(r.priceLevel)} · ~€${r.averageSpend} ${c.perPerson[lang]}</span></div>
        ${diet.length ? `<div class="info-row"><span class="k">${c.diet[lang]}</span><span class="v">${diet.join(' · ')}</span></div>` : ''}
      </div>

      <p class="muted" style="font-size:0.8rem;margin-top:1rem">${c.demoData[lang]}</p>

      <div class="card card-pad" style="margin-top:1.8rem;background:linear-gradient(160deg,#fbf6ec,#f1e3cf)">
        <h2 class="serif" style="font-size:1.2rem">${c.ownerTitle[lang]}</h2>
        <p class="muted" style="margin-top:0.4rem">${c.ownerBody[lang]}</p>
        <a class="btn btn-primary" style="margin-top:1rem" href="${L('/reclamar?r=' + r.slug)}">${c.claim[lang]}</a>
      </div>
    </div>
  </section>

  ${
    nearby.length
      ? `<section class="section-tight">
    <div class="wrap">
      <h2 class="display-md">${c.nearby[lang]}</h2>
      <div class="grid grid-4" style="margin-top:1.4rem">
        ${nearby.map((n) => restaurantCard(n, lang)).join('')}
      </div>
    </div>
  </section>`
      : ''
  }
</article>`
}

// ---------- CLAIM ----------
export function claimPage(lang, prefillName) {
  const c = t.claim
  const subject = encodeURIComponent('FoodMatch - ' + (lang === 'es' ? 'reclamar restaurante' : 'claim restaurant'))
  return `
<section class="section">
  <div class="wrap" style="max-width:620px">
    <h1 class="display-md">${c.title[lang]}</h1>
    <p class="lede" style="margin-top:0.8rem">${c.sub[lang]}</p>
    ${prefillName ? `<p class="badge badge-mostaza" style="margin-top:1rem">${esc(prefillName)}</p>` : ''}

    <form class="card card-pad stack" style="margin-top:1.6rem" action="mailto:hola@foodmatch.es" method="post" enctype="text/plain">
      <div><label for="r">${c.fName[lang]}</label><input class="field" id="r" name="restaurant" required value="${esc(prefillName || '')}" /></div>
      <div><label for="o">${c.fOwner[lang]}</label><input class="field" id="o" name="owner" required /></div>
      <div class="grid grid-2" style="gap:1rem">
        <div><label for="p">${c.fPhone[lang]}</label><input class="field" id="p" name="phone" type="tel" /></div>
        <div><label for="a">${c.fArea[lang]}</label><input class="field" id="a" name="area" placeholder="Ruzafa" /></div>
      </div>
      <div><label for="e">${c.fEmail[lang]}</label><input class="field" id="e" name="email" type="email" required /></div>
      <button class="btn btn-primary btn-block btn-lg" type="submit">${c.fSubmit[lang]}</button>
      <p class="muted" style="font-size:0.8rem;text-align:center">${c.note[lang]}</p>
    </form>

    <p style="margin-top:1.2rem;text-align:center">
      <a class="btn btn-ghost" href="https://wa.me/?text=${subject}">WhatsApp</a>
    </p>
  </div>
</section>`
}

// ---------- JSON-LD ----------
export function restaurantJsonLd(lang, r) {
  const hours = OPENING_HOURS[r.hours]
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: r.name,
    description: r.description,
    servesCuisine: cuisineLabel(r.cuisine, 'en'),
    priceRange: priceMark(r.priceLevel),
    address: {
      '@type': 'PostalAddress',
      streetAddress: r.address,
      addressLocality: r.city,
      addressRegion: 'Valencia',
      addressCountry: 'ES',
    },
    url: `${SITE}${localePath(lang, '/valencia/' + r.slug)}`,
    openingHours: hours.spec,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: r.rating,
      reviewCount: r.reviewCount,
    },
  }
  // Omit telephone/sameAs: seed contact data is placeholder, not real.
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
}

// ---------- inline icons ----------
function iconFork() {
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3v6a2 2 0 0 0 2 2v10M6 3v6M9 3v6M18 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4v9"/></svg>`
}
function iconStore() {
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9 4.5 4h15L21 9M4 9v10h16V9M4 9h16M9 19v-5h6v5"/></svg>`
}
