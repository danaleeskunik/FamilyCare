import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Callout, Card } from '../../components/ui'
import InterviewFields from '../../components/InterviewFields'
import { supabase } from '../../lib/supabase'
import { cleanAnswers, missingTable } from '../../lib/intake'
import { useStore } from '../../store/AppStore'
import { DECISIONS, INTERVIEW, IV_TOTAL, type IvAnswers } from '../../data/interview'

const SETUP = <Callout tone="warning" title="צריך להקים את ראיונות המועמדים">מריצים פעם אחת ב-SQL Editor של Supabase את הקובץ upgrade_0029_staff_interviews.sql, ואז מרעננים.</Callout>


/** The companion's status follows the recommendation: suitable (also with reservations) / not suitable / still open. */
const statusFor = (decision: string | undefined) => (decision === DECISIONS[0] || decision === DECISIONS[1] ? 'suitable' : decision === DECISIONS[3] ? 'unsuitable' : 'before_interview')
const JOB_BY_PROFESSION: [string, string][] = [['עובד/ת סוציאלי/ת', 'social_worker'], ['סטודנט/ית', 'student']]

/** Turns an interview into a companion record: name, phone, job title, languages and regions are taken from the answers. */
async function createStaffFrom(a: IvAnswers, regions: { id: number; name: string }[]): Promise<string | null> {
  const picked = (a.profession ?? '').split('\n')
  const jobTitle = JOB_BY_PROFESSION.find(([label]) => picked.includes(label))?.[1] ?? 'personal_companion'
  const languages = [...(a.langs ?? '').split('\n').filter((x) => x && x !== 'אחר'), ...(a.langs_other ?? '').split(/[,،]/).map((x) => x.trim()).filter(Boolean)]
  const row = { full_name: a.name, job_title: jobTitle, gender: a.gender === 'אישה' ? 'f' : a.gender === 'גבר' ? 'm' : null, phone: a.phone || null, languages }
  let { data, error } = await supabase.from('staff_members').insert({ ...row, status: statusFor(a.decision) }).select('id').single()
  // The status column comes with upgrade_0031; until it is run, still add the companion (without a status).
  if (error && /status/i.test(error.message ?? '')) ({ data, error } = await supabase.from('staff_members').insert(row).select('id').single())
  if (error || !data) { console.error('create staff from interview failed', error); return null }
  const areas = a.areas ?? ''
  const rows = regions.filter((r) => areas.includes(r.name)).map((r) => ({ staff_id: data.id as string, region_id: r.id }))
  if (rows.length) await supabase.from('staff_regions').insert(rows)
  return data.id as string
}

