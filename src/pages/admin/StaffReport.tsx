/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Callout, Card, Empty, Icon, Ltr, StatCard, money } from '../../components/ui'
import { useStore } from '../../store/AppStore'
import { useAuth } from '../../store/AuthStore'
import { supabase } from '../../lib/supabase'
import { fetchStaffForEdit, loadStaffMonth } from '../../lib/queries'
import { buildMonthReport, fmtHours, payroll, type MonthReport } from '../../lib/report'
import { DAY_NAMES, formatDM, monthLabel, parseISO } from '../../lib/dates'
import { TODAY } from '../../data/model'

const EXP_TONE = { pending: 'orange', approved: 'green', rejected: 'red' } as const
const EXP_LABEL = { pending: 'ממתינה לאישור', approved: 'אושרה', rejected: 'נדחתה' } as const

export default function StaffReport() {
  const { id } = useParams()
  const { staff, pricing, notify } = useStore()
  const { session } = useAuth()
  const member = staff.find((s) => s.id === id)
  const [month, setMonth] = useState(() => new Date(parseISO(TODAY).getFullYear(), parseISO(TODAY).getMonth(), 1))
  const [report, setReport] = useState<MonthReport | null>(null)
  const [wage, setWage] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)
  const [version, setVersion] = useState(0)

  const ym = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-01`
  useEffect(() => {
    if (!id) return
    let cancelled = false
    setFailed(false)
    Promise.all([loadStaffMonth(id, ym), fetchStaffForEdit(id)])
      .then(([m, s]) => {
        if (cancelled) return
        setReport(buildMonthReport(m.tasks, m.expenses, m.decisions))
        setWage(s?.staff.hourly_wage != null ? Number(s.staff.hourly_wage) : null)
      })
      .catch((e) => { console.error('staff report failed', e); if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [id, ym, version])

  const review = async (expenseId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('staff_expenses').update({ status, reviewed_by: session?.user.id ?? null, reviewed_at: new Date().toISOString() }).eq('id', expenseId)
    if (error) { console.error('review failed', error); notify('לא הצלחנו לעדכן את ההוצאה. נסי שוב.'); return }
    setVersion((n) => n + 1)
  }

  if (!member) return <Empty text="לא מצאנו את המלווה/ת הזה/זו." action={<Link to="/admin/staff">חזרה למלווים</Link>} />
  if (failed) return <Callout tone="warning" title="לא הצלחנו לטעון את הדוח">בדקי את החיבור ונסי שוב.</Callout>

  const rate = wage ?? pricing.wage
  const pay = report ? payroll(report, rate, pricing) : null
  const step = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1))

  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="row" style={{ gap: 10 }}>
          <Link to="/admin/staff" className="btn secondary sm"><Icon name="chevron-right" size={16} />למלווים</Link>
          <div>
            <div style={{ font: '800 20px var(--font-ui)' }}>{member.name}</div>
            <div className="card-meta">{member.role} · {member.areas}{member.email ? ' · מחובר/ת לאפליקציה' : ' · עוד לא חובר/ה לאפליקציה'}</div>
          </div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="icon-btn" aria-label="חודש קודם" onClick={() => step(-1)}><Icon name="chevron-right" /></button>
          <strong style={{ minWidth: 120, textAlign: 'center' }} aria-live="polite">{monthLabel(month)}</strong>
          <button className="icon-btn" aria-label="חודש הבא" onClick={() => step(1)}><Icon name="chevron-left" /></button>
        </div>
      </div>

      {!report || !pay ? <p className="muted" role="status">טוענת דוח…</p> : (
        <>
          <div className="grid cols-4">
            <StatCard label="ביקורים החודש" figure={report.visitCount} note="ביקורים שהושלמו" />
            <StatCard label="סה&quot;כ שעות" figure={<Ltr>{fmtHours(report.totalMinutes)}</Ltr>} note="לפי כניסה ויציאה בפועל" />
            <StatCard label="ממוצע לביקור" figure={<Ltr>{fmtHours(report.avgMinutes)}</Ltr>} note={`${report.daysWorked} ימי עבודה`} />
            <StatCard label="הוצאות נוספות" figure={money(report.approvedExpenses + report.pendingExpenses)} note={`מתוכן ${money(report.pendingExpenses)} ממתינות לאישור`} color={report.pendingExpenses ? 'var(--warning)' : undefined} />
          </div>

          {report.missingTimes > 0 && (
            <Callout tone="warning" title="חסרים דיווחי שעות">
              ב-{report.missingTimes} ביקורים שהושלמו אין שעת כניסה ויציאה, ולכן הם לא נספרו בשעות ובשכר. אפשר להשלים אותם בעריכת הביקור (שעת כניסה ושעת יציאה בפועל).
            </Callout>
          )}

          <Card flush>
            <div className="card-head"><h2>איפה עבד/ה החודש</h2></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>לקוח/ה</th><th>כתובת</th><th>ביקורים</th><th>שעות</th></tr></thead>
                <tbody>
                  {report.perClient.map((c) => <tr key={c.clientId}><td style={{ fontWeight: 600 }}>{c.client}</td><td>{c.place || '—'}</td><td className="num">{c.visits}</td><td><Ltr>{fmtHours(c.minutes)}</Ltr></td></tr>)}
                  {report.perClient.length === 0 && <tr><td colSpan={4} className="muted">אין ביקורים שהושלמו בחודש הזה.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>

          <Card flush>
            <div className="card-head"><h2>הביקורים</h2></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>תאריך</th><th>לקוח/ה</th><th>מתוכנן</th><th>בפועל</th><th>שעות</th><th>תוספת</th></tr></thead>
                <tbody>
                  {report.visits.map((v) => (
                    <tr key={v.id}>
                      <td className="nowrap">{DAY_NAMES[parseISO(v.date).getDay()]} {formatDM(parseISO(v.date))}</td>
                      <td style={{ fontWeight: 600 }}>{v.client}</td>
                      <td className="num nowrap"><Ltr>{v.plannedStart}{v.plannedEnd ? `–${v.plannedEnd}` : ''}</Ltr></td>
                      <td className="num nowrap">{v.checkedIn ? <Ltr>{v.checkedIn}–{v.checkedOut || '?'}</Ltr> : <span className="muted">אין דיווח</span>}</td>
                      <td className="num">{v.actualMin === null ? '—' : <Ltr>{fmtHours(v.actualMin)}</Ltr>}</td>
                      <td>{v.overMin ? <>{v.overMin} דק׳ {v.decision === 'billed' ? <Badge tone="green">חויב הלקוח</Badge> : v.decision === 'waived' ? <Badge>ללא חיוב</Badge> : null}</> : '—'}</td>
                    </tr>
                  ))}
                  {report.visits.length === 0 && <tr><td colSpan={6} className="muted">אין ביקורים שהושלמו בחודש הזה.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>

          <Card flush>
            <div className="card-head"><h2>הוצאות נוספות</h2></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>תאריך</th><th>תיאור</th><th>סכום</th><th>סטטוס</th><th><span className="sr-only">פעולות</span></th></tr></thead>
                <tbody>
                  {report.expenses.map((e) => (
                    <tr key={e.id}>
                      <td className="nowrap">{formatDM(parseISO(e.date))}</td>
                      <td>{e.description}</td>
                      <td className="num nowrap">{money(e.amount)}</td>
                      <td><Badge tone={EXP_TONE[e.status]}>{EXP_LABEL[e.status]}</Badge></td>
                      <td>
                        {e.status === 'pending' && (
                          <div className="row" style={{ gap: 6 }}>
                            <Button size="sm" onClick={() => review(e.id, 'approved')}>אישור</Button>
                            <Button size="sm" variant="secondary" onClick={() => review(e.id, 'rejected')}>דחייה</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {report.expenses.length === 0 && <tr><td colSpan={5} className="muted">לא דווחו הוצאות נוספות בחודש הזה.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <div className="card-title" style={{ marginBottom: 6 }}>חישוב שכר — {monthLabel(month)}</div>
            <div className="kv"><span>שעות בפועל <Ltr>{fmtHours(report.totalMinutes)}</Ltr> × {money(rate)} לשעה{wage === null ? ' (ברירת מחדל)' : ''}</span><span className="v">{money(pay.gross)}</span></div>
            <div className="kv"><span>נסיעות: {report.daysWorked} ימי עבודה × {money(pricing.travelPerDay)}</span><span className="v">{money(pay.travel)}</span></div>
            <div className="kv"><span>החזר הוצאות שאושרו</span><span className="v">{money(pay.expenses)}</span></div>
            <div className="kv total"><span>סה&quot;כ לתשלום</span><span className="v">{money(pay.total)}</span></div>
            <div className="kv faint"><span>עלות לחברה (מקדם {pricing.socialFactor} על השכר)</span><span className="v">{money(pay.companyCost)}</span></div>
            <p className="card-meta" style={{ marginTop: 10, lineHeight: 1.5 }}>השכר מחושב לפי השעות בפועל, כולל תוספות זמן שנוצרו בביקור, גם אם הלקוח לא חויב עליהן.</p>
          </Card>
        </>
      )}
    </>
  )
}
