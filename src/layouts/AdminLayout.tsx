import { Link, NavLink, Outlet } from 'react-router-dom'
import { Button, Callout, Icon } from '../components/ui'
import { useStore } from '../store/AppStore'
import { useAuth } from '../store/AuthStore'

const TABS = [
  { id: 'board', to: '/admin', label: 'לוח היום', end: true },
  { id: 'vendors', to: '/admin/vendors', label: 'ספקים ובעלי מקצוע' },
  { id: 'clients', to: '/admin/clients', label: 'לקוחות' },
  { id: 'staff', to: '/admin/staff', label: 'מלווים' },
  { id: 'schedule', to: '/admin/schedule', label: 'לו"ז מלווים' },
  { id: 'planning', to: '/admin/planning', label: 'לוח ניהול' },
  { id: 'leads', to: '/admin/leads', label: 'לידים' },
  { id: 'finance', to: '/admin/finance', label: 'כספים' },
  { id: 'materials', to: '/admin/materials', label: 'חומרים' },
  { id: 'team', to: '/admin/team', label: 'הרשאות' },
]

export function Header({ title, sub, actions, tabs, lead }: {
  title: string; sub: string; actions: React.ReactNode; tabs: React.ReactNode; lead?: React.ReactNode
}) {
  return (
    <header className="app-header">
      <div className="container inner">
        <div className="header-top">
          <div className="header-brand">
            <Link to="/admin" aria-label="Family Care — חזרה ללוח הראשי"><img src={`${import.meta.env.BASE_URL}brand/logo-white.png`} height={46} alt="Family Care — always with you" style={{ display: 'block' }} /></Link>
            {lead}
            <div className="header-text">
              <div className="header-title">{title}</div>
              {sub && <div className="header-sub">{sub}</div>}
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
  const { openForm, loading, loadError, reload } = useStore()
  const { fullName, signOut, can } = useAuth()
  return (
    <>
      <Header
        title={fullName ? `שלום ${fullName}` : 'שלום'}
        sub=""
        actions={
          <>
            <Link to="/" className="btn on-navy sm"><Icon name="home" size={16} />לאתר החברה</Link>
            {can('board') && <Link to="/admin/calendar" className="btn on-navy sm"><Icon name="calendar" size={16} />לוח שנה</Link>}
            {can('board') && <Button size="sm" icon="plus" onClick={() => openForm('task')}>משימה חדשה</Button>}
            <Button variant="on-navy" size="sm" onClick={signOut}>התנתקות</Button>
          </>
        }
        tabs={
          <nav className="tabs" aria-label="ניווט ראשי">
            {TABS.filter((t) => can(t.id)).map((t) => (
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
