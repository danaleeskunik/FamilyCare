import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Callout, Card, CardHead, RowActions, StatCard, money } from '../../components/ui'
import { TODAY } from '../../data/model'
import { formatDM, parseISO } from '../../lib/dates'
import { useStore } from '../../store/AppStore'
import RegionFilter from '../../components/RegionFilter'
import DaySummary from './DaySummary'
import PortalInbox from './PortalInbox'

function countBy(list: { region: string }[]) {
  const m: Record<string, number> = {}
  for (const t of list) m[t.region] = (m[t.region] ?? 0) + 1
  return m
}

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }

export default function Board() {
  const { tasks, regions, regionFilter: region, setRegionFilter: setRegion, openForm, askDelete, decisions, pricing } = useStore()
  const nav = useNavigate()
  const [view, setView] = useState<'today' | 'unassigned'>('today')
  const today = tasks.filter((t) => t.date === TODAY).sort((a, b) => a.time.localeCompare(b.time))
  // Upcoming visits nobody has been assigned to.
  const unassigned = tasks.filter((t) => !t.who && t.statusKey !== 'cancelled' && t.date >= TODAY).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
  const base = view === 'today' ? today : unassigned
  // Empty selection = all regions.
  const rows = region.length ? base.filter((t) => region.includes(t.region)) : base
  const completedToday = today.filter((t) => t.statusKey === 'completed').length
  // Visits that ran past the plan by the grace period and still wait for a billing decision.
  const openOvertimeTasks = tasks.filter((t) => t.staffId && t.end && t.checkedIn && t.checkedOut
    && toMin(t.checkedOut) - toMin(t.checkedIn) - (toMin(t.end) - toMin(t.time)) >= pricing.graceMinutes && !decisions[t.id])
  const openOvertime = openOvertimeTasks.length
  const [summaryDay, setSummaryDay] = useState(TODAY)
  // The overrun list shows one day at a time: open the earliest day that still waits for a decision.
  const showOvertime = () => {
    const dates = openOvertimeTasks.map((t) => t.date).sort()
    if (dates.length && !dates.includes(summaryDay)) setSummaryDay(dates[0])
    goTo('day-summary')
  }
  const goTo = (id: string, next?: 'today' | 'unassigned') => {
    if (next) setView(next)
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }
  const unassignedToday = today.filter((t) => !t.who)
  const unassignedNote = unassignedToday.length === 0 ? 'אף אחת מהן לא להיום'
    : unassignedToday.length === 1 ? `אחת מהן להיום ${unassignedToday[0].time}` : `${unassignedToday.length} מהן להיום`

  return (
    <>
      <div className="grid cols-4">
        <StatCard label="משימות היום" figure={today.length} note={`${completedToday} הושלמו · ${today.length - completedToday} בהמשך היום`} onClick={() => goTo('board-tasks', 'today')} />
        <StatCard label="ממתין לשיבוץ" figure={unassigned.length} note={unassignedNote} color="var(--danger)" onClick={() => goTo('board-tasks', 'unassigned')} />
        <StatCard label="חריגות פתוחות" figure={openOvertime} note="ממתינות להחלטת חיוב ושכר" color="var(--warning)" onClick={showOvertime} />
        <StatCard label="הכנסות ספטמבר" figure={money(112400)} note="דמי חברות + העמסות" onClick={() => nav('/admin/finance')} />
      </div>

      <PortalInbox />

      <Callout tone="warning" title="דורש החלטה עכשיו">
        מרים אדלר — הדרכת WhatsApp ב-16:00 עדיין ללא מלווה. שני מלווים זמינים באזור הרצליה. דניאל כ. דיווח על ירידה בתיאבון אצל יעקב ברנע — ממתין לפתיחת תחקיר.
      </Callout>

      <div id="board-tasks" className="anchor">
      <Card flush>
        <CardHead title={view === 'today' ? 'משימות היום' : 'ממתינות לשיבוץ'}>
          {view === 'unassigned' && <Button size="sm" variant="secondary" onClick={() => setView('today')}>חזרה למשימות היום</Button>}
          <RegionFilter regions={regions.map((r) => r.name)} counts={countBy(base)} selected={region} onChange={setRegion} />
        </CardHead>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>שעה</th><th>עיר</th><th>לקוח/ה</th><th>משימה</th><th>מלווה / ספק</th><th>סטטוס</th><th><span className="sr-only">פעולות</span></th></tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td className="num nowrap">{view === 'unassigned' ? `${formatDM(parseISO(t.date))} · ${t.time}` : t.time}</td>
                  <td>{t.region}</td>
                  <td className="name">{t.client}</td>
                  <td>{t.task}</td>
                  <td>{t.who ?? <span style={{ color: 'var(--danger)', fontWeight: 500 }}>ללא שיבוץ</span>}</td>
                  <td>{t.status ? <Badge tone={t.status[0]}>{t.status[1]}</Badge> : <button className="pill-action" onClick={() => openForm('task', { id: t.id })}>שיבוץ</button>}</td>
                  <td><RowActions what={`המשימה ${t.task} של ${t.client}`} onEdit={() => openForm('task', { id: t.id })} onDelete={() => askDelete('task', t.id)} /></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} style={{ color: 'var(--ink-2)' }}>{view === 'today' ? 'אין משימות בערים שנבחרו היום. אפשר לבחור עיר אחרת או ליצור משימה חדשה.' : 'אין ביקורים שממתינים לשיבוץ בערים שנבחרו.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </div>

      <div id="day-summary" className="anchor"><DaySummary day={summaryDay} onDayChange={setSummaryDay} /></div>

      <div className="grid cols-2" style={{ alignItems: 'start' }}>
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
