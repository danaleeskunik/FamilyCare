import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import Modal from './Modal'
import { Button } from './ui'
import { CheckGroup, SelectField, TextAreaField, TextField } from './Fields'
import { useStore } from '../store/AppStore'
import { DEPENDENCY_LEVELS, ITEM_KINDS, ITEM_STATUSES, JOB_TITLES, TASK_STATUSES, TODAY } from '../data/model'
import { DAY_NAMES, addDays, formatDM, parseISO, toISO } from '../lib/dates'
import { fetchClientForEdit, fetchStaffForEdit, fetchVendorForEdit, shortName } from '../lib/queries'

type Errors = Record<string, string>
const REQUIRED = 'שדה חובה'
const ymOf = (iso: string | null) => (iso ? iso.slice(0, 7) : '')
const endOfMonth = (ym: string) => { const [y, m] = ym.split('-').map(Number); return `${ym}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}` }

function FormShell({ title, onSubmit, submitLabel, children }: { title: string; onSubmit: () => void | Promise<void>; submitLabel: string; children: ReactNode }) {
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

/** Loads the record being edited, then renders the form with it. */
function EditLoader<T>({ title, load, children }: { title: string; load: () => Promise<T | null>; children: (d: T) => ReactNode }) {
  const { closeForm } = useStore()
  const [state, setState] = useState<{ d: T | null } | 'loading' | 'error'>('loading')
  useEffect(() => {
    let cancelled = false
    load().then((d) => { if (!cancelled) setState({ d }) }).catch((e) => { console.error('edit load failed', e); if (!cancelled) setState('error') })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (state === 'loading' || state === 'error' || state.d === null) {
    return (
      <Modal title={title} onClose={closeForm}>
        <p className={state === 'loading' ? 'muted' : ''} role="status">
          {state === 'loading' ? 'טוענת…' : state === 'error' ? 'לא הצלחנו לטעון את הפרטים. סגרי ונסי שוב.' : 'הרשומה לא נמצאה. ייתכן שנמחקה.'}
        </p>
      </Modal>
    )
  }
  return <>{children(state.d)}</>
}

// ---------------------------------------------------------------- Task
function TaskForm({ editId, preset }: { editId: string | null; preset: Record<string, string> }) {
  const { tasks, clients, staff, vendors, regions, saveTask, closeForm, setRegionFilter, notify } = useStore()
  const existing = editId ? tasks.find((t) => t.id === editId) : undefined
  const [v, setV] = useState({
    date: existing?.date ?? preset.date ?? TODAY, time: existing?.time ?? '', clientId: existing?.clientId ?? preset.clientId ?? '',
    task: existing?.task ?? '', staffId: existing?.staffId ?? '', vendorId: existing?.vendorId ?? '',
    regionId: existing?.regionId ? String(existing.regionId) : '', status: existing?.statusKey ?? 'planned',
    checkedIn: existing?.checkedIn ?? '', checkedOut: existing?.checkedOut ?? '',
  })
  const [err, setErr] = useState<Errors>({})
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }))

  // Frozen vendors (expired licence or insurance) cannot be newly assigned; the database enforces this too.
  const vendorOptions = vendors.filter((x) => !x.licBad || x.id === existing?.vendorId).map((x) => ({ value: x.id, label: x.licBad ? `${x.name} (מוקפא)` : x.name }))

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
    if (v.checkedOut && !v.checkedIn) e.checkedIn = 'הזיני גם שעת כניסה'
    if (v.checkedIn && v.checkedOut && v.checkedOut <= v.checkedIn) e.checkedOut = 'שעת היציאה חייבת להיות אחרי הכניסה'
    setErr(e)
    if (Object.keys(e).length) return
    const ok = await saveTask(editId, { clientId: v.clientId, date: v.date, time: v.time, title: v.task.trim(), regionId: Number(v.regionId), staffId: v.staffId, vendorId: v.vendorId, status: v.status, checkedIn: v.checkedIn, checkedOut: v.checkedOut })
    if (!ok) return
    const region = regions.find((r) => r.id === Number(v.regionId))
    if (v.date === TODAY && region) setRegionFilter(region.name)
    notify(editId ? 'המשימה עודכנה' : v.date === TODAY ? 'המשימה נוספה ללוח היום' : `המשימה נוספה ליום ${formatDM(parseISO(v.date))} — אפשר לראות אותה בלוח השנה`)
    closeForm()
  }

  return (
    <FormShell title={editId ? 'עריכת משימה' : 'משימה חדשה'} onSubmit={submit} submitLabel={editId ? 'שמירה' : 'הוספת משימה'}>
      <TextField label="תאריך" type="date" value={v.date} onChange={(e) => set('date')(e.target.value)} error={err.date} />
      <TextField label="שעה" type="time" value={v.time} onChange={(e) => set('time')(e.target.value)} error={err.time} />
      <div className="full"><SelectField label="לקוח/ה" value={v.clientId} onChange={pickClient} options={clients.map((c) => ({ value: c.id, label: c.name }))} placeholder="בחרי לקוח/ה" error={err.clientId} /></div>
      <div className="full"><TextField label="משימה" value={v.task} onChange={(e) => set('task')(e.target.value)} error={err.task} placeholder="למשל: ליווי לרופא + מרשמים" /></div>
      <SelectField label="מלווה/ת" value={v.staffId} onChange={set('staffId')} options={staff.map((s) => ({ value: s.id, label: s.name }))} placeholder="ללא מלווה/ת" />
      <SelectField label="ספק" value={v.vendorId} onChange={set('vendorId')} options={vendorOptions} placeholder="ללא ספק" />
      <SelectField label="אזור" value={v.regionId} onChange={set('regionId')} options={regions.map((r) => ({ value: String(r.id), label: r.name }))} placeholder="בחרי אזור" error={err.regionId} />
      {editId && <SelectField label="סטטוס" value={v.status} onChange={set('status')} options={TASK_STATUSES} />}
      {editId && <TextField label="שעת כניסה בפועל" type="time" value={v.checkedIn} onChange={(e) => set('checkedIn')(e.target.value)} error={err.checkedIn} hint="לתיקון ידני אם המלווה/ת לא דיווח/ה" />}
      {editId && <TextField label="שעת יציאה בפועל" type="time" value={v.checkedOut} onChange={(e) => set('checkedOut')(e.target.value)} error={err.checkedOut} />}
      {!v.staffId && !v.vendorId && <div className="full notice">בלי מלווה/ת או ספק המשימה תופיע כ"ללא שיבוץ" ותחכה לשיבוץ.</div>}
    </FormShell>
  )
}

