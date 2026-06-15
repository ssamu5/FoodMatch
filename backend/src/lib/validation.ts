// Small, dependency-free validation helpers. Kept intentionally minimal to
// avoid expanding the supply chain (under audit). Not a full schema library.

// Pragmatic email check: a single @, non-empty local part, a dot in the domain.
// Not RFC 5322 exhaustive on purpose; good enough to reject obvious junk.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 320 && EMAIL_RE.test(value)
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

// Returns an error message when the password is invalid, or null when valid.
export function validatePassword(value: unknown): string | null {
  if (typeof value !== 'string') return 'Password is required'
  if (value.length < 8) return 'Password must be at least 8 characters'
  if (value.length > 200) return 'Password is too long'
  return null
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

export type FieldRule = {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'string[]'
  // Custom validator: return an error message, or null when valid.
  validate?: (value: unknown) => string | null
}

export type Schema = Record<string, FieldRule>

export type ValidationResult =
  | { ok: true; errors: null }
  | { ok: false; errors: Record<string, string> }

// Validate a plain object body against a simple field schema.
export function validateBody(body: unknown, schema: Schema): ValidationResult {
  const errors: Record<string, string> = {}
  const obj = (body ?? {}) as Record<string, unknown>

  for (const [field, rule] of Object.entries(schema)) {
    const value = obj[field]
    const present = value !== undefined && value !== null

    if (!present) {
      if (rule.required) errors[field] = `${field} is required`
      continue
    }

    if (rule.type) {
      const typeOk =
        rule.type === 'string[]'
          ? isStringArray(value)
          : rule.type === 'number'
          ? typeof value === 'number' && !Number.isNaN(value)
          : typeof value === rule.type
      if (!typeOk) {
        errors[field] = `${field} must be a ${rule.type}`
        continue
      }
    }

    if (rule.validate) {
      const msg = rule.validate(value)
      if (msg) errors[field] = msg
    }
  }

  return Object.keys(errors).length === 0
    ? { ok: true, errors: null }
    : { ok: false, errors }
}
