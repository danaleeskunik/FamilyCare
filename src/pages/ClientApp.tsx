import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import Modal from '../components/Modal'
import PaymentOptions from '../components/PaymentOptions'
import { Ltr, money } from '../components/ui'
import { SERVICES } from '../data/services'
import { PLAN_RATES } from '../data/pricing'
import { CONTACT, ROY } from '../lib/contact'
import { TODAY } from '../data/model'
import { loadMessages, loadPortal, photoUrl, sendMessage, sendRequest, type PortalClient, type PortalMessage, type PortalVisit } from '../lib/portal'
import { useAuth } from '../store/AuthStore'
import '../styles/portal.css'

type Tab = 'home' | 'visits' | 'orders' | 'messages' | 'info'
const TABS: [Tab, string][] = [['home', 'ראשי'], ['visits', 'פגישות'], ['orders', 'הזמנות'], ['messages', 'הודעות'], ['info', 'פרטים']]
const WEEKDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const ALON = { name: 'אלון', display: '054-9995858', tel: '0549995858' }
const dayLabel = (iso: string) => { const d = new Date(`${iso}T00:00:00`); return `יום ${WEEKDAYS[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}` }
const hm = (t: string | null) => (t ? t.slice(0, 5) : '')
const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
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

export default function ClientApp() {
  const { signOut } = useAuth()
  const [data, setData] = useState<{ clients: PortalClient[]; setup: boolean; failed: boolean } | null>(null)
  const [idx, setIdx] = useState(0)
  const [tab, setTab] = useState<Tab>('home')
  const [payOpen, setPayOpen] = useState(false)
  const [ts, setTs] = useState(() => safe('fc-ts') ?? '1')
  const [hc, setHc] = useState(() => safe('fc-hc') === '1')
  const [messages, setMessages] = useState<PortalMessage[] | null>(null)
  const [msgFailed, setMsgFailed] = useState(false)
  const [seen, setSeen] = useState<string>('')

  const reload = useCallback(async () => setData(await loadPortal()), [])
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

  return (
    <div className="portal" data-hc={hc ? '1' : '0'} style={{ ['--ts' as string]: ts }}>
      <a className="pt-skip" href="#pt-main">דילוג לתוכן</a>
      <header className="pt-head">
        <div className="pt-head-in">
          <img src={`${import.meta.env.BASE_URL}brand/logo-white.png`} height={40} alt="Family Care — always with you" />
          <div className="pt-tools" role="group" aria-label="התאמות נגישות">
            <button type="button" aria-pressed={ts === '1'} onClick={() => setSize('1')} aria-label="טקסט רגיל">א</button>
            <button type="button" aria-pressed={ts === '1.2'} onClick={() => setSize('1.2')} aria-label="טקסט גדול" style={{ fontSize: '1.2em' }}>א</button>
            <button type="button" aria-pressed={ts === '1.4'} onClick={() => setSize('1.4')} aria-label="טקסט גדול מאוד" style={{ fontSize: '1.45em' }}>א</button>
            <button type="button" aria-pressed={hc} onClick={toggleHc} aria-label="ניגודיות גבוהה" className="pt-hc">◐</button>
            <button type="button" onClick={() => void signOut()} className="pt-out">יציאה</button>
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
              {tab === 'home' && <Home c={c} go={setTab} pay={() => setPayOpen(true)} unread={unread} />}
              {tab === 'visits' && <Visits c={c} />}
              {tab === 'orders' && <Orders c={c} reload={reload} go={setTab} />}
              {tab === 'messages' && <Messages c={c} messages={messages} failed={msgFailed} onSent={async () => { const m = await loadMessages(c.id); if (m) setMessages(m) }} />}
              {tab === 'info' && <Info c={c} pay={() => setPayOpen(true)} />}
            </div>
          </>
        )}
      </main>

      {payOpen && c && <PayDialog c={c} onClose={() => setPayOpen(false)} />}
    </div>
  )
}

