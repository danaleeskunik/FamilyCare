import { useState, type FormEvent } from 'react'
import Modal from './Modal'
import { Button } from './ui'
import { SelectField, TextField } from './Fields'
import { useStore } from '../store/AppStore'
import { PLANS, STAFF_ROLES, TODAY, regions } from '../data/mock'
import { formatDM, parseISO } from '../lib/dates'

type Errors = Record<string, string>
const REQUIRED = 'שדה חובה'
const regionOf = (area: string) => (area.includes('תל אביב') ? 'צפון ת"א' : (regions.find((r) => area.includes(r)) ?? ''))

function FormShell({ title, onSubmit, submitLabel, children }: { title: string; onSubmit: () => void; submitLabel: string; children: React.ReactNode }) {
  const { closeForm } = useStore()
  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit() }
  return (
    <Modal
      title={title}
      onClose={closeForm}
      footer={
        <>
          <Button type="submit" form="entity-form">{submitLabel}</Button>
          <Button variant="quiet" onClick={closeForm}>ביטול</Button>
        </>
      }
    >
      <form id="entity-form" onSubmit={submit} noValidate>
        <div className="form-grid">{children}</div>
      </form>
    </Modal>
  )
}

function TaskForm({ preset }: { preset: Record<string, string> }) {
  const { clients, staff, vendors, add, closeForm, setRegionFilter, notify } = useStore()
  const [v, setV] = useState({
    date: preset.date ?? TODAY, time: preset.time ?? '', client: preset.client ?? '', task: '', who: '', region: preset.region ?? '',
  })
  const [err, setErr] = useState<Errors>({})
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }))

  // Frozen vendors (expired licence or insurance) cannot be assigned.
  const assignees = [...staff.map((s) => s.name), ...vendors.filter((x) => !x.licBad).map((x) => x.name)]

  const submit = () => {
    const e: Errors = {}
    if (!v.date) e.date = REQUIRED
    if (!v.time) e.time = REQUIRED
    if (!v.client) e.client = 'בחרי לקוח/ה'
    if (!v.task.trim()) e.task = REQUIRED
    if (!v.region) e.region = 'בחרי אזור'
    setErr(e)
    if (Object.keys(e).length) return
    add({ type: 'addTask', task: {
      id: `t-${Date.now()}`, date: v.date, time: v.time, client: v.client, task: v.task.trim(),
      who: v.who || null, status: v.who ? ['neutral', 'מתוכנן'] : null, region: v.region,
    } })
    if (v.date === TODAY) setRegionFilter(v.region)
    notify(v.date === TODAY ? 'המשימה נוספה ללוח היום' : `המשימה נוספה ליום ${formatDM(parseISO(v.date))} — אפשר לראות אותה בלוח השנה`)
    closeForm()
  }

  return (
    <FormShell title="משימה חדשה" onSubmit={submit} submitLabel="הוספת משימה">
      <TextField label="תאריך" type="date" value={v.date} onChange={(e) => set('date')(e.target.value)} error={err.date} />
      <TextField label="שעה" type="time" value={v.time} onChange={(e) => set('time')(e.target.value)} error={err.time} />
      <div className="full"><SelectField label="לקוח/ה" value={v.client} onChange={(val) => {
        set('client')(val)
        const c = clients.find((x) => x.name === val)
        if (c && !v.region) setV((s) => ({ ...s, client: val, region: regionOf(c.area) }))
      }} options={clients.map((c) => c.name)} placeholder="בחרי לקוח/ה" error={err.client} /></div>
      <div className="full"><TextField label="משימה" value={v.task} onChange={(e) => set('task')(e.target.value)} error={err.task} placeholder="למשל: ליווי לרופא + מרשמים" /></div>
      <SelectField label="מלווה / ספק" value={v.who} onChange={set('who')} options={assignees} placeholder="ללא שיבוץ" />
      <SelectField label="אזור" value={v.region} onChange={set('region')} options={regions} placeholder="בחרי אזור" error={err.region} />
      {!v.who && <div className="full notice">בלי מלווה או ספק המשימה תופיע כ"ללא שיבוץ" ותחכה לשיבוץ.</div>}
    </FormShell>
  )
}

