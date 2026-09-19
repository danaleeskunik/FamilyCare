import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { AdminUser, Client, InvoiceRow, OvertimeDecision, Plan, PlanItem, PricingSettings, Region, Slot, Staff, Task, Vendor } from '../data/model'
import { supabase } from '../lib/supabase'
import { loadAll } from '../lib/queries'
import { DAY_NAMES, formatDM, parseISO } from '../lib/dates'
import { useAuth } from './AuthStore'

export type TaskInput = { clientId: string; date: string; time: string; title: string; regionId: number; staffId: string; vendorId: string; status: string; checkedIn: string; checkedOut: string }
export type SlotInput = { clientId: string; weekday: number; start: string; end: string; purpose: string; staffId: string; validFrom: string; validTo: string; active: boolean }
export type ClientInput = {
  name: string; birthDate: string; regionId: number; planId: string; trialEndsOn: string | null; companionId: string; orderer: string
  phone: string; address: string; buildingCode: string; dependency: string; mobilityNotes: string; cognitiveNotes: string; cap: string; cardLast4: string
}
export type VendorInput = { name: string; trade: string; regionIds: number[]; licenseExpiry: string; insuranceExpiry: string; prices: { id?: string; label: string; amount: number }[] }
export type StaffInput = { name: string; jobTitle: string; gender: string; phone: string; languages: string; regionIds: number[]; email: string; currentEmail: string | null }

export type ItemInput = { clientId: string; kind: string; title: string; eventDate: string; dueDate: string; assigneeId: string; vendorId: string; status: string; notes: string }
export type FormKind = 'task' | 'client' | 'vendor' | 'staff' | 'slot' | 'item'
/** preset.id present = edit that record; absent = create. */
export type FormState = { kind: FormKind; preset?: Record<string, string> } | null
export type PendingDelete = { kind: FormKind; id: string; name: string; warning: string } | null

type Store = {
  regions: Region[]; plans: Plan[]
  tasks: Task[]; clients: Client[]; vendors: Vendor[]; staff: Staff[]; invoices: InvoiceRow[]; slots: Slot[]
  decisions: Record<string, OvertimeDecision>; pricing: PricingSettings
  items: PlanItem[]; admins: AdminUser[]
  loading: boolean
  loadError: boolean
  reload: () => void
  regionFilter: string | null
  setRegionFilter: (r: string | null) => void
  /** Save = create (id null) or update. Each writes to the database, refreshes lists, and resolves false (with a toast) on failure. */
  saveTask: (id: string | null, t: TaskInput) => Promise<boolean>
  saveClient: (id: string | null, c: ClientInput) => Promise<boolean>
  saveVendor: (id: string | null, v: VendorInput) => Promise<boolean>
  saveStaff: (id: string | null, s: StaffInput) => Promise<boolean>
  saveSlot: (id: string | null, s: SlotInput) => Promise<boolean>
  /** Assign (or clear) the companion on a recurring slot; future planned visits follow. */
  assignSlot: (slotId: string, staffId: string | null) => Promise<boolean>
  /** Create the visits for the next 30 days from the recurring slots (idempotent). */
  generateNow: () => Promise<void>
  saveItem: (id: string | null, i: ItemInput) => Promise<boolean>
  setItemStatus: (id: string, status: string) => Promise<boolean>
  setItemAssignee: (id: string, assigneeId: string | null) => Promise<boolean>
  /** End-of-day decision on a visit that ran over: bill the client or waive. Resolves the charge, or null on failure. */
  decideOvertime: (taskId: string, bill: boolean) => Promise<number | null>
  revertOvertime: (taskId: string) => Promise<boolean>
  pendingDelete: PendingDelete
  askDelete: (kind: FormKind, id: string) => void
  cancelDelete: () => void
  confirmDelete: () => Promise<void>
  form: FormState
  openForm: (kind: FormKind, preset?: Record<string, string>) => void
  closeForm: () => void
  toast: string | null
  notify: (msg: string) => void
}

const Ctx = createContext<Store | null>(null)
const EMPTY = { regions: [] as Region[], plans: [] as Plan[], tasks: [] as Task[], clients: [] as Client[], vendors: [] as Vendor[], staff: [] as Staff[], invoices: [] as InvoiceRow[], slots: [] as Slot[],
  decisions: {} as Record<string, OvertimeDecision>,
  pricing: { wage: 70, socialFactor: 1.3, travelPerDay: 30, graceMinutes: 15, firstHour: 300, additionalHour: 250 } as PricingSettings,
  items: [] as PlanItem[], admins: [] as AdminUser[] }
