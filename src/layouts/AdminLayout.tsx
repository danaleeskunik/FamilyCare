import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '../components/ui'

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
  return (
    <>
      <Header
        title="שלום אלון — מוקד התפעול"
        sub="שלישי 15.9 · 14 לקוחות פעילים · 6 מלווים במשמרת"
        actions={
          <>
            <Button variant="on-navy" size="sm" icon="calendar">לוח שבועי</Button>
            <Button size="sm" icon="plus">משימה חדשה</Button>
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
        <Outlet />
      </main>
    </>
  )
}
