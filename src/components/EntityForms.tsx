import { useState, type FormEvent } from 'react'
import Modal from './Modal'
import { Button } from './ui'
import { CheckGroup, SelectField, TextField } from './Fields'
import { useStore } from '../store/AppStore'
import { JOB_TITLES, TODAY } from '../data/model'
import { formatDM, parseISO } from '../lib/dates'
import { shortName } from '../lib/queries'

type Errors = Record<string, string>
const REQUIRED = 'שדה חובה'

function FormShell({ title, onSubmit, submitLabel, children }: { title: string; onSubmit: () => void | Promise<void>; submitLabel: string; children: React.ReactNode }) {
  const { closeForm } = useStore()
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    try { await onSubmit() } finally { setBusy(false) }
  }
  return (
    <Modal
      title={title}
      onClose={closeForm}
      footer={
        <>
          <Button type="submit" form="entity-form" disabled={busy}>{busy ? 'שומרת…' : submitLabel}</Button>
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
  const { clients, staff, vendors, regions, createTask, closeForm, setRegionFilter, notify } = useStore()
  const [v, setV] = useState({
    date: preset.date ?? TODAY, time: preset.time ?? '', clientId: preset.clientId ?? '', task: '', assignee: '', regionId: '',
  })
  const [err, setErr] = useState<Errors>({})
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }))

  // Frozen vendors (expired licence or insurance) cannot be assigned; the database enforces this too.
  const assignees = [
    ...staff.map((s) => ({ value: `staff:${s.id}`, label: `${s.name} (מלווה/ת)` })),
    ...vendors.filter((x) => !x.licBad).map((x) => ({ value: `vendor:${x.id}`, label: `${x.name} (ספק)` })),
  ]

  const pickClient = (id: string) => {
    const c = clients.find((x) => x.id === id)
    const r = c ? regions.find((x) => x.name === c.area) : undefined
    setV((s) => ({ ...s, clientId: id, regionId: s.regionId || (r ? String(r.id) : '') }))
  }

  const submit = async () => {
    const e: Errors = {}
    if (!v.date) e.date = REQUIRED
    if (!v.time) e.time = REQUIRED
    if (!v.clientId) e.clientId = 'בחרי לקוח/ה'
    if (!v.task.trim()) e.task = REQUIRED
    if (!v.regionId) e.regionId = 'בחרי אזור'
    setErr(e)
    if (Object.keys(e).length) return
    const ok = await createTask({ clientId: v.clientId, date: v.date, time: v.time, title: v.task.trim(), regionId: Number(v.regionId), assignee: v.assignee })
    if (!ok) return
    const region = regions.find((r) => r.id === Number(v.regionId))
    if (v.date === TODAY && region) setRegionFilter(region.name)
    notify(v.date === TODAY ? 'המשימה נוספה ללוח היום' : `המשימה נוספה ליום ${formatDM(parseISO(v.date))} — אפשר לראות אותה בלוח השנה`)
    closeForm()
  }

  return (
    <FormShell title="משימה חדשה" onSubmit={submit} submitLabel="הוספת משימה">
      <TextField label="תאריך" type="date" value={v.date} onChange={(e) => set('date')(e.target.value)} error={err.date} />
      <TextField label="שעה" type="time" value={v.time} onChange={(e) => set('time')(e.target.value)} error={err.time} />
      <div className="full"><SelectField label="לקוח/ה" value={v.clientId} onChange={pickClient} options={clients.map((c) => ({ value: c.id, label: c.name }))} placeholder="בחרי לקוח/ה" error={err.clientId} /></div>
      <div className="full"><TextField label="משימה" value={v.task} onChange={(e) => set('task')(e.target.value)} error={err.task} placeholder="למשל: ליווי לרופא + מרשמים" /></div>
      <SelectField label="מלווה / ספק" value={v.assignee} onChange={set('assignee')} options={assignees} placeholder="ללא שיבוץ" />
      <SelectField label="אזור" value={v.regionId} onChange={set('regionId')} options={regions.map((r) => ({ value: String(r.id), label: r.name }))} placeholder="בחרי אזור" error={err.regionId} />
      {!v.assignee && <div className="full notice">בלי מלווה או ספק המשימה תופיע כ"ללא שיבוץ" ותחכה לשיבוץ.</div>}
    </FormShell>
  )
}