function ClientForm() {
  const { clients, staff, add, closeForm, notify } = useStore()
  const [v, setV] = useState({ name: '', age: '', area: '', plan: 'תקופת היכרות', orderer: '', companion: '' })
  const [err, setErr] = useState<Errors>({})
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }))

  const submit = () => {
    const e: Errors = {}
    const name = v.name.trim()
    const age = Number(v.age)
    if (!name) e.name = REQUIRED
    else if (clients.some((c) => c.name === name)) e.name = 'לקוח/ה בשם הזה כבר קיים/ת'
    if (!v.age) e.age = REQUIRED
    else if (!Number.isInteger(age) || age < 50 || age > 110) e.age = 'הזיני גיל בין 50 ל-110'
    if (!v.area.trim()) e.area = REQUIRED
    if (!v.orderer.trim()) e.orderer = REQUIRED
    setErr(e)
    if (Object.keys(e).length) return
    const plan = PLANS.find((p) => p.name === v.plan)!
    add({ type: 'addClient', client: {
      id: `c-${Date.now()}`, name, age, area: v.area.trim(), plan: [plan.tone, plan.name], used: `0 / ${plan.sessions}`,
      companion: v.companion || null, orderer: v.orderer.trim(), next: '—',
    } })
    notify(`נוסף/ה לקוח/ה: ${name}`)
    closeForm()
  }

  return (
    <FormShell title="לקוח/ה חדש/ה" onSubmit={submit} submitLabel="הוספת לקוח/ה">
      <div className="full"><TextField label="שם מלא" value={v.name} onChange={(e) => set('name')(e.target.value)} error={err.name} /></div>
      <TextField label="גיל" type="number" inputMode="numeric" value={v.age} onChange={(e) => set('age')(e.target.value)} error={err.age} />
      <TextField label="אזור" value={v.area} onChange={(e) => set('area')(e.target.value)} error={err.area} placeholder="למשל: רמת השרון" />
      <SelectField label="מסלול" value={v.plan} onChange={set('plan')} options={PLANS.map((p) => p.name)} />
      <SelectField label="מלווה קבוע/ה" value={v.companion} onChange={set('companion')} options={staff.map((s) => s.name)} placeholder="עדיין ללא" />
      <div className="full"><TextField label="מזמין/ת השירות" value={v.orderer} onChange={(e) => set('orderer')(e.target.value)} error={err.orderer} hint="בן או בת משפחה שמזמינים ומקבלים את החשבוניות" /></div>
    </FormShell>
  )
}