// ---------------------------------------------------------------- Home
function Home({ c, go, pay, unread }: { c: PortalClient; go: (t: Tab) => void; pay: () => void; unread: number }) {
  const upcoming = c.visits.filter((v) => v.date >= TODAY && v.status !== 'completed').sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
  const next = upcoming[0]
  const lastDone = c.visits.find((v) => v.summary)
  const month = TODAY.slice(0, 7)
  const used = c.visits.filter((v) => v.date.startsWith(month) && v.status === 'completed' && v.who).length
  const plan = PLAN_RATES.find((p) => p.id === c.plan_id)
  const total = c.plan_sessions ?? plan?.meetings ?? 0
  const trial = c.trial_ends_on && c.trial_ends_on >= TODAY
  return (
    <div className="pt-stack">
      <section className="pt-card pt-next" aria-labelledby="h-next">
        <h2 id="h-next">הפגישה הקרובה</h2>
        {next ? <VisitLine v={next} big /> : <p>עוד לא נקבעה פגישה. אפשר להזמין בלשונית "הזמנות", או לכתוב לנו.</p>}
      </section>

      <div className="pt-actions">
        <button type="button" className="pt-action main" onClick={() => go('orders')}><b>הזמנת שירות</b><span>תיקון, רופא, קניות, בילוי ועוד</span></button>
        <button type="button" className="pt-action" onClick={() => go('messages')}><b>הודעה לחברה</b><span>{unread ? `${unread} הודעות חדשות` : 'כתיבה חופשית'}</span></button>
        <button type="button" className="pt-action" onClick={pay}><b>תשלומים</b><span>העברה, Bit או PayBox</span></button>
        <a className="pt-action" href={tel(ALON.tel)}><b>להתקשר לאלון</b><span><Ltr>{ALON.display}</Ltr></span></a>
      </div>

      {c.companion && (
        <section className="pt-card pt-person" aria-labelledby="h-comp">
          <Avatar name={c.companion.name} photo={c.companion.photo} />
          <div>
            <h2 id="h-comp">המלווה שלכם</h2>
            <p className="pt-big">{c.companion.name}</p>
          </div>
          {c.companion.phone && <CallBtn phone={c.companion.phone} name={c.companion.name} />}
        </section>
      )}

      <section className="pt-card" aria-labelledby="h-plan">
        <div className="pt-row"><h2 id="h-plan">המסלול</h2><span className="pt-chip">{c.plan_name ?? plan?.name ?? 'לא הוגדר'}</span></div>
        {trial && <p className="pt-sub">תקופת היכרות עד {dayLabel(c.trial_ends_on!)}</p>}
        {total > 0 && (
          <>
            <div className="pt-row"><span>פגישות החודש</span><b><Ltr>{used} / {total}</Ltr></b></div>
            <div className="pt-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(used, total)} aria-label="פגישות שנוצלו החודש"><i style={{ width: `${Math.min(100, (used / total) * 100)}%` }} /></div>
          </>
        )}
      </section>

      {lastDone && (
        <section className="pt-card" aria-labelledby="h-last">
          <h2 id="h-last">סיכום הביקור האחרון</h2>
          <p className="pt-sub">{dayLabel(lastDone.date)}{lastDone.who ? ` · ${lastDone.who}` : ''}</p>
          <p>{lastDone.summary}</p>
        </section>
      )}
    </div>
  )
}

