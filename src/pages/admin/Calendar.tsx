import { useMemo, useState } from 'react'
import { Button, Card, Icon } from '../../components/ui'
import { useStore } from '../../store/AppStore'
import { DAY_NAMES, addDays, formatDM, monthLabel, parseISO, startOfWeek, toISO } from '../../lib/dates'
import { TODAY, type Task } from '../../data/mock'

type View = 'week' | 'month'

export default function Calendar() {
  const { tasks, openForm } = useStore()
  const [view, setView] = useState<View>('week')
  const [anchor, setAnchor] = useState(parseISO(TODAY))

  const byDate = useMemo(() => {
    const m = new Map<string, Task[]>()
    for (const t of [...tasks].sort((a, b) => a.time.localeCompare(b.time))) m.set(t.date, [...(m.get(t.date) ?? []), t])
    return m
  }, [tasks])

  const step = (dir: 1 | -1) =>
    setAnchor((a) => (view === 'week' ? addDays(a, 7 * dir) : new Date(a.getFullYear(), a.getMonth() + dir, 1)))

  const weekStart = startOfWeek(anchor)
  const title = view === 'week'
    ? `${formatDM(weekStart)} – ${formatDM(addDays(weekStart, 6))} · ${monthLabel(addDays(weekStart, 3))}`
    : monthLabel(anchor)

  return (
    <Card flush>
      <div className="card-head">
        <div className="cal-toolbar" style={{ width: '100%' }}>
          <div className="row" style={{ gap: 6 }}>
            <button className="icon-btn" aria-label={view === 'week' ? 'שבוע קודם' : 'חודש קודם'} onClick={() => step(-1)}><Icon name="chevron-right" /></button>
            <h2 style={{ minWidth: 190, textAlign: 'center' }} aria-live="polite">{title}</h2>
            <button className="icon-btn" aria-label={view === 'week' ? 'שבוע הבא' : 'חודש הבא'} onClick={() => step(1)}><Icon name="chevron-left" /></button>
            <Button variant="secondary" size="sm" onClick={() => setAnchor(parseISO(TODAY))}>היום</Button>
          </div>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <div className="seg" role="group" aria-label="תצוגה">
              <button aria-pressed={view === 'week'} onClick={() => setView('week')}>שבוע</button>
              <button aria-pressed={view === 'month'} onClick={() => setView('month')}>חודש</button>
            </div>
            <Button size="sm" icon="plus" onClick={() => openForm('task', { date: toISO(anchor) })}>משימה חדשה</Button>
          </div>
        </div>
      </div>

      <div className="cal-scroll">
        {view === 'week' ? (
          <div className="week">
            {Array.from({ length: 7 }, (_, i) => {
              const d = addDays(weekStart, i)
              const iso = toISO(d)
              const list = byDate.get(iso) ?? []
              return (
                <section key={iso} className={`day ${iso === TODAY ? 'today' : ''}`} aria-label={`${DAY_NAMES[i]} ${formatDM(d)}`}>
                  <div className="day-head"><span>{DAY_NAMES[i]}</span><span className="num">{formatDM(d)}</span></div>
                  <div className="day-body">
                    {list.map((t) => (
                      <div key={t.id} className={`evt ${t.who ? '' : 'open'}`}>
                        <div className="t">{t.time}</div>
                        <div>{t.client} — {t.task}</div>
                        <div className="w" style={t.who ? undefined : { color: 'var(--danger)', fontWeight: 700 }}>{t.who ?? 'ללא שיבוץ'}</div>
                      </div>
                    ))}
                    {list.length === 0 && <div className="card-meta">אין משימות</div>}
                  </div>
                </section>
              )
            })}
          </div>
        ) : (
          <MonthGrid anchor={anchor} byDate={byDate} onPick={(d) => { setAnchor(d); setView('week') }} />
        )}
      </div>
    </Card>
  )
}

function MonthGrid({ anchor, byDate, onPick }: { anchor: Date; byDate: Map<string, Task[]>; onPick: (d: Date) => void }) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const start = startOfWeek(first)
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
  const weeks = Math.ceil((last.getDate() + first.getDay()) / 7)

  return (
    <div className="month">
      {DAY_NAMES.map((n) => <div key={n} className="month-dow">{n}</div>)}
      {Array.from({ length: weeks * 7 }, (_, i) => {
        const d = addDays(start, i)
        const iso = toISO(d)
        const list = byDate.get(iso) ?? []
        const inMonth = d.getMonth() === anchor.getMonth()
        return (
          <button
            key={iso}
            className={`cell ${inMonth ? '' : 'dim'} ${iso === TODAY ? 'today' : ''}`}
            aria-label={`${d.getDate()} ${monthLabel(d)}, ${list.length} משימות. לפתיחת השבוע`}
            onClick={() => onPick(d)}
          >
            <span className="d">{d.getDate()}</span>
            {list.slice(0, 3).map((t) => <span key={t.id} className={`m ${t.who ? '' : 'open'}`}>{t.time} {t.client}</span>)}
            {list.length > 3 && <span className="more">+{list.length - 3} נוספות</span>}
          </button>
        )
      })}
    </div>
  )
}
