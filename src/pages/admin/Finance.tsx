import { useState } from 'react'
import { Badge, Button, Callout, Card, CardHead, Progress, StatCard, money } from '../../components/ui'
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

function DetailBody({ kind, invoices }: { kind: Detail; invoices: InvoiceRow[] }) {
  if (kind === 'fees') {
    const plans = [['בסיסי', 5, 1600], ['פלטינום', 7, 3500], ['טופ פלטינום', 2, 10000]] as const
    return (
      <>
        {plans.map(([n, c, p]) => <Row key={n} label={`${n} · ${c} לקוחות × ${money(p)}`} value={money(c * p)} />)}
        <Row total label="סה&quot;כ דמי חברות" value={money(52500)} />
        <Note>הסליקה האוטומטית בוצעה ב-1.9. נתוני דמו.</Note>
      </>
    )
  }
  if (kind === 'hours') {
    return (
      <>
        <Row label="דמי ניהול — 10% על עבודות קבלנים" value={money(8940)} />
        <Row label="שעות ליווי, קבלנים ונסיעות" value={money(50960)} />
        <Row total label="סה&quot;כ שעות ליווי והעמסות" value={money(59900)} />
        <div className="card-label" style={{ margin: '16px 0 4px' }}>לפי מזמין/ת שירות — החשבוניות שבטבלה</div>
        <div className="table-wrap"><table>
          <thead><tr><th>מזמין/ת השירות</th><th>שעות ליווי</th><th>ספקים + ניהול</th></tr></thead>
          <tbody>{invoices.map((i) => <tr key={i.id}><td className="name">{i.orderer}</td><td className="num nowrap">{money(i.hours)}</td><td className="num nowrap">{money(i.vendors)}</td></tr>)}</tbody>
        </table></div>
        <Note>הפירוט לפי מזמינים מכסה רק את החשבוניות בטבלה. נתוני דמו.</Note>
      </>
    )
  }
  if (kind === 'expenses') {
    return (
      <>
        <Row label="שכר מלווים (מוערך, כולל מקדם 1.3 ונסיעות)" value={money(38600)} />
        <Row label="קבלנים, משרד ושיווק" value={money(32600)} />
        <Row total label="סה&quot;כ הוצאות תפעול" value={money(71200)} />
        <Note>הפירוט של קבלנים, משרד ושיווק יתווסף עם חיבור להנהלת החשבונות. נתוני דמו.</Note>
      </>
    )
  }
  return (
    <>
      <Row label="דמי חברות" value={money(52500)} />
      <Row label="שעות ליווי והעמסות" value={money(59900)} />
      <Row label="סה&quot;כ הכנסות" value={money(112400)} />
      <Row faint label="הוצאות תפעול" value={`− ${money(71200)}`} />
      <Row total label="רווח תפעולי" value={money(41200)} />
      <Note>36.6% מההכנסות. נתוני דמו.</Note>
    </>
  )
}

const TITLES: Record<Detail, string> = {
  fees: 'דמי חברות שנגבו', hours: 'שעות ליווי והעמסות', expenses: 'הוצאות תפעול', profit: 'רווח תפעולי',
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
  return (
    <>
      <div className="grid cols-4">
        <StatCard label="דמי חברות שנגבו" figure={money(52500)} note="סליקה אוטומטית ב-1.9" onClick={() => setDetail('fees')} />
        <StatCard label="שעות ליווי והעמסות" figure={money(59900)} note={`כולל ${money(8940)} דמי ניהול`} onClick={() => setDetail('hours')} />
        <StatCard label="הוצאות תפעול" figure={money(71200)} note="שכר, קבלנים, משרד ושיווק" onClick={() => setDetail('expenses')} />
        <StatCard label="רווח תפעולי" figure={money(41200)} note="36.6% מההכנסות" color="var(--success)" onClick={() => setDetail('profit')} />
      </div>

      <PlansAndExtras onPay={setPay} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(640px, 100%), 1fr))', gap: 14, alignItems: 'start' }}>
        <Card flush>
          <CardHead title="חשבוניות ספטמבר"><Button variant="secondary" size="sm" icon="export">ייצוא ל-iCount</Button></CardHead>
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

        <div className="stack">
          <Card>
            <div className="card-title" style={{ marginBottom: 12 }}>רווחיות לפי מסלול</div>
            <div className="stack" style={{ gap: 12 }}>
              {[['בסיסי · 5 לקוחות', 22, '#9CC7F5'], ['פלטינום · 7 לקוחות', 38, '#16A5A0'], ['טופ פלטינום · 2 לקוחות', 45, '#0E4F4C']].map(([l, p, c]) => (
                <div key={l as string}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 5, fontWeight: 600 }}>
                    <span>{l}</span><span className="num" style={{ fontWeight: 800 }}>{p}%</span>
                  </div>
                  <Progress pct={p as number} color={c as string} />
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="card-title" style={{ marginBottom: 6 }}>ארנק דיגיטלי — קבלות מהשטח</div>
            <div className="kv"><span>קבלות שנסרקו החודש</span><span className="v">37</span></div>
            <div className="kv"><span>סכום מצטבר</span><span className="v">{money(6412)}</span></div>
            <div className="kv"><span>ממתינות לשיוך ללקוח</span><span className="v" style={{ color: 'var(--danger)' }}>4</span></div>
          </Card>
        </div>
      </div>

      <Callout tone="warning" title="גבייה">
        הכרטיס של גלית אדלר נדחה בסליקת ה-1.9. נשלחה בקשה לעדכון אמצעי תשלום; {money(3800)} פתוחים.
      </Callout>
    {pay && <PayModal init={pay} onClose={() => setPay(null)} />}
    {detail && <Modal title={TITLES[detail]} onClose={() => setDetail(null)}><DetailBody kind={detail} invoices={invoices} /></Modal>}
    </>
  )
}
