import { Badge, Button, Card, CardHead, Ltr, StatCard, money } from '../../components/ui'
import { staff } from '../../data/mock'

export default function Staff() {
  return (
    <>
      <div className="grid cols-4">
        <StatCard label="מלווים פעילים" figure="9" note={'2 עו"ס · 5 סטודנטים · 2 מלווים'} />
        <StatCard label="שעות במשמרת היום" figure={<Ltr>21:40</Ltr>} note="6 מלווים בשטח" />
        <StatCard label="שכר מוערך לחודש" figure={money(38600)} note={`כולל מקדם 1.3 ונסיעות ${money(30)} ליום`} />
        <StatCard label="דירוג ממוצע מהמשפחות" figure="4.8" note="מתוך 63 משובים בספטמבר" />
      </div>

      <Card flush>
        <CardHead title="צוות המלווים"><Button size="sm" icon="plus">מלווה חדש/ה</Button></CardHead>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>מלווה</th><th>תפקיד</th><th>אזורים</th><th>שפות</th><th>לקוחות קבועים</th><th>שעות החודש</th><th>זמינות היום</th></tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.name}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.role}</td>
                  <td>{s.areas}</td>
                  <td>{s.langs}</td>
                  <td>{s.regulars}</td>
                  <td><Ltr>{s.hours}</Ltr></td>
                  <td><Badge tone={s.avail[0]}>{s.avail[1]}</Badge></td>
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
