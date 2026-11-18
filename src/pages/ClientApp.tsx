import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import Modal from '../components/Modal'
import PaymentOptions from '../components/PaymentOptions'
import { Ltr, money } from '../components/ui'
import { SERVICES } from '../data/services'
import { PLAN_RATES, RATE_BANDS, pctOf, usePrices } from '../data/pricing'
import { CONTACT, ROY } from '../lib/contact'
import { TODAY } from '../data/model'
import { decideQuote, loadMessages, loadMonthExtras, loadPortal, loadPortalPreview, photoUrl, sendHint, sendMessage, sendRequest, type MonthExtras, type PortalClient, type PortalMessage, type PortalVisit } from '../lib/portal'
import { useAuth } from '../store/AuthStore'
import SeniorApp from './SeniorApp'
import '../styles/portal.css'

type Tab = 'home' | 'visits' | 'orders' | 'messages' | 'pay'
const TABS: [Tab, string][] = [['home', 'ראשי'], ['visits', 'פגישות'], ['orders', 'הזמנות'], ['messages', 'הודעות'], ['pay', 'תשלום']]
const WEEKDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const ROLE: Record<string, string> = { personal_companion: 'מלווה אישית', social_worker: 'עובדת סוציאלית', student: 'סטודנט/ית' }
const hmin = (m: number) => `${Math.floor(m / 60)}:${String(Math.round(m % 60)).padStart(2, '0')}`
const visitMinutes = (v: PortalVisit) => (v.in_at && v.out_at ? Math.round((+new Date(v.out_at) - +new Date(v.in_at)) / 60000) : 0)
const clock = (iso: string) => new Date(iso).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
const ALON = { name: 'אלון', display: '054-9995858', tel: '0549995858' }
const dayLabel = (iso: string) => { const d = new Date(`${iso}T00:00:00`); return `יום ${WEEKDAYS[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}` }
const hm = (t: string | null) => (t ? t.slice(0, 5) : '')
const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const waLink = (p: string) => { const d = p.replace(/\D/g, ''); return `https://wa.me/${d.startsWith('972') ? d : d.startsWith('0') ? `972${d.slice(1)}` : `972${d}`}` }
const initials = (name: string) => name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('')
const safe = (k: string, v?: string) => { try { if (v === undefined) return window.localStorage.getItem(k); window.localStorage.setItem(k, v); return v } catch { return null } }

const REQUEST_STATUS: Record<string, [string, string]> = {
  new: ['התקבלה, נחזור אליכם בהקדם', 'wait'], converted: ['בטיפול ומשובצת', 'ok'], declined: ['לא ניתן לבצע, נחזור אליכם', 'no'],
}
const VISIT_STATUS: Record<string, string> = { planned: 'מתוכנן', confirmed: 'מאושר', in_progress: 'מתקיים עכשיו', completed: 'הושלם' }

function Avatar({ name, photo, size = 72 }: { name: string; photo: string | null; size?: number }) {
  const src = photoUrl(photo)
  return src
    ? <img className="pt-avatar" src={src} alt={name} width={size} height={size} style={{ width: size, height: size }} />
    : <span className="pt-avatar" aria-hidden="true" style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials(name)}</span>
}

function CallBtn({ phone, label, name }: { phone: string; label?: string; name: string }) {
  return <a className="pt-btn ghost" href={tel(phone)} aria-label={`התקשרות אל ${name}`}>{label ?? 'התקשרות'}</a>
}

