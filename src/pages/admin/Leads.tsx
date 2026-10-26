import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Callout, Card, CardHead, Empty, Icon, Ltr } from '../../components/ui'
import { supabase } from '../../lib/supabase'

type Status = 'new' | 'talked' | 'meeting' | 'joined' | 'not_relevant'
type Lead = { id: string; name: string; phone: string | null; status: Status; notes: string; createdAt: string; updatedAt: string }

const STATUSES: { value: Status; label: string }[] = [
  { value: 'new', label: 'חדש' },
  { value: 'talked', label: 'דיברנו' },
  { value: 'meeting', label: 'פגישת היכרות' },
  { value: 'joined', label: 'הצטרף/ה' },
  { value: 'not_relevant', label: 'לא רלוונטי' },
]

type Row = { id: string; name: string; phone: string | null; status: Status; notes: string; created_at: string; updated_at: string }
const fromRow = (r: Row): Lead => ({ id: r.id, name: r.name, phone: r.phone, status: r.status, notes: r.notes, createdAt: r.created_at, updatedAt: r.updated_at })

/** Israeli mobile/landline → international digits for wa.me; null if there is no usable number. */
function waNumber(phone: string | null): string | null {
  const d = (phone ?? '').replace(/\D/g, '')
  if (d.length < 8) return null
  if (d.startsWith('972')) return d
  return d.startsWith('0') ? `972${d.slice(1)}` : `972${d}`
}

function ago(iso: string): string {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'עודכן עכשיו'
  if (m < 60) return `עודכן לפני ${m} דקות`
  const h = Math.round(m / 60)
  if (h < 24) return `עודכן לפני ${h} שעות`
  const d = Math.round(h / 24)
  return `עודכן לפני ${d} ימים`
}

const isMissingTable = (e: { code?: string; message?: string } | null) => !!e && (e.code === '42P01' || e.code === 'PGRST205' || /schema cache|does not exist/i.test(e.message ?? ''))

