import { Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Board from './pages/admin/Board'
import Vendors from './pages/admin/Vendors'
import Clients from './pages/admin/Clients'
import Staff from './pages/admin/Staff'
import Finance from './pages/admin/Finance'
import ClientFile from './pages/ClientFile'
import CompanionApp from './pages/CompanionApp'
import ClientApp from './pages/ClientApp'
import Calendar from './pages/admin/Calendar'
import FormHost, { DeleteHost, Toast } from './components/EntityForms'
import RequireRole, { HomeRedirect } from './components/RequireRole'
import Schedule from './pages/admin/Schedule'
import Planning from './pages/admin/Planning'
import StaffReport from './pages/admin/StaffReport'
import Login from './pages/Login'

// Role resolution (admin / companion / client) will come from auth; until then each surface has its own route.
export default function App() {
  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<RequireRole role="admin"><AdminLayout /></RequireRole>}>
        <Route index element={<Board />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="clients" element={<Clients />} />
        <Route path="staff" element={<Staff />} />
        <Route path="staff/:id" element={<StaffReport />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="planning" element={<Planning />} />
        <Route path="finance" element={<Finance />} />
        <Route path="calendar" element={<Calendar />} />
      </Route>
      <Route path="/admin/clients/:id" element={<RequireRole role="admin"><ClientFile /></RequireRole>} />
      <Route path="/companion" element={<RequireRole role="companion"><CompanionApp /></RequireRole>} />
      <Route path="/client" element={<ClientApp />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
    <FormHost />
    <DeleteHost />
    <Toast />
    </>
  )
}