/** previewId = an admin looking at this client's portal exactly as the family sees it (read only). */
export default function ClientApp({ previewId }: { previewId?: string } = {}) {
  usePrices()
  const { signOut } = useAuth()
  const [data, setData] = useState<{ clients: PortalClient[]; setup: boolean; failed: boolean } | null>(null)
  const [idx, setIdx] = useState(0)
  const [tab, setTab] = useState<Tab>('home')
  const [ts, setTs] = useState(() => safe('fc-ts') ?? '1')
  const [hc, setHc] = useState(() => safe('fc-hc') === '1')
  const [messages, setMessages] = useState<PortalMessage[] | null>(null)
  const [msgFailed, setMsgFailed] = useState(false)
  const [seen, setSeen] = useState<string>('')

  const reload = useCallback(async () => setData(previewId ? await loadPortalPreview(previewId) : await loadPortal()), [previewId])
  useEffect(() => { void reload() }, [reload])

  const c = data?.clients[idx]
  const cid = c?.id
  const readSeenKey = cid ? `fc-seen-${cid}` : ''
  useEffect(() => { if (readSeenKey) setSeen(safe(readSeenKey) ?? '') }, [readSeenKey])

  // The thread refreshes every 30 seconds so a reply from the company shows up without reloading.
  useEffect(() => {
    if (!cid) return
    let alive = true
    const pull = async () => { const m = await loadMessages(cid); if (!alive) return; setMsgFailed(!m); if (m) setMessages(m) }
    void pull()
    const t = window.setInterval(() => void pull(), 30000)
    return () => { alive = false; window.clearInterval(t) }
  }, [cid])

  const unread = useMemo(() => (messages ?? []).filter((m) => !m.from_family && m.created_at > seen).length, [messages, seen])
  useEffect(() => {
    if (tab === 'messages' && messages?.length && readSeenKey) { const last = messages[messages.length - 1].created_at; safe(readSeenKey, last); setSeen(last) }
  }, [tab, messages, readSeenKey])

  const setSize = (v: string) => { setTs(v); safe('fc-ts', v) }
  const toggleHc = () => { setHc((x) => { safe('fc-hc', x ? '0' : '1'); return !x }) }

  const seniorPreview = !!previewId && new URLSearchParams(window.location.search).get('senior') === '1'
  if (c && (c.is_self || seniorPreview)) return <SeniorApp c={c} reload={reload} preview={!!previewId} signOut={() => void signOut()} />

  return (
    <div className="portal" data-hc={hc ? '1' : '0'} style={{ ['--ts' as string]: ts }}>
      <a className="pt-skip" href="#pt-main">דילוג לתוכן</a>
      {previewId && (
        <div role="status" style={{ background: '#FFF4E5', color: '#7A4A00', padding: '10px 16px', textAlign: 'center', fontWeight: 600, position: 'sticky', top: 0, zIndex: 50 }}>
          תצוגת מנהל בקריאה בלבד: כך הלקוח רואה את האזור האישי. {' '}
          <a href={`/admin/clients/${previewId}`} style={{ color: 'inherit', textDecoration: 'underline' }}>חזרה לתיק הלקוח</a>
        </div>
      )}
      <header className="pt-head">
        <div className="pt-head-in">
          <img src={`${import.meta.env.BASE_URL}brand/logo-white.png`} height={40} alt="Family Care — always with you" />
          <div className="pt-tools" role="group" aria-label="התאמות נגישות">
            <button type="button" aria-pressed={ts === '1'} onClick={() => setSize('1')} aria-label="טקסט רגיל">א</button>
            <button type="button" aria-pressed={ts === '1.2'} onClick={() => setSize('1.2')} aria-label="טקסט גדול" style={{ fontSize: '1.2em' }}>א</button>
            <button type="button" aria-pressed={ts === '1.4'} onClick={() => setSize('1.4')} aria-label="טקסט גדול מאוד" style={{ fontSize: '1.45em' }}>א</button>
            <button type="button" aria-pressed={hc} onClick={toggleHc} aria-label="ניגודיות גבוהה" className="pt-hc">◐</button>
            {!previewId && <button type="button" onClick={() => void signOut()} className="pt-out">יציאה</button>}
          </div>
        </div>
      </header>

      <main id="pt-main" className="pt-main" tabIndex={-1}>
        {!data && <p className="pt-note" role="status">טוענים…</p>}
        {data?.setup && <p className="pt-note">האזור האישי עוד לא הופעל. אפשר לפנות אלינו בטלפון {ALON.display}.</p>}
        {data?.failed && <p className="pt-note" role="alert">לא הצלחנו לטעון את הפרטים. <button type="button" className="pt-link" onClick={() => void reload()}>ניסיון נוסף</button></p>}
        {data && !data.setup && !data.failed && !c && <p className="pt-note">עדיין לא חיברנו לחשבון הזה אף לקוח. אפשר לפנות אלינו בטלפון {ALON.display}.</p>}

        {c && (
          <>
            <section className="pt-hello">
              <h1>שלום {c.my_name.split(' ')[0]}</h1>
              <p>הפרטים של {c.name}</p>
              {data!.clients.length > 1 && (
                <label className="pt-switch">מי מההורים
                  <select value={idx} onChange={(e) => { setIdx(Number(e.target.value)); setMessages(null) }}>{data!.clients.map((x, i) => <option key={x.id} value={i}>{x.name}</option>)}</select>
                </label>
              )}
            </section>

            <nav className="pt-tabs" role="tablist" aria-label="חלקי האזור האישי">
              {TABS.map(([id, label]) => (
                <button key={id} type="button" role="tab" id={`tab-${id}`} aria-selected={tab === id} aria-controls="pt-panel" className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
                  {label}{id === 'messages' && unread > 0 && <span className="pt-dot" aria-label={`${unread} הודעות חדשות`}>{unread}</span>}
                </button>
              ))}
            </nav>

            <div id="pt-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
              {tab === 'home' && <Home c={c} go={setTab} unread={unread} reload={reload} preview={!!previewId} />}
              {tab === 'visits' && <Visits c={c} />}
              {tab === 'orders' && <Orders c={c} reload={reload} go={setTab} preview={!!previewId} />}
              {tab === 'messages' && <Messages c={c} preview={!!previewId} messages={messages} failed={msgFailed} onSent={async () => { const m = await loadMessages(c.id); if (m) setMessages(m) }} />}
              {tab === 'pay' && <Payment c={c} />}
            </div>
          </>
        )}
      </main>

    </div>
  )
}

