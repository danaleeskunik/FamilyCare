/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Badge, Button, Card, Ltr } from '../components/ui'
import Modal from '../components/Modal'
import { SelectField, TextAreaField, TextField } from '../components/Fields'
import { supabase } from '../lib/supabase'
import { shrink } from '../lib/image'
import { localHM } from '../lib/queries'
import { TODAY } from '../data/model'
import { DAY_NAMES } from '../lib/dates'

export const EXPENSE_CATEGORIES = ['בית קפה / מסעדה', 'תחבורה / מונית', 'קניות', 'כרטיסים / בילוי', 'תיקון / ספק', 'אחר']
export const SERVICE_FIELDS = ['תיקונים בבית (אינסטלציה, חשמל, מזגן)', 'רופא / קופת חולים', 'קניות', 'הסעה', 'בילוי ותרבות', 'משרדי / עירייה', 'אחר']

export type Report = {
  body: string; service: string; closure: string; quality: string; newNeeds: string; lessons: string
  done: string[]
}

const DONE_ITEMS = ['הגעתי בזמן', 'בוצעה המשימה שתוכננה', 'ההורה קיבל/ה את הליווי בנעימות', 'נסגרה הבקשה במלואה']

/** End-of-visit report. Saves the summary (waiting for office approval) and, if filled in, an expense with a receipt photo. */
export function ReportDialog({ task, staffId, existing, onClose, onSaved }: {
  task: any; staffId: string; existing?: any; onClose: () => void; onSaved: () => void
}) {
  const d = (existing?.details ?? {}) as Partial<Report>
  const [r, setR] = useState<Report>({ body: d.body ?? existing?.body ?? '', service: d.service ?? '', closure: d.closure ?? '', quality: d.quality ?? '', newNeeds: d.newNeeds ?? '', lessons: d.lessons ?? '', done: d.done ?? [] })
  const [start, setStart] = useState(() => (task.checked_in_at ? localHM(task.checked_in_at) : String(task.start_time ?? '').slice(0, 5)))
  const [end, setEnd] = useState(() => (task.checked_out_at ? localHM(task.checked_out_at) : String(task.end_time ?? '').slice(0, 5)))
  const [cat, setCat] = useState('')
  const [amount, setAmount] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k: keyof Report) => (v: string) => setR((s) => ({ ...s, [k]: v }))
  const toggle = (x: string) => setR((s) => ({ ...s, done: s.done.includes(x) ? s.done.filter((y) => y !== x) : [...s.done, x] }))
  const client = (Array.isArray(task.clients) ? task.clients[0] : task.clients)?.full_name ?? ''

  const save = async () => {
    if (!start || !end) { setErr('הזיני שעת התחלה ושעת סיום של הביקור'); return }
    if (end <= start) { setErr('שעת הסיום חייבת להיות אחרי שעת ההתחלה'); return }
    if (!r.body.trim() || !r.service.trim()) { setErr('כתבי את סיכום הביקור ומה בוצע בפועל'); return }
    if ((amount || file) && !(Number(amount) > 0)) { setErr('הזיני את סכום ההוצאה'); return }
    setBusy(true); setErr('')
    try {
      // What the family reads: summary, service, closure, quality and new needs. The lessons stay internal.
      const family = [['שעות הביקור', `${start}–${end}`], ['סיכום הביקור', r.body], ['מה בוצע', r.service], ['סגירת הבקשה', r.closure], ['איך התנהל המפגש', r.quality], ['צרכים חדשים שזוהו', r.newNeeds]]
        .filter(([, v]) => v.trim()).map(([k, v]) => `${k}: ${v.trim()}`).join('\n')
      const { data: ok, error } = await supabase.rpc('submit_visit_report', { p_task: task.id, p_body: family, p_details: { ...r }, p_start: start, p_end: end })
      if (error || ok !== true) throw error ?? new Error('report rejected')
      if (Number(amount) > 0) {
        let path: string | null = null
        if (file) {
          const body = await shrink(file)
          const ext = body.type === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
          path = `${staffId}/${crypto.randomUUID()}.${ext}`
          const up = await supabase.storage.from('receipts').upload(path, body, { contentType: body.type || file.type })
          if (up.error) throw up.error
        }
        const ex = await supabase.from('staff_expenses').insert({
          staff_id: staffId, task_id: task.id, client_id: task.client_id, expense_date: TODAY, amount: Number(amount),
          description: `${cat || 'הוצאה'} · ${client}`, category: cat || null, receipt_path: path,
        })
        if (ex.error) throw ex.error
      }
      onSaved(); onClose()
    } catch (e) {
      console.error('report failed', e)
      setErr('לא הצלחנו לשמור. בדקי את החיבור ונסי שוב. אם זה חוזר, ייתכן שהמשרד צריך להשלים הגדרה.')
    } finally { setBusy(false) }
  }

  return (
    <Modal title={`סיכום פגישה · ${client}`} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>אחר כך</Button><Button disabled={busy} onClick={save}>{busy ? 'שולחת…' : 'שליחה למשפחה ולמשרד'}</Button></>}>
      <div className="stack" style={{ gap: 14 }}>
        <div className="inset stack" style={{ gap: 10 }}>
          <div className="card-label">שעות הביקור (נכנסות לסיכום ולצבירת השעות החודשית)</div>
          <div className="grid cols-2" style={{ gap: 10 }}>
            <TextField label="התחלת ביקור" type="time" dir="ltr" value={start} onChange={(e) => setStart(e.target.value)} />
            <TextField label="סיום ביקור" type="time" dir="ltr" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div>
          <div className="card-label" style={{ marginBottom: 6 }}>מה הושלם</div>
          <div className="stack" style={{ gap: 6 }}>
            {DONE_ITEMS.map((x) => (
              <label key={x} className="row" style={{ gap: 8, fontWeight: 600 }}><input type="checkbox" checked={r.done.includes(x)} onChange={() => toggle(x)} />{x}</label>
            ))}
          </div>
        </div>
        <TextAreaField label="סיכום הפגישה (נשלח למזמין/ת השירות ולמשרד)" value={r.body} onChange={set('body')} placeholder="מה היה בפגישה" />
        <TextAreaField label="שירות: מה בוצע" value={r.service} onChange={set('service')} placeholder="למשל: אכלנו ארוחת בוקר ברולדין. הטכנאי תיקן את המיזוג" />
        <TextAreaField label="סגירת הבקשה" value={r.closure} onChange={set('closure')} rows={2} placeholder="למשל: תוקן המזגן, 450 ₪, אחריות לשנה, הבית נקי" />
        <TextAreaField label="דיווח איכותי" value={r.quality} onChange={set('quality')} rows={2} hint="איך התנהל המפגש, מצבו הפיזי והמוראלי" />
        <TextAreaField label="צרכים חדשים שזוהו בבית" value={r.newNeeds} onChange={set('newNeeds')} rows={2} placeholder="למשל: מנורה שרופה, צורך בתיקון" />
        <TextAreaField label="לקחים לביקור הבא" value={r.lessons} onChange={set('lessons')} rows={2} />
        <div className="inset stack" style={{ gap: 10 }}>
          <div className="card-label">הוצאה בביקור (אופציונלי)</div>
          <SelectField label="נושא ההוצאה" value={cat} onChange={setCat} options={EXPENSE_CATEGORIES} placeholder="ללא הוצאה" />
          <TextField label="סכום (₪)" type="number" inputMode="decimal" min="0" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <label className="btn secondary sm" style={{ cursor: 'pointer', alignSelf: 'flex-start' }}>
            {file ? `צורפה תמונה: ${file.name.slice(0, 22)}` : 'צילום חשבונית'}
            <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        {err && <div role="alert" style={{ color: 'var(--danger)', font: '600 13px var(--font-ui)' }}>{err}</div>}
      </div>
    </Modal>
  )
}

