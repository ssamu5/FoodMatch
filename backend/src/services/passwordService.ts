import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

// A precomputed valid bcrypt hash of a constant. Used by login to run a real
// bcrypt.compare even when the user does not exist, so the missing-user and
// wrong-password branches take comparable time and do not leak which emails are
// registered via a timing side-channel.
export const DUMMY_HASH = '$2b$10$Qd1kt9osvbBRWcRHaL52X.M00.ex.85YHITvYyO.YjKU4SFTxQI4y'

// Hashear una contraseña
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// Comparar contraseña con hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
