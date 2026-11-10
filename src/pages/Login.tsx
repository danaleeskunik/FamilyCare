import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { TextField } from '../components/Fields'
import { useAuth } from '../store/AuthStore'
import { homeFor } from '../components/RequireRole'
import { hasHome } from '../lib/sections'

export default function Login() {
  const { session, role, sections, signIn, signOut, mfaPending, verifyMfa } = useAuth()
  const loc = useLocation()
  const from = (loc.state as { from?: string } | null)?.from ?? homeFor(role, sections)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [code, setCode] = useState('')

  if (session && hasHome(role)) return <Navigate to={from === '/login' ? homeFor(role, sections) : from} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) { setError('נא למלא אימייל וסיסמה'); return }
    setBusy(true)
    const err = await signIn(email, password)
    setBusy(false)
    if (err) setError(err)
    // success: the Navigate above takes over once the session (and, if needed, the second step) is done
  }
  const submitCode = async (e: FormEvent) => {
    e.preventDefault()
    if (code.replace(/\s/g, '').length !== 6) { setError('הקוד הוא 6 ספרות'); return }
    setBusy(true)
    const err = await verifyMfa(code)
    setBusy(false)
    setError(err)
    if (err) setCode('')
  }

  return (
    <main id="main" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: 'var(--brand-header)' }}>
      <Card size="lg" style={{ width: 'min(400px, 100%)' }}>
        <div className="row" style={{ justifyContent: 'center', marginBottom: 16, background: 'var(--brand-header)', borderRadius: 12, padding: 12 }}>
          <img src={`${import.meta.env.BASE_URL}brand/logo-white.png`} height={44} alt="Family Care — always with you" />
        </div>
        {mfaPending ? (
          <>
            <h1 style={{ font: '800 20px var(--font-ui)', marginBottom: 6 }}>אימות דו-שלבי</h1>
            <p className="muted" style={{ marginBottom: 14 }}>הזיני את הקוד בן 6 הספרות מאפליקציית האימות בטלפון.</p>
            <form onSubmit={submitCode} noValidate className="stack" style={{ gap: 14 }}>
              <TextField label="קוד אימות" inputMode="numeric" autoComplete="one-time-code" dir="ltr" maxLength={7} autoFocus value={code} onChange={(e) => setCode(e.target.value)} />
              {error && <div className="err" role="alert" style={{ color: 'var(--danger)', font: '600 13px var(--font-ui)' }}>{error}</div>}
              <Button type="submit" size="lg" disabled={busy}>{busy ? 'מאמתת…' : 'אימות'}</Button>
              <Button variant="quiet" onClick={() => { setError(null); setCode(''); void signOut() }}>חזרה</Button>
            </form>
          </>
        ) : (<>
        <h1 style={{ font: '800 20px var(--font-ui)', marginBottom: 14 }}>כניסה למערכת</h1>
        <form onSubmit={submit} noValidate className="stack" style={{ gap: 14 }}>
          <TextField label="אימייל" type="email" autoComplete="username" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="סיסמה" type="password" autoComplete="current-password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <div className="err" role="alert" style={{ color: 'var(--danger)', font: '600 13px var(--font-ui)' }}>{error}</div>}
          <Button type="submit" size="lg" disabled={busy}>{busy ? 'נכנסת…' : 'כניסה'}</Button>
        </form>
        </>)}
      </Card>
    </main>
  )
}
