// Lead generation helpers for FoodMatch.
// The monetization wedge: turn a match into a real WhatsApp message to the
// restaurant, prefilled with the diner's craving. Keeps the "AI -> action"
// loop honest and testable without any backend.

import type { Cuisine, Restaurant } from '../types/restaurant'

const LAST_QUERY_KEY = 'foodmatch.lastIntentQuery'

/** The diner's most recent craving this session, if any. */
export function lastCraving(): string | null {
  try {
    const q = sessionStorage.getItem(LAST_QUERY_KEY)
    return q && q.trim() ? q.trim() : null
  } catch {
    return null
  }
}

/** Spanish reservation/order message a Valencia diner would send. */
export function buildLeadMessage(r: Restaurant, craving?: string | null): string {
  const intro = `Hola ${r.name}, os he encontrado en FoodMatch y me gustaria reservar mesa o hacer un pedido.`
  const cravingLine = craving && craving.trim() ? ` Buscaba: "${craving.trim()}".` : ''
  return `${intro}${cravingLine} Teneis disponibilidad? Gracias!`
}

/** Strip a phone string to wa.me digits (no +, spaces, or punctuation). */
function toWaNumber(raw?: string): string | null {
  if (!raw) return null
  const digits = raw.replace(/[^\d]/g, '')
  return digits.length >= 8 ? digits : null
}

/**
 * wa.me deep link with the prefilled message.
 * - If the restaurant has a verified `whatsapp` number, link straight to it.
 * - Otherwise return a numberless link so the user picks the chat. This is
 *   deliberate: seed/demo restaurants have placeholder phones, and a fake
 *   number would dead-end the demo ("not on WhatsApp"). Numberless always
 *   opens WhatsApp with the message ready to send.
 */
export function buildWhatsAppUrl(r: Restaurant, craving?: string | null): string {
  const text = encodeURIComponent(buildLeadMessage(r, craving))
  const num = toWaNumber(r.whatsapp)
  return num ? `https://wa.me/${num}?text=${text}` : `https://wa.me/?text=${text}`
}

/** True when the link targets a real number (vs numberless picker). */
export function hasVerifiedWhatsApp(r: Restaurant): boolean {
  return toWaNumber(r.whatsapp) !== null
}

// ---------- Menu highlights ----------

// Cuisine-based signature dishes used when a restaurant has no explicit
// menuHighlights. Demo data, labelled as such in the UI.
const HIGHLIGHTS_BY_CUISINE: Record<Cuisine, string[]> = {
  'Spanish tapas': ['Patatas bravas', 'Croquetas caseras', 'Gambas al ajillo'],
  paella: ['Paella valenciana', 'Arroz del senyoret', 'Arroz negro'],
  sushi: ['Nigiri selection', 'Spicy tuna roll', 'Salmon sashimi'],
  burgers: ['Smash cheeseburger', 'Hand-cut fries', 'Craft beer on tap'],
  pizza: ['Margherita', 'Diavola', 'Burrata starter'],
  pasta: ['Cacio e pepe', 'Tagliatelle ragu', 'Tiramisu'],
  'healthy bowls': ['Poke bowl', 'Acai bowl', 'Green smoothie'],
  vegan: ['Plant-based burger', 'Buddha bowl', 'Cashew cheesecake'],
  vegetarian: ['Veggie paella', 'Grilled halloumi', 'Roasted veg plate'],
  brunch: ['Eggs benedict', 'Avocado toast', 'Pancakes'],
  coffee: ['Flat white', 'Cold brew', 'Carrot cake'],
  Mexican: ['Tacos al pastor', 'Guacamole', 'Quesadillas'],
  Indian: ['Butter chicken', 'Garlic naan', 'Veg biryani'],
  'Asian fusion': ['Ramen', 'Bao buns', 'Pad thai'],
  Mediterranean: ['Hummus plate', 'Grilled octopus', 'Mezze board'],
  seafood: ['Grilled catch of the day', 'Clams marinera', 'Fried calamari'],
  steak: ['Ribeye a la brasa', 'Entrecot', 'Grilled vegetables'],
  'menú del día': ['Menú del día (3 platos)', 'Plato del día', 'Postre casero'],
  bar: ['Caña + tapa', 'Bravas', 'Bocadillo de calamares'],
}

/** 2-4 menu highlights for a restaurant. Explicit data wins; cuisine preset is the fallback. */
export function menuHighlightsFor(r: Restaurant): string[] {
  if (r.menuHighlights && r.menuHighlights.length > 0) return r.menuHighlights
  return HIGHLIGHTS_BY_CUISINE[r.cuisine] ?? []
}
