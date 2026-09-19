import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Client, InvoiceRow, Plan, Region, Staff, Task, Vendor } from '../data/model'
import { supabase } from '../lib/supabase'
import { loadAll } from '../lib/queries'
import { useAuth } from './AuthStore'

export type NewTask = { clientId: string; date: string; time: string; title: string; regionId: number; assignee: string }
export type NewClient = { name: string; birthDate: string; regionId: number; planId: string; trial: boolean; companionId: string; orderer: string }
export type NewVendor = { name: string; trade: string; regionIds: number[]; licenseExpiry: string; insuranceExpiry: string; prices: { label: string; amount: number }[] }
export type NewStaff = { name: string; jobTitle: string; gender: string; phone: string; languages: string; regionIds: number[] }

export type FormKind = 'task' | 'client' | 'vendor' | 'staff'
export type FormState = { kind: FormKind; preset?: Record<string, string> } | null

type Store = {
  regions: Region[]; plans: Plan[]
  tasks: Task[]; clients: Client[]; vendors: Vendor[]; staff: Staff[]; invoices: InvoiceRow[]
  loading: boolean
  loadError: boolean
  reload: () => void
  regionFilter: string | null
  setRegionFilter: (r: string | null) => void
  /** Each create* saves to the database, refreshes the lists, and resolves false (with a toast) on failure. */
  createTask: (t: NewTask) => Promise<boolean>
  createClient: (c: NewClient) => Promise<boolean>
  createVendor: (v: NewVendor) => Promise<boolean>
  createStaff: (s: NewStaff) => Promise<boolean>
  form: FormState
  openForm: (kind: FormKind, preset?: Record<string, string>) => void
  closeForm: () => void
  toast: string | null
  notify: (msg: string) => void
}

const Ctx = createContext<Store | null>(null)
const EMPTY = { regions: [] as Region[], plans: [] as Plan[], tasks: [] as Task[], clients: [] as Client[], vendors: [] as Vendor[], staff: [] as Staff[], invoices: [] as InvoiceRow[] }

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const { role, session } = useAuth()
  const enabled = role === 'admin'

  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [nonce, setNonce] = useState(0)

  const [regionFilter, setRegionFilter] = useState<string | null>('רמת השרון')
  const [form, setForm] = useState<FormState>(null)
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

  const fail = useCallback((what: string, error: { message?: string }) => {
    console.error(what, error)
    notify(error.message?.includes('frozen') ? 'הספק מוקפא (רישיון או ביטוח שפג) ולא ניתן לשבץ אותו.' : 'לא הצלחנו לשמור. בדקי את החיבור ונסי שוב.')
    return false
  }, [notify])

  const createTask = useCallback(async (t: NewTask) => {
    const [kind, id] = t.assignee.split(':')
    const { error } = await supabase.from('tasks').insert({
      client_id: t.clientId, scheduled_date: t.date, start_time: t.time, title: t.title, region_id: t.regionId,
      staff_id: kind === 'staff' ? id : null, vendor_id: kind === 'vendor' ? id : null,
      status: 'planned', created_by: session?.user.id ?? null,
    })
    if (error) return fail('create task', error)
    await refresh()
    return true
  }, [fail, refresh, session])

  const createClient = useCallback(async (c: NewClient) => {
    const trialEnd = new Date(); trialEnd.setMonth(trialEnd.getMonth() + 1)
    const { data: row, error } = await supabase.from('clients').insert({
      full_name: c.name, birth_date: c.birthDate, region_id: c.regionId, plan_id: c.planId,
      trial_ends_on: c.trial ? trialEnd.toISOString().slice(0, 10) : null,
      regular_companion_id: c.companionId || null, member_since: new Date().toISOString().slice(0, 10),
    }).select('id').single()
    if (error) return fail('create client', error)
    const { error: e2 } = await supabase.from('family_contacts').insert({
      client_id: row.id, full_name: c.orderer, permission: 'full', is_orderer: true,
    })
    if (e2) {
      await supabase.from('clients').delete().eq('id', row.id) // no half-created client without an orderer
      return fail('create orderer', e2)
    }
    await refresh()
    return true
  }, [fail, refresh])

  const createVendor = useCallback(async (v: NewVendor) => {
    const { data: row, error } = await supabase.from('vendors').insert({
      name: v.name, trade: v.trade, license_expires_on: v.licenseExpiry, insurance_expires_on: v.insuranceExpiry,
    }).select('id').single()
    if (error) return fail('create vendor', error)
    const results = await Promise.all([
      supabase.from('vendor_regions').insert(v.regionIds.map((r) => ({ vendor_id: row.id, region_id: r }))),
      supabase.from('vendor_price_items').insert(v.prices.map((p, i) => ({ vendor_id: row.id, label: p.label, amount: p.amount, sort_order: i }))),
    ])
    const err = results.find((r) => r.error)?.error
    if (err) {
      await supabase.from('vendors').delete().eq('id', row.id)
      return fail('create vendor details', err)
    }
    await refresh()
    return true
  }, [fail, refresh])

  const createStaff = useCallback(async (s: NewStaff) => {
    const { data: row, error } = await supabase.from('staff_members').insert({
      full_name: s.name, job_title: s.jobTitle, gender: s.gender || null, phone: s.phone || null,
      languages: s.languages.split(/[,،]/).map((x) => x.trim()).filter(Boolean),
    }).select('id').single()
    if (error) return fail('create staff', error)
    const { error: e2 } = await supabase.from('staff_regions').insert(s.regionIds.map((r) => ({ staff_id: row.id, region_id: r })))
    if (e2) {
      await supabase.from('staff_members').delete().eq('id', row.id)
      return fail('create staff regions', e2)
    }
    await refresh()
    return true
  }, [fail, refresh])

  const value = useMemo<Store>(() => ({
    ...data, loading, loadError,
    reload: () => setNonce((n) => n + 1),
    regionFilter, setRegionFilter,
    createTask, createClient, createVendor, createStaff,
    form,
    openForm: (kind, preset) => setForm({ kind, preset }),
    closeForm: () => setForm(null),
    toast, notify,
  }), [data, loading, loadError, regionFilter, createTask, createClient, createVendor, createStaff, form, toast, notify])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside AppStoreProvider')
  return s
}
