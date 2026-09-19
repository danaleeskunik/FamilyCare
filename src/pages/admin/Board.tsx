import { useState } from 'react'
import { Badge, Button, Callout, Card, CardHead, StatCard, money } from '../../components/ui'
import { boardTasks, regions } from '../../data/mock'

export default function Board() {
  const [region, setRegion] = useState<string | null>('רמת השרון')
  // Region chips are single-select; toggling the active chip shows all regions.
  const rows = region ? boardTasks.filter((t) => t.region === region) : boardTasks

  return (
    <>
      <div className="grid cols-4">
        <StatCard label="משימות היום" figure="9" note="4 הושלמו · 5 בהמשך היום" />
        <StatCard label="ממתין לשיבוץ" figure="3" note="אחת מהן להיום 16:00" color="var(--danger)" />
        <StatCard label="חריגות פתוחות" figure="2" note="דורשות תחקיר ומענה למשפחה" color="var(--warning)" />
        <StatCard label="הכנסות ספטמבר" figure={money(112400)} note="דמי חברות + העמסות" />
      </div>

      <Callout tone="warning" title="דורש החלטה עכשיו">
        מרים אדלר — הדרכת WhatsApp ב-16:00 עדיין ללא מלווה. שני מלווים זמינים באזור הרצליה. דניאל כ. דיווח על ירידה בתיאבון אצל יעקב ברנע — ממתין לפתיחת תחקיר.
      </Callout>

      <Card flush>
        <CardHead title="משימות היום">
          {regions.map((r) => (
            <button key={r} className={`chip ${region === r ? 'active' : ''}`} onClick={() => setRegion(region === r ? null : r)} aria-pressed={region === r}>
              {r}
            </button>
          ))}
        </CardHead>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>שעה</th><th>לקוח/ה</th><th>משימה</th><th>מלווה / ספק</th><th>סטטוס</th></tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.time + t.client}>
                  <td className="num" style={{ fontWeight: 500 }}>{t.time}</td>
                  <td style={{ fontWeight: 600 }}>{t.client}</td>
                  <td>{t.task}</td>
                  <td>{t.who ?? <span style={{ color: 'var(--danger)', fontWeight: 700 }}>ללא שיבוץ</span>}</td>
                  <td>{t.status ? <Badge tone={t.status[0]}>{t.status[1]}</Badge> : <button className="pill-action">שיבוץ</button>}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} style={{ color: 'var(--ink-2)' }}>אין משימות באזור הזה היום. אפשר לבחור אזור אחר או ליצור משימה חדשה.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid cols-3" style={{ alignItems: 'start' }}>
        <Card>
          <div className="card-title" style={{ marginBottom: 8 }}>בקשות חדשות מהמשפחות</div>
          {[['רונית לוי — רופא/ה עד הבית', 'לפני 20 דק׳'], ['משפחת אדלר — כרטיסים לקונצרט', 'אתמול'], ['חנה פלד — הנדימן למעקה', 'אתמול']].map(([a, b]) => (
            <div key={a} className="kv"><span style={{ fontWeight: 600 }}>{a}</span><span className="card-meta">{b}</span></div>
          ))}
        </Card>
        <Card>
          <div className="card-title" style={{ marginBottom: 8 }}>סיכומי ביקור לאישור</div>
          <p className="muted" style={{ lineHeight: 1.55, marginBottom: 12 }}>
            כל שירות נסגר במשוב ותחקיר. 3 סיכומים ממתינים לאישור מנהלת לפני שליחה למשפחה.
          </p>
          <Button variant="secondary" size="sm">מעבר לתור האישורים</Button>
        </Card>
        <Card>
          <div className="card-title" style={{ marginBottom: 8 }}>מסלולים פעילים</div>
          {[['בסיסי · ', 1600, 5], ['פלטינום · ', 3500, 7], ['טופ פלטינום · ', 10000, 2]].map(([n, p, c]) => (
            <div key={n as string} className="kv"><span style={{ fontWeight: 600 }}>{n}{money(p as number)}</span><span className="num" style={{ fontWeight: 700 }}>{c}</span></div>
          ))}
        </Card>
      </div>
    </>
  )
}
