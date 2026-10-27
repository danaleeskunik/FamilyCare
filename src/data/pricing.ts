/** Price sheet: membership fee and extra-hour rate per plan. Extra hours cost more in the evening and at night. */
export type PlanRate = { id: 'basic' | 'platinum' | 'top_platinum'; name: string; fee: number; meetings: number; hours: number; rate: number }

export const PLAN_RATES: PlanRate[] = [
  { id: 'basic', name: 'Business', fee: 2950, meetings: 4, hours: 2, rate: 368 },
  { id: 'platinum', name: 'Platinum', fee: 8350, meetings: 8, hours: 3, rate: 347 },
  { id: 'top_platinum', name: 'Top Platinum', fee: 15950, meetings: 12, hours: 4, rate: 332 },
]

/** Multiplier of the plan's hourly rate by time of day (minutes from midnight, end exclusive). */
export const RATE_BANDS = [
  { from: 7 * 60, to: 19 * 60, mult: 1, label: '07:00–19:00' },
  { from: 19 * 60, to: 23 * 60, mult: 1.3, label: '19:00–23:00' },
  { from: 23 * 60, to: 31 * 60, mult: 1.8, label: '23:00–07:00' },
] as const

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
