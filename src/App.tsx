import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './store/AuthStore'
import { homeFor } from './lib/sections'
import { toISO } from './lib/dates'
import { TODAY } from './data/model'
import AdminLayout from './layouts/AdminLayout'
import Board from './pages/admin/Board'
import Vendors from './pages/admin/Vendors'
import Clients from './pages/admin/Clients'
import Staff from './pages/admin/Staff'
import { InterviewForm } from './pages/admin/Interviews'
import Finance from './pages/admin/Finance'
import ClientFile from './pages/ClientFile'
import CompanionApp from './pages/CompanionApp'
import ClientApp from './pages/ClientApp'
import Calendar from './pages/admin/Calendar'
import FormHost, { DeleteHost, Toast } from './components/EntityForms'
import RequireRole, { HomeRedirect, RequireSection } from './components/RequireRole'
import Schedule from './pages/admin/Schedule'
import Planning from './pages/admin/Planning'
import StaffReport from './pages/admin/StaffReport'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Policy from './pages/Policy'
import Accessibility from './pages/Accessibility'
import Leads from './pages/admin/Leads'
import Team from './pages/admin/Team'
import Materials from './pages/admin/Materials'
import Questionnaire from './pages/admin/Questionnaire'
import VendorFile from './pages/admin/VendorFile'
import Todos from './pages/admin/Todos'
import ClientPreview from './pages/ClientPreview'
import CompanionPreview from './pages/CompanionPreview'
import AnalyticsConsent from './components/AnalyticsConsent'

/** The admin shell is for admins and office staff; each page then checks its own section. */
function RequireAnyStaff({ children }: { children: React.ReactNode }) {
  const { session, role, loading } = useAuth()
  if (loading) return <main className="container page-body"><p className="muted" role="status">טוענת…</p></main>
  if (!session) return <Navigate to="/login" replace />
  if (role !== 'admin' && role !== 'office') return <Navigate to={homeFor(role)} replace />
  return <>{children}</>
}

// Role resolution (admin / companion / client) will come from auth; until then each surface has its own route.
/** A new page opens at its top; links with a #anchor keep scrolling to the anchor. */
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => { if (!hash) window.scrollTo(0, 0) }, [pathname, hash])
  return null
}

/** A tab left open overnight still thinks it is yesterday: when the date changes, reload so "today" is right. */
function useReloadOnNewDay() {
  useEffect(() => {
    const check = () => { if (toISO(new Date()) !== TODAY) location.reload() }
    const timer = setInterval(check, 60_000)
    document.addEventListener('visibilitychange', check)
    window.addEventListener('focus', check)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', check); window.removeEventListener('focus', check) }
  }, [])
}

export default function App() {
  useReloadOnNewDay()
  return (
    <>
    <ScrollToTop />
    <AnalyticsConsent />
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/policy" element={<Policy />} />
      <Route path="/accessibility" element={<Accessibility />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<RequireAnyStaff><AdminLayout /></RequireAnyStaff>}>
        <Route index element={<RequireSection section="board"><Board /></RequireSection>} />
        <Route path="vendors" element={<RequireSection section="vendors"><Vendors /></RequireSection>} />
        <Route path="vendors/:id" element={<RequireSection section="vendors"><VendorFile /></RequireSection>} />
        <Route path="clients" element={<RequireSection section="clients"><Clients /></RequireSection>} />
        <Route path="questionnaire" element={<RequireSection section="clients"><Questionnaire /></RequireSection>} />
        <Route path="staff" element={<RequireSection section="staff"><Staff /></RequireSection>} />
        <Route path="staff/:id/interview" element={<RequireSection section="staff"><InterviewForm /></RequireSection>} />
        <Route path="staff/:id" element={<RequireSection section="staff"><StaffReport /></RequireSection>} />
        <Route path="schedule" element={<RequireSection section="schedule"><Schedule /></RequireSection>} />
        <Route path="planning" element={<RequireSection section="planning"><Planning /></RequireSection>} />
        <Route path="leads" element={<RequireSection section="leads"><Leads /></RequireSection>} />
        <Route path="finance" element={<RequireSection section="finance"><Finance /></RequireSection>} />
        <Route path="calendar" element={<RequireSection section="board"><Calendar /></RequireSection>} />
        <Route path="materials" element={<RequireSection section="materials"><Materials /></RequireSection>} />
        <Route path="todos" element={<RequireSection section="todos"><Todos /></RequireSection>} />
        <Route path="team" element={<RequireSection section="team"><Team /></RequireSection>} />
      </Route>
      <Route path="/admin/staff/:id/view-as" element={<RequireSection section="staff"><CompanionPreview /></RequireSection>} />
      <Route path="/admin/clients/:id/view-as" element={<RequireSection section="clients"><ClientPreview /></RequireSection>} />
      <Route path="/admin/clients/:id" element={<RequireSection section="clients"><ClientFile /></RequireSection>} />
      <Route path="/companion" element={<RequireRole role="companion"><CompanionApp /></RequireRole>} />
      <Route path="/client" element={<RequireRole role="family"><ClientApp /></RequireRole>} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
    <FormHost />
    <DeleteHost />
    <Toast />
    </>
  )
}
