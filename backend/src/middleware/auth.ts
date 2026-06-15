import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
  userId?: string
}

// The placeholder shipped in .env.example. It is world-readable in the repo, so
// signing tokens with it would let anyone forge a JWT for any account.
const PLACEHOLDER_SECRET = 'your_super_secret_jwt_key_change_this_in_production'

// Resolve the JWT secret once at module load. In production we refuse to start
// with a missing secret, the committed placeholder, or a too-short secret: any
// of these would make tokens forgeable. Outside production we keep a dev
// fallback so local work does not require any setup.
function resolveSecret(): string {
  const secret = process.env.JWT_SECRET
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd) {
    if (!secret || secret.length === 0) {
      throw new Error('JWT_SECRET must be set in production')
    }
    if (secret === PLACEHOLDER_SECRET) {
      throw new Error('JWT_SECRET is still the .env.example placeholder; set a real secret in production')
    }
    if (secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production')
    }
    return secret
  }
  if (secret && secret.length > 0) return secret
  return 'default-secret'
}

const JWT_SECRET = resolveSecret()

// Generar JWT token
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

// Verificar JWT token (middleware)
export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
