import { Badge, Button, Callout, Card, CardHead, RowActions, StatCard, money } from '../../components/ui'
import { TODAY } from '../../data/model'
import { useStore } from '../../store/AppStore'
import RegionFilter from '../../components/RegionFilter'
import DaySummary from './DaySummary'

function countBy(list: { region: string }[]) {
  const m: Record<string, number> = {}
  for (const t of list) m[t.region] = (m[t.region] ?? 0) + 1
  return m
}

export default function Board() {
  const { tasks, regions, regionFilter: region, setRegionFilter: setRegion, openForm, askDelete } = useStore()
  const today = tasks.filter((t) => t.date === TODAY).sort((a, b) => a.time.localeCompare(b.time))
  // Empty selection = all regions.
  const rows = region.length ? today.filter((t) => region.includes(t.region)) : today
  const unassigned = tasks.filter((t) => !t.who)
  const unassignedToday = today.filter((t) => !t.who)
  const unassignedNote = unassignedToday.length === 0 ? 'אף אחת מהן לא להיום'
    : unassignedToday.length === 1 ? `אחת מהן להיום ${unassignedToday[0].time}` : `${unassignedToday.length} מהן להיום`

  return (
    <>
      <div className="grid cols-4">
        <StatCard label="משימות היום" figure={4 + today.length} note={`4 הושלמו · ${today.length} בהמשך היום`} />
        <StatCard label="ממתין לשיבוץ" figure={2 + unassigned.length} note={unassignedNote} color="var(--danger)" />
        <StatCard label="חריגות פתוחות" figure="2" note="דורשות תחקיר ומענה למשפחה" color="var(--warning)" />
        <StatCard label="הכנסות ספטמבר" figure={money(112400)} note="דמי חברות + העמסות" />
      </div>

      <Callout tone="warning" title="דורש החלטה עכשיו">
        מרים אדלר — הדרכת WhatsApp ב-16:00 עדיין ללא מלווה. שני מלווים זמינים באזור הרצליה. דניאל כ. דיווח על ירידה בתיאבון אצל יעקב ברנע — ממתין לפתיחת תחקיר.
      </Callout>

      <Card flush>
        <CardHead title="משימות היום">
          <RegionFilter regions={regions.map((r) => r.name)} counts={countBy(today)} selected={region} onChange={setRegion} />
        </CardHead>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>שעה</th><th>עיר</th><th>לקוח/ה</th><th>משימה</th><th>מלווה / ספק</th><th>סטטוס</th><th><span className="sr-only">פעולות</span></th></tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td className="num">{t.time}</td>
                  <td>{t.region}</td>
                  <td className="name">{t.client}</td>
                  <td>{t.task}</td>
                  <td>{t.who ?? <span style={{ color: 'var(--danger)', fontWeight: 500 }}>ללא שיבוץ</span>}</td>
                  <td>{t.status ? <Badge tone={t.status[0]}>{t.status[1]}</Badge> : <button className="pill-action" onClick={() => openForm('task', { id: t.id })}>שיבוץ</button>}</td>
                  <td><RowActions what={`המשימה ${t.task} של ${t.client}`} onEdit={() => openForm('task', { id: t.id })} onDelete={() => askDelete('task', t.id)} /></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} style={{ color: 'var(--ink-2)' }}>אין משימות בערים שנבחרו היום. אפשר לבחור עיר אחרת או ליצור משימה חדשה.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <DaySummary />

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
