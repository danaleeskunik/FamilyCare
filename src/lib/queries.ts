/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase'
import { DAY_NAMES, formatDM, parseISO } from './dates'
import { PLAN_TONE, TODAY, type AdminUser, type OvertimeDecision, type PlanItem, type PricingSettings, type Client, type InvoiceRow, type Plan, type Region, type Slot, type Staff, type Task, type Tone, type Vendor } from '../data/model'

type Row = Record<string, any>
const one = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null))
const hhmm = (t: string | null) => (t ? t.slice(0, 5) : '')
/** timestamptz -> local HH:MM */
export const localHM = (ts: string | null) => (ts ? new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '')
const monthStart = (iso: string) => `${iso.slice(0, 7)}-01`

/** "נועה שרעבי" -> "נועה ש." (the short form the mock-ups use). */
export function shortName(full: string) {
  const p = full.trim().split(/\s+/)
  return p.length < 2 ? full : `${p[0]} ${p[p.length - 1][0]}.`
}

const TASK_STATUS: Record<string, [Tone, string]> = {
  planned: ['neutral', 'מתוכנן'],
  confirmed: ['blue', 'אושר ללקוח'],
  in_progress: ['green', 'בביצוע'],
  completed: ['green', 'הושלם'],
  cancelled: ['red', 'בוטל'],
}
const INVOICE_STATUS: Record<string, [Tone, string]> = {
  draft: ['neutral', 'טיוטה'],
  pending: ['orange', 'ממתין לסליקה'],
  paid: ['green', 'שולם'],
  card_declined: ['red', 'כרטיס נדחה'],
}

const ageOn = (birth: string | null, on: string) => {
  if (!birth) return 0
  const b = parseISO(birth), t = parseISO(on)
  let a = t.getFullYear() - b.getFullYear()
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--
  return a
}

function nextVisit(tasks: Task[], clientId: string) {
  const next = tasks
    .filter((t) => t.clientId === clientId && t.date >= TODAY && t.status && ['מתוכנן', 'אושר ללקוח'].includes(t.status[1]))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0]
  if (!next) return '—'
  if (next.date === TODAY) return `היום ${next.time}`
  const d = parseISO(next.date)
  const days = (d.getTime() - parseISO(TODAY).getTime()) / 86400000
  return days < 7 ? `${DAY_NAMES[d.getDay()]} ${next.time}` : `${formatDM(d)} ${next.time}`
}

export type Loaded = {
  regions: Region[]; plans: Plan[]; tasks: Task[]; clients: Client[]; vendors: Vendor[]; staff: Staff[]; invoices: InvoiceRow[]; slots: Slot[]
  decisions: Record<string, OvertimeDecision>; pricing: PricingSettings
  items: PlanItem[]; admins: AdminUser[]
}

/** Newer tables/columns may not exist until their migration runs; treat that as "no data" instead of failing the whole app. */
const optional = <T extends { error: unknown; data: unknown }>(r: T, what: string): T => {
  if (r.error) { console.warn(`${what} unavailable (has its migration been run?)`, r.error); return { ...r, error: null, data: null } }
  return r
}

