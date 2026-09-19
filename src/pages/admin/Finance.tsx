import { useState } from 'react'
import { Badge, Button, Callout, Card, CardHead, Progress, StatCard, money } from '../../components/ui'
import Modal from '../../components/Modal'
import { useStore } from '../../store/AppStore'
import type { InvoiceRow } from '../../data/model'

type Detail = 'fees' | 'hours' | 'expenses' | 'profit'

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
          <tbody>{invoices.map((i) => <tr key={i.id}><td style={{ fontWeight: 600 }}>{i.orderer}</td><td className="num nowrap">{money(i.hours)}</td><td className="num nowrap">{money(i.vendors)}</td></tr>)}</tbody>
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

export default function Finance() {
  const { invoices } = useStore()
  const [detail, setDetail] = useState<Detail | null>(null)
  return (
    <>
      <div className="grid cols-4">
        <StatCard label="דמי חברות שנגבו" figure={money(52500)} note="סליקה אוטומטית ב-1.9" onClick={() => setDetail('fees')} />
        <StatCard label="שעות ליווי והעמסות" figure={money(59900)} note={`כולל ${money(8940)} דמי ניהול`} onClick={() => setDetail('hours')} />
        <StatCard label="הוצאות תפעול" figure={money(71200)} note="שכר, קבלנים, משרד ושיווק" onClick={() => setDetail('expenses')} />
        <StatCard label="רווח תפעולי" figure={money(41200)} note="36.6% מההכנסות" color="var(--success)" onClick={() => setDetail('profit')} />
      </div>

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
                    <td style={{ fontWeight: 600 }}>{i.orderer}</td>
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
    {detail && <Modal title={TITLES[detail]} onClose={() => setDetail(null)}><DetailBody kind={detail} invoices={invoices} /></Modal>}
    </>
  )
}
