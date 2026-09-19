export type Tone = 'neutral' | 'green' | 'blue' | 'orange' | 'red'

/** The design is set on Tuesday 15.9.2026; the prototype treats that as "today". */
export const TODAY = '2026-09-15'

export type Region = { id: number; name: string }
export type Plan = { id: string; name: string; price: number; sessions: number }

// View models used by the screens. They are built from database rows in lib/queries.ts.
export type Task = {
  id: string
  date: string // ISO yyyy-mm-dd
  time: string // HH:MM
  client: string
  clientId: string
  task: string
  who: string | null // display label; null = unassigned
  staffId: string | null
  vendorId: string | null
  status: [Tone, string] | null
  region: string
  regionId: number | null
}

export type Vendor = {
  id: string; name: string; field: string; area: string; price: string
  lic: string; licBad: boolean; rating: string; status: [Tone, string]
}

export type Client = {
  id: string; name: string; age: number; area: string; plan: [Tone, string]
  used: string; companion: string | null; orderer: string; next: string
}

export type Staff = {
  id: string; name: string; role: string; areas: string; langs: string
  regulars: string; hours: string; avail: [Tone, string]
}

export type InvoiceRow = {
  id: string; orderer: string; fee: number; hours: number; vendors: number; total: number; status: [Tone, string]
}

export const PLAN_TONE: Record<string, Tone> = { basic: 'neutral', platinum: 'green', top_platinum: 'blue' }
export const JOB_TITLES = [
  { value: 'personal_companion', label: 'מלווה אישית' },
  { value: 'social_worker', label: 'עובדת סוציאלית' },
  { value: 'student', label: 'סטודנט/ית' },
]
