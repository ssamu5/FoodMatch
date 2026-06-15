import { Router } from 'express'
import { getProfile, upsertProfile } from '../controllers/userController'
import { verifyToken } from '../middleware/auth'

const router = Router()

// GET /api/v1/users/profile - Perfil de gustos (requiere token)
router.get('/profile', verifyToken, getProfile)

// PUT /api/v1/users/profile - Crear/actualizar perfil de gustos (requiere token)
router.put('/profile', verifyToken, upsertProfile)

export default router