function ClientForm() {
  const { clients, staff, regions, plans, createClient, closeForm, notify } = useStore()
  const [v, setV] = useState({ name: '', birthDate: '', regionId: '', planId: 'basic', trial: true, companionId: '', orderer: '' })
  const [err, setErr] = useState<Errors>({})
  const set = <K extends keyof typeof v>(k: K) => (val: (typeof v)[K]) => setV((s) => ({ ...s, [k]: val }))

  const submit = async () => {
    const e: Errors = {}
    const name = v.name.trim()
    if (!name) e.name = REQUIRED
    else if (clients.some((c) => c.name === name)) e.name = 'לקוח/ה בשם הזה כבר קיים/ת'
    if (!v.birthDate) e.birthDate = REQUIRED
    else {
      const age = Math.floor((parseISO(TODAY).getTime() - parseISO(v.birthDate).getTime()) / (365.25 * 86400000))
      if (age < 50 || age > 110) e.birthDate = 'הזיני תאריך לידה שמתאים לגיל 50–110'
    }
    if (!v.regionId) e.regionId = 'בחרי אזור'
    if (!v.orderer.trim()) e.orderer = REQUIRED
    setErr(e)
    if (Object.keys(e).length) return
    const ok = await createClient({ name, birthDate: v.birthDate, regionId: Number(v.regionId), planId: v.planId, trial: v.trial, companionId: v.companionId, orderer: v.orderer.trim() })
    if (!ok) return
    notify(`נוסף/ה לקוח/ה: ${name}`)
    closeForm()
  }

  return (
    <FormShell title="לקוח/ה חדש/ה" onSubmit={submit} submitLabel="הוספת לקוח/ה">
      <div className="full"><TextField label="שם מלא" value={v.name} onChange={(e) => set('name')(e.target.value)} error={err.name} /></div>
      <TextField label="תאריך לידה" type="date" value={v.birthDate} onChange={(e) => set('birthDate')(e.target.value)} error={err.birthDate} />
      <SelectField label="אזור" value={v.regionId} onChange={set('regionId')} options={regions.map((r) => ({ value: String(r.id), label: r.name }))} placeholder="בחרי אזור" error={err.regionId} />
      <SelectField label="מסלול" value={v.planId} onChange={set('planId')} options={plans.map((p) => ({ value: p.id, label: p.name }))} />
      <SelectField label="מלווה קבוע/ה" value={v.companionId} onChange={set('companionId')} options={staff.map((s) => ({ value: s.id, label: s.name }))} placeholder="עדיין ללא" />
      <label className="full row" style={{ gap: 10, font: '600 14px var(--font-ui)', minHeight: 44 }}>
        <input type="checkbox" checked={v.trial} onChange={(e) => set('trial')(e.target.checked)} style={{ width: 20, height: 20 }} />
        בתקופת היכרות (חודש ראשון ללא התחייבות)
      </label>
      <div className="full"><TextField label="מזמין/ת השירות" value={v.orderer} onChange={(e) => set('orderer')(e.target.value)} error={err.orderer} hint="בן או בת משפחה שמזמינים ומקבלים את החשבוניות" /></div>
    </FormShell>
  )
}

