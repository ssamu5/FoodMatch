// Pure prompt builder for restaurant hero images. Maps a restaurant's cuisine
// (its "theme") to a food-forward photography prompt. Keys MUST match the literal
// seed/DB cuisine strings, including accents (for example 'menu del dia').

const STYLE_SUFFIX =
  'Professional food photography, 45-degree angle, warm natural window light, ' +
  'shallow depth of field, fresh and appetizing, rustic table setting, vibrant ' +
  'but natural colours, editorial restaurant-magazine style. No text, no logos, ' +
  'no watermarks, no people, no hands.'

const CUISINE_SUBJECT = {
  'Spanish tapas': 'a colourful spread of Spanish tapas: patatas bravas, jamon iberico, garlic prawns, croquetas and olives on small ceramic plates',
  paella: 'an authentic Valencian seafood paella in a traditional pan with mussels, prawns, lemon wedges and saffron rice',
  'menú del día': 'a hearty Spanish menu del dia plate: grilled meat, rustic vegetables and bread on a simple ceramic plate',
  sushi: 'an elegant assortment of fresh sushi nigiri and sashimi on a dark slate board with soy sauce and wasabi',
  burgers: 'a gourmet cheeseburger with melted cheese, fresh lettuce and tomato, with crispy fries on a wooden board',
  pizza: 'a wood-fired Neapolitan margherita pizza with bubbling mozzarella, fresh basil and tomato on a rustic surface',
  pasta: 'a bowl of fresh handmade pasta with rich tomato sauce, parmesan and basil',
  'healthy bowls': 'a vibrant healthy grain bowl with avocado, roasted vegetables, chickpeas and greens',
  vegan: 'a colourful vegan buddha bowl with roasted vegetables, tofu, quinoa and tahini dressing',
  vegetarian: 'a fresh vegetarian dish with grilled seasonal vegetables, herbs and burrata',
  brunch: 'a brunch spread with avocado toast, poached eggs, pancakes and fresh orange juice',
  coffee: 'a beautifully crafted flat white with latte art beside a slice of cake on a cafe table',
  bar: 'craft cocktails and a sharing board of snacks on a moody bar counter',
  Mexican: 'authentic Mexican tacos with fresh cilantro, onion, lime and salsa on a colourful plate',
  Indian: 'a rich Indian curry with naan bread, basmati rice and fresh herbs in copper bowls',
  'Asian fusion': 'a modern Asian-fusion plate of bao buns and dumplings with dipping sauces on slate',
  Mediterranean: 'a Mediterranean mezze platter with hummus, grilled vegetables, olives and pita',
  seafood: 'a fresh seafood platter with grilled fish, prawns, mussels and lemon on ice',
  steak: 'a grilled ribeye steak with rosemary, sliced to show a juicy medium-rare interior, on a cast-iron skillet',
}

const DEFAULT_SUBJECT = 'an appetising signature dish, beautifully plated'

export function heroPrompt(cuisine, { vibe = [], name = '' } = {}) {
  void name // reserved for future per-restaurant nuance; kept in the signature
  const subject = CUISINE_SUBJECT[cuisine] || DEFAULT_SUBJECT
  const vibeWords = Array.isArray(vibe) ? vibe.filter(Boolean).slice(0, 2).join(', ') : ''
  const ambiance = vibeWords ? ` The mood is ${vibeWords}.` : ''
  return `${subject}.${ambiance} ${STYLE_SUFFIX}`
}
