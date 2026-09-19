import { useMemo, useState } from 'react'
import { Badge, Button, Callout, Card, Icon } from '../../components/ui'
import { useStore } from '../../store/AppStore'
import { DAY_NAMES, addDays, formatDM, parseISO, startOfWeek, toISO } from '../../lib/dates'
import { TODAY, type Slot, type Staff, type Task } from '../../data/model'
import { shortName } from '../../lib/queries'

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
const span = (start: string, end: string | null) => [toMin(start), end ? toMin(end) : toMin(start) + 120] as const
const overlaps = (a: readonly [number, number], b: readonly [number, number]) => a[0] < b[1] && b[0] < a[1]

export default function Schedule() {
  const { tasks, staff, slots, clients, assignSlot, generateNow, openForm } = useStore()
  const [anchor, setAnchor] = useState(parseISO(TODAY))
  const weekStart = startOfWeek(anchor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const dayIsos = days.map(toISO)

  const weekTasks = tasks.filter((t) => t.date >= dayIsos[0] && t.date <= dayIsos[6] && t.statusKey !== 'cancelled')
  // A visit clashes when the same companion has another visit overlapping it on the same day.
  const clashing = useMemo(() => {
    const ids = new Set<string>()
    const byStaffDay = new Map<string, Task[]>()
    for (const t of weekTasks) if (t.staffId) byStaffDay.set(`${t.staffId}|${t.date}`, [...(byStaffDay.get(`${t.staffId}|${t.date}`) ?? []), t])
    for (const list of byStaffDay.values())
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++)
        if (overlaps(span(list[i].time, list[i].end || null), span(list[j].time, list[j].end || null))) { ids.add(list[i].id); ids.add(list[j].id) }
    return ids
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, anchor])

  const horizon = toISO(addDays(parseISO(TODAY), 35))
  /** Ranked suggestions for a slot: same region, the client's regular companion, and no time clash. */
  const suggest = (slot: Slot) => {
    const client = clients.find((c) => c.id === slot.clientId)
    const want = span(slot.start, slot.end)
    const ranked = staff.map((s: Staff) => {
      const clash = tasks.some((t) => t.staffId === s.id && t.date >= TODAY && t.date <= horizon && t.slotId !== slot.id && t.statusKey !== 'cancelled'
        && parseISO(t.date).getDay() === slot.weekday && overlaps(want, span(t.time, t.end || null)))
      const region = !!client && s.regionNames.includes(client.region)
      const regular = client?.companionId === s.id
      return { s, clash, score: (clash ? -10 : 3) + (region ? 2 : 0) + (regular ? 2 : 0), region, regular }
    })
    return ranked.filter((r) => !r.clash).sort((a, b) => b.score - a.score).slice(0, 3)
  }

  const unassigned = slots.filter((s) => s.active && !s.staffId)
  const rows: { key: string; label: string; staffId: string | null }[] = [
    ...staff.map((s) => ({ key: s.id, label: s.name, staffId: s.id })),
    { key: 'none', label: 'ללא שיבוץ', staffId: null },
  ]

  return (
    <>
      <Card flush>
        <div className="card-head">
          <div className="row" style={{ gap: 6 }}>
            <button className="icon-btn" aria-label="שבוע קודם" onClick={() => setAnchor(addDays(anchor, -7))}><Icon name="chevron-right" /></button>
            <h2 style={{ minWidth: 150, textAlign: 'center' }} aria-live="polite">{formatDM(days[0])} – {formatDM(days[6])}</h2>
            <button className="icon-btn" aria-label="שבוע הבא" onClick={() => setAnchor(addDays(anchor, 7))}><Icon name="chevron-left" /></button>
            <Button variant="secondary" size="sm" onClick={() => setAnchor(parseISO(TODAY))}>השבוע</Button>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={generateNow}>עדכון לו"ז לחודש הקרוב</Button>
            <Button size="sm" icon="plus" onClick={() => openForm('slot')}>ביקור קבוע חדש</Button>
          </div>
        </div>
        <p className="card-meta" style={{ padding: '10px 18px' }}>ביקורים נוצרים אוטומטית מהביקורים הקבועים של הלקוחות, עד חודש קדימה. חפיפה בשעות של אותו מלווה מסומנת באדום.</p>
        <div className="cal-scroll">
          <table style={{ minWidth: 980 }}>
            <thead>
              <tr>
                <th style={{ width: 150 }}>מלווה/ת</th>
                {days.map((d, i) => <th key={i} className={dayIsos[i] === TODAY ? 'today-col' : ''}>{DAY_NAMES[i]} <span className="num">{formatDM(d)}</span></th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td style={{ fontWeight: 700, verticalAlign: 'top' }}>{r.label}</td>
                  {dayIsos.map((iso) => {
                    const list = weekTasks.filter((t) => t.date === iso && (r.staffId ? t.staffId === r.staffId : !t.staffId)).sort((a, b) => a.time.localeCompare(b.time))
                    return (
                      <td key={iso} style={{ verticalAlign: 'top', minWidth: 120 }}>
                        <div className="stack" style={{ gap: 4 }}>
                          {list.map((t) => (
                            <button key={t.id} type="button" className={`evt ${clashing.has(t.id) || !t.staffId ? 'open' : ''}`} onClick={() => openForm('task', { id: t.id })}
                              aria-label={`עריכת ביקור: ${t.client}, ${t.time}${clashing.has(t.id) ? ', חפיפה בשעות' : ''}`}>
                              <div className="t">{t.time}{t.end ? `–${t.end}` : ''}</div>
                              <div>{t.client}</div>
                              <div className="w">{t.task}</div>
                              {clashing.has(t.id) && <div style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 11.5 }}>חפיפה בשעות</div>}
                            </button>
                          ))}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card flush>
        <div className="card-head"><h2>ביקורים קבועים ללא מלווה/ת</h2><Badge tone={unassigned.length ? 'red' : 'green'}>{unassigned.length}</Badge></div>
        {unassigned.length === 0 ? (
          <p className="muted" style={{ padding: 18 }}>לכל הביקורים הקבועים יש מלווה/ת. ביקור קבוע חדש אפשר להוסיף כאן או בתיק הלקוח.</p>
        ) : (
          <div className="stack" style={{ padding: 18, gap: 12 }}>
            {unassigned.map((sl) => {
              const options = suggest(sl)
              return (
                <div key={sl.id} className="item-box">
                  <div style={{ fontWeight: 800 }}>{sl.client} · {DAY_NAMES[sl.weekday]} {sl.start}{sl.end ? `–${sl.end}` : ''}</div>
                  <div className="card-meta" style={{ marginBottom: 8 }}>{sl.purpose || 'ביקור'}</div>
                  <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                    {options.length === 0 && <span className="card-meta">אין מלווה/ת פנוי/ה בשעה הזו. אפשר לבחור ידנית:</span>}
                    {options.map(({ s, region, regular }) => (
                      <Button key={s.id} variant="secondary" size="sm" onClick={() => assignSlot(sl.id, s.id)}>
                        {shortName(s.name)} — {[regular && 'קבועה', region && 'אזור תואם', 'פנוי/ה'].filter(Boolean).join(' · ')}
                      </Button>
                    ))}
                    <select className="input" style={{ width: 'auto', minWidth: 150 }} aria-label={`שיבוץ ידני, ${sl.client}`} value="" onChange={(e) => e.target.value && assignSlot(sl.id, e.target.value)}>
                      <option value="">בחירה ידנית…</option>
                      {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
      <Callout title="איך זה עובד">
        לכל לקוח/ה מגדירים ביקורים קבועים (יום, שעות ומטרה) בתיק הלקוח. המערכת יוצרת מהם ביקורים לחודש הקרוב, והמלווה/ת רואה אותם באפליקציה. שינוי בביקור קבוע מתעדכן בביקורים העתידיים שלא נגעו בהם ידנית.
      </Callout>
    </>
  )
}
