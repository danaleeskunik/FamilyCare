import type { Role } from '../store/AuthStore'

/** Admin app sections: tab id → route. */
export const SECTION_PATHS: Record<string, string> = {
  board: '/admin', vendors: '/admin/vendors', clients: '/admin/clients', staff: '/admin/staff', schedule: '/admin/schedule',
  planning: '/admin/planning', leads: '/admin/leads', finance: '/admin/finance', materials: '/admin/materials', team: '/admin/team',
}

/** Sections an admin can give to office staff today (each one needs matching database policies). */
export const OFFICE_SECTIONS: { id: string; label: string }[] = [{ id: 'leads', label: 'לידים' }, { id: 'materials', label: 'חומרים' }]

export const homeFor = (role: Role | null, sections: string[] = []) =>
  role === 'admin' ? '/admin'
    : role === 'companion' ? '/companion'
      : role === 'office' ? (sections.map((s) => SECTION_PATHS[s]).find(Boolean) ?? '/login')
        : '/login'

/** Roles that have an app to land in after signing in. */
export const hasHome = (role: Role | null) => role === 'admin' || role === 'companion' || role === 'office'
