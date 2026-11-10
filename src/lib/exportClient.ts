import { supabase } from './supabase'
import { INTAKE } from '../data/intake'

type Row = Record<string, unknown>
const INTAKE_LABEL = new Map(INTAKE.flatMap((sec) => sec.fields.map((f) => [f.key, f.label] as const)))

/** Plain-language labels for the columns a client would recognise. Anything not listed (ids, internal flags) is left out. */
const COLS: Record<string, string> = {
  full_name: 'שם', birth_date: 'תאריך לידה', gender: 'מגדר', address: 'כתובת', phone: 'טלפון', email: 'דוא"ל', building_code: 'קוד בניין',
  mobility_notes: 'ניידות', cognitive_notes: 'מצב קוגניטיבי', member_since: 'חבר/ה מאז', trial_ends_on: 'סוף תקופת היכרות',
  relation: 'קרבה', contact_type: 'סוג איש קשר', permission: 'הרשאה', note: 'הערה', body: 'תוכן', title: 'כותרת', details: 'פרטים', category: 'קטגוריה',
  name: 'שם', dose: 'מינון', schedule: 'מתי', kind: 'סוג', substance: 'חומר', reaction: 'תגובה', severity: 'חומרה',
  scheduled_date: 'תאריך', start_time: 'שעה', status: 'סטטוס', location: 'מקום', period_month: 'חודש', total: 'סכום', uploaded_at: 'הועלה בתאריך',
  weekday: 'יום בשבוע', start: 'התחלה', answers: 'תשובות', created_at: 'נוצר',
}

const e = (v: unknown) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
const show = (v: unknown): string => {
  if (v == null || v === '') return ''
  if (typeof v === 'object') return Object.entries(v as Row).filter(([, x]) => x != null && String(x).trim() !== '').map(([k, x]) => `${k}: ${String(x)}`).join('\n')
  return String(v)
}

function table(rows: Row[]): string {
  if (!rows.length) return '<p class="none">אין מידע.</p>'
  return rows.map((r) => {
    const items = Object.entries(r).filter(([k, v]) => COLS[k] && show(v)).map(([k, v]) => `<tr><th>${e(COLS[k])}</th><td>${e(show(v)).replace(/\n/g, '<br>')}</td></tr>`).join('')
    return items ? `<table>${items}</table>` : ''
  }).join('')
}

/** Everything the system holds about one client, as a readable page, for a data-access request. Only the requesting admin sees it; send it securely. */
export async function exportClientHtml(clientId: string): Promise<{ html: string; name: string }> {
  const one = async (t: string, col = 'client_id'): Promise<Row[]> => {
    const r = await supabase.from(t).select('*').eq(col, clientId)
    return r.error ? [] : ((r.data ?? []) as Row[])
  }
  const [client, contacts, meds, allergies, prefs, notes, docs, slots, tasks, invoices, intake, intakePriv] = await Promise.all([
    one('clients', 'id'), one('family_contacts'), one('client_medications'), one('client_allergies'), one('client_preferences'),
    one('client_notes'), one('client_documents'), one('client_visit_slots'), one('tasks'), one('invoices'), one('client_intake'), one('client_intake_private'),
  ])
  const name = (client[0]?.full_name as string) ?? 'לקוח'
  const answers = [...intake, ...intakePriv].flatMap((r) => Object.entries((r.answers ?? {}) as Record<string, string>)).map(([k, v]) => `<tr><th>${e(INTAKE_LABEL.get(k) ?? k)}</th><td>${e(v)}</td></tr>`).join('')
  const sec = (title: string, body: string) => `<h2>${e(title)}</h2>${body}`
  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>המידע שנשמר על ${e(name)}</title>
<style>body{font:16px/1.6 Arial,sans-serif;max-width:800px;margin:24px auto;padding:0 16px;color:#1b2b34}h1{font-size:24px}h2{margin-top:28px;border-bottom:2px solid #d5e3e0;padding-bottom:4px;font-size:19px}table{width:100%;border-collapse:collapse;margin:10px 0 16px}th{width:32%;text-align:start;vertical-align:top;color:#4a5b64;font-weight:600;padding:4px 8px}td{padding:4px 8px}tr+tr th,tr+tr td{border-top:1px solid #eef2f1}.none{color:#6b7a82}.meta{color:#6b7a82;font-size:14px}</style></head><body>
<h1>המידע שנשמר על ${e(name)}</h1>
<p class="meta">הופק ב-${new Date().toLocaleDateString('he-IL')} ממערכת Family Care. המסמך כולל מידע אישי ורגיש: יש לשלוח אותו רק בערוץ מאובטח ורק למי שזכאי לקבל אותו.</p>
${sec('פרטים אישיים', table(client))}
${sec('אנשי קשר', table(contacts))}
${sec('תרופות', table(meds))}
${sec('אלרגיות', table(allergies))}
${sec('העדפות', table(prefs))}
${sec('הערות בתיק', table(notes))}
${sec('מסמכים שהועלו (שמות בלבד)', table(docs.map((d) => ({ title: d.title, uploaded_at: d.uploaded_at }))))}
${sec('מפגשים קבועים', table(slots))}
${sec('ביקורים ושירותים', table(tasks))}
${sec('חשבוניות', table(invoices))}
${sec('שאלון ההיכרות', answers ? `<table>${answers}</table>` : '<p class="none">אין מידע.</p>')}
</body></html>`
  return { html, name }
}

export function downloadHtml(html: string, name: string) {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url; a.download = `מידע-על-${name}.html`; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Writes one line to the access log. Silent if the log table does not exist yet. */
export async function logAccess(clientId: string, action: 'view' | 'export') {
  await supabase.from('access_log').insert({ client_id: clientId, action })
}
