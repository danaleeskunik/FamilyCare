import { useCallback, useEffect, useState } from 'react'
import { Button, Callout, Card, CardHead, Empty, Ltr } from '../../components/ui'
import { TextField } from '../../components/Fields'
import { supabase } from '../../lib/supabase'
import { OFFICE_SECTIONS } from '../../lib/sections'

type Member = { id: string; name: string; email: string; sections: string[] }
type Row = { id: string; full_name: string; email: string | null; sections: string[] | null }

const needsSetup = (e: { code?: string; message?: string } | null) => !!e && (['42703', '42883', 'PGRST202', 'PGRST204', 'PGRST205', '42P01'].includes(e.code ?? '') || /does not exist|schema cache/i.test(e.message ?? ''))

export default function Team() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [setup, setSetup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.from('profiles').select('id, full_name, email, sections').eq('role', 'office').order('created_at')
    if (e) { if (needsSetup(e)) setSetup(true); else setError('לא הצלחנו לטעון את העובדים.') }
    else setMembers((data as Row[]).map((r) => ({ id: r.id, name: r.full_name, email: r.email ?? '', sections: r.sections ?? [] })))
    setLoading(false)
  }, [])
  useEffect(() => { void load() }, [load])

  const save = async (addr: string, nm: string, sections: string[]) => {
    setError(null)
    const { error: e } = await supabase.rpc('set_office_access', { p_email: addr, p_name: nm, p_sections: sections })
    if (e) {
      setError(/No user with that email/i.test(e.message) ? 'אין משתמש עם המייל הזה. קודם יוצרים אותו ב-Supabase תחת Authentication ← Users.'
        : /another role/i.test(e.message) ? 'למשתמש הזה כבר יש תפקיד אחר במערכת.' : 'לא הצלחנו לשמור את ההרשאות.')
      return false
    }
    await load()
    return true
  }

  const add = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setBusy(true)
    if (await save(email, name, ['leads'])) { setEmail(''); setName('') }
    setBusy(false)
  }

  const toggle = (m: Member, section: string) => {
    const next = m.sections.includes(section) ? m.sections.filter((s) => s !== section) : [...m.sections, section]
    void save(m.email, m.name, next)
  }

  const remove = async (id: string) => {
    setRemoving(null)
    const { error: e } = await supabase.rpc('remove_office_access', { p_id: id })
    if (e) setError('לא הצלחנו להסיר את הגישה.'); else await load()
  }

  if (setup) {
    return (
      <Callout tone="warning" title="צריך להקים את הרשאות העובדים">
        מריצים פעם אחת ב-SQL Editor של Supabase את הקובץ <Ltr>supabase/upgrade_0014_office_role.sql</Ltr>, ואז מרעננים את העמוד.
      </Callout>
    )
  }

  return (
    <>
      <Callout tone="info" title="איך מוסיפים עובד/ת">
        יוצרים קודם משתמש ב-Supabase (Authentication ← Users ← Add user, עם מייל וסיסמה), ואז כותבים כאן את אותו מייל. העובד/ת יראו רק את מה שסימנת להם, והחסימה נאכפת גם במסד הנתונים.
      </Callout>

      <Card flush>
        <CardHead title="הוספת עובד/ת משרד" />
        <form className="team-add" onSubmit={add}>
          <TextField label="שם" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="מייל של המשתמש" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" icon="plus" disabled={busy || !email.trim()}>הוספה עם גישה ללידים</Button>
        </form>
      </Card>

      {error && <Callout tone="warning" title="משהו לא הצליח">{error}</Callout>}

      <Card flush>
        <CardHead title="עובדי משרד והרשאות" />
        {loading ? <p className="muted" style={{ padding: 18 }} role="status">טוענת…</p>
          : members.length === 0 ? <div style={{ padding: 18 }}><Empty text="עוד אין עובדי משרד. אפשר להוסיף למעלה." /></div>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>עובד/ת</th><th>מייל</th><th>גישה ללשוניות</th><th><span className="sr-only">פעולות</span></th></tr></thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td className="name">{m.name || '—'}</td>
                      <td><Ltr>{m.email}</Ltr></td>
                      <td>
                        <div className="team-sections">
                          {OFFICE_SECTIONS.map((o) => (
                            <label key={o.id} className="check">
                              <input type="checkbox" checked={m.sections.includes(o.id)} onChange={() => toggle(m, o.id)} /> {o.label}
                            </label>
                          ))}
                        </div>
                      </td>
                      <td>
                        {removing === m.id
                          ? <span className="lead-confirm"><Button size="sm" variant="danger" onClick={() => void remove(m.id)}>הסרה</Button><Button size="sm" variant="quiet" onClick={() => setRemoving(null)}>ביטול</Button></span>
                          : <Button size="sm" variant="quiet" onClick={() => setRemoving(m.id)}>הסרת גישה</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </Card>
    </>
  )
}
