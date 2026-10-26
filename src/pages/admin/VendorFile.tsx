import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Callout, Card, CardHead, Empty, Ltr } from '../../components/ui'
import { SelectField, TextAreaField } from '../../components/Fields'
import { useStore } from '../../store/AppStore'
import { supabase } from '../../lib/supabase'
import { formatDM, parseISO } from '../../lib/dates'

type Note = { id: string; taskId: string | null; rating: number | null; note: string; createdAt: string }
type Row = { id: string; task_id: string | null; rating: number | null; note: string; created_at: string }

const missing = (e: { code?: string; message?: string } | null) => !!e && (['42P01', 'PGRST205'].includes(e.code ?? '') || /schema cache|does not exist/i.test(e.message ?? ''))
const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

export default function VendorFile() {
  const { id } = useParams()
  const { vendors, tasks, openForm } = useStore()
  const vendor = vendors.find((v) => v.id === id)
  const jobs = useMemo(() => tasks.filter((t) => t.vendorId === id).sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)), [tasks, id])

  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [setup, setSetup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobId, setJobId] = useState('')
  const [rating, setRating] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let alive = true
    void (async () => {
      const { data, error: e } = await supabase.from('vendor_notes').select('id, task_id, rating, note, created_at').eq('vendor_id', id).order('created_at', { ascending: false })
      if (!alive) return
      if (e) { if (missing(e)) setSetup(true); else setError('לא הצלחנו לטעון את ההתרשמויות.') }
      else setNotes((data as Row[]).map((r) => ({ id: r.id, taskId: r.task_id, rating: r.rating, note: r.note, createdAt: r.created_at })))
      setLoading(false)
    })()
    return () => { alive = false }
  }, [id])

  if (!vendor) {
    return <Empty text="לא מצאנו את הספק הזה." action={<Link to="/admin/vendors" className="btn secondary sm">חזרה לספקים</Link>} />
  }

  const jobLabel = (taskId: string | null) => {
    const t = jobs.find((x) => x.id === taskId)
    return t ? `${t.task} — ${t.client}, ${formatDM(parseISO(t.date))}` : null
  }
  const rated = notes.filter((n) => n.rating)
  const avg = rated.length ? (rated.reduce((a, n) => a + (n.rating ?? 0), 0) / rated.length).toFixed(1) : null

  const add = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!text.trim()) return
    setBusy(true); setError(null)
    const { data, error: e } = await supabase.from('vendor_notes')
      .insert({ vendor_id: vendor.id, task_id: jobId || null, rating: rating ? Number(rating) : null, note: text.trim() })
      .select('id, task_id, rating, note, created_at').single()
    setBusy(false)
    if (e || !data) { setError('לא הצלחנו לשמור את ההתרשמות.'); return }
    const r = data as Row
    setNotes((cur) => [{ id: r.id, taskId: r.task_id, rating: r.rating, note: r.note, createdAt: r.created_at }, ...cur])
    setText(''); setRating(''); setJobId('')
  }

  const remove = async (noteId: string) => {
    setRemoving(null)
    const prev = notes
    setNotes((cur) => cur.filter((n) => n.id !== noteId))
    const { error: e } = await supabase.from('vendor_notes').delete().eq('id', noteId)
    if (e) { setNotes(prev); setError('לא הצלחנו למחוק.') }
  }

  return (
    <>
      <div className="row" style={{ gap: 10 }}>
        <Link to="/admin/vendors" className="btn secondary sm">← לספקים</Link>
        <Button size="sm" variant="secondary" onClick={() => openForm('vendor', { id: vendor.id })}>עריכת פרטי הספק</Button>
      </div>

      <Card>
        <div className="vendor-head">
          <div>
            <h2 className="vendor-name">{vendor.name}</h2>
            <p className="muted">{vendor.field} · {vendor.area}</p>
          </div>
          <Badge tone={vendor.status[0]}>{vendor.status[1]}</Badge>
        </div>
        <div className="kv"><span>מחירון מוסכם</span><span>{vendor.price}</span></div>
        <div className="kv"><span>רישיון / ביטוח</span><span style={vendor.licBad ? { color: 'var(--danger)' } : undefined}>{vendor.lic}</span></div>
        <div className="kv"><span>דירוג</span><span className="num">{vendor.rating}</span></div>
        <div className="kv"><span>ממוצע ההתרשמויות שלנו</span><span>{avg ? <><Ltr>{avg}</Ltr> מתוך 5 ({rated.length})</> : '—'}</span></div>
      </Card>

      <Card flush>
        <CardHead title="היסטוריית עבודות"><span className="card-meta">{jobs.length} עבודות</span></CardHead>
        {jobs.length === 0 ? <div style={{ padding: 18 }}><Empty text="עוד לא שובצו עבודות לספק הזה." /></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>תאריך</th><th>לקוח/ה</th><th>עבודה</th><th>סטטוס</th></tr></thead>
              <tbody>
                {jobs.map((t) => (
                  <tr key={t.id}>
                    <td className="num nowrap">{formatDM(parseISO(t.date))} · {t.time}</td>
                    <td className="name">{t.client}</td>
                    <td>{t.task}</td>
                    <td>{t.status ? <Badge tone={t.status[0]}>{t.status[1]}</Badge> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {setup ? (
        <Callout tone="warning" title="צריך להקים את יומן ההתרשמויות">
          מריצים פעם אחת ב-SQL Editor של Supabase את הקובץ <Ltr>supabase/upgrade_0015_owner_and_vendor_notes.sql</Ltr>, ואז מרעננים.
        </Callout>
      ) : (
        <Card flush>
          <CardHead title="התרשמות מהביצוע" />
          <form className="vendor-note-form" onSubmit={add}>
            <SelectField label="על איזו עבודה (לא חובה)" value={jobId} onChange={setJobId} placeholder="כללי" options={jobs.map((t) => ({ value: t.id, label: `${t.task} — ${t.client}, ${formatDM(parseISO(t.date))}` }))} />
            <SelectField label="ציון (לא חובה)" value={rating} onChange={setRating} placeholder="ללא ציון" options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} — ${stars(n)}` }))} />
            <div className="full"><TextAreaField label="מה הרושם מהעבודה?" value={text} onChange={setText} rows={3} /></div>
            <div className="full"><Button type="submit" disabled={busy || !text.trim()}>שמירת ההתרשמות</Button></div>
          </form>
          {error && <div style={{ padding: '0 18px 14px' }}><Callout tone="warning" title="משהו לא הצליח">{error}</Callout></div>}
          <div className="vendor-notes">
            {loading ? <p className="muted" role="status">טוענת…</p>
              : notes.length === 0 ? <Empty text="עוד אין התרשמויות על הספק הזה." />
              : notes.map((n) => (
                <article key={n.id} className="vendor-note">
                  <div className="vendor-note-top">
                    <span className="card-meta">{formatDM(parseISO(n.createdAt.slice(0, 10)))}{jobLabel(n.taskId) ? ` · ${jobLabel(n.taskId)}` : ''}</span>
                    {n.rating && <span className="vendor-stars" aria-label={`ציון ${n.rating} מתוך 5`}>{stars(n.rating)}</span>}
                  </div>
                  <p>{n.note}</p>
                  {removing === n.id
                    ? <span className="lead-confirm"><Button size="sm" variant="danger" onClick={() => void remove(n.id)}>מחיקה</Button><Button size="sm" variant="quiet" onClick={() => setRemoving(null)}>ביטול</Button></span>
                    : <Button size="sm" variant="quiet" onClick={() => setRemoving(n.id)}>מחיקה</Button>}
                </article>
              ))}
          </div>
        </Card>
      )}
    </>
  )
}
