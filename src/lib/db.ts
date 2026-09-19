import type { Client, Staff, Task, Tone, Vendor } from '../data/mock'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>
const tone = (t: string) => t as Tone

export const taskFromRow = (r: Row): Task => ({
  id: r.id, date: r.date, time: r.time, client: r.client, task: r.task, who: r.who,
  status: r.status_label ? [tone(r.status_tone), r.status_label] : null, region: r.region,
})
export const taskToRow = (t: Task) => ({
  id: t.id, date: t.date, time: t.time, client: t.client, task: t.task, who: t.who,
  status_tone: t.status ? t.status[0] : null, status_label: t.status ? t.status[1] : null, region: t.region,
})

export const clientFromRow = (r: Row): Client => ({
  id: r.id, name: r.name, age: r.age, area: r.area, plan: [tone(r.plan_tone), r.plan_name],
  used: r.used, companion: r.companion, orderer: r.orderer, next: r.next_visit,
})
export const clientToRow = (c: Client) => ({
  id: c.id, name: c.name, age: c.age, area: c.area, plan_tone: c.plan[0], plan_name: c.plan[1],
  used: c.used, companion: c.companion, orderer: c.orderer, next_visit: c.next,
})

export const vendorFromRow = (r: Row): Vendor => ({
  id: r.id, name: r.name, field: r.field, area: r.area, price: r.price, lic: r.lic, licBad: r.lic_bad,
  rating: r.rating, status: [tone(r.status_tone), r.status_label],
})
export const vendorToRow = (v: Vendor) => ({
  id: v.id, name: v.name, field: v.field, area: v.area, price: v.price, lic: v.lic, lic_bad: v.licBad,
  rating: v.rating, status_tone: v.status[0], status_label: v.status[1],
})

export const staffFromRow = (r: Row): Staff => ({
  id: r.id, name: r.name, role: r.role, areas: r.areas, langs: r.langs, regulars: r.regulars, hours: r.hours,
  avail: [tone(r.avail_tone), r.avail_label],
})
export const staffToRow = (s: Staff) => ({
  id: s.id, name: s.name, role: s.role, areas: s.areas, langs: s.langs, regulars: s.regulars, hours: s.hours,
  avail_tone: s.avail[0], avail_label: s.avail[1],
})
