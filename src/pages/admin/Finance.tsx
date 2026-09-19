import { Badge, Button, Callout, Card, CardHead, Progress, StatCard, money } from '../../components/ui'
import { invoices } from '../../data/mock'

export default function Finance() {
  return (
    <>
      <div className="grid cols-4">
        <StatCard label="דמי חברות שנגבו" figure={money(52500)} note="סליקה אוטומטית ב-1.9" />
        <StatCard label="שעות ליווי והעמסות" figure={money(59900)} note={`כולל ${money(8940)} דמי ניהול`} />
        <StatCard label="הוצאות תפעול" figure={money(71200)} note="שכר, קבלנים, משרד ושיווק" />
        <StatCard label="רווח תפעולי" figure={money(41200)} note="36.6% מההכנסות" color="var(--success)" />
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
                  <tr key={i.orderer}>
                    <td style={{ fontWeight: 600 }}>{i.orderer}</td>
                    <td className="num nowrap">{money(i.fee)}</td>
                    <td className="num nowrap">{money(i.hours)}</td>
                    <td className="num nowrap">{money(i.vendors)}</td>
                    <td className="num nowrap" style={{ fontWeight: 700 }}>{money(i.total)}</td>
                    <td><Badge tone={i.status[0]}>{i.status[1]}</Badge></td>
                  </tr>
                ))}
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
    </>
  )
}