function VisitLine({ v, big }: { v: PortalVisit; big?: boolean }) {
  return (
    <div className={`pt-visit ${big ? 'big' : ''}`}>
      <div className="pt-when"><b>{dayLabel(v.date)}</b><span><Ltr>{hm(v.start)}{v.end ? `–${hm(v.end)}` : ''}</Ltr></span></div>
      <div className="pt-what"><b>{v.title}</b>{v.who && <span>עם {v.who}</span>}</div>
      <span className={`pt-status ${v.status}`}>{VISIT_STATUS[v.status] ?? v.status}</span>
    </div>
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
function Orders({ c, reload, go }: { c: PortalClient; reload: () => Promise<void>; go: (t: Tab) => void }) {
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
        {!c.can_request ? (
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

// ---------------------------------------------------------------- Messages
function Messages({ c, messages, failed, onSent }: { c: PortalClient; messages: PortalMessage[] | null; failed: boolean; onSent: () => Promise<void> }) {
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
      <form onSubmit={send} className="pt-form">
        <label>הודעה חדשה<textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} maxLength={4000} /></label>
        <button type="submit" className="pt-btn" disabled={busy || !text.trim()}>{busy ? 'שולחים…' : 'שליחה'}</button>
        {err && <p className="pt-msg err" role="alert">לא הצלחנו לשלוח. נסו שוב.</p>}
      </form>
    </section>
  )
}

// ---------------------------------------------------------------- Info
function Info({ c, pay }: { c: PortalClient; pay: () => void }) {
  const plan = PLAN_RATES.find((p) => p.id === c.plan_id)
  const invoices = c.invoices
  return (
    <div className="pt-stack">
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

      <section className="pt-card" aria-labelledby="h-plan2">
        <div className="pt-row"><h2 id="h-plan2">המסלול שלנו</h2><span className="pt-chip">{c.plan_name ?? plan?.name ?? 'לא הוגדר'}</span></div>
        {plan && (
          <dl className="pt-dl">
            <div><dt>מנוי חודשי</dt><dd>{money(plan.fee)}</dd></div>
            <div><dt>פגישות בחודש</dt><dd>{plan.meetings}</dd></div>
            <div><dt>שעות בפגישה</dt><dd>{plan.hours}</dd></div>
            <div><dt>שעה נוספת</dt><dd>{money(plan.rate)}</dd></div>
          </dl>
        )}
        <p className="pt-sub">שעה נוספת בין 19:00 ל-23:00 בתוספת 30%, ובין 23:00 ל-07:00 בתוספת 80%.</p>
      </section>

      <section className="pt-card" aria-labelledby="h-pay">
        <div className="pt-row"><h2 id="h-pay">תשלומים</h2><button type="button" className="pt-btn" onClick={pay}>לתשלום</button></div>
        {invoices.length === 0 ? <p className="pt-sub">עוד אין חשבוניות.</p> : (
          <div className="pt-list">
            {invoices.map((i) => (
              <div key={i.id} className="pt-contact"><div><b>{MONTHS[Number(i.month.slice(5, 7)) - 1]} {i.month.slice(0, 4)}</b><span>{i.status === 'paid' ? 'שולם' : i.status === 'card_declined' ? 'כרטיס נדחה' : 'ממתין לתשלום'}</span></div><b>{money(i.total)}</b></div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ---------------------------------------------------------------- Payments
function PayDialog({ c, onClose }: { c: PortalClient; onClose: () => void }) {
  const plan = PLAN_RATES.find((p) => p.id === c.plan_id)
  const [kind, setKind] = useState<'monthly' | 'extra'>('monthly')
  const [extra, setExtra] = useState('')
  const amount = kind === 'monthly' ? (plan?.fee ?? null) : Number(extra) > 0 ? Number(extra) : null
  return (
    <Modal title="תשלום" onClose={onClose}>
      <div className="portal pt-modal" style={{ ['--ts' as string]: 1 }}>
        <div className="pt-pills" role="group" aria-label="סוג התשלום">
          <button type="button" className={`pt-pill ${kind === 'monthly' ? 'on' : ''}`} aria-pressed={kind === 'monthly'} onClick={() => setKind('monthly')}>מנוי חודשי</button>
          <button type="button" className={`pt-pill ${kind === 'extra' ? 'on' : ''}`} aria-pressed={kind === 'extra'} onClick={() => setKind('extra')}>תשלום נוסף</button>
        </div>
        {kind === 'extra' && (
          <label className="pt-form" style={{ marginTop: 14 }}>סכום לתשלום (₪)
            <input type="number" inputMode="decimal" min="0" dir="ltr" value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="הסכום שסוכם איתנו" />
          </label>
        )}
        <div style={{ marginTop: 16 }}>
          <PaymentOptions amount={amount} reason={`${kind === 'monthly' ? 'מנוי חודשי' : 'תשלום נוסף'} · ${c.name}`} />
        </div>
        <p className="pt-sub" style={{ marginTop: 12 }}>אחרי ההעברה אפשר לשלוח לנו הודעה, ואנחנו נאשר את קבלת התשלום.</p>
      </div>
    </Modal>
  )
}