/** External service request (technician, doctor, shopping...) sent to the office on behalf of a client. */
export function ExternalRequestDialog({ clients, clientId, onClose, flash }: { clients: any[]; clientId?: string; onClose: () => void; flash: (m: string) => void }) {
  const [cid, setCid] = useState(clientId ?? (clients.length === 1 ? clients[0].id : ''))
  const [field, setField] = useState('')
  const [issue, setIssue] = useState('')
  const [date, setDate] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const send = async () => {
    if (!cid || !field || !issue.trim()) { setErr('בחרי לקוח/ה, תחום ותארי את התקלה'); return }
    setBusy(true)
    const { error } = await supabase.from('service_requests').insert({
      client_id: cid, category: field, description: `${urgent ? '[דחוף] ' : ''}${issue.trim()}`, preferred_date: date || null, status: 'new',
    })
    setBusy(false)
    if (error) { console.error('companion request failed', error); setErr('לא הצלחנו לשלוח. נסי שוב, ואם זה חוזר פני למשרד.'); return }
    flash('הבקשה נשלחה למשרד')
    onClose()
  }
  return (
    <Modal title="הזמנת שירות חיצוני" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>ביטול</Button><Button disabled={busy} onClick={send}>שליחה למשרד</Button></>}>
      <div className="stack" style={{ gap: 12 }}>
        <SelectField label="עבור לקוח/ה" value={cid} onChange={setCid} options={clients.map((c) => ({ value: c.id, label: c.full_name }))} placeholder="בחרי" />
        <SelectField label="תחום" value={field} onChange={setField} options={SERVICE_FIELDS} placeholder="בחרי תחום" />
        <TextAreaField label="מה התקלה / מה צריך" value={issue} onChange={setIssue} />
        <TextField label="למתי נדרש לתאם" type="date" dir="ltr" value={date} onChange={(e) => setDate(e.target.value)} />
        <label className="row" style={{ gap: 8, fontWeight: 700 }}><input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />דחוף</label>
        {err && <div role="alert" style={{ color: 'var(--danger)', font: '600 13px var(--font-ui)' }}>{err}</div>}
      </div>
    </Modal>
  )
}

