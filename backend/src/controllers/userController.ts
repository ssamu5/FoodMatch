import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'
import { isStringArray } from '../lib/validation'

const prisma = new PrismaClient()

// GET /api/v1/users/profile (requires verifyToken)
export async function getProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    const profile = await prisma.tasteProfile.findUnique({
      where: { userId: req.userId }
    })

    return res.json({ success: true, data: profile })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error fetching profile' })
  }
}

// PUT /api/v1/users/profile (requires verifyToken)
export async function upsertProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    const {
      favoriteCuisines,
      preferredAreas,
      dietary,
      vibePreferences,
      budgetComfort,
      marketingOptIn
    } = req.body ?? {}

    const errors: Record<string, string> = {}

    const arrayFields = {
      favoriteCuisines,
      preferredAreas,
      dietary,
      vibePreferences
    }
    for (const [field, value] of Object.entries(arrayFields)) {
      if (value !== undefined && !isStringArray(value)) {
        errors[field] = `${field} must be an array of strings`
      }
    }

    if (
      budgetComfort !== undefined &&
      budgetComfort !== null &&
      (typeof budgetComfort !== 'number' || budgetComfort < 1 || budgetComfort > 4)
    ) {
      errors.budgetComfort = 'budgetComfort must be a number between 1 and 4'
    }

    if (marketingOptIn !== undefined && typeof marketingOptIn !== 'boolean') {
      errors.marketingOptIn = 'marketingOptIn must be a boolean'
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors })
    }

    const profile = await prisma.tasteProfile.upsert({
      where: { userId: req.userId },
      create: {
        userId: req.userId,
        favoriteCuisines: favoriteCuisines ?? [],
        preferredAreas: preferredAreas ?? [],
        dietary: dietary ?? [],
        vibePreferences: vibePreferences ?? [],
        budgetComfort: budgetComfort ?? null,
        marketingOptIn: marketingOptIn ?? false
      },
      update: {
        // Only overwrite fields that were actually provided.
        ...(favoriteCuisines !== undefined && { favoriteCuisines }),
        ...(preferredAreas !== undefined && { preferredAreas }),
        ...(dietary !== undefined && { dietary }),
        ...(vibePreferences !== undefined && { vibePreferences }),
        ...(budgetComfort !== undefined && { budgetComfort }),
        ...(marketingOptIn !== undefined && { marketingOptIn })
      }
    })

    return res.json({ success: true, data: profile })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error saving profile' })
  }
}
