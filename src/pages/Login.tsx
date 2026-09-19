import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { TextField } from '../components/Fields'
import { useAuth } from '../store/AuthStore'
import { homeFor } from '../components/RequireRole'

export default function Login() {
  const { session, role, signIn } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const from = (loc.state as { from?: string } | null)?.from ?? homeFor(role)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session && (role === 'admin' || role === 'companion')) return <Navigate to={homeFor(role)} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) { setError('נא למלא אימייל וסיסמה'); return }
    setBusy(true)
    const err = await signIn(email, password)
    setBusy(false)
    if (err) setError(err)
    else nav(from === '/login' ? '/' : from, { replace: true })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: 'var(--brand-header)' }}>
      <Card size="lg" style={{ width: 'min(400px, 100%)' }}>
        <div className="row" style={{ justifyContent: 'center', marginBottom: 16, background: 'var(--brand-header)', borderRadius: 12, padding: 12 }}>
          <img src={`${import.meta.env.BASE_URL}brand/logo-white.png`} height={44} alt="Family Care — always with you" />
        </div>
        <h1 style={{ font: '800 20px var(--font-ui)', marginBottom: 14 }}>כניסה למערכת</h1>
        <form onSubmit={submit} noValidate className="stack" style={{ gap: 14 }}>
          <TextField label="אימייל" type="email" autoComplete="username" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="סיסמה" type="password" autoComplete="current-password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <div className="err" role="alert" style={{ color: 'var(--danger)', font: '600 13px var(--font-ui)' }}>{error}</div>}
          <Button type="submit" size="lg" disabled={busy}>{busy ? 'נכנסת…' : 'כניסה'}</Button>
        </form>
      </Card>
    </div>
  )
}
