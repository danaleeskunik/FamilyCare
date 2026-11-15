import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, CardHead, Ltr, RowActions, StatCard } from '../../components/ui'
import { useStore } from '../../store/AppStore'

export default function Clients() {
  const { clients, openForm, askDelete } = useStore()
  const trial = clients.filter((c) => c.plan[1] === 'תקופת היכרות').length
  const usage = clients.map((c) => c.used.split('/').map((x) => parseFloat(x))).filter(([u, t]) => t > 0 && !Number.isNaN(u))
  const quota = usage.length ? Math.round((usage.reduce((a, [u, t]) => a + u / t, 0) / usage.length) * 100) : null
  const [q, setQ] = useState('')
  const rows = clients.filter((c) => [c.name, c.area, c.plan[1]].some((s) => s.includes(q.trim())))

  return (
    <>
      <div className="grid cols-3">
        <StatCard label="לקוחות פעילים" figure={clients.length} note="יעד שנתיים: 100 משפחות" />
        <StatCard label="בתקופת היכרות" figure={trial} note="חודש ראשון ללא התחייבות" />
        <StatCard label="ניצול מכסה ממוצע" figure={quota === null ? '—' : `${quota}%`} note="מהמפגשים שבמסלול נוצלו החודש" />
      </div>

      <Card flush>
        <CardHead title="כל הלקוחות">
          <input className="search" placeholder="חיפוש לפי שם, אזור או מסלול" aria-label="חיפוש לקוחות" value={q} onChange={(e) => setQ(e.target.value)} />
          <Link className="btn secondary sm" to="/admin/questionnaire">מילוי שאלון</Link>
          <Button size="sm" icon="plus" onClick={() => openForm('client')}>לקוח/ה חדש/ה</Button>
        </CardHead>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>לקוח/ה</th><th>גיל</th><th>אזור</th><th>מסלול</th><th>מפגשים</th><th>מלווה קבוע/ה</th><th>מזמין/ת השירות</th><th>הביקור הבא</th><th><span className="sr-only">פעולות</span></th></tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="name"><Link to={`/admin/clients/${c.id}`}>{c.name}</Link></td>
                  <td className="num">{c.age}</td>
                  <td>{c.area}</td>
                  <td><Badge tone={c.plan[0]}>{c.plan[1]}</Badge></td>
                  <td><Ltr>{c.used}</Ltr></td>
                  <td>{c.companion ?? <span style={{ color: 'var(--danger)', fontWeight: 500 }}>אין מלווה קבועה</span>}</td>
                  <td>{c.orderer}</td>
                  <td>{c.next}</td>
                  <td><RowActions what={`הלקוח/ה ${c.name}`} onEdit={() => openForm('client', { id: c.id })} onDelete={() => askDelete('client', c.id)} /></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={9} className="muted">לא נמצאו לקוחות. אפשר לנסות שם אחר או להוסיף לקוח/ה חדש/ה.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
