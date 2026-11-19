/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Badge, Button, Card, Empty, Icon, Ltr, money } from '../components/ui'
import { TextField, SelectField } from '../components/Fields'
import { supabase } from '../lib/supabase'
import { loadCompanion, loadStaffMonth, localHM, shortName } from '../lib/queries'
import { buildMonthReport, fmtHours, payroll, type MonthReport } from '../lib/report'
import { DAY_NAMES, addDays, formatDM, monthLabel, parseISO, toISO } from '../lib/dates'
import { TODAY } from '../data/model'
import { useAuth } from '../store/AuthStore'
import { ACCESS } from '../lib/contact'
import { PLAN_RATES, usePrices } from '../data/pricing'
import Modal from '../components/Modal'
import { ActivityDialog, ClientProfile, ExternalRequestDialog, ReportDialog } from './CompanionParts'

type Data = NonNullable<Awaited<ReturnType<typeof loadCompanion>>>
type Tab = 'home' | 'visits' | 'clients' | 'hours'
const one = (v: any) => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null))
const hhmm = (t: string | null) => (t ? t.slice(0, 5) : '')
const mapsUrl = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
const dayLabel = (iso: string) => { const d = parseISO(iso); return `יום ${DAY_NAMES[d.getDay()]}, ${formatDM(d)}` }
const STATUS: Record<string, string> = { planned: 'מתוכנן', confirmed: 'מאושר', in_progress: 'בביקור', completed: 'הושלם', cancelled: 'בוטל' }
const STATUS_CLASS: Record<string, string> = { completed: 'completed', in_progress: 'in_progress', confirmed: 'ok' }
const cmp = (a: any, b: any) => `${a.scheduled_date} ${a.start_time}`.localeCompare(`${b.scheduled_date} ${b.start_time}`)

