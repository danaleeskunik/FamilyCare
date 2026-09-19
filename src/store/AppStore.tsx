import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Client, Staff, Task, Vendor } from '../data/mock'
import { supabase } from '../lib/supabase'
import { clientFromRow, clientToRow, staffFromRow, staffToRow, taskFromRow, taskToRow, vendorFromRow, vendorToRow } from '../lib/db'
import { useAuth } from './AuthStore'

export type Action =
  | { type: 'addTask'; task: Task }
  | { type: 'addClient'; client: Client }
  | { type: 'addVendor'; vendor: Vendor }
  | { type: 'addStaff'; staff: Staff }

export type FormKind = 'task' | 'client' | 'vendor' | 'staff'
export type FormState = { kind: FormKind; preset?: Record<string, string> } | null

type Store = {
  tasks: Task[]; clients: Client[]; vendors: Vendor[]; staff: Staff[]
  loading: boolean
  loadError: boolean
  reload: () => void
  regionFilter: string | null
  setRegionFilter: (r: string | null) => void
  /** Saves to the database first; resolves false (and shows a toast) if it failed. */
  add: (a: Action) => Promise<boolean>
  form: FormState
  openForm: (kind: FormKind, preset?: Record<string, string>) => void
  closeForm: () => void
  toast: string | null
  notify: (msg: string) => void
}

const Ctx = createContext<Store | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  const enabled = role === 'admin'

  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [nonce, setNonce] = useState(0)

  const [regionFilter, setRegionFilter] = useState<string | null>('רמת השרון')
  const [form, setForm] = useState<FormState>(null)
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!enabled) {
      setTasks([]); setClients([]); setVendors([]); setStaff([])
      return
    }
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    Promise.all([
      supabase.from('tasks').select('*').order('date').order('time'),
      supabase.from('clients').select('*').order('created_at'),
      supabase.from('vendors').select('*').order('created_at'),
      supabase.from('staff').select('*').order('created_at'),
    ]).then(([t, c, v, s]) => {
      if (cancelled) return
      const failed = [t, c, v, s].find((r) => r.error)
      if (failed) {
        console.error('load failed', failed.error)
        setLoadError(true)
      } else {
        setTasks((t.data ?? []).map(taskFromRow))
        setClients((c.data ?? []).map(clientFromRow))
        setVendors((v.data ?? []).map(vendorFromRow))
        setStaff((s.data ?? []).map(staffFromRow))
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [enabled, nonce])

  const notify = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 5000)
  }, [])

  const add = useCallback(async (a: Action) => {
    const insert = () => {
      switch (a.type) {
        case 'addTask': return supabase.from('tasks').insert(taskToRow(a.task))
        case 'addClient': return supabase.from('clients').insert(clientToRow(a.client))
        case 'addVendor': return supabase.from('vendors').insert(vendorToRow(a.vendor))
        case 'addStaff': return supabase.from('staff').insert(staffToRow(a.staff))
      }
    }
    const { error } = await insert()
    if (error) {
      console.error('save failed', error)
      notify('לא הצלחנו לשמור. בדקי את החיבור ונסי שוב.')
      return false
    }
    switch (a.type) {
      case 'addTask': setTasks((x) => [...x, a.task]); break
      case 'addClient': setClients((x) => [...x, a.client]); break
      case 'addVendor': setVendors((x) => [...x, a.vendor]); break
      case 'addStaff': setStaff((x) => [...x, a.staff]); break
    }
    return true
  }, [notify])

  const value = useMemo<Store>(() => ({
    tasks, clients, vendors, staff, loading, loadError,
    reload: () => setNonce((n) => n + 1),
    regionFilter, setRegionFilter,
    add,
    form,
    openForm: (kind, preset) => setForm({ kind, preset }),
    closeForm: () => setForm(null),
    toast, notify,
  }), [tasks, clients, vendors, staff, loading, loadError, regionFilter, add, form, toast, notify])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside AppStoreProvider')
  return s
}
