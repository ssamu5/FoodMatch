// Shared lightweight search lexicon.
//
// This keeps FoodMatch's first-pass search deterministic and cheap: no LLM is
// needed to understand common dish synonyms, and any future AI reranker can be
// fed only the compact shortlist built after this lexical pass.

export function normalizeSearchText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9€\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const DISH_ALIASES: Record<string, string[]> = {
  dessert: [
    'dessert',
    'desserts',
    'postre',
    'postres',
    'tarta',
    'cake',
    'cookie',
    'croissant',
    'tiramisú',
    'tiramisu',
    'mochi',
    'baklava',
    'sweet',
    'dulce',
  ],
  paella: ['paella', 'arroz', 'arros', 'arroz a banda', 'arroz negro'],
  croquetas: ['croquetas', 'croqueta'],
  bravas: ['bravas', 'patatas bravas'],
  tortilla: ['tortilla'],
  pulpo: ['pulpo', 'octopus'],
  ramen: ['ramen'],
  sushi: ['sushi', 'nigiri', 'maki', 'sashimi', 'uramaki'],
  gyoza: ['gyoza', 'dumplings', 'dumpling'],
  tacos: ['tacos', 'taco'],
  guacamole: ['guacamole', 'guac'],
  burger: ['burger', 'hamburguesa', 'smash', 'smashburger', 'cheeseburger'],
  pizza: ['pizza', 'margherita', 'diavola', 'calzone'],
  pasta: ['pasta', 'carbonara', 'lasaña', 'lasana', 'noquis', 'ñoquis', 'tagliatelle', 'cacio e pepe'],
  poke: ['poke', 'poke bowl', 'bowl de acai', 'bowl de açaí', 'acai bowl', 'açaí bowl'],
  curry: ['curry', 'tikka', 'masala', 'biryani'],
  naan: ['naan'],
  hummus: ['hummus'],
  falafel: ['falafel'],
  entrecot: ['entrecot', 'solomillo', 'chuleton', 'chuletón'],
  brunch: ['brunch', 'benedictinos', 'tortitas', 'pancakes', 'aguacate', 'avocado'],
  vermut: ['vermut', 'vermouth'],
  gambas: ['gambas', 'prawns'],
  fideua: ['fideua', 'fideuà'],
}

export function aliasesForDish(dish: string): string[] {
  const normalized = normalizeSearchText(dish)
  const aliases = DISH_ALIASES[normalized] ?? [dish]
  return Array.from(new Set([normalized, ...aliases.map(normalizeSearchText)]))
}

export function textMatchesDish(text: string, dish: string): boolean {
  const haystack = normalizeSearchText(text)
  if (!haystack) return false
  return aliasesForDish(dish).some((alias) => alias.length > 0 && haystack.includes(alias))
}

export function firstMatchingDish(dishes: string[], text: string): string | null {
  return dishes.find((dish) => textMatchesDish(text, dish)) ?? null
}