export async function loadAll(): Promise<Loaded> {
  const month = monthStart(TODAY)
  const staffQ = await supabase.from('staff_members').select('*, staff_regions(regions(name)), clients!regular_companion_id(full_name), profiles(email)').order('created_at')
  // profiles.email comes with migration 0009; fall back to the plain query before that
  const staffRes = staffQ.error
    ? await supabase.from('staff_members').select('*, staff_regions(regions(name)), clients!regular_companion_id(full_name)').order('created_at')
    : staffQ
  const q = await Promise.all([
    supabase.from('regions').select('*').order('id'),
    supabase.from('membership_plans').select('*').order('sort_order'),
    supabase.from('tasks').select('*, clients(full_name), staff_members(full_name), vendors(name), regions(name)').order('scheduled_date').order('start_time'),
    supabase.from('clients').select('*, regions(name), membership_plans(id, name, monthly_sessions), staff_members!regular_companion_id(full_name), family_contacts(full_name, is_orderer)').order('created_at'),
    supabase.from('vendors').select('*, vendor_regions(regions(name)), vendor_price_items(label, amount, sort_order), vendor_reviews(rating)').order('created_at'),
    Promise.resolve(staffRes),
    supabase.from('staff_availability').select('*').eq('day', TODAY),
    supabase.from('client_month_usage').select('*').eq('month', month),
    supabase.from('staff_month_hours').select('*').eq('month', month),
    supabase.from('invoices').select('*, clients(full_name), family_contacts(full_name), invoice_lines(kind, amount)').eq('period_month', month).order('created_at'),
    Promise.resolve(supabase.from('client_visit_slots').select('*, clients(full_name), staff_members(full_name)').order('weekday').order('start_time')).then((r) => optional(r, 'client_visit_slots')),
    Promise.resolve(supabase.from('visit_overtime').select('*')).then((r) => optional(r, 'visit_overtime')),
    Promise.resolve(supabase.from('pricing_settings').select('*').maybeSingle()).then((r) => optional(r, 'pricing_settings')),
    Promise.resolve(supabase.from('coordination_items').select('*, clients(full_name), vendors(name), profiles!assignee_id(full_name)').order('event_date')).then((r) => optional(r, 'coordination_items')),
    Promise.resolve(supabase.from('profiles').select('id, full_name').eq('role', 'admin')).then((r) => optional(r, 'profiles')),
  ])
  const failed = q.find((r) => r.error)
  if (failed) throw failed.error
  const [regionsR, plansR, tasksR, clientsR, vendorsR, staffR, availR, usageR, hoursR, invR, slotsR, decR] = q.slice(0, 12).map((r) => (r.data ?? []) as Row[])
  const itemsR = (q[13].data ?? []) as Row[]
  const adminsR = (q[14].data ?? []) as Row[]
  const ps = (q[12].data ?? {}) as Row

  const regions: Region[] = regionsR.map((r) => ({ id: r.id, name: r.name }))
  const plans: Plan[] = plansR.map((p) => ({ id: p.id, name: p.name, price: Number(p.monthly_price), sessions: p.monthly_sessions }))

  const tasks: Task[] = tasksR.map((r) => {
    const staffName = one<Row>(r.staff_members)?.full_name as string | undefined
    const vendorName = one<Row>(r.vendors)?.name as string | undefined
    const who = [staffName && shortName(staffName), vendorName].filter(Boolean).join(' · ') || null
    return {
      id: r.id, date: r.scheduled_date, time: hhmm(r.start_time), end: hhmm(r.end_time), slotId: r.slot_id ?? null,
      client: one<Row>(r.clients)?.full_name ?? '', clientId: r.client_id,
      task: r.title, who, staffId: r.staff_id, vendorId: r.vendor_id,
      // No staff and no vendor = unassigned: the board shows the "שיבוץ" action instead of a status.
      status: who ? (TASK_STATUS[r.status] ?? null) : null, statusKey: r.status,
      checkedIn: localHM(r.checked_in_at), checkedOut: localHM(r.checked_out_at),
      region: one<Row>(r.regions)?.name ?? '', regionId: r.region_id,
    }
  })

  const usage = new Map(usageR.map((u) => [u.client_id, u.sessions_used as number]))
  const clients: Client[] = clientsR.map((r) => {
    const plan = one<Row>(r.membership_plans)
    const trial = r.trial_ends_on && r.trial_ends_on >= TODAY
    const orderer = ((r.family_contacts ?? []) as Row[]).find((f) => f.is_orderer)?.full_name ?? '—'
    return {
      id: r.id, name: r.full_name, age: ageOn(r.birth_date, TODAY), area: one<Row>(r.regions)?.name ?? '',
      plan: trial ? ['orange', 'תקופת היכרות'] : [PLAN_TONE[plan?.id] ?? 'neutral', plan?.name ?? '—'],
      used: `${usage.get(r.id) ?? 0} / ${plan?.monthly_sessions ?? 0}`,
      companion: one<Row>(r.staff_members)?.full_name ? shortName(one<Row>(r.staff_members)!.full_name) : null,
      companionId: r.regular_companion_id ?? null, region: one<Row>(r.regions)?.name ?? '',
      orderer, next: nextVisit(tasks, r.id),
    }
  })

  const vendors: Vendor[] = vendorsR.map((r) => {
    const exp = r.license_expires_on as string | null
    const ins = r.insurance_expires_on as string | null
    const licExpired = !!exp && exp < TODAY
    const insExpired = !!ins && ins < TODAY
    const frozen = licExpired || insExpired || !r.is_active
    const earliest = [exp, ins].filter(Boolean).sort()[0] as string | undefined
    const lic = licExpired ? `פג ${formatDM(parseISO(exp!))}` : insExpired ? 'ביטוח צד ג׳ פג'
      : earliest ? `בתוקף עד ${earliest.slice(5, 7)}.${earliest.slice(2, 4)}` : '—'
    const regionNames = ((r.vendor_regions ?? []) as Row[]).map((x) => one<Row>(x.regions)?.name as string).filter(Boolean)
    const ratings = ((r.vendor_reviews ?? []) as Row[]).map((x) => Number(x.rating))
    const prices = ([...(r.vendor_price_items ?? [])] as Row[]).sort((a, b) => a.sort_order - b.sort_order)
    return {
      id: r.id, name: r.name, field: r.trade,
      area: regionNames.length && regionNames.length === regions.length ? 'כל האזורים' : regionNames.join(' · '),
      price: prices.map((p) => `${p.label} ‎${Number(p.amount).toLocaleString('en-US')} ₪`).join(' · '),
      lic, licBad: frozen,
      rating: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—',
      status: frozen ? ['red', 'מוקפא'] : ['green', 'פעיל'],
    }
  })

  const availByStaff = new Map(availR.map((a) => [a.staff_id, a.note as string | null]))
  const inVisit = new Set(tasks.filter((t) => t.date === TODAY && t.status?.[1] === 'בביצוע' && t.staffId).map((t) => t.staffId))
  const hoursByStaff = new Map(hoursR.map((h) => [h.staff_id, Number(h.hours)]))
  const fmtHours = (h: number) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`
  const roleLabel = (r: Row) => r.job_title === 'personal_companion' ? 'מלווה אישית'
    : r.job_title === 'social_worker' ? 'עובדת סוציאלית' : r.gender === 'f' ? 'סטודנטית' : 'סטודנט'
  const staff: Staff[] = staffR.map((r) => ({
    id: r.id, name: r.full_name, role: roleLabel(r),
    areas: ((r.staff_regions ?? []) as Row[]).map((x) => one<Row>(x.regions)?.name).filter(Boolean).join(' · '),
    langs: ((r.languages ?? []) as string[]).join(', '),
    regulars: ((r.clients ?? []) as Row[]).map((c) => c.full_name).join(' · ') || '—',
    hours: fmtHours(hoursByStaff.get(r.id) ?? 0),
    avail: inVisit.has(r.id) ? ['green', 'בביקור'] : availByStaff.get(r.id) ? ['neutral', availByStaff.get(r.id)!] : ['green', 'זמין/ה'],
    regionNames: ((r.staff_regions ?? []) as Row[]).map((x) => one<Row>(x.regions)?.name as string).filter(Boolean),
    email: one<Row>(r.profiles)?.email ?? null,
  }))

  const slots: Slot[] = slotsR.map((r) => ({
    id: r.id, clientId: r.client_id, client: one<Row>(r.clients)?.full_name ?? '', weekday: r.weekday,
    start: hhmm(r.start_time), end: r.end_time ? hhmm(r.end_time) : null, purpose: r.purpose,
    staffId: r.staff_id, staff: one<Row>(r.staff_members)?.full_name ?? null,
    validFrom: r.valid_from, validTo: r.valid_to, active: r.is_active,
  }))

  const invoices: InvoiceRow[] = invR.map((r) => {
    const lines = (r.invoice_lines ?? []) as Row[]
    const sum = (f: (k: string) => boolean) => lines.filter((l) => f(l.kind)).reduce((a, l) => a + Number(l.amount), 0)
    const fee = sum((k) => k === 'membership')
    const hours = sum((k) => k === 'companion_overage')
    const total = sum(() => true)
    return {
      id: r.id, orderer: one<Row>(r.family_contacts)?.full_name ?? one<Row>(r.clients)?.full_name ?? '',
      fee, hours, vendors: total - fee - hours, total, status: INVOICE_STATUS[r.status] ?? ['neutral', r.status],
    }
  })

  const decisions: Record<string, OvertimeDecision> = {}
  for (const d of decR) decisions[d.task_id] = { decision: d.decision, minutes: d.overtime_minutes, charge: Number(d.client_charge) }
  const pricing: PricingSettings = {
    wage: Number(ps.companion_hourly_wage ?? 70), socialFactor: Number(ps.social_cost_factor ?? 1.3), travelPerDay: Number(ps.travel_per_workday ?? 30),
    graceMinutes: Number(ps.overtime_grace_minutes ?? 15), firstHour: Number(ps.overtime_first_hour ?? 300), additionalHour: Number(ps.overtime_additional_hour ?? 250),
  }
  const items: PlanItem[] = itemsR.map((r) => ({
    id: r.id, clientId: r.client_id, client: one<Row>(r.clients)?.full_name ?? '', kind: r.kind, title: r.title,
    eventDate: r.event_date, dueDate: r.due_date, assigneeId: r.assignee_id, assignee: one<Row>(r.profiles)?.full_name ?? null,
    vendorId: r.vendor_id, vendor: one<Row>(r.vendors)?.name ?? null, status: r.status, notes: r.notes ?? '',
  }))
  const admins: AdminUser[] = adminsR.map((r) => ({ id: r.id, name: r.full_name || 'ללא שם' }))
  return { regions, plans, tasks, clients, vendors, staff, invoices, slots, decisions, pricing, items, admins }
}

// ---- Client file ----
export type ClientDetail = {
  client: Row
  contacts: Row[]; medications: Row[]; allergies: Row[]; preferences: Row[]; documents: Row[]
  incidents: Row[]; notes: Row[]; history: Row[]; invoice: Row | null; sessionsUsed: number; billing: Row | null
}

export async function loadClientDetail(id: string): Promise<ClientDetail | null> {
  const eqc = (t: string) => supabase.from(t).select('*').eq('client_id', id)
  const q = await Promise.all([
    supabase.from('clients').select('*, regions(name), membership_plans(id, name, monthly_price, monthly_sessions, hours_per_session), staff_members!regular_companion_id(full_name)').eq('id', id).maybeSingle(),
    eqc('family_contacts').order('created_at'),
    eqc('client_medications').order('created_at'),
    eqc('client_allergies').order('created_at'),
    eqc('client_preferences').order('created_at'),
    eqc('client_documents').order('uploaded_at'),
    eqc('incidents').neq('status', 'closed').order('reported_at', { ascending: false }),
    Promise.resolve(eqc('client_notes').order('created_at')).then((r) => optional(r, 'client_notes')),
    supabase.from('tasks').select('*, staff_members(full_name), vendors(name), visit_summaries(status), task_feedback(rating), invoice_lines(amount)').eq('client_id', id).eq('status', 'completed').order('scheduled_date', { ascending: false }),
    supabase.from('invoices').select('*, invoice_lines(*)').eq('client_id', id).order('period_month', { ascending: false }).limit(1),
    Promise.resolve(supabase.from('client_billing').select('*').eq('client_id', id).maybeSingle()).then((r) => optional(r, 'client_billing')),
  ])
  const failed = q.find((r) => r.error)
  if (failed) throw failed.error
  const [c, contacts, meds, allergies, prefs, docs, incidents, notes, history, invoices, billing] = q.map((r) => r.data as any)
  if (!c) return null
  const month = monthStart(TODAY)
  const sessionsUsed = (history as Row[]).filter((t) => t.staff_id && monthStart(t.scheduled_date) === month).length
  return { client: c, contacts, medications: meds, allergies, preferences: prefs, documents: docs, incidents, notes, history, invoice: (invoices as Row[])[0] ?? null, sessionsUsed, billing: billing ?? null }
}

// ---- Prefill for edit forms ----
export async function fetchClientForEdit(id: string) {
  const [c, o, b] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).maybeSingle(),
    supabase.from('family_contacts').select('id, full_name').eq('client_id', id).eq('is_orderer', true).maybeSingle(),
    Promise.resolve(supabase.from('client_billing').select('*').eq('client_id', id).maybeSingle()).then((r) => optional(r, 'client_billing')),
  ])
  const err = c.error ?? o.error ?? b.error
  if (err) throw err
  return c.data ? { client: { ...(c.data as Row), ...((b.data as Row | null) ?? {}) } as Row, orderer: o.data as Row | null } : null
}

export async function fetchVendorForEdit(id: string) {
  const [v, r, p] = await Promise.all([
    supabase.from('vendors').select('*').eq('id', id).maybeSingle(),
    supabase.from('vendor_regions').select('region_id').eq('vendor_id', id),
    supabase.from('vendor_price_items').select('*').eq('vendor_id', id).order('sort_order'),
  ])
  const err = v.error ?? r.error ?? p.error
  if (err) throw err
  return v.data ? { vendor: v.data as Row, regionIds: (r.data ?? []).map((x: Row) => x.region_id as number), prices: (p.data ?? []) as Row[] } : null
}

export async function fetchStaffForEdit(id: string) {
  let withEmail = await supabase.from('staff_members').select('*, profiles(email)').eq('id', id).maybeSingle()
  // profiles.email arrives with migration 0009; fall back to the plain row before that
  if (withEmail.error) withEmail = await supabase.from('staff_members').select('*').eq('id', id).maybeSingle()
  const [s, r] = await Promise.all([
    Promise.resolve(withEmail),
    supabase.from('staff_regions').select('region_id').eq('staff_id', id),
  ])
  const err = s.error ?? r.error
  if (err) throw err
  return s.data ? { staff: s.data as Row, regionIds: (r.data ?? []).map((x: Row) => x.region_id as number) } : null
}

// ---- Monthly staff report (used by the admin page and by the companion's own page) ----
export async function loadStaffMonth(staffId: string, monthISO: string) {
  const [y, m] = monthISO.split('-').map(Number)
  const next = `${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, '0')}-01`
  const [t, e] = await Promise.all([
    supabase.from('tasks').select('*, clients(full_name, address, regions(name))').eq('staff_id', staffId).gte('scheduled_date', monthISO).lt('scheduled_date', next).order('scheduled_date').order('start_time'),
    Promise.resolve(supabase.from('staff_expenses').select('*').eq('staff_id', staffId).gte('expense_date', monthISO).lt('expense_date', next).order('expense_date')).then((r) => optional(r, 'staff_expenses')),
  ])
  if (t.error) throw t.error
  const ids = ((t.data ?? []) as Row[]).map((x) => x.id as string)
  // Decisions are admin-only under RLS; for a companion this simply returns nothing.
  const d = ids.length ? optional(await supabase.from('visit_overtime').select('task_id, decision').in('task_id', ids), 'visit_overtime') : { data: [] as Row[], error: null }
  return { tasks: (t.data ?? []) as Row[], expenses: (e.data ?? []) as Row[], decisions: (d.data ?? []) as Row[] }
}

// ---- Companion's own app ----
export async function loadCompanion(fromISO: string, toISO: string) {
  const me = await supabase.from('staff_members').select('id, full_name').limit(1).maybeSingle()
  if (me.error) throw me.error
  if (!me.data) return null
  const [tasks, slots, notes, clients, allergies] = await Promise.all([
    supabase.from('tasks').select('*, regions(name), clients(id, full_name, address, phone, building_code, mobility_notes)').eq('staff_id', me.data.id).gte('scheduled_date', fromISO).lte('scheduled_date', toISO).order('scheduled_date').order('start_time'),
    supabase.from('client_visit_slots').select('*, clients(full_name)').eq('is_active', true).order('weekday').order('start_time'),
    supabase.from('client_notes').select('*').order('created_at'),
    supabase.from('clients').select('id, full_name, address, phone, building_code, mobility_notes, cognitive_notes, regions(name)').order('full_name'),
    supabase.from('client_allergies').select('client_id, allergen, severity'),
  ])
  const err = tasks.error ?? slots.error ?? notes.error ?? clients.error ?? allergies.error
  if (err) throw err
  return {
    me: me.data as { id: string; full_name: string },
    tasks: (tasks.data ?? []) as Row[], slots: (slots.data ?? []) as Row[], notes: (notes.data ?? []) as Row[],
    clients: (clients.data ?? []) as Row[], allergies: (allergies.data ?? []) as Row[],
  }
}
