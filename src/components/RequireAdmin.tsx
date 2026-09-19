import { Navigate, useLocation } from 'react-router-dom'
import { Button, Empty } from './ui'
import { useAuth } from '../store/AuthStore'

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { session, role, loading, signOut } = useAuth()
  const loc = useLocation()

  if (loading) return <main className="container page-body"><p className="muted" role="status">טוענת…</p></main>
  if (!session) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (role !== 'admin') {
    return (
      <main className="container page-body">
        <Empty
          text="החשבון הזה עדיין לא מוגדר כמנהל/ת. אפשר לפנות למי שמנהל/ת את המערכת, או להתחבר עם חשבון אחר."
          action={<Button size="sm" variant="secondary" onClick={signOut}>התנתקות</Button>}
        />
      </main>
    )
  }
  return <>{children}</>
}
