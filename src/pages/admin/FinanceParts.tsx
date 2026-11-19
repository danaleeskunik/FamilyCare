import { Fragment, useCallback, useEffect, useState } from 'react'
import { Badge, Button, Card, CardHead, Ltr, money } from '../../components/ui'
import { TextField } from '../../components/Fields'
import { supabase } from '../../lib/supabase'
import { buildMonthReport, fmtHours, payroll } from '../../lib/report'
import { PLAN_RATES, RATE_BANDS, applyPriceSheet, pctOf, usePrices, type PlanRate } from '../../data/pricing'
import { TODAY } from '../../data/model'
import { useStore } from '../../store/AppStore'
import { useAuth } from '../../store/AuthStore'

const num = (v: unknown) => (v === '' || v == null ? 0 : Number(v))
const shekel = (n: number) => money(Number.isInteger(n) ? n : Number(n.toFixed(2)))

// ---------- the month's numbers ----------

export type WorkerExpense = { id: string; date: string; text: string; amount: number; status: string }
export type WorkerRow = {
  id: string; name: string; visits: number; pendingActivities: number; hours: number; extraHours: number; wagePay: number
  travel: number; expenses: WorkerExpense[]; expensesTotal: number; total: number
}
export type FixedRow = { name: string; amount: number }
export type MonthData = { workers: WorkerRow[]; payroll: number; fixed: FixedRow[]; fixedTotal: number; misc: number }

const nextMonth = (month: string) => {
  const [y, m] = month.split('-').map(Number)
  return `${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, '0')}-01`
}

/** Payroll, fixed expenses and scanned invoices for one month (1st to the end of the month). */
export function useMonthData(month: string, version: number): MonthData | null {
  const { staff, pricing } = useStore()
  const [raw, setRaw] = useState<{ tasks: Row[]; exp: Row[]; act: Row[]; wages: Row[]; fixed: Row[]; docs: number } | null>(null)
  useEffect(() => {
    const from = `${month}-01`
    const to = nextMonth(month)
    const t0 = new Date(`${from}T00:00:00`).toISOString()
    const t1 = new Date(`${to}T00:00:00`).toISOString()
    let cancelled = false
    void (async () => {
      const [t, e, w, f, d, ac] = await Promise.all([
        supabase.from('tasks').select('id, staff_id, client_id, scheduled_date, start_time, end_time, status, checked_in_at, checked_out_at').eq('status', 'completed').gte('scheduled_date', from).lt('scheduled_date', to),
        supabase.from('staff_expenses').select('*').gte('expense_date', from).lt('expense_date', to).order('expense_date'),
        supabase.from('staff_members').select('id, hourly_wage'),
        supabase.from('fixed_expenses').select('name, amount').order('created_at'),
        supabase.from('expense_docs').select('amount').gte('captured_at', t0).lt('captured_at', t1),
        supabase.from('staff_activities').select('*').gte('work_date', from).lt('work_date', to),
      ])
      if (cancelled) return
      setRaw({
        tasks: (t.data ?? []) as Row[], exp: (e.data ?? []) as Row[], act: (ac.data ?? []) as Row[], wages: (w.data ?? []) as Row[], fixed: (f.data ?? []) as Row[],
        docs: ((d.data ?? []) as Row[]).reduce((a, r) => a + Number(r.amount ?? 0), 0),
      })
    })()
    return () => { cancelled = true }
  }, [month, version])

  if (!raw) return null
  const names = new Map(staff.map((s) => [s.id, s.name]))
  const wageOf = new Map(raw.wages.map((r) => [r.id as string, r.hourly_wage != null ? Number(r.hourly_wage) : null]))
  const ids = [...new Set([...raw.tasks.map((x) => x.staff_id as string), ...raw.exp.map((x) => x.staff_id as string), ...raw.act.filter((x) => x.status === 'approved' || x.status === 'pending').map((x) => x.staff_id as string)].filter(Boolean))]
  const workers: WorkerRow[] = ids.map((id) => {
    const rep = buildMonthReport(raw.tasks.filter((x) => x.staff_id === id), raw.exp.filter((x) => x.staff_id === id), [], raw.act.filter((x) => x.staff_id === id))
    const wage = wageOf.get(id) ?? pricing.wage
    const pay = payroll(rep, wage, pricing)
    const expenses = raw.exp.filter((x) => x.staff_id === id).map((x) => ({ id: x.id as string, date: x.expense_date as string, text: x.description as string, amount: Number(x.amount), status: x.status as string }))
    const extra = rep.extraMinutes
    return {
      id, name: names.get(id) ?? 'מלווה', visits: rep.travelTrips, pendingActivities: rep.pendingActivities, hours: (rep.totalMinutes - extra) / 60, extraHours: extra / 60,
      wagePay: pay.gross, travel: pay.travel, expenses, expensesTotal: pay.expenses, total: pay.gross + pay.travel + pay.expenses,
    }
  }).sort((a, b) => a.name.localeCompare(b.name, 'he'))
  const fixed = raw.fixed.map((r) => ({ name: r.name as string, amount: Number(r.amount) }))
  return { workers, payroll: workers.reduce((a, w) => a + w.total, 0), fixed, fixedTotal: fixed.reduce((a, r) => a + r.amount, 0), misc: raw.docs }
}
type Row = Record<string, unknown>

