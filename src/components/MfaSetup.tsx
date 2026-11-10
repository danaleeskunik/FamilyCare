import { useEffect, useState } from 'react'
import Modal from './Modal'
import { Button, Callout } from './ui'
import { TextField } from './Fields'
import { supabase } from '../lib/supabase'

type Enroll = { id: string; qr: string; secret: string }

/** Turn two-step verification (authenticator app) on or off for the signed-in user. */
export default function MfaSetup({ onClose }: { onClose: () => void }) {
  const [factorId, setFactorId] = useState<string | null | undefined>(undefined) // undefined = loading, null = off
  const [enroll, setEnroll] = useState<Enroll | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    const { data, error: e } = await supabase.auth.mfa.listFactors()
    if (e) { setError('לא הצלחנו לטעון. נסי שוב.'); setFactorId(null); return }
    setFactorId(data.totp.find((f) => f.status === 'verified')?.id ?? null)
  }
  useEffect(() => { void load() }, [])

  const start = async () => {
    setBusy(true); setError(null)
    // Clear a half-finished attempt from earlier, otherwise Supabase refuses a second enrollment.
    const { data: f } = await supabase.auth.mfa.listFactors()
    for (const x of f?.all ?? []) if (x.factor_type === 'totp' && x.status === 'unverified') await supabase.auth.mfa.unenroll({ factorId: x.id })
    const { data, error: e } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Family Care ${Date.now()}` })
    setBusy(false)
    if (e || !data) { console.error('mfa enroll failed', e); setError('לא הצלחנו להפעיל. ייתכן שאימות דו-שלבי לא מופעל בהגדרות Supabase.'); return }
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret })
  }

  const confirm = async () => {
    if (!enroll) return
    if (code.replace(/\s/g, '').length !== 6) { setError('הקוד הוא 6 ספרות'); return }
    setBusy(true); setError(null)
    const { error: e } = await supabase.auth.mfa.challengeAndVerify({ factorId: enroll.id, code: code.replace(/\s/g, '') })
    setBusy(false)
    if (e) { setError('הקוד שגוי או שפג תוקפו. נסי עם הקוד החדש.'); setCode(''); return }
    setEnroll(null); setCode(''); void load()
  }

  const cancelEnroll = async () => {
    if (enroll) await supabase.auth.mfa.unenroll({ factorId: enroll.id })
    setEnroll(null); setCode(''); setError(null)
  }

  const turnOff = async () => {
    if (!factorId || !window.confirm('לכבות את האימות הדו-שלבי? הכניסה תחזור להיות בסיסמה בלבד.')) return
    setBusy(true); setError(null)
    const { error: e } = await supabase.auth.mfa.unenroll({ factorId })
    setBusy(false)
    if (e) { setError('לא הצלחנו לכבות. התנתקי, היכנסי מחדש עם קוד ונסי שוב.'); return }
    void load()
  }

  return (
    <Modal title="אימות דו-שלבי" onClose={onClose} footer={<Button variant="secondary" onClick={onClose}>סגירה</Button>}>
      {factorId === undefined && <p className="muted" role="status">טוענת…</p>}
      {factorId && !enroll && (
        <div className="stack" style={{ gap: 12 }}>
          <Callout tone="tip" title="האימות הדו-שלבי פעיל">בכל כניסה תתבקשי להזין קוד מאפליקציית האימות בטלפון.</Callout>
          <div><Button variant="secondary" disabled={busy} onClick={() => void turnOff()}>כיבוי</Button></div>
        </div>
      )}
      {factorId === null && !enroll && (
        <div className="stack" style={{ gap: 12 }}>
          <p>מוסיף שלב שני לכניסה: אחרי הסיסמה צריך גם קוד בן 6 ספרות מהטלפון. כך גם אם הסיסמה נחשפת, אי אפשר להיכנס בלעדיו.</p>
          <p className="muted">צריך אפליקציית אימות בטלפון, למשל Google Authenticator או Microsoft Authenticator.</p>
          <div><Button disabled={busy} onClick={() => void start()}>{busy ? 'מכין…' : 'הפעלה'}</Button></div>
        </div>
      )}
      {enroll && (
        <div className="stack" style={{ gap: 12 }}>
          <p><strong>1.</strong> באפליקציית האימות בחרי "הוספת חשבון" וסרקי את הקוד:</p>
          <img src={enroll.qr} alt="קוד QR להוספה לאפליקציית האימות" width={180} height={180} style={{ alignSelf: 'center', background: '#fff', padding: 8, borderRadius: 12 }} />
          <details><summary>אי אפשר לסרוק? הקלדה ידנית</summary><code dir="ltr" style={{ wordBreak: 'break-all' }}>{enroll.secret}</code></details>
          <p><strong>2.</strong> הזיני את הקוד שמוצג באפליקציה:</p>
          <TextField label="קוד אימות" inputMode="numeric" autoComplete="one-time-code" dir="ltr" maxLength={7} value={code} onChange={(e) => setCode(e.target.value)} />
          <div className="row" style={{ gap: 8 }}>
            <Button disabled={busy} onClick={() => void confirm()}>{busy ? 'מאמתת…' : 'אישור והפעלה'}</Button>
            <Button variant="quiet" onClick={() => void cancelEnroll()}>ביטול</Button>
          </div>
        </div>
      )}
      {error && <div className="err" role="alert" style={{ color: 'var(--danger)', font: '600 13px var(--font-ui)', marginTop: 10 }}>{error}</div>}
    </Modal>
  )
}
