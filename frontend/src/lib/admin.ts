import { supabase, supabaseEnabled } from './supabase'

export interface ClaimRow {
  id: number
  restaurant_slug: string | null
  restaurant_name: string
  owner_name: string
  email: string
  phone: string | null
  area: string | null
  cuisine: string | null
  status: string
  created_at: string
}

async function uid(): Promise<string | null> {
  if (!supabaseEnabled || !supabase) return null
  try {
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null
  }
}

export async function isAdmin(): Promise<boolean> {
  const id = await uid()
  if (!id || !supabase) return false
  try {
    const { data, error } = await supabase.from('admins').select('user_id').eq('user_id', id).maybeSingle()
    if (error) return false
    return Boolean(data)
  } catch {
    return false
  }
}

export async function listClaims(): Promise<ClaimRow[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('restaurant_claims')
      .select('id, restaurant_slug, restaurant_name, owner_name, email, phone, area, cuisine, status, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as ClaimRow[]
  } catch (e) {
    console.warn('[admin] listClaims failed', e)
    return []
  }
}

export async function approveClaim(claim: ClaimRow): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'no supabase' }
  try {
    const { error: cErr } = await supabase.from('restaurant_claims').update({ status: 'approved' }).eq('id', claim.id)
    if (cErr) throw cErr
    if (claim.restaurant_slug) {
      const { error: rErr } = await supabase.from('restaurants').update({ is_partner: true }).eq('slug', claim.restaurant_slug)
      if (rErr) throw rErr
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export async function rejectClaim(claim: ClaimRow): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'no supabase' }
  try {
    const { error } = await supabase.from('restaurant_claims').update({ status: 'rejected' }).eq('id', claim.id)
    if (error) throw error
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// Pure: pending claims first, then newest-first within each group.
export function pendingFirst(claims: ClaimRow[]): ClaimRow[] {
  const rank = (s: string) => (s === 'pending' ? 0 : 1)
  return [...claims].sort((a, b) => {
    const r = rank(a.status) - rank(b.status)
    if (r !== 0) return r
    return b.created_at.localeCompare(a.created_at)
  })
}
