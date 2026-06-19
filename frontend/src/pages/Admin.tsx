import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import { clearEvents, exportBundle, summarizeEvents } from '../lib/analytics'
import { getRestaurantLeads, getUserLeads } from '../lib/storage'
import { api } from '../lib/api'
import { openExternal } from '../lib/native'
import { useT } from '../lib/i18n'
import type { Restaurant } from '../types/restaurant'
import { isAdmin, listClaims, approveClaim, rejectClaim, pendingFirst, type ClaimRow } from '../lib/admin'

const ADMIN_CODE = 'foodmatch-2026' // MVP-only soft lock. Replace with real auth before any sensitive data lands.
const KEY = 'foodmatch.adminUnlocked'

export default function Admin() {
  const { t } = useT()
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })
  const [code, setCode] = useState('')
  const [, setTick] = useState(0)
  const [copied, setCopied] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [adminUser, setAdminUser] = useState<boolean>(false)
  const [claims, setClaims] = useState<ClaimRow[]>([])
  const [claimError, setClaimError] = useState<string | null>(null)

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 5000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    api.listRestaurants().then((rows) => {
      if (cancelled) return
      setRestaurants(rows)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    isAdmin().then((admin) => {
      if (cancelled) return
      setAdminUser(admin)
      if (admin) {
        listClaims().then((rows) => {
          if (cancelled) return
          setClaims(rows)
        })
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!unlocked) {
    return (
      <AppShell hideNav>
        <section className="pt-10">
          <h1 className="font-display text-[28px] font-bold text-tinta">{t('admin.heading')}</h1>
          <p className="mt-2 text-[13px] text-tinta/70">
            {t('admin.lockSubtitle')}
          </p>
          <div className="mt-5 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              type="password"
              placeholder={t('admin.codePlaceholder')}
              className="liquid-input flex-1 rounded-full px-4 py-2 text-[14px]"
            />
            <button
              type="button"
              className="btn-lime h-10 px-4 text-[13px]"
              onClick={() => {
                if (code === ADMIN_CODE) {
                  try { localStorage.setItem(KEY, '1') } catch {}
                  setUnlocked(true)
                }
              }}
            >
              {t('admin.unlockButton')}
            </button>
          </div>
        </section>
      </AppShell>
    )
  }

  const summary = summarizeEvents()
  const topClicks = Object.entries(summary.restaurantClicks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, count]) => ({
      count,
      restaurant: restaurants.find((r) => r.id === id),
    }))
  const topLeads = Object.entries(summary.whatsappLeadsByRestaurant)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, count]) => ({
      count,
      restaurant: restaurants.find((r) => r.id === id),
    }))
  const userLeads = getUserLeads()
  const restaurantLeads = getRestaurantLeads()

  async function refreshClaims() {
    const rows = await listClaims()
    setClaims(rows)
  }

  async function handleApprove(claim: ClaimRow) {
    setClaimError(null)
    const result = await approveClaim(claim)
    if (!result.ok) {
      setClaimError(result.error ?? 'Approve failed')
    }
    await refreshClaims()
  }

  async function handleReject(claim: ClaimRow) {
    setClaimError(null)
    const result = await rejectClaim(claim)
    if (!result.ok) {
      setClaimError(result.error ?? 'Reject failed')
    }
    await refreshClaims()
  }

  async function copyJson() {
    const json = exportBundle()
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked (common in iOS standalone): open as a data URL so
      // the operator can still copy/save it manually.
      openExternal('data:application/json;charset=utf-8,' + encodeURIComponent(json))
    }
  }

  return (
    <AppShell hideNav>
      <section className="pt-2">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[28px] font-bold text-tinta">{t('admin.heading')}</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-[12px] font-medium text-fresco hover:underline"
              onClick={copyJson}
            >
              {copied ? t('admin.copied') : t('admin.exportJson')}
            </button>
            <button
              type="button"
              className="text-[12px] text-tinta/70 hover:text-tomate"
              onClick={() => {
                if (confirm(t('admin.clearConfirm'))) {
                  clearEvents()
                  setTick((t) => t + 1)
                }
              }}
            >
              {t('admin.clearEvents')}
            </button>
          </div>
        </div>
        <p className="mt-1 text-[12px] text-tinta/70">
          {t('admin.statsNote')}
        </p>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-2">
        <Metric label={t('admin.metricTotalEvents')} value={summary.total} />
        <Metric label={t('admin.metricToday')} value={summary.today} />
        <Metric label={t('admin.metricSearches')} value={summary.searches} />
        <Metric label={t('admin.metricSearchesToday')} value={summary.searchesToday} />
      </section>

      <section className="mt-2 grid grid-cols-4 gap-2">
        <Metric label={t('admin.metricOpens')} value={summary.opens} />
        <Metric label={t('admin.metricSaves')} value={summary.saves} />
        <Metric label={t('admin.metricWaLeads')} value={summary.whatsappLeads} />
        <Metric label={t('admin.metricShares')} value={summary.shares} />
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('admin.sectionTopCuisines')}</h2>
        <KvList rows={topRows(summary.cuisineCounts)} emptyLabel={t('admin.emptyData')} />
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('admin.sectionTopAreas')}</h2>
        <KvList rows={topRows(summary.areaCounts)} emptyLabel={t('admin.emptyData')} />
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('admin.sectionMostOpened')}</h2>
        <div className="rounded-2xl glass p-3">
          {topClicks.length === 0 && <p className="text-[13px] text-tinta/70">{t('admin.emptyOpens')}</p>}
          {topClicks.map(({ count, restaurant }, i) => (
            <div key={(restaurant?.id || 'x') + i} className="flex items-baseline justify-between border-b border-tinta/12 py-1.5 last:border-0">
              <span className="text-[13px] text-tinta">
                {restaurant ? restaurant.name : t('admin.unknownRestaurant')}{' '}
                {restaurant && <span className="text-tinta/70">· {restaurant.area}</span>}
              </span>
              <span className="font-mono text-[12px] text-tomate">{count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('admin.sectionWaLeads')}</h2>
        <div className="rounded-2xl glass p-3">
          {topLeads.length === 0 && <p className="text-[13px] text-tinta/70">{t('admin.emptyWaLeads')}</p>}
          {topLeads.map(({ count, restaurant }, i) => (
            <div key={(restaurant?.id || 'x') + i} className="flex items-baseline justify-between border-b border-tinta/12 py-1.5 last:border-0">
              <span className="text-[13px] text-tinta">
                {restaurant ? restaurant.name : t('admin.unknownRestaurant')}{' '}
                {restaurant && <span className="text-tinta/70">· {restaurant.area}</span>}
              </span>
              <span className="font-mono text-[12px] text-fresco">{count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('admin.sectionNoResults')}</h2>
        <div className="rounded-2xl glass p-3 text-[13px] text-tinta">
          {summary.noResultQueries.length === 0 ? (
            <p className="text-tinta/70">{t('admin.emptyNoResults')}</p>
          ) : (
            summary.noResultQueries.map((q, i) => (
              <div key={q + i} className="border-b border-tinta/12 py-1.5 last:border-0">
                "{q}"
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-2">
        <Metric label={t('admin.metricUserLeads')} value={userLeads.length} />
        <Metric label={t('admin.metricRestaurantLeads')} value={restaurantLeads.length} />
      </section>

      <section className="mt-3">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">{t('admin.sectionRecentLeads')}</h2>
        <div className="rounded-2xl glass p-3">
          {restaurantLeads.length === 0 && <p className="text-[13px] text-tinta/70">{t('admin.emptyPartnerLeads')}</p>}
          {restaurantLeads.slice(0, 6).map((lead) => (
            <div key={lead.createdAt + lead.email} className="border-b border-tinta/12 py-1.5 text-[12px] last:border-0">
              <p className="text-tinta">{lead.restaurantName} · {lead.ownerName}</p>
              <p className="text-tinta/70">{lead.email}{lead.phone ? ` · ${lead.phone}` : ''}{lead.area ? ` · ${lead.area}` : ''}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 pb-6">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">Restaurant claims</h2>
        {!adminUser ? (
          <div className="rounded-2xl glass p-3 text-[13px] text-tinta/70">
            Sign in as an admin to review restaurant claims.
          </div>
        ) : (
          <>
            {claimError && (
              <p className="mb-2 rounded-xl bg-tomate/10 px-3 py-2 text-[12px] text-tomate">{claimError}</p>
            )}
            <div className="rounded-2xl glass p-3">
              {claims.length === 0 && (
                <p className="text-[13px] text-tinta/70">No claims yet.</p>
              )}
              {pendingFirst(claims).map((claim) => (
                <div key={claim.id} className="border-b border-tinta/12 py-2 last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-tinta">{claim.restaurant_name}</p>
                      <p className="text-[12px] text-tinta/70">
                        {claim.owner_name} · {claim.email}
                        {claim.area ? ` · ${claim.area}` : ''}
                      </p>
                    </div>
                    <span className={[
                      'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      claim.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      claim.status === 'approved' ? 'bg-fresco/15 text-fresco' :
                      'bg-tomate/10 text-tomate',
                    ].join(' ')}>
                      {claim.status}
                    </span>
                  </div>
                  {claim.status === 'pending' && (
                    <div className="mt-1.5 flex gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-fresco/15 px-3 py-1 text-[12px] font-medium text-fresco hover:bg-fresco/25"
                        onClick={() => handleApprove(claim)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-tomate/10 px-3 py-1 text-[12px] font-medium text-tomate hover:bg-tomate/20"
                        onClick={() => handleReject(claim)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </AppShell>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl glass p-3">
      <div className="text-[10px] uppercase tracking-[0.15em] text-tinta/50">{label}</div>
      <div className="mt-1 font-display text-[24px] font-bold text-tinta">{value}</div>
    </div>
  )
}

function KvList({ rows, emptyLabel }: { rows: { key: string; value: number }[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl glass p-3 text-[13px] text-tinta/70">{emptyLabel}</div>
    )
  }
  return (
    <div className="rounded-2xl glass p-3">
      {rows.map(({ key, value }) => (
        <div key={key} className="flex items-baseline justify-between border-b border-tinta/12 py-1.5 last:border-0">
          <span className="text-[13px] text-tinta">{key}</span>
          <span className="font-mono text-[12px] text-tomate">{value}</span>
        </div>
      ))}
    </div>
  )
}

function topRows(map: Record<string, number>): { key: string; value: number }[] {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([key, value]) => ({ key, value }))
}