// ---------------------------------------------------------------- Home
const monthHours = (c: PortalClient) => {
  const month = TODAY.slice(0, 7)
  const plan = PLAN_RATES.find((p) => p.id === c.plan_id)
  const doneMin = c.visits.filter((v) => v.date.startsWith(month) && v.status === 'completed').reduce((a, v) => a + visitMinutes(v), 0)
  const contractMin = Math.round((c.plan_sessions ?? plan?.meetings ?? 0) * Number(c.plan_hours ?? plan?.hours ?? 0) * 60)
  return { doneMin, contractMin, extraMin: Math.max(0, doneMin - contractMin) }
}

function Home({ c, go, unread, reload, preview }: { c: PortalClient; go: (t: Tab) => void; unread: number; reload: () => Promise<void>; preview: boolean }) {
  const upcoming = c.visits.filter((v) => v.date >= TODAY && v.status !== 'completed').sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
  const next = upcoming[0]
  const lastDone = c.visits.find((v) => v.summary)
  const month = TODAY.slice(0, 7)
  const used = c.visits.filter((v) => v.date.startsWith(month) && v.status === 'completed' && v.who).length
  const plan = PLAN_RATES.find((p) => p.id === c.plan_id)
  const total = c.plan_sessions ?? plan?.meetings ?? 0
  const trial = c.trial_ends_on && c.trial_ends_on >= TODAY
  const doneMin = c.visits.filter((v) => v.date.startsWith(month) && v.status === 'completed').reduce((a, v) => a + visitMinutes(v), 0)
  const contractMin = Math.round((c.plan_sessions ?? plan?.meetings ?? 0) * Number(c.plan_hours ?? plan?.hours ?? 0) * 60)
  const extraMin = Math.max(0, doneMin - contractMin)
  const pending = (c.quotes ?? []).filter((q) => q.status === 'pending')
  return (
    <div className="pt-stack">
      <section className="pt-card pt-next" aria-labelledby="h-next">
        <h2 id="h-next">הפגישה הקרובה</h2>
        {next ? <VisitLine v={next} big /> : <p>עוד לא נקבעה פגישה. אפשר להזמין בלשונית "הזמנות", או לכתוב לנו.</p>}
      </section>

      {c.companion && (
        <section className="pt-card pt-person" aria-labelledby="h-comp">
          <Avatar name={c.companion.name} photo={c.companion.photo} />
          <div>
            <h2 id="h-comp">המלווה שלכם</h2>
            <p className="pt-big">{c.companion.name}</p>
            {c.companion.role && <p className="pt-sub">{ROLE[c.companion.role] ?? c.companion.role}</p>}
            {c.companion.phone && <p className="pt-sub"><Ltr>{c.companion.phone}</Ltr></p>}
          </div>
          {c.companion.phone && (
            <div className="pt-row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <CallBtn phone={c.companion.phone} name={c.companion.name} />
              <a className="pt-btn ghost" href={waLink(c.companion.phone)} target="_blank" rel="noopener noreferrer" aria-label={`הודעת וואטסאפ אל ${c.companion.name}`}>וואטסאפ</a>
            </div>
          )}
        </section>
      )}

      {pending.length > 0 && <QuotesCard c={c} quotes={pending} reload={reload} preview={preview} title="הצעות מחיר לאישור" />}

      <div className="pt-actions">
        <button type="button" className="pt-action main" onClick={() => go('orders')}><b>הזמנת שירות</b><span>תיקון, רופא, קניות, בילוי ועוד</span></button>
        <button type="button" className="pt-action" onClick={() => go('messages')}><b>הודעה לחברה</b><span>{unread ? `${unread} הודעות חדשות` : 'כתיבה חופשית'}</span></button>
        <button type="button" className="pt-action" onClick={() => go('pay')}><b>תשלום</b><span>סיכום חודשי, העברה, Bit או PayBox</span></button>
        <a className="pt-action" href={tel(ALON.tel)}><b>להתקשר לאלון</b><span><Ltr>{ALON.display}</Ltr></span></a>
      </div>

      {c.requests.length > 0 && (
        <section className="pt-card" aria-labelledby="h-req">
          <div className="pt-row"><h2 id="h-req">ההזמנות שלכם</h2><button type="button" className="pt-link" onClick={() => go('orders')}>לכל ההזמנות</button></div>
          <div className="pt-list">
            {c.requests.slice(0, 3).map((r) => (
              <div key={r.id} className="pt-row" style={{ alignItems: 'flex-start' }}>
                <span><b>{r.category ?? 'בקשה'}</b><br />{r.description.split('\n')[0]}</span>
                <span className={`pt-status ${REQUEST_STATUS[r.status]?.[1] ?? ''}`}>{r.status === 'new' ? 'הזמנה חדשה' : r.status === 'converted' ? 'בטיפול ומשובצת' : 'לא ניתן לבצע'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="pt-card" aria-labelledby="h-plan">
        <div className="pt-row"><h2 id="h-plan">המסלול</h2><span className="pt-chip">{c.plan_name ?? plan?.name ?? 'לא הוגדר'}</span></div>
        {trial && <p className="pt-sub">תקופת היכרות עד {dayLabel(c.trial_ends_on!)}</p>}
        {total > 0 && (
          <>
            <div className="pt-row"><span>פגישות החודש</span><b><Ltr>{used} / {total}</Ltr></b></div>
            {contractMin > 0 && <div className="pt-row"><span>שעות החודש לפי החוזה</span><b><Ltr>{hmin(Math.min(doneMin, contractMin))} / {hmin(contractMin)}</Ltr></b></div>}
            {extraMin > 0 && <div className="pt-row"><span>שעות נוספות (לפי דיווח המלווה)</span><b><Ltr>{hmin(extraMin)}</Ltr></b></div>}
            <div className="pt-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(used, total)} aria-label="פגישות שנוצלו החודש"><i style={{ width: `${Math.min(100, (used / total) * 100)}%` }} /></div>
          </>
        )}
      </section>

      {lastDone && (
        <section className="pt-card" aria-labelledby="h-last">
          <h2 id="h-last">סיכום הביקור האחרון</h2>
          <p className="pt-sub">{dayLabel(lastDone.date)}{lastDone.who ? ` · ${lastDone.who}` : ''}</p>
          <p>{lastDone.summary}</p>
          <button type="button" className="pt-link" onClick={() => go('visits')}>כל הסיכומים בלשונית "פגישות"</button>
        </section>
      )}

      <Contacts c={c} />
    </div>
  )
}

function VisitLine({ v, big }: { v: PortalVisit; big?: boolean }) {
  return (
    <div className={`pt-visit ${big ? 'big' : ''}`}>
      <div className="pt-when"><b>{dayLabel(v.date)}</b><span><Ltr>{hm(v.start)}{v.end ? `–${hm(v.end)}` : ''}</Ltr></span></div>
      <div className="pt-what"><b>{v.title}</b>{v.who && <span>עם {v.who}</span>}<span>מקום: {v.location?.trim() || 'בבית'}</span></div>
      <span className={`pt-status ${v.status}`}>{VISIT_STATUS[v.status] ?? v.status}</span>
      {v.in_at && <span className="pt-sub" style={{ gridColumn: '1 / -1' }}>{v.out_at ? `המלווה הגיע ב-${clock(v.in_at)} וסיים ב-${clock(v.out_at)}` : `המלווה הגיע ב-${clock(v.in_at)} ונמצא כעת בביקור`}</span>}
    </div>
  )
}

function QuotesCard({ c, quotes, reload, preview, title }: { c: PortalClient; quotes: NonNullable<PortalClient['quotes']>; reload: () => Promise<void>; preview: boolean; title: string }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const decide = async (id: string, ok: boolean) => {
    setBusy(id); setErr('')
    const done = await decideQuote(id, ok)
    setBusy(null)
    if (!done) { setErr('לא הצלחנו לעדכן. אפשר לנסות שוב או להתקשר אלינו.'); return }
    await reload()
  }
  const STATUS: Record<string, [string, string]> = { pending: ['ממתינה לאישור', 'wait'], approved: ['אושרה', 'ok'], declined: ['נדחתה', 'no'] }
  return (
    <section className="pt-card" aria-labelledby={`h-q-${title}`}>
      <h2 id={`h-q-${title}`}>{title}</h2>
      <div className="pt-list">
        {quotes.map((q) => (
          <div key={q.id} className="pt-req" style={{ padding: '12px 0' }}>
            <div className="pt-row"><b>{q.title}</b><b>{money(q.amount)}</b></div>
            {q.vendor && <p className="pt-sub">{q.vendor}</p>}
            {q.note && <p className="pt-pre">{q.note}</p>}
            {q.status === 'pending' ? (
              c.can_request && !preview ? (
                <div className="pt-row" style={{ gap: 8, justifyContent: 'flex-start', marginTop: 8 }}>
                  <button type="button" className="pt-btn" disabled={busy === q.id} onClick={() => decide(q.id, true)}>אישור</button>
                  <button type="button" className="pt-btn ghost" disabled={busy === q.id} onClick={() => decide(q.id, false)}>דחייה</button>
                </div>
              ) : <span className="pt-status wait">ממתינה לאישור</span>
            ) : <span className={`pt-status ${STATUS[q.status][1]}`}>{STATUS[q.status][0]}</span>}
          </div>
        ))}
      </div>
      {err && <p className="pt-msg err" role="alert">{err}</p>}
    </section>
  )
}

// ---------------------------------------------------------------- Visits
function Visits({ c }: { c: PortalClient }) {
  const upcoming = c.visits.filter((v) => v.date >= TODAY && v.status !== 'completed').sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
  const past = c.visits.filter((v) => !(v.date >= TODAY && v.status !== 'completed'))
  return (
    <div className="pt-stack">
      <section className="pt-card" aria-labelledby="h-up">
        <h2 id="h-up">פגישות קרובות</h2>
        {upcoming.length === 0 ? <p>אין פגישות קרובות. אפשר להזמין בלשונית "הזמנות".</p> : <div className="pt-list">{upcoming.map((v) => <VisitLine key={v.id} v={v} />)}</div>}
      </section>
      <section className="pt-card" aria-labelledby="h-hist">
        <h2 id="h-hist">היסטוריית פגישות</h2>
        {past.length === 0 ? <p>עוד אין פגישות קודמות.</p> : (
          <div className="pt-list">
            {past.map((v) => (
              <details key={v.id} className="pt-det">
                <summary><VisitLine v={v} /></summary>
                <p className="pt-summary">{v.summary ?? 'סיכום הביקור יופיע כאן אחרי שנאשר אותו.'}</p>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ---------------------------------------------------------------- Orders
function Orders({ c, reload, go, preview }: { c: PortalClient; reload: () => Promise<void>; go: (t: Tab) => void; preview?: boolean }) {
  const [cat, setCat] = useState<number | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [details, setDetails] = useState('')
  const [date, setDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const items = cat === null || cat >= SERVICES.length ? [] : SERVICES[cat].groups.flatMap((g) => g.items)
  const catName = cat === null ? '' : cat >= SERVICES.length ? 'אחר' : SERVICES[cat].title

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (cat === null) { setMsg({ ok: false, text: 'בחרו תחום' }); return }
    const text = [picked.join(', '), details.trim()].filter(Boolean).join('\n')
    if (!text) { setMsg({ ok: false, text: 'בחרו שירות או כתבו מה צריך' }); return }
    setBusy(true); setMsg(null)
    const ok = await sendRequest(c.id, c.my_contact_id, catName, text, date)
    setBusy(false)
    if (!ok) { setMsg({ ok: false, text: 'לא הצלחנו לשלוח. אפשר לנסות שוב, או להתקשר אלינו.' }); return }
    setMsg({ ok: true, text: 'הבקשה נשלחה. נחזור אליכם בהקדם.' })
    setCat(null); setPicked([]); setDetails(''); setDate('')
    await reload()
  }

  return (
    <div className="pt-stack">
      <section className="pt-card" aria-labelledby="h-new">
        <h2 id="h-new">הזמנת שירות חדשה</h2>
        {preview ? (
          <p>בתצוגת מנהל אי אפשר להזמין שירות. כאן הלקוח בוחר תחום ושירות ושולח בקשה.</p>
        ) : !c.can_request ? (
          <p>לחשבון הזה יש הרשאת צפייה בלבד. אפשר <button type="button" className="pt-link" onClick={() => go('messages')}>לכתוב לנו הודעה</button>.</p>
        ) : (
          <form onSubmit={submit} className="pt-form" noValidate>
            <fieldset>
              <legend>באיזה תחום?</legend>
              <div className="pt-pills">
                {[...SERVICES.map((s) => s.title), 'אחר'].map((t, i) => (
                  <button key={t} type="button" className={`pt-pill ${cat === i ? 'on' : ''}`} aria-pressed={cat === i} onClick={() => { setCat(i); setPicked([]) }}>{t}</button>
                ))}
              </div>
            </fieldset>
            {items.length > 0 && (
              <fieldset>
                <legend>מה בדיוק? אפשר לסמן כמה</legend>
                <div className="pt-pills">
                  {items.map((t) => (
                    <button key={t} type="button" className={`pt-pill sm ${picked.includes(t) ? 'on' : ''}`} aria-pressed={picked.includes(t)} onClick={() => setPicked((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])}>{t}</button>
                  ))}
                </div>
              </fieldset>
            )}
            <label>פרטים נוספים
              <textarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="למשל: המזגן בסלון לא מקרר מאתמול" />
            </label>
            <label>מתי נוח? (לא חובה)
              <input type="date" min={TODAY} value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <button type="submit" className="pt-btn" disabled={busy}>{busy ? 'שולחים…' : 'שליחת הבקשה'}</button>
          </form>
        )}
        <p className={`pt-msg ${msg?.ok ? 'ok' : 'err'}`} role="status" aria-live="polite">{msg?.text}</p>
      </section>

      <HintsCard c={c} reload={reload} preview={!!preview} />

      {(c.quotes ?? []).some((q) => q.status !== 'pending') && <QuotesCard c={c} quotes={(c.quotes ?? []).filter((q) => q.status !== 'pending')} reload={reload} preview={!!preview} title="הצעות מחיר קודמות" />}

      <section className="pt-card" aria-labelledby="h-reqs">
        <h2 id="h-reqs">היסטוריית הזמנות</h2>
        {c.requests.length === 0 ? <p>עוד לא נשלחו הזמנות.</p> : (
          <div className="pt-list">
            {c.requests.map((r) => {
              const [label, tone] = REQUEST_STATUS[r.status] ?? [r.status, 'wait']
              return (
                <div key={r.id} className="pt-req">
                  <div className="pt-row"><b>{r.category ?? 'בקשה'}</b><span className="pt-sub">{dayLabel(r.created_at.slice(0, 10))}</span></div>
                  <p className="pt-pre">{r.description}</p>
                  {r.preferred_date && <p className="pt-sub">מועד מבוקש: {dayLabel(r.preferred_date)}</p>}
                  <span className={`pt-status ${tone}`}>{label}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function HintsCard({ c, reload, preview }: { c: PortalClient; reload: () => Promise<void>; preview: boolean }) {
  const [text, setText] = useState('')
  const [taskId, setTaskId] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const upcoming = c.visits.filter((v) => v.date >= TODAY && v.status !== 'completed').sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) { setMsg({ ok: false, text: 'כתבו את הדגש' }); return }
    setBusy(true); setMsg(null)
    const ok = await sendHint(c.id, text, taskId || null)
    setBusy(false)
    if (!ok) { setMsg({ ok: false, text: 'לא הצלחנו לשלוח. אפשר לנסות שוב.' }); return }
    setText(''); setTaskId(''); setMsg({ ok: true, text: 'הדגש נשלח למלווה.' })
    await reload()
  }
  return (
    <section className="pt-card" aria-labelledby="h-hint">
      <h2 id="h-hint">דגשים למלווה</h2>
      <p className="pt-sub">הערה שהמלווה תראה לפני הביקור: לביקור מסוים או באופן כללי.</p>
      {c.can_request && !preview && (
        <form onSubmit={send} className="pt-form" noValidate>
          <label>הדגש
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="למשל: אמא מעדיפה תה בלי סוכר, וחשוב לשאול אותה על התור לרופא" />
          </label>
          <label>עבור
            <select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
              <option value="">כל הביקורים (כללי)</option>
              {upcoming.map((v) => <option key={v.id} value={v.id}>{dayLabel(v.date)} · {hm(v.start)}</option>)}
            </select>
          </label>
          <button type="submit" className="pt-btn" disabled={busy}>{busy ? 'שולחים…' : 'שליחה למלווה'}</button>
        </form>
      )}
      <p className={`pt-msg ${msg?.ok ? 'ok' : 'err'}`} role="status" aria-live="polite">{msg?.text}</p>
      {(c.hints ?? []).length > 0 && (
        <div className="pt-list">{(c.hints ?? []).slice(0, 5).map((h) => (
          <div key={h.id} style={{ padding: '10px 0' }}><p className="pt-pre">{h.body}</p><p className="pt-sub">{dayLabel(h.created_at.slice(0, 10))}{h.task_id ? ' · לביקור מסוים' : ' · כללי'}</p></div>
        ))}</div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------- Messages
function Messages({ c, messages, failed, onSent, preview }: { c: PortalClient; messages: PortalMessage[] | null; failed: boolean; onSent: () => Promise<void>; preview?: boolean }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() || busy) return
    setBusy(true); setErr(false)
    const ok = await sendMessage(c.id, c.my_name, text)
    setBusy(false)
    if (!ok) { setErr(true); return }
    setText(''); await onSent()
  }
  const time = (iso: string) => { const d = new Date(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
  return (
    <section className="pt-card" aria-labelledby="h-msg">
      <h2 id="h-msg">שיחה עם הצוות</h2>
      <p className="pt-sub">כאן אפשר לכתוב לנו על כל דבר. נחזור אליכם בהקדם.</p>
      <div className="pt-thread" role="log" aria-live="polite" aria-label="ההודעות">
        {messages === null && <p>{failed ? 'ההודעות עוד לא זמינות. אפשר להתקשר אלינו.' : 'טוענים…'}</p>}
        {messages?.length === 0 && <p>עוד אין הודעות. אפשר להתחיל.</p>}
        {messages?.map((m) => (
          <div key={m.id} className={`pt-bubble ${m.from_family ? 'mine' : 'theirs'}`}>
            <span className="pt-who">{m.from_family ? (m.sender_name ?? 'אתם') : 'Family Care'}</span>
            <p className="pt-pre">{m.body}</p>
            <span className="pt-sub">{time(m.created_at)}</span>
          </div>
        ))}
      </div>
      {preview ? <p className="pt-sub">בתצוגת מנהל אי אפשר לשלוח הודעה. המענה ללקוח נעשה מתיק הלקוח, בלשונית "הודעות".</p> : <form onSubmit={send} className="pt-form">
        <label>הודעה חדשה<textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} maxLength={4000} /></label>
        <button type="submit" className="pt-btn" disabled={busy || !text.trim()}>{busy ? 'שולחים…' : 'שליחה'}</button>
        {err && <p className="pt-msg err" role="alert">לא הצלחנו לשלוח. נסו שוב.</p>}
      </form>}
    </section>
  )
}

// ---------------------------------------------------------------- Info
function Contacts({ c }: { c: PortalClient }) {
  return (
    <>
      <section className="pt-card" aria-labelledby="h-phones">
        <h2 id="h-phones">טלפונים חשובים</h2>
        <div className="pt-list">
          <div className="pt-contact"><div><b>{ALON.name}</b><span>זמינות 24/7, גם בחירום</span></div><a className="pt-btn ghost" href={tel(ALON.tel)}><Ltr>{ALON.display}</Ltr></a></div>
          <div className="pt-contact"><div><b>רועי</b><span>משרד ותיאום</span></div><a className="pt-btn ghost" href={tel(ROY.tel)}><Ltr>{ROY.display}</Ltr></a></div>
          <div className="pt-contact"><div><b>וואטסאפ</b><span>הודעה כתובה</span></div><a className="pt-btn ghost" href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">פתיחה</a></div>
          <div className="pt-contact"><div><b>מייל</b><span>{CONTACT.email}</span></div><a className="pt-btn ghost" href={`mailto:${CONTACT.email}`}>כתיבה</a></div>
          {c.companion?.phone && <div className="pt-contact"><div><b>{c.companion.name}</b><span>המלווה</span></div><CallBtn phone={c.companion.phone} name={c.companion.name} label="התקשרות" /></div>}
        </div>
      </section>

      <section className="pt-card" aria-labelledby="h-fam">
        <h2 id="h-fam">אנשי קשר של המשפחה</h2>
        {c.contacts.length === 0 ? <p>עוד לא הוזנו אנשי קשר.</p> : (
          <div className="pt-list">
            {c.contacts.map((p) => (
              <div key={p.id} className="pt-contact">
                <div><b>{p.name}</b><span>{[p.relation, p.type === 'physician' ? 'רופא/ה מטפל/ת' : null, p.orderer ? 'מזמין/ת השירות' : null].filter(Boolean).join(' · ')}</span></div>
                {p.phone && <a className="pt-btn ghost" href={tel(p.phone)}><Ltr>{p.phone}</Ltr></a>}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

/** The payment tab: plan in one line, the month split into membership (standing order) and extras, and the invoices. */
function Payment({ c }: { c: PortalClient }) {
  const plan = PLAN_RATES.find((p) => p.id === c.plan_id)
  const fee = c.plan_fee ?? plan?.fee ?? 0
  const month = TODAY.slice(0, 7)
  const monthName = `${MONTHS[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`
  const [extras, setExtras] = useState<MonthExtras | null>(null)
  const [prices, setPrices] = useState(false)
  const [pay, setPay] = useState(false)
  useEffect(() => { let off = false; void loadMonthExtras(c.id, `${month}-01`).then((x) => { if (!off) setExtras(x) }); return () => { off = true } }, [c.id, month])
  const { extraMin } = monthHours(c)
  const hoursCharge = (extras?.hours ?? []).reduce((a, h) => a + h.charge, 0)
  const expenses = extras?.expenses ?? []
  const expensesSum = expenses.reduce((a, e) => a + e.amount, 0)
  const extrasTotal = hoursCharge + expensesSum
  return (
    <div className="pt-stack">
      <section className="pt-card" aria-labelledby="h-plan2">
        <div className="pt-row" style={{ flexWrap: 'wrap', gap: 8 }}>
          <h2 id="h-plan2" style={{ margin: 0 }}>המסלול שלנו</h2>
          <span className="pt-chip">{c.plan_name ?? plan?.name ?? 'לא הוגדר'}</span>
          {plan && <span className="pt-sub" style={{ margin: 0 }}>{money(fee)} לחודש · {c.plan_sessions ?? plan.meetings} פגישות · {c.plan_hours ?? plan.hours} שעות בפגישה</span>}
        </div>
        <button type="button" className="pt-btn ghost" style={{ marginTop: 10 }} onClick={() => setPrices(true)}>מחיר שעות נוספות</button>
      </section>

      <section className="pt-card" aria-labelledby="h-sum">
        <h2 id="h-sum">סיכום {monthName}</h2>
        <h3 className="pt-sub" style={{ marginTop: 12 }}>1. דמי מנוי</h3>
        <div className="pt-row"><span>מנוי חודשי <span className="pt-sub">(משולם בהוראת קבע)</span></span><b>{money(fee)}</b></div>

        <h3 className="pt-sub" style={{ marginTop: 16 }}>2. הוצאות נוספות</h3>
        {(extraMin > 0 || (extras?.hours.length ?? 0) > 0) && (
          <div className="pt-row"><span>שעות נוספות: <Ltr>{hmin(extraMin || extras!.hours.reduce((a, h) => a + h.minutes, 0))}</Ltr></span><b>{hoursCharge > 0 ? money(hoursCharge) : 'ממתין לחישוב'}</b></div>
        )}
        {expenses.map((e) => <div key={e.id} className="pt-row"><span>{e.text} <span className="pt-sub">{dayLabel(e.date)}</span></span><b>{money(e.amount)}</b></div>)}
        {extraMin === 0 && !extras?.hours.length && expenses.length === 0 && <p className="pt-sub">אין עדיין הוצאות נוספות החודש.</p>}
        <div className="pt-row" style={{ marginTop: 8, fontWeight: 700 }}><span>סה"כ הוצאות נוספות</span><b>{money(extrasTotal)}</b></div>
        <button type="button" className="pt-btn" style={{ marginTop: 14 }} onClick={() => setPay(true)} disabled={extrasTotal <= 0}>תשלום {extrasTotal > 0 ? money(extrasTotal) : ''}</button>
      </section>

      <section className="pt-card" aria-labelledby="h-inv">
        <h2 id="h-inv">חשבוניות</h2>
        {c.invoices.length === 0 ? <p className="pt-sub">עוד אין חשבוניות.</p> : (
          <div className="pt-list">
            {c.invoices.map((i) => (
              <div key={i.id} className="pt-contact"><div><b>{MONTHS[Number(i.month.slice(5, 7)) - 1]} {i.month.slice(0, 4)}</b><span>{i.status === 'paid' ? 'שולם' : i.status === 'card_declined' ? 'כרטיס נדחה' : 'ממתין לתשלום'}</span></div><b>{money(i.total)}</b></div>
            ))}
          </div>
        )}
      </section>
      {prices && <PriceListDialog onClose={() => setPrices(false)} />}
      {pay && <PayDialog c={c} amount={extrasTotal} onClose={() => setPay(false)} />}
    </div>
  )
}

/** Read-only price list, the same numbers the company edits in Finance and shows on the site. */
function PriceListDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="מחיר שעות נוספות" onClose={onClose}>
      <div className="portal pt-modal" style={{ ['--ts' as string]: 1 }}>
        <div className="pt-list">
          {PLAN_RATES.map((p) => (
            <div key={p.id} className="pt-contact" style={{ alignItems: 'flex-start' }}>
              <div><b>{p.name}</b><span>מנוי {money(p.fee)} · {p.meetings} פגישות · {p.hours} שעות בפגישה</span></div>
              <b><Ltr>{money(p.rate)}</Ltr></b>
            </div>
          ))}
        </div>
        <p className="pt-sub" style={{ marginTop: 12 }}>המחיר הוא לשעה נוספת בין 07:00 ל-19:00. בין 19:00 ל-23:00 המחיר הוא {pctOf(RATE_BANDS[1].mult)}%, ובין 23:00 ל-07:00 הוא {pctOf(RATE_BANDS[2].mult)}%. החישוב יחסי לדקות.</p>
        <button type="button" className="pt-btn" style={{ marginTop: 14 }} onClick={onClose}>חזרה לתשלום</button>
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------- Payments
function PayDialog({ c, amount, onClose }: { c: PortalClient; amount: number; onClose: () => void }) {
  return (
    <Modal title="תשלום" onClose={onClose}>
      <div className="portal pt-modal" style={{ ['--ts' as string]: 1 }}>
        <p className="pt-sub">הוצאות נוספות לחודש. דמי המנוי משולמים בהוראת קבע.</p>
        <div style={{ marginTop: 16 }}>
          <PaymentOptions amount={amount > 0 ? amount : null} reason={`הוצאות נוספות · ${c.name}`} />
        </div>
        <p className="pt-sub" style={{ marginTop: 12 }}>אחרי ההעברה אפשר לשלוח לנו הודעה, ואנחנו נאשר את קבלת התשלום.</p>
      </div>
    </Modal>
  )
}