/** previewId = an admin looking at one companion's app exactly as that companion sees it (read only). */
export default function CompanionApp({ previewId }: { previewId?: string } = {}) {
  usePrices()
  const { signOut, fullName } = useAuth()
  const preview = !!previewId
  const [tab, setTab] = useState<Tab>('home')
  const [data, setData] = useState<Data | null | undefined>(undefined)
  const [failed, setFailed] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [report, setReport] = useState<any | null>(null)
  const [req, setReq] = useState<string | null | undefined>(undefined)
  const [busy, setBusy] = useState<string | null>(null)
  const [profile, setProfile] = useState<string | null>(null)
  const [activity, setActivity] = useState(false)
  const [seen, setSeen] = useState<string[] | null>(null)
  const seenKey = data ? `fc-req-seen-${data.me.id}` : ''
  useEffect(() => { if (seenKey) { try { setSeen(JSON.parse(localStorage.getItem(seenKey) ?? '[]')) } catch { setSeen([]) } } }, [seenKey])
  const markSeen = (ids: string[]) => { const n = [...new Set([...(seen ?? []), ...ids])].slice(-200); setSeen(n); try { localStorage.setItem(seenKey, JSON.stringify(n)) } catch { /* private mode */ } }
  const [actVersion, setActVersion] = useState(0)
  const onActivity = () => setActivity(true)

  const load = useCallback(async () => {
    try {
      setData(await loadCompanion(toISO(addDays(parseISO(TODAY), -40)), toISO(addDays(parseISO(TODAY), 40)), previewId))
      setFailed(false)
    } catch (e) { console.error('companion load failed', e); setFailed(true) }
  }, [previewId])
  useEffect(() => { void load() }, [load])
  // New client requests pop up while the app is open: refresh every minute.
  useEffect(() => {
    const id = window.setInterval(() => { if (document.visibilityState === 'visible') void load() }, 60000)
    return () => window.clearInterval(id)
  }, [load])

  const flash = (m: string) => { setNote(m); window.setTimeout(() => setNote(null), 4000) }
  const act = async (fn: 'check_in' | 'check_out', taskId: string) => {
    setBusy(taskId)
    const { error } = await supabase.rpc(fn, { p_task: taskId })
    setBusy(null)
    if (error) { console.error(fn, error); flash('לא הצלחנו לעדכן. נסי שוב.'); return }
    flash(fn === 'check_in' ? 'הביקור התחיל' : 'הביקור הסתיים. נשאר לכתוב את סיכום הפגישה ולשלוח')
    const task = data?.tasks.find((t) => t.id === taskId)
    await load()
    if (fn === 'check_out' && task) setReport(task)
  }

  const tabs: [Tab, string][] = [['home', 'ראשי'], ['visits', 'פגישות'], ['clients', 'לקוחות'], ['hours', 'האזור שלי']]
  const first = (data ? shortName(data.me.full_name) : fullName).split(' ')[0]
  // Visits that are over but have no hours/summary report yet: shown as a reminder on every tab.
  const nowHM = new Date().toTimeString().slice(0, 5)
  const unreported = data ? data.tasks
    .filter((t) => t.status !== 'cancelled' && !data.summaries.some((x) => x.task_id === t.id)
      && (t.status === 'completed' || !!t.checked_out_at || t.scheduled_date < TODAY || (t.scheduled_date === TODAY && !!t.end_time && String(t.end_time).slice(0, 5) <= nowHM)))
    .sort((a, b) => (a.scheduled_date + a.start_time).localeCompare(b.scheduled_date + b.start_time)) : []
  const unseenReqs = data && !preview && seen ? data.requests.filter((r) => !seen.includes(r.id)) : []
  const myClients = data ? data.clients.filter((c) => data.slots.some((s) => s.client_id === c.id) || data.tasks.some((t) => t.client_id === c.id)) : []

  return (
    <div className="portal companion-app">
      {preview && (
        <div role="status" style={{ background: '#FFF4E5', color: '#7A4A00', padding: '10px 16px', textAlign: 'center', fontWeight: 600, position: 'sticky', top: 0, zIndex: 50 }}>
          תצוגת מנהל: כך המלווה/ת רואה את האפליקציה. אפשר לדווח שעות, להזמין שירות ולעדכן ביקורים בשמו/ה. {' '}
          <a href="/admin/staff" style={{ color: 'inherit', textDecoration: 'underline' }}>חזרה למלווים</a>
        </div>
      )}
      <header className="pt-head">
        <div className="pt-head-in">
          <img src={`${import.meta.env.BASE_URL}brand/logo-white.png`} height={40} alt="Family Care — always with you" />
          <div className="pt-tools">{!preview && <button type="button" onClick={() => void signOut()} className="pt-out">יציאה</button>}</div>
        </div>
      </header>

      <main className="pt-main">
        <section className="pt-hello">
          <h1>שלום {first}</h1>
          <p>{DAY_NAMES[parseISO(TODAY).getDay()]} {formatDM(parseISO(TODAY))}</p>
        </section>

        <nav className="pt-tabs" role="tablist" aria-label="האזור שלי">
          {tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}{id === 'visits' && unreported.length > 0 && <span aria-label={`${unreported.length} פגישות בלי דיווח`} style={{ marginInlineStart: 6, background: 'var(--warning, #E08A00)', color: '#fff', borderRadius: 10, padding: '0 7px', fontSize: 12, fontWeight: 700 }}>{unreported.length}</span>}</button>)}
        </nav>
        {unreported.length > 0 && (
          <div className="pt-note" role="status" style={{ marginTop: 0, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <span><b>שכחת לדווח?</b> {unreported.length === 1 ? 'פגישה אחת הסתיימה' : `${unreported.length} פגישות הסתיימו`} בלי דיווח שעות וסיכום.</span>
            <button type="button" className="pt-btn" onClick={() => setReport(unreported[0])}>לדיווח</button>
          </div>
        )}
        {note && <p className="pt-note" role="status" style={{ marginTop: 0, marginBottom: 12 }}>{note}</p>}

        {failed && <p className="pt-note" role="alert">לא הצלחנו לטעון את הנתונים. בדקי את החיבור. <button type="button" className="pt-link" onClick={() => void load()}>ניסיון נוסף</button></p>}
        {data === undefined && !failed && <p className="pt-note" role="status">טוענת…</p>}
        {data === null && <p className="pt-note">החשבון שלך מחובר, אבל עוד לא שויך לכרטיס מלווה/ת. אפשר לפנות למשרד.</p>}
        {data && tab === 'home' && <Home data={data} go={setTab} act={act} busy={busy} preview={preview} onReport={setReport} onClient={setProfile} onActivity={onActivity} onRequest={() => setReq(null)} />}
        {data && tab === 'visits' && <Visits data={data} act={act} busy={busy} preview={preview} onReport={setReport} onClient={setProfile} />}
        {data && tab === 'clients' && <ByClient data={data} flash={flash} preview={preview} />}
        {data && tab === 'hours' && <Hours data={data} flash={flash} preview={preview} onActivity={onActivity} reloadKey={actVersion} />}
      </main>

      {data && profile && (() => {
        const c = data.clients.find((x) => x.id === profile)
        return c ? <Modal title="תיק הלקוח/ה" onClose={() => setProfile(null)}><ClientProfile c={c} data={data} onRequest={() => { setProfile(null); setReq(c.id) }} /></Modal> : null
      })()}
      {data && report && <ReportDialog task={report} staffId={data.me.id} existing={data.summaries.find((x) => x.task_id === report.id)} onClose={() => setReport(null)} onSaved={() => { flash('הסיכום נשלח למשפחה ולמשרד'); void load() }} />}
      {data && unseenReqs.length > 0 && !report && !activity && (() => {
        const r = unseenReqs[0]
        const cl = data.clients.find((x) => x.id === r.client_id)
        const phone = data.contacts.find((x) => x.client_id === r.client_id && x.is_orderer)?.phone
        return (
          <Modal title="בקשת שירות חדשה" onClose={() => markSeen([r.id])}
            footer={<><Button variant="secondary" onClick={() => markSeen([r.id])}>הבנתי</Button>{phone && <a className="btn" href={`tel:${phone}`}>התקשרות למזמין/ה</a>}</>}>
            <div className="stack" style={{ gap: 8 }}>
              <div style={{ font: '800 18px var(--font-ui)' }}>{cl?.full_name ?? 'לקוח/ה'}</div>
              <div><Badge tone="orange">{r.category || 'בקשה'}</Badge></div>
              <p style={{ whiteSpace: 'pre-wrap' }}>{r.description}</p>
              {r.preferred_date && <p className="muted">למתי: {formatDM(parseISO(r.preferred_date))}</p>}
              <p className="muted">המשרד יחזור אליך/אליהם עם התיאום. הבקשה נשארת גם במסך הראשי.</p>
              {unseenReqs.length > 1 && <p className="muted">ועוד {unseenReqs.length - 1} בקשות חדשות.</p>}
            </div>
          </Modal>
        )
      })()}
      {data && activity && <ActivityDialog clients={data.clients} staffId={data.me.id} onClose={() => setActivity(false)} onSaved={() => { flash('הדיווח נשלח לאישור המשרד'); setActVersion((n) => n + 1) }} />}
      {data && req !== undefined && <ExternalRequestDialog clients={myClients} clientId={req ?? undefined} onClose={() => setReq(undefined)} flash={flash} byOffice={preview} />}
    </div>
  )
}

