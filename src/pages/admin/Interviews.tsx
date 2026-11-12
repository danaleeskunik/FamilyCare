import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Callout, Card } from '../../components/ui'
import InterviewFields from '../../components/InterviewFields'
import { supabase } from '../../lib/supabase'
import { cleanAnswers, missingTable } from '../../lib/intake'
import { useStore } from '../../store/AppStore'
import { DECISIONS, INTERVIEW, IV_TOTAL, type IvAnswers } from '../../data/interview'

const SETUP = <Callout tone="warning" title="צריך להקים את ראיונות המועמדים">מריצים פעם אחת ב-SQL Editor של Supabase את הקובץ upgrade_0029_staff_interviews.sql ואת upgrade_0030, ואז מרעננים.</Callout>

/** The companion's status follows the recommendation: suitable (also with reservations) / not suitable / still open. */
const statusFor = (decision: string) => (decision === DECISIONS[0] || decision === DECISIONS[1] ? 'suitable' : decision === DECISIONS[3] ? 'unsuitable' : 'before_interview')

/** The interview of one companion (route /admin/staff/:id/interview). Opens the saved interview, or a new one prefilled from the companion's details. */
export function InterviewForm() {
  const { id: staffId } = useParams()
  const { notify, staff, reload } = useStore()
  const member = staff.find((s) => s.id === staffId)
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [values, setValues] = useState<IvAnswers>({})
  const [loading, setLoading] = useState(true)
  const [setup, setSetup] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (!staffId) return
    let alive = true
    void (async () => {
      const [iv, st] = await Promise.all([
        supabase.from('staff_interviews').select('*').eq('staff_id', staffId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('staff_members').select('full_name, phone, gender').eq('id', staffId).maybeSingle(),
      ])
      if (!alive) return
      if (iv.error) { if (missingTable(iv.error) || /staff_id/.test(iv.error.message ?? '')) setSetup(true); else notify('לא הצלחנו לטעון את הראיון'); setLoading(false); return }
      if (iv.data) { setInterviewId(iv.data.id as string); setValues(cleanAnswers(iv.data.answers)); setLoading(false); return }
      // First time: start from what is already known about the companion.
      const s = st.data as { full_name: string; phone: string | null; gender: string | null } | null
      setValues(cleanAnswers({ name: s?.full_name ?? '', phone: s?.phone ?? '', gender: s?.gender === 'f' ? 'אישה' : s?.gender === 'm' ? 'גבר' : '', date: new Date().toISOString().slice(0, 10) }))
      setLoading(false)
    })()
    return () => { alive = false }
  }, [staffId, notify])

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const filled = useMemo(() => INTERVIEW.reduce((n, s) => n + s.fields.filter((f) => values[f.key]?.trim()).length, 0), [values])

  const save = async () => {
    if (!staffId) return
    setBusy(true); setNote(null)
    const answers = cleanAnswers(values)
    const payload = { candidate_name: answers.name ?? '', interviewed_on: answers.date || null, decision: answers.decision ?? '', answers, updated_at: new Date().toISOString() }
    const r = interviewId
      ? await supabase.from('staff_interviews').update(payload).eq('id', interviewId).select('id').single()
      : await supabase.from('staff_interviews').insert(payload).select('id').single()
    if (r.error) { setBusy(false); setNote({ ok: false, text: missingTable(r.error) ? 'צריך להריץ פעם אחת את upgrade_0029 ב-Supabase.' : 'לא הצלחנו לשמור. בדקי את החיבור ונסי שוב.' }); return }
    const iid = (r.data as { id: string }).id
    if (!interviewId) {
      const link = await supabase.from('staff_interviews').update({ staff_id: staffId }).eq('id', iid)
      if (link.error) { console.error('link interview to staff failed', link.error); setNote({ ok: false, text: 'הראיון נשמר, אבל לא קושר למלווה/ת. צריך להריץ את upgrade_0030 ב-Supabase.' }); setBusy(false); setInterviewId(iid); setDirty(false); return }
      setInterviewId(iid)
    }
    // The companion's status follows the recommendation.
    if (answers.decision) {
      const { error } = await supabase.from('staff_members').update({ status: statusFor(answers.decision) }).eq('id', staffId)
      if (error) console.error('sync staff status failed', error); else reload()
    }
    setBusy(false); setDirty(false)
    setNote({ ok: true, text: 'הראיון נשמר.' })
  }

  const back = (e: React.MouseEvent) => { if (dirty && !window.confirm('יש שינויים שלא נשמרו. לצאת בלי לשמור?')) e.preventDefault() }
  const title = member ? `ראיון: ${member.name}` : 'ראיון עם מלווה/ת'

  return (
    <div className="stack">
      {setup && SETUP}
      {!setup && (
        <>
          <Card>
            <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div className="card-title">{title}</div>
                <div className="card-meta">{loading ? 'טוענת…' : `מולאו ${filled} מתוך ${IV_TOTAL} שדות${dirty ? ' · יש שינויים שלא נשמרו' : ''}`}</div>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <a className="btn secondary sm" href={`${import.meta.env.BASE_URL}materials/companion-interview.pdf`} target="_blank" rel="noreferrer">טופס להדפסה</a>
                <Link className="btn secondary sm" to="/admin/staff" onClick={back}>חזרה למלווים</Link>
                <Button size="sm" disabled={busy || loading || !dirty} onClick={() => void save()}>{busy ? 'שומרת…' : 'שמירה'}</Button>
              </div>
            </div>
            {note && <p role="status" style={{ marginTop: 10, fontWeight: 600, color: note.ok ? 'var(--success)' : 'var(--danger)' }}>{note.text}</p>}
          </Card>
          {!loading && <InterviewFields values={values} onChange={(k, v) => { setValues((cur) => ({ ...cur, [k]: v })); setDirty(true) }} />}
          {!loading && <div><Button disabled={busy || !dirty} onClick={() => void save()}>{busy ? 'שומרת…' : 'שמירת הראיון'}</Button></div>}
        </>
      )}
    </div>
  )
}
