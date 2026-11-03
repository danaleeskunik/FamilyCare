import { useCallback, useEffect, useState } from 'react'
import { Badge, Button, Callout, Card, CardHead, Empty, Ltr, RowActions } from '../../components/ui'
import { TextAreaField, TextField } from '../../components/Fields'
import { supabase } from '../../lib/supabase'
import { useStore } from '../../store/AppStore'
import { TODAY } from '../../data/model'
import { formatDM, parseISO } from '../../lib/dates'

type Todo = { id: string; title: string; details: string; dueOn: string | null; done: boolean }
type Row = { id: string; title: string; details: string | null; due_on: string | null; done: boolean }
const fromRow = (r: Row): Todo => ({ id: r.id, title: r.title, details: r.details ?? '', dueOn: r.due_on, done: r.done })
const missing = (e: { code?: string; message?: string } | null) => !!e && (['42P01', 'PGRST205'].includes(e.code ?? '') || /schema cache|does not exist/i.test(e.message ?? ''))
const blank = { id: null as string | null, title: '', details: '', dueOn: '' }

/** The owner's and managers' list of things to take care of: add, edit, tick off, delete. */
export default function Todos() {
  const { notify } = useStore()
  const [items, setItems] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [setup, setSetup] = useState(false)
  const [editing, setEditing] = useState<typeof blank | null>(null)
  const [err, setErr] = useState('')
  const [removing, setRemoving] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('admin_todos').select('id, title, details, due_on, done').order('created_at', { ascending: false })
    if (error) { if (missing(error)) setSetup(true); else notify('לא הצלחנו לטעון את המשימות'); setLoading(false); return }
    setItems((data as Row[]).map(fromRow)); setLoading(false)
  }, [notify])
  useEffect(() => { void load() }, [load])

  const save = async () => {
    if (!editing) return
    if (!editing.title.trim()) { setErr('כתבי מה צריך לטפל'); return }
    const row = { title: editing.title.trim(), details: editing.details.trim() || null, due_on: editing.dueOn || null, updated_at: new Date().toISOString() }
    const { error } = editing.id ? await supabase.from('admin_todos').update(row).eq('id', editing.id) : await supabase.from('admin_todos').insert(row)
    if (error) { console.error('todo save failed', error); notify('לא הצלחנו לשמור. נסי שוב.'); return }
    setEditing(null); setErr(''); void load()
  }
  const toggle = async (t: Todo) => {
    setItems((cur) => cur.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))
    const { error } = await supabase.from('admin_todos').update({ done: !t.done, updated_at: new Date().toISOString() }).eq('id', t.id)
    if (error) { notify('לא הצלחנו לעדכן'); void load() }
  }
  const remove = async (id: string) => {
    setRemoving(null)
    const { error } = await supabase.from('admin_todos').delete().eq('id', id)
    if (error) { notify('לא הצלחנו למחוק'); return }
    setItems((cur) => cur.filter((x) => x.id !== id))
  }

  if (setup) {
    return (
      <Callout tone="warning" title="צריך להקים את רשימת המשימות">
        מריצים פעם אחת ב-SQL Editor של Supabase את הקובץ <Ltr>supabase/upgrade_0022_admin_todos.sql</Ltr>, ואז מרעננים.
      </Callout>
    )
  }

  const open = items.filter((t) => !t.done).sort((a, b) => (a.dueOn ?? '9999').localeCompare(b.dueOn ?? '9999'))
  const done = items.filter((t) => t.done)
  const due = (t: Todo) => {
    if (!t.dueOn) return null
    const late = !t.done && t.dueOn < TODAY
    return <Badge tone={late ? 'red' : t.dueOn === TODAY ? 'orange' : 'neutral'}>{late ? 'באיחור · ' : ''}{t.dueOn === TODAY ? 'היום' : formatDM(parseISO(t.dueOn))}</Badge>
  }
  const row = (t: Todo) => (
    <div key={t.id} className="row" style={{ gap: 12, alignItems: 'flex-start', padding: '12px 18px', borderTop: '1px solid var(--border-card)' }}>
      <input type="checkbox" checked={t.done} onChange={() => void toggle(t)} aria-label={`סימון ״${t.title}״ כבוצע`} style={{ width: 22, height: 22, marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--ink-2)' : undefined }}>{t.title} {due(t)}</div>
        {t.details && <p className="card-meta" style={{ marginTop: 4, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{t.details}</p>}
      </div>
      {removing === t.id
        ? <span className="lead-confirm"><Button size="sm" variant="danger" onClick={() => void remove(t.id)}>מחיקה</Button><Button size="sm" variant="quiet" onClick={() => setRemoving(null)}>ביטול</Button></span>
        : <RowActions what={`המשימה ${t.title}`} onEdit={() => { setErr(''); setEditing({ id: t.id, title: t.title, details: t.details, dueOn: t.dueOn ?? '' }) }} onDelete={() => setRemoving(t.id)} />}
    </div>
  )

  return (
    <>
      <Card flush>
        <CardHead title="משימות לטיפול">
          <span className="card-meta">{open.length} פתוחות</span>
          {!editing && <Button size="sm" icon="plus" onClick={() => { setErr(''); setEditing(blank) }}>משימה חדשה</Button>}
        </CardHead>
        {editing && (
          <div className="inset stack" style={{ gap: 10, margin: '0 18px 14px' }}>
            <TextField label="מה צריך לטפל?" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} error={err} />
            <TextAreaField label="פרטים (לא חובה)" value={editing.details} onChange={(v) => setEditing({ ...editing, details: v })} rows={3} />
            <TextField label="עד מתי (לא חובה)" type="date" value={editing.dueOn} onChange={(e) => setEditing({ ...editing, dueOn: e.target.value })} />
            <div className="row" style={{ gap: 8 }}>
              <Button size="sm" onClick={() => void save()}>שמירה</Button>
              <Button size="sm" variant="quiet" onClick={() => { setEditing(null); setErr('') }}>ביטול</Button>
            </div>
          </div>
        )}
        {loading ? <p className="muted" role="status" style={{ padding: 18 }}>טוענת…</p>
          : open.length === 0 ? <div style={{ padding: 18 }}><Empty text="אין משימות פתוחות. אפשר להוסיף את הראשונה." /></div>
          : open.map(row)}
      </Card>
      {done.length > 0 && (
        <Card flush>
          <CardHead title="הושלמו"><span className="card-meta">{done.length}</span></CardHead>
          {done.map(row)}
        </Card>
      )}
    </>
  )
}
