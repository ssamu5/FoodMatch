// Bilingual copy dictionary for the FoodMatch website.
// Spanish (default) and English. Spanish is written naturally for Valencia,
// not machine-translated. Routing: ES at "/", EN under "/en".

export const LANGS = ['es', 'en']
export const DEFAULT_LANG = 'es'

// Path helper: ES pages live at root, EN under /en.
export function localePath(lang, path) {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (lang === 'es') return clean === '/' ? '/' : clean
  return clean === '/' ? '/en' : `/en${clean}`
}

export const t = {
  nav: {
    discover: { es: 'Descubrir', en: 'Discover' },
    forRestaurants: { es: 'Para restaurantes', en: 'For restaurants' },
    explore: { es: 'Explorar Valencia', en: 'Explore Valencia' },
    about: { es: 'Sobre nosotros', en: 'About' },
    claim: { es: 'Añadir restaurante', en: 'Add your restaurant' },
  },

  // ---------- main landing ----------
  home: {
    metaTitle: {
      es: 'FoodMatch · Descubre dónde comer en Valencia',
      en: 'FoodMatch · Discover where to eat in Valencia',
    },
    metaDesc: {
      es: 'FoodMatch ayuda a descubrir restaurantes en Valencia según gustos, plan, presupuesto y ocasión, y da a los restaurantes una página bonita y fácil de encontrar online.',
      en: 'FoodMatch helps people discover restaurants in Valencia by taste, mood, budget and occasion, and gives local restaurants a beautiful page that is easy to find online.',
    },
    eyebrow: { es: 'Valencia', en: 'Valencia' },
    h1a: { es: 'Descubre dónde comer', en: 'Discover where to eat' },
    h1b: { es: 'en Valencia.', en: 'in Valencia.' },
    sub: {
      es: 'Dile a FoodMatch qué te apetece (plan, presupuesto, zona, ocasión) y te llevamos a los pocos sitios que de verdad encajan.',
      en: 'Tell FoodMatch what you feel like (mood, budget, area, occasion) and we point you to the few places that genuinely fit.',
    },
    ctaDiner: { es: 'Busco dónde comer', en: 'I\'m looking for restaurants' },
    ctaRestaurant: { es: 'Tengo un restaurante', en: 'I own a restaurant' },
    splitTitle: { es: 'Dos lados, una mesa', en: 'Two sides, one table' },
    splitSub: {
      es: 'FoodMatch conecta a quien busca un buen sitio con los restaurantes que merecen encontrarse.',
      en: 'FoodMatch connects people looking for a great spot with the restaurants that deserve to be found.',
    },
    dinerCardTitle: { es: 'Para comer fuera', en: 'For eating out' },
    dinerCardBody: {
      es: 'Encuentra tu sitio por antojo, zona y presupuesto. Sin scroll infinito ni 200 resultados iguales.',
      en: 'Find your place by craving, area and budget. No endless scroll, no 200 identical results.',
    },
    dinerCardCta: { es: 'Cómo funciona', en: 'How it works' },
    restCardTitle: { es: 'Para restaurantes', en: 'For restaurants' },
    restCardBody: {
      es: 'Una página bonita que aparece en las búsquedas y te trae clientes con intención real. Sin comisión por reserva.',
      en: 'A beautiful page that shows up in searches and brings you customers with real intent. No booking commission.',
    },
    restCardCta: { es: 'Añade tu restaurante', en: 'Add your restaurant' },
    howTitle: { es: 'Así de simple', en: 'Simple as that' },
    how: {
      es: [
        ['Cuenta tu plan', 'Lo dices como a un amigo: "cena tranquila por Ruzafa, menos de 25 euros".'],
        ['FoodMatch elige', 'Filtramos por cocina, zona, presupuesto, ambiente y dieta, y damos el porqué de cada sitio.'],
        ['Vas con confianza', 'Una mejor opción, una lista corta y la info útil para decidir y reservar.'],
      ],
      en: [
        ['Tell us your plan', 'Say it like you would to a friend: "quiet dinner near Ruzafa, under 25 euros".'],
        ['FoodMatch decides', 'We filter by cuisine, area, budget, vibe and diet, and explain why each spot fits.'],
        ['Go with confidence', 'One best pick, a short shortlist, and the useful info to decide and book.'],
      ],
    },
    statsTitle: { es: 'Empezamos por Valencia', en: 'Starting with Valencia' },
    stats: {
      es: [['200+', 'restaurantes en el piloto'], ['6', 'zonas de la ciudad'], ['0%', 'comisión por reserva']],
      en: [['200+', 'restaurants in the pilot'], ['6', 'city neighbourhoods'], ['0%', 'booking commission']],
    },
    finalTitle: { es: '¿Listo para tu próxima mesa?', en: 'Ready for your next table?' },
    finalSub: {
      es: 'Explora los restaurantes de Valencia o añade el tuyo a la guía.',
      en: 'Explore Valencia\'s restaurants or add yours to the guide.',
    },
  },

  // ---------- diner landing ----------
  diner: {
    metaTitle: { es: 'Descubre restaurantes en Valencia · FoodMatch', en: 'Discover restaurants in Valencia · FoodMatch' },
    metaDesc: {
      es: 'Encuentra dónde comer en Valencia según tu antojo, tu zona, tu presupuesto y tu plan. Guarda tus sitios favoritos y decide con confianza.',
      en: 'Find where to eat in Valencia by craving, area, budget and occasion. Save your favourites and decide with confidence.',
    },
    eyebrow: { es: 'Para comer fuera', en: 'For diners' },
    h1: { es: 'Encuentra tu sitio,\nno 200 resultados.', en: 'Find your spot,\nnot 200 results.' },
    sub: {
      es: 'FoodMatch entiende cómo decides de verdad: por antojo, compañía, presupuesto y zona. Te damos pocas opciones, bien elegidas.',
      en: 'FoodMatch understands how you actually decide: by craving, company, budget and area. We give you a few options, well chosen.',
    },
    features: {
      es: [
        ['Busca por antojo', 'Hamburguesa por Ruzafa, paella junto al mar, brunch tranquilo el domingo. Lo dices a tu manera.'],
        ['Compara lo que importa', 'Precio medio, ambiente, horarios y por qué encaja. Sin reseñas infinitas que no llevan a nada.'],
        ['Guarda y comparte', 'Tus sitios favoritos siempre a mano, listos para compartir con quien va contigo.'],
        ['Reserva en un toque', 'Contacta o reserva por WhatsApp directamente con el restaurante. Sin intermediarios.'],
      ],
      en: [
        ['Search by craving', 'A burger near Ruzafa, paella by the sea, a calm Sunday brunch. Say it your way.'],
        ['Compare what matters', 'Average price, vibe, hours and why it fits. No endless reviews that lead nowhere.'],
        ['Save and share', 'Your favourite spots always at hand, ready to share with whoever joins you.'],
        ['Book in one tap', 'Contact or book over WhatsApp straight with the restaurant. No middlemen.'],
      ],
    },
    appTitle: { es: 'Pronto en tu móvil', en: 'Coming to your phone' },
    appSub: {
      es: 'FoodMatch llega como app para iOS y Android. Mientras tanto, explora la guía desde aquí.',
      en: 'FoodMatch is arriving as an iOS and Android app. Meanwhile, explore the guide right here.',
    },
    exploreCta: { es: 'Explorar restaurantes', en: 'Explore restaurants' },
  },

  // ---------- restaurant landing ----------
  rest: {
    metaTitle: { es: 'Pon tu restaurante en FoodMatch · Valencia', en: 'Put your restaurant on FoodMatch · Valencia' },
    metaDesc: {
      es: 'Una página bonita para tu restaurante que aparece en las búsquedas y te trae clientes con intención real. Gratis para los primeros restaurantes de Valencia, sin comisión por reserva.',
      en: 'A beautiful page for your restaurant that shows up in searches and brings customers with real intent. Free for the first Valencia restaurants, no booking commission.',
    },
    eyebrow: { es: 'Para restaurantes', en: 'For restaurants' },
    h1: { es: 'Que te encuentren\nlos clientes correctos.', en: 'Get found by\nthe right customers.' },
    sub: {
      es: 'FoodMatch te da una página profesional y te muestra a la gente que busca justo lo que ofreces, por zona, cocina, presupuesto y plan.',
      en: 'FoodMatch gives you a professional page and shows you to people searching for exactly what you offer, by area, cuisine, budget and plan.',
    },
    ctaPrimary: { es: 'Añadir mi restaurante', en: 'Add my restaurant' },
    ctaSecondary: { es: 'Ver una página de ejemplo', en: 'See an example page' },
    benefitsTitle: { es: 'Por qué unirte', en: 'Why join' },
    benefits: {
      es: [
        ['Página pública gratis', 'Tu restaurante con foto, carta, horarios y contacto, fácil de encontrar en Google y en FoodMatch.'],
        ['Clientes con intención', 'Apareces cuando alguien busca tu cocina y tu zona, no en un listado infinito.'],
        ['Sin comisión por reserva', 'Cuota mensual fija y clara. Lo que reservan tus clientes es tuyo.'],
        ['Reclama y gestiona', 'Confirma tus datos, sube fotos y carta, y mantén todo al día tú mismo.'],
      ],
      en: [
        ['Free public page', 'Your restaurant with photo, menu, hours and contact, easy to find on Google and FoodMatch.'],
        ['High-intent customers', 'You appear when someone searches your cuisine and area, not in an endless list.'],
        ['No booking commission', 'A fixed, clear monthly fee. What your customers book is yours.'],
        ['Claim and manage', 'Confirm your details, upload photos and menu, and keep everything current yourself.'],
      ],
    },
    stepsTitle: { es: 'Cómo funciona', en: 'How it works' },
    steps: {
      es: [
        ['Añade tu restaurante', 'Cuéntanos lo básico. Te ayuda Foody, paso a paso, en un minuto.'],
        ['Montamos tu página', 'Creamos tu ficha con tu información pública y la repasamos contigo.'],
        ['Recibe clientes', 'Apareces en las búsquedas de FoodMatch y la gente llega con ganas de ir.'],
      ],
      en: [
        ['Add your restaurant', 'Tell us the basics. Foody guides you step by step, in a minute.'],
        ['We build your page', 'We create your profile from your public info and review it with you.'],
        ['Receive customers', 'You appear in FoodMatch searches and people arrive ready to visit.'],
      ],
    },
    pricingTitle: { es: 'Precio fundador', en: 'Founder pricing' },
    pricingBody: {
      es: 'Los primeros 100 restaurantes de Valencia: 69 €/mes durante 24 meses (después 99 €/mes), con dos meses gratis para empezar. Cero comisión sobre reservas o pedidos.',
      en: 'The first 100 Valencia restaurants: 69 €/month for 24 months (99 €/month after), with two months free to start. Zero commission on bookings or orders.',
    },
    finalTitle: { es: 'Pon tu restaurante donde lo buscan', en: 'Put your restaurant where people look' },
  },

  // ---------- explore / index ----------
  explore: {
    metaTitle: { es: 'Restaurantes en Valencia · FoodMatch', en: 'Restaurants in Valencia · FoodMatch' },
    metaDesc: {
      es: 'Explora restaurantes en Valencia por zona y tipo de cocina. Tapas, arroces, hamburguesas, sushi, brunch y más.',
      en: 'Explore restaurants in Valencia by area and cuisine. Tapas, rice dishes, burgers, sushi, brunch and more.',
    },
    title: { es: 'Restaurantes en Valencia', en: 'Restaurants in Valencia' },
    sub: {
      es: 'Una guía de los sitios para comer de la ciudad, por zona y tipo de cocina.',
      en: 'A guide to the city\'s places to eat, by area and cuisine.',
    },
    byArea: { es: 'Por zona', en: 'By area' },
    byCuisine: { es: 'Por cocina', en: 'By cuisine' },
    featured: { es: 'Algunos sitios', en: 'A few spots' },
    viewAll: { es: 'Ver todos', en: 'View all' },
    demoNote: {
      es: 'Datos de muestra del piloto. Los restaurantes verificados confirman y completan su información.',
      en: 'Sample pilot data. Verified restaurants confirm and complete their own information.',
    },
  },

  // ---------- restaurant detail ----------
  detail: {
    partner: { es: 'Restaurante verificado', en: 'Verified restaurant' },
    public: { es: 'Ficha pública', en: 'Public listing' },
    about: { es: 'Sobre el sitio', en: 'About' },
    info: { es: 'Información práctica', en: 'Practical info' },
    address: { es: 'Dirección', en: 'Address' },
    hours: { es: 'Horario', en: 'Hours' },
    price: { es: 'Precio medio', en: 'Average price' },
    cuisine: { es: 'Cocina', en: 'Cuisine' },
    diet: { es: 'Opciones', en: 'Dietary' },
    veg: { es: 'vegetariano', en: 'vegetarian' },
    vegan: { es: 'vegano', en: 'vegan' },
    gf: { es: 'sin gluten', en: 'gluten-free' },
    perPerson: { es: 'por persona', en: 'per person' },
    openMaps: { es: 'Ver en el mapa', en: 'Open in maps' },
    call: { es: 'Llamar', en: 'Call' },
    instagram: { es: 'Instagram', en: 'Instagram' },
    nearby: { es: 'Cerca de aquí', en: 'Nearby' },
    ownerTitle: { es: '¿Es tu restaurante?', en: 'Is this your restaurant?' },
    ownerBody: {
      es: 'Reclama esta ficha para confirmar tus datos, añadir fotos y carta, y aparecer destacado en FoodMatch.',
      en: 'Claim this listing to confirm your details, add photos and menu, and appear featured on FoodMatch.',
    },
    claim: { es: 'Reclamar este restaurante', en: 'Claim this restaurant' },
    demoData: {
      es: 'Información de muestra para el piloto. Los datos reales los confirma el restaurante al reclamar su ficha.',
      en: 'Sample information for the pilot. Real data is confirmed by the restaurant when it claims the page.',
    },
  },

  // ---------- claim ----------
  claim: {
    metaTitle: { es: 'Reclama tu restaurante · FoodMatch', en: 'Claim your restaurant · FoodMatch' },
    title: { es: 'Reclama tu restaurante', en: 'Claim your restaurant' },
    sub: {
      es: 'Cuéntanos lo básico y montamos tu página. Te respondemos en 48 horas. Sin compromiso.',
      en: 'Tell us the basics and we build your page. We reply within 48 hours. No commitment.',
    },
    notFound: {
      es: 'No encontramos esa ficha, pero puedes añadir tu restaurante igualmente.',
      en: 'We could not find that listing, but you can add your restaurant anyway.',
    },
    fName: { es: 'Nombre del restaurante', en: 'Restaurant name' },
    fOwner: { es: 'Tu nombre', en: 'Your name' },
    fPhone: { es: 'Teléfono o WhatsApp', en: 'Phone or WhatsApp' },
    fEmail: { es: 'Email', en: 'Email' },
    fArea: { es: 'Zona', en: 'Area' },
    fSubmit: { es: 'Enviar', en: 'Send' },
    note: {
      es: 'Esto abre tu app de email o WhatsApp con el mensaje preparado.',
      en: 'This opens your email or WhatsApp app with the message ready.',
    },
  },

  // ---------- about / company ----------
  about: {
    metaTitle: { es: 'Sobre nosotros · FoodMatch', en: 'About us · FoodMatch' },
    metaDesc: {
      es: 'FoodMatch es un proyecto de dos personas, Samu y Max, para ayudar a la gente a encontrar dónde comer en Valencia y a los restaurantes locales a que los encuentren.',
      en: 'FoodMatch is a two-person project, by Samu and Max, helping people find where to eat in Valencia and helping local restaurants get found.',
    },
    eyebrow: { es: 'Quiénes somos', en: 'Who we are' },
    h1a: { es: 'Un proyecto de dos,', en: 'A project of two,' },
    h1b: { es: 'hecho para Valencia.', en: 'made for Valencia.' },
    lede: {
      es: 'FoodMatch es una app que ayuda a la gente a encontrar dónde comer en Valencia, y le da a cada restaurante una página bonita y fácil de encontrar. No es una multinacional: somos dos personas construyendo algo que queremos que exista.',
      en: 'FoodMatch is an app that helps people find where to eat in Valencia, and gives every restaurant a beautiful page that is easy to find. It is not a multinational: we are two people building something we want to exist.',
    },
    storyTitle: { es: 'Por qué lo hacemos', en: 'Why we do it' },
    story: {
      es: [
        ['Lo construimos porque queremos que exista', 'Estábamos cansados de buscar dónde comer entre 200 resultados iguales y reseñas que no llevan a ningún sitio. FoodMatch es lo que nos gustaría usar a nosotros.'],
        ['Cuidamos cada restaurante en persona', 'Empezamos por los primeros 100 restaurantes de Valencia y los atendemos uno a uno: te llamamos, te ayudamos con la ficha y te explicamos cómo va.'],
        ['Sin comisiones, tus datos son tuyos', 'Cero comisión sobre reservas o pedidos, una cuota plana y transparente. Respetamos el GDPR y la AEPD, y no vendemos datos a nadie.'],
      ],
      en: [
        ['We built it because we want it to exist', 'We were tired of hunting for somewhere to eat among 200 identical results and reviews that lead nowhere. FoodMatch is what we would want to use ourselves.'],
        ['We look after every restaurant in person', 'We start with the first 100 restaurants in Valencia and take care of them one by one: we call you, help with your page and explain how it works.'],
        ['No commissions, your data is yours', 'Zero commission on bookings or orders, a flat and transparent fee. We comply with GDPR and the Spanish AEPD, and we never sell data.'],
      ],
    },
    foundersTitle: { es: 'Los fundadores', en: 'The founders' },
    foundersSub: { es: 'Veinte años. Dos países. Una idea.', en: 'Twenty years old. Two countries. One idea.' },
    founders: {
      es: [
        { name: 'Samu', img: 'samu', place: 'Valencia', bio: 'Lleva El Mesón Smashburgers en Navarra y vive cerca de Valencia. Conoce el mundo de los restaurantes desde dentro y se encarga de hablar con cada sitio que entra en FoodMatch.' },
        { name: 'Max', img: 'max', place: 'Alemania', bio: 'Desarrollador en Alemania. Construye la parte técnica de FoodMatch, desde la app hasta la IA que recomienda los restaurantes.' },
      ],
      en: [
        { name: 'Samu', img: 'samu', place: 'Valencia', bio: 'Runs El Mesón Smashburgers in Navarra and lives near Valencia. He knows the restaurant world from the inside and talks to every place that joins FoodMatch.' },
        { name: 'Max', img: 'max', place: 'Germany', bio: 'A developer based in Germany. He builds the technical side of FoodMatch, from the app to the AI that recommends restaurants.' },
      ],
    },
    closing: {
      es: 'No es una multinacional, es un proyecto de dos. Por eso podemos cuidar cada detalle.',
      en: 'It is not a multinational, it is a project of two. That is why we can care about every detail.',
    },
    ctaTitle: { es: '¿Comemos?', en: 'Shall we eat?' },
    ctaSub: {
      es: 'Explora los restaurantes de Valencia o añade el tuyo a la guía.',
      en: 'Explore Valencia\'s restaurants or add yours to the guide.',
    },
    ctaDiner: { es: 'Explorar restaurantes', en: 'Explore restaurants' },
    ctaRestaurant: { es: 'Añadir mi restaurante', en: 'Add my restaurant' },
  },

  footer: {
    tagline: {
      es: 'Descubre dónde comer en Valencia, y ayuda a los restaurantes locales a que los encuentren.',
      en: 'Discover where to eat in Valencia, and help local restaurants get found.',
    },
    diners: { es: 'Para comer', en: 'For diners' },
    restaurants: { es: 'Para restaurantes', en: 'For restaurants' },
    rights: { es: 'Hecho en Valencia.', en: 'Made in Valencia.' },
    pilotNote: {
      es: 'Piloto en Valencia. Los datos de restaurantes mostrados son de muestra hasta su verificación.',
      en: 'Valencia pilot. Restaurant data shown is sample data until verified.',
    },
  },
}
