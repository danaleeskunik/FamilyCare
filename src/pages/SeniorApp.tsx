import { useState, type FormEvent } from 'react'
import Modal from '../components/Modal'
import { Ltr } from '../components/ui'
import { TODAY } from '../data/model'
import { addDays, parseISO, toISO } from '../lib/dates'
import { photoUrl, sendFeedback, sendRequest, type PortalClient, type PortalVisit } from '../lib/portal'
import { ROLE_LABEL } from './portalShared'

const WEEKDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const hm = (t: string | null) => (t ? t.slice(0, 5) : '')
const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
const first = (n: string) => n.trim().split(/\s+/)[0]
const when = (iso: string) => {
  if (iso === TODAY) return 'היום'
  if (iso === toISO(addDays(parseISO(TODAY), 1))) return 'מחר'
  return `ביום ${WEEKDAYS[parseISO(iso).getDay()]}`
}
const dayName = (iso: string) => (iso === TODAY ? 'היום' : iso === toISO(addDays(parseISO(TODAY), 1)) ? 'מחר' : `יום ${WEEKDAYS[parseISO(iso).getDay()]}`)
const FACES: [number, string, string][] = [[1, '😞', 'ממש לא טוב'], [2, '🙁', 'לא כל כך'], [3, '😐', 'בסדר'], [4, '🙂', 'טוב'], [5, '😍', 'מצוין']]
const WANTS = ['קפה ומפגש', 'רופא או קופת חולים', 'קניות', 'בילוי, הצגה או טיול', 'תיקון בבית', 'הסעה', 'משהו אחר']

