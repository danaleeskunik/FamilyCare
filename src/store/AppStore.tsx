import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Client, InvoiceRow, Plan, Region, Staff, Task, Vendor } from '../data/model'
import { supabase } from '../lib/supabase'
import { loadAll } from '../lib/queries'
import { formatDM, parseISO } from '../lib/dates'
import { useAuth } from './AuthStore'

export type TaskInput = { clientId: string; date: string; time: string; title: string; regionId: number; staffId: string; vendorId: string; status: string }
export type ClientInput = {
  name: string; birthDate: string; regionId: number; planId: string; trialEndsOn: string | null; companionId: string; orderer: string
  phone: string; address: string; buildingCode: string; dependency: string; mobilityNotes: string; cognitiveNotes: string; cap: string; cardLast4: string
}
export type VendorInput = { name: string; trade: string; regionIds: number[]; licenseExpiry: string; insuranceExpiry: string; prices: { id?: string; label: string; amount: number }[] }
export type StaffInput = { name: string; jobTitle: string; gender: string; phone: string; languages: string; regionIds: number[] }

export type FormKind = 'task' | 'client' | 'vendor' | 'staff'
/** preset.id present = edit that record; absent = create. */
export type FormState = { kind: FormKind; preset?: Record<string, string> } | null
export type PendingDelete = { kind: FormKind; id: string; name: string; warning: string } | null

type Store = {
  regions: Region[]; plans: Plan[]
  tasks: Task[]; clients: Client[]; vendors: Vendor[]; staff: Staff[]; invoices: InvoiceRow[]
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
const EMPTY = { regions: [] as Region[], plans: [] as Plan[], tasks: [] as Task[], clients: [] as Client[], vendors: [] as Vendor[], staff: [] as Staff[], invoices: [] as InvoiceRow[] }
const TABLE: Record<FormKind, string> = { task: 'tasks', client: 'clients', vendor: 'vendors', staff: 'staff_members' }
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
    loadAll()
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
      monthly_budget_cap: c.cap.trim() ? Number(c.cap) : null, card_last4: nul(c.cardLast4),
    }
    if (id) {
      const { error } = await supabase.from('clients').update(row).eq('id', id)
      if (error) return fail('update client', error)
      const cur = await supabase.from('family_contacts').select('id').eq('client_id', id).eq('is_orderer', true).maybeSingle()
      const r = cur.data
        ? await supabase.from('family_contacts').update({ full_name: c.orderer }).eq('id', cur.data.id)
        : await supabase.from('family_contacts').insert({ client_id: id, full_name: c.orderer, permission: 'full', is_orderer: true })
      if (r.error) return fail('save orderer', r.error)
    } else {
      const { data: created, error } = await supabase.from('clients').insert({ ...row, member_since: new Date().toISOString().slice(0, 10) }).select('id').single()
      if (error) return fail('create client', error)
      const { error: e2 } = await supabase.from('family_contacts').insert({ client_id: created.id, full_name: c.orderer, permission: 'full', is_orderer: true })
      if (e2) {
        await supabase.from('clients').delete().eq('id', created.id) // no half-created client without an orderer
        return fail('create orderer', e2)
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
    await refresh()
    return true
  }, [fail, refresh, syncLinks])

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
    saveTask, saveClient, saveVendor, saveStaff,
    pendingDelete, askDelete, cancelDelete: () => setPendingDelete(null), confirmDelete,
    form,
    openForm: (kind, preset) => setForm({ kind, preset }),
    closeForm: () => setForm(null),
    toast, notify,
  }), [data, loading, loadError, regionFilter, saveTask, saveClient, saveVendor, saveStaff, pendingDelete, askDelete, confirmDelete, form, toast, notify])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside AppStoreProvider')
  return s
}
