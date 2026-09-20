import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Callout, Card, CardHead, Ltr, RowActions, StatCard } from '../../components/ui'
import { useStore } from '../../store/AppStore'

export default function Clients() {
  const { clients, openForm, askDelete } = useStore()
  const trial = clients.filter((c) => c.plan[1] === 'תקופת היכרות').length
  const [q, setQ] = useState('')
  const rows = clients.filter((c) => [c.name, c.area, c.plan[1]].some((s) => s.includes(q.trim())))

  return (
    <>
      <div className="grid cols-4">
        <StatCard label="לקוחות פעילים" figure={9 + clients.length} note="יעד שנתיים: 100 משפחות" />
        <StatCard label="בתקופת היכרות" figure={2 + trial} note="חודש ראשון ללא התחייבות" />
        <StatCard label={`ניצול מכסה — ממוצע כל ${9 + clients.length} הלקוחות`} figure="71%" note="מהמפגשים שבמסלול נוצלו החודש" />
        <StatCard label="פגישות היכרות השבוע" figure="2" note="ביקור ראשון חינם" />
      </div>

      <Card flush>
        <CardHead title="כל הלקוחות">
          <input className="search" placeholder="חיפוש לפי שם, אזור או מסלול" aria-label="חיפוש לקוחות" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button size="sm" icon="plus" onClick={() => openForm('client')}>לקוח/ה חדש/ה</Button>
        </CardHead>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>לקוח/ה</th><th>גיל</th><th>אזור</th><th>מסלול</th><th>מפגשים</th><th>מלווה קבוע/ה</th><th>מזמין/ת השירות</th><th>הביקור הבא</th><th /><th><span className="sr-only">פעולות</span></th></tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="name">{c.name}</td>
                  <td className="num">{c.age}</td>
                  <td>{c.area}</td>
                  <td><Badge tone={c.plan[0]}>{c.plan[1]}</Badge></td>
                  <td><Ltr>{c.used}</Ltr></td>
                  <td>{c.companion ?? <span style={{ color: 'var(--danger)', fontWeight: 500 }}>אין מלווה קבועה</span>}</td>
                  <td>{c.orderer}</td>
                  <td>{c.next}</td>
                  <td><Link to={`/admin/clients/${c.id}`}>תיק לקוח</Link></td>
                  <td><RowActions what={`הלקוח/ה ${c.name}`} onEdit={() => openForm('client', { id: c.id })} onDelete={() => askDelete('client', c.id)} /></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={10} className="muted">לא נמצאו לקוחות. אפשר לנסות שם אחר או להוסיף לקוח/ה חדש/ה.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Callout tone="tip" title="לטיפול השבוע">
        מרים אדלר עדיין ללא מלווה קבועה אחרי שישה מפגשים — כדאי לקבע התאמה. אריה גולן מסיים תקופת היכרות ב-30.9 וצריך שיחת המשך לבחירת מסלול.
      </Callout>
    </>
  )
}
