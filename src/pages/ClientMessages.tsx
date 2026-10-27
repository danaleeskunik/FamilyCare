import { useCallback, useEffect, useState } from 'react'
import { Button, Callout, Card } from '../components/ui'
import { TextAreaField } from '../components/Fields'
import { supabase } from '../lib/supabase'

type Msg = { id: string; from_family: boolean; sender_name: string | null; body: string; read_at: string | null; created_at: string }
const missing = (e: { code?: string; message?: string } | null) => !!e && (['42P01', 'PGRST205'].includes(e.code ?? '') || /schema cache|does not exist/i.test(e.message ?? ''))
const when = (iso: string) => { const d = new Date(iso); return `${d.getDate()}.${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }

/** The conversation with the client's family (admin side). Opening it marks the family's messages as read. */
export default function ClientMessages({ clientId, name }: { clientId: string; name: string }) {
  const [msgs, setMsgs] = useState<Msg[] | null>(null)
  const [setup, setSetup] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('client_messages').select('id, from_family, sender_name, body, read_at, created_at').eq('client_id', clientId).order('created_at', { ascending: true })
    if (missing(error)) { setSetup(true); return }
    if (error) { console.error('messages load failed', error); setErr(true); return }
    setMsgs(data as Msg[])
    if ((data as Msg[]).some((m) => m.from_family && !m.read_at)) {
      await supabase.from('client_messages').update({ read_at: new Date().toISOString() }).eq('client_id', clientId).eq('from_family', true).is('read_at', null)
    }
  }, [clientId])
  useEffect(() => { void load() }, [load])

  const send = async () => {
    if (!text.trim() || busy) return
    setBusy(true); setErr(false)
    const { error } = await supabase.from('client_messages').insert({ client_id: clientId, from_family: false, sender_name: 'Family Care', body: text.trim() })
    setBusy(false)
    if (error) { console.error('reply failed', error); setErr(true); return }
    setText(''); await load()
  }

  if (setup) return <Callout tone="warning" title="צריך להקים את ההודעות">מריצים פעם אחת ב-SQL Editor של Supabase את הקובץ upgrade_0018_client_portal.sql, ואז מרעננים.</Callout>
  return (
    <Card>
      <div className="card-title" style={{ marginBottom: 4 }}>הודעות מהמשפחה · {name}</div>
      <p className="card-meta" style={{ marginBottom: 12 }}>ההודעות מופיעות גם באזור האישי של המשפחה.</p>
      <div className="stack" style={{ gap: 10, maxHeight: 420, overflowY: 'auto', marginBottom: 14 }}>
        {msgs === null && !err && <p className="muted">טוענת…</p>}
        {msgs?.length === 0 && <p className="muted">עוד אין הודעות.</p>}
        {msgs?.map((m) => (
          <div key={m.id} className="item-box" style={{ padding: '10px 14px', borderRadius: 14, background: m.from_family ? 'var(--tint)' : 'var(--field)', maxWidth: '88%', alignSelf: m.from_family ? 'flex-start' : 'flex-end' }}>
            <div className="card-meta" style={{ fontWeight: 700 }}>{m.from_family ? (m.sender_name ?? 'המשפחה') : 'Family Care'} · {when(m.created_at)}</div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{m.body}</div>
          </div>
        ))}
      </div>
      <TextAreaField label="תשובה" value={text} onChange={setText} rows={3} />
      {err && <p style={{ color: 'var(--danger)', fontWeight: 600, marginTop: 6 }} role="alert">לא הצלחנו. נסי שוב.</p>}
      <div style={{ marginTop: 10 }}><Button size="sm" disabled={busy || !text.trim()} onClick={() => void send()}>{busy ? 'שולחת…' : 'שליחה'}</Button></div>
    </Card>
  )
}
