import { useEffect, useSyncExternalStore } from 'react'
import { supabase } from '../lib/supabase'

/** Price sheet: membership fee and extra-hour rate per plan. Extra hours cost more in the evening and at night.
 *  The values below are only the starting point: the live sheet is read from the database (price_sheet) and edited in Finance,
 *  so the public site, the client portal and the admin screens always show the same numbers. */
export type PlanRate = { id: 'basic' | 'platinum' | 'top_platinum'; name: string; fee: number; meetings: number; hours: number; rate: number }

export const PLAN_RATES: PlanRate[] = [
  { id: 'basic', name: 'Business', fee: 2950, meetings: 4, hours: 2, rate: 368 },
  { id: 'platinum', name: 'Platinum', fee: 8350, meetings: 8, hours: 3, rate: 347 },
  { id: 'top_platinum', name: 'Top Platinum', fee: 15950, meetings: 12, hours: 4, rate: 332 },
]

/** Multiplier of the plan's hourly rate by time of day (minutes from midnight, end exclusive). */
export const RATE_BANDS: { from: number; to: number; mult: number; label: string }[] = [
  { from: 7 * 60, to: 19 * 60, mult: 1, label: '07:00–19:00' },
  { from: 19 * 60, to: 23 * 60, mult: 1.3, label: '19:00–23:00' },
  { from: 23 * 60, to: 31 * 60, mult: 1.8, label: '23:00–07:00' },
]

export type PriceSheet = { plans: PlanRate[]; evening_pct: number; night_pct: number }
export const pctOf = (mult: number) => Math.round(mult * 1000) / 10

// Shared, in-memory copy of the live sheet. Arrays are updated in place so every importer sees the new numbers;
// usePrices() re-renders the component that calls it.
let version = 0
const subs = new Set<() => void>()
export function applyPriceSheet(d: PriceSheet) {
  for (const p of d.plans) {
    const cur = PLAN_RATES.find((x) => x.id === p.id)
    if (cur) Object.assign(cur, { name: p.name ?? cur.name, fee: Number(p.fee), meetings: Number(p.meetings), hours: Number(p.hours), rate: Number(p.rate) })
  }
  RATE_BANDS[1].mult = Number(d.evening_pct) / 100
  RATE_BANDS[2].mult = Number(d.night_pct) / 100
  version += 1
  subs.forEach((f) => f())
}
let loading: Promise<void> | null = null
export function loadPrices(force = false): Promise<void> {
  if (!loading || force) {
    loading = Promise.resolve(supabase.rpc('public_prices')).then(({ data, error }) => {
      if (!error && data && Array.isArray((data as PriceSheet).plans)) applyPriceSheet(data as PriceSheet)
    }).catch(() => undefined)
  }
  return loading
}
/** Call at the top of any component that shows prices. */
export function usePrices() {
  useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f) } }, () => version)
  useEffect(() => { void loadPrices() }, [])
}

export type ExtraLine = { label: string; minutes: number; mult: number; amount: number }

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
const round2 = (n: number) => Math.round(n * 100) / 100

/** Charge for extra time that starts at `start` and runs `minutes`, split across the day / evening / night bands (crossing midnight is fine). */
export function extraHoursCharge(rate: number, start: string, minutes: number): { lines: ExtraLine[]; total: number } {
  const s = toMin(start)
  const e = s + minutes
  const lines = RATE_BANDS.map((b) => ({ label: b.label, mult: b.mult, minutes: 0, amount: 0 }))
  for (let day = -1; day <= 2; day++) {
    // 00:00–07:00 belongs to the previous night's band, so shift the 23:00–07:00 band back one day too.
    RATE_BANDS.forEach((b, i) => {
      const from = day * 1440 + b.from
      const to = day * 1440 + b.to
      const overlap = Math.min(e, to) - Math.max(s, from)
      if (overlap > 0) lines[i].minutes += overlap
    })
  }
  for (const l of lines) l.amount = round2((l.minutes / 60) * rate * l.mult)
  const used = lines.filter((l) => l.minutes > 0)
  return { lines: used, total: round2(used.reduce((n, l) => n + l.amount, 0)) }
}

export const planFromLabel = (label: string): PlanRate['id'] | '' =>
  /top/i.test(label) ? 'top_platinum' : /platinum|פלטינום/i.test(label) ? 'platinum' : /business|basic|בסיס|ביזנס/i.test(label) ? 'basic' : ''

export const toMinutes = toMin