function VendorForm() {
  const { vendors, add, closeForm, notify } = useStore()
  const [v, setV] = useState({ name: '', field: '', area: '', price: '', expiry: '' })
  const [err, setErr] = useState<Errors>({})
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }))
  const expired = !!v.expiry && v.expiry < TODAY.slice(0, 7)

  const submit = () => {
    const e: Errors = {}
    const name = v.name.trim()
    if (!name) e.name = REQUIRED
    else if (vendors.some((x) => x.name === name)) e.name = 'ספק בשם הזה כבר קיים'
    if (!v.field.trim()) e.field = REQUIRED
    if (!v.area.trim()) e.area = REQUIRED
    if (!v.price.trim()) e.price = REQUIRED
    if (!v.expiry) e.expiry = 'הזיני תוקף רישיון או ביטוח'
    setErr(e)
    if (Object.keys(e).length) return
    const [y, m] = v.expiry.split('-')
    const lic = expired ? `פג ${m}.${y.slice(2)}` : `בתוקף עד ${m}.${y.slice(2)}`
    add({ type: 'addVendor', vendor: {
      id: `v-${Date.now()}`, name, field: v.field.trim(), area: v.area.trim(), price: v.price.trim(), lic, licBad: expired,
      rating: '—', status: expired ? ['red', 'מוקפא'] : ['green', 'פעיל'],
    } })
    notify(expired ? `${name} נוסף ומוקפא עד העלאת מסמך מעודכן` : `נוסף ספק: ${name}`)
    closeForm()
  }

  return (
    <FormShell title="ספק חדש" onSubmit={submit} submitLabel="הוספת ספק">
      <div className="full"><TextField label="שם בעל המקצוע / העסק" value={v.name} onChange={(e) => set('name')(e.target.value)} error={err.name} /></div>
      <TextField label="תחום" value={v.field} onChange={(e) => set('field')(e.target.value)} error={err.field} placeholder="למשל: אינסטלציה" />
      <TextField label="אזור" value={v.area} onChange={(e) => set('area')(e.target.value)} error={err.area} placeholder="למשל: גוש דן" />
      <div className="full"><TextField label="מחירון מוסכם" value={v.price} onChange={(e) => set('price')(e.target.value)} error={err.price} placeholder="למשל: ביקור 350 ₪ · שעה 280 ₪" /></div>
      <div className="full"><TextField label="תוקף רישיון / ביטוח" type="month" value={v.expiry} onChange={(e) => set('expiry')(e.target.value)} error={err.expiry} /></div>
      {expired && <div className="full notice">התוקף כבר עבר, אז הספק יתווסף כמוקפא ולא ניתן יהיה לשבץ אותו עד העלאת מסמך מעודכן.</div>}
    </FormShell>
  )
}

function StaffForm() {
  const { staff, add, closeForm, notify } = useStore()
  const [v, setV] = useState({ name: '', role: STAFF_ROLES[0], areas: '', langs: '' })
  const [err, setErr] = useState<Errors>({})
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }))

  const submit = () => {
    const e: Errors = {}
    const name = v.name.trim()
    if (!name) e.name = REQUIRED
    else if (staff.some((x) => x.name === name)) e.name = 'מלווה בשם הזה כבר קיים/ת'
    if (!v.areas.trim()) e.areas = REQUIRED
    if (!v.langs.trim()) e.langs = REQUIRED
    setErr(e)
    if (Object.keys(e).length) return
    add({ type: 'addStaff', staff: {
      id: `s-${Date.now()}`, name, role: v.role, areas: v.areas.trim(), langs: v.langs.trim(), regulars: '—', hours: '0:00', avail: ['green', 'זמין/ה'],
    } })
    notify(`נוסף/ה מלווה: ${name}`)
    closeForm()
  }

  return (
    <FormShell title="מלווה חדש/ה" onSubmit={submit} submitLabel="הוספת מלווה">
      <div className="full"><TextField label="שם מלא" value={v.name} onChange={(e) => set('name')(e.target.value)} error={err.name} /></div>
      <div className="full"><SelectField label="תפקיד" value={v.role} onChange={set('role')} options={STAFF_ROLES} /></div>
      <TextField label="אזורים" value={v.areas} onChange={(e) => set('areas')(e.target.value)} error={err.areas} placeholder="למשל: הרצליה · רעננה" />
      <TextField label="שפות" value={v.langs} onChange={(e) => set('langs')(e.target.value)} error={err.langs} placeholder="למשל: עברית, אנגלית" />
    </FormShell>
  )
}

export default function FormHost() {
  const { form } = useStore()
  if (!form) return null
  // key resets local state each time a form is opened
  switch (form.kind) {
    case 'task': return <TaskForm key="task" preset={form.preset ?? {}} />
    case 'client': return <ClientForm key="client" />
    case 'vendor': return <VendorForm key="vendor" />
    case 'staff': return <StaffForm key="staff" />
  }
}

export function Toast() {
  const { toast } = useStore()
  return toast ? <div className="toast" role="status">{toast}</div> : null
}
