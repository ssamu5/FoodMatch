#!/usr/bin/env node
// One-time backfill: fill restaurants.description_es from the placeholder Spanish
// translation map (mirrors src/lib/descriptions.ts). Idempotent: only sets rows
// whose English description has a known translation and is not already set.
//
// Requires:
//   - the description_es column (apply supabase/schema-descriptions-es.sql first)
//   - VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in frontend/.env
//
// Run from the frontend/ directory:  node scripts/populateDescriptionsEs.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const text = readFileSync(resolve(here, '../.env'), 'utf8')
  const out = {}
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i === -1) continue
    out[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim()
  }
  return out
}

const env = loadEnv()
const URL = env.VITE_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in frontend/.env')
  process.exit(1)
}

// Keep in sync with src/lib/descriptions.ts (DESCRIPTION_ES).
const DESCRIPTION_ES = {
  '100% plant-based kitchen: bowls, burgers and house desserts.':
    'Cocina 100% vegetal: bowls, hamburguesas y postres caseros.',
  'All-day brunch: eggs, toasts, pancakes and good coffee. Popular at weekends.':
    'Brunch a todas horas: huevos, tostadas, tortitas y buen café. A tope los fines de semana.',
  'Fresh fish and shellfish from the market, simply grilled. Near the port.':
    'Pescado y marisco frescos del mercado, a la plancha. Cerca del puerto.',
  'Fresh pasta and Italian classics in a cosy trattoria setting.':
    'Pasta fresca y clásicos italianos en un ambiente de trattoria acogedor.',
  'Grilled meats and steaks over coals. For meat lovers and celebrations.':
    'Carnes y chuletas a la brasa. Para los amantes de la carne y para celebraciones.',
  'Honest home-style cooking. Three-course menú del día at lunch, busy with locals.':
    'Cocina casera de toda la vida. Menú del día de tres platos al mediodía, siempre lleno de gente del barrio.',
  'Neighbourhood bar for cañas, vermut and cocktails. Terrace and late hours.':
    'Bar de barrio para cañas, vermut y cócteles. Con terraza y horario de noche.',
  'North Indian curries, tandoori and plenty of vegetarian options.':
    'Currys del norte de la India, tandoori y muchas opciones vegetarianas.',
  'Pan-Asian small plates, ramen and bao in a casual room.':
    'Raciones panasiáticas, ramen y bao en un local informal.',
  'Poke and grain bowls, smoothies and lighter plates. Fast and fresh.':
    'Poke y bowls de cereales, smoothies y platos ligeros. Rápido y fresco.',
  'Seasonal Mediterranean plates, olive oil and a relaxed terrace.':
    'Platos mediterráneos de temporada, aceite de oliva y una terraza tranquila.',
  'Smash burgers, hand-cut fries and craft beer. Counter service, busy at weekends.':
    'Smash burgers, patatas cortadas a mano y cerveza artesana. Pedido en barra, lleno los fines de semana.',
  'Specialty coffee, pastries and a calm spot to work or meet a friend.':
    'Café de especialidad, bollería y un rincón tranquilo para trabajar o quedar con alguien.',
  'Sushi counter with daily fresh fish. Reservations recommended for the omakase.':
    'Barra de sushi con pescado fresco del día. Se recomienda reservar para el omakase.',
  'Tacos, guac and margaritas. Lively and good for groups.':
    'Tacos, guacamole y margaritas. Ambiente animado, ideal para grupos.',
  'Traditional Valencian tapas and small plates with natural wines by the glass.':
    'Tapas valencianas tradicionales y raciones con vinos naturales por copa.',
  'Valencian rice dishes cooked over fire. Best at Sunday lunch, terrace seating.':
    'Arroces valencianos cocinados al fuego. Lo mejor, la comida del domingo en terraza.',
  'Wood-fired pizzas with a thin, blistered crust. Good for sharing and families.':
    'Pizzas al horno de leña con masa fina y crujiente. Ideales para compartir y para familias.',
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
}

const res = await fetch(`${URL}/rest/v1/restaurants?select=id,description,description_es`, { headers })
if (!res.ok) {
  console.error('Fetch failed', res.status, await res.text())
  process.exit(1)
}
const rows = await res.json()

let updated = 0
let skipped = 0
for (const row of rows) {
  const es = DESCRIPTION_ES[row.description]
  if (!es || row.description_es === es) {
    skipped++
    continue
  }
  const patch = await fetch(`${URL}/rest/v1/restaurants?id=eq.${row.id}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({ description_es: es }),
  })
  if (!patch.ok) {
    console.error('PATCH failed for', row.id, patch.status, await patch.text())
    continue
  }
  updated++
}

console.log(`description_es backfill: updated ${updated}, skipped ${skipped}, total ${rows.length}`)
