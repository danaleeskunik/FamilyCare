import { Navigate, Route, Routes } from 'react-router-dom'
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
import RequireAdmin from './components/RequireAdmin'
import Login from './pages/Login'

// Role resolution (admin / companion / client) will come from auth; until then each surface has its own route.
export default function App() {
  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<Board />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="clients" element={<Clients />} />
        <Route path="staff" element={<Staff />} />
        <Route path="finance" element={<Finance />} />
        <Route path="calendar" element={<Calendar />} />
      </Route>
      <Route path="/admin/clients/:id" element={<RequireAdmin><ClientFile /></RequireAdmin>} />
      <Route path="/companion" element={<CompanionApp />} />
      <Route path="/client" element={<ClientApp />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
    <FormHost />
    <DeleteHost />
    <Toast />
    </>
  )
}
