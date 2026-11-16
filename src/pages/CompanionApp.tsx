/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Badge, Button, Card, Empty, Icon, Ltr, money } from '../components/ui'
import { TextField, SelectField } from '../components/Fields'
import { supabase } from '../lib/supabase'
import { loadCompanion, loadStaffMonth, localHM, shortName } from '../lib/queries'
import { buildMonthReport, fmtHours, payroll, type MonthReport } from '../lib/report'
import { DAY_NAMES, addDays, formatDM, monthLabel, parseISO, startOfWeek, toISO } from '../lib/dates'
import { TODAY } from '../data/model'
import { useAuth } from '../store/AuthStore'
import { ACCESS } from '../lib/contact'
import { PLAN_RATES } from '../data/pricing'
import { ClientProfile, ExternalRequestDialog, ReportDialog } from './CompanionParts'

type Data = NonNullable<Awaited<ReturnType<typeof loadCompanion>>>
type Tab = 'week' | 'clients' | 'hours'
const one = (v: any) => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null))
const hhmm = (t: string | null) => (t ? t.slice(0, 5) : '')
const mapsUrl = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
const STATUS: Record<string, [string, 'neutral' | 'green' | 'blue' | 'orange' | 'red']> = {
  planned: ['מתוכנן', 'neutral'], confirmed: ['מאושר', 'blue'], in_progress: ['בביקור', 'green'], completed: ['הושלם', 'green'], cancelled: ['בוטל', 'red'],
}

