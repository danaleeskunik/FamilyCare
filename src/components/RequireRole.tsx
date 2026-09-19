import { Navigate, useLocation } from 'react-router-dom'
import { Button, Empty } from './ui'
import { useAuth, type Role } from '../store/AuthStore'

export const homeFor = (role: Role | null) => (role === 'admin' ? '/admin' : role === 'companion' ? '/companion' : '/login')

/** Signed-in, and with the right role. Anyone else is sent to their own home, or to the login. */
export default function RequireRole({ role: required, children }: { role: Role; children: React.ReactNode }) {
  const { session, role, loading, signOut } = useAuth()
  const loc = useLocation()

  if (loading) return <main className="container page-body"><p className="muted" role="status">טוענת…</p></main>
  if (!session) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (role === 'admin' || role === 'companion') {
    return role === required ? <>{children}</> : <Navigate to={homeFor(role)} replace />
  }
  return (
    <main className="container page-body">
      <Empty
        text={role === 'family' ? 'האזור למשפחות עוד לא זמין באפליקציה. נעדכן כשיהיה מוכן.' : 'החשבון הזה עדיין לא מוגדר. אפשר לפנות למי שמנהל/ת את המערכת, או להתחבר עם חשבון אחר.'}
        action={<Button size="sm" variant="secondary" onClick={signOut}>התנתקות</Button>}
      />
    </main>
  )
}

/** "/" : send people to the right place. */
export function HomeRedirect() {
  const { session, role, loading } = useAuth()
  if (loading) return <main className="container page-body"><p className="muted" role="status">טוענת…</p></main>
  return <Navigate to={session && (role === 'admin' || role === 'companion') ? homeFor(role) : '/login'} replace />
}
