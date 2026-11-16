-- 0035: companion visit report (structured details, expense receipt photo, external service request, own pay rates).
-- Safe to run more than once.

alter table public.visit_summaries add column if not exists details jsonb not null default '{}'::jsonb;

alter table public.staff_expenses add column if not exists category text;
alter table public.staff_expenses add column if not exists receipt_path text;
alter table public.staff_expenses add column if not exists client_id uuid references public.clients (id) on delete set null;

-- A companion uploads and reads receipt photos only inside a folder named after their own staff id.
drop policy if exists "companion receipts upload" on storage.objects;
create policy "companion receipts upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = public.my_staff_id()::text);
drop policy if exists "companion receipts read" on storage.objects;
create policy "companion receipts read" on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = public.my_staff_id()::text);

-- A companion can open an external-service request for a client they work with.
drop policy if exists "companion requests insert" on public.service_requests;
create policy "companion requests insert" on public.service_requests for insert to authenticated
  with check (public.companion_sees_client(client_id) and requested_by is null and status = 'new');

-- The companion's own hourly wage and travel allowance, without opening the whole pricing table.
create or replace function public.my_pay_rates() returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object('wage', coalesce(s.hourly_wage, p.companion_hourly_wage), 'travel', p.travel_per_workday)
  from public.staff_members s cross join public.pricing_settings p
  where s.id = public.my_staff_id() and p.id
$$;
revoke execute on function public.my_pay_rates() from public, anon;
grant execute on function public.my_pay_rates() to authenticated;