function VendorForm() {
  const { vendors, regions, createVendor, closeForm, notify } = useStore()
  const [v, setV] = useState({ name: '', trade: '', regionIds: [] as number[], license: '', insurance: '' })
  const [prices, setPrices] = useState([{ label: 'ביקור', amount: '' }])
  const [err, setErr] = useState<Errors>({})
  const set = <K extends keyof typeof v>(k: K) => (val: (typeof v)[K]) => setV((s) => ({ ...s, [k]: val }))
  const cutoff = TODAY.slice(0, 7)
  const expired = (!!v.license && v.license < cutoff) || (!!v.insurance && v.insurance < cutoff)
  // month input gives YYYY-MM; the licence/insurance is valid through the last day of that month
  const endOfMonth = (ym: string) => { const [y, m] = ym.split('-').map(Number); return `${ym}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}` }

  const submit = async () => {
    const e: Errors = {}
    const name = v.name.trim()
    if (!name) e.name = REQUIRED
    else if (vendors.some((x) => x.name === name)) e.name = 'ספק בשם הזה כבר קיים'
    if (!v.trade.trim()) e.trade = REQUIRED
    if (!v.regionIds.length) e.regionIds = 'בחרי לפחות אזור אחד'
    if (!v.license) e.license = 'הזיני תוקף רישיון'
    if (!v.insurance) e.insurance = 'הזיני תוקף ביטוח'
    const items = prices.filter((p) => p.label.trim() || p.amount)
    if (!items.length) e.prices = 'הוסיפי לפחות מחיר אחד'
    else if (items.some((p) => !p.label.trim() || !(Number(p.amount) >= 0) || p.amount === '')) e.prices = 'לכל מחיר צריך שם וסכום'
    setErr(e)
    if (Object.keys(e).length) return
    const ok = await createVendor({
      name, trade: v.trade.trim(), regionIds: v.regionIds, licenseExpiry: endOfMonth(v.license), insuranceExpiry: endOfMonth(v.insurance),
      prices: items.map((p) => ({ label: p.label.trim(), amount: Number(p.amount) })),
    })
    if (!ok) return
    notify(expired ? `${name} נוסף ומוקפא עד העלאת מסמך מעודכן` : `נוסף ספק: ${name}`)
    closeForm()
  }

  return (
    <FormShell title="ספק חדש" onSubmit={submit} submitLabel="הוספת ספק">
      <div className="full"><TextField label="שם בעל המקצוע / העסק" value={v.name} onChange={(e) => set('name')(e.target.value)} error={err.name} /></div>
      <div className="full"><TextField label="תחום" value={v.trade} onChange={(e) => set('trade')(e.target.value)} error={err.trade} placeholder="למשל: אינסטלציה" /></div>
      <div className="full"><CheckGroup label="אזורי פעילות" options={regions.map((r) => ({ value: r.id, label: r.name }))} value={v.regionIds} onChange={set('regionIds')} error={err.regionIds} /></div>
      <TextField label="תוקף רישיון" type="month" value={v.license} onChange={(e) => set('license')(e.target.value)} error={err.license} />
      <TextField label="תוקף ביטוח צד ג׳" type="month" value={v.insurance} onChange={(e) => set('insurance')(e.target.value)} error={err.insurance} />
      <div className="full stack" style={{ gap: 8 }}>
        <div style={{ font: '700 13px var(--font-ui)' }}>מחירון מוסכם (₪)</div>
        {prices.map((p, i) => (
          <div key={i} className="row" style={{ gap: 8 }}>
            <input className="input" aria-label={`שם מחיר ${i + 1}`} placeholder="ביקור / שעה / המתנה" value={p.label} onChange={(e) => setPrices((x) => x.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} />
            <input className="input" aria-label={`סכום ${i + 1}`} type="number" inputMode="decimal" min="0" placeholder="סכום" style={{ maxWidth: 120 }} value={p.amount} onChange={(e) => setPrices((x) => x.map((y, j) => (j === i ? { ...y, amount: e.target.value } : y)))} />
            {prices.length > 1 && <button type="button" className="icon-btn" aria-label={`הסרת מחיר ${i + 1}`} onClick={() => setPrices((x) => x.filter((_, j) => j !== i))}>×</button>}
          </div>
        ))}
        {err.prices && <div className="err" role="alert" style={{ color: 'var(--danger)', font: '600 12.5px var(--font-ui)' }}>{err.prices}</div>}
        <div><Button variant="secondary" size="sm" icon="plus" onClick={() => setPrices((x) => [...x, { label: '', amount: '' }])}>הוספת מחיר</Button></div>
      </div>
      {expired && <div className="full notice">התוקף כבר עבר, אז הספק יתווסף כמוקפא ולא ניתן יהיה לשבץ אותו עד העלאת מסמך מעודכן.</div>}
    </FormShell>
  )
}

function StaffForm() {
  const { staff, regions, createStaff, closeForm, notify } = useStore()
  const [v, setV] = useState({ name: '', jobTitle: JOB_TITLES[0].value, gender: 'f', phone: '', languages: '', regionIds: [] as number[] })
  const [err, setErr] = useState<Errors>({})
  const set = <K extends keyof typeof v>(k: K) => (val: (typeof v)[K]) => setV((s) => ({ ...s, [k]: val }))

  const submit = async () => {
    const e: Errors = {}
    const name = v.name.trim()
    if (!name) e.name = REQUIRED
    else if (staff.some((x) => x.name === name)) e.name = 'מלווה בשם הזה כבר קיים/ת'
    if (!v.languages.trim()) e.languages = REQUIRED
    if (!v.regionIds.length) e.regionIds = 'בחרי לפחות אזור אחד'
    setErr(e)
    if (Object.keys(e).length) return
    const ok = await createStaff({ name, jobTitle: v.jobTitle, gender: v.gender, phone: v.phone.trim(), languages: v.languages, regionIds: v.regionIds })
    if (!ok) return
    notify(`נוסף/ה מלווה: ${shortName(name)}`)
    closeForm()
  }

  return (
    <FormShell title="מלווה חדש/ה" onSubmit={submit} submitLabel="הוספת מלווה">
      <div className="full"><TextField label="שם מלא" value={v.name} onChange={(e) => set('name')(e.target.value)} error={err.name} /></div>
      <SelectField label="תפקיד" value={v.jobTitle} onChange={set('jobTitle')} options={JOB_TITLES} />
      <SelectField label="מגדר" value={v.gender} onChange={set('gender')} options={[{ value: 'f', label: 'אישה' }, { value: 'm', label: 'גבר' }]} />
      <TextField label="טלפון" type="tel" dir="ltr" value={v.phone} onChange={(e) => set('phone')(e.target.value)} placeholder="052-000-0000" />
      <TextField label="שפות" value={v.languages} onChange={(e) => set('languages')(e.target.value)} error={err.languages} placeholder="עברית, אנגלית" hint="מופרדות בפסיק" />
      <div className="full"><CheckGroup label="אזורי פעילות" options={regions.map((r) => ({ value: r.id, label: r.name }))} value={v.regionIds} onChange={set('regionIds')} error={err.regionIds} /></div>
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
