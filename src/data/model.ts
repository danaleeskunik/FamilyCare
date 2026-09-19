export type Tone = 'neutral' | 'green' | 'blue' | 'orange' | 'red'

import { toISO } from '../lib/dates'

/** Today's date (local), ISO yyyy-mm-dd. Fixed when the page loads. */
export const TODAY = toISO(new Date())

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
  statusKey: string // raw database status: planned | confirmed | in_progress | completed | cancelled
  end: string // planned end HH:MM or ''
  slotId: string | null // set when generated from a recurring slot
  checkedIn: string // actual start HH:MM (local) or ''
  checkedOut: string // actual end HH:MM (local) or ''
  region: string
  regionId: number | null
}

export type Vendor = {
  id: string; name: string; field: string; area: string; price: string
  lic: string; licBad: boolean; rating: string; status: [Tone, string]
}

export type Client = {
  id: string; name: string; age: number; area: string; plan: [Tone, string]
  used: string; companion: string | null; companionId: string | null; orderer: string; next: string; region: string
}

export type Staff = {
  id: string; name: string; role: string; areas: string; langs: string
  regulars: string; hours: string; avail: [Tone, string]
  regionNames: string[]; email: string | null // email = the login linked to this companion, if any
}

/** A recurring visit a client asked for (e.g. every Tuesday 09:30-11:30, "doctor + errands"). */
export type Slot = {
  id: string; clientId: string; client: string; weekday: number // 0 = Sunday
  start: string; end: string | null; purpose: string
  staffId: string | null; staff: string | null
  validFrom: string; validTo: string | null; active: boolean
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

export const TASK_STATUSES = [
  { value: 'planned', label: 'מתוכנן' },
  { value: 'confirmed', label: 'אושר ללקוח' },
  { value: 'in_progress', label: 'בביצוע' },
  { value: 'completed', label: 'הושלם' },
  { value: 'cancelled', label: 'בוטל' },
]
export const DEPENDENCY_LEVELS = [
  { value: 'independent', label: 'עצמאי/ת' },
  { value: 'light', label: 'תלות קלה' },
  { value: 'moderate', label: 'תלות בינונית' },
  { value: 'high', label: 'תלות גבוהה' },
]

/** An admin's decision on a visit that ran longer than planned. */
export type OvertimeDecision = { decision: 'billed' | 'waived'; minutes: number; charge: number }
export type PricingSettings = {
  wage: number; socialFactor: number; travelPerDay: number
  graceMinutes: number; firstHour: number; additionalHour: number
}

export const ITEM_KINDS = [
  { value: 'transport', label: 'הסעה' },
  { value: 'tickets', label: 'כרטיסים' },
  { value: 'contractor', label: 'בעל מקצוע' },
  { value: 'doctor', label: 'רופא' },
  { value: 'other', label: 'אחר' },
]
export const ITEM_STATUSES: { value: string; label: string; tone: Tone }[] = [
  { value: 'new', label: 'חדש', tone: 'neutral' },
  { value: 'in_progress', label: 'בטיפול', tone: 'orange' },
  { value: 'ordered', label: 'בוצע (הוזמן)', tone: 'blue' },
  { value: 'done', label: 'הסתיים', tone: 'green' },
  { value: 'cancelled', label: 'בוטל', tone: 'red' },
]

/** Something the office must arrange ahead of a visit (transport, tickets, contractor ...). */
export type PlanItem = {
  id: string; clientId: string; client: string; kind: string; title: string
  eventDate: string; dueDate: string | null
  assigneeId: string | null; assignee: string | null
  vendorId: string | null; vendor: string | null
  status: string; notes: string
}
export type AdminUser = { id: string; name: string }
