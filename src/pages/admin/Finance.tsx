import { useState } from 'react'
import { Badge, Button, Callout, Card, CardHead, StatCard, isNegative, money } from '../../components/ui'
import { TODAY } from '../../data/model'
import Modal from '../../components/Modal'
import { useStore } from '../../store/AppStore'
import type { InvoiceRow } from '../../data/model'
import { SelectField, TextField } from '../../components/Fields'
import { FixedExpensesEditor, PayrollCard, PriceSheetCard, useMonthData, type MonthData } from './FinanceParts'
import PaymentOptions from '../../components/PaymentOptions'
import { PLAN_RATES, planFromLabel, usePrices } from '../../data/pricing'

type Detail = 'revenue' | 'expenses' | 'profit'
type Pay = { kind: 'monthly' | 'extra'; amount: number; planId: string; clientId: string }

const Row = ({ label, value, faint, total }: { label: string; value: string; faint?: boolean; total?: boolean }) => (
  <div className={`kv ${faint ? 'faint' : ''} ${total ? 'total' : ''}`}><span>{label}</span><span className="v" style={isNegative(value) ? { color: 'var(--danger)' } : undefined}>{value}</span></div>
)

type Sums = { fees: number; hours: number; revenue: number; payroll: number; fixed: number; misc: number; expenses: number; profit: number }

function DetailBody({ kind, invoices, sums, month, onFixedSaved }: { kind: Detail; invoices: InvoiceRow[]; sums: Sums; month: MonthData | null; onFixedSaved: () => void }) {
  if (kind === 'revenue') {
    return (
      <>
        <Row label="דמי חברות" value={money(sums.fees)} />
        <Row label="שעות ליווי, ספקים ודמי ניהול" value={money(sums.hours)} />
        <Row total label="סה&quot;כ הכנסות החודש" value={money(sums.revenue)} />
        <div className="table-wrap"><table>
          <thead><tr><th>מזמין/ת השירות</th><th>דמי חברות</th><th>שעות ליווי</th><th>ספקים + ניהול</th></tr></thead>
          <tbody>
            {invoices.map((i) => <tr key={i.id}><td className="name">{i.orderer}</td><td className="num nowrap">{money(i.fee)}</td><td className="num nowrap">{money(i.hours)}</td><td className="num nowrap">{money(i.vendors)}</td></tr>)}
            {invoices.length === 0 && <tr><td colSpan={4} className="muted">אין עדיין חשבוניות החודש.</td></tr>}
          </tbody>
        </table></div>
      </>
    )
  }
  if (kind === 'expenses') {
    return (
      <>
        <Row label="שכר עובדים" value={money(sums.payroll)} />
        <Row label="הוצאות קבועות" value={money(sums.fixed)} />
        <Row label="הוצאות שונות (חשבוניות שנסרקו)" value={money(sums.misc)} />
        <Row total label="סה&quot;כ הוצאות החודש" value={money(sums.expenses)} />
        <hr style={{ margin: '16px 0', border: 0, borderTop: '1px solid var(--border-hair)' }} />
        <FixedExpensesEditor rows={month?.fixed ?? []} onSaved={onFixedSaved} />
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

const TITLES: Record<Detail, string> = { revenue: 'הכנסות', expenses: 'הוצאות', profit: 'רווח' }

function PayModal({ init, onClose }: { init: Pay; onClose: () => void }) {
  const { clients } = useStore()
  const [kind, setKind] = useState(init.kind)
  const [clientId, setClientId] = useState(init.clientId)
  const [planId, setPlanId] = useState(init.planId)
  const [amount, setAmount] = useState(init.amount ? String(init.amount) : '')
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
  usePrices()
  const { invoices } = useStore()
  const [detail, setDetail] = useState<Detail | null>(null)
  const [pay, setPay] = useState<Pay | null>(null)
  const [version, setVersion] = useState(0)
  const month = TODAY.slice(0, 7)
  const monthName = new Date(`${month}-01T12:00:00`).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
  const data = useMonthData(month, version)
  const refresh = () => setVersion((n) => n + 1)

  const fees = invoices.reduce((a, i) => a + i.fee, 0)
  const hours = invoices.reduce((a, i) => a + i.hours + i.vendors, 0)
  const revenue = fees + hours
  const expenses = (data?.payroll ?? 0) + (data?.fixedTotal ?? 0) + (data?.misc ?? 0)
  const profit = revenue - expenses
  const sums: Sums = { fees, hours, revenue, payroll: data?.payroll ?? 0, fixed: data?.fixedTotal ?? 0, misc: data?.misc ?? 0, expenses, profit }
  const declined = invoices.filter((i) => i.status[1] === 'כרטיס נדחה')
  const openPay = (kind: 'monthly' | 'extra') => setPay({ kind, amount: kind === 'monthly' ? PLAN_RATES[0].fee : 0, planId: PLAN_RATES[0].id, clientId: '' })
  return (
    <>
      <div className="grid cols-3">
        <StatCard label="הכנסות" figure={money(revenue)} note={`${monthName} · מ-1 עד סוף החודש`} onClick={() => setDetail('revenue')} />
        <StatCard label="הוצאות" figure={money(expenses)} note="שכר עובדים, הוצאות קבועות ושונות" onClick={() => setDetail('expenses')} />
        <StatCard label="רווח" figure={money(profit)} note={revenue > 0 ? `${((profit / revenue) * 100).toFixed(1)}% מההכנסות` : 'הכנסות פחות הוצאות'} color="var(--success)" onClick={() => setDetail('profit')} />
      </div>

      <PriceSheetCard onPay={openPay} />

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

      <PayrollCard data={data} monthName={monthName} onChanged={refresh} />

      {declined.length > 0 && (
        <Callout tone="warning" title="גבייה">
          כרטיס נדחה: {declined.map((i) => `${i.orderer} (${money(i.total)})`).join(' · ')}.
        </Callout>
      )}
    {pay && <PayModal init={pay} onClose={() => setPay(null)} />}
    {detail && <Modal title={TITLES[detail]} onClose={() => setDetail(null)}><DetailBody kind={detail} invoices={invoices} sums={sums} month={data} onFixedSaved={refresh} /></Modal>}
    </>
  )
}
