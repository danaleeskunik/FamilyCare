import { useState } from 'react'
import { Badge, Button, Card, Icon, Ltr, money } from '../../components/ui'
import { useStore } from '../../store/AppStore'
import { addDays, formatDM, parseISO, toISO } from '../../lib/dates'
import { TODAY } from '../../data/model'
import { fmtHours, overtimeCharge } from '../../lib/report'
import { shortName } from '../../lib/queries'

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }

/** End-of-day view: planned time vs time actually spent at the client, with the billing / pay effect of any overrun. */
export default function DaySummary() {
  const { tasks, staff, decisions, pricing, decideOvertime, revertOvertime, notify } = useStore()
  const [day, setDay] = useState(TODAY)
  const [busy, setBusy] = useState<string | null>(null)

  const rows = tasks
    .filter((t) => t.date === day && t.staffId && t.statusKey !== 'cancelled' && t.statusKey !== 'planned' && t.statusKey !== 'confirmed')
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((t) => {
      const planned = t.end ? toMin(t.end) - toMin(t.time) : null
      const actual = t.checkedIn && t.checkedOut ? toMin(t.checkedOut) - toMin(t.checkedIn) : null
      const diff = planned !== null && actual !== null ? actual - planned : null
      const wage = pricing.wage // per-companion rates apply in the monthly report
      return { t, planned, actual, diff, over: diff !== null && diff >= pricing.graceMinutes ? diff : 0, member: staff.find((s) => s.id === t.staffId), wage }
    })

  const totalPlanned = rows.reduce((a, r) => a + (r.planned ?? 0), 0)
  const totalActual = rows.reduce((a, r) => a + (r.actual ?? 0), 0)
  const pending = rows.filter((r) => r.over > 0 && !decisions[r.t.id]).length

  const decide = async (id: string, bill: boolean) => {
    setBusy(id)
    const charge = await decideOvertime(id, bill)
    setBusy(null)
    if (charge !== null) notify(bill ? `הלקוח/ה חויב/ה ב-${money(charge)}` : 'סומן ללא חיוב. המלווה/ת מקבל/ת שכר על כל השעות בפועל.')
  }

  return (
    <Card flush>
      <div className="card-head">
        <h2>תכנון מול ביצוע</h2>
        <div className="row" style={{ gap: 6 }}>
          <button className="icon-btn" aria-label="היום הקודם" onClick={() => setDay(toISO(addDays(parseISO(day), -1)))}><Icon name="chevron-right" /></button>
          <strong style={{ minWidth: 90, textAlign: 'center' }} aria-live="polite">{day === TODAY ? 'היום' : formatDM(parseISO(day))}</strong>
          <button className="icon-btn" aria-label="היום הבא" onClick={() => setDay(toISO(addDays(parseISO(day), 1)))}><Icon name="chevron-left" /></button>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="muted" style={{ padding: 18 }}>עוד אין ביקורים שהתחילו או הסתיימו ביום הזה. בסוף היום יופיע כאן ההפרש בין התכנון לזמן בפועל.</p>
      ) : (
        <>
          <p className="card-meta" style={{ padding: '10px 18px' }}>
            מתוכנן <Ltr>{fmtHours(totalPlanned)}</Ltr> · בפועל <Ltr>{fmtHours(totalActual)}</Ltr>
            {pending > 0 && <> · <strong style={{ color: 'var(--warning)' }}>{pending} תוספות זמן ממתינות להחלטה</strong></>}
          </p>
          <div className="table-wrap">
            <table className="table-plan">
              <colgroup><col style={{ width: '15%' }} /><col style={{ width: '11%' }} /><col style={{ width: '20%' }} /><col style={{ width: '20%' }} /><col style={{ width: '12%' }} /><col style={{ width: '22%' }} /></colgroup>
              <thead><tr><th>לקוח/ה</th><th>מלווה/ת</th><th>מתוכנן<span className="th-sub">שעות · משך</span></th><th>בפועל<span className="th-sub">כניסה–יציאה · משך</span></th><th>הפרש</th><th>חיוב ושכר</th></tr></thead>
              <tbody>
                {rows.map(({ t, planned, actual, diff, over, member, wage }) => {
                  const d = decisions[t.id]
                  return (
                    <tr key={t.id}>
                      <td className="name">{t.client}</td>
                      <td>{member ? shortName(member.name) : '—'}</td>
                      <td className="num nowrap"><Ltr>{t.time}{t.end ? `–${t.end}` : ''}</Ltr>{planned !== null && <div className="card-meta"><Ltr>{fmtHours(planned)}</Ltr></div>}</td>
                      <td className="num nowrap">
                        {t.checkedIn ? <><Ltr>{t.checkedIn}–{t.checkedOut || '…'}</Ltr>{actual !== null ? <div className="card-meta"><Ltr>{fmtHours(actual)}</Ltr></div> : <div className="card-meta">בביקור עכשיו</div>}</> : <span className="muted">אין דיווח</span>}
                      </td>
                      <td className="nowrap" style={{ fontWeight: 500, color: diff === null ? undefined : diff >= pricing.graceMinutes ? 'var(--danger)' : 'var(--ink-2)' }}>
                        {diff === null ? (planned === null ? 'אין שעת סיום מתוכננת' : '—') : diff > 0 ? `+${diff} דק׳` : diff < 0 ? `${diff} דק׳` : 'בדיוק'}
                      </td>
                      <td>
                        {over > 0 ? (
                          d ? (
                            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                              <Badge tone={d.decision === 'billed' ? 'green' : 'neutral'}>{d.decision === 'billed' ? `חויב ${money(d.charge)}` : 'ללא חיוב'}</Badge>
                              <Button size="sm" variant="quiet" disabled={busy === t.id} onClick={async () => { setBusy(t.id); await revertOvertime(t.id); setBusy(null) }}>ביטול</Button>
                            </div>
                          ) : (
                            <div className="stack" style={{ gap: 6 }}>
                              <div className="card-meta">תוספת {over} דק׳ · שכר למלווה/ת על התוספת: {money(Math.round((over / 60) * wage * 100) / 100)}</div>
                              <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                                <Button size="sm" disabled={busy === t.id} onClick={() => decide(t.id, true)}>חיוב הלקוח/ה {money(overtimeCharge(over, pricing))}</Button>
                                <Button size="sm" variant="secondary" disabled={busy === t.id} onClick={() => decide(t.id, false)}>ללא חיוב</Button>
                              </div>
                            </div>
                          )
                        ) : <span className="muted">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="card-meta" style={{ padding: '10px 18px', lineHeight: 1.5 }}>
            תוספת נחשבת מ-{pricing.graceMinutes} דקות מעל התכנון. חיוב הלקוח/ה: {money(pricing.firstHour)} לשעה ראשונה ו-{money(pricing.additionalHour)} לכל שעה נוספת, ביחס לדקות, ונוסף לחשבונית החודש. המלווה/ת מקבל/ת שכר על כל השעות בפועל.
          </p>
        </>
      )}
    </Card>
  )
}
