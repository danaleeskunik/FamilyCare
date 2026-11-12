import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Callout, Card, CardHead, Empty, Ltr } from '../../components/ui'
import InterviewFields from '../../components/InterviewFields'
import { supabase } from '../../lib/supabase'
import { cleanAnswers, missingTable } from '../../lib/intake'
import { useStore } from '../../store/AppStore'
import { DECISIONS, INTERVIEW, IV_TOTAL, type IvAnswers } from '../../data/interview'
import { formatDM, parseISO } from '../../lib/dates'

type Row = { id: string; candidate_name: string; interviewed_on: string | null; decision: string; updated_at: string }
const SETUP = <Callout tone="warning" title="צריך להקים את ראיונות המועמדים">מריצים פעם אחת ב-SQL Editor של Supabase את הקובץ upgrade_0029_staff_interviews.sql, ואז מרעננים.</Callout>
const tone = (d: string) => (d === DECISIONS[0] ? 'green' : d === DECISIONS[3] ? 'red' : d ? 'orange' : 'neutral') as 'green' | 'red' | 'orange' | 'neutral'

/** List of candidate interviews. */
export function InterviewList() {
  const { notify } = useStore()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [setup, setSetup] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('staff_interviews').select('id, candidate_name, interviewed_on, decision, updated_at').order('interviewed_on', { ascending: false, nullsFirst: true }).order('created_at', { ascending: false })
    if (error) { if (missingTable(error)) setSetup(true); else notify('לא הצלחנו לטעון את הראיונות'); setLoading(false); return }
    setRows(data as Row[]); setLoading(false)
  }, [notify])
  useEffect(() => { void load() }, [load])

  const remove = async (r: Row) => {
    if (!window.confirm(`למחוק לצמיתות את הראיון עם ${r.candidate_name || 'מועמד/ת ללא שם'}? אי אפשר לשחזר.`)) return
    const { error } = await supabase.from('staff_interviews').delete().eq('id', r.id)
    if (error) { notify('לא הצלחנו למחוק. נסי שוב.'); return }
    setRows((cur) => cur.filter((x) => x.id !== r.id))
  }

  return (
    <div className="stack">
      {setup && SETUP}
      <Card flush>
        <CardHead title="ראיונות מועמדים/ות למלווים">
          <Link className="btn secondary sm" to="/admin/staff">חזרה למלווים</Link>
          <a className="btn secondary sm" href={`${import.meta.env.BASE_URL}materials/companion-interview.pdf`} target="_blank" rel="noreferrer">טופס להדפסה</a>
          <Link className="btn sm" to="/admin/staff/interviews/new">ראיון חדש</Link>
        </CardHead>
        {loading ? <p className="muted" style={{ padding: 16 }}>טוענת…</p> : rows.length === 0 ? (
          <Empty text={setup ? 'עדיין לא הוקם' : 'עוד לא מילאת ראיונות. "ראיון חדש" פותח את הטופס.'} />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>מועמד/ת</th><th>תאריך</th><th>המלצה</th><th><span className="sr-only">פעולות</span></th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="name"><Link to={`/admin/staff/interviews/${r.id}`}>{r.candidate_name || 'ללא שם'}</Link></td>
                    <td>{r.interviewed_on ? <Ltr>{formatDM(parseISO(r.interviewed_on))}</Ltr> : '—'}</td>
                    <td>{r.decision ? <Badge tone={tone(r.decision)}>{r.decision}</Badge> : <span className="muted">טרם הוחלט</span>}</td>
                    <td><div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                      <Link className="btn secondary sm" to={`/admin/staff/interviews/${r.id}`}>פתיחה</Link>
                      <Button size="sm" variant="quiet" onClick={() => void remove(r)}>מחיקה</Button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

/** One interview: fill in during the conversation, save. */
export function InterviewForm() {
  const { id } = useParams()
  const isNew = id === 'new'
  const nav = useNavigate()
  const { notify } = useStore()
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
      const { data, error } = await supabase.from('staff_interviews').select('answers').eq('id', id).maybeSingle()
      if (!alive) return
      if (error) { if (missingTable(error)) setSetup(true); else notify('לא הצלחנו לטעון את הראיון'); setLoading(false); return }
      if (!data) { notify('הראיון לא נמצא'); nav('/admin/staff/interviews', { replace: true }); return }
      setValues(cleanAnswers(data.answers)); setLoading(false)
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
    setBusy(false)
    if (r.error) { setNote({ ok: false, text: missingTable(r.error) ? 'צריך להריץ פעם אחת את upgrade_0029 ב-Supabase.' : 'לא הצלחנו לשמור. בדקי את החיבור ונסי שוב.' }); return }
    setDirty(false)
    if (isNew) { notify('הראיון נשמר'); nav(`/admin/staff/interviews/${(r.data as { id: string }).id}`, { replace: true }) }
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
                <div className="card-title">{isNew ? 'ראיון חדש למלווה/ת' : values.name ? `ראיון: ${values.name}` : 'ראיון למלווה/ת'}</div>
                <div className="card-meta">{loading ? 'טוענת…' : `מולאו ${filled} מתוך ${IV_TOTAL} שדות${dirty ? ' · יש שינויים שלא נשמרו' : ''}`}</div>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <Link className="btn secondary sm" to="/admin/staff/interviews" onClick={back}>לכל הראיונות</Link>
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
