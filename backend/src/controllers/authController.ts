import { Request, Response } from 'express'
import { PrismaClient, UserRole } from '@prisma/client'
import { generateToken, AuthRequest } from '../middleware/auth'
import { comparePassword, DUMMY_HASH } from '../services/passwordService'
import { createUser, findByEmail, toSafeUser } from '../services/userService'
import { isEmail, isNonEmptyString, validatePassword } from '../lib/validation'

const prisma = new PrismaClient()

const ALLOWED_ROLES: UserRole[] = [UserRole.DINER, UserRole.RESTAURATEUR]

// POST /api/v1/auth/register
export async function register(req: Request, res: Response) {
  try {
    const { email, password, displayName, role } = req.body ?? {}

    const errors: Record<string, string> = {}
    if (!isEmail(email)) errors.email = 'A valid email is required'
    const pwdError = validatePassword(password)
    if (pwdError) errors.password = pwdError
    if (displayName !== undefined && !isNonEmptyString(displayName)) {
      errors.displayName = 'displayName must be a non-empty string'
    }
    // Diners and restaurateurs can self-register. ADMIN is never assignable here.
    let safeRole: UserRole = UserRole.DINER
    if (role !== undefined) {
      if (typeof role !== 'string' || !ALLOWED_ROLES.includes(role as UserRole)) {
        errors.role = 'role must be DINER or RESTAURATEUR'
      } else {
        safeRole = role as UserRole
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors })
    }

    const existing = await findByEmail(email)
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' })
    }

    const user = await createUser({
      email,
      password,
      displayName: displayName as string | undefined,
      role: safeRole
    })
    const token = generateToken(user.id)

    return res.status(201).json({ success: true, token, user })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error registering user' })
  }
}

// POST /api/v1/auth/login
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {}

    if (!isEmail(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ success: false, error: 'Email and password are required' })
    }

    const user = await findByEmail(email)
    // Generic 401 in both branches so we do not reveal which emails exist. Run a
    // bcrypt.compare against a dummy hash when the user is missing so the
    // response time does not leak account existence (timing side-channel).
    if (!user || !user.passwordHash) {
      await comparePassword(password, DUMMY_HASH)
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    const valid = await comparePassword(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    const token = generateToken(user.id)
    return res.json({ success: true, token, user: toSafeUser(user) })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error logging in' })
  }
}

// GET /api/v1/auth/me (requires verifyToken)
export async function me(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { profile: true }
    })

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    const { passwordHash, ...safe } = user
    return res.json({ success: true, user: safe })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error fetching current user' })
  }
}
