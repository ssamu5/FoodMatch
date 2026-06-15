import { PrismaClient, PlanCode, BillingInterval, ListingStatus, ListingSource, SubscriptionStatus } from '@prisma/client'

// Idempotent seed for the FoodMatch pilot. Re-runnable: everything is upserted
// on a unique key (plan code, restaurant slug) so running it twice is safe.
//
// Run with: npm run db:seed  (requires a running Postgres + DATABASE_URL)

const prisma = new PrismaClient()

// ---------- plans (revenue catalog) ----------

const PLANS = [
  {
    code: PlanCode.FREE,
    name: 'Public listing',
    priceCents: 0,
    interval: BillingInterval.MONTH,
    commissionBps: 0,
    features: ['public_listing', 'appears_in_search', 'appears_in_ai_answers', 'claimable'],
  },
  {
    code: PlanCode.FOUNDER,
    name: 'Founder',
    priceCents: 6900, // 69 EUR/mo, locked for the pilot cohort
    interval: BillingInterval.MONTH,
    commissionBps: 0,
    features: ['everything_in_pro', 'managed_photos_menu', 'demand_stats', 'verified_badge', 'price_locked_24m'],
  },
  {
    code: PlanCode.PRO,
    name: 'Pro',
    priceCents: 9900, // 99 EUR/mo standard
    interval: BillingInterval.MONTH,
    commissionBps: 0,
    features: ['managed_photos_menu', 'demand_stats', 'verified_badge', 'own_reviews', 'analytics'],
  },
]

// ---------- restaurants (Valencia pilot) ----------

const RESTAURANTS = [
  {
    slug: 'sushi-paradise',
    name: 'Sushi Paradise',
    description: 'Nigiri y rolls preparados al momento por un itamae con producto del mercado.',
    cuisine: 'sushi',
    secondaryCuisines: ['Asian fusion'],
    tags: ['nigiri', 'omakase', 'sake'],
    vibe: ['date', 'quiet'],
    bestFor: ['date night', 'special treat'],
    area: 'City center',
    postalCode: '46003',
    address: 'Carrer de la Pau 15',
    latitude: 39.4715,
    longitude: -0.3756,
    priceLevel: 3,
    averageSpend: 38,
    rating: 4.6,
    reviewCount: 212,
    googleRating: 4.6,
    googleReviewCount: 980,
    imagePlaceholder: 'lime-dark',
    vegetarianFriendly: true,
    veganFriendly: false,
    glutenFreeOptions: true,
    listingStatus: ListingStatus.VERIFIED,
    source: ListingSource.PARTNER,
    isPartner: true,
    plan: PlanCode.PRO,
    dishes: [
      { name: 'Omakase 12 piezas', priceEur: 32, category: 'Sushi', allergens: ['fish', 'soy', 'sesame'], isSignature: true },
      { name: 'Roll de salmón y aguacate', priceEur: 12, category: 'Rolls', allergens: ['fish', 'soy'] },
    ],
  },
  {
    slug: 'pizza-napoli',
    name: 'Pizza Napoli',
    description: 'Masa de fermentación lenta y horno de leña. Napolitana de verdad.',
    cuisine: 'pizza',
    secondaryCuisines: ['pasta'],
    tags: ['horno de leña', 'napolitana', 'familiar'],
    vibe: ['casual', 'family', 'lively'],
    bestFor: ['family dinner', 'casual night'],
    area: 'Ruzafa',
    postalCode: '46006',
    address: 'Carrer de Sueca 41',
    latitude: 39.4596,
    longitude: -0.3742,
    priceLevel: 2,
    averageSpend: 18,
    rating: 4.4,
    reviewCount: 540,
    googleRating: 4.4,
    googleReviewCount: 1320,
    imagePlaceholder: 'lime-bright',
    vegetarianFriendly: true,
    veganFriendly: true,
    glutenFreeOptions: true,
    listingStatus: ListingStatus.CLAIMED,
    source: ListingSource.PARTNER,
    isPartner: false,
    dishes: [
      { name: 'Margherita', priceEur: 9, category: 'Pizza', allergens: ['gluten', 'milk'], isSignature: true },
      { name: 'Diavola', priceEur: 12, category: 'Pizza', allergens: ['gluten', 'milk'] },
    ],
  },
  {
    slug: 'la-carne-y-el-fuego',
    name: 'La Carne y el Fuego',
    description: 'Brasa de carbón, chuletón madurado y verduras de temporada a la parrilla.',
    cuisine: 'steak',
    secondaryCuisines: ['Mediterranean'],
    tags: ['brasa', 'madurado', 'vino'],
    vibe: ['group', 'lively'],
    bestFor: ['groups', 'meat lovers'],
    area: 'El Carmen',
    postalCode: '46003',
    address: 'Carrer dels Cavallers 22',
    latitude: 39.4762,
    longitude: -0.3801,
    priceLevel: 3,
    averageSpend: 35,
    rating: 4.5,
    reviewCount: 318,
    imagePlaceholder: 'lime-dark',
    vegetarianFriendly: false,
    veganFriendly: false,
    glutenFreeOptions: true,
    listingStatus: ListingStatus.PUBLIC_BASIC,
    source: ListingSource.PUBLIC_DATA,
    sourceAttribution: 'Public listing assembled from publicly available information.',
    isPartner: false,
  },
  {
    slug: 'taj-mahal-valencia',
    name: 'Taj Mahal',
    description: 'Curris del norte de India, tandoor y opciones veganas claramente marcadas.',
    cuisine: 'Indian',
    secondaryCuisines: ['vegetarian'],
    tags: ['tandoor', 'curry', 'picante'],
    vibe: ['casual', 'cozy'],
    bestFor: ['vegetarians', 'spice lovers'],
    area: 'Canovas',
    postalCode: '46005',
    address: 'Carrer de Cirilo Amorós 60',
    latitude: 39.4673,
    longitude: -0.3669,
    priceLevel: 2,
    averageSpend: 20,
    rating: 4.3,
    reviewCount: 276,
    imagePlaceholder: 'lime-bright',
    vegetarianFriendly: true,
    veganFriendly: true,
    glutenFreeOptions: true,
    listingStatus: ListingStatus.PUBLIC_BASIC,
    source: ListingSource.PUBLIC_DATA,
    sourceAttribution: 'Public listing assembled from publicly available information.',
    isPartner: false,
  },
  {
    slug: 'el-olivar-mediterraneo',
    name: 'El Olivar Mediterráneo',
    description: 'Cocina mediterránea de mercado, arroces y pescado fresco junto al cauce.',
    cuisine: 'Mediterranean',
    secondaryCuisines: ['paella', 'seafood'],
    tags: ['arroz', 'mercado', 'terraza'],
    vibe: ['outdoor', 'casual'],
    bestFor: ['long lunch', 'paella'],
    area: 'Benimaclet',
    postalCode: '46020',
    address: 'Carrer de Baró de San Petrillo 8',
    latitude: 39.4869,
    longitude: -0.3573,
    priceLevel: 2,
    averageSpend: 24,
    rating: 4.2,
    reviewCount: 190,
    imagePlaceholder: 'lime-bright',
    vegetarianFriendly: true,
    veganFriendly: false,
    glutenFreeOptions: true,
    listingStatus: ListingStatus.PUBLIC_BASIC,
    source: ListingSource.PUBLIC_DATA,
    sourceAttribution: 'Public listing assembled from publicly available information.',
    isPartner: false,
  },
  {
    slug: 'taqueria-mexico-lindo',
    name: 'Taquería México Lindo',
    description: 'Tacos de maíz nixtamalizado, salsas caseras y mezcal. Sitio pequeño y honesto.',
    cuisine: 'Mexican',
    secondaryCuisines: ['bar'],
    tags: ['tacos', 'mezcal', 'económico'],
    vibe: ['casual', 'solo', 'late night'],
    bestFor: ['cheap eats', 'quick bite'],
    area: 'Marina / beach',
    postalCode: '46011',
    address: 'Carrer de la Reina 120',
    latitude: 39.4641,
    longitude: -0.3289,
    priceLevel: 1,
    averageSpend: 14,
    rating: 4.5,
    reviewCount: 410,
    imagePlaceholder: 'lime-dark',
    vegetarianFriendly: true,
    veganFriendly: true,
    glutenFreeOptions: true,
    listingStatus: ListingStatus.PUBLIC_BASIC,
    source: ListingSource.PUBLIC_DATA,
    sourceAttribution: 'Public listing assembled from publicly available information.',
    isPartner: false,
  },
]

