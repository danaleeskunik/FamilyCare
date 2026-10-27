import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Callout, Card } from '../../components/ui'
import { supabase } from '../../lib/supabase'

type Req = { id: string; client_id: string; category: string | null; description: string; preferred_date: string | null; created_at: string; clients: { full_name: string } | { full_name: string }[] | null }
type Unread = { client_id: string; clients: { full_name: string } | { full_name: string }[] | null }
const nameOf = (c: Req['clients']) => (Array.isArray(c) ? c[0]?.full_name : c?.full_name) ?? ''
const ago = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  return m < 60 ? `לפני ${m} דק׳` : m < 1440 ? `לפני ${Math.round(m / 60)} שע׳` : `לפני ${Math.round(m / 1440)} ימים`
}

/** New service requests and unread messages from client families: the "alert" for the office. Refreshes every minute. */
export default function PortalInbox() {
  const [reqs, setReqs] = useState<Req[] | null>(null)
  const [unread, setUnread] = useState<Unread[]>([])
  const [hidden, setHidden] = useState(false)

  const load = useCallback(async () => {
    const [r, m] = await Promise.all([
      supabase.from('service_requests').select('id, client_id, category, description, preferred_date, created_at, clients(full_name)').eq('status', 'new').order('created_at', { ascending: false }).limit(20),
      supabase.from('client_messages').select('client_id, clients(full_name)').eq('from_family', true).is('read_at', null).limit(200),
    ])
    if (r.error || m.error) { setHidden(true); return } // tables not created yet (migration 0018)
    setReqs(r.data as unknown as Req[]); setUnread(m.data as unknown as Unread[])
  }, [])
  useEffect(() => { void load(); const t = window.setInterval(() => void load(), 60000); return () => window.clearInterval(t) }, [load])

  const markDone = async (id: string, status: 'converted' | 'declined') => {
    const { error } = await supabase.from('service_requests').update({ status }).eq('id', id)
    if (error) console.error('request update failed', error)
    await load()
  }
  if (hidden) return null
  const byClient = new Map<string, { name: string; n: number }>()
  for (const u of unread) { const e = byClient.get(u.client_id) ?? { name: nameOf(u.clients as Req['clients']), n: 0 }; e.n++; byClient.set(u.client_id, e) }
  const total = (reqs?.length ?? 0) + unread.length
  if (reqs !== null && total === 0) return null

  return (
    <>
      {total > 0 && <Callout tone="warning" title="התראות מהאזור האישי של הלקוחות">{reqs?.length ?? 0} בקשות שירות חדשות ו-{unread.length} הודעות שלא נקראו.</Callout>}
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <Card>
          <div className="card-title" style={{ marginBottom: 8 }}>בקשות שירות חדשות <Badge tone="orange">{reqs?.length ?? 0}</Badge></div>
          {reqs?.length === 0 && <p className="muted">אין בקשות חדשות.</p>}
          {reqs?.map((r) => (
            <div key={r.id} className="kv" style={{ alignItems: 'flex-start', gap: 12 }}>
              <span>
                <Link to={`/admin/clients/${r.client_id}`} style={{ fontWeight: 700 }}>{nameOf(r.clients)}</Link>
                <span className="card-meta"> · {r.category ?? 'בקשה'} · {ago(r.created_at)}</span>
                <span style={{ display: 'block', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{r.description}</span>
                {r.preferred_date && <span className="card-meta">מועד מבוקש: {r.preferred_date.split('-').reverse().join('.')}</span>}
              </span>
              <span className="row" style={{ gap: 6, flex: 'none' }}>
                <button type="button" className="pill-action" onClick={() => void markDone(r.id, 'converted')}>טופל</button>
                <button type="button" className="pill-action" onClick={() => void markDone(r.id, 'declined')}>לא ניתן</button>
              </span>
            </div>
          ))}
        </Card>
        <Card>
          <div className="card-title" style={{ marginBottom: 8 }}>הודעות שלא נקראו <Badge tone="orange">{unread.length}</Badge></div>
          {byClient.size === 0 && <p className="muted">אין הודעות חדשות.</p>}
          {[...byClient.entries()].map(([id, e]) => (
            <div key={id} className="kv"><Link to={`/admin/clients/${id}`} style={{ fontWeight: 700 }}>{e.name}</Link><span className="num" style={{ fontWeight: 700 }}>{e.n}</span></div>
          ))}
        </Card>
      </div>
    </>
  )
}