const PREF_LABEL: Record<string, string> = { food: 'אוכל', culture: 'תרבות ותחומי עניין', routine: 'שגרה', companion: 'העדפות לגבי המלווה' }

/** The full client file as a companion sees it. */
export function ClientProfile({ c, data, onRequest }: { c: any; data: any; onRequest: () => void }) {
  const contacts = data.contacts.filter((x: any) => x.client_id === c.id)
  const orderer = contacts.find((x: any) => x.is_orderer)
  const family = contacts.filter((x: any) => !x.is_orderer)
  const prefs = (data.prefs ?? []).filter((x: any) => x.client_id === c.id)
  const allergies = data.allergies.filter((x: any) => x.client_id === c.id)
  const notes = data.notes.filter((x: any) => x.client_id === c.id)
  const slots = data.slots.filter((x: any) => x.client_id === c.id)
  const region = Array.isArray(c.regions) ? c.regions[0]?.name : c.regions?.name
  const hh = (t: string | null) => (t ? t.slice(0, 5) : '')
  return (
    <Card>
      <div style={{ font: '800 20px var(--font-ui)' }}>{c.full_name}</div>
      <div className="inset stack" style={{ gap: 8, marginTop: 10 }}>
        {c.phone && <div className="kv"><span className="muted">טלפון</span><span style={{ fontWeight: 700 }}><a href={`tel:${c.phone}`}><Ltr>{c.phone}</Ltr></a></span></div>}
        {(c.address || region) && <div className="kv"><span className="muted">כתובת</span><span style={{ fontWeight: 700, textAlign: 'end' }}>{[c.address, region].filter(Boolean).join(' · ')}</span></div>}
        {c.building_code && <div className="kv"><span className="muted">קוד דלת / בניין</span><span style={{ fontWeight: 700 }}><Ltr>{c.building_code}</Ltr></span></div>}
      </div>

      <div className="card-label" style={{ margin: '14px 0 4px' }}>מזמין/ת השירות</div>
      {orderer ? (
        <div className="inset stack" style={{ gap: 6 }}>
          <div className="kv"><span className="muted">שם וקרבה</span><span style={{ fontWeight: 700 }}>{orderer.full_name}{orderer.relation ? ` · ${orderer.relation}` : ''}</span></div>
          {orderer.phone && <div className="kv"><span className="muted">טלפון</span><span style={{ fontWeight: 700 }}><a href={`tel:${orderer.phone}`}><Ltr>{orderer.phone}</Ltr></a></span></div>}
          {orderer.note && <div><span className="muted">דגשים: </span>{orderer.note}</div>}
        </div>
      ) : <p className="muted">לא הוגדר/ה מזמין/ת שירות.</p>}

      {family.length > 0 && <>
        <div className="card-label" style={{ margin: '14px 0 4px' }}>אנשי קשר במשפחה</div>
        <div className="stack" style={{ gap: 6 }}>{family.map((f: any, i: number) => (
          <div key={i} className="kv"><span><strong>{f.full_name}</strong>{f.relation ? ` · ${f.relation}` : ''}</span>{f.phone ? <a href={`tel:${f.phone}`}><Ltr>{f.phone}</Ltr></a> : <span>—</span>}</div>
        ))}</div>
      </>}

      {(c.mobility_notes || c.cognitive_notes || allergies.length > 0) && (
        <div className="alert-block stack" style={{ marginTop: 14, gap: 6 }}>
          <strong>מגבלות רפואיות ובטיחותיות</strong>
          {c.mobility_notes && <div><span className="muted">ניידות: </span>{c.mobility_notes}</div>}
          {c.cognitive_notes && <div><span className="muted">קוגניטיבי: </span>{c.cognitive_notes}</div>}
          {allergies.length > 0 && <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}><span className="muted">אלרגיות:</span>{allergies.map((a: any) => <Badge key={a.allergen} tone={a.severity === 'high' ? 'red' : 'orange'}>{a.allergen}</Badge>)}</div>}
        </div>
      )}

      {(data.hints ?? []).filter((h: any) => h.client_id === c.id).length > 0 && (
        <div className="alert-block stack" style={{ marginTop: 10, gap: 6 }}>
          <strong>דגשים מהמשפחה</strong>
          {(data.hints ?? []).filter((h: any) => h.client_id === c.id).slice(0, 6).map((h: any, i: number) => <div key={i}>{h.body}</div>)}
        </div>
      )}

      {notes.filter((n: any) => n.kind === 'highlight').map((n: any) => <div key={n.id} className="alert-block" style={{ marginTop: 10 }}>{n.body}</div>)}

      {prefs.length > 0 && <>
        <div className="card-label" style={{ margin: '14px 0 4px' }}>העדפות אישיות</div>
        <div className="stack" style={{ gap: 4 }}>{prefs.map((p: any, i: number) => (
          <div key={i}><span className="muted">{PREF_LABEL[p.category] ?? p.category}: </span><strong>{p.title}</strong>{p.details ? ` — ${p.details}` : ''}</div>
        ))}</div>
      </>}

      {notes.filter((n: any) => n.kind === 'note').length > 0 && <>
        <div className="card-label" style={{ margin: '14px 0 4px' }}>הערות</div>
        {notes.filter((n: any) => n.kind === 'note').map((n: any) => <div key={n.id} style={{ fontWeight: 600 }}>{n.body}</div>)}
      </>}

      {slots.length > 0 && <>
        <div className="card-label" style={{ margin: '14px 0 4px' }}>מה הלקוח/ה ביקש/ה (ביקורים קבועים)</div>
        {slots.map((s: any) => <div key={s.id} className="kv" style={{ fontSize: 14 }}><span style={{ fontWeight: 700 }}>{DAY_NAMES[s.weekday]} <Ltr>{hh(s.start_time)}{s.end_time ? `–${hh(s.end_time)}` : ''}</Ltr></span><span className="muted">{s.purpose || 'ביקור'}</span></div>)}
      </>}

      <div style={{ marginTop: 14 }}><Button variant="secondary" size="sm" onClick={onRequest}>הזמנת שירות חיצוני</Button></div>
    </Card>
  )
}
