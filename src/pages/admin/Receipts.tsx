import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge, Button, Callout, Card, CardHead, Empty, Icon, Ltr, RowActions, money } from '../../components/ui'
import { SelectField, TextAreaField, TextField } from '../../components/Fields'
import { supabase } from '../../lib/supabase'
import { shrink } from '../../lib/image'
import { missingTable } from '../../lib/intake'
import { useStore } from '../../store/AppStore'
import { RECEIPT_CATEGORIES, RECEIPT_UNSORTED, VAT_RATE } from '../../data/receipts'

type Doc = { id: string; captured_at: string; doc_date: string | null; category: string; vendor: string; amount: number | null; vat: number | null; note: string; storage_path: string; mime: string | null; auto_read?: boolean }
type Draft = { vendor: string; doc_date: string; category: string; amount: string; vat: string; note: string }

const BUCKET = 'expense-docs'
type Read = { vendor: string; doc_date: string | null; amount: number | null; vat: number | null; category: string | null; note: string }
/** Asks the read-invoice Edge Function to read the file. Returns null (and says why) when it is not set up or fails. */
async function readInvoice(path: string): Promise<{ ok: true; data: Read } | { ok: false; reason: 'setup' | 'failed' }> {
  const { data, error } = await supabase.functions.invoke('read-invoice', { body: { path } })
  if (error || !data || (data as { error?: string }).error) {
    const status = (error as { context?: { status?: number } } | null)?.context?.status
    return { ok: false, reason: status === 404 || status === 501 || (data as { error?: string } | null)?.error === 'not_configured' ? 'setup' : 'failed' }
  }
  return { ok: true, data: data as Read }
}
const monthKey = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
const monthLabel = (key: string) => new Date(`${key}-01T12:00:00`).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
const dayLabel = (iso: string) => { const d = new Date(iso); return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}` }
const num = (s: string) => { const n = Number(s.replace(',', '.')); return s.trim() && Number.isFinite(n) ? Math.round(n * 100) / 100 : null }
const toDraft = (d: Doc): Draft => ({ vendor: d.vendor, doc_date: d.doc_date ?? '', category: d.category, amount: d.amount == null ? '' : String(d.amount), vat: d.vat == null ? '' : String(d.vat), note: d.note })
const sum = (ds: Doc[], k: 'amount' | 'vat') => ds.reduce((n, d) => n + (Number(d[k]) || 0), 0)

function csvCell(v: string | number | null) { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }

/** Collects invoices for tax refunds: scan with the phone camera or upload, sort by month captured and category. */
export default function Receipts() {
  const { notify } = useStore()
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [setup, setSetup] = useState(false)
  const [busy, setBusy] = useState(false)
  const [month, setMonth] = useState('')
  const [category, setCategory] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [reading, setReading] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('expense_docs').select('*').order('captured_at', { ascending: false })
    if (error) { if (missingTable(error)) setSetup(true); else notify('לא הצלחנו לטעון את החשבוניות'); setLoading(false); return }
    setDocs((data ?? []) as Doc[]); setLoading(false)
  }, [notify])
  useEffect(() => { void load() }, [load])

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    const added: { id: string; path: string }[] = []
    let ok = 0
    for (const file of Array.from(files)) {
      if (file.size > 25_000_000) { notify(`${file.name}: הקובץ גדול מדי`); continue }
      const body = await shrink(file)
      const isImg = body instanceof Blob && body !== file ? true : file.type.startsWith('image/')
      const ext = body !== file ? 'jpg' : ((file.name.match(/\.(\w{2,5})$/)?.[1] ?? (isImg ? 'jpg' : 'bin')).toLowerCase())
      const key = `${crypto.randomUUID()}.${ext}`
      const contentType = body !== file ? 'image/jpeg' : (file.type || undefined)
      const up = await supabase.storage.from(BUCKET).upload(key, body, { contentType })
      if (up.error) { console.error('receipt upload failed', up.error); notify(`לא הצלחנו להעלות: ${file.name}`); continue }
      const { data, error } = await supabase.from('expense_docs').insert({ storage_path: key, mime: contentType ?? null, category: RECEIPT_UNSORTED }).select('id').single()
      if (error || !data) { console.error('receipt save failed', error); await supabase.storage.from(BUCKET).remove([key]); notify(`לא הצלחנו לשמור: ${file.name}`); continue }
      ok++; added.push({ id: data.id as string, path: key })
    }
    setBusy(false)
    if (!ok) return
    notify(ok === 1 ? 'החשבונית נקלטה ונשמרה' : `${ok} חשבוניות נקלטו ונשמרו`)
    await load()
    // Read each invoice automatically; if that is not available, open the first one for manual details.
    let unread = 0
    for (const a of added) if (!(await autoRead(a.id, a.path))) unread++
    if (unread) { const f = added[0]; setEditing(f.id); setDraft({ vendor: '', doc_date: '', category: RECEIPT_UNSORTED, amount: '', vat: '', note: '' }) }
  }

  /** Fills a saved invoice from its content. true = filled. */
  const autoRead = async (id: string, path: string) => {
    setReading((cur) => new Set(cur).add(id))
    const r = await readInvoice(path)
    let filled = false
    if (r.ok) {
      const d = r.data
      const patch = { vendor: d.vendor || '', doc_date: d.doc_date, amount: d.amount, vat: d.vat, category: d.category ?? RECEIPT_UNSORTED, note: d.note || '', auto_read: true }
      const { error } = await supabase.from('expense_docs').update(patch).eq('id', id)
      if (error) { console.error('auto-read save failed (is upgrade_0034 run?)', error); const { auto_read: _a, ...rest } = patch; void _a; const retry = await supabase.from('expense_docs').update(rest).eq('id', id); filled = !retry.error } else filled = true
      if (filled) setDocs((cur) => cur.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    } else notify(r.reason === 'setup' ? 'הקריאה האוטומטית עוד לא הוקמה. אפשר למלא ידנית.' : 'לא הצלחנו לקרוא את החשבונית. אפשר למלא ידנית.')
    setReading((cur) => { const n = new Set(cur); n.delete(id); return n })
    return filled
  }

  const openFile = async (d: Doc) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(d.storage_path, 120)
    if (error || !data) { notify('לא הצלחנו לפתוח את הקובץ'); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }
  const remove = async (d: Doc) => {
    if (!window.confirm('למחוק לצמיתות את החשבונית והקובץ שלה? אי אפשר לשחזר.')) return
    const { error } = await supabase.from('expense_docs').delete().eq('id', d.id)
    if (error) { notify('לא הצלחנו למחוק'); return }
    await supabase.storage.from(BUCKET).remove([d.storage_path])
    setDocs((cur) => cur.filter((x) => x.id !== d.id))
  }
  const setCat = async (d: Doc, cat: string) => {
    setDocs((cur) => cur.map((x) => (x.id === d.id ? { ...x, category: cat } : x)))
    const { error } = await supabase.from('expense_docs').update({ category: cat }).eq('id', d.id)
    if (error) { notify('לא הצלחנו לשמור את הקטגוריה'); void load() }
  }
  const saveDraft = async (d: Doc) => {
    if (!draft) return
    setSaving(true)
    const patch = { vendor: draft.vendor.trim(), doc_date: draft.doc_date || null, category: draft.category, amount: num(draft.amount), vat: num(draft.vat), note: draft.note.trim(), auto_read: false }
    const { error } = await supabase.from('expense_docs').update(patch).eq('id', d.id)
    setSaving(false)
    if (error) { notify('לא הצלחנו לשמור'); return }
    setDocs((cur) => cur.map((x) => (x.id === d.id ? { ...x, ...patch } : x)))
    setEditing(null); setDraft(null)
  }

  const months = useMemo(() => [...new Set(docs.map((d) => monthKey(d.captured_at)))], [docs])
  const shown = useMemo(() => docs.filter((d) => (!month || monthKey(d.captured_at) === month) && (!category || d.category === category)), [docs, month, category])
  const byMonth = useMemo(() => {
    const m = new Map<string, Doc[]>()
    for (const d of shown) { const k = monthKey(d.captured_at); m.set(k, [...(m.get(k) ?? []), d]) }
    return [...m.entries()]
  }, [shown])
  const byCategory = useMemo(() => {
    const m = new Map<string, Doc[]>()
    for (const d of shown) m.set(d.category, [...(m.get(d.category) ?? []), d])
    return [...m.entries()].sort((a, b) => sum(b[1], 'amount') - sum(a[1], 'amount'))
  }, [shown])

  const exportCsv = () => {
    const head = ['תאריך קליטה', 'תאריך חשבונית', 'ספק', 'קטגוריה', 'סכום', 'מע"מ', 'הערה']
    const rows = shown.map((d) => [dayLabel(d.captured_at), d.doc_date ?? '', d.vendor, d.category, d.amount, d.vat, d.note].map(csvCell).join(','))
    const blob = new Blob(['﻿' + [head.map(csvCell).join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = `חשבוניות${month ? `-${month}` : ''}.csv`; a.click()
    URL.revokeObjectURL(a.href)
  }

  if (setup) return <Callout tone="warning" title="צריך להקים את אוסף החשבוניות">מריצים פעם אחת ב-SQL Editor של Supabase את הקובץ upgrade_0033_expense_docs.sql, ואז מרעננים.</Callout>

  return (
    <div className="stack">
      <Card>
        <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="card-title">חשבוניות להחזרי מס</div>
            <p className="muted" style={{ marginTop: 4, lineHeight: 1.6, maxWidth: 560 }}>בטלפון: "סריקת חשבונית" פותחת את המצלמה, והחשבונית נשמרת מיד. אחר כך אפשר להשלים ספק, סכום וקטגוריה. הקבצים שמורים באחסון פרטי, ונגישים למנהלים בלבד.</p>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <label className="btn sm" style={{ cursor: 'pointer' }}><Icon name="plus" size={16} />{busy ? 'מעלה…' : 'סריקת חשבונית'}
              <input type="file" accept="image/*" capture="environment" hidden disabled={busy} onChange={(e) => { void upload(e.target.files); e.target.value = '' }} />
            </label>
            <label className="btn secondary sm" style={{ cursor: 'pointer' }}>העלאת קבצים
              <input type="file" multiple accept="application/pdf,image/*" hidden disabled={busy} onChange={(e) => { void upload(e.target.files); e.target.value = '' }} />
            </label>
            <Button size="sm" variant="secondary" icon="export" disabled={!shown.length} onClick={exportCsv}>ייצוא CSV</Button>
          </div>
        </div>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap', marginTop: 14, alignItems: 'flex-end' }}>
          <div style={{ minWidth: 190 }}><SelectField label="חודש קליטה" value={month} onChange={setMonth} placeholder="כל החודשים" options={months.map((k) => ({ value: k, label: monthLabel(k) }))} /></div>
          <div style={{ minWidth: 190 }}><SelectField label="קטגוריה" value={category} onChange={setCategory} placeholder="כל הקטגוריות" options={RECEIPT_CATEGORIES} /></div>
          <div className="card-meta" style={{ paddingBottom: 12 }}>{shown.length} חשבוניות · סכום <Ltr>{money(sum(shown, 'amount'))}</Ltr> · מע"מ <Ltr>{money(sum(shown, 'vat'))}</Ltr></div>
        </div>
      </Card>

      {byCategory.length > 0 && (
        <Card flush>
          <CardHead title="סיכום לפי קטגוריה" />
          <div className="table-wrap"><table>
            <thead><tr><th>קטגוריה</th><th>חשבוניות</th><th>סכום</th><th>מע"מ</th></tr></thead>
            <tbody>
              {byCategory.map(([c, ds]) => <tr key={c}><td className="name">{c === RECEIPT_UNSORTED ? <Badge tone="orange">{c}</Badge> : c}</td><td><Ltr>{ds.length}</Ltr></td><td><Ltr>{money(sum(ds, 'amount'))}</Ltr></td><td><Ltr>{money(sum(ds, 'vat'))}</Ltr></td></tr>)}
            </tbody>
          </table></div>
        </Card>
      )}

      {loading ? <p className="muted" role="status">טוענת…</p> : byMonth.length === 0 ? (
        <Card><Empty text="עוד לא נקלטו חשבוניות. 'סריקת חשבונית' מצלמת ושומרת." /></Card>
      ) : byMonth.map(([k, ds]) => (
        <Card key={k} flush>
          <CardHead title={`${monthLabel(k)} · ${ds.length} חשבוניות`}><span className="card-meta">סכום <Ltr>{money(sum(ds, 'amount'))}</Ltr> · מע"מ <Ltr>{money(sum(ds, 'vat'))}</Ltr></span></CardHead>
          <div className="table-wrap"><table>
            <thead><tr><th>נקלטה</th><th>ספק</th><th>קטגוריה</th><th>סכום</th><th>מע"מ</th><th><span className="sr-only">פעולות</span></th></tr></thead>
            <tbody>
              {ds.map((d) => (
                <FragmentRow key={d.id} d={d} editing={editing === d.id} draft={draft} saving={saving} reading={reading.has(d.id)} onRead={async () => { const r = await readInvoice(d.storage_path); if (!r.ok) { notify(r.reason === 'setup' ? 'הקריאה האוטומטית עוד לא הוקמה.' : 'לא הצלחנו לקרוא את החשבונית.'); return } setDraft((cur) => cur && { ...cur, vendor: r.data.vendor || cur.vendor, doc_date: r.data.doc_date ?? cur.doc_date, category: r.data.category ?? cur.category, amount: r.data.amount == null ? cur.amount : String(r.data.amount), vat: r.data.vat == null ? cur.vat : String(r.data.vat), note: r.data.note || cur.note }) }}
                  onCat={(c) => void setCat(d, c)} onOpen={() => void openFile(d)} onDelete={() => void remove(d)}
                  onEdit={() => { setEditing(d.id); setDraft(toDraft(d)) }} onCancel={() => { setEditing(null); setDraft(null) }}
                  onDraft={setDraft} onSave={() => void saveDraft(d)} />
              ))}
            </tbody>
          </table></div>
        </Card>
      ))}
    </div>
  )
}

function FragmentRow({ d, editing, draft, saving, reading, onRead, onCat, onOpen, onDelete, onEdit, onCancel, onDraft, onSave }: {
  d: Doc; editing: boolean; draft: Draft | null; saving: boolean; reading: boolean; onRead: () => Promise<void>
  onCat: (c: string) => void; onOpen: () => void; onDelete: () => void; onEdit: () => void; onCancel: () => void; onDraft: (d: Draft) => void; onSave: () => void
}) {
  const [busyRead, setBusyRead] = useState(false)
  const set = (k: keyof Draft) => (v: string) => draft && onDraft({ ...draft, [k]: v })
  return (
    <>
      <tr>
        <td><Ltr>{dayLabel(d.captured_at)}</Ltr></td>
        <td className="name">{reading ? <span className="muted">קוראת את החשבונית…</span> : d.vendor || <span className="muted">ללא שם</span>}{d.auto_read && !reading && <div><Badge tone="blue">מולא אוטומטית, כדאי לבדוק</Badge></div>}{d.doc_date && <div className="card-meta">חשבונית מ-<Ltr>{d.doc_date.split('-').reverse().join('.')}</Ltr></div>}</td>
        <td>
          <select className="input" style={{ minWidth: 150 }} aria-label="קטגוריה" value={d.category} onChange={(e) => onCat(e.target.value)}>
            {(RECEIPT_CATEGORIES.includes(d.category) ? RECEIPT_CATEGORIES : [d.category, ...RECEIPT_CATEGORIES]).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </td>
        <td>{d.amount == null ? '—' : <Ltr>{money(Number(d.amount))}</Ltr>}</td>
        <td>{d.vat == null ? '—' : <Ltr>{money(Number(d.vat))}</Ltr>}</td>
        <td><RowActions what="החשבונית" extra={<button type="button" className="icon-btn" aria-label="פתיחת הקובץ" title="פתיחת הקובץ" onClick={onOpen}><Icon name="document" size={17} /></button>} onEdit={onEdit} onDelete={onDelete} /></td>
      </tr>
      {editing && draft && (
        <tr>
          <td colSpan={6}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, padding: '8px 4px' }}>
              <TextField label="ספק / עסק" value={draft.vendor} onChange={(e) => set('vendor')(e.target.value)} />
              <TextField label="תאריך החשבונית" type="date" value={draft.doc_date} onChange={(e) => set('doc_date')(e.target.value)} />
              <SelectField label="קטגוריה" value={draft.category} onChange={set('category')} options={RECEIPT_CATEGORIES} />
              <TextField label="סכום כולל (₪)" inputMode="decimal" dir="ltr" value={draft.amount} onChange={(e) => set('amount')(e.target.value)} />
              <TextField label={'מע"מ (₪)'} inputMode="decimal" dir="ltr" value={draft.vat} onChange={(e) => set('vat')(e.target.value)} hint={`אפשר להשאיר ריק, או לחשב ${Math.round(VAT_RATE * 100)}% מהסכום`} />
              <div style={{ gridColumn: '1 / -1' }}><TextAreaField label="הערה" value={draft.note} onChange={set('note')} rows={2} /></div>
            </div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap', paddingBottom: 6 }}>
              <Button size="sm" disabled={saving} onClick={onSave}>{saving ? 'שומרת…' : 'שמירה'}</Button>
              <Button size="sm" variant="secondary" disabled={busyRead} onClick={() => { setBusyRead(true); void onRead().finally(() => setBusyRead(false)) }}>{busyRead ? 'קוראת…' : 'קריאה אוטומטית'}</Button>
              <Button size="sm" variant="secondary" onClick={() => { const a = num(draft.amount); if (a != null) onDraft({ ...draft, vat: String(Math.round((a - a / (1 + VAT_RATE)) * 100) / 100) }) }}>חישוב מע"מ</Button>
              <Button size="sm" variant="quiet" onClick={onCancel}>סגירה</Button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
