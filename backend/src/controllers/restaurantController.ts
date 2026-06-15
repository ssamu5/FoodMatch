import { Request, Response } from 'express'
import { Prisma, PrismaClient, ListingStatus } from '@prisma/client'

const prisma = new PrismaClient()

// Obtener TODOS los restaurantes con paginación
export async function getAllRestaurants(req: Request, res: Response) {
  try {
    const { city = 'Valencia', limit = 10, offset = 0 } = req.query
    const limitNum = Math.min(parseInt(limit as string) || 10, 50)
    const offsetNum = parseInt(offset as string) || 0

    const where: Prisma.RestaurantWhereInput = { city: city as string }

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        take: limitNum,
        skip: offsetNum,
        orderBy: [{ rating: 'desc' }, { name: 'asc' }]
      }),
      prisma.restaurant.count({ where })
    ])

    res.json({
      success: true,
      data: restaurants,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching restaurants' })
  }
}

// BUSCAR restaurantes por nombre/descripción/cocina/tags
export async function searchRestaurants(req: Request, res: Response) {
  try {
    const { query = '', limit = 10, offset = 0 } = req.query
    const q = (query as string).trim()
    const limitNum = Math.min(parseInt(limit as string) || 10, 50)
    const offsetNum = parseInt(offset as string) || 0

    const where: Prisma.RestaurantWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { cuisine: { contains: q, mode: 'insensitive' } },
            // String[] arrays only support exact element match, not contains.
            { tags: { has: q } }
          ]
        }
      : {}

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        take: limitNum,
        skip: offsetNum,
        orderBy: [{ rating: 'desc' }, { name: 'asc' }]
      }),
      prisma.restaurant.count({ where })
    ])

    res.json({
      success: true,
      data: restaurants,
      query: q,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error searching restaurants' })
  }
}

// FILTRAR restaurantes por múltiples criterios
export async function filterRestaurants(req: Request, res: Response) {
  try {
    const {
      cuisine,
      area,
      priceLevel,
      city = 'Valencia',
      vegetarian,
      vegan,
      glutenFree,
      listingStatus,
      limit = 10,
      offset = 0
    } = req.query
    const limitNum = Math.min(parseInt(limit as string) || 10, 50)
    const offsetNum = parseInt(offset as string) || 0

    // Construir filtro dinámico
    const where: Prisma.RestaurantWhereInput = { city: city as string }

    if (cuisine && cuisine !== 'Todos') {
      where.cuisine = { contains: cuisine as string, mode: 'insensitive' }
    }

    if (area && area !== 'Todos') {
      where.area = { contains: area as string, mode: 'insensitive' }
    }

    const priceLevelNum = parseInt(priceLevel as string)
    if (!Number.isNaN(priceLevelNum)) {
      where.priceLevel = priceLevelNum
    }

    if (vegetarian === 'true') where.vegetarianFriendly = true
    if (vegan === 'true') where.veganFriendly = true
    if (glutenFree === 'true') where.glutenFreeOptions = true

    // Validate listingStatus against the enum before applying it.
    if (
      typeof listingStatus === 'string' &&
      (Object.values(ListingStatus) as string[]).includes(listingStatus)
    ) {
      where.listingStatus = listingStatus as ListingStatus
    }

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        take: limitNum,
        skip: offsetNum,
        orderBy: [{ rating: 'desc' }, { name: 'asc' }]
      }),
      prisma.restaurant.count({ where })
    ])

    res.json({
      success: true,
      data: restaurants,
      filters: { cuisine, area, priceLevel, city, vegetarian, vegan, glutenFree, listingStatus },
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error filtering restaurants' })
  }
}

// Obtener un restaurante por ID (con platos y conteo de reseñas)
export async function getRestaurantById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        dishes: true,
        _count: { select: { reviews: true } }
      }
    })

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' })
    }

    res.json({
      success: true,
      data: restaurant
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching restaurant' })
  }
}
