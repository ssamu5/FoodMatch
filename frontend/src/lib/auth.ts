// FoodMatch authentication seam.
//
// Two providers behind one async API so the UI never branches on environment:
//   - 'supabase': used automatically when VITE_SUPABASE_URL + ANON_KEY are set.
//     Real email/password accounts via Supabase Auth.
//   - 'demo': the default for the pilot and for local/offline use. Email +
//     password accounts stored on-device. Passwords are never stored in clear
//     text (SHA-256 with a per-user salt via Web Crypto). This is a usability
//     stand-in, NOT production-grade security: a device-local hash cannot be a
//     real auth boundary. Production auth is Supabase Auth or the Express
//     backend (POST /api/v1/auth/register|login), documented in docs/SECURITY.md.
//
// On every successful register/login/logout we keep the legacy on-device
// `Account` (lib/storage) in sync, so the rest of the app (greetings, the
// first-run gate, saved items) keeps working unchanged.

import { supabase, supabaseEnabled } from './supabase'
import { getAccount, saveAccount, clearAccount } from './storage'
import type { Account } from '../types/profile'

export type AuthProvider = 'demo' | 'supabase'

export interface AuthUser {
  id: string
  email: string
  displayName: string
  provider: AuthProvider
  createdAt: string
}

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string }

export interface Credentials {
  email: string
  password: string
  displayName?: string
}

const SESSION_KEY = 'foodmatch.session'
const DEMO_USERS_KEY = 'foodmatch.demoUsers'
const MIN_PASSWORD = 8

export function activeProvider(): AuthProvider {
  return supabaseEnabled && supabase ? 'supabase' : 'demo'
}

// ---------- validation ----------

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD) return 'tooShort'
  return null
}

// ---------- demo provider storage ----------

interface DemoRecord {
  id: string
  email: string
  displayName: string
  salt: string
  passwordHash: string
  createdAt: string
}

function readDemoUsers(): Record<string, DemoRecord> {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, DemoRecord>) : {}
  } catch {
    return {}
  }
}

function writeDemoUsers(users: Record<string, DemoRecord>): void {
  try {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users))
  } catch {
    /* storage blocked: demo accounts will not persist across reloads */
  }
}

function randomId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  } catch {
    /* fall through */
  }
  return `u_${Math.abs(hashString(`${Date.now()}:${Math.random()}`))}`
}

// Tiny non-crypto fallback only used to mint an id when randomUUID is missing.
function hashString(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h |= 0
  }
  return h
}

async function hashPassword(password: string, salt: string): Promise<string> {
  // Web Crypto is available in modern browsers, the Capacitor WebView, and
  // Node 18+ (used by the test runner) via the global `crypto`.
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ---------- session + account sync ----------

function persistSession(user: AuthUser): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, provider: user.provider }))
  } catch {
    /* ignore */
  }
  const account: Account = {
    displayName: user.displayName,
    email: user.email,
    createdAt: user.createdAt,
  }
  saveAccount(account)
}

function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
  clearAccount()
}

// Synchronous "is someone signed in" check the UI can call during render.
// Backed by the legacy Account record so the first-run gate stays synchronous.
export function getCurrentUser(): AuthUser | null {
  const account = getAccount()
  if (!account) return null
  return {
    id: 'local',
    email: account.email ?? '',
    displayName: account.displayName,
    provider: activeProvider(),
    createdAt: account.createdAt,
  }
}

// ---------- public API ----------

export async function register(creds: Credentials): Promise<AuthResult> {
  const email = creds.email.trim().toLowerCase()
  const displayName = (creds.displayName ?? '').trim()
  if (!displayName) return { ok: false, error: 'nameRequired' }
  if (!isValidEmail(email)) return { ok: false, error: 'invalidEmail' }
  const pwProblem = passwordProblem(creds.password)
  if (pwProblem) return { ok: false, error: pwProblem }

  if (activeProvider() === 'supabase' && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: creds.password,
      options: { data: { displayName } },
    })
    if (error) return { ok: false, error: error.message }
    // When the Supabase project has email confirmation enabled (the default),
    // signUp returns a user but NO session: the person is not authenticated
    // until they click the confirmation link. Do not fake a signed-in state.
    if (!data.session) {
      return { ok: false, error: 'confirmEmail' }
    }
    const user: AuthUser = {
      id: data.user?.id ?? 'supabase',
      email,
      displayName,
      provider: 'supabase',
      createdAt: data.user?.created_at ?? new Date().toISOString(),
    }
    persistSession(user)
    return { ok: true, user }
  }

  // demo provider
  const users = readDemoUsers()
  if (users[email]) return { ok: false, error: 'emailTaken' }
  const salt = randomId()
  const passwordHash = await hashPassword(creds.password, salt)
  const record: DemoRecord = {
    id: randomId(),
    email,
    displayName,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  }
  users[email] = record
  writeDemoUsers(users)
  const user: AuthUser = {
    id: record.id,
    email,
    displayName,
    provider: 'demo',
    createdAt: record.createdAt,
  }
  persistSession(user)
  return { ok: true, user }
}

export async function login(creds: Credentials): Promise<AuthResult> {
  const email = creds.email.trim().toLowerCase()
  if (!isValidEmail(email)) return { ok: false, error: 'invalidEmail' }
  if (!creds.password) return { ok: false, error: 'passwordRequired' }

  if (activeProvider() === 'supabase' && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: creds.password,
    })
    if (error) return { ok: false, error: error.message }
    const displayName =
      (data.user?.user_metadata?.displayName as string | undefined) ?? email.split('@')[0]
    const user: AuthUser = {
      id: data.user?.id ?? 'supabase',
      email,
      displayName,
      provider: 'supabase',
      createdAt: data.user?.created_at ?? new Date().toISOString(),
    }
    persistSession(user)
    return { ok: true, user }
  }

  // demo provider
  const users = readDemoUsers()
  const record = users[email]
  if (!record) return { ok: false, error: 'invalidCredentials' }
  const candidate = await hashPassword(creds.password, record.salt)
  if (candidate !== record.passwordHash) return { ok: false, error: 'invalidCredentials' }
  const user: AuthUser = {
    id: record.id,
    email: record.email,
    displayName: record.displayName,
    provider: 'demo',
    createdAt: record.createdAt,
  }
  persistSession(user)
  return { ok: true, user }
}

export async function logout(): Promise<void> {
  if (activeProvider() === 'supabase' && supabase) {
    try {
      await supabase.auth.signOut()
    } catch {
      /* network/session error: still clear local state below */
    }
  }
  clearSession()
}