// ---------------------------------------------------------------- Client
type ClientRow = Record<string, string | number | null>
function ClientForm({ editId, initial, ordererName }: { editId: string | null; initial?: ClientRow; ordererName?: string }) {
  const { clients, staff, regions, plans, saveClient, closeForm, notify } = useStore()
  const i = initial ?? {}
  const str = (k: string) => (i[k] == null ? '' : String(i[k]))
  const existingTrial = str('trial_ends_on')
  const [v, setV] = useState({
    name: str('full_name'), birthDate: str('birth_date'), regionId: str('region_id'), planId: str('plan_id') || 'basic',
    trial: editId ? !!existingTrial && existingTrial >= TODAY : true, companionId: str('regular_companion_id'), orderer: ordererName ?? '',
    phone: str('phone'), address: str('address'), buildingCode: str('building_code'), dependency: str('dependency_level'),
    mobilityNotes: str('mobility_notes'), cognitiveNotes: str('cognitive_notes'), cap: str('monthly_budget_cap'), cardLast4: str('card_last4'),
  })
  const [err, setErr] = useState<Errors>({})
  const set = <K extends keyof typeof v>(k: K) => (val: (typeof v)[K]) => setV((s) => ({ ...s, [k]: val }))

  const submit = async () => {
    const e: Errors = {}
    const name = v.name.trim()
    if (!name) e.name = REQUIRED
    else if (clients.some((c) => c.name === name && c.id !== editId)) e.name = 'לקוח/ה בשם הזה כבר קיים/ת'
    if (!v.birthDate) e.birthDate = REQUIRED
    else {
      const age = Math.floor((parseISO(TODAY).getTime() - parseISO(v.birthDate).getTime()) / (365.25 * 86400000))
      if (age < 50 || age > 110) e.birthDate = 'הזיני תאריך לידה שמתאים לגיל 50–110'
    }
    if (!v.regionId) e.regionId = 'בחרי אזור'
    if (!v.orderer.trim()) e.orderer = REQUIRED
    if (v.cardLast4 && !/^\d{4}$/.test(v.cardLast4)) e.cardLast4 = 'ארבע ספרות אחרונות בלבד'
    if (v.cap && !(Number(v.cap) >= 0)) e.cap = 'הזיני סכום תקין'
    setErr(e)
    if (Object.keys(e).length) return
    const monthAhead = new Date(); monthAhead.setMonth(monthAhead.getMonth() + 1)
    const trialEndsOn = !v.trial ? null : existingTrial && existingTrial >= TODAY ? existingTrial : monthAhead.toISOString().slice(0, 10)
    const ok = await saveClient(editId, {
      name, birthDate: v.birthDate, regionId: Number(v.regionId), planId: v.planId, trialEndsOn, companionId: v.companionId, orderer: v.orderer.trim(),
      phone: v.phone, address: v.address, buildingCode: v.buildingCode, dependency: v.dependency, mobilityNotes: v.mobilityNotes, cognitiveNotes: v.cognitiveNotes, cap: v.cap, cardLast4: v.cardLast4,
    })
    if (!ok) return
    notify(editId ? 'פרטי הלקוח/ה עודכנו' : `נוסף/ה לקוח/ה: ${name}`)
    closeForm()
  }

  return (
    <FormShell title={editId ? 'עריכת פרטי לקוח/ה' : 'לקוח/ה חדש/ה'} onSubmit={submit} submitLabel={editId ? 'שמירה' : 'הוספת לקוח/ה'}>
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
      <TextField label="טלפון" type="tel" dir="ltr" value={v.phone} onChange={(e) => set('phone')(e.target.value)} placeholder="052-000-0000" />
      <TextField label="קוד לבניין" dir="ltr" value={v.buildingCode} onChange={(e) => set('buildingCode')(e.target.value)} />
      <div className="full"><TextField label="כתובת" value={v.address} onChange={(e) => set('address')(e.target.value)} /></div>
      <div className="full"><SelectField label="רמת תלות" value={v.dependency} onChange={set('dependency')} options={DEPENDENCY_LEVELS} placeholder="לא הוגדר" /></div>
      <div className="full"><TextAreaField label="ניידות" value={v.mobilityNotes} onChange={set('mobilityNotes')} placeholder="למשל: הליכון · מדרגות בקושי · מעלית בבניין" /></div>
      <div className="full"><TextAreaField label="מצב קוגניטיבי" value={v.cognitiveNotes} onChange={set('cognitiveNotes')} /></div>
      <TextField label="תקרה חודשית לחיובים נוספים (₪)" type="number" inputMode="decimal" min="0" value={v.cap} onChange={(e) => set('cap')(e.target.value)} error={err.cap} />
      <TextField label="ארבע ספרות אחרונות של הכרטיס" dir="ltr" maxLength={4} value={v.cardLast4} onChange={(e) => set('cardLast4')(e.target.value)} error={err.cardLast4} />
    </FormShell>
  )
}