type Act = (fn: 'check_in' | 'check_out', taskId: string) => Promise<void>

/** One visit with everything the companion needs on the way there. */
function VisitDetails({ data, t, act, busy, onReport, onClient }: { data: Data; t: any; act: Act; busy: string | null; preview: boolean; onReport: (t: any) => void; onClient: (id: string) => void }) {
  const c = one(t.clients) as any
  const info = data.clients.find((x) => x.id === t.client_id) ?? c
  const orderer = data.contacts.find((x) => x.client_id === t.client_id && x.is_orderer)
  const address = info?.address || c?.address
  const region = one(t.regions)?.name
  const allergies = data.allergies.filter((a) => a.client_id === t.client_id)
  const highlights = data.notes.filter((n) => n.client_id === t.client_id && n.kind === 'highlight')
  const health = [info?.mobility_notes && { k: 'ניידות', v: info.mobility_notes }, info?.cognitive_notes && { k: 'קוגניטיבי', v: info.cognitive_notes }].filter(Boolean) as { k: string; v: string }[]
  const hints = data.hints.filter((h) => h.client_id === t.client_id && (!h.task_id || h.task_id === t.id))
  const summary = data.summaries.find((x) => x.task_id === t.id)
  const done = t.status === 'completed' || !!t.checked_out_at
  const isToday = t.scheduled_date === TODAY
  const Row = ({ k, children }: { k: string; children: React.ReactNode }) => <div className="pt-row" style={{ padding: '6px 0', alignItems: 'baseline' }}><span className="pt-sub">{k}</span><b style={{ fontWeight: 600, textAlign: 'end' }}>{children}</b></div>
  return (
    <>
      <div className="pt-visit big">
        <div className="pt-when"><b>{dayLabel(t.scheduled_date)}</b><span><Ltr>{hhmm(t.start_time)}{t.end_time ? `–${hhmm(t.end_time)}` : ''}</Ltr></span></div>
        <div className="pt-what"><button type="button" className="pt-link" style={{ font: 'inherit', fontWeight: 700, fontSize: '1.2em', padding: 0, textAlign: 'start', color: 'inherit', textDecoration: 'underline' }} onClick={() => onClient(t.client_id)}>{c?.full_name}</button><span>{t.title}</span></div>
        <span className={`pt-status ${STATUS_CLASS[t.status] ?? ''}`}>{STATUS[t.status] ?? t.status}</span>
      </div>
      <div style={{ marginTop: 10 }}>
        {orderer && <Row k="מזמין/ת השירות">{`${orderer.full_name}${orderer.relation ? ` (${orderer.relation})` : ''}`}</Row>}
        {orderer?.phone && <Row k="טלפון המזמין/ה"><a href={`tel:${orderer.phone}`}><Ltr>{orderer.phone}</Ltr></a></Row>}
        {info?.phone && <Row k="טלפון הלקוח/ה"><a href={`tel:${info.phone}`}><Ltr>{info.phone}</Ltr></a></Row>}
        {(address || region) && <Row k="כתובת">{[address, region].filter(Boolean).join(' · ')}</Row>}
        {info?.building_code && <Row k="קוד דלת / בניין"><Ltr>{info.building_code}</Ltr></Row>}
        <Row k="מקום הפגישה">{t.location || 'בית הלקוח/ה'}</Row>
      </div>
      {(health.length > 0 || allergies.length > 0 || highlights.length > 0) && (
        <div className="alert-block stack" style={{ marginTop: 10, gap: 6, color: 'var(--ink-1)' }}>
          <strong>מגבלות בריאותיות ודגשים</strong>
          {health.map((h) => <div key={h.k}><span className="muted">{h.k}: </span>{h.v}</div>)}
          {allergies.length > 0 && <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}><span className="muted">אלרגיות:</span>{allergies.map((a) => <Badge key={a.allergen} tone={a.severity === 'high' ? 'red' : 'orange'}>{a.allergen}</Badge>)}</div>}
          {highlights.map((n) => <div key={n.id}>{n.body}</div>)}
        </div>
      )}
      {hints.length > 0 && (
        <div className="alert-block stack" style={{ marginTop: 10, gap: 6, color: 'var(--ink-1)' }}>
          <strong>דגשים מהמשפחה</strong>
          {hints.map((h, i) => <div key={i}>{h.body}{h.task_id ? '' : <span className="muted"> (כללי)</span>}</div>)}
        </div>
      )}
      <div className="pt-row" style={{ gap: 8, marginTop: 14, justifyContent: 'flex-start' }}>
        {isToday && !done && (t.checked_in_at
          ? <button type="button" className="pt-btn" disabled={busy === t.id} onClick={() => act('check_out', t.id)}>סיום ביקור</button>
          : <button type="button" className="pt-btn" disabled={busy === t.id} onClick={() => act('check_in', t.id)}>התחלת ביקור</button>)}
        <button type="button" className={`pt-btn ${summary ? 'ghost' : ''}`} onClick={() => onReport(t)}>{summary ? 'עריכת שעות וסיכום' : 'דיווח שעות וסיכום פגישה'}</button>
        {address && <a className="pt-btn ghost" href={mapsUrl(address)} target="_blank" rel="noreferrer">ניווט</a>}
      </div>
      {t.checked_in_at && <p className="pt-sub" style={{ marginTop: 8 }}>נכנסת ב-<Ltr>{localHM(t.checked_in_at)}</Ltr>{t.checked_out_at && <> · יצאת ב-<Ltr>{localHM(t.checked_out_at)}</Ltr></>}</p>}
    </>
  )
}

