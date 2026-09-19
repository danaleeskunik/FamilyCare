-- 0007: row level security. Default deny; anonymous users get nothing.
--   admin      : everything
--   companion  : only their assigned tasks / clients, their own summaries, receipts and incident reports
--   family     : only their own client's data, approved summaries, and (with full permission) new requests

do $$
declare t text;
begin
  foreach t in array array[
    'regions', 'membership_plans', 'pricing_settings', 'profiles', 'staff_members', 'staff_regions', 'staff_availability',
    'clients', 'family_contacts', 'client_medications', 'client_allergies', 'client_preferences', 'client_documents',
    'vendors', 'vendor_regions', 'vendor_price_items',
    'tasks', 'task_briefing_items', 'service_requests', 'visit_summaries', 'visit_summary_photos', 'receipts',
    'task_feedback', 'vendor_reviews', 'incidents', 'invoices', 'invoice_lines', 'payments'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Views: no access for anon.
revoke all on public.vendors_overview, public.invoice_totals, public.client_month_usage, public.staff_month_hours from anon;

-- Reference data is readable by any signed-in user.
create policy "read regions" on public.regions for select to authenticated using (true);
create policy "read plans" on public.membership_plans for select to authenticated using (true);

-- Everyone can read their own profile.
create policy "read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));

-- ---------- Companion ----------
create policy "companion own staff row" on public.staff_members for select to authenticated using (profile_id = (select auth.uid()));
create policy "companion own regions" on public.staff_regions for select to authenticated using (staff_id = public.my_staff_id());

create policy "companion clients" on public.clients for select to authenticated using (public.companion_sees_client(id));
create policy "companion client contacts" on public.family_contacts for select to authenticated using (public.companion_sees_client(client_id));
create policy "companion medications" on public.client_medications for select to authenticated using (public.companion_sees_client(client_id));
create policy "companion allergies" on public.client_allergies for select to authenticated using (public.companion_sees_client(client_id));
create policy "companion preferences" on public.client_preferences for select to authenticated using (public.companion_sees_client(client_id));

create policy "companion tasks" on public.tasks for select to authenticated using (staff_id = public.my_staff_id());
create policy "companion vendors on own tasks" on public.vendors for select to authenticated
  using (exists (select 1 from public.tasks t where t.vendor_id = vendors.id and t.staff_id = public.my_staff_id()));

create policy "companion briefing read" on public.task_briefing_items for select to authenticated
  using (exists (select 1 from public.tasks t where t.id = task_id and t.staff_id = public.my_staff_id()));
create policy "companion briefing tick" on public.task_briefing_items for update to authenticated
  using (exists (select 1 from public.tasks t where t.id = task_id and t.staff_id = public.my_staff_id()))
  with check (exists (select 1 from public.tasks t where t.id = task_id and t.staff_id = public.my_staff_id()));

-- Summaries: write only while draft / pending; approval is an admin action.
create policy "companion summaries read" on public.visit_summaries for select to authenticated using (author_id = public.my_staff_id());
create policy "companion summaries insert" on public.visit_summaries for insert to authenticated
  with check (author_id = public.my_staff_id() and status in ('draft', 'pending_approval')
              and exists (select 1 from public.tasks t where t.id = task_id and t.staff_id = public.my_staff_id()));
create policy "companion summaries update" on public.visit_summaries for update to authenticated
  using (author_id = public.my_staff_id() and status in ('draft', 'pending_approval'))
  with check (author_id = public.my_staff_id() and status in ('draft', 'pending_approval'));
create policy "companion summary photos" on public.visit_summary_photos for all to authenticated
  using (exists (select 1 from public.visit_summaries s where s.id = summary_id and s.author_id = public.my_staff_id() and s.status in ('draft', 'pending_approval')))
  with check (exists (select 1 from public.visit_summaries s where s.id = summary_id and s.author_id = public.my_staff_id() and s.status in ('draft', 'pending_approval')));

create policy "companion receipts read" on public.receipts for select to authenticated using (uploaded_by = public.my_staff_id());
create policy "companion receipts insert" on public.receipts for insert to authenticated with check (uploaded_by = public.my_staff_id());
create policy "companion incidents read" on public.incidents for select to authenticated using (reported_by = public.my_staff_id());
create policy "companion incidents insert" on public.incidents for insert to authenticated with check (reported_by = public.my_staff_id());

-- ---------- Family ----------
create policy "family client" on public.clients for select to authenticated using (public.is_family_of(id));
create policy "family contacts" on public.family_contacts for select to authenticated using (public.is_family_of(client_id));
create policy "family tasks" on public.tasks for select to authenticated using (public.is_family_of(client_id));
create policy "family summaries" on public.visit_summaries for select to authenticated
  using (status in ('approved', 'sent') and public.is_family_of(public.task_client(task_id)));
create policy "family summary photos" on public.visit_summary_photos for select to authenticated
  using (exists (select 1 from public.visit_summaries s
                 where s.id = summary_id and s.status in ('approved', 'sent') and public.is_family_of(public.task_client(s.task_id))));
create policy "family requests read" on public.service_requests for select to authenticated using (public.is_family_of(client_id));
create policy "family requests insert" on public.service_requests for insert to authenticated
  with check (public.family_can_request(client_id) and status = 'new' and task_id is null);
create policy "family invoices" on public.invoices for select to authenticated
  using (exists (select 1 from public.family_contacts f where f.id = billed_to and f.profile_id = (select auth.uid())));
create policy "family invoice lines" on public.invoice_lines for select to authenticated
  using (exists (select 1 from public.invoices i join public.family_contacts f on f.id = i.billed_to
                 where i.id = invoice_id and f.profile_id = (select auth.uid())));

-- Check-in/out RPCs are for signed-in users only.
revoke execute on function public.check_in(uuid), public.check_out(uuid) from public, anon;
grant execute on function public.check_in(uuid), public.check_out(uuid) to authenticated;
revoke execute on function public.is_admin(), public.my_staff_id(), public.companion_sees_client(uuid),
  public.is_family_of(uuid), public.family_can_request(uuid), public.task_client(uuid) from public, anon;
grant execute on function public.is_admin(), public.my_staff_id(), public.companion_sees_client(uuid),
  public.is_family_of(uuid), public.family_can_request(uuid), public.task_client(uuid) to authenticated;

-- ---------- Storage: private buckets, admin-only for now ----------
insert into storage.buckets (id, name, public) values
  ('client-documents', 'client-documents', false),
  ('visit-photos', 'visit-photos', false),
  ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "admin storage" on storage.objects for all to authenticated
  using (bucket_id in ('client-documents', 'visit-photos', 'receipts') and public.is_admin())
  with check (bucket_id in ('client-documents', 'visit-photos', 'receipts') and public.is_admin());
