// Lightweight device identifier persisted in localStorage.
// Used to attribute analytics events without requiring auth.

const KEY = 'foodmatch.deviceId'

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'd-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(KEY)
    if (existing) return existing
    const fresh = generateId()
    localStorage.setItem(KEY, fresh)
    return fresh
  } catch {
    // localStorage may be blocked in private mode etc.
    return 'no-store'
  }
}
