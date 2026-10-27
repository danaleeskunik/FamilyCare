import { useState } from 'react'
import Modal from './Modal'
import { Badge, Button, Callout } from './ui'
import { TextField } from './Fields'
import { supabase } from '../lib/supabase'

type Contact = { id: string; full_name: string; profile_id: string | null }

/** Gives a family contact a login to the client portal (the user is created first in Supabase Authentication), or removes it. */
export default function PortalAccess({ contact, onChanged }: { contact: Contact; onChanged: () => void }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const linked = !!contact.profile_id

  const save = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError('כתובת מייל לא תקינה'); return }
    setBusy(true); setError(null)
    const { error: e } = await supabase.rpc('set_family_access', { p_email: email.trim(), p_name: contact.full_name, p_contact_id: contact.id })
    setBusy(false)
    if (e) {
      console.error('set_family_access failed', e)
      setError(/No user/i.test(e.message) ? 'אין משתמש עם המייל הזה. קודם יוצרים אותו ב-Supabase ← Authentication ← Add user.'
        : /another role/i.test(e.message) ? 'למשתמש הזה כבר יש תפקיד אחר במערכת.'
          : /function|schema cache/i.test(e.message) ? 'צריך להריץ פעם אחת את upgrade_0018 ב-Supabase.' : 'לא הצלחנו לשמור.')
      return
    }
    setOpen(false); setEmail(''); onChanged()
  }
  const remove = async () => {
    if (!window.confirm(`לבטל את הגישה של ${contact.full_name} לאזור האישי?`)) return
    const { error: e } = await supabase.rpc('remove_family_access', { p_contact_id: contact.id })
    if (e) { console.error('remove_family_access failed', e); window.alert('לא הצלחנו לבטל את הגישה.'); return }
    onChanged()
  }

  return (
    <>
      {linked
        ? <span className="row" style={{ gap: 6 }}><Badge tone="green">יש גישה</Badge><button type="button" className="pill-action" onClick={() => void remove()}>ביטול</button></span>
        : <button type="button" className="pill-action" onClick={() => setOpen(true)}>גישה לאזור האישי</button>}
      {open && (
        <Modal
          title={`גישה לאזור האישי · ${contact.full_name}`}
          onClose={() => setOpen(false)}
          footer={<><Button disabled={busy} onClick={() => void save()}>{busy ? 'שומרת…' : 'חיבור'}</Button><Button variant="quiet" onClick={() => setOpen(false)}>ביטול</Button></>}
        >
          <div className="stack" style={{ gap: 12 }}>
            <p className="muted" style={{ lineHeight: 1.6 }}>האדם הזה יראה את הפגישות, ההזמנות, התשלומים וההודעות של הלקוח/ה, ויוכל להזמין שירות. קודם יוצרים לו משתמש ב-Supabase ← Authentication ← Add user (מייל וסיסמה), ואז מזינים כאן את אותו מייל.</p>
            <TextField label="מייל להתחברות" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <Callout tone="warning" title="משהו לא הצליח">{error}</Callout>}
          </div>
        </Modal>
      )}
    </>
  )
}
