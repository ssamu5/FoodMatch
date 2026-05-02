import { Router } from 'express'
import {
  getAllRestaurants,
  searchRestaurants,
  filterRestaurants,
  getRestaurantById
} from '../controllers/restaurantController'

const router = Router()

// GET /api/v1/restaurants - Obtener todos los restaurantes
router.get('/', getAllRestaurants)

// GET /api/v1/restaurants/search - Buscar por nombre/descripción
router.get('/search', searchRestaurants)

// GET /api/v1/restaurants/filter - Filtrar por criterios
router.get('/filter', filterRestaurants)

// GET /api/v1/restaurants/:id - Obtener restaurante por ID
router.get('/:id', getRestaurantById)

export default router
