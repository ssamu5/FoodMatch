import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Obtener TODOS los restaurantes con paginación
export async function getAllRestaurants(req: Request, res: Response) {
  try {
    const { city = 'Valencia', limit = 10, offset = 0 } = req.query
    const limitNum = Math.min(parseInt(limit as string) || 10, 50)
    const offsetNum = parseInt(offset as string) || 0

    const restaurants = await prisma.restaurant.findMany({
      where: {
        city: city as string
      },
      take: limitNum,
      skip: offsetNum,
      orderBy: { name: 'asc' }
    })

    const total = await prisma.restaurant.count({
      where: { city: city as string }
    })

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

// BUSCAR restaurantes por nombre/descripción
export async function searchRestaurants(req: Request, res: Response) {
  try {
    const { query = '', limit = 10, offset = 0 } = req.query
    const limitNum = Math.min(parseInt(limit as string) || 10, 50)
    const offsetNum = parseInt(offset as string) || 0

    const restaurants = await prisma.restaurant.findMany({
      where: {
        OR: [
          { name: { contains: query as string, mode: 'insensitive' } },
          { description: { contains: query as string, mode: 'insensitive' } },
          { cuisine: { contains: query as string, mode: 'insensitive' } }
        ]
      },
      take: limitNum,
      skip: offsetNum,
      orderBy: { name: 'asc' }
    })

    res.json({
      success: true,
      data: restaurants,
      query,
      pagination: {
        total: restaurants.length,
        limit: limitNum,
        offset: offsetNum
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error searching restaurants' })
  }
}

// FILTRAR restaurantes por múltiples criterios
export async function filterRestaurants(req: Request, res: Response) {
  try {
    const { cuisine, priceRange, city = 'Valencia', format, limit = 10, offset = 0 } = req.query
    const limitNum = Math.min(parseInt(limit as string) || 10, 50)
    const offsetNum = parseInt(offset as string) || 0

    // Construir filtro dinámico
    const whereClause: any = { city }

    if (cuisine && cuisine !== 'Todos') {
      whereClause.cuisine = { contains: cuisine as string, mode: 'insensitive' }
    }

    if (priceRange) {
      whereClause.priceRange = priceRange as string
    }

    if (format && format !== 'Todos') {
      whereClause.format = format as string
    }

    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      take: limitNum,
      skip: offsetNum,
      orderBy: { name: 'asc' }
    })

    const total = await prisma.restaurant.count({ where: whereClause })

    res.json({
      success: true,
      data: restaurants,
      filters: { cuisine, priceRange, city, format },
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

// Obtener un restaurante por ID
export async function getRestaurantById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const restaurant = await prisma.restaurant.findUnique({
      where: { id }
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
