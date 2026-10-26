import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Callout, Card, Ltr } from '../components/ui'
import Modal from '../components/Modal'
import { SelectField, TextAreaField, TextField } from '../components/Fields'
import { supabase } from '../lib/supabase'
import { INTAKE, PAYMENT_METHODS, type IntakeField } from '../data/intake'

type Answers = Record<string, string>
const missingTable = (e: { code?: string; message?: string } | null) => !!e && (['42P01', 'PGRST205'].includes(e.code ?? '') || /schema cache|does not exist/i.test(e.message ?? ''))
const clean = (a: unknown): Answers => Object.fromEntries(Object.entries((a ?? {}) as Record<string, unknown>).filter(([, v]) => typeof v === 'string' && v.trim()).map(([k, v]) => [k, v as string]))

function show(f: IntakeField, v: string | undefined) {
  if (!v) return '—'
  if (f.kind === 'payment') return PAYMENT_METHODS.find((p) => p.value === v)?.label ?? v
  return f.ltr ? <Ltr>{v}</Ltr> : v
}

export default function IntakeTab({ clientId, name }: { clientId: string; name: string }) {
  const [pub, setPub] = useState<Answers>({})
  const [priv, setPriv] = useState<Answers>({})
  const [loading, setLoading] = useState(true)
  const [setup, setSetup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    void (async () => {
      const [a, b] = await Promise.all([
        supabase.from('client_intake').select('answers').eq('client_id', clientId).maybeSingle(),
        supabase.from('client_intake_private').select('answers').eq('client_id', clientId).maybeSingle(),
      ])
      if (!alive) return
      if (missingTable(a.error) || missingTable(b.error)) setSetup(true)
      else if (a.error || b.error) setError('לא הצלחנו לטעון את השאלון.')
      else { setPub(clean(a.data?.answers)); setPriv(clean(b.data?.answers)) }
      setLoading(false)
    })()
    return () => { alive = false }
  }, [clientId])

  const all = useMemo(() => ({ ...pub, ...priv }), [pub, priv])
  const total = INTAKE.reduce((n, s) => n + s.fields.length, 0)
  const filled = INTAKE.reduce((n, s) => n + s.fields.filter((f) => all[f.key]).length, 0)

  if (setup) {
    return (
      <Callout tone="warning" title="צריך להקים את שאלון ההיכרות">
        מריצים פעם אחת ב-SQL Editor של Supabase את הקובץ <Ltr>supabase/upgrade_0016_client_intake.sql</Ltr>, ואז מרעננים.
      </Callout>
    )
  }

  return (
    <>
      <Card>
        <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="card-title">שאלון קליטה, היכרות ומיפוי צרכים</div>
            <div className="card-meta">{loading ? 'טוענת…' : `מולאו ${filled} מתוך ${total} שדות`}</div>
          </div>
          <Button size="sm" icon="edit" onClick={() => setEditing(true)} disabled={loading}>עריכת השאלון</Button>
        </div>
      </Card>
      {error && <Callout tone="warning" title="משהו לא הצליח">{error}</Callout>}
      {!loading && INTAKE.map((s) => (
        <Card key={s.id}>
          <div className="card-title" style={{ marginBottom: 6 }}>{s.title}</div>
          {s.fields.map((f) => (
            <div key={f.key} className="intake-q">
              <div className="intake-label">{f.label}{f.private && <> <Badge tone="orange">מנהלים בלבד</Badge></>}</div>
              <div className="intake-a">{show(f, all[f.key])}</div>
            </div>
          ))}
        </Card>
      ))}
      {editing && (
        <IntakeForm
          clientId={clientId} name={name} initial={all}
          onClose={() => setEditing(false)}
          onSaved={(p, q) => { setPub(p); setPriv(q); setEditing(false) }}
        />
      )}
    </>
  )
}

function IntakeForm({ clientId, name, initial, onClose, onSaved }: {
  clientId: string; name: string; initial: Answers; onClose: () => void; onSaved: (pub: Answers, priv: Answers) => void
}) {
  const [v, setV] = useState<Answers>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (k: string) => (val: string) => setV((cur) => ({ ...cur, [k]: val }))

  const save = async () => {
    setBusy(true); setError(null)
    const pub: Answers = {}
    const priv: Answers = {}
    for (const s of INTAKE) for (const f of s.fields) {
      const val = (v[f.key] ?? '').trim()
      if (val) (f.private ? priv : pub)[f.key] = val
    }
    const [a, b] = await Promise.all([
      supabase.from('client_intake').upsert({ client_id: clientId, answers: pub }, { onConflict: 'client_id' }),
      supabase.from('client_intake_private').upsert({ client_id: clientId, answers: priv }, { onConflict: 'client_id' }),
    ])
    setBusy(false)
    if (a.error || b.error) { console.error('intake save failed', a.error ?? b.error); setError('לא הצלחנו לשמור. בדקי את החיבור ונסי שוב.'); return }
    onSaved(pub, priv)
  }

  return (
    <Modal
      wide
      title={`שאלון היכרות · ${name}`}
      onClose={onClose}
      footer={<><Button disabled={busy} onClick={save}>{busy ? 'שומרת…' : 'שמירה'}</Button><Button variant="quiet" onClick={onClose}>ביטול</Button></>}
    >
      <div className="intake-form">
        {INTAKE.map((s) => (
          <fieldset key={s.id} className="intake-sec">
            <legend>{s.title}</legend>
            {s.fields.map((f) => {
              const label = f.private ? `${f.label} (מנהלים בלבד)` : f.label
              if (f.kind === 'long') return <TextAreaField key={f.key} label={label} value={v[f.key] ?? ''} onChange={set(f.key)} rows={2} />
              if (f.kind === 'payment') return <SelectField key={f.key} label={label} value={v[f.key] ?? ''} onChange={set(f.key)} options={PAYMENT_METHODS} placeholder="לא נבחר" />
              return <TextField key={f.key} label={label} dir={f.ltr ? 'ltr' : undefined} value={v[f.key] ?? ''} onChange={(e) => set(f.key)(e.target.value)} />
            })}
          </fieldset>
        ))}
        {error && <Callout tone="warning" title="משהו לא הצליח">{error}</Callout>}
      </div>
    </Modal>
  )
}