/** One interview: fill in during the conversation, save. */
export function InterviewForm() {
  const { id } = useParams()
  const isNew = id === 'new'
  const nav = useNavigate()
  const { notify, regions, staff, reload } = useStore()
  const [staffId, setStaffId] = useState<string | null>(null)
  const [values, setValues] = useState<IvAnswers>(() => (isNew ? ({ date: new Date().toISOString().slice(0, 10) } as IvAnswers) : {}))
  const [loading, setLoading] = useState(!isNew)
  const [setup, setSetup] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (isNew || !id) return
    let alive = true
    void (async () => {
      const { data, error } = await supabase.from('staff_interviews').select('*').eq('id', id).maybeSingle()
      if (!alive) return
      if (error) { if (missingTable(error)) setSetup(true); else notify('לא הצלחנו לטעון את הראיון'); setLoading(false); return }
      if (!data) { notify('הראיון לא נמצא'); nav('/admin/staff', { replace: true }); return }
      setValues(cleanAnswers(data.answers)); setStaffId((data as { staff_id?: string | null }).staff_id ?? null); setLoading(false)
    })()
    return () => { alive = false }
  }, [id, isNew, notify, nav])

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const filled = useMemo(() => INTERVIEW.reduce((n, s) => n + s.fields.filter((f) => values[f.key]?.trim()).length, 0), [values])

  const save = async () => {
    setBusy(true); setNote(null)
    const answers = cleanAnswers(values)
    const payload = { candidate_name: answers.name ?? '', interviewed_on: answers.date || null, decision: answers.decision ?? '', answers, updated_at: new Date().toISOString() }
    const r = isNew
      ? await supabase.from('staff_interviews').insert(payload).select('id').single()
      : await supabase.from('staff_interviews').update(payload).eq('id', id!).select('id').single()
    if (r.error) { setBusy(false); setNote({ ok: false, text: missingTable(r.error) ? 'צריך להריץ פעם אחת את upgrade_0029 ב-Supabase.' : 'לא הצלחנו לשמור. בדקי את החיבור ונסי שוב.' }); return }
    const iid = (r.data as { id: string }).id
    setDirty(false)

    // A saved interview becomes a companion record (status follows the recommendation), unless one with that name already exists.
    // Later saves keep the status of the existing record in step with the recommendation.
    let added = false
    let problem = ''
    if (!staffId && answers.name) {
      if (staff.some((x) => x.name === answers.name)) problem = 'כבר יש מלווה בשם הזה ברשימה, לכן לא נוספה רשומה חדשה.'
      else {
        const sid = await createStaffFrom(answers as IvAnswers, regions)
        if (!sid) problem = 'הראיון נשמר, אבל לא הצלחנו להוסיף את המועמד/ת לרשימת המלווים. בדקי שהורץ ה-SQL האחרון.'
        else {
          const link = await supabase.from('staff_interviews').update({ staff_id: sid }).eq('id', iid)
          if (link.error) console.error('link interview to staff failed', link.error)
          setStaffId(sid); added = true; reload()
        }
      }
    } else if (staffId && answers.decision) {
      const { error } = await supabase.from('staff_members').update({ status: statusFor(answers.decision) }).eq('id', staffId)
      if (error) console.error('sync staff status failed', error); else reload()
    } else if (!staffId && !answers.name) problem = 'בלי שם מלא לא ניתן להוסיף את המועמד/ת לרשימת המלווים.'
    setBusy(false)
    if (problem) notify(problem)
    if (added) { notify('הראיון נשמר והמועמד/ת נוספ/ה לרשימת המלווים'); nav('/admin/staff'); return }
    if (isNew) { if (!problem) notify('הראיון נשמר'); nav(`/admin/staff/interviews/${iid}`, { replace: true }) }
    else setNote({ ok: true, text: 'הראיון נשמר.' })
  }

  const back = (e: React.MouseEvent) => { if (dirty && !window.confirm('יש שינויים שלא נשמרו. לצאת בלי לשמור?')) e.preventDefault() }

  return (
    <div className="stack">
      {setup && SETUP}
      {!setup && (
        <>
          <Card>
            <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div className="card-title">{isNew ? 'מלווה/ת חדש/ה: ראיון והוספה' : values.name ? `ראיון: ${values.name}` : 'ראיון למלווה/ת'}</div>
                <div className="card-meta">{loading ? 'טוענת…' : `מולאו ${filled} מתוך ${IV_TOTAL} שדות${dirty ? ' · יש שינויים שלא נשמרו' : ''}`}</div>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <a className="btn secondary sm" href={`${import.meta.env.BASE_URL}materials/companion-interview.pdf`} target="_blank" rel="noreferrer">טופס להדפסה</a>
                <Link className="btn secondary sm" to="/admin/staff" onClick={back}>חזרה למלווים</Link>
                <Button size="sm" disabled={busy || loading || (!dirty && !!staffId)} onClick={() => void save()}>{busy ? 'שומרת…' : 'שמירה'}</Button>
              </div>
            </div>
            {note && <p role="status" style={{ marginTop: 10, fontWeight: 600, color: note.ok ? 'var(--success)' : 'var(--danger)' }}>{note.text}</p>}
          </Card>
          {!loading && <InterviewFields values={values} onChange={(k, v) => { setValues((cur) => ({ ...cur, [k]: v })); setDirty(true) }} />}
          {!loading && <div><Button disabled={busy || (!dirty && !!staffId)} onClick={() => void save()}>{busy ? 'שומרת…' : 'שמירת הראיון'}</Button></div>}
        </>
      )}
    </div>
  )
}