async function main() {
  // Plans
  for (const p of PLANS) {
    await prisma.plan.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        priceCents: p.priceCents,
        interval: p.interval,
        commissionBps: p.commissionBps,
        features: p.features,
        active: true,
      },
      create: {
        code: p.code,
        name: p.name,
        priceCents: p.priceCents,
        interval: p.interval,
        commissionBps: p.commissionBps,
        features: p.features,
      },
    })
  }
  console.log(`Seeded ${PLANS.length} plans`)

  const proPlan = await prisma.plan.findUnique({ where: { code: PlanCode.PRO } })

  // Restaurants + dishes (+ a demo subscription for the VERIFIED one)
  for (const r of RESTAURANTS) {
    const { dishes, plan, ...data } = r
    const restaurant = await prisma.restaurant.upsert({
      where: { slug: r.slug },
      update: data,
      create: data,
    })

    if (dishes && dishes.length) {
      // Replace dishes for a clean, idempotent re-seed.
      await prisma.dish.deleteMany({ where: { restaurantId: restaurant.id } })
      await prisma.dish.createMany({
        data: dishes.map((d) => ({ ...d, restaurantId: restaurant.id })),
      })
    }

    // Demonstrate the monetisation path: the verified restaurant has an active
    // Pro subscription.
    if (plan === PlanCode.PRO && proPlan) {
      await prisma.subscription.upsert({
        where: { restaurantId: restaurant.id },
        update: { status: SubscriptionStatus.ACTIVE, planId: proPlan.id },
        create: {
          restaurantId: restaurant.id,
          planId: proPlan.id,
          status: SubscriptionStatus.ACTIVE,
        },
      })
    }
  }
  console.log(`Seeded ${RESTAURANTS.length} restaurants`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
