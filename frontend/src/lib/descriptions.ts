import type { Restaurant } from '../types/restaurant'
import type { Lang } from '../locales/types'

// Spanish (peninsular, Valencia audience) translations for the placeholder demo
// restaurant blurbs. The seed has only a handful of unique descriptions, all
// stored in English, so this map localizes them at render time without mutating
// the demo data. When a row carries a real description_es value (see
// supabase/schema-descriptions-es.sql), that always wins over this fallback.
export const DESCRIPTION_ES: Record<string, string> = {
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

// Pick the description for the active language. Prefers a real per-row Spanish
// value, then the demo-data fallback map, then the original English text (which
// covers real owner-written content until bilingual editing ships).
export function localizedDescription(
  r: Pick<Restaurant, 'description' | 'descriptionEs'>,
  lang: Lang,
): string {
  if (lang === 'es') {
    return r.descriptionEs || DESCRIPTION_ES[r.description] || r.description
  }
  return r.description
}