/** previewId = an admin looking at one companion's app exactly as that companion sees it (read only). */
export default function CompanionApp({ previewId }: { previewId?: string } = {}) {
  const { signOut, fullName } = useAuth()
  const preview = !!previewId
  const [tab, setTab] = useState<Tab>('week')
  const [data, setData] = useState<Data | null | undefined>(undefined)
  const [failed, setFailed] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setData(await loadCompanion(toISO(addDays(parseISO(TODAY), -40)), toISO(addDays(parseISO(TODAY), 40)), previewId))
      setFailed(false)
    } catch (e) { console.error('companion load failed', e); setFailed(true) }
  }, [previewId])
  useEffect(() => { void load() }, [load])

  const flash = (m: string) => { setNote(m); window.setTimeout(() => setNote(null), 4000) }

  return (
    <div className="mobile companion" style={{ maxWidth: 520 }}>
      {preview && (
        <div role="status" style={{ background: '#FFF4E5', color: '#7A4A00', padding: '10px 16px', textAlign: 'center', fontWeight: 600, borderRadius: 12, marginBottom: 8 }}>
          תצוגת מנהל בקריאה בלבד: כך המלווה/ת רואה את האפליקציה. {' '}
          <a href="/admin/staff" style={{ color: 'inherit', textDecoration: 'underline' }}>חזרה למלווים</a>
        </div>
      )}
      <div className="hero">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ font: '800 17px var(--font-ui)' }}>שלום {data ? shortName(data.me.full_name).split(' ')[0] : fullName.split(' ')[0]}</div>
            <div style={{ font: '500 13px var(--font-ui)', color: 'var(--on-brand-2)' }}>{DAY_NAMES[parseISO(TODAY).getDay()]} {formatDM(parseISO(TODAY))}</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <img src={`${import.meta.env.BASE_URL}brand/logo-white.png`} height={30} alt="Family Care — always with you" />
            {!preview && <Button variant="on-navy" size="sm" onClick={signOut}>יציאה</Button>}
          </div>
        </div>
      </div>

      <div className="seg" role="group" aria-label="תצוגה" style={{ alignSelf: 'stretch' }}>
        {([['week', 'הלו"ז שלי'], ['clients', 'הלקוחות שלי'], ['hours', 'האזור האישי']] as [Tab, string][]).map(([k, label]) => (
          <button key={k} aria-pressed={tab === k} style={{ flex: 1 }} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      {note && <div className="notice" role="status">{note}</div>}

      {failed && <Card><p style={{ fontWeight: 700 }}>לא הצלחנו לטעון את הנתונים.</p><p className="muted" style={{ margin: '6px 0 10px' }}>בדקי את החיבור לאינטרנט.</p><Button size="sm" onClick={() => void load()}>ניסיון חוזר</Button></Card>}
      {data === undefined && !failed && <p className="muted" role="status">טוענת…</p>}
      {data === null && <Empty text="החשבון שלך מחובר, אבל עוד לא שויך לכרטיס מלווה/ת. אפשר לפנות למשרד." />}
      {data && tab === 'week' && <Week data={data} reload={load} flash={flash} preview={preview} />}
      {data && tab === 'clients' && <ByClient data={data} flash={flash} preview={preview} />}
      {data && tab === 'hours' && <Hours data={data} flash={flash} preview={preview} />}
    </div>
  )
}

// ---------------------------------------------------------------- Week
function Week({ data, reload, flash, preview }: { data: Data; reload: () => Promise<void>; flash: (m: string) => void; preview: boolean }) {
  const [anchor, setAnchor] = useState(parseISO(TODAY))
  const [open, setOpen] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [report, setReport] = useState<any | null>(null)
  const start = startOfWeek(anchor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const clientInfo = useMemo(() => new Map(data.clients.map((c) => [c.id as string, c])), [data.clients])

  const act = async (fn: 'check_in' | 'check_out', taskId: string) => {
    setBusy(taskId)
    const { error } = await supabase.rpc(fn, { p_task: taskId })
    setBusy(null)
    if (error) { console.error(fn, error); flash('לא הצלחנו לעדכן. נסי שוב.'); return }
    flash(fn === 'check_in' ? 'הביקור התחיל' : 'הביקור הסתיים. נשאר למלא את דיווח הסיום')
    await reload()
    if (fn === 'check_out') setReport(data.tasks.find((t) => t.id === taskId) ?? null)
  }

  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button className="icon-btn" aria-label="שבוע קודם" onClick={() => setAnchor(addDays(anchor, -7))}><Icon name="chevron-right" /></button>
        <strong aria-live="polite">{formatDM(days[0])} – {formatDM(days[6])}</strong>
        <button className="icon-btn" aria-label="שבוע הבא" onClick={() => setAnchor(addDays(anchor, 7))}><Icon name="chevron-left" /></button>
      </div>
      {!days.some((d) => data.tasks.some((t) => t.scheduled_date === toISO(d) && t.status !== 'cancelled')) && <Empty text="אין ביקורים השבוע." />}
      {days.map((d, i) => {
        const iso = toISO(d)
        const list = data.tasks.filter((t) => t.scheduled_date === iso && t.status !== 'cancelled')
        if (list.length === 0) return null
        return (
          <section key={iso} aria-label={`${DAY_NAMES[i]} ${formatDM(d)}`}>
            <div className="stack" style={{ gap: 10 }}>
              {list.map((t) => {
                const c = one(t.clients) as any
                const info = clientInfo.get(t.client_id) ?? c
                const [label, tone] = STATUS[t.status] ?? [t.status, 'neutral' as const]
                const expanded = open === t.id
                const notes = data.notes.filter((n) => n.client_id === t.client_id)
                const highlights = notes.filter((n) => n.kind === 'highlight')
                const allergies = data.allergies.filter((a) => a.client_id === t.client_id)
                const slots = data.slots.filter((s) => s.client_id === t.client_id)
                const orderer = data.contacts.find((x) => x.client_id === t.client_id && x.is_orderer)
                const place = t.location || 'בית הלקוח/ה'
                const summary = data.summaries.find((x) => x.task_id === t.id)
                const needsReport = (t.status === 'completed' || !!t.checked_out_at) && !summary
                const address = info?.address || c?.address
                const health = [info?.mobility_notes && { k: 'ניידות', v: info.mobility_notes }, info?.cognitive_notes && { k: 'קוגניטיבי', v: info.cognitive_notes }].filter(Boolean) as { k: string; v: string }[]
                return (
                  <Card key={t.id} style={t.status === 'in_progress' ? { borderColor: 'var(--brand-action)' } : undefined}>
                    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ font: '800 16px var(--font-ui)', color: 'var(--brand-link)' }}>{DAY_NAMES[i]} {formatDM(d)} · <Ltr>{hhmm(t.start_time)}{t.end_time ? `–${hhmm(t.end_time)}` : ''}</Ltr></span>
                      <span className="row" style={{ gap: 6 }}>{iso === TODAY && <Badge tone="green">היום</Badge>}{needsReport && <Badge tone="red">חסר דיווח</Badge>}<Badge tone={tone}>{label}</Badge></span>
                    </div>
                    <div style={{ font: '800 20px var(--font-ui)' }}>{c?.full_name}</div>
                    <div style={{ font: '600 15px var(--font-ui)', margin: '2px 0 10px' }}>{t.title}</div>

                    <div className="inset stack" style={{ gap: 8 }}>
                      <div className="kv"><span className="muted">מזמין/ת השירות</span><span style={{ fontWeight: 700 }}>{orderer ? <>{orderer.full_name}{orderer.relation ? ` (${orderer.relation})` : ''}</> : '—'}</span></div>
                      {orderer?.phone && <div className="kv"><span className="muted">טלפון המזמין/ה</span><a href={`tel:${orderer.phone}`} style={{ fontWeight: 700 }}><Ltr>{orderer.phone}</Ltr></a></div>}
                      <div className="kv"><span className="muted">טלפון הלקוח/ה</span><span style={{ fontWeight: 700 }}>{info?.phone ? <a href={`tel:${info.phone}`}><Ltr>{info.phone}</Ltr></a> : '—'}</span></div>
                      <div className="kv"><span className="muted">כתובת</span><span style={{ fontWeight: 700, textAlign: 'end' }}>{address || '—'}{one(t.regions)?.name ? ` · ${one(t.regions).name}` : ''}</span></div>
                      <div className="kv"><span className="muted">קוד דלת / בניין</span><span style={{ fontWeight: 700 }}>{info?.building_code ? <Ltr>{info.building_code}</Ltr> : '—'}</span></div>
                      <div className="kv"><span className="muted">מקום הפגישה</span><span style={{ fontWeight: 700 }}>{place}</span></div>
                    </div>

                    {(health.length > 0 || allergies.length > 0 || highlights.length > 0) && (
                      <div className="alert-block stack" style={{ marginTop: 10, gap: 6 }}>
                        <strong>מגבלות ודגשים</strong>
                        {health.map((h) => <div key={h.k}><span className="muted">{h.k}: </span>{h.v}</div>)}
                        {allergies.length > 0 && <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}><span className="muted">אלרגיות:</span>{allergies.map((a) => <Badge key={a.allergen} tone={a.severity === 'high' ? 'red' : 'orange'}>{a.allergen}</Badge>)}</div>}
                        {highlights.map((n) => <div key={n.id}>{n.body}</div>)}
                      </div>
                    )}

                    <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      {!preview && iso === TODAY && t.status !== 'completed' && (t.checked_in_at
                        ? <Button size="sm" disabled={busy === t.id} onClick={() => act('check_out', t.id)}>סיום ביקור</Button>
                        : <Button size="sm" disabled={busy === t.id} onClick={() => act('check_in', t.id)}>התחלת ביקור</Button>)}
                      {!preview && (t.status === 'completed' || t.checked_out_at) && <Button size="sm" variant={needsReport ? 'primary' : 'secondary'} onClick={() => setReport(t)}>{summary ? 'עריכת דיווח' : 'דיווח סיום ביקור'}</Button>}
                      {address && <a className="btn secondary sm" href={mapsUrl(address)} target="_blank" rel="noreferrer">ניווט</a>}
                      {(notes.some((n) => n.kind === 'note') || slots.length > 0) && <Button size="sm" variant="secondary" onClick={() => setOpen(expanded ? null : t.id)}>{expanded ? 'הסתרת פרטים' : 'עוד פרטים'}</Button>}
                    </div>
                    {t.checked_in_at && <p className="card-meta" style={{ marginTop: 8 }}>נכנסת ב-<Ltr>{localHM(t.checked_in_at)}</Ltr>{t.checked_out_at && <> · יצאת ב-<Ltr>{localHM(t.checked_out_at)}</Ltr></>}</p>}

                    {expanded && (
                      <div className="inset stack" style={{ marginTop: 10, gap: 8 }}>
                        {notes.filter((n) => n.kind === 'note').map((n) => <div key={n.id} style={{ fontWeight: 600 }}>{n.body}</div>)}
                        {slots.length > 0 && <div><div className="card-label">מה הלקוח/ה ביקש/ה</div>{slots.map((s) => <div key={s.id} style={{ fontWeight: 600 }}>{DAY_NAMES[s.weekday]} <Ltr>{hhmm(s.start_time)}{s.end_time ? `–${hhmm(s.end_time)}` : ''}</Ltr> · {s.purpose || 'ביקור'}</div>)}</div>}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </section>
        )
      })}
      {report && <ReportDialog task={report} staffId={data.me.id} existing={data.summaries.find((x) => x.task_id === report.id)} onClose={() => setReport(null)} onSaved={() => { flash('הדיווח נשלח למשרד'); void reload() }} />}
    </>
  )
}

// ---------------------------------------------------------------- By client
function ByClient({ data, flash, preview }: { data: Data; flash: (m: string) => void; preview: boolean }) {
  const upcoming = data.tasks.filter((t) => t.scheduled_date >= TODAY && t.status !== 'cancelled')
  const myClients = data.clients.filter((c) => data.slots.some((s) => s.client_id === c.id) || data.tasks.some((t) => t.client_id === c.id))
  const [req, setReq] = useState<string | null>(null)
  if (myClients.length === 0) return <Empty text="עוד אין לקוחות משויכים אליך. כשהמשרד ישבץ אותך, הם יופיעו כאן." />
  return (
    <>
      {myClients.map((c) => {
        const next = upcoming.filter((t) => t.client_id === c.id).slice(0, 3)
        return (
          <div key={c.id} className="stack" style={{ gap: 8 }}>
            <ClientProfile c={c} data={data} onRequest={() => (preview ? flash('בתצוגת מנהל אי אפשר לשלוח') : setReq(c.id))} />
            <Card>
              <div className="card-label" style={{ marginBottom: 4 }}>הביקורים הבאים שלך</div>
              {next.length === 0 ? <p className="muted">אין ביקורים קרובים.</p> : next.map((t) => (
                <div key={t.id} className="kv" style={{ fontSize: 14 }}><span>{DAY_NAMES[parseISO(t.scheduled_date).getDay()]} {formatDM(parseISO(t.scheduled_date))}</span><span className="num">{hhmm(t.start_time)}</span></div>
              ))}
            </Card>
          </div>
        )
      })}
      {req && <ExternalRequestDialog clients={myClients} clientId={req} onClose={() => setReq(null)} flash={flash} />}
    </>
  )
}

// ---------------------------------------------------------------- Hours + expenses
function Hours({ data, flash, preview }: { data: Data; flash: (m: string) => void; preview: boolean }) {
  const [month, setMonth] = useState(() => new Date(parseISO(TODAY).getFullYear(), parseISO(TODAY).getMonth(), 1))
  const [report, setReport] = useState<MonthReport | null>(null)
  const [failed, setFailed] = useState(false)
  const [version, setVersion] = useState(0)
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [taskId, setTaskId] = useState('')
  const [err, setErr] = useState('')
  const ym = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-01`
  const pay = report && data.rates ? payroll(report, data.rates.wage, { wage: data.rates.wage, socialFactor: 1, travelPerDay: data.rates.travel, graceMinutes: 0, firstHour: 0, additionalHour: 0 }) : null
  const quota = (report?.perClient ?? []).map((pc) => {
    const cl = data.clients.find((c) => c.id === pc.clientId)
    const mp = Array.isArray(cl?.membership_plans) ? cl?.membership_plans[0] : cl?.membership_plans
    const rate = PLAN_RATES.find((r) => r.id === mp?.id)
    const total = mp ? Math.round(Number(mp.monthly_sessions) * Number(mp.hours_per_session ?? rate?.hours ?? 0) * 10) / 10 : 0
    return { id: pc.clientId, name: pc.client, plan: mp?.name ?? '', done: Math.round((pc.minutes / 60) * 10) / 10, total }
  }).filter((q) => q.total > 0)

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    loadStaffMonth(data.me.id, ym)
      .then((m) => { if (!cancelled) setReport(buildMonthReport(m.tasks, m.expenses)) })
      .catch((e) => { console.error('hours failed', e); if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [data.me.id, ym, version])

  const add = async (e: FormEvent) => {
    e.preventDefault()
    if (!desc.trim() || !(Number(amount) > 0)) { setErr('כתבי מה ההוצאה והזיני סכום גדול מאפס'); return }
    setErr('')
    const { error } = await supabase.from('staff_expenses').insert({ staff_id: data.me.id, description: desc.trim(), amount: Number(amount), task_id: taskId || null, expense_date: TODAY })
    if (error) { console.error('expense failed', error); flash('לא הצלחנו לשמור את ההוצאה. נסי שוב.'); return }
    setDesc(''); setAmount(''); setTaskId('')
    flash('ההוצאה נשלחה לאישור המשרד')
    setVersion((n) => n + 1)
  }
  const remove = async (id: string) => {
    const { error } = await supabase.from('staff_expenses').delete().eq('id', id)
    if (error) { console.error('delete expense failed', error); flash('לא הצלחנו למחוק. נסי שוב.'); return }
    setVersion((n) => n + 1)
  }
  const step = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1))
  const EXP = { pending: ['ממתינה לאישור', 'orange'], approved: ['אושרה', 'green'], rejected: ['נדחתה', 'red'] } as const

  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button className="icon-btn" aria-label="חודש קודם" onClick={() => step(-1)}><Icon name="chevron-right" /></button>
        <strong aria-live="polite">{monthLabel(month)}</strong>
        <button className="icon-btn" aria-label="חודש הבא" onClick={() => step(1)}><Icon name="chevron-left" /></button>
      </div>
      {failed && <Card><p style={{ fontWeight: 700 }}>לא הצלחנו לטעון את הדוח. נסי שוב בעוד רגע.</p></Card>}
      {!report && !failed && <p className="muted" role="status">טוענת…</p>}
      {report && (
        <>
          <Card>
            <div className="grid cols-2" style={{ gap: 10 }}>
              <div><div className="card-label">סה&quot;כ שעות</div><div className="stat-figure"><Ltr>{fmtHours(report.totalMinutes)}</Ltr></div></div>
              <div><div className="card-label">ביקורים</div><div className="stat-figure">{report.visitCount}</div></div>
            </div>
            <p className="card-meta">{report.daysWorked} ימי עבודה · ממוצע <Ltr>{fmtHours(report.avgMinutes)}</Ltr> לביקור</p>
            {report.missingTimes > 0 && <p className="notice" style={{ marginTop: 8 }}>ב-{report.missingTimes} ביקורים חסרה שעת כניסה או יציאה, ולכן הם לא נספרו בשעות. אפשר לפנות למשרד להשלמה.</p>}
          </Card>

          <Card>
            <div className="card-title" style={{ marginBottom: 6 }}>סיכום חודשי</div>
            <div className="kv"><span>ביקורים שבוצעו</span><span className="v">{report.visitCount}</span></div>
            <div className="kv"><span>שעות עבודה</span><span className="v"><Ltr>{fmtHours(report.totalMinutes)}</Ltr></span></div>
            {pay ? (
              <>
                <div className="kv"><span>שכר שעות <span className="card-meta">({money(pay.wage)} לשעה)</span></span><span className="v">{money(pay.gross)}</span></div>
                <div className="kv"><span>החזר נסיעות <span className="card-meta">({report.daysWorked} ימי עבודה)</span></span><span className="v">{money(pay.travel)}</span></div>
                {pay.expenses > 0 && <div className="kv"><span>הוצאות שאושרו</span><span className="v">{money(pay.expenses)}</span></div>}
                <div className="kv total"><span>סה&quot;כ עד כה</span><span className="v">{money(pay.total)}</span></div>
                <p className="card-meta" style={{ marginTop: 8 }}>הסכום מתאפס בתחילת כל חודש. ניתן לעבור בין חודשים בחצים למעלה.</p>
              </>
            ) : <p className="card-meta">פרטי השכר יוצגו כאן אחרי שהמשרד יעדכן את ההגדרות.</p>}
          </Card>

          {quota.length > 0 && (
            <Card>
              <div className="card-title" style={{ marginBottom: 6 }}>שעות לפי מסלול הלקוח</div>
              {quota.map((q) => (
                <div key={q.id} className="stack" style={{ gap: 4, marginBottom: 10 }}>
                  <div className="kv"><span><strong>{q.name}</strong><div className="card-meta">{q.plan}</div></span><span className="v">{q.done} מתוך {q.total} שעות</span></div>
                  <div style={{ height: 8, borderRadius: 8, background: 'var(--surface-2, #eef1f5)', overflow: 'hidden' }}><div style={{ width: `${Math.min(100, q.total ? (q.done / q.total) * 100 : 0)}%`, height: '100%', background: q.done > q.total ? 'var(--danger)' : 'var(--brand-action)' }} /></div>
                </div>
              ))}
            </Card>
          )}

          <Card>
            <div className="card-title" style={{ marginBottom: 6 }}>התייעצות עם מנהל הצוות</div>
            <p className="muted" style={{ marginBottom: 10 }}>שאלה, בקשה או משהו דחוף? {ACCESS.name} זמין/ה.</p>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <a className="btn sm" href={ACCESS.tel}>התקשרות · <Ltr>{ACCESS.phone}</Ltr></a>
              <a className="btn secondary sm" href={`https://wa.me/972${ACCESS.phone.replace(/\D/g, '').slice(1)}`} target="_blank" rel="noreferrer">וואטסאפ</a>
            </div>
          </Card>

          <Card>
            <div className="card-title" style={{ marginBottom: 6 }}>איפה עבדת</div>
            {report.perClient.length === 0 ? <p className="muted">אין ביקורים שהושלמו בחודש הזה.</p> : report.perClient.map((c) => (
              <div key={c.clientId} className="kv"><span><strong>{c.client}</strong><div className="card-meta">{c.place}</div></span><span className="v"><Ltr>{fmtHours(c.minutes)}</Ltr> · {c.visits} ביקורים</span></div>
            ))}
          </Card>

          <Card>
            <div className="card-title" style={{ marginBottom: 6 }}>הביקורים</div>
            {report.visits.length === 0 ? <p className="muted">אין ביקורים שהושלמו בחודש הזה.</p> : report.visits.map((v) => (
              <div key={v.id} className="kv" style={{ fontSize: 14 }}>
                <span><strong>{DAY_NAMES[parseISO(v.date).getDay()]} {formatDM(parseISO(v.date))}</strong> · {v.client}
                  <div className="card-meta">{v.checkedIn ? <>נכנסת <Ltr>{v.checkedIn}</Ltr> · יצאת <Ltr>{v.checkedOut || '?'}</Ltr></> : 'אין דיווח שעות'}</div></span>
                <span className="v">{v.actualMin === null ? '—' : <Ltr>{fmtHours(v.actualMin)}</Ltr>}</span>
              </div>
            ))}
          </Card>

          <Card>
            <div className="card-title" style={{ marginBottom: 6 }}>הוצאות נוספות</div>
            {report.expenses.length === 0 && <p className="muted" style={{ marginBottom: 8 }}>לא דיווחת על הוצאות בחודש הזה.</p>}
            {report.expenses.map((x) => (
              <div key={x.id} className="kv" style={{ fontSize: 14 }}>
                <span>{x.description}<div className="card-meta">{formatDM(parseISO(x.date))} · <Badge tone={EXP[x.status][1]}>{EXP[x.status][0]}</Badge></div></span>
                <span className="row" style={{ gap: 4 }}><span className="v">{money(x.amount)}</span>
                  {!preview && x.status === 'pending' && <button type="button" className="icon-btn danger" aria-label={`ביטול הוצאה: ${x.description}`} onClick={() => remove(x.id)}><Icon name="trash" size={16} /></button>}
                </span>
              </div>
            ))}
            {!preview && <form onSubmit={add} noValidate className="stack" style={{ gap: 10, marginTop: 12 }}>
              <div className="card-label">דיווח על הוצאה חדשה</div>
              <TextField label="מה ההוצאה" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="למשל: ארוחת צהריים בזמן הביקור" />
              <TextField label="סכום (₪)" type="number" inputMode="decimal" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <SelectField label="קשור לביקור (אופציונלי)" value={taskId} onChange={setTaskId} placeholder="ללא"
                options={report.visits.map((v) => ({ value: v.id, label: `${formatDM(parseISO(v.date))} · ${v.client}` }))} />
              {err && <div role="alert" style={{ color: 'var(--danger)', font: '600 13px var(--font-ui)' }}>{err}</div>}
              <Button type="submit" size="lg">שליחה לאישור</Button>
            </form>}
          </Card>
        </>
      )}
    </>
  )
}
