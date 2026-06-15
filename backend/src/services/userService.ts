import { PrismaClient, User, UserRole } from '@prisma/client'
import { hashPassword } from './passwordService'

const prisma = new PrismaClient()

// Public-facing user shape with the password hash stripped out.
export type SafeUser = Omit<User, 'passwordHash'>

export function toSafeUser(user: User): SafeUser {
  const { passwordHash, ...safe } = user
  return safe
}

export async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } })
}

export async function findById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } })
}

type CreateUserInput = {
  email: string
  password: string
  displayName?: string
  role?: UserRole
}

export async function createUser(input: CreateUserInput): Promise<SafeUser> {
  const passwordHash = await hashPassword(input.password)
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      displayName: input.displayName,
      role: input.role ?? UserRole.DINER
    }
  })
  return toSafeUser(user)
}
