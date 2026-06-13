// Static site generator for the FoodMatch public website.
// Outputs fully-rendered HTML to website/dist/ (deploy that directory).
// Run: node build.mjs   (from website/)

import { mkdirSync, writeFileSync, copyFileSync, cpSync, rmSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LANGS, localePath, t } from './src/i18n.mjs'
import { getRestaurants } from './src/placesService.mjs'
import { page } from './src/components.mjs'
import {
  homePage, dinerPage, restaurantPage, explorePage, detailPage, claimPage, restaurantJsonLd,
} from './src/pages.mjs'
import { LEGAL } from './src/legal.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, 'dist')
const SITE = process.env.SITE_URL || 'https://foodmatch.es'

function emit(routePath, html) {
  // routePath like "/en/valencia/foo" -> dist/en/valencia/foo/index.html
  const rel = routePath === '/' ? 'index.html' : `${routePath.replace(/^\//, '')}/index.html`
  const dest = resolve(OUT, rel)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, html)
  return rel
}

const urls = []
function record(lang, path) {
  urls.push(SITE + localePath(lang, path))
}

async function build() {
  rmSync(OUT, { recursive: true, force: true })
  mkdirSync(OUT, { recursive: true })

  const restaurants = await getRestaurants()
  let count = 0

  for (const lang of LANGS) {
    // --- landing pages ---
    const landings = [
      ['/', t.home.metaTitle, t.home.metaDesc, homePage(lang, restaurants)],
      ['/descubrir', t.diner.metaTitle, t.diner.metaDesc, dinerPage(lang, restaurants)],
      ['/restaurantes', t.rest.metaTitle, t.rest.metaDesc, restaurantPage(lang, restaurants)],
      ['/valencia', t.explore.metaTitle, t.explore.metaDesc, explorePage(lang, restaurants)],
      ['/reclamar', t.claim.metaTitle, t.claim.metaTitle, claimPage(lang, null)],
    ]
    for (const [path, title, desc, body] of landings) {
      emit(localePath(lang, path), page({ lang, path, title: title[lang], description: (desc[lang] || desc.es || desc), body }))
      record(lang, path)
      count++
    }

    // --- legal pages ---
    for (const L of LEGAL) {
      emit(localePath(lang, L.path), page({ lang, path: L.path, title: L.title[lang], description: L.desc[lang], body: L.render(lang) }))
      record(lang, L.path)
      count++
    }

    // --- restaurant detail pages ---
    for (const r of restaurants) {
      const path = `/valencia/${r.slug}`
      const nearby = restaurants
        .filter((x) => x.area === r.area && x.slug !== r.slug)
        .slice(0, 4)
      const title = `${r.name} · ${r.area}, Valencia · FoodMatch`
      const desc =
        lang === 'es'
          ? `${r.name}: ${r.description} Reserva o descúbrelo en FoodMatch.`
          : `${r.name}: ${r.description} Discover it on FoodMatch.`
      emit(
        localePath(lang, path),
        page({
          lang,
          path,
          title,
          description: desc.slice(0, 200),
          head: restaurantJsonLd(lang, r),
          body: detailPage(lang, r, nearby),
        }),
      )
      record(lang, path)
      count++
    }
  }

  // --- assets ---
  copyFileSync(resolve(__dirname, 'src/styles.css'), resolve(OUT, 'styles.css'))
  cpSync(resolve(__dirname, 'img'), resolve(OUT, 'img'), { recursive: true })
  writeFileSync(resolve(OUT, 'favicon.svg'), FAVICON)
  writeFileSync(resolve(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`)
  writeFileSync(resolve(OUT, 'sitemap.xml'), sitemap(urls))

  console.log(`Built ${count} pages + sitemap (${urls.length} urls) -> website/dist/`)
}

function sitemap(list) {
  const items = list
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`
}

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#e63946"/><text x="16" y="22" font-family="Georgia,serif" font-size="17" font-weight="700" fill="#fff" text-anchor="middle">f<tspan font-style="italic">m</tspan></text></svg>`

build().catch((e) => {
  console.error(e)
  process.exit(1)
})