/** The client's own screen: big letters, few choices, nothing to get lost in. */
export default function SeniorApp({ c, reload, preview, signOut }: { c: PortalClient; reload: () => Promise<void>; preview: boolean; signOut: () => void }) {
  const [wish, setWish] = useState(false)
  const [done, setDone] = useState(false)
  const [rated, setRated] = useState<string | null>(null)
  const comp = c.companion
  const photo = comp ? photoUrl(comp.photo) : null
  const live = c.visits.filter((v) => v.status !== 'cancelled')
  const upcoming = live.filter((v) => v.date >= TODAY && v.status !== 'completed').sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
  const inVisit = live.find((v) => v.status === 'in_progress')
  const next = inVisit ?? upcoming[0]
  const weekEnd = toISO(addDays(parseISO(TODAY), 7))
  const week = upcoming.filter((v) => v.date <= weekEnd)
  const toRate: PortalVisit | undefined = live.filter((v) => v.status === 'completed' && v.rating == null && v.id !== rated && v.date >= toISO(addDays(parseISO(TODAY), -7)))
    .sort((a, b) => `${b.date}${b.start}`.localeCompare(`${a.date}${a.start}`))[0]
  const family = c.contacts.filter((x) => x.type === 'family' && x.id !== c.my_contact_id && x.phone)
  const who = (v: PortalVisit) => (v.who ? first(v.who) : comp ? first(comp.name) : 'המלווה')

  const rate = async (v: PortalVisit, n: number) => {
    if (preview) return
    setRated(v.id)
    if (await sendFeedback(v.id, c.my_contact_id, n)) await reload()
  }

  return (
    <div className="sr">
      <header className="sr-head">
        <img src={`${import.meta.env.BASE_URL}brand/logo-white.png`} height={40} alt="Family Care" />
        {!preview && <button type="button" className="sr-out" onClick={signOut}>יציאה</button>}
      </header>
      <main className="sr-main">
        <h1>שלום {first(c.my_name)}</h1>
        {c.plan_name && <p className="sr-plan">{c.plan_name}</p>}

        <section className="sr-card sr-who" aria-labelledby="sr-w">
          <h2 id="sr-w">מי מגיע אליי ומתי</h2>
          {comp ? (
            <>
              <div className="sr-person">
                {photo ? <img src={photo} alt={comp.name} /> : <span aria-hidden="true">{first(comp.name)[0]}</span>}
                <div><b>{comp.name}</b>{comp.role && <small>{ROLE_LABEL[comp.role] ?? ''}</small>}</div>
              </div>
              {next ? (
                <p className="sr-when">
                  {inVisit ? <>{who(next)} אצלך עכשיו</> : <>{who(next)} מגיע/ה אליך <b>{when(next.date)}</b> בשעה <b><Ltr>{hm(next.start)}</Ltr></b></>}
                </p>
              ) : <p className="sr-when">עוד לא נקבעה פגישה. אפשר לבקש למטה.</p>}
              {comp.phone && <a className="sr-btn" href={tel(comp.phone)}>להתקשר ל{first(comp.name)}</a>}
            </>
          ) : <p className="sr-when">בקרוב נכיר לך את המלווה שלך.</p>}
        </section>

        {toRate && (
          <section className="sr-card" aria-labelledby="sr-f">
            <h2 id="sr-f">איך היה הביקור עם {who(toRate)}?</h2>
            <div className="sr-faces" role="group" aria-label="דירוג הביקור">
              {FACES.map(([n, e, label]) => <button key={n} type="button" onClick={() => void rate(toRate, n)} aria-label={label}><span aria-hidden="true">{e}</span><small>{label}</small></button>)}
            </div>
          </section>
        )}
        {rated && !toRate && <p className="sr-thanks" role="status">תודה! שמחים לשמוע.</p>}

        <section className="sr-card" aria-labelledby="sr-p">
          <h2 id="sr-p">התוכנית שלי לשבוע</h2>
          {week.length === 0 ? <p className="sr-empty">אין כרגע פגישות השבוע.</p> : (
            <ul className="sr-list">{week.map((v) => (
              <li key={v.id}><b>{dayName(v.date)}, <Ltr>{hm(v.start)}</Ltr></b><span>{v.title}{v.who ? ` · ${first(v.who)}` : ''}</span></li>
            ))}</ul>
          )}
        </section>

        {family.length > 0 && (
          <section className="sr-card" aria-labelledby="sr-fam">
            <h2 id="sr-fam">המשפחה שלי</h2>
            <ul className="sr-list">{family.map((p) => (
              <li key={p.id} className="sr-fam"><span><b>{p.name}</b>{p.relation && <small>{p.relation}</small>}</span><a className="sr-btn sm" href={tel(p.phone!)}>חיוג</a></li>
            ))}</ul>
          </section>
        )}

        <button type="button" className="sr-btn big" onClick={() => (preview ? undefined : setWish(true))} disabled={preview && false}>בא לי משהו</button>
        {done && <p className="sr-thanks" role="status">הבקשה נשלחה. נחזור אליך בהקדם.</p>}
      </main>
      {wish && <WishDialog c={c} onClose={() => setWish(false)} onSent={async () => { setWish(false); setDone(true); await reload() }} />}
    </div>
  )
}

function WishDialog({ c, onClose, onSent }: { c: PortalClient; onClose: () => void; onSent: () => Promise<void> }) {
  const [pick, setPick] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (!pick) { setErr('בחרו מה בא לכם'); return }
    setBusy(true); setErr('')
    const ok = await sendRequest(c.id, c.my_contact_id, pick, text.trim() || pick, '')
    setBusy(false)
    if (!ok) { setErr('לא הצלחנו לשלוח. אפשר לנסות שוב, או להתקשר אלינו.'); return }
    await onSent()
  }
  return (
    <Modal title="מה בא לך?" onClose={onClose}>
      <form onSubmit={send} className="sr-wish">
        <div className="sr-tiles" role="group" aria-label="בחירת נושא">
          {WANTS.map((w) => <button key={w} type="button" className={pick === w ? 'on' : ''} aria-pressed={pick === w} onClick={() => setPick(w)}>{w}</button>)}
        </div>
        <label>רוצה לספר עוד? (לא חובה)<textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} /></label>
        {err && <p role="alert" className="sr-err">{err}</p>}
        <button type="submit" className="sr-btn big" disabled={busy}>{busy ? 'שולחים…' : 'שליחת בקשה'}</button>
      </form>
    </Modal>
  )
}
