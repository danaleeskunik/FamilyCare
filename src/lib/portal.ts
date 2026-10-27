import { supabase } from './supabase'

export type PortalContact = { id: string; name: string; relation: string | null; phone: string | null; type: 'family' | 'physician'; orderer: boolean }
export type PortalVisit = { id: string; date: string; start: string; end: string | null; title: string; status: string; who: string | null; summary: string | null }
export type PortalRequest = { id: string; description: string; category: string | null; status: 'new' | 'converted' | 'declined'; preferred_date: string | null; created_at: string }
export type PortalInvoice = { id: string; month: string; status: string; total: number }
export type PortalClient = {
  id: string; name: string; plan_id: string | null; plan_name: string | null; plan_fee: number | null; plan_sessions: number | null; plan_hours: number | null
  trial_ends_on: string | null; my_contact_id: string; my_name: string; can_request: boolean
  companion: { name: string; phone: string | null; photo: string | null } | null
  contacts: PortalContact[]; visits: PortalVisit[]; requests: PortalRequest[]; invoices: PortalInvoice[]
}
export type PortalMessage = { id: string; from_family: boolean; sender_name: string | null; body: string; created_at: string }

const missingFn = (e: { code?: string; message?: string } | null) => !!e && (['42883', 'PGRST202'].includes(e.code ?? '') || /could not find the function|does not exist/i.test(e.message ?? ''))

/** The signed-in family member's clients. `setup` = the 0018 migration has not been run yet. */
export async function loadPortal(): Promise<{ clients: PortalClient[]; setup: boolean; failed: boolean }> {
  const { data, error } = await supabase.rpc('portal_data')
  if (error) {
    console.error('portal load failed', error)
    return { clients: [], setup: missingFn(error), failed: !missingFn(error) }
  }
  return { clients: (data ?? []) as PortalClient[], setup: false, failed: false }
}

export async function loadMessages(clientId: string): Promise<PortalMessage[] | null> {
  const { data, error } = await supabase.from('client_messages').select('id, from_family, sender_name, body, created_at').eq('client_id', clientId).order('created_at', { ascending: true }).limit(300)
  if (error) { console.error('messages load failed', error); return null }
  return data as PortalMessage[]
}

export async function sendMessage(clientId: string, name: string, body: string): Promise<boolean> {
  const { data: u } = await supabase.auth.getUser()
  const { error } = await supabase.from('client_messages').insert({ client_id: clientId, from_family: true, sender_id: u.user?.id, sender_name: name, body: body.trim() })
  if (error) console.error('message send failed', error)
  return !error
}

export async function sendRequest(clientId: string, contactId: string, category: string, description: string, preferredDate: string): Promise<boolean> {
  const { error } = await supabase.from('service_requests').insert({
    client_id: clientId, requested_by: contactId, category, description: description.trim(), status: 'new', preferred_date: preferredDate || null,
  })
  if (error) console.error('request send failed', error)
  return !error
}

export const photoUrl = (path: string | null) => (path ? supabase.storage.from('staff-photos').getPublicUrl(path).data.publicUrl : null)
