import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import { clearEvents, summarizeEvents } from '../lib/analytics'
import { getRestaurantLeads, getUserLeads } from '../lib/storage'
import { api } from '../lib/api'

const ADMIN_CODE = 'foodmatch-2026' // MVP-only soft lock. Replace with real auth before any sensitive data lands.
const KEY = 'foodmatch.adminUnlocked'

export default function Admin() {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })
  const [code, setCode] = useState('')
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 5000)
    return () => window.clearInterval(id)
  }, [])

  if (!unlocked) {
    return (
      <AppShell>
        <section className="pt-10">
          <h1 className="font-display text-[28px] font-bold text-tinta">Admin</h1>
          <p className="mt-2 text-[13px] text-tinta/70">
            MVP-only soft lock. Type the code to view internal stats.
          </p>
          <div className="mt-5 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              type="password"
              placeholder="code"
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
              Unlock
            </button>
          </div>
        </section>
      </AppShell>
    )
  }

  const summary = summarizeEvents()
  const restaurants = api.listRestaurants()
  const topClicks = Object.entries(summary.restaurantClicks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, count]) => ({
      count,
      restaurant: restaurants.find((r) => r.id === id),
    }))
  const userLeads = getUserLeads()
  const restaurantLeads = getRestaurantLeads()

  return (
    <AppShell>
      <section className="pt-2">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[28px] font-bold text-tinta">Admin</h1>
          <button
            type="button"
            className="text-[12px] text-tinta/70 hover:text-bad"
            onClick={() => {
              if (confirm('Clear all analytics events on this device?')) {
                clearEvents()
                setTick((t) => t + 1)
              }
            }}
          >
            Clear events
          </button>
        </div>
        <p className="mt-1 text-[12px] text-tinta/70">
          MVP stats from local event buffer. Replace with Supabase queries once the backend lands.
        </p>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-2">
        <Metric label="Total events" value={summary.total} />
        <Metric label="Today" value={summary.today} />
        <Metric label="Searches" value={summary.searches} />
        <Metric label="Searches today" value={summary.searchesToday} />
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">Top cuisines (searched)</h2>
        <KvList rows={topRows(summary.cuisineCounts)} />
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">Top areas (searched)</h2>
        <KvList rows={topRows(summary.areaCounts)} />
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">Most opened restaurants</h2>
        <div className="rounded-2xl glass p-3">
          {topClicks.length === 0 && <p className="text-[13px] text-tinta/70">No restaurant opens yet.</p>}
          {topClicks.map(({ count, restaurant }, i) => (
            <div key={(restaurant?.id || 'x') + i} className="flex items-baseline justify-between border-b border-tinta/12 py-1.5 last:border-0">
              <span className="text-[13px] text-tinta">
                {restaurant ? restaurant.name : 'Unknown'}{' '}
                {restaurant && <span className="text-tinta/70">· {restaurant.area}</span>}
              </span>
              <span className="font-mono text-[12px] text-tomate">{count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">No-result searches</h2>
        <div className="rounded-2xl glass p-3 text-[13px] text-tinta">
          {summary.noResultQueries.length === 0 ? (
            <p className="text-tinta/70">None.</p>
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
        <Metric label="User leads" value={userLeads.length} />
        <Metric label="Restaurant leads" value={restaurantLeads.length} />
      </section>

      <section className="mt-3">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-tinta/50">Recent restaurant leads</h2>
        <div className="rounded-2xl glass p-3">
          {restaurantLeads.length === 0 && <p className="text-[13px] text-tinta/70">No partner applications yet.</p>}
          {restaurantLeads.slice(0, 6).map((lead) => (
            <div key={lead.createdAt + lead.email} className="border-b border-tinta/12 py-1.5 text-[12px] last:border-0">
              <p className="text-tinta">{lead.restaurantName} · {lead.ownerName}</p>
              <p className="text-tinta/70">{lead.email}{lead.phone ? ` · ${lead.phone}` : ''}{lead.area ? ` · ${lead.area}` : ''}</p>
            </div>
          ))}
        </div>
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

function KvList({ rows }: { rows: { key: string; value: number }[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl glass p-3 text-[13px] text-tinta/70">No data yet.</div>
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
