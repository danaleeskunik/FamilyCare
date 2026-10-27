import { Navigate, useLocation } from 'react-router-dom'
import { Button, Empty } from './ui'
import { useAuth, type Role } from '../store/AuthStore'

import { homeFor, hasHome } from '../lib/sections'
export { homeFor }

/** Signed-in, and with the right role. Anyone else is sent to their own home, or to the login. */
export default function RequireRole({ role: required, children }: { role: Role; children: React.ReactNode }) {
  const { session, role, loading, signOut } = useAuth()
  const loc = useLocation()

  if (loading) return <main className="container page-body"><p className="muted" role="status">טוענת…</p></main>
  if (!session) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (role === 'admin' || role === 'companion' || role === 'office' || role === 'family') {
    return role === required ? <>{children}</> : <Navigate to={homeFor(role)} replace />
  }
  return (
    <main className="container page-body">
      <Empty
        text="החשבון הזה עדיין לא מוגדר. אפשר לפנות למי שמנהל/ת את המערכת, או להתחבר עם חשבון אחר."
        action={<Button size="sm" variant="secondary" onClick={signOut}>התנתקות</Button>}
      />
    </main>
  )
}

/** "/" : send people to the right place. */
export function HomeRedirect() {
  const { session, role, sections, loading } = useAuth()
  if (loading) return <main className="container page-body"><p className="muted" role="status">טוענת…</p></main>
  return <Navigate to={session && hasHome(role) ? homeFor(role, sections) : '/login'} replace />
}

/** Admin app pages: admins always, office staff only for the sections they were given. */
export function RequireSection({ section, children }: { section: string; children: React.ReactNode }) {
  const { session, role, sections, loading, can, signOut } = useAuth()
  const loc = useLocation()
  if (loading) return <main className="container page-body"><p className="muted" role="status">טוענת…</p></main>
  if (!session) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (can(section)) return <>{children}</>
  const home = homeFor(role, sections)
  if (role === 'office' && home === '/login') {
    return (
      <main className="container page-body">
        <Empty text="עוד לא הוגדרו לחשבון הזה הרשאות. אפשר לפנות למי שמנהל/ת את המערכת." action={<Button size="sm" variant="secondary" onClick={signOut}>התנתקות</Button>} />
      </main>
    )
  }
  return <Navigate to={home} replace />
}
