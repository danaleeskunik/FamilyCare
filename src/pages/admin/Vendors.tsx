import { useState } from 'react'
import { Badge, Button, Callout, Card, CardHead, RowActions, StatCard, money } from '../../components/ui'
import { useStore } from '../../store/AppStore'

export default function Vendors() {
  const { vendors, openForm, askDelete } = useStore()
  const frozen = vendors.filter((v) => v.licBad).length
  const [q, setQ] = useState('')
  const rows = vendors.filter((v) => [v.name, v.field, v.area].some((s) => s.includes(q.trim())))

  return (
    <>
      <div className="grid cols-4">
        <StatCard label="ספקים מאושרים" figure={22 + vendors.length} note="ב-11 תחומי מקצוע" />
        <StatCard label="רישיון או ביטוח שפג" figure={frozen} note="מוקפאים עד חידוש" color="var(--danger)" />
        <StatCard label="דירוג ממוצע" figure="4.6" note="מ-146 משובי לקוחות ומלווים" />
        <StatCard label="דמי ניהול שנצברו" figure={money(8940)} note="10% על עבודות קבלנים בספטמבר" />
      </div>

      <Callout tone="warning" title="בקרת רישיונות">
        לטכנאי הגז יוסי בר־און פג תוקף הרישיון ב-31.8, ולמנעולן א. שחר פגה פוליסת צד ג׳. שניהם מוקפאים אוטומטית ולא ניתנים לשיבוץ עד העלאת מסמך מעודכן.
      </Callout>

      <Card flush>
        <CardHead title="מאגר בעלי מקצוע מאושרים">
          <input className="search" placeholder="חיפוש לפי תחום, שם או אזור" aria-label="חיפוש בעלי מקצוע" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button size="sm" icon="plus" onClick={() => openForm('vendor')}>ספק חדש</Button>
        </CardHead>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>בעל מקצוע</th><th>תחום</th><th>אזור</th><th>מחירון מוסכם</th><th>רישיון / ביטוח</th><th>דירוג</th><th>סטטוס</th><th><span className="sr-only">פעולות</span></th></tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600 }}>{v.name}</td>
                  <td>{v.field}</td>
                  <td>{v.area}</td>
                  <td>{v.price}</td>
                  <td style={v.licBad ? { color: 'var(--danger)', fontWeight: 700 } : undefined}>{v.lic}</td>
                  <td className="num" style={{ fontWeight: 700 }}>{v.rating}</td>
                  <td><Badge tone={v.status[0]}>{v.status[1]}</Badge></td>
                  <td><RowActions what={`הספק ${v.name}`} onEdit={() => openForm('vendor', { id: v.id })} onDelete={() => askDelete('vendor', v.id)} /></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} className="muted">לא נמצאו בעלי מקצוע. אפשר לנסות תחום אחר או להוסיף ספק חדש.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <Card>
          <div className="card-title" style={{ marginBottom: 6 }}>איך מחושב החיוב ללקוח</div>
          <div className="kv"><span>עלות בעל המקצוע</span><span className="v">{money(1000)}</span></div>
          <div className="kv faint"><span>תוספת זמינות 10%</span><span className="v">{money(100)}</span></div>
          <div className="kv faint"><span>דמי ניהול 10%</span><span className="v">{money(110)}</span></div>
          <div className="kv"><span>ליווי נציג — שעה ראשונה {money(300)} + נוספת {money(250)}</span><span className="v">{money(550)}</span></div>
          <div className="kv total"><span>סה"כ ללקוח</span><span className="v">{money(1760)}</span></div>
        </Card>
        <Card>
          <div className="card-title" style={{ marginBottom: 10 }}>משובי איכות אחרונים</div>
          <div className="stack" style={{ gap: 10, marginBottom: 12 }}>
            <div><div style={{ fontWeight: 700 }}>אבי מזרחי · תיקון נזילה אצל שרה לוי</div><div className="muted">5.0 — הגיע בזמן, ניקה אחריו. המלווה אישרה.</div></div>
            <div><div style={{ fontWeight: 700 }}>קור־טק · תיקון מזגן אצל חנה פלד</div><div className="muted">3.8 — איחור של שעה. נשלחה הערה לספק.</div></div>
          </div>
          <Button variant="secondary" size="sm">כל דוחות התחקיר</Button>
        </Card>
      </div>
    </>
  )
}