// ---------- price sheet (editable) ----------

type Draft = { plans: PlanRate[]; evening: string; night: string }

export function PriceSheetCard({ onPay }: { onPay: (kind: 'monthly' | 'extra') => void }) {
  usePrices()
  const { pricing, notify, reload } = useStore()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busy, setBusy] = useState(false)
  const start = () => setDraft({ plans: PLAN_RATES.map((p) => ({ ...p })), evening: String(pctOf(RATE_BANDS[1].mult)), night: String(pctOf(RATE_BANDS[2].mult)) })
  const setPlan = (id: string, k: keyof PlanRate, v: string) => setDraft((d) => d && ({ ...d, plans: d.plans.map((p) => (p.id === id ? { ...p, [k]: v === '' ? ('' as unknown as number) : Number(v) } : p)) }))
  const save = async () => {
    if (!draft) return
    const plans = draft.plans.map((p) => ({ id: p.id, name: p.name, fee: num(p.fee), meetings: num(p.meetings), hours: num(p.hours), rate: num(p.rate) }))
    if (plans.some((p) => p.meetings <= 0 || p.hours <= 0)) { notify('מספר הפגישות והשעות לפגישה חייבים להיות גדולים מאפס.'); return }
    if (num(draft.evening) < 100 || num(draft.night) < 100) { notify('אחוז ערב ולילה לא יכול להיות מתחת ל-100.'); return }
    setBusy(true)
    const { data, error } = await supabase.rpc('save_price_sheet', { p_plans: plans, p_evening: num(draft.evening), p_night: num(draft.night), p_wage: pricing.wage, p_travel: pricing.travelPerDay })
    setBusy(false)
    if (error || data !== true) { console.error('save price sheet', error); notify('לא הצלחנו לשמור את המחירון. בדקי שהרצת את 0039.'); return }
    applyPriceSheet({ plans, evening_pct: num(draft.evening), night_pct: num(draft.night) })
    setDraft(null)
    reload()
    notify('המחירון נשמר ומתעדכן באתר ובפורטלים.')
  }
  const edit = !!draft
  const cell = (id: string, k: keyof PlanRate, w = 90) => (
    <input className="input" type="number" inputMode="decimal" min="0" dir="ltr" style={{ width: w, minHeight: 36, padding: '4px 8px' }}
      value={String(draft?.plans.find((p) => p.id === id)?.[k] ?? '')} onChange={(e) => setPlan(id, k, e.target.value)} aria-label={k} />
  )
  return (
    <Card flush>
      <CardHead title="מסלולים ושעות נוספות">
        {edit ? (
          <>
            <Button size="sm" variant="secondary" onClick={() => setDraft(null)} disabled={busy}>ביטול</Button>
            <Button size="sm" onClick={() => void save()} disabled={busy}>{busy ? 'שומרים…' : 'שמירה'}</Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="secondary" onClick={start}>עריכת מחירון</Button>
            <Button size="sm" variant="secondary" onClick={() => onPay('monthly')}>תשלום מנוי חודשי</Button>
            <Button size="sm" onClick={() => onPay('extra')}>תשלום נוסף</Button>
          </>
        )}
      </CardHead>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>מסלול</th><th>מנוי חודשי</th><th>פגישות</th><th>שעות לפגישה</th><th>שעה נוספת<span className="th-sub">{RATE_BANDS[0].label}</span></th>
              <th>שעה נוספת<span className="th-sub">{RATE_BANDS[1].label} · {edit ? <input className="input" type="number" dir="ltr" min="100" style={{ width: 64, minHeight: 28, padding: '2px 6px' }} value={draft?.evening} onChange={(e) => setDraft((d) => d && { ...d, evening: e.target.value })} aria-label="אחוז ערב" /> : pctOf(RATE_BANDS[1].mult)}%</span></th>
              <th>שעה נוספת<span className="th-sub">{RATE_BANDS[2].label} · {edit ? <input className="input" type="number" dir="ltr" min="100" style={{ width: 64, minHeight: 28, padding: '2px 6px' }} value={draft?.night} onChange={(e) => setDraft((d) => d && { ...d, night: e.target.value })} aria-label="אחוז לילה" /> : pctOf(RATE_BANDS[2].mult)}%</span></th>
            </tr>
          </thead>
          <tbody>
            {PLAN_RATES.map((p) => {
              const rate = edit ? num(draft?.plans.find((x) => x.id === p.id)?.rate) : p.rate
              const ev = edit ? num(draft?.evening) / 100 : RATE_BANDS[1].mult
              const ni = edit ? num(draft?.night) / 100 : RATE_BANDS[2].mult
              return (
                <tr key={p.id}>
                  <td className="name">{p.name}</td>
                  <td className="num nowrap">{edit ? cell(p.id, 'fee', 110) : money(p.fee)}</td>
                  <td className="num">{edit ? cell(p.id, 'meetings', 70) : p.meetings}</td>
                  <td className="num">{edit ? cell(p.id, 'hours', 70) : p.hours}</td>
                  <td className="num nowrap">{edit ? cell(p.id, 'rate', 90) : shekel(p.rate)}</td>
                  <td className="num nowrap">{shekel(rate * ev)}</td>
                  <td className="num nowrap">{shekel(rate * ni)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="stack" style={{ padding: '12px 18px 16px', gap: 10 }}>
        <p className="card-meta" style={{ lineHeight: 1.5 }}>שינוי במחירון מתעדכן מיד באתר החברה ובפורטל הלקוחות. מחיר השעה הנוספת בערב ובלילה מחושב לפי האחוזים.</p>
      </div>
    </Card>
  )
}

// ---------- companion hour and travel cost (drives payroll) ----------

export function CompanionRatesCard() {
  usePrices()
  const { pricing, notify, reload } = useStore()
  const [draft, setDraft] = useState<{ wage: string; travel: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const save = async () => {
    if (!draft) return
    const wage = num(draft.wage), travel = num(draft.travel)
    if (wage <= 0 || travel < 0) { notify('עלות שעת מלווה חייבת להיות גדולה מאפס.'); return }
    setBusy(true)
    // the same function that saves the price sheet: the plans and percentages are sent unchanged
    const plans = PLAN_RATES.map((p) => ({ id: p.id, name: p.name, fee: p.fee, meetings: p.meetings, hours: p.hours, rate: p.rate }))
    const { data, error } = await supabase.rpc('save_price_sheet', { p_plans: plans, p_evening: pctOf(RATE_BANDS[1].mult), p_night: pctOf(RATE_BANDS[2].mult), p_wage: wage, p_travel: travel })
    setBusy(false)
    if (error || data !== true) { console.error('save companion rates', error); notify('לא הצלחנו לשמור.'); return }
    setDraft(null)
    reload()
    notify('נשמר. השכר של המלווים מחושב לפי המספרים החדשים.')
  }
  return (
    <Card>
      <CardHead title="שעת מלווה ועלות נסיעה">
        {draft ? (
          <>
            <Button size="sm" variant="secondary" onClick={() => setDraft(null)} disabled={busy}>ביטול</Button>
            <Button size="sm" onClick={() => void save()} disabled={busy}>{busy ? 'שומרים…' : 'שמירה'}</Button>
          </>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setDraft({ wage: String(pricing.wage), travel: String(pricing.travelPerDay) })}>עריכה</Button>
        )}
      </CardHead>
      <div className="stack" style={{ padding: '4px 18px 16px', gap: 10 }}>
        {draft ? (
          <div className="extra-fields">
            <TextField label="עלות שעת מלווה (₪)" type="number" inputMode="decimal" min="0" dir="ltr" value={draft.wage} onChange={(e) => setDraft((d) => d && { ...d, wage: e.target.value })} />
            <TextField label="עלות נסיעה (₪)" type="number" inputMode="decimal" min="0" dir="ltr" value={draft.travel} onChange={(e) => setDraft((d) => d && { ...d, travel: e.target.value })} />
          </div>
        ) : (
          <>
            <div className="kv"><span>עלות שעת מלווה</span><span className="v"><Ltr>{shekel(pricing.wage)}</Ltr></span></div>
            <div className="kv"><span>עלות נסיעה</span><span className="v"><Ltr>{shekel(pricing.travelPerDay)}</Ltr></span></div>
          </>
        )}
        <p className="card-meta" style={{ lineHeight: 1.5 }}>שכר מלווה = שעות בפועל × עלות שעה, ועוד עלות נסיעה על כל ביקור אצל לקוח, ועוד הוצאות מאושרות. מלווה עם שכר שעה אישי בכרטיס שלו מחושב לפי השכר האישי.</p>
      </div>
    </Card>
  )
}

// ---------- payroll table ----------

export function PayrollCard({ data, monthName, onChanged }: { data: MonthData | null; monthName: string; onChanged: () => void }) {
  const { notify } = useStore()
  const { session } = useAuth()
  const [open, setOpen] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const add = async (staffId: string) => {
    const a = Number(amount)
    if (!text.trim() || !(a > 0)) { notify('צריך לכתוב מלל וסכום גדול מאפס.'); return }
    setBusy(true)
    const { error } = await supabase.from('staff_expenses').insert({ staff_id: staffId, expense_date: TODAY, amount: a, description: text.trim(), status: 'approved', reviewed_by: session?.user.id ?? null, reviewed_at: new Date().toISOString() })
    setBusy(false)
    if (error) { console.error('add expense', error); notify('לא הצלחנו לשמור את ההוצאה.'); return }
    setText(''); setAmount(''); onChanged()
  }
  const remove = async (id: string) => {
    const { error } = await supabase.from('staff_expenses').delete().eq('id', id)
    if (error) { notify('לא הצלחנו למחוק.'); return }
    onChanged()
  }
  return (
    <Card flush>
      <CardHead title={`שכר עובדים ${monthName}`} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>שם עובד</th><th>שעות עבודה</th><th>שעות נוספות</th><th>נסיעות</th><th>הוצאות נוספות</th><th>סה"כ</th></tr>
          </thead>
          <tbody>
            {(data?.workers ?? []).map((w) => (
              <Fragment key={w.id}>
                <tr>
                  <td className="name"><button type="button" className="btn ghost sm" aria-expanded={open === w.id} onClick={() => setOpen(open === w.id ? null : w.id)}>{w.name}</button>{w.pendingActivities > 0 && <> <Badge tone="orange">{w.pendingActivities} פעילויות ממתינות לאישור</Badge></>}</td>
                  <td className="num nowrap"><Ltr>{fmtHours(w.hours * 60)}</Ltr></td>
                  <td className="num nowrap"><Ltr>{fmtHours(w.extraHours * 60)}</Ltr></td>
                  <td className="num nowrap">{money(w.travel)}<span className="th-sub">{w.visits} נסיעות</span></td>
                  <td className="num nowrap">{money(w.expensesTotal)}</td>
                  <td className="num nowrap" style={{ fontWeight: 700 }}>{money(w.total)}</td>
                </tr>
                {open === w.id && (
                  <tr>
                    <td colSpan={6}>
                      <div className="stack" style={{ gap: 8, padding: '6px 4px' }}>
                        <div className="kv faint"><span>שכר שעות ({fmtHours((w.hours + w.extraHours) * 60)} שעות)</span><span className="v">{money(w.wagePay)}</span></div>
                        {w.expenses.map((x) => (
                          <div key={x.id} className="kv">
                            <span>{x.text} <Badge tone={x.status === 'approved' ? 'green' : x.status === 'pending' ? 'orange' : 'red'}>{x.status === 'approved' ? 'אושר' : x.status === 'pending' ? 'ממתין' : 'נדחה'}</Badge></span>
                            <span className="v">{money(x.amount)} <button type="button" className="btn ghost sm" onClick={() => void remove(x.id)} aria-label="מחיקת הוצאה">מחיקה</button></span>
                          </div>
                        ))}
                        <div className="row" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                          <div style={{ flex: '1 1 200px' }}><TextField label="הוצאה נוספת (מלל)" value={text} onChange={(e) => setText(e.target.value)} placeholder="למשל: חניה, כיבוד ללקוח" /></div>
                          <div style={{ flex: '0 0 130px' }}><TextField label="סכום (₪)" type="number" inputMode="decimal" min="0" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
                          <Button size="sm" onClick={() => void add(w.id)} disabled={busy}>הוספה</Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {data && data.workers.length === 0 && <tr><td colSpan={6} className="muted">עוד אין ביקורים שהושלמו החודש.</td></tr>}
            {data && data.workers.length > 0 && (
              <tr><td className="name" style={{ fontWeight: 700 }}>סה"כ</td><td colSpan={4} /><td className="num nowrap" style={{ fontWeight: 700 }}>{money(data.payroll)}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="card-meta" style={{ padding: '10px 18px 16px', lineHeight: 1.5 }}>שכר עובד = שעות לפי תכנון + שעות נוספות (לפי הדיווח בפועל) + נסיעות (לכל ביקור אצל לקוח) + הוצאות נוספות מאושרות. לחיצה על שם העובד פותחת את פירוט ההוצאות ומאפשרת להוסיף.</p>
    </Card>
  )
}

// ---------- fixed expenses ----------

const FIXED_PRESETS = ['כיבוד', 'רכב', 'משרד', 'רכישת ציוד', 'ארנונה', 'חשמל', 'מים']

export function FixedExpensesEditor({ rows, onSaved }: { rows: FixedRow[]; onSaved: () => void }) {
  const { notify } = useStore()
  const initial = useCallback(() => {
    const saved = new Map(rows.map((r) => [r.name, r.amount]))
    const presets = FIXED_PRESETS.map((n) => ({ name: n, amount: String(saved.get(n) ?? ''), custom: false }))
    const custom = rows.filter((r) => !FIXED_PRESETS.includes(r.name)).map((r) => ({ name: r.name, amount: String(r.amount), custom: true }))
    return [...presets, ...custom]
  }, [rows])
  const [list, setList] = useState(initial)
  const [busy, setBusy] = useState(false)
  useEffect(() => { setList(initial()) }, [initial])
  const setAmount = (i: number, v: string) => setList((l) => l.map((x, j) => (j === i ? { ...x, amount: v } : x)))
  const setName = (i: number, v: string) => setList((l) => l.map((x, j) => (j === i ? { ...x, name: v } : x)))
  const save = async () => {
    const clean = list.map((x) => ({ name: x.name.trim(), amount: num(x.amount) })).filter((x) => x.name && x.amount > 0)
    if (new Set(clean.map((x) => x.name)).size !== clean.length) { notify('יש שני סעיפים עם אותו שם.'); return }
    setBusy(true)
    const keep = clean.map((x) => x.name)
    const del = keep.length ? supabase.from('fixed_expenses').delete().not('name', 'in', `(${keep.map((n) => `"${n.replace(/"/g, '')}"`).join(',')})`) : supabase.from('fixed_expenses').delete().neq('name', '')
    const [d, u] = await Promise.all([del, clean.length ? supabase.from('fixed_expenses').upsert(clean, { onConflict: 'name' }) : Promise.resolve({ error: null })])
    setBusy(false)
    if (d.error || u.error) { console.error('fixed expenses', d.error, u.error); notify('לא הצלחנו לשמור. בדקי שהרצת את 0039.'); return }
    notify('ההוצאות הקבועות נשמרו.')
    onSaved()
  }
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="card-title">הוצאות קבועות לחודש</div>
      {list.map((x, i) => (
        <div key={i} className="row" style={{ gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 auto' }}>
            {x.custom
              ? <TextField label="סעיף (מלל חופשי)" value={x.name} onChange={(e) => setName(i, e.target.value)} />
              : <TextField label="סעיף" value={x.name} readOnly />}
          </div>
          <div style={{ flex: '0 0 130px' }}><TextField label="סכום (₪)" type="number" inputMode="decimal" min="0" dir="ltr" value={x.amount} onChange={(e) => setAmount(i, e.target.value)} /></div>
          {x.custom && <Button size="sm" variant="secondary" onClick={() => setList((l) => l.filter((_, j) => j !== i))}>הסרה</Button>}
        </div>
      ))}
      <div className="row" style={{ gap: 8 }}>
        <Button size="sm" variant="secondary" onClick={() => setList((l) => [...l, { name: '', amount: '', custom: true }])}>הוספת סעיף</Button>
        <Button size="sm" onClick={() => void save()} disabled={busy}>{busy ? 'שומרים…' : 'שמירה'}</Button>
      </div>
    </div>
  )
}
