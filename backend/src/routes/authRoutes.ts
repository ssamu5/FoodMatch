import { Router } from 'express'
import { register, login, me } from '../controllers/authController'
import { verifyToken } from '../middleware/auth'

const router = Router()

// POST /api/v1/auth/register - Crear cuenta
router.post('/register', register)

// POST /api/v1/auth/login - Iniciar sesión
router.post('/login', login)

// GET /api/v1/auth/me - Usuario actual (requiere token)
router.get('/me', verifyToken, me)

export default router
