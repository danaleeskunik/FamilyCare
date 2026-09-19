/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PricingSettings } from '../data/model'
import { localHM } from './queries'

type Row = Record<string, any>

export type VisitRow = {
  id: string; date: string; clientId: string; client: string; place: string
  plannedStart: string; plannedEnd: string; checkedIn: string; checkedOut: string
  plannedMin: number | null; actualMin: number | null
  /** minutes beyond the plan (never negative); null when it cannot be computed */
  overMin: number | null
  decision: 'billed' | 'waived' | null
}
export type ExpenseRow = { id: string; date: string; amount: number; description: string; status: 'pending' | 'approved' | 'rejected'; taskId: string | null }
export type ClientTotal = { clientId: string; client: string; place: string; visits: number; minutes: number }

export type MonthReport = {
  visits: VisitRow[]
  visitCount: number
  totalMinutes: number
  daysWorked: number
  avgMinutes: number
  missingTimes: number // completed visits with no check-in/out: hours cannot be counted
  perClient: ClientTotal[]
  expenses: ExpenseRow[]
  approvedExpenses: number
  pendingExpenses: number
}

const mins = (a: string, b: string) => Math.round((+new Date(b) - +new Date(a)) / 60000)
const toMin = (t: string) => { const [h, m] = t.slice(0, 5).split(':').map(Number); return h * 60 + m }

export const fmtHours = (m: number) => `${Math.floor(m / 60)}:${String(Math.round(m % 60)).padStart(2, '0')}`

export function buildMonthReport(tasks: Row[], expenses: Row[], decisions: Row[] = []): MonthReport {
  const dec = new Map(decisions.map((d) => [d.task_id as string, d.decision as 'billed' | 'waived']))
  const visits: VisitRow[] = tasks
    .filter((t) => t.status === 'completed')
    .map((t) => {
      const c = Array.isArray(t.clients) ? t.clients[0] : t.clients
      const region = Array.isArray(c?.regions) ? c?.regions[0]?.name : c?.regions?.name
      const actual = t.checked_in_at && t.checked_out_at ? mins(t.checked_in_at, t.checked_out_at) : null
      const planned = t.end_time ? toMin(t.end_time) - toMin(t.start_time) : null
      return {
        id: t.id, date: t.scheduled_date, clientId: t.client_id, client: c?.full_name ?? '',
        place: c?.address ? (region && !c.address.includes(region) ? `${c.address}, ${region}` : c.address) : region || '',
        plannedStart: t.start_time.slice(0, 5), plannedEnd: t.end_time ? t.end_time.slice(0, 5) : '',
        checkedIn: localHM(t.checked_in_at), checkedOut: localHM(t.checked_out_at),
        plannedMin: planned, actualMin: actual,
        overMin: actual !== null && planned !== null ? Math.max(0, actual - planned) : null,
        decision: dec.get(t.id) ?? null,
      }
    })

  const totalMinutes = visits.reduce((a, v) => a + (v.actualMin ?? 0), 0)
  const counted = visits.filter((v) => v.actualMin !== null)
  const perClientMap = new Map<string, ClientTotal>()
  for (const v of visits) {
    const cur = perClientMap.get(v.clientId) ?? { clientId: v.clientId, client: v.client, place: v.place, visits: 0, minutes: 0 }
    cur.visits += 1
    cur.minutes += v.actualMin ?? 0
    perClientMap.set(v.clientId, cur)
  }
  const exp: ExpenseRow[] = expenses.map((e) => ({ id: e.id, date: e.expense_date, amount: Number(e.amount), description: e.description, status: e.status, taskId: e.task_id }))
  return {
    visits, visitCount: visits.length, totalMinutes,
    daysWorked: new Set(counted.map((v) => v.date)).size,
    avgMinutes: counted.length ? Math.round(totalMinutes / counted.length) : 0,
    missingTimes: visits.length - counted.length,
    perClient: [...perClientMap.values()].sort((a, b) => b.minutes - a.minutes),
    expenses: exp,
    approvedExpenses: exp.filter((e) => e.status === 'approved').reduce((a, e) => a + e.amount, 0),
    pendingExpenses: exp.filter((e) => e.status === 'pending').reduce((a, e) => a + e.amount, 0),
  }
}

/** Payroll for a month. Hours are the ACTUAL hours (check-in to check-out), so overtime is paid automatically. */
export function payroll(r: MonthReport, wage: number, p: PricingSettings) {
  const hours = r.totalMinutes / 60
  const gross = Math.round(hours * wage * 100) / 100
  const travel = r.daysWorked * p.travelPerDay
  const total = gross + travel + r.approvedExpenses
  return { hours, wage, gross, travel, expenses: r.approvedExpenses, total, companyCost: Math.round((gross * p.socialFactor + travel + r.approvedExpenses) * 100) / 100 }
}

/** Overtime charge for the client, same rule as the database function decide_visit_overtime. */
export function overtimeCharge(overMin: number, p: PricingSettings) {
  return Math.round((Math.min(overMin, 60) / 60 * p.firstHour + Math.max(overMin - 60, 0) / 60 * p.additionalHour) * 100) / 100
}
