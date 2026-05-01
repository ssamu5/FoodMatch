import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
  userId?: string
}

// Generar JWT token
export function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'default-secret'
  return jwt.sign({ userId }, secret, { expiresIn: '7d' })
}

// Verificar JWT token (middleware)
export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' })
    }

    const token = authHeader.substring(7)
    const secret = process.env.JWT_SECRET || 'default-secret'
    const decoded = jwt.verify(token, secret) as { userId: string }

    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
