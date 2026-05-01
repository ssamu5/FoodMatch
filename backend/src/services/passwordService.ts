import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

// Hashear una contraseña
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// Comparar contraseña con hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