// ---------------------------------------------------------------- Vendor
function VendorForm({ editId, initial }: { editId: string | null; initial?: { vendor: Record<string, string>; regionIds: number[]; prices: Record<string, string | number>[] } }) {
  const { vendors, regions, saveVendor, closeForm, notify } = useStore()
  const [v, setV] = useState({
    name: initial?.vendor.name ?? '', trade: initial?.vendor.trade ?? '', regionIds: initial?.regionIds ?? ([] as number[]),
    license: ymOf(initial?.vendor.license_expires_on ?? null), insurance: ymOf(initial?.vendor.insurance_expires_on ?? null),
  })
  const [prices, setPrices] = useState<{ id?: string; label: string; amount: string }[]>(
    initial?.prices.length ? initial.prices.map((p) => ({ id: String(p.id), label: String(p.label), amount: String(p.amount) })) : [{ label: 'ביקור', amount: '' }],
  )
  const [err, setErr] = useState<Errors>({})
  const set = <K extends keyof typeof v>(k: K) => (val: (typeof v)[K]) => setV((s) => ({ ...s, [k]: val }))
  const cutoff = TODAY.slice(0, 7)
  const expired = (!!v.license && v.license < cutoff) || (!!v.insurance && v.insurance < cutoff)

  const submit = async () => {
    const e: Errors = {}
    const name = v.name.trim()
    if (!name) e.name = REQUIRED
    else if (vendors.some((x) => x.name === name && x.id !== editId)) e.name = 'ספק בשם הזה כבר קיים'
    if (!v.trade.trim()) e.trade = REQUIRED
    if (!v.regionIds.length) e.regionIds = 'בחרי לפחות אזור אחד'
    if (!v.license) e.license = 'הזיני תוקף רישיון'
    if (!v.insurance) e.insurance = 'הזיני תוקף ביטוח'
    const items = prices.filter((p) => p.label.trim() || p.amount)
    if (!items.length) e.prices = 'הוסיפי לפחות מחיר אחד'
    else if (items.some((p) => !p.label.trim() || p.amount === '' || !(Number(p.amount) >= 0))) e.prices = 'לכל מחיר צריך שם וסכום'
    setErr(e)
    if (Object.keys(e).length) return
    const ok = await saveVendor(editId, {
      name, trade: v.trade.trim(), regionIds: v.regionIds, licenseExpiry: endOfMonth(v.license), insuranceExpiry: endOfMonth(v.insurance),
      prices: items.map((p) => ({ id: p.id, label: p.label.trim(), amount: Number(p.amount) })),
    })
    if (!ok) return
    notify(editId ? 'פרטי הספק עודכנו' : expired ? `${name} נוסף ומוקפא עד העלאת מסמך מעודכן` : `נוסף ספק: ${name}`)
    closeForm()
  }

  return (
    <FormShell title={editId ? 'עריכת ספק' : 'ספק חדש'} onSubmit={submit} submitLabel={editId ? 'שמירה' : 'הוספת ספק'}>
      <div className="full"><TextField label="שם בעל המקצוע / העסק" value={v.name} onChange={(e) => set('name')(e.target.value)} error={err.name} /></div>
      <div className="full"><TextField label="תחום" value={v.trade} onChange={(e) => set('trade')(e.target.value)} error={err.trade} placeholder="למשל: אינסטלציה" /></div>
      <div className="full"><CheckGroup label="אזורי פעילות" options={regions.map((r) => ({ value: r.id, label: r.name }))} value={v.regionIds} onChange={set('regionIds')} error={err.regionIds} /></div>
      <TextField label="תוקף רישיון" type="month" value={v.license} onChange={(e) => set('license')(e.target.value)} error={err.license} />
      <TextField label="תוקף ביטוח צד ג׳" type="month" value={v.insurance} onChange={(e) => set('insurance')(e.target.value)} error={err.insurance} />
      <div className="full stack" style={{ gap: 8 }}>
        <div style={{ font: '700 13px var(--font-ui)' }}>מחירון מוסכם (₪)</div>
        {prices.map((p, i) => (
          <div key={p.id ?? `new-${i}`} className="row" style={{ gap: 8 }}>
            <input className="input" aria-label={`שם מחיר ${i + 1}`} placeholder="ביקור / שעה / המתנה" value={p.label} onChange={(e) => setPrices((x) => x.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} />
            <input className="input" aria-label={`סכום ${i + 1}`} type="number" inputMode="decimal" min="0" placeholder="סכום" style={{ maxWidth: 120 }} value={p.amount} onChange={(e) => setPrices((x) => x.map((y, j) => (j === i ? { ...y, amount: e.target.value } : y)))} />
            {prices.length > 1 && <button type="button" className="icon-btn" aria-label={`הסרת מחיר ${i + 1}`} onClick={() => setPrices((x) => x.filter((_, j) => j !== i))}>×</button>}
          </div>
        ))}
        {err.prices && <div className="err" role="alert" style={{ color: 'var(--danger)', font: '600 12.5px var(--font-ui)' }}>{err.prices}</div>}
        <div><Button variant="secondary" size="sm" icon="plus" onClick={() => setPrices((x) => [...x, { label: '', amount: '' }])}>הוספת מחיר</Button></div>
      </div>
      {expired && <div className="full notice">התוקף כבר עבר, אז הספק יופיע כמוקפא ולא ניתן יהיה לשבץ אותו עד העלאת מסמך מעודכן.</div>}
    </FormShell>
  )
}

// ---------------------------------------------------------------- Staff
function StaffForm({ editId, initial }: { editId: string | null; initial?: { staff: Record<string, unknown>; regionIds: number[] } }) {
  const { staff, regions, saveStaff, closeForm, notify } = useStore()
  const s0 = initial?.staff ?? {}
  const prof = s0.profiles as { email: string | null } | { email: string | null }[] | null | undefined
  const currentEmail = (Array.isArray(prof) ? prof[0]?.email : prof?.email) ?? null
  const [v, setV] = useState({
    name: (s0.full_name as string) ?? '', jobTitle: (s0.job_title as string) ?? JOB_TITLES[0].value, gender: (s0.gender as string) ?? 'f',
    phone: (s0.phone as string) ?? '', languages: ((s0.languages as string[]) ?? []).join(', '), regionIds: initial?.regionIds ?? ([] as number[]),
    email: currentEmail ?? '',
  })
  const [err, setErr] = useState<Errors>({})
  const set = <K extends keyof typeof v>(k: K) => (val: (typeof v)[K]) => setV((s) => ({ ...s, [k]: val }))

  const submit = async () => {
    const e: Errors = {}
    const name = v.name.trim()
    if (!name) e.name = REQUIRED
    else if (staff.some((x) => x.name === name && x.id !== editId)) e.name = 'מלווה בשם הזה כבר קיים/ת'
    if (!v.languages.trim()) e.languages = REQUIRED
    if (!v.regionIds.length) e.regionIds = 'בחרי לפחות אזור אחד'
    if (v.email.trim() && !/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = 'כתובת אימייל לא תקינה'
    setErr(e)
    if (Object.keys(e).length) return
    const ok = await saveStaff(editId, { name, jobTitle: v.jobTitle, gender: v.gender, phone: v.phone, languages: v.languages, regionIds: v.regionIds, email: v.email, currentEmail })
    if (!ok) return
    notify(editId ? 'פרטי המלווה עודכנו' : `נוסף/ה מלווה: ${shortName(name)}`)
    closeForm()
  }

  return (
    <FormShell title={editId ? 'עריכת מלווה' : 'מלווה חדש/ה'} onSubmit={submit} submitLabel={editId ? 'שמירה' : 'הוספת מלווה'}>
      <div className="full"><TextField label="שם מלא" value={v.name} onChange={(e) => set('name')(e.target.value)} error={err.name} /></div>
      <SelectField label="תפקיד" value={v.jobTitle} onChange={set('jobTitle')} options={JOB_TITLES} />
      <SelectField label="מגדר" value={v.gender} onChange={set('gender')} options={[{ value: 'f', label: 'אישה' }, { value: 'm', label: 'גבר' }]} />
      <TextField label="טלפון" type="tel" dir="ltr" value={v.phone} onChange={(e) => set('phone')(e.target.value)} placeholder="052-000-0000" />
      <TextField label="שפות" value={v.languages} onChange={(e) => set('languages')(e.target.value)} error={err.languages} placeholder="עברית, אנגלית" hint="מופרדות בפסיק" />
      <div className="full"><CheckGroup label="אזורי פעילות" options={regions.map((r) => ({ value: r.id, label: r.name }))} value={v.regionIds} onChange={set('regionIds')} error={err.regionIds} /></div>
      <div className="full"><TextField label="אימייל להתחברות לאפליקציה" type="email" dir="ltr" value={v.email} onChange={(e) => set('email')(e.target.value)} error={err.email}
        hint={currentEmail ? 'החשבון מחובר. מחיקת האימייל תנתק את הגישה.' : 'קודם יוצרים משתמש ב-Supabase ← Authentication ← Add user, ואז מזינים כאן את אותו אימייל.'} /></div>
    </FormShell>
  )
}


// ---------------------------------------------------------------- Recurring visit slot
const minutes = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }

function SlotForm({ editId, preset }: { editId: string | null; preset: Record<string, string> }) {
  const { slots, clients, staff, tasks, saveSlot, closeForm, notify } = useStore()
  const existing = editId ? slots.find((x) => x.id === editId) : undefined
  const initialClient = existing?.clientId ?? preset.clientId ?? ''
  const [v, setV] = useState({
    clientId: initialClient, weekday: String(existing?.weekday ?? 0), start: existing?.start ?? '', end: existing?.end ?? '', purpose: existing?.purpose ?? '',
    staffId: existing ? (existing.staffId ?? '') : (clients.find((c) => c.id === initialClient)?.companionId ?? ''),
    validFrom: existing?.validFrom ?? TODAY, validTo: existing?.validTo ?? '', active: existing?.active ?? true,
  })
  const [err, setErr] = useState<Errors>({})
  const set = <K extends keyof typeof v>(k: K) => (val: (typeof v)[K]) => setV((s) => ({ ...s, [k]: val }))

  // Heads-up (not a block): the chosen companion already has a visit at that time on that weekday in the coming weeks.
  const clash = (() => {
    if (!v.staffId || !v.start) return null
    const from = minutes(v.start), to = v.end ? minutes(v.end) : from + 120
    const horizon = toISO(addDays(parseISO(TODAY), 35))
    return tasks.find((t) => t.staffId === v.staffId && t.slotId !== editId && t.date >= TODAY && t.date <= horizon
      && parseISO(t.date).getDay() === Number(v.weekday) && t.statusKey !== 'cancelled'
      && minutes(t.time) < to && (t.end ? minutes(t.end) : minutes(t.time) + 120) > from) ?? null
  })()

  const submit = async () => {
    const e: Errors = {}
    if (!v.clientId) e.clientId = 'בחרי לקוח/ה'
    if (!v.start) e.start = REQUIRED
    if (v.end && v.start && v.end <= v.start) e.end = 'שעת הסיום חייבת להיות אחרי ההתחלה'
    if (!v.purpose.trim()) e.purpose = 'כתבי את מטרת הביקור'
    if (!v.validFrom) e.validFrom = REQUIRED
    if (v.validTo && v.validFrom && v.validTo < v.validFrom) e.validTo = 'התאריך חייב להיות אחרי ההתחלה'
    setErr(e)
    if (Object.keys(e).length) return
    const ok = await saveSlot(editId, { clientId: v.clientId, weekday: Number(v.weekday), start: v.start, end: v.end, purpose: v.purpose, staffId: v.staffId, validFrom: v.validFrom, validTo: v.validTo, active: v.active })
    if (!ok) return
    notify(editId ? 'הביקור הקבוע עודכן, והביקורים העתידיים התעדכנו' : 'נוסף ביקור קבוע. הביקורים נוצרו בלו"ז לחודש הקרוב')
    closeForm()
  }

  return (
    <FormShell title={editId ? 'עריכת ביקור קבוע' : 'ביקור קבוע חדש'} onSubmit={submit} submitLabel={editId ? 'שמירה' : 'הוספה'}>
      <div className="full"><SelectField label="לקוח/ה" value={v.clientId} onChange={(id) => setV((s) => ({ ...s, clientId: id, staffId: s.staffId || (clients.find((c) => c.id === id)?.companionId ?? '') }))} options={clients.map((c) => ({ value: c.id, label: c.name }))} placeholder="בחרי לקוח/ה" error={err.clientId} /></div>
      <SelectField label="יום בשבוע" value={v.weekday} onChange={set('weekday')} options={DAY_NAMES.map((n, i) => ({ value: String(i), label: n }))} />
      <SelectField label="מלווה/ת" value={v.staffId} onChange={set('staffId')} options={staff.map((s) => ({ value: s.id, label: s.name }))} placeholder="עדיין ללא" />
      <TextField label="שעת התחלה" type="time" value={v.start} onChange={(e) => set('start')(e.target.value)} error={err.start} />
      <TextField label="שעת סיום" type="time" value={v.end} onChange={(e) => set('end')(e.target.value)} error={err.end} hint="בלי שעת סיום לא ניתן לחשב תוספת זמן" />
      <div className="full"><TextField label="מטרת הביקור" value={v.purpose} onChange={(e) => set('purpose')(e.target.value)} error={err.purpose} placeholder="למשל: ליווי לרופא, קניות, הליכה" /></div>
      <TextField label="בתוקף מתאריך" type="date" value={v.validFrom} onChange={(e) => set('validFrom')(e.target.value)} error={err.validFrom} />
      <TextField label="עד תאריך (אופציונלי)" type="date" value={v.validTo} onChange={(e) => set('validTo')(e.target.value)} error={err.validTo} />
      {editId && (
        <label className="full row" style={{ gap: 10, font: '600 14px var(--font-ui)', minHeight: 44 }}>
          <input type="checkbox" checked={v.active} onChange={(e) => set('active')(e.target.checked)} style={{ width: 20, height: 20 }} />
          פעיל (כיבוי מסיר את הביקורים העתידיים שטרם התקיימו)
        </label>
      )}
      {clash && <div className="full notice">למלווה/ת כבר יש ביקור באותו יום ובשעות חופפות: {clash.client}, {formatDM(parseISO(clash.date))} {clash.time}. אפשר לשמור, אבל כדאי לבדוק.</div>}
    </FormShell>
  )
}

// ---------------------------------------------------------------- Office planning item
function ItemForm({ editId, preset }: { editId: string | null; preset: Record<string, string> }) {
  const { items, clients, vendors, admins, saveItem, closeForm, notify } = useStore()
  const existing = editId ? items.find((x) => x.id === editId) : undefined
  const [v, setV] = useState({
    clientId: existing?.clientId ?? preset.clientId ?? '', kind: existing?.kind ?? preset.kind ?? 'transport', title: existing?.title ?? '',
    eventDate: existing?.eventDate ?? preset.date ?? '', dueDate: existing?.dueDate ?? '', assigneeId: existing?.assigneeId ?? '',
    vendorId: existing?.vendorId ?? '', status: existing?.status ?? 'new', notes: existing?.notes ?? '',
  })
  const [dueTouched, setDueTouched] = useState(!!existing?.dueDate)
  const [err, setErr] = useState<Errors>({})
  const set = <K extends keyof typeof v>(k: K) => (val: (typeof v)[K]) => setV((s) => ({ ...s, [k]: val }))
  const vendorOptions = vendors.filter((x) => !x.licBad || x.id === existing?.vendorId).map((x) => ({ value: x.id, label: x.licBad ? `${x.name} (מוקפא)` : x.name }))

  // Default deadline: 3 days before the event (the plan promises 3 days' notice), until the user picks one.
  const pickEventDate = (d: string) => setV((s) => ({ ...s, eventDate: d, dueDate: dueTouched || !d ? s.dueDate : toISO(addDays(parseISO(d), -3)) }))

  const submit = async () => {
    const e: Errors = {}
    if (!v.clientId) e.clientId = 'בחרי לקוח/ה'
    if (!v.title.trim()) e.title = REQUIRED
    if (!v.eventDate) e.eventDate = REQUIRED
    if (v.dueDate && v.eventDate && v.dueDate > v.eventDate) e.dueDate = 'המועד לסיום התיאום חייב להיות לפני האירוע'
    setErr(e)
    if (Object.keys(e).length) return
    const ok = await saveItem(editId, { clientId: v.clientId, kind: v.kind, title: v.title, eventDate: v.eventDate, dueDate: v.dueDate, assigneeId: v.assigneeId, vendorId: v.vendorId, status: v.status, notes: v.notes })
    if (!ok) return
    notify(editId ? 'הפריט עודכן' : 'הפריט נוסף ללוח הניהול')
    closeForm()
  }

  return (
    <FormShell title={editId ? 'עריכת פריט תיאום' : 'פריט תיאום חדש'} onSubmit={submit} submitLabel={editId ? 'שמירה' : 'הוספה'}>
      <div className="full"><SelectField label="לקוח/ה" value={v.clientId} onChange={set('clientId')} options={clients.map((c) => ({ value: c.id, label: c.name }))} placeholder="בחרי לקוח/ה" error={err.clientId} /></div>
      <SelectField label="סוג" value={v.kind} onChange={set('kind')} options={ITEM_KINDS} />
      <SelectField label="סטטוס" value={v.status} onChange={set('status')} options={ITEM_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
      <div className="full"><TextField label="מה צריך לתאם" value={v.title} onChange={(e) => set('title')(e.target.value)} error={err.title} placeholder="למשל: מונית VIP להצגה + המתנה" /></div>
      <TextField label="תאריך האירוע" type="date" value={v.eventDate} onChange={(e) => pickEventDate(e.target.value)} error={err.eventDate} />
      <TextField label="לסיים לתאם עד" type="date" value={v.dueDate} onChange={(e) => { setDueTouched(true); set('dueDate')(e.target.value) }} error={err.dueDate} hint="ברירת מחדל: שלושה ימים לפני האירוע" />
      <SelectField label="בטיפול של" value={v.assigneeId} onChange={set('assigneeId')} options={admins.map((a) => ({ value: a.id, label: a.name }))} placeholder="עוד לא הוקצה" />
      <SelectField label="ספק" value={v.vendorId} onChange={set('vendorId')} options={vendorOptions} placeholder="ללא ספק" />
      <div className="full"><TextAreaField label="הערות" value={v.notes} onChange={set('notes')} /></div>
    </FormShell>
  )
}

// ---------------------------------------------------------------- Hosts
export default function FormHost() {
  const { form } = useStore()
  if (!form) return null
  const preset = form.preset ?? {}
  const id = preset.id ?? null
  // key resets local state each time a form is opened
  switch (form.kind) {
    case 'task': return <TaskForm key={`task-${id}`} editId={id} preset={preset} />
    case 'slot': return <SlotForm key={`slot-${id}`} editId={id} preset={preset} />
    case 'item': return <ItemForm key={`item-${id}`} editId={id} preset={preset} />
    case 'client':
      return id
        ? <EditLoader key={`c-${id}`} title="עריכת פרטי לקוח/ה" load={() => fetchClientForEdit(id)}>
            {(d) => <ClientForm editId={id} initial={d.client as ClientRow} ordererName={(d.orderer?.full_name as string) ?? ''} />}
          </EditLoader>
        : <ClientForm key="client" editId={null} />
    case 'vendor':
      return id
        ? <EditLoader key={`v-${id}`} title="עריכת ספק" load={() => fetchVendorForEdit(id)}>{(d) => <VendorForm editId={id} initial={d as never} />}</EditLoader>
        : <VendorForm key="vendor" editId={null} />
    case 'staff':
      return id
        ? <EditLoader key={`s-${id}`} title="עריכת מלווה" load={() => fetchStaffForEdit(id)}>{(d) => <StaffForm editId={id} initial={d} />}</EditLoader>
        : <StaffForm key="staff" editId={null} />
  }
}

const KIND_LABEL = { task: 'המשימה', client: 'הלקוח/ה', vendor: 'הספק', staff: 'המלווה', slot: 'הביקור הקבוע', item: 'הפריט' } as const

export function DeleteHost() {
  const { pendingDelete, cancelDelete, confirmDelete } = useStore()
  const [busy, setBusy] = useState(false)
  if (!pendingDelete) return null
  return (
    <Modal
      title={`מחיקת ${KIND_LABEL[pendingDelete.kind]}`}
      onClose={cancelDelete}
      footer={
        <>
          <Button variant="danger" disabled={busy} onClick={async () => { setBusy(true); await confirmDelete(); setBusy(false) }}>{busy ? 'מוחקת…' : 'כן, למחוק'}</Button>
          <Button variant="quiet" onClick={cancelDelete}>ביטול</Button>
        </>
      }
    >
      <p style={{ font: '700 15px/1.5 var(--font-ui)', marginBottom: 8 }}>למחוק את {pendingDelete.name}?</p>
      <p className="muted" style={{ lineHeight: 1.55 }}>{pendingDelete.warning}</p>
    </Modal>
  )
}

export function Toast() {
  const { toast } = useStore()
  return toast ? <div className="toast" role="status">{toast}</div> : null
}
