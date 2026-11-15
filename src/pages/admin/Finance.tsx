import { useEffect, useState } from 'react'
import { Badge, Button, Callout, Card, CardHead, StatCard, money } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { TODAY } from '../../data/model'
import Modal from '../../components/Modal'
import { useStore } from '../../store/AppStore'
import type { InvoiceRow } from '../../data/model'
import { SelectField, TextField } from '../../components/Fields'
import PaymentOptions from '../../components/PaymentOptions'
import { PLAN_RATES, RATE_BANDS, extraHoursCharge, planFromLabel, toMinutes } from '../../data/pricing'

type Detail = 'fees' | 'hours' | 'expenses' | 'profit'
type Pay = { kind: 'monthly' | 'extra'; amount: number; planId: string; clientId: string }

/** Shekels with agorot only when there are any. */
const shekel = (n: number) => money(Number.isInteger(n) ? n : Number(n.toFixed(2)))

const Row = ({ label, value, faint, total }: { label: string; value: string; faint?: boolean; total?: boolean }) => (
  <div className={`kv ${faint ? 'faint' : ''} ${total ? 'total' : ''}`}><span>{label}</span><span className="v">{value}</span></div>
)
const Note = ({ children }: { children: string }) => <p className="card-meta" style={{ marginTop: 12, lineHeight: 1.5 }}>{children}</p>

type Sums = { fees: number; hours: number; revenue: number; expenses: number; profit: number }

function DetailBody({ kind, invoices, sums }: { kind: Detail; invoices: InvoiceRow[]; sums: Sums }) {
  if (kind === 'fees') {
    return (
      <>
        {invoices.filter((i) => i.fee > 0).map((i) => <Row key={i.id} label={i.orderer} value={money(i.fee)} />)}
        <Row total label="סה&quot;כ דמי חברות" value={money(sums.fees)} />
        {sums.fees === 0 && <Note>עוד אין דמי חברות החודש.</Note>}
      </>
    )
  }
  if (kind === 'hours') {
    return (
      <>
        <Row total label="סה&quot;כ שעות ליווי והעמסות" value={money(sums.hours)} />
        <div className="table-wrap"><table>
          <thead><tr><th>מזמין/ת השירות</th><th>שעות ליווי</th><th>ספקים + ניהול</th></tr></thead>
          <tbody>
            {invoices.map((i) => <tr key={i.id}><td className="name">{i.orderer}</td><td className="num nowrap">{money(i.hours)}</td><td className="num nowrap">{money(i.vendors)}</td></tr>)}
            {invoices.length === 0 && <tr><td colSpan={3} className="muted">אין עדיין חשבוניות החודש.</td></tr>}
          </tbody>
        </table></div>
      </>
    )
  }
  if (kind === 'expenses') {
    return (
      <>
        <Row total label="הוצאות מחשבוניות שנסרקו החודש" value={money(sums.expenses)} />
        <Note>הסכום נלקח מלשונית "חשבוניות" לפי חודש הסריקה. שכר מלווים עוד לא נכלל.</Note>
      </>
    )
  }
  return (
    <>
      <Row label="הכנסות" value={money(sums.revenue)} />
      <Row faint label="הוצאות" value={`− ${money(sums.expenses)}`} />
      <Row total label="רווח" value={money(sums.profit)} />
    </>
  )
}

const TITLES: Record<Detail, string> = {
  fees: 'דמי חברות', hours: 'שעות ליווי והעמסות', expenses: 'הוצאות', profit: 'רווח',
}

