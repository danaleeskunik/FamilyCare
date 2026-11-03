/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type ReactNode } from 'react'
import { Badge, Button, Card, Empty, Icon, Ltr, RowActions } from '../components/ui'
import { SelectField, TextAreaField, TextField } from '../components/Fields'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/AppStore'
import { INTAKE } from '../data/intake'
import { JOB_TITLES } from '../data/model'
import { photoUrl } from '../lib/portal'
import { cleanAnswers, type Answers } from '../lib/intake'

/** Everything the profile editors below share: one place that saves, reports a failure and asks the file to reload. */
function useSave(onChanged: () => void) {
  const { notify } = useStore()
  return async (op: PromiseLike<{ error: unknown }>, failure: string) => {
    const { error } = await op
    if (error) { console.error(failure, error); notify(`${failure}. נסי שוב.`); return false }
    onChanged()
    return true
  }
}

const None = ({ text }: { text: string }) => <span className="muted" style={{ fontWeight: 500 }}>{text}</span>
const FIELD_LABEL: Record<string, string> = Object.fromEntries(INTAKE.flatMap((s) => s.fields.map((f) => [f.key, f.label])))
const shortLabel = (key: string) => (FIELD_LABEL[key] ?? key).split(/[(?:]/)[0].trim()

/** The intake questionnaire answers (public + admin-only), loaded once per client file. */
export function useIntake(clientId: string | undefined) {
  const [answers, setAnswers] = useState<Answers>({})
  useEffect(() => {
    if (!clientId) return
    let alive = true
    void (async () => {
      const [a, b] = await Promise.all([
        supabase.from('client_intake').select('answers').eq('client_id', clientId).maybeSingle(),
        supabase.from('client_intake_private').select('answers').eq('client_id', clientId).maybeSingle(),
      ])
      if (alive) setAnswers({ ...cleanAnswers(a.data?.answers), ...cleanAnswers(b.data?.answers) })
    })()
    return () => { alive = false }
  }, [clientId])
  return answers
}

/** Answers from the intake questionnaire, shown where they matter so nothing is typed twice. */
export function Hints({ keys, answers, title = 'מהשאלון' }: { keys: string[]; answers: Answers; title?: string }) {
  const rows = keys.filter((k) => answers[k])
  if (!rows.length) return null
  return (
    <div className="inset" style={{ marginTop: 10 }}>
      <div className="card-label" style={{ marginBottom: 6 }}>{title}</div>
      {rows.map((k) => (
        <div key={k} style={{ marginBottom: 8 }}>
          <div className="card-meta">{shortLabel(k)}</div>
          <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{answers[k]}</div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------- Preferences
const PREF_GROUPS = [
  ['food', 'אוכל ומעדניות', ['food', 'small_pleasures', 'b_shopping']],
  ['culture', 'תרבות ופנאי', ['hobbies', 'b_likes', 'b_wish', 'b_meets', 'parent_loves', 'b_return', 'friends']],
  ['routine', 'הרגלי יום־יום', ['b_typical_day', 'typical_week', 'b_joy', 'home_difficulties', 'b_days_hours', 'personality', 'nickname']],
  ['companion', 'העדפות למלווה', ['companion_profile', 'b_ask_first', 'dont_do', 'b_contact_pref', 'sensitive_topics']],
] as const

export function PreferencesEditor({ d, answers, onChanged }: { d: any; answers: Answers; onChanged: () => void }) {
  const save = useSave(onChanged)
  const [editing, setEditing] = useState<{ cat: string; id: string | null; title: string; details: string } | null>(null)
  const [err, setErr] = useState('')

  const commit = async () => {
    if (!editing) return
    if (!editing.title.trim()) { setErr('כתבי מה ההעדפה'); return }
    const row = { title: editing.title.trim(), details: editing.details.trim() || null }
    const ok = await save(editing.id
      ? supabase.from('client_preferences').update(row).eq('id', editing.id)
      : supabase.from('client_preferences').insert({ client_id: d.client.id, category: editing.cat, ...row }), 'לא הצלחנו לשמור את ההעדפה')
    if (ok) { setEditing(null); setErr('') }
  }

  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      {PREF_GROUPS.map(([cat, title, keys]) => {
        const items = d.preferences.filter((p: any) => p.category === cat)
        const open = editing?.cat === cat
        return (
          <Card key={cat}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="card-title">{title}</div>
              {!open && <Button variant="secondary" size="sm" icon="plus" onClick={() => { setErr(''); setEditing({ cat, id: null, title: '', details: '' }) }}>הוספה</Button>}
            </div>
            {items.length === 0 && !open && <None text="עוד לא הוזנו העדפות. אפשר להוסיף כאן, או למלא בשאלון." />}
            <div className="stack" style={{ gap: 8 }}>
              {items.map((p: any) => (
                <div key={p.id} className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{p.title}{p.details && <p className="card-meta" style={{ marginTop: 4, lineHeight: 1.5, fontWeight: 500 }}>{p.details}</p>}</div>
                  <RowActions what="ההעדפה" onEdit={() => { setErr(''); setEditing({ cat, id: p.id, title: p.title, details: p.details ?? '' }) }}
                    onDelete={() => void save(supabase.from('client_preferences').delete().eq('id', p.id), 'לא הצלחנו למחוק')} />
                </div>
              ))}
            </div>
            {open && editing && (
              <div className="inset stack" style={{ gap: 10, marginTop: 8 }}>
                <TextField label="ההעדפה" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} error={err} placeholder="למשל: קפה שחור בלי סוכר" />
                <TextAreaField label="פרטים (לא חובה)" value={editing.details} onChange={(v) => setEditing({ ...editing, details: v })} rows={2} />
                <div className="row" style={{ gap: 8 }}>
                  <Button size="sm" onClick={() => void commit()}>שמירה</Button>
                  <Button size="sm" variant="quiet" onClick={() => { setEditing(null); setErr('') }}>ביטול</Button>
                </div>
              </div>
            )}
            <Hints keys={[...keys]} answers={answers} />
          </Card>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------- Medical: medications and allergies
const SEVERITY = [{ value: 'low', label: 'קלה' }, { value: 'medium', label: 'בינונית' }, { value: 'high', label: 'חמורה' }]

export function MedicationsCard({ d, answers, onChanged }: { d: any; answers: Answers; onChanged: () => void }) {
  const save = useSave(onChanged)
  const blank = { id: null as string | null, name: '', dose: '', schedule: '', notes: '' }
  const [editing, setEditing] = useState<typeof blank | null>(null)
  const [err, setErr] = useState('')
  const commit = async () => {
    if (!editing) return
    if (!editing.name.trim()) { setErr('כתבי את שם התרופה'); return }
    const row = { name: editing.name.trim(), dose: editing.dose.trim() || null, schedule: editing.schedule.trim() || null, notes: editing.notes.trim() || null }
    const ok = await save(editing.id
      ? supabase.from('client_medications').update(row).eq('id', editing.id)
      : supabase.from('client_medications').insert({ client_id: d.client.id, ...row }), 'לא הצלחנו לשמור את התרופה')
    if (ok) { setEditing(null); setErr('') }
  }
  return (
    <Card>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="card-title">תרופות קבועות</div>
        {!editing && <Button variant="secondary" size="sm" icon="plus" onClick={() => { setErr(''); setEditing(blank) }}>הוספת תרופה</Button>}
      </div>
      {d.medications.length === 0 && !editing && <None text="עוד לא הוזנו תרופות." />}
      {d.medications.map((m: any) => (
        <div key={m.id} className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
          <div>
            <div style={{ fontWeight: 600 }}>{[m.name, m.dose].filter(Boolean).join(' ')}{m.schedule && <span className="muted" style={{ fontWeight: 500 }}> · {m.schedule}</span>}</div>
            {m.notes && <p className="card-meta" style={{ marginTop: 2 }}>{m.notes}</p>}
          </div>
          <RowActions what={`התרופה ${m.name}`} onEdit={() => { setErr(''); setEditing({ id: m.id, name: m.name, dose: m.dose ?? '', schedule: m.schedule ?? '', notes: m.notes ?? '' }) }}
            onDelete={() => void save(supabase.from('client_medications').delete().eq('id', m.id), 'לא הצלחנו למחוק')} />
        </div>
      ))}
      {editing && (
        <div className="inset stack" style={{ gap: 10, marginTop: 8 }}>
          <TextField label="שם התרופה" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} error={err} />
          <TextField label="מינון" value={editing.dose} onChange={(e) => setEditing({ ...editing, dose: e.target.value })} placeholder="למשל: 10 מ״ג" />
          <TextField label="מתי נוטלים" value={editing.schedule} onChange={(e) => setEditing({ ...editing, schedule: e.target.value })} placeholder="למשל: בוקר וערב" />
          <TextAreaField label="הערות (לא חובה)" value={editing.notes} onChange={(v) => setEditing({ ...editing, notes: v })} rows={2} />
          <div className="row" style={{ gap: 8 }}>
            <Button size="sm" onClick={() => void commit()}>שמירה</Button>
            <Button size="sm" variant="quiet" onClick={() => { setEditing(null); setErr('') }}>ביטול</Button>
          </div>
        </div>
      )}
      <Hints keys={['meds_manager', 'medical_envelope', 'doctors', 'appointments', 'private_insurance', 'health_fund', 'b_appointments', 'b_fav_doctor']} answers={answers} />
    </Card>
  )
}

export function AllergiesCard({ d, onChanged }: { d: any; onChanged: () => void }) {
  const save = useSave(onChanged)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [severity, setSeverity] = useState('medium')
  const [err, setErr] = useState('')
  const commit = async () => {
    const allergen = name.trim()
    if (!allergen) { setErr('כתבי למה יש רגישות'); return }
    if (d.allergies.some((a: any) => a.allergen === allergen)) { setErr('הרגישות הזו כבר מופיעה'); return }
    const ok = await save(supabase.from('client_allergies').insert({ client_id: d.client.id, allergen, severity }), 'לא הצלחנו לשמור את הרגישות')
    if (ok) { setAdding(false); setName(''); setSeverity('medium'); setErr('') }
  }
  return (
    <Card>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="card-title">רגישויות ואלרגיות</div>
        {!adding && <Button variant="secondary" size="sm" icon="plus" onClick={() => setAdding(true)}>הוספת רגישות</Button>}
      </div>
      {d.allergies.length === 0 ? <None text="לא דווחו רגישויות." /> : (
        <div className="row" style={{ gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          {d.allergies.map((x: any) => (
            <span key={x.id} className="row" style={{ gap: 2 }}>
              <Badge tone={x.severity === 'high' ? 'red' : 'orange'}>{x.allergen}</Badge>
              <button type="button" className="icon-btn danger" aria-label={`הסרת ${x.allergen}`} title="הסרה" onClick={() => void save(supabase.from('client_allergies').delete().eq('id', x.id), 'לא הצלחנו להסיר')}><Icon name="trash" size={15} /></button>
            </span>
          ))}
        </div>
      )}
      {adding && (
        <div className="inset stack" style={{ gap: 10, marginTop: 8 }}>
          <TextField label="רגישות או אלרגיה" value={name} onChange={(e) => setName(e.target.value)} error={err} placeholder="למשל: פניצילין" />
          <SelectField label="חומרה" value={severity} onChange={setSeverity} options={SEVERITY} />
          <div className="row" style={{ gap: 8 }}>
            <Button size="sm" onClick={() => void commit()}>שמירה</Button>
            <Button size="sm" variant="quiet" onClick={() => { setAdding(false); setErr('') }}>ביטול</Button>
          </div>
        </div>
      )}
      <p className="card-meta" style={{ lineHeight: 1.5, marginTop: 8 }}>מופיע אוטומטית בתדריך לכל מלווה ולכל ספק רפואי שמגיע לבית.</p>
    </Card>
  )
}

// ---------------------------------------------------------------- Contacts
const CONTACT_TYPES = [{ value: 'family', label: 'בן/בת משפחה או איש קשר' }, { value: 'physician', label: 'רופא/ה מטפל/ת' }]
const PERMISSIONS = [{ value: 'view_only', label: 'צפייה בלבד' }, { value: 'full', label: 'הרשאה מלאה' }]

export function ContactsEditor({ d, answers, onChanged, renderAccess }: { d: any; answers: Answers; onChanged: () => void; renderAccess: (c: any) => ReactNode }) {
  const save = useSave(onChanged)
  const { notify } = useStore()
  const blank = { id: null as string | null, type: 'family', name: '', relation: '', phone: '', permission: 'view_only', note: '', orderer: false }
  const [editing, setEditing] = useState<typeof blank | null>(null)
  const [err, setErr] = useState('')
  const commit = async () => {
    if (!editing) return
    if (!editing.name.trim()) { setErr('כתבי שם'); return }
    const row: Record<string, unknown> = {
      full_name: editing.name.trim(), relation: editing.relation.trim() || null, phone: editing.phone.trim() || null,
      note: editing.note.trim() || null, ...(editing.type === 'family' ? { permission: editing.permission } : {}),
    }
    const ok = await save(editing.id
      ? supabase.from('family_contacts').update(row).eq('id', editing.id)
      : supabase.from('family_contacts').insert({ client_id: d.client.id, contact_type: editing.type, ...row }), 'לא הצלחנו לשמור את איש הקשר')
    if (ok) { setEditing(null); setErr('') }
  }
  const remove = (c: any) => {
    if (c.is_orderer) { notify('אי אפשר למחוק את מזמין/ת השירות. אפשר לערוך את הפרטים שלו/ה.'); return }
    void save(supabase.from('family_contacts').delete().eq('id', c.id), 'לא הצלחנו למחוק')
  }
  return (
    <Card>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <div className="card-title">אנשי קשר</div>
        {!editing && <Button variant="secondary" size="sm" icon="plus" onClick={() => { setErr(''); setEditing(blank) }}>הוספה</Button>}
      </div>
      {d.contacts.length === 0 ? <Empty text="עוד לא הוזנו אנשי קשר." /> : (
        <div className="stack" style={{ gap: 12 }}>
          {d.contacts.map((p: any, i: number) => (
            <div key={p.id} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
              <span className="avatar" style={{ width: 34, height: 34, background: ['#E6F5F4', '#EEF2F7', '#FDEEE4'][i % 3], fontSize: 13 }}>{p.full_name[0]}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.full_name}</div>
                <div className="card-meta">
                  {p.contact_type === 'physician'
                    ? [p.relation ?? 'רופא/ה', p.note].filter(Boolean).join(' · ')
                    : [p.relation, p.is_orderer ? 'מזמין/ת השירות' : null, p.permission === 'full' ? 'הרשאה מלאה' : 'צפייה בלבד'].filter(Boolean).join(' · ')}
                </div>
                {p.phone && <div className="card-meta"><a href={`tel:${p.phone}`}><Ltr>{p.phone}</Ltr></a></div>}
              </div>
              <div style={{ marginInlineStart: 'auto' }} className="stack">
                {p.contact_type !== 'physician' && renderAccess(p)}
                <RowActions what={p.full_name} onEdit={() => { setErr(''); setEditing({ id: p.id, type: p.contact_type, name: p.full_name, relation: p.relation ?? '', phone: p.phone ?? '', permission: p.permission, note: p.note ?? '', orderer: p.is_orderer }) }} onDelete={() => remove(p)} />
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <div className="inset stack" style={{ gap: 10, marginTop: 10 }}>
          {!editing.id && <SelectField label="סוג" value={editing.type} onChange={(v) => setEditing({ ...editing, type: v })} options={CONTACT_TYPES} />}
          <TextField label="שם מלא" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} error={err} />
          <TextField label={editing.type === 'physician' ? 'התמחות' : 'קרבה'} value={editing.relation} onChange={(e) => setEditing({ ...editing, relation: e.target.value })} placeholder={editing.type === 'physician' ? 'למשל: רופא משפחה' : 'למשל: בת'} />
          <TextField label="טלפון" type="tel" dir="ltr" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
          {editing.type === 'family' && <SelectField label="הרשאה באזור האישי" value={editing.permission} onChange={(v) => setEditing({ ...editing, permission: v })} options={PERMISSIONS} />}
          <TextField label="הערה (לא חובה)" value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} placeholder={editing.type === 'physician' ? 'למשל: קליניקה ברעננה' : ''} />
          <div className="row" style={{ gap: 8 }}>
            <Button size="sm" onClick={() => void commit()}>שמירה</Button>
            <Button size="sm" variant="quiet" onClick={() => { setEditing(null); setErr('') }}>ביטול</Button>
          </div>
        </div>
      )}
      <Hints keys={['orderer_phone', 'orderer_email', 'emergency_contact', 'emergency_1_2', 'home_phone', 'key_holder', 'neighbors', 'home_floor', 'address_details', 'pets', 'home_help', 'emergency_service']} answers={answers} title="מהשאלון: פרטים נוספים" />
    </Card>
  )
}

// ---------------------------------------------------------------- Legal documents
const DOC_KINDS = [
  { value: 'power_of_attorney', label: 'ייפוי כוח' }, { value: 'medical_power_of_attorney', label: 'ייפוי כוח רפואי' },
  { value: 'advance_directive', label: 'הנחיות רפואיות מקדימות' }, { value: 'other', label: 'אחר' },
]

export function DocumentsCard({ d, onChanged }: { d: any; onChanged: () => void }) {
  const save = useSave(onChanged)
  const { notify } = useStore()
  const [adding, setAdding] = useState(false)
  const [kind, setKind] = useState('power_of_attorney')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const upload = async () => {
    if (!file) { setErr('בחרי קובץ'); return }
    if (file.size > 15_000_000) { setErr('הקובץ גדול מ-15MB'); return }
    setBusy(true)
    const key = `${d.client.id}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_')}`
    const up = await supabase.storage.from('client-documents').upload(key, file, { contentType: file.type || undefined })
    if (up.error) { console.error('document upload failed', up.error); setBusy(false); notify('לא הצלחנו להעלות את הקובץ. נסי שוב.'); return }
    const { data: u } = await supabase.auth.getUser()
    const ok = await save(supabase.from('client_documents').insert({
      client_id: d.client.id, kind, title: title.trim() || DOC_KINDS.find((k) => k.value === kind)!.label, storage_path: key, uploaded_by: u.user?.id ?? null,
    }), 'הקובץ הועלה אבל לא נשמר')
    setBusy(false)
    if (ok) { setAdding(false); setTitle(''); setFile(null); setErr('') }
  }
  const open = async (doc: any) => {
    const { data, error } = await supabase.storage.from('client-documents').createSignedUrl(doc.storage_path, 120)
    if (error || !data) { notify('לא הצלחנו לפתוח את המסמך'); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }
  const remove = async (doc: any) => {
    await supabase.storage.from('client-documents').remove([doc.storage_path])
    void save(supabase.from('client_documents').delete().eq('id', doc.id), 'לא הצלחנו למחוק')
  }
  return (
    <Card>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <div className="card-title">מסמכים משפטיים</div>
        <div className="row" style={{ gap: 8 }}>
          <Badge>מורשים בלבד</Badge>
          {!adding && <Button variant="secondary" size="sm" icon="plus" onClick={() => setAdding(true)}>העלאה</Button>}
        </div>
      </div>
      <div className="stack" style={{ gap: 8 }}>
        {d.documents.map((doc: any) => (
          <div key={doc.id} className="item-box row" style={{ gap: 8, padding: '9px 11px', fontSize: 13.5, justifyContent: 'space-between' }}>
            <button type="button" className="row" style={{ gap: 8, background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit', textAlign: 'start' }} onClick={() => void open(doc)}>
              <Icon name="document" size={17} />{doc.title}
            </button>
            <RowActions what={doc.title} onEdit={() => void open(doc)} onDelete={() => void remove(doc)} />
          </div>
        ))}
        {d.documents.length === 0 && !adding && <div className="dashed" style={{ padding: '9px 11px', fontSize: 13.5 }}>עוד לא הועלו מסמכים משפטיים.</div>}
      </div>
      {adding && (
        <div className="inset stack" style={{ gap: 10, marginTop: 10 }}>
          <SelectField label="סוג המסמך" value={kind} onChange={setKind} options={DOC_KINDS} />
          <TextField label="שם המסמך (לא חובה)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <label className="stack" style={{ gap: 6, fontSize: 13.5, fontWeight: 600 }}>הקובץ
            <input type="file" accept="application/pdf,image/*" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setErr('') }} />
          </label>
          {err && <div role="alert" style={{ color: 'var(--danger)', font: '600 12.5px var(--font-ui)' }}>{err}</div>}
          <div className="row" style={{ gap: 8 }}>
            <Button size="sm" disabled={busy} onClick={() => void upload()}>{busy ? 'מעלה…' : 'העלאה'}</Button>
            <Button size="sm" variant="quiet" onClick={() => { setAdding(false); setErr('') }}>ביטול</Button>
          </div>
        </div>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------- Regular companion
type Companion = { id: string; full_name: string; job_title: string; phone: string | null; languages: string[]; photo_path: string | null; is_active: boolean; regions: string[] }

/** Pin the client's regular companion from the staff list and see who they are. */
export function CompanionCard({ client }: { client: any }) {
  const { staff, assignCompanion, openForm, notify } = useStore()
  const [info, setInfo] = useState<Companion | null>(null)
  const [busy, setBusy] = useState(false)
  const pinned: string = client.regular_companion_id ?? ''

  useEffect(() => {
    if (!pinned) { setInfo(null); return }
    let alive = true
    void (async () => {
      const { data } = await supabase.from('staff_members').select('id, full_name, job_title, phone, languages, photo_path, is_active, staff_regions(regions(name))').eq('id', pinned).maybeSingle()
      if (!alive || !data) return
      const r = data as any
      setInfo({ ...r, regions: (r.staff_regions ?? []).map((x: any) => (Array.isArray(x.regions) ? x.regions[0] : x.regions)?.name).filter(Boolean) })
    })()
    return () => { alive = false }
  }, [pinned])

  const change = async (id: string) => {
    setBusy(true)
    const ok = await assignCompanion(client.id, id || null)
    setBusy(false)
    if (ok) notify(id ? 'המלווה/ת הוצמד/ה ללקוח/ה' : 'ההצמדה הוסרה')
  }
  const src = photoUrl(info?.photo_path ?? null)
  return (
    <Card>
      <div className="card-title" style={{ marginBottom: 10 }}>מלווה קבוע/ה</div>
      {info && (
        <div className="row" style={{ gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
          {src ? <img src={src} alt={info.full_name} width={52} height={52} style={{ borderRadius: '50%', objectFit: 'cover' }} />
            : <span className="avatar" style={{ width: 52, height: 52, background: '#E6F5F4', fontSize: 18 }}>{info.full_name[0]}</span>}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15.5 }}>{info.full_name}</div>
            <div className="card-meta">{JOB_TITLES.find((j) => j.value === info.job_title)?.label ?? info.job_title}{!info.is_active && ' · לא פעיל/ה'}</div>
            <div className="card-meta">
              טלפון: {info.phone ? <a href={`tel:${info.phone}`}><Ltr>{info.phone}</Ltr></a>
                : <button type="button" className="pt-link" style={{ font: 'inherit', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 0, padding: 0, color: 'var(--brand-link)' }} onClick={() => openForm('staff', { id: info.id })}>לא הוזן, להוספה</button>}
            </div>
            {info.regions.length > 0 && <div className="card-meta">אזורים: {info.regions.join(' · ')}</div>}
            {info.languages.length > 0 && <div className="card-meta">שפות: {info.languages.join(', ')}</div>}
          </div>
        </div>
      )}
      {!pinned && <p className="muted" style={{ marginBottom: 10 }}>עוד לא הוצמד/ה מלווה/ת. בחרי מהרשימה.</p>}
      <SelectField label={pinned ? 'החלפת מלווה/ת' : 'הצמדת מלווה/ת'} value={pinned} onChange={(v) => void change(v)} placeholder="ללא מלווה/ת קבוע/ה"
        options={staff.map((s) => ({ value: s.id, label: s.name }))} />
      {busy && <p className="card-meta" role="status" style={{ marginTop: 6 }}>שומרת…</p>}
    </Card>
  )
}

// ---------------------------------------------------------------- Service requests from the family
type Req = { id: string; category: string | null; description: string; preferred_date: string | null; status: 'new' | 'converted' | 'declined'; created_at: string }
const REQ_STATUS: Record<Req['status'], [string, 'orange' | 'green' | 'neutral']> = { new: ['ממתינה', 'orange'], converted: ['טופלה', 'green'], declined: ['לא ניתן', 'neutral'] }
const dm = (iso: string) => `${Number(iso.slice(8, 10))}.${Number(iso.slice(5, 7))}.${iso.slice(2, 4)}`

/** What the family asked for in the client portal ("tickets to the concert"): open until someone handles it, and kept as history after. */
export function ServiceRequestsCard({ clientId }: { clientId: string }) {
  const { openForm, notify } = useStore()
  const [reqs, setReqs] = useState<Req[] | null>(null)
  const load = async () => {
    const { data, error } = await supabase.from('service_requests').select('id, category, description, preferred_date, status, created_at').eq('client_id', clientId).order('created_at', { ascending: false })
    if (!error) setReqs(data as Req[])
  }
  useEffect(() => { void load() }, [clientId]) // eslint-disable-line react-hooks/exhaustive-deps
  const setStatus = async (id: string, status: Req['status']) => {
    const { error } = await supabase.from('service_requests').update({ status }).eq('id', id)
    if (error) { console.error('request update failed', error); notify('לא הצלחנו לעדכן. נסי שוב.'); return }
    void load()
  }
  if (reqs === null) return null
  const open = reqs.filter((r) => r.status === 'new')
  const closed = reqs.filter((r) => r.status !== 'new')
  const item = (r: Req) => (
    <div key={r.id} className="row" style={{ gap: 12, alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border-card)' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{r.description}</div>
        <div className="card-meta">{r.category ?? 'בקשה'} · נשלחה {dm(r.created_at.slice(0, 10))}{r.preferred_date ? ` · מועד מבוקש ${dm(r.preferred_date)}` : ''}</div>
      </div>
      <div className="row" style={{ gap: 6, flex: 'none', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {r.status === 'new' ? (
          <>
            <button type="button" className="pill-action" onClick={() => openForm('task', { clientId, task: r.description.slice(0, 80), ...(r.preferred_date ? { date: r.preferred_date } : {}) })}>יצירת משימה</button>
            <button type="button" className="pill-action" onClick={() => void setStatus(r.id, 'converted')}>טופל</button>
            <button type="button" className="pill-action" onClick={() => void setStatus(r.id, 'declined')}>לא ניתן</button>
          </>
        ) : (
          <>
            <Badge tone={REQ_STATUS[r.status][1]}>{REQ_STATUS[r.status][0]}</Badge>
            <button type="button" className="pill-action" onClick={() => void setStatus(r.id, 'new')}>החזרה לפתוח</button>
          </>
        )}
      </div>
    </div>
  )
  return (
    <Card>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
        <div className="card-title">בקשות שירות מהמשפחה</div>
        <Badge tone={open.length ? 'orange' : 'neutral'}>{open.length} פתוחות</Badge>
      </div>
      {reqs.length === 0 && <p className="muted">עוד לא התקבלו בקשות מהאזור האישי של המשפחה.</p>}
      {open.map(item)}
      {closed.length > 0 && <div className="card-label" style={{ marginTop: 12 }}>הסתיימו</div>}
      {closed.map(item)}
    </Card>
  )
}
