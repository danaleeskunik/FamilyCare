import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { seedClients, seedStaff, seedTasks, seedVendors, type Client, type Staff, type Task, type Vendor } from '../data/mock'

type Data = { tasks: Task[]; clients: Client[]; vendors: Vendor[]; staff: Staff[] }
type Action =
  | { type: 'addTask'; task: Task }
  | { type: 'addClient'; client: Client }
  | { type: 'addVendor'; vendor: Vendor }
  | { type: 'addStaff'; staff: Staff }

export type FormKind = 'task' | 'client' | 'vendor' | 'staff'
export type FormState = { kind: FormKind; preset?: Record<string, string> } | null

const KEY = 'family-care-demo-v1'
const seed: Data = { tasks: seedTasks, clients: seedClients, vendors: seedVendors, staff: seedStaff }

function load(): Data {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const d = JSON.parse(raw) as Data
      if (d && Array.isArray(d.tasks) && Array.isArray(d.clients) && Array.isArray(d.vendors) && Array.isArray(d.staff)) return d
    }
  } catch {
    // storage unavailable or corrupt: fall back to seed data
  }
  return seed
}

function reducer(state: Data, a: Action): Data {
  switch (a.type) {
    case 'addTask': return { ...state, tasks: [...state.tasks, a.task] }
    case 'addClient': return { ...state, clients: [...state.clients, a.client] }
    case 'addVendor': return { ...state, vendors: [...state.vendors, a.vendor] }
    case 'addStaff': return { ...state, staff: [...state.staff, a.staff] }
  }
}

type Store = Data & {
  regionFilter: string | null
  setRegionFilter: (r: string | null) => void
  add: (a: Action) => void
  form: FormState
  openForm: (kind: FormKind, preset?: Record<string, string>) => void
  closeForm: () => void
  toast: string | null
  notify: (msg: string) => void
  resetDemo: () => void
}

const Ctx = createContext<Store | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, load)
  const [regionFilter, setRegionFilter] = useState<string | null>('רמת השרון')
  const [form, setForm] = useState<FormState>(null)
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(data)) } catch { /* ignore */ }
  }, [data])

  const notify = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 5000)
  }, [])

  const value = useMemo<Store>(() => ({
    ...data,
    regionFilter, setRegionFilter,
    add: dispatch,
    form,
    openForm: (kind, preset) => setForm({ kind, preset }),
    closeForm: () => setForm(null),
    toast, notify,
    resetDemo: () => { try { localStorage.removeItem(KEY) } catch { /* ignore */ } window.location.reload() },
  }), [data, regionFilter, form, toast, notify])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside AppStoreProvider')
  return s
}