const TABLE: Record<FormKind, string> = { task: 'tasks', client: 'clients', vendor: 'vendors', staff: 'staff_members', slot: 'client_visit_slots', item: 'coordination_items' }
const nul = (s: string) => (s.trim() ? s.trim() : null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const { role, session } = useAuth()
  const enabled = role === 'admin'

  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [nonce, setNonce] = useState(0)

  const [regionFilter, setRegionFilter] = useState<string | null>('רמת השרון')
  const [form, setForm] = useState<FormState>(null)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null)
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!enabled) { setData(EMPTY); return }
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    // Keep the rolling month of visits topped up (idempotent); a failure must not block loading.
    Promise.resolve(supabase.rpc('generate_tasks_from_slots')).catch(() => null).then(() => loadAll())
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { console.error('load failed', e); if (!cancelled) setLoadError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [enabled, nonce])

  const notify = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 5000)
  }, [])

  /** Silent refresh after a write, so screens never show stale rows. */
  const refresh = useCallback(async () => {
    try { setData(await loadAll()) } catch (e) { console.error('refresh failed', e) }
  }, [])

  const fail = useCallback((what: string, error: { message?: string; code?: string }) => {
    console.error(what, error)
    notify(error.message?.includes('frozen') ? 'הספק מוקפא (רישיון או ביטוח שפג) ולא ניתן לשבץ אותו.' : 'לא הצלחנו לשמור. בדקי את החיבור ונסי שוב.')
    return false
  }, [notify])

  /** Make a join table match `wanted`: insert what is missing, delete what is extra. Never wipes and re-inserts. */
  const syncLinks = useCallback(async (table: string, ownerCol: string, ownerId: string, otherCol: string, wanted: number[]) => {
    const { data: cur, error } = await supabase.from(table).select(otherCol).eq(ownerCol, ownerId)
    if (error) return error
    const have = ((cur ?? []) as unknown as Record<string, number>[]).map((r) => r[otherCol])
    const add = wanted.filter((x) => !have.includes(x))
    const drop = have.filter((x) => !wanted.includes(x))
    if (add.length) {
      const r = await supabase.from(table).insert(add.map((x) => ({ [ownerCol]: ownerId, [otherCol]: x })))
      if (r.error) return r.error
    }
    if (drop.length) {
      const r = await supabase.from(table).delete().eq(ownerCol, ownerId).in(otherCol, drop)
      if (r.error) return r.error
    }
    return null
  }, [])

  const saveTask = useCallback(async (id: string | null, t: TaskInput) => {
    const row = {
      client_id: t.clientId, scheduled_date: t.date, start_time: t.time, title: t.title, region_id: t.regionId,
      staff_id: t.staffId || null, vendor_id: t.vendorId || null, status: t.status,
      checked_in_at: t.checkedIn ? new Date(`${t.date}T${t.checkedIn}:00`).toISOString() : null,
      checked_out_at: t.checkedOut ? new Date(`${t.date}T${t.checkedOut}:00`).toISOString() : null,
    }
    const { error } = id
      ? await supabase.from('tasks').update(row).eq('id', id)
      : await supabase.from('tasks').insert({ ...row, created_by: session?.user.id ?? null })
    if (error) return fail('save task', error)
    await refresh()
    return true
  }, [fail, refresh, session])

  const saveClient = useCallback(async (id: string | null, c: ClientInput) => {
    const row = {
      full_name: c.name, birth_date: c.birthDate, region_id: c.regionId, plan_id: c.planId, trial_ends_on: c.trialEndsOn,
      regular_companion_id: c.companionId || null, phone: nul(c.phone), address: nul(c.address), building_code: nul(c.buildingCode),
      dependency_level: c.dependency || null, mobility_notes: nul(c.mobilityNotes), cognitive_notes: nul(c.cognitiveNotes),
    }
    const billing = { card_last4: nul(c.cardLast4), monthly_budget_cap: c.cap.trim() ? Number(c.cap) : null }
    if (id) {
      const { error } = await supabase.from('clients').update(row).eq('id', id)
      if (error) return fail('update client', error)
      const cur = await supabase.from('family_contacts').select('id').eq('client_id', id).eq('is_orderer', true).maybeSingle()
      const r = cur.data
        ? await supabase.from('family_contacts').update({ full_name: c.orderer }).eq('id', cur.data.id)
        : await supabase.from('family_contacts').insert({ client_id: id, full_name: c.orderer, permission: 'full', is_orderer: true })
      if (r.error) return fail('save orderer', r.error)
      if (billing.card_last4 || billing.monthly_budget_cap !== null) {
        const b = await supabase.from('client_billing').upsert({ client_id: id, ...billing })
        if (b.error) return fail('save billing', b.error)
      } else {
        await supabase.from('client_billing').delete().eq('client_id', id) // cleared in the form; ignore if the table does not exist yet
      }
    } else {
      const { data: created, error } = await supabase.from('clients').insert({ ...row, member_since: new Date().toISOString().slice(0, 10) }).select('id').single()
      if (error) return fail('create client', error)
      const { error: e2 } = await supabase.from('family_contacts').insert({ client_id: created.id, full_name: c.orderer, permission: 'full', is_orderer: true })
      if (e2) {
        await supabase.from('clients').delete().eq('id', created.id) // no half-created client without an orderer
        return fail('create orderer', e2)
      }
      if (billing.card_last4 || billing.monthly_budget_cap !== null) {
        const b = await supabase.from('client_billing').insert({ client_id: created.id, ...billing })
        if (b.error) {
          await supabase.from('clients').delete().eq('id', created.id)
          return fail('create billing', b.error)
        }
      }
    }
    await refresh()
    return true
  }, [fail, refresh])

  const saveVendor = useCallback(async (id: string | null, v: VendorInput) => {
    const row = { name: v.name, trade: v.trade, license_expires_on: v.licenseExpiry, insurance_expires_on: v.insuranceExpiry }
    let vid = id
    if (id) {
      const { error } = await supabase.from('vendors').update(row).eq('id', id)
      if (error) return fail('update vendor', error)
    } else {
      const { data: created, error } = await supabase.from('vendors').insert(row).select('id').single()
      if (error) return fail('create vendor', error)
      vid = created.id
    }
    const rollback = async (err: { message?: string }, what: string) => {
      if (!id && vid) await supabase.from('vendors').delete().eq('id', vid)
      return fail(what, err)
    }
    const linkErr = await syncLinks('vendor_regions', 'vendor_id', vid!, 'region_id', v.regionIds)
    if (linkErr) return rollback(linkErr, 'vendor regions')

    // Prices: update rows that have an id, insert new ones, delete the ones removed in the form.
    const { data: cur, error: curErr } = await supabase.from('vendor_price_items').select('id').eq('vendor_id', vid!)
    if (curErr) return rollback(curErr, 'vendor prices read')
    const keep = v.prices.filter((p) => p.id).map((p) => p.id!)
    const drop = (cur ?? []).map((r) => r.id as string).filter((x) => !keep.includes(x))
    if (drop.length) {
      const r = await supabase.from('vendor_price_items').delete().in('id', drop)
      if (r.error) return rollback(r.error, 'vendor prices delete')
    }
    for (const [i, p] of v.prices.entries()) {
      const r = p.id
        ? await supabase.from('vendor_price_items').update({ label: p.label, amount: p.amount, sort_order: i }).eq('id', p.id)
        : await supabase.from('vendor_price_items').insert({ vendor_id: vid, label: p.label, amount: p.amount, sort_order: i })
      if (r.error) return rollback(r.error, 'vendor price save')
    }
    await refresh()
    return true
  }, [fail, refresh, syncLinks])

  const saveStaff = useCallback(async (id: string | null, s: StaffInput) => {
    const row = {
      full_name: s.name, job_title: s.jobTitle, gender: s.gender || null, phone: nul(s.phone),
      languages: s.languages.split(/[,،]/).map((x) => x.trim()).filter(Boolean),
    }
    let sid = id
    if (id) {
      const { error } = await supabase.from('staff_members').update(row).eq('id', id)
      if (error) return fail('update staff', error)
    } else {
      const { data: created, error } = await supabase.from('staff_members').insert(row).select('id').single()
      if (error) return fail('create staff', error)
      sid = created.id
    }
    const linkErr = await syncLinks('staff_regions', 'staff_id', sid!, 'region_id', s.regionIds)
    if (linkErr) {
      if (!id) await supabase.from('staff_members').delete().eq('id', sid!)
      return fail('staff regions', linkErr)
    }
    // Sign-in account: link / unlink only when the email changed. The staff record is already saved, so a
    // failure here is reported but does not undo it.
    const email = s.email.trim().toLowerCase()
    if (email !== (s.currentEmail ?? '').toLowerCase()) {
      const { error } = email
        ? await supabase.rpc('link_staff_account', { p_staff: sid, p_email: email })
        : await supabase.rpc('unlink_staff_account', { p_staff: sid })
      if (error) {
        console.error('link account failed', error)
        notify(error.message.includes('No user') ? 'המלווה/ת נשמר/ה, אבל לא נמצא משתמש עם האימייל הזה. יוצרים אותו קודם ב-Supabase ← Authentication ← Add user.'
          : error.message.includes('already linked') ? 'המלווה/ת נשמר/ה, אבל החשבון הזה כבר מחובר למלווה אחר.'
          : error.message.includes('admin') ? 'המלווה/ת נשמר/ה, אבל זה חשבון מנהל ואי אפשר לחבר אותו למלווה.'
          : 'המלווה/ת נשמר/ה, אבל חיבור החשבון נכשל. נסי שוב מעריכת המלווה.')
      }
    }
    await refresh()
    return true
  }, [fail, refresh, syncLinks, notify])

  const generateNow = useCallback(async () => {
    const { data: n, error } = await supabase.rpc('generate_tasks_from_slots')
    if (error) { console.error('generate failed', error); notify('לא הצלחנו לעדכן את הלו"ז. נסי שוב.'); return }
    await refresh()
    notify(n > 0 ? `נוצרו ${n} ביקורים חדשים לחודש הקרוב` : 'הלו"ז מעודכן, אין ביקורים חדשים ליצור')
  }, [notify, refresh])

  const saveSlot = useCallback(async (id: string | null, sl: SlotInput) => {
    const row = {
      client_id: sl.clientId, weekday: sl.weekday, start_time: sl.start, end_time: sl.end || null, purpose: sl.purpose.trim(),
      staff_id: sl.staffId || null, valid_from: sl.validFrom, valid_to: sl.validTo || null, is_active: sl.active,
    }
    const { error } = id ? await supabase.from('client_visit_slots').update(row).eq('id', id) : await supabase.from('client_visit_slots').insert(row)
    if (error) return fail('save slot', error)
    const g = await supabase.rpc('generate_tasks_from_slots')
    if (g.error) console.error('generate after slot save failed', g.error)
    await refresh()
    return true
  }, [fail, refresh])

  const saveItem = useCallback(async (id: string | null, i: ItemInput) => {
    const row = {
      client_id: i.clientId, kind: i.kind, title: i.title.trim(), event_date: i.eventDate, due_date: i.dueDate || null,
      assignee_id: i.assigneeId || null, vendor_id: i.vendorId || null, status: i.status, notes: nul(i.notes),
      completed_at: i.status === 'done' ? new Date().toISOString() : null,
    }
    const { error } = id ? await supabase.from('coordination_items').update(row).eq('id', id)
      : await supabase.from('coordination_items').insert({ ...row, created_by: session?.user.id ?? null })
    if (error) return fail('save item', error)
    await refresh()
    return true
  }, [fail, refresh, session])

  const setItemStatus = useCallback(async (id: string, status: string) => {
    const { error } = await supabase.from('coordination_items').update({ status, completed_at: status === 'done' ? new Date().toISOString() : null }).eq('id', id)
    if (error) return fail('item status', error)
    await refresh()
    return true
  }, [fail, refresh])

  const setItemAssignee = useCallback(async (id: string, assigneeId: string | null) => {
    const { error } = await supabase.from('coordination_items').update({ assignee_id: assigneeId }).eq('id', id)
    if (error) return fail('item assignee', error)
    await refresh()
    return true
  }, [fail, refresh])

  const decideOvertime = useCallback(async (taskId: string, bill: boolean) => {
    const { data: charge, error } = await supabase.rpc('decide_visit_overtime', { p_task: taskId, p_bill: bill })
    if (error) {
      console.error('overtime decision failed', error)
      notify(error.message.includes('already paid') ? 'החשבונית של החודש כבר שולמה, אי אפשר להוסיף לה חיוב.'
        : error.message.includes('Already decided') ? 'כבר התקבלה החלטה על הביקור הזה.'
        : 'לא הצלחנו לשמור את ההחלטה. נסי שוב.')
      return null
    }
    await refresh()
    return Number(charge)
  }, [notify, refresh])

  const revertOvertime = useCallback(async (taskId: string) => {
    const { error } = await supabase.rpc('revert_visit_overtime', { p_task: taskId })
    if (error) {
      console.error('overtime revert failed', error)
      notify(error.message.includes('already paid') ? 'החשבונית כבר שולמה, אי אפשר לבטל את החיוב.' : 'לא הצלחנו לבטל. נסי שוב.')
      return false
    }
    await refresh()
    return true
  }, [notify, refresh])

  const assignSlot = useCallback(async (slotId: string, staffId: string | null) => {
    const { error } = await supabase.from('client_visit_slots').update({ staff_id: staffId }).eq('id', slotId)
    if (error) return fail('assign slot', error)
    await refresh()
    return true
  }, [fail, refresh])

  const askDelete = useCallback((kind: FormKind, id: string) => {
    if (kind === 'task') {
      const t = data.tasks.find((x) => x.id === id)
      if (t) setPendingDelete({ kind, id, name: `${t.task} — ${t.client}, ${formatDM(parseISO(t.date))} ${t.time}`, warning: 'המשימה תימחק מהלוח ומלוח השנה.' })
    } else if (kind === 'client') {
      const c = data.clients.find((x) => x.id === id)
      if (c) setPendingDelete({ kind, id, name: c.name, warning: 'יימחקו גם התיק הרפואי, ההעדפות, אנשי הקשר וההערות. אי אפשר לבטל. אם יש ללקוח/ה משימות או חשבוניות, המחיקה תיחסם.' })
    } else if (kind === 'vendor') {
      const v = data.vendors.find((x) => x.id === id)
      if (v) setPendingDelete({ kind, id, name: v.name, warning: 'המשימות שמשויכות לספק יישארו, בלי ספק.' })
    } else if (kind === 'item') {
      const it = data.items.find((x) => x.id === id)
      if (it) setPendingDelete({ kind, id, name: `${it.title} — ${it.client}`, warning: 'הפריט יימחק מלוח הניהול.' })
    } else if (kind === 'slot') {
      const sl = data.slots.find((x) => x.id === id)
      if (sl) setPendingDelete({ kind, id, name: `${sl.client} — ${DAY_NAMES[sl.weekday]} ${sl.start}`, warning: 'הביקורים העתידיים שתוכננו ממנו יימחקו. ביקורים שכבר התקיימו נשארים בהיסטוריה.' })
    } else {
      const s = data.staff.find((x) => x.id === id)
      if (s) setPendingDelete({ kind, id, name: s.name, warning: 'המשימות שלו/ה יהפכו ל"ללא שיבוץ" והוא/היא יוסרו כמלווה קבוע/ה.' })
    }
  }, [data])

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return
    const { kind, id, name } = pendingDelete
    const { error } = await supabase.from(TABLE[kind]).delete().eq('id', id)
    setPendingDelete(null)
    if (error) {
      console.error('delete failed', error)
      notify(error.code === '23503'
        ? 'אי אפשר למחוק: יש פעילות מקושרת (משימות או חשבוניות). אפשר למחוק קודם אותן.'
        : 'לא הצלחנו למחוק. בדקי את החיבור ונסי שוב.')
      return
    }
    await refresh()
    notify(`נמחק: ${name}`)
  }, [pendingDelete, notify, refresh])

  const value = useMemo<Store>(() => ({
    ...data, loading, loadError,
    reload: () => setNonce((n) => n + 1),
    regionFilter, setRegionFilter,
    saveTask, saveClient, saveVendor, saveStaff, saveSlot, assignSlot, generateNow, saveItem, setItemStatus, setItemAssignee, decideOvertime, revertOvertime,
    pendingDelete, askDelete, cancelDelete: () => setPendingDelete(null), confirmDelete,
    form,
    openForm: (kind, preset) => setForm({ kind, preset }),
    closeForm: () => setForm(null),
    toast, notify,
  }), [data, loading, loadError, regionFilter, saveTask, saveClient, saveVendor, saveStaff, saveSlot, assignSlot, generateNow, saveItem, setItemStatus, setItemAssignee, decideOvertime, revertOvertime, pendingDelete, askDelete, confirmDelete, form, toast, notify])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside AppStoreProvider')
  return s
}