// ---------------------------------------------------------------- Home
function Home({ data, go, act, busy, preview, onReport, onClient, onRequest, onActivity }: { data: Data; go: (t: Tab) => void; act: Act; busy: string | null; preview: boolean; onReport: (t: any) => void; onClient: (id: string) => void; onRequest: () => void; onActivity: () => void }) {
  const live = data.tasks.filter((t) => t.status !== 'cancelled')
  const upcoming = live.filter((t) => t.scheduled_date >= TODAY && t.status !== 'completed' && !t.checked_out_at).sort(cmp)
  const next = upcoming.find((t) => t.status === 'in_progress') ?? upcoming[0]
  const todayOthers = upcoming.filter((t) => t.scheduled_date === TODAY && t.id !== next?.id)
  const missing = live.filter((t) => (t.status === 'completed' || t.checked_out_at || t.scheduled_date < TODAY) && !data.summaries.some((x) => x.task_id === t.id)).sort(cmp)
  const month = TODAY.slice(0, 7)
  const done = live.filter((t) => t.scheduled_date.startsWith(month) && t.status === 'completed')
  const mins = done.reduce((a, t) => a + (t.checked_in_at && t.checked_out_at ? Math.round((+new Date(t.checked_out_at) - +new Date(t.checked_in_at)) / 60000) : 0), 0)
  return (
    <div className="pt-stack">
      {data.requests.length > 0 && (
        <section className="pt-card" aria-labelledby="h-reqs" style={{ borderInlineStart: '4px solid var(--warning, #E08A00)' }}>
          <h2 id="h-reqs">בקשות חדשות מהלקוחות שלך</h2>
          <div className="pt-list">
            {data.requests.map((r) => {
              const cl = data.clients.find((x) => x.id === r.client_id)
              const d = new Date(r.created_at)
              return (
                <div key={r.id} className="stack" style={{ gap: 4, padding: '6px 0' }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}><b>{cl?.full_name ?? 'לקוח/ה'}</b><span className="pt-sub">{d.getDate()}.{d.getMonth() + 1} · <Ltr>{String(d.getHours()).padStart(2, '0')}:{String(d.getMinutes()).padStart(2, '0')}</Ltr></span></div>
                  <div><Badge tone="orange">{r.category || 'בקשה'}</Badge>{r.preferred_date ? <span className="pt-sub"> · למתי: {formatDM(parseISO(r.preferred_date))}</span> : null}</div>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{r.description}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="pt-card pt-next" aria-labelledby="h-next">
        <h2 id="h-next">{next?.status === 'in_progress' ? 'הביקור שלך עכשיו' : 'הפגישה הקרובה'}</h2>
        {next ? <div className="co-next"><VisitDetails data={data} t={next} act={act} busy={busy} preview={preview} onReport={onReport} onClient={onClient} /></div> : <p>אין פגישות קרובות. כשהמשרד ישבץ אותך הן יופיעו כאן.</p>}
      </section>

      {missing.length > 0 && (
        <section className="pt-card" aria-labelledby="h-miss" style={{ borderColor: 'var(--danger)' }}>
          <h2 id="h-miss">סיכומי פגישה שעוד לא נשלחו</h2>
          <div className="pt-list">
            {missing.map((t) => (
              <div key={t.id} className="pt-row" style={{ padding: '10px 0' }}>
                <span><button type="button" className="pt-link" style={{ font: 'inherit', fontWeight: 700, padding: 0 }} onClick={() => onClient(t.client_id)}>{one(t.clients)?.full_name}</button><br /><span className="pt-sub">{dayLabel(t.scheduled_date)}</span></span>
                <button type="button" className="pt-btn" onClick={() => onReport(t)}>לכתוב סיכום</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {todayOthers.length > 0 && (
        <section className="pt-card" aria-labelledby="h-today">
          <h2 id="h-today">עוד להיום</h2>
          <div className="pt-list">{todayOthers.map((t) => (
            <div key={t.id} className="pt-visit"><div className="pt-when"><b><Ltr>{hhmm(t.start_time)}</Ltr></b></div><div className="pt-what"><button type="button" className="pt-link" style={{ font: 'inherit', fontWeight: 700, padding: 0, textAlign: 'start' }} onClick={() => onClient(t.client_id)}>{one(t.clients)?.full_name}</button><span>{t.title}</span></div></div>
          ))}</div>
        </section>
      )}

      <div className="pt-actions">
        <button type="button" className="pt-action main" onClick={onActivity}><b>דיווח שעות</b><span>ליווי או פעילות שלא נקבעו ביומן</span></button>
        <button type="button" className="pt-action" onClick={onRequest}><b>הזמנת שירות חיצוני</b><span>טכנאי, רופא, קניות, הסעה</span></button>
        <button type="button" className="pt-action" onClick={() => go('clients')}><b>הלקוחות שלי</b><span>תיק, טלפונים והעדפות</span></button>
        <button type="button" className="pt-action" onClick={() => go('hours')}><b>האזור שלי</b><span>שעות, שכר והוצאות</span></button>
        <a className="pt-action" href={ACCESS.tel}><b>התייעצות עם {ACCESS.name}</b><span><Ltr>{ACCESS.phone}</Ltr></span></a>
      </div>

      <section className="pt-card" aria-labelledby="h-month">
        <h2 id="h-month">החודש שלי</h2>
        <div className="pt-row"><span>ביקורים שבוצעו</span><b>{done.length}</b></div>
        <div className="pt-row"><span>שעות עבודה</span><b><Ltr>{fmtHours(mins)}</Ltr></b></div>
        <button type="button" className="pt-link" onClick={() => go('hours')}>לפירוט, שכר ונסיעות</button>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------- Visits
function Visits({ data, act, busy, preview, onReport, onClient }: { data: Data; act: Act; busy: string | null; preview: boolean; onReport: (t: any) => void; onClient: (id: string) => void }) {
  const live = data.tasks.filter((t) => t.status !== 'cancelled')
  const upcoming = live.filter((t) => t.scheduled_date >= TODAY && t.status !== 'completed' && !t.checked_out_at).sort(cmp)
  const past = live.filter((t) => !(t.scheduled_date >= TODAY && t.status !== 'completed' && !t.checked_out_at)).sort(cmp).reverse()
  return (
    <div className="pt-stack">
      {upcoming.length === 0 && <section className="pt-card"><p>אין פגישות קרובות.</p></section>}
      {upcoming.map((t) => <section key={t.id} className="pt-card"><VisitDetails data={data} t={t} act={act} busy={busy} preview={preview} onReport={onReport} onClient={onClient} /></section>)}
      {past.length > 0 && (
        <section className="pt-card" aria-labelledby="h-past">
          <h2 id="h-past">פגישות קודמות</h2>
          <div className="pt-list">
            {past.map((t) => (
              <details key={t.id} className="pt-det">
                <summary><div className="pt-visit"><div className="pt-when"><b>{dayLabel(t.scheduled_date)}</b></div><div className="pt-what"><b>{one(t.clients)?.full_name}</b><span>{t.title}</span></div></div></summary>
                <div style={{ paddingBottom: 12 }}><VisitDetails data={data} t={t} act={act} busy={busy} preview={preview} onReport={onReport} onClient={onClient} /></div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
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
            <ClientProfile c={c} data={data} onRequest={() => setReq(c.id)} />
            <Card>
              <div className="card-label" style={{ marginBottom: 4 }}>הביקורים הבאים שלך</div>
              {next.length === 0 ? <p className="muted">אין ביקורים קרובים.</p> : next.map((t) => (
                <div key={t.id} className="kv" style={{ fontSize: 14 }}><span>{DAY_NAMES[parseISO(t.scheduled_date).getDay()]} {formatDM(parseISO(t.scheduled_date))}</span><span className="num">{hhmm(t.start_time)}</span></div>
              ))}
            </Card>
          </div>
        )
      })}
      {req && <ExternalRequestDialog clients={myClients} clientId={req} onClose={() => setReq(null)} flash={flash} byOffice={preview} />}
    </>
  )
}

// ---------------------------------------------------------------- Hours + expenses
function Hours({ data, flash, onActivity, reloadKey }: { data: Data; flash: (m: string) => void; preview: boolean; onActivity: () => void; reloadKey: number }) {
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
      .then((m) => { if (!cancelled) setReport(buildMonthReport(m.tasks, m.expenses, [], m.activities)) })
      .catch((e) => { console.error('hours failed', e); if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [data.me.id, ym, version, reloadKey])

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
  const removeActivity = async (id: string) => {
    const { error } = await supabase.from('staff_activities').delete().eq('id', id)
    if (error) { console.error('delete activity failed', error); flash('לא הצלחנו למחוק. נסי שוב.'); return }
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
                <div className="kv"><span>החזר נסיעות <span className="card-meta">({report.travelTrips} נסיעות)</span></span><span className="v">{money(pay.travel)}</span></div>
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
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <div className="card-title">פעילות שלא תוכננה</div>
              <Button size="sm" onClick={onActivity}>דיווח שעות</Button>
            </div>
            {report.activities.length === 0 && <p className="muted">לא דיווחת על פעילות שלא תוכננה בחודש הזה. ליווי שלא נקבע ביומן אפשר לדווח כאן.</p>}
            {report.activities.map((a) => (
              <div key={a.id} className="kv" style={{ fontSize: 14 }}>
                <span><strong>{formatDM(parseISO(a.date))}</strong>{a.client ? ` · ${a.client}` : ''}
                  <div className="card-meta"><Ltr>{a.start}–{a.end}</Ltr> · {a.description} · <Badge tone={EXP[a.status][1]}>{EXP[a.status][0]}</Badge></div></span>
                <span className="row" style={{ gap: 4 }}><span className="v"><Ltr>{fmtHours(a.minutes)}</Ltr></span>
                  {a.status === 'pending' && <button type="button" className="icon-btn danger" aria-label={`ביטול דיווח: ${a.description}`} onClick={() => removeActivity(a.id)}><Icon name="trash" size={16} /></button>}
                </span>
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
                  {x.status === 'pending' && <button type="button" className="icon-btn danger" aria-label={`ביטול הוצאה: ${x.description}`} onClick={() => remove(x.id)}><Icon name="trash" size={16} /></button>}
                </span>
              </div>
            ))}
            <form onSubmit={add} noValidate className="stack" style={{ gap: 10, marginTop: 12 }}>
              <div className="card-label">דיווח על הוצאה חדשה</div>
              <TextField label="מה ההוצאה" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="למשל: ארוחת צהריים בזמן הביקור" />
              <TextField label="סכום (₪)" type="number" inputMode="decimal" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <SelectField label="קשור לביקור (אופציונלי)" value={taskId} onChange={setTaskId} placeholder="ללא"
                options={report.visits.map((v) => ({ value: v.id, label: `${formatDM(parseISO(v.date))} · ${v.client}` }))} />
              {err && <div role="alert" style={{ color: 'var(--danger)', font: '600 13px var(--font-ui)' }}>{err}</div>}
              <Button type="submit" size="lg">שליחה לאישור</Button>
            </form>
          </Card>
        </>
      )}
    </>
  )
}