/** Price per plan, and a calculator for extra hours (evening and night hours cost more). */
function PlansAndExtras({ onPay }: { onPay: (p: Pay) => void }) {
  const [planId, setPlanId] = useState<string>(PLAN_RATES[0].id)
  const [start, setStart] = useState('18:00')
  const [end, setEnd] = useState('20:00')
  const plan = PLAN_RATES.find((p) => p.id === planId) ?? PLAN_RATES[0]
  const minutes = (() => { const d = toMinutes(end) - toMinutes(start); return d > 0 ? d : d + 1440 })()
  const calc = extraHoursCharge(plan.rate, start, minutes)
  const hrs = `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`
  return (
    <Card flush>
      <CardHead title="מסלולים ושעות נוספות">
        <Button size="sm" variant="secondary" onClick={() => onPay({ kind: 'monthly', amount: plan.fee, planId, clientId: '' })}>תשלום מנוי חודשי</Button>
        <Button size="sm" onClick={() => onPay({ kind: 'extra', amount: calc.total, planId, clientId: '' })}>תשלום נוסף</Button>
      </CardHead>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>מסלול</th><th>מנוי חודשי</th><th>פגישות</th><th>שעות לפגישה</th>{RATE_BANDS.map((b) => <th key={b.label}>שעה נוספת<span className="th-sub">{b.label}{b.mult !== 1 && ` · ${b.mult * 100}%`}</span></th>)}</tr>
          </thead>
          <tbody>
            {PLAN_RATES.map((p) => (
              <tr key={p.id}>
                <td className="name">{p.name}</td>
                <td className="num nowrap">{money(p.fee)}</td>
                <td className="num">{p.meetings}</td>
                <td className="num">{p.hours}</td>
                {RATE_BANDS.map((b) => <td key={b.label} className="num nowrap">{shekel(p.rate * b.mult)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="extra-calc">
        <div className="card-title">חישוב שעות נוספות</div>
        <div className="extra-fields">
          <SelectField label="מסלול" value={planId} onChange={setPlanId} options={PLAN_RATES.map((p) => ({ value: p.id, label: `${p.name} · ${money(p.rate)} לשעה` }))} />
          <TextField label="משעה" type="time" dir="ltr" value={start} onChange={(e) => setStart(e.target.value)} />
          <TextField label="עד שעה" type="time" dir="ltr" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div className="extra-result">
          {calc.lines.map((l) => <Row key={l.label} label={`${l.label} · ${Math.floor(l.minutes / 60)}:${String(l.minutes % 60).padStart(2, '0')} שעות${l.mult !== 1 ? ` · ${l.mult * 100}%` : ''}`} value={shekel(l.amount)} />)}
          <Row total label={`סה"כ ל-${hrs} שעות`} value={shekel(calc.total)} />
        </div>
        <Note>מחיר השעה לפי המסלול. משעה 19:00 עד 23:00 המחיר הוא 130%, ומשעה 23:00 עד 07:00 הוא 180%. החישוב יחסי לדקות, וטווח שחוצה חצות נחשב ברצף.</Note>
      </div>
    </Card>
  )
}

function PayModal({ init, onClose }: { init: Pay; onClose: () => void }) {
  const { clients } = useStore()
  const [kind, setKind] = useState(init.kind)
  const [clientId, setClientId] = useState(init.clientId)
  const [planId, setPlanId] = useState(init.planId)
  const [amount, setAmount] = useState(String(init.amount))
  const [note, setNote] = useState('')
  const pick = (id: string) => {
    setClientId(id)
    const found = planFromLabel(clients.find((c) => c.id === id)?.plan[1] ?? '')
    if (found) { setPlanId(found); if (kind === 'monthly') setAmount(String(PLAN_RATES.find((p) => p.id === found)?.fee ?? '')) }
  }
  const switchKind = (k: 'monthly' | 'extra') => {
    setKind(k)
    setAmount(k === 'monthly' ? String(PLAN_RATES.find((p) => p.id === planId)?.fee ?? '') : String(init.kind === 'extra' ? init.amount : ''))
  }
  const who = clients.find((c) => c.id === clientId)?.name
  const reason = `${kind === 'monthly' ? 'מנוי חודשי' : 'תשלום נוסף'}${who ? ` · ${who}` : ''}${note.trim() ? ` · ${note.trim()}` : ''}`
  return (
    <Modal title={kind === 'monthly' ? 'תשלום מנוי חודשי' : 'תשלום נוסף'} onClose={onClose}>
      <div className="stack" style={{ gap: 14 }}>
        <SelectField label="סוג התשלום" value={kind} onChange={(v) => switchKind(v as 'monthly' | 'extra')} options={[{ value: 'monthly', label: 'מנוי חודשי' }, { value: 'extra', label: 'תשלום נוסף (שעות נוספות, ספקים, כרטיסים)' }]} />
        <SelectField label="לקוח/ה" value={clientId} onChange={pick} options={clients.map((c) => ({ value: c.id, label: c.name }))} placeholder="ללא שיוך ללקוח" />
        {kind === 'monthly' && <SelectField label="מסלול" value={planId} onChange={(v) => { setPlanId(v); setAmount(String(PLAN_RATES.find((p) => p.id === v)?.fee ?? '')) }} options={PLAN_RATES.map((p) => ({ value: p.id, label: `${p.name} · ${money(p.fee)} לחודש` }))} />}
        <TextField label="סכום (₪)" type="number" inputMode="decimal" min="0" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <TextField label="הערה (אופציונלי)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="למשל: ספטמבר, או שעתיים בערב" />
        <PaymentOptions amount={Number(amount) > 0 ? Number(amount) : null} reason={reason} />
      </div>
    </Modal>
  )
}

export default function Finance() {
  const { invoices } = useStore()
  const [detail, setDetail] = useState<Detail | null>(null)
  const [pay, setPay] = useState<Pay | null>(null)
  const [expenses, setExpenses] = useState(0)
  const month = TODAY.slice(0, 7)
  const monthName = new Date(`${month}-01T12:00:00`).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })

  useEffect(() => {
    const from = new Date(`${month}-01T00:00:00`).toISOString()
    const to = new Date(new Date(`${month}-01T00:00:00`).setMonth(new Date(`${month}-01T00:00:00`).getMonth() + 1)).toISOString()
    supabase.from('expense_docs').select('amount').gte('captured_at', from).lt('captured_at', to).then(({ data }) => {
      setExpenses((data ?? []).reduce((a, r) => a + Number(r.amount ?? 0), 0))
    })
  }, [month])

  const fees = invoices.reduce((a, i) => a + i.fee, 0)
  const hours = invoices.reduce((a, i) => a + i.hours + i.vendors, 0)
  const revenue = fees + hours
  const profit = revenue - expenses
  const sums: Sums = { fees, hours, revenue, expenses, profit }
  const declined = invoices.filter((i) => i.status[1] === 'כרטיס נדחה')
  return (
    <>
      <div className="grid cols-4">
        <StatCard label="דמי חברות" figure={money(fees)} note={monthName} onClick={() => setDetail('fees')} />
        <StatCard label="שעות ליווי והעמסות" figure={money(hours)} note="כולל ספקים ודמי ניהול" onClick={() => setDetail('hours')} />
        <StatCard label="הוצאות" figure={money(expenses)} note="מחשבוניות שנסרקו החודש" onClick={() => setDetail('expenses')} />
        <StatCard label="רווח" figure={money(profit)} note={revenue > 0 ? `${((profit / revenue) * 100).toFixed(1)}% מההכנסות` : 'עוד אין הכנסות'} color="var(--success)" onClick={() => setDetail('profit')} />
      </div>

      <PlansAndExtras onPay={setPay} />

      <Card flush>
        <CardHead title={`חשבוניות ${monthName}`}><Button variant="secondary" size="sm" icon="export">ייצוא ל-iCount</Button></CardHead>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>מזמין/ת השירות</th><th>דמי חברות</th><th>שעות ליווי</th><th>ספקים + ניהול</th><th>סה"כ</th><th>סטטוס</th></tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td className="name">{i.orderer}</td>
                  <td className="num nowrap">{money(i.fee)}</td>
                  <td className="num nowrap">{money(i.hours)}</td>
                  <td className="num nowrap">{money(i.vendors)}</td>
                  <td className="num nowrap" style={{ fontWeight: 700 }}>{money(i.total)}</td>
                  <td><Badge tone={i.status[0]}>{i.status[1]}</Badge></td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={6} className="muted">אין עדיין חשבוניות לחודש הזה. הן ייווצרו בסגירת החודש.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {declined.length > 0 && (
        <Callout tone="warning" title="גבייה">
          כרטיס נדחה: {declined.map((i) => `${i.orderer} (${money(i.total)})`).join(' · ')}.
        </Callout>
      )}
    {pay && <PayModal init={pay} onClose={() => setPay(null)} />}
    {detail && <Modal title={TITLES[detail]} onClose={() => setDetail(null)}><DetailBody kind={detail} invoices={invoices} sums={sums} /></Modal>}
    </>
  )
}
