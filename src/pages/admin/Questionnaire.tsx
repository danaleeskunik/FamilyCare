import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, Callout, Card } from '../../components/ui'
import { SelectField } from '../../components/Fields'
import IntakeFields from '../../components/IntakeFields'
import { supabase } from '../../lib/supabase'
import { cleanAnswers, missingTable, saveIntake, type Answers } from '../../lib/intake'
import { useStore } from '../../store/AppStore'
import { INTAKE } from '../../data/intake'

const draftKey = (id: string) => `fc-intake-draft-${id}`
const readDraft = (id: string): Answers | null => { try { const r = window.localStorage.getItem(draftKey(id)); return r ? JSON.parse(r) as Answers : null } catch { return null } }
const writeDraft = (id: string, v: Answers | null) => { try { if (v) window.localStorage.setItem(draftKey(id), JSON.stringify(v)); else window.localStorage.removeItem(draftKey(id)) } catch { /* private mode: no draft */ } }

/** The intake questionnaire as a web form for the interview itself: pick a client, fill in, save. Unsaved typing is kept as a draft on this device. */
export default function Questionnaire() {
  const { clients, openForm } = useStore()
  const [clientId, setClientId] = useState('')
  const [values, setValues] = useState<Answers>({})
    const [loading, setLoading] = useState(false)
  const [setup, setSetup] = useState(false)
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [draftFound, setDraftFound] = useState<Answers | null>(null)
  const [dirty, setDirty] = useState(false)

  // Arriving from "מילוי ברשת" in Materials (?new=1): open the new-client form straight away.
  const [params, setParams] = useSearchParams()
  useEffect(() => {
    if (params.get('new') !== '1') return
    openForm('client')
    setParams({}, { replace: true })
  }, [params, setParams, openForm])

  useEffect(() => {
    if (!clientId) { setValues({}); setDraftFound(null); setDirty(false); return }
    let alive = true
    setLoading(true); setNote(null); setDirty(false)
    void (async () => {
      const [a, b] = await Promise.all([
        supabase.from('client_intake').select('answers').eq('client_id', clientId).maybeSingle(),
        supabase.from('client_intake_private').select('answers').eq('client_id', clientId).maybeSingle(),
      ])
      if (!alive) return
      if (missingTable(a.error) || missingTable(b.error)) { setSetup(true); setLoading(false); return }
      const base = { ...cleanAnswers(a.data?.answers), ...cleanAnswers(b.data?.answers) }
      setValues(base)
      const d = readDraft(clientId)
      setDraftFound(d && JSON.stringify(d) !== JSON.stringify(base) ? d : null)
      setLoading(false)
    })()
    return () => { alive = false }
  }, [clientId])

  // Keep what is typed on this device until it is saved.
  useEffect(() => { if (clientId && dirty) writeDraft(clientId, values) }, [clientId, dirty, values])
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const total = useMemo(() => INTAKE.reduce((n, s) => n + s.fields.length, 0), [])
  const filled = useMemo(() => INTAKE.reduce((n, s) => n + s.fields.filter((f) => values[f.key]?.trim()).length, 0), [values])

  const save = async () => {
    setBusy(true); setNote(null)
    const r = await saveIntake(clientId, values)
    setBusy(false)
    if (!r.ok) { setNote({ ok: false, text: r.setup ? 'צריך להריץ פעם אחת את upgrade_0016 ב-Supabase.' : 'לא הצלחנו לשמור. בדקי את החיבור ונסי שוב.' }); return }
    setDirty(false); writeDraft(clientId, null)
    setNote({ ok: true, text: 'השאלון נשמר בתיק הלקוח/ה.' })
  }

  return (
    <div className="stack">
      <Card>
        <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="card-title">שאלון היכרות עם לקוח</div>
            <p className="muted" style={{ marginTop: 4, lineHeight: 1.6 }}>ממלאים תוך כדי השיחה, ושומרים בתיק הלקוח/ה. מה שנכתב נשמר כטיוטה במכשיר הזה עד השמירה.</p>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <a className="btn secondary sm" href={`${import.meta.env.BASE_URL}materials/new-client-questionnaire.pdf`} target="_blank" rel="noreferrer">טופס להדפסה</a>
            <Button size="sm" icon="plus" onClick={() => openForm('client')}>לקוח/ה חדש/ה עם שאלון</Button>
          </div>
        </div>
        <div style={{ marginTop: 14, maxWidth: 420 }}>
          <SelectField label="מילוי עבור לקוח/ה קיים/ת" value={clientId} onChange={(v) => { if (dirty && !window.confirm('יש שינויים שלא נשמרו. לעבור ללקוח/ה אחר/ת?')) return; setClientId(v) }}
            options={clients.map((c) => ({ value: c.id, label: c.name }))} placeholder="בחרי לקוח/ה" />
        </div>
      </Card>

      {setup && <Callout tone="warning" title="צריך להקים את שאלון ההיכרות">מריצים פעם אחת ב-SQL Editor של Supabase את הקובץ upgrade_0016_client_intake.sql, ואז מרעננים.</Callout>}
      {draftFound && (
        <Callout tone="warning" title="נמצאה טיוטה שלא נשמרה">
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Button size="sm" onClick={() => { setValues(draftFound); setDirty(true); setDraftFound(null) }}>שחזור הטיוטה</Button>
            <Button size="sm" variant="quiet" onClick={() => { writeDraft(clientId, null); setDraftFound(null) }}>מחיקה</Button>
          </div>
        </Callout>
      )}

      {clientId && !setup && (
        <>
          <Card>
            <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div className="card-meta">{loading ? 'טוענת…' : `מולאו ${filled} מתוך ${total} שדות${dirty ? ' · יש שינויים שלא נשמרו' : ''}`}</div>
              <div className="row" style={{ gap: 8 }}>
                <Link className="btn secondary sm" to={`/admin/clients/${clientId}`}>לתיק הלקוח/ה</Link>
                <Button size="sm" disabled={busy || loading || !dirty} onClick={() => void save()}>{busy ? 'שומרת…' : 'שמירה'}</Button>
              </div>
            </div>
            {note && <p role="status" style={{ marginTop: 10, fontWeight: 600, color: note.ok ? 'var(--success)' : 'var(--danger)' }}>{note.text}</p>}
          </Card>
          {!loading && <IntakeFields values={values} onChange={(k, v) => { setValues((cur) => ({ ...cur, [k]: v })); setDirty(true) }} />}
          {!loading && <div><Button disabled={busy || !dirty} onClick={() => void save()}>{busy ? 'שומרת…' : 'שמירת השאלון'}</Button></div>}
        </>
      )}
      {!clientId && !setup && <Callout tone="info" title="איך מתחילים">בוחרים לקוח/ה קיים/ת כדי למלא או להשלים את השאלון שלו/ה, או פותחים לקוח/ה חדש/ה: אחרי הפרטים הבסיסיים השאלון נפתח אוטומטית.</Callout>}
    </div>
  )
}
