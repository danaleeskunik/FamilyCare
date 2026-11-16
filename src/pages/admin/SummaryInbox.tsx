/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, CardHead } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { useStore } from '../../store/AppStore'
import { formatDM, parseISO } from '../../lib/dates'

const one = (v: any) => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null))

/** Visit reports waiting for the office: approve to send them to the family, or leave for later. */
export default function SummaryInbox() {
  const { notify } = useStore()
  const [rows, setRows] = useState<any[] | null>(null)
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('visit_summaries')
      .select('id, body, details, created_at, staff_members(full_name), tasks(scheduled_date, title, clients(full_name))')
      .eq('status', 'pending_approval').order('created_at')
    if (error) { console.warn('summaries unavailable', error); setRows([]); return }
    setRows(data ?? [])
  }, [])
  useEffect(() => { void load(); const t = window.setInterval(() => void load(), 60000); return () => window.clearInterval(t) }, [load])

  const approve = async (id: string) => {
    const { data: u } = await supabase.auth.getUser()
    const now = new Date().toISOString()
    const { error } = await supabase.from('visit_summaries').update({ status: 'sent', approved_by: u.user?.id ?? null, approved_at: now, sent_at: now }).eq('id', id)
    if (error) { console.error('approve failed', error); notify('לא הצלחנו לאשר. נסי שוב.'); return }
    notify('הסיכום נשלח למשפחה')
    await load()
  }
  if (!rows || rows.length === 0) return null
  return (
    <Card flush>
      <CardHead title="דיווחי ביקור לאישור"><span className="card-meta">{rows.length} ממתינים · אחרי האישור הם מופיעים אצל המשפחה</span></CardHead>
      <div className="stack" style={{ gap: 10, padding: '0 18px 18px' }}>
        {rows.map((r) => {
          const t = one(r.tasks), who = one(r.staff_members)?.full_name, d = r.details ?? {}
          return (
            <div key={r.id} className="item-box stack" style={{ gap: 6 }}>
              <div style={{ fontWeight: 800 }}>{one(t?.clients)?.full_name} · {t?.scheduled_date ? formatDM(parseISO(t.scheduled_date)) : ''} · {t?.title}</div>
              <div className="card-meta">דווח על ידי {who}</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{r.body}</div>
              {d.lessons && <div className="card-meta">לקחים (פנימי): {d.lessons}</div>}
              <div><Button size="sm" onClick={() => approve(r.id)}>אישור ושליחה למשפחה</Button></div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
