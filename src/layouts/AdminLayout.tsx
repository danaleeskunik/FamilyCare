import { Link, NavLink, Outlet } from 'react-router-dom'
import { Button, Callout, Icon } from '../components/ui'
import { useStore } from '../store/AppStore'
import { useAuth } from '../store/AuthStore'

const TABS = [
  { to: '/admin', label: 'לוח היום', end: true },
  { to: '/admin/vendors', label: 'ספקים ובעלי מקצוע' },
  { to: '/admin/clients', label: 'לקוחות' },
  { to: '/admin/staff', label: 'מלווים' },
  { to: '/admin/finance', label: 'כספים' },
]

export function Header({ title, sub, actions, tabs, lead }: {
  title: string; sub: string; actions: React.ReactNode; tabs: React.ReactNode; lead?: React.ReactNode
}) {
  return (
    <header className="app-header">
      <div className="container inner">
        <div className="header-top">
          <div className="row" style={{ gap: 13 }}>
            <img src={`${import.meta.env.BASE_URL}brand/logo-white.png`} height={46} alt="Family Care — always with you" />
            {lead}
            <div>
              <div className="header-title">{title}</div>
              <div className="header-sub">{sub}</div>
            </div>
          </div>
          <div className="row" style={{ gap: 9, flexWrap: 'wrap' }}>{actions}</div>
        </div>
        {tabs}
      </div>
    </header>
  )
}

export default function AdminLayout() {
  const { openForm, clients, loading, loadError, reload } = useStore()
  const { fullName, signOut } = useAuth()
  return (
    <>
      <Header
        title={`${fullName ? `שלום ${fullName}` : 'שלום'} — מוקד התפעול`}
        sub={`שלישי 15.9 · ${9 + clients.length} לקוחות פעילים · 6 מלווים במשמרת`}
        actions={
          <>
            <Link to="/admin/calendar" className="btn on-navy sm"><Icon name="calendar" size={16} />לוח שנה</Link>
            <Button size="sm" icon="plus" onClick={() => openForm('task')}>משימה חדשה</Button>
            <Button variant="on-navy" size="sm" onClick={signOut}>התנתקות</Button>
          </>
        }
        tabs={
          <nav className="tabs" aria-label="ניווט ראשי">
            {TABS.map((t) => (
              <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
                {t.label}
              </NavLink>
            ))}
          </nav>
        }
      />
      <main className="container page-body stack">
        {loadError ? (
          <Callout tone="warning" title="לא הצלחנו לטעון את הנתונים">
            בדקי את החיבור לאינטרנט ונסי שוב. <Button variant="secondary" size="sm" onClick={reload}>ניסיון חוזר</Button>
          </Callout>
        ) : loading ? (
          <p className="muted" role="status">טוענת נתונים…</p>
        ) : (
          <Outlet />
        )}
      </main>
    </>
  )
}
