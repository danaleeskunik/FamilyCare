import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, CardHead, Ltr, RowActions, StatCard } from '../../components/ui'
import { useStore } from '../../store/AppStore'
import { supabase } from '../../lib/supabase'
import { PLAN_RATES, usePrices } from '../../data/pricing'

type Row = Record<string, unknown>
const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`

/** Downloads the client list as a CSV (for importing into the invoicing software). The payer is the person who orders the service. */
async function exportClientsCsv(): Promise<number> {
  const { data, error } = await supabase.from('clients').select('full_name, phone, address, plan_id, status, regions(name), family_contacts(full_name, phone, is_orderer)').order('full_name')
  if (error) throw error
  const head = ['שם משלם (מזמין/ה)', 'שם לקוח/ה', 'ת.ז. / ח.פ.', 'אימייל', 'טלפון', 'כתובת', 'עיר / אזור', 'מסלול', 'דמי מנוי חודשי (₪)']
  const lines = [head.map(csvCell).join(',')]
  for (const r of (data ?? []) as unknown as Row[]) {
    if (r.status === 'ended') continue
    const o = ((r.family_contacts ?? []) as Row[]).find((f) => f.is_orderer)
    const plan = PLAN_RATES.find((p) => p.id === r.plan_id)
    const region = (Array.isArray(r.regions) ? (r.regions[0] as Row | undefined) : (r.regions as Row | null))?.name
    lines.push([o?.full_name ?? r.full_name, r.full_name, '', '', o?.phone ?? r.phone, r.address, region, plan?.name ?? '', plan?.fee ?? ''].map(csvCell).join(','))
  }
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'clients-for-invoicing.csv'
  a.click()
  URL.revokeObjectURL(a.href)
  return lines.length - 1
}

export default function Clients() {
  usePrices()
  const { clients, openForm, askDelete, notify } = useStore()
  const exportCsv = () => exportClientsCsv().then((n) => notify(`יוצאו ${n} לקוחות. ת.ז. ואימייל של המשלם צריך להשלים ידנית.`)).catch(() => notify('לא הצלחנו לייצא את הרשימה.'))
  const trial = clients.filter((c) => c.plan[1] === 'תקופת היכרות').length
  const usage = clients.map((c) => c.used.split('/').map((x) => parseFloat(x))).filter(([u, t]) => t > 0 && !Number.isNaN(u))
  const quota = usage.length ? Math.round((usage.reduce((a, [u, t]) => a + u / t, 0) / usage.length) * 100) : null
  const [q, setQ] = useState('')
  const rows = clients.filter((c) => [c.name, c.area, c.plan[1]].some((s) => s.includes(q.trim())))

  return (
    <>
      <div className="grid cols-3">
        <StatCard label="לקוחות פעילים" figure={clients.length} note="יעד שנתיים: 100 משפחות" />
        <StatCard label="בתקופת היכרות" figure={trial} note="חודש ראשון ללא התחייבות" />
        <StatCard label="ניצול מכסה ממוצע" figure={quota === null ? '—' : `${quota}%`} note="מהמפגשים שבמסלול נוצלו החודש" />
      </div>

      <Card flush>
        <CardHead title="כל הלקוחות">
          <input className="search" placeholder="חיפוש לפי שם, אזור או מסלול" aria-label="חיפוש לקוחות" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button size="sm" variant="secondary" onClick={exportCsv}>ייצוא CSV</Button>
          <Link className="btn secondary sm" to="/admin/questionnaire">מילוי שאלון</Link>
          <Button size="sm" icon="plus" onClick={() => openForm('client')}>לקוח/ה חדש/ה</Button>
        </CardHead>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>לקוח/ה</th><th>גיל</th><th>אזור</th><th>מסלול</th><th>מפגשים</th><th>מלווה קבוע/ה</th><th>מזמין/ת השירות</th><th>הביקור הבא</th><th><span className="sr-only">פעולות</span></th></tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="name"><Link to={`/admin/clients/${c.id}`}>{c.name}</Link></td>
                  <td className="num">{c.age}</td>
                  <td>{c.area}</td>
                  <td><Badge tone={c.plan[0]}>{c.plan[1]}</Badge></td>
                  <td><Ltr>{c.used}</Ltr></td>
                  <td>{c.companion ?? <span style={{ color: 'var(--danger)', fontWeight: 500 }}>אין מלווה קבועה</span>}</td>
                  <td>{c.orderer}</td>
                  <td>{c.next}</td>
                  <td><RowActions what={`הלקוח/ה ${c.name}`} onEdit={() => openForm('client', { id: c.id })} onDelete={() => askDelete('client', c.id)} /></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={9} className="muted">לא נמצאו לקוחות. אפשר לנסות שם אחר או להוסיף לקוח/ה חדש/ה.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