function LeadCard({ lead, onStatus, onNotes, onDelete }: {
  lead: Lead; onStatus: (id: string, s: Status) => void; onNotes: (id: string, text: string) => Promise<void>; onDelete: (id: string) => void
}) {
  const [notes, setNotes] = useState(lead.notes)
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [confirming, setConfirming] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const dirty = useRef(false)
  const latest = useRef(notes)

  const flush = useCallback(async () => {
    clearTimeout(timer.current)
    if (!dirty.current) return
    dirty.current = false
    setState('saving')
    await onNotes(lead.id, latest.current)
    setState('saved')
  }, [lead.id, onNotes])

  useEffect(() => () => { clearTimeout(timer.current); if (dirty.current) void onNotes(lead.id, latest.current) }, [lead.id, onNotes])

  const change = (v: string) => {
    setNotes(v); latest.current = v; dirty.current = true; setState('idle')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => void flush(), 900)
  }

  const wa = waNumber(lead.phone)
  return (
    <article className={`lead ${lead.status}`}>
      <div className="lead-top">
        <div className="lead-id">
          <strong>{lead.name}</strong>
          {lead.phone && <Ltr>{lead.phone}</Ltr>}
        </div>
        <div className="lead-actions">
          <select className="input lead-status" aria-label={`סטטוס של ${lead.name}`} value={lead.status} onChange={(e) => onStatus(lead.id, e.target.value as Status)}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {lead.phone && <a className="icon-btn" href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`} aria-label={`התקשרות אל ${lead.name}`} title="התקשרות"><Icon name="phone" size={18} /></a>}
          {wa && <a className="icon-btn" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp אל ${lead.name}`} title="WhatsApp"><Icon name="message" size={18} /></a>}
          {confirming ? (
            <span className="lead-confirm">
              <Button size="sm" variant="danger" onClick={() => onDelete(lead.id)}>מחיקה</Button>
              <Button size="sm" variant="quiet" onClick={() => setConfirming(false)}>ביטול</Button>
            </span>
          ) : (
            <button type="button" className="icon-btn danger" aria-label={`מחיקת ${lead.name}`} title="מחיקה" onClick={() => setConfirming(true)}><Icon name="trash" size={18} /></button>
          )}
        </div>
      </div>
      <textarea className="input lead-notes" rows={2} placeholder="הערות: מה דובר, מה הצעד הבא" aria-label={`הערות על ${lead.name}`} value={notes} onChange={(e) => change(e.target.value)} onBlur={() => void flush()} />
      <div className="card-meta">{state === 'saving' ? 'שומר…' : state === 'saved' ? 'נשמר' : ago(lead.updatedAt)}</div>
    </article>
  )
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [setupNeeded, setSetupNeeded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | Status>('all')
  const [q, setQ] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let alive = true
    void (async () => {
      const { data, error: e } = await supabase.from('leads').select('id, name, phone, status, notes, created_at, updated_at').order('created_at', { ascending: false })
      if (!alive) return
      if (e) { if (isMissingTable(e)) setSetupNeeded(true); else setError('לא הצלחנו לטעון את הלידים. אפשר לרענן ולנסות שוב.') }
      else setLeads((data as Row[]).map(fromRow))
      setLoading(false)
    })()
    return () => { alive = false }
  }, [])

  const add = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!name.trim()) return
    setAdding(true); setError(null)
    const { data, error: e } = await supabase.from('leads').insert({ name: name.trim(), phone: phone.trim() || null }).select('id, name, phone, status, notes, created_at, updated_at').single()
    setAdding(false)
    if (e || !data) { setError('לא הצלחנו להוסיף את הליד. אפשר לנסות שוב.'); return }
    setLeads((cur) => [fromRow(data as Row), ...cur]); setName(''); setPhone('')
  }

  const setStatus = useCallback(async (id: string, status: Status) => {
    const prev = leads
    setLeads((cur) => cur.map((l) => (l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l)))
    const { error: e } = await supabase.from('leads').update({ status }).eq('id', id)
    if (e) { setLeads(prev); setError('לא הצלחנו לעדכן את הסטטוס.') }
  }, [leads])

  const saveNotes = useCallback(async (id: string, text: string) => {
    const { error: e } = await supabase.from('leads').update({ notes: text }).eq('id', id)
    if (e) setError('לא הצלחנו לשמור את ההערה.')
    else setLeads((cur) => cur.map((l) => (l.id === id ? { ...l, notes: text, updatedAt: new Date().toISOString() } : l)))
  }, [])

  const remove = useCallback(async (id: string) => {
    const prev = leads
    setLeads((cur) => cur.filter((l) => l.id !== id))
    const { error: e } = await supabase.from('leads').delete().eq('id', id)
    if (e) { setLeads(prev); setError('לא הצלחנו למחוק את הליד.') }
  }, [leads])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length }
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1
    return c
  }, [leads])

  const shown = leads.filter((l) => (filter === 'all' || l.status === filter) && (!q.trim() || `${l.name} ${l.phone ?? ''} ${l.notes}`.toLowerCase().includes(q.trim().toLowerCase())))

  if (setupNeeded) {
    return (
      <Callout tone="warning" title="צריך להקים את טבלת הלידים">
        הטבלה עוד לא קיימת במסד הנתונים. מריצים פעם אחת ב-SQL Editor של Supabase את הקובץ <Ltr>supabase/upgrade_0013_leads.sql</Ltr>, ואז מרעננים את העמוד.
      </Callout>
    )
  }

  return (
    <>
      <Card flush>
        <CardHead title="לידים">
          <span className="card-meta">משפחות ואנשים שאנחנו בקשר איתם לפני ההצטרפות</span>
        </CardHead>
        <form className="lead-add" onSubmit={add}>
          <input className="input" placeholder="שם הליד" aria-label="שם הליד" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="input" placeholder="טלפון" aria-label="טלפון" inputMode="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button type="submit" icon="plus" disabled={adding || !name.trim()}>הוספה</Button>
        </form>
      </Card>

      {error && <Callout tone="warning" title="משהו לא הצליח">{error}</Callout>}

      <div className="lead-bar">
        <input className="search" placeholder="חיפוש לפי שם, טלפון או הערות" aria-label="חיפוש לידים" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="lead-chips" role="group" aria-label="סינון לפי סטטוס">
          <button type="button" className={`chip ${filter === 'all' ? 'active' : ''}`} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>הכול {counts.all}</button>
          {STATUSES.map((s) => (
            <button key={s.value} type="button" className={`chip ${filter === s.value ? 'active' : ''}`} aria-pressed={filter === s.value} onClick={() => setFilter(s.value)}>{s.label} {counts[s.value] ?? 0}</button>
          ))}
        </div>
      </div>

      {loading ? <p className="muted" role="status">טוענת…</p>
        : shown.length === 0 ? <Empty text={leads.length === 0 ? 'עוד אין לידים. מוסיפים את הראשון למעלה, עם שם וטלפון.' : 'אין לידים שמתאימים לחיפוש או לסינון.'} />
        : <div className="lead-list">{shown.map((l) => <LeadCard key={l.id} lead={l} onStatus={setStatus} onNotes={saveNotes} onDelete={remove} />)}</div>}
    </>
  )
}
