import { Link } from 'react-router-dom'
import { Badge, Button, Card, CardHead, Ltr, RowActions, StatCard, money } from '../../components/ui'
import { useStore } from '../../store/AppStore'

export default function Staff() {
  const { staff, openForm, askDelete } = useStore()
  return (
    <>
      <div className="grid cols-4">
        <StatCard label="מלווים פעילים" figure={5 + staff.length} note={'2 עו"ס · 5 סטודנטים · 2 מלווים'} />
        <StatCard label="שעות במשמרת היום" figure={<Ltr>21:40</Ltr>} note="6 מלווים בשטח" />
        <StatCard label="שכר מוערך לחודש" figure={money(38600)} note={`כולל מקדם 1.3 ונסיעות ${money(30)} ליום`} />
        <StatCard label="דירוג ממוצע מהמשפחות" figure="4.8" note="מתוך 63 משובים בספטמבר" />
      </div>

      <Card flush>
        <CardHead title="צוות המלווים"><Button size="sm" icon="plus" onClick={() => openForm('staff')}>מלווה חדש/ה</Button></CardHead>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>מלווה</th><th>תפקיד</th><th>אזורים</th><th>שפות</th><th>לקוחות קבועים</th><th>שעות החודש</th><th>זמינות היום</th><th><span className="sr-only">פעולות</span></th></tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td className="name"><Link to={`/admin/staff/${s.id}`} aria-label={`דוח חודשי של ${s.name}`}>{s.name}</Link>{s.email && <div className="card-meta">מחובר/ת לאפליקציה</div>}</td>
                  <td>{s.role}</td>
                  <td>{s.areas}</td>
                  <td>{s.langs}</td>
                  <td>{s.regulars}</td>
                  <td><Ltr>{s.hours}</Ltr></td>
                  <td><Badge tone={s.avail[0]}>{s.avail[1]}</Badge></td>
                  <td><RowActions what={`המלווה ${s.name}`} onEdit={() => openForm('staff', { id: s.id })} onDelete={() => askDelete('staff', s.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <Card>
          <div className="card-title" style={{ marginBottom: 6 }}>חישוב שכר מלווה</div>
          <div className="kv"><span>שכר שעתי (פי 2 ממינימום)</span><span className="v">{money(70)}</span></div>
          <div className="kv faint"><span>מקדם 1.3 — סוציאליות וביטוח לאומי</span><span className="v">{money(91)}</span></div>
          <div className="kv"><span>נסיעות ליום עבודה</span><span className="v">{money(30)}</span></div>
          <div className="kv total"><span>עלות שעת ליווי לחברה</span><span className="v">{money(91)}</span></div>
        </Card>
        <Card>
          <div className="card-title" style={{ marginBottom: 6 }}>התאמת מלווה ללקוח</div>
          <p className="muted" style={{ lineHeight: 1.55, marginBottom: 12 }}>
            השיבוץ מחושב לפי קרבה גיאוגרפית, שפה, מגדר, סוג המשימה והעדפה אישית של הלקוח.
          </p>
          <div className="stack" style={{ gap: 8 }}>
            {[['מרים אדלר · הדרכת WhatsApp 16:00', 'תמר ב. — 1.6 ק"מ'], ['אריה גולן · ביקור חמישי', 'נועה ש. — קבועה']].map(([a, b]) => (
              <div key={a} className="item-box row" style={{ justifyContent: 'space-between', gap: 10 }}>
                <span>{a}</span><span style={{ color: 'var(--brand-link)', fontWeight: 800 }}>{b}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
