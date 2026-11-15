import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Badge, Button, Callout, Card, CardHead, RowActions, StatCard, money } from '../../components/ui'
import { useStore } from '../../store/AppStore'

export default function Vendors() {
  const { vendors, openForm, askDelete } = useStore()
  const frozen = vendors.filter((v) => v.licBad).length
  const rated = vendors.map((v) => Number(v.rating)).filter((n) => !Number.isNaN(n))
  const avg = rated.length ? (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1) : '—'
  const [q, setQ] = useState('')
  const rows = vendors.filter((v) => [v.name, v.field, v.area].some((s) => s.includes(q.trim())))

  return (
    <>
      <div className="grid cols-3">
        <StatCard label="ספקים מאושרים" figure={vendors.length} note={`ב-${new Set(vendors.map((v) => v.field).filter(Boolean)).size} תחומי מקצוע`} />
        <StatCard label="רישיון או ביטוח שפג" figure={frozen} note="מוקפאים עד חידוש" color="var(--danger)" />
        <StatCard label="דירוג ממוצע" figure={avg} note={`מ-${rated.length} ספקים עם דירוג`} />
      </div>

      {frozen > 0 && (
        <Callout tone="warning" title="בקרת רישיונות">
          {vendors.filter((v) => v.licBad).map((v) => `${v.name} (${v.lic})`).join(' · ')} — מוקפאים ולא נשלחים ללקוחות עד חידוש.
        </Callout>
      )}

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
                  <td className="name"><Link to={`/admin/vendors/${v.id}`} aria-label={`תיק הספק ${v.name}`}>{v.name}</Link></td>
                  <td>{v.field}</td>
                  <td>{v.area}</td>
                  <td>{v.price}</td>
                  <td style={v.licBad ? { color: 'var(--danger)', fontWeight: 500 } : undefined}>{v.lic}</td>
                  <td className="num">{v.rating}</td>
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
      </div>
    </>
  )
}
