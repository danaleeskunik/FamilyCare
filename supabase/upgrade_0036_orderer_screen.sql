-- 0036: orderer (family) screen: price quotes to approve, direct hints to the companion, companion background and live visit times.
-- Safe to run more than once.

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  title text not null check (length(btrim(title)) > 0),
  vendor_name text,
  amount numeric(10, 2) not null check (amount >= 0),
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  decided_by uuid references public.family_contacts (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists quotes_client_idx on public.quotes (client_id, created_at desc);
alter table public.quotes enable row level security;
revoke all on public.quotes from anon;
drop policy if exists "admin all" on public.quotes;
create policy "admin all" on public.quotes for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "family read quotes" on public.quotes;
create policy "family read quotes" on public.quotes for select to authenticated using (public.is_family_of(client_id));

-- A family member with full permission approves or declines a quote (only while it is pending).
create or replace function public.decide_quote(p_quote uuid, p_approve boolean) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare q public.quotes; fc uuid;
begin
  select * into q from public.quotes where id = p_quote;
  if not found or q.status <> 'pending' then return false; end if;
  select f.id into fc from public.family_contacts f
    where f.client_id = q.client_id and f.profile_id = (select auth.uid()) and f.permission = 'full' and f.contact_type = 'family' limit 1;
  if fc is null then return false; end if;
  update public.quotes set status = case when p_approve then 'approved' else 'declined' end, decided_by = fc, decided_at = now() where id = p_quote;
  return true;
end;
$$;
revoke execute on function public.decide_quote(uuid, boolean) from public, anon;
grant execute on function public.decide_quote(uuid, boolean) to authenticated;

-- Direct hints from the family to the companion: general (no task) or for one visit.
create table if not exists public.family_hints (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete cascade,
  body text not null check (length(btrim(body)) > 0 and length(body) <= 2000),
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists family_hints_client_idx on public.family_hints (client_id, created_at desc);
alter table public.family_hints enable row level security;
revoke all on public.family_hints from anon;
drop policy if exists "admin all" on public.family_hints;
create policy "admin all" on public.family_hints for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "family read hints" on public.family_hints;
create policy "family read hints" on public.family_hints for select to authenticated using (public.is_family_of(client_id));
drop policy if exists "family write hints" on public.family_hints;
create policy "family write hints" on public.family_hints for insert to authenticated
  with check (public.family_can_request(client_id) and created_by = (select auth.uid()));
drop policy if exists "companion read hints" on public.family_hints;
create policy "companion read hints" on public.family_hints for select to authenticated using (public.companion_sees_client(client_id));

create or replace function public.portal_data() returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare uid uuid := (select auth.uid()); res jsonb;
begin
  if uid is null then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(q.x order by q.x ->> 'name'), '[]'::jsonb) into res
  from (
    select jsonb_build_object(
      'id', c.id,
      'name', c.full_name,
      'plan_id', c.plan_id,
      'plan_name', mp.name,
      'plan_fee', mp.monthly_price,
      'plan_sessions', mp.monthly_sessions,
      'plan_hours', mp.hours_per_session,
      'trial_ends_on', c.trial_ends_on,
      'my_contact_id', fc.id,
      'my_name', fc.full_name,
      'can_request', fc.permission = 'full',
      'companion', case when s.id is null then null
                        else jsonb_build_object('name', s.full_name, 'phone', s.phone, 'photo', s.photo_path, 'role', s.job_title) end,
      'contacts', (select coalesce(jsonb_agg(jsonb_build_object(
                     'id', f.id, 'name', f.full_name, 'relation', f.relation, 'phone', f.phone,
                     'type', f.contact_type, 'orderer', f.is_orderer) order by f.is_orderer desc, f.full_name), '[]'::jsonb)
                   from public.family_contacts f where f.client_id = c.id),
      'visits', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', t.id, 'date', t.scheduled_date, 'start', t.start_time, 'end', t.end_time,
                   'title', t.title, 'status', t.status, 'who', st.full_name, 'summary', vs.body, 'location', t.location, 'in_at', t.checked_in_at, 'out_at', t.checked_out_at)
                   order by t.scheduled_date desc, t.start_time desc), '[]'::jsonb)
                 from public.tasks t
                 left join public.staff_members st on st.id = t.staff_id
                 left join public.visit_summaries vs on vs.task_id = t.id and vs.status in ('approved', 'sent')
                 where t.client_id = c.id and t.status <> 'cancelled' and t.scheduled_date >= current_date - 365),
      'requests', (select coalesce(jsonb_agg(jsonb_build_object(
                     'id', r.id, 'description', r.description, 'category', r.category, 'status', r.status,
                     'preferred_date', r.preferred_date, 'created_at', r.created_at) order by r.created_at desc), '[]'::jsonb)
                   from (select * from public.service_requests where client_id = c.id order by created_at desc limit 100) r),
      'invoices', (select coalesce(jsonb_agg(jsonb_build_object(
                     'id', i.id, 'month', i.period_month, 'status', i.status,
                     'total', (select coalesce(sum(l.amount), 0) from public.invoice_lines l where l.invoice_id = i.id)
                   ) order by i.period_month desc), '[]'::jsonb)
                   from public.invoices i where i.client_id = c.id and i.billed_to = fc.id and i.status <> 'draft'),
      'quotes', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', qt.id, 'title', qt.title, 'vendor', qt.vendor_name, 'amount', qt.amount, 'note', qt.note,
                   'status', qt.status, 'created_at', qt.created_at, 'decided_at', qt.decided_at) order by qt.created_at desc), '[]'::jsonb)
                 from public.quotes qt where qt.client_id = c.id),
      'hints', (select coalesce(jsonb_agg(jsonb_build_object(
                  'id', h.id, 'body', h.body, 'task_id', h.task_id, 'created_at', h.created_at) order by h.created_at desc), '[]'::jsonb)
                from (select * from public.family_hints where client_id = c.id order by created_at desc limit 50) h)
    ) as x
    from public.family_contacts fc
    join public.clients c on c.id = fc.client_id
    left join public.membership_plans mp on mp.id = c.plan_id
    left join public.staff_members s on s.id = c.regular_companion_id
    where fc.profile_id = uid and fc.contact_type = 'family'
  ) q;
  return res;
end;
$$;

create or replace function public.portal_data_for(p_client_id uuid) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare uid uuid := (select auth.uid()); res jsonb;
begin
  if not public.is_admin() then
    raise exception 'Not allowed' using errcode = 'insufficient_privilege';
  end if;
  insert into public.portal_preview_log (admin_id, client_id) values (uid, p_client_id);
  select coalesce(jsonb_agg(q.x order by q.x ->> 'name'), '[]'::jsonb) into res
  from (
    select jsonb_build_object(
      'id', c.id,
      'name', c.full_name,
      'plan_id', c.plan_id,
      'plan_name', mp.name,
      'plan_fee', mp.monthly_price,
      'plan_sessions', mp.monthly_sessions,
      'plan_hours', mp.hours_per_session,
      'trial_ends_on', c.trial_ends_on,
      'my_contact_id', fc.id,
      'my_name', fc.full_name,
      'can_request', false,
      'companion', case when s.id is null then null
                        else jsonb_build_object('name', s.full_name, 'phone', s.phone, 'photo', s.photo_path, 'role', s.job_title) end,
      'contacts', (select coalesce(jsonb_agg(jsonb_build_object(
                     'id', f.id, 'name', f.full_name, 'relation', f.relation, 'phone', f.phone,
                     'type', f.contact_type, 'orderer', f.is_orderer) order by f.is_orderer desc, f.full_name), '[]'::jsonb)
                   from public.family_contacts f where f.client_id = c.id),
      'visits', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', t.id, 'date', t.scheduled_date, 'start', t.start_time, 'end', t.end_time,
                   'title', t.title, 'status', t.status, 'who', st.full_name, 'summary', vs.body, 'location', t.location, 'in_at', t.checked_in_at, 'out_at', t.checked_out_at)
                   order by t.scheduled_date desc, t.start_time desc), '[]'::jsonb)
                 from public.tasks t
                 left join public.staff_members st on st.id = t.staff_id
                 left join public.visit_summaries vs on vs.task_id = t.id and vs.status in ('approved', 'sent')
                 where t.client_id = c.id and t.status <> 'cancelled' and t.scheduled_date >= current_date - 365),
      'requests', (select coalesce(jsonb_agg(jsonb_build_object(
                     'id', r.id, 'description', r.description, 'category', r.category, 'status', r.status,
                     'preferred_date', r.preferred_date, 'created_at', r.created_at) order by r.created_at desc), '[]'::jsonb)
                   from (select * from public.service_requests where client_id = c.id order by created_at desc limit 100) r),
      'invoices', (select coalesce(jsonb_agg(jsonb_build_object(
                     'id', i.id, 'month', i.period_month, 'status', i.status,
                     'total', (select coalesce(sum(l.amount), 0) from public.invoice_lines l where l.invoice_id = i.id)
                   ) order by i.period_month desc), '[]'::jsonb)
                   from public.invoices i where i.client_id = c.id and i.billed_to = fc.id and i.status <> 'draft'),
      'quotes', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', qt.id, 'title', qt.title, 'vendor', qt.vendor_name, 'amount', qt.amount, 'note', qt.note,
                   'status', qt.status, 'created_at', qt.created_at, 'decided_at', qt.decided_at) order by qt.created_at desc), '[]'::jsonb)
                 from public.quotes qt where qt.client_id = c.id),
      'hints', (select coalesce(jsonb_agg(jsonb_build_object(
                  'id', h.id, 'body', h.body, 'task_id', h.task_id, 'created_at', h.created_at) order by h.created_at desc), '[]'::jsonb)
                from (select * from public.family_hints where client_id = c.id order by created_at desc limit 50) h)
    ) as x
    from public.clients c
    join lateral (select f.* from public.family_contacts f where f.client_id = c.id and f.contact_type = 'family' order by f.is_orderer desc, f.created_at limit 1) fc on true
    left join public.membership_plans mp on mp.id = c.plan_id
    left join public.staff_members s on s.id = c.regular_companion_id
    where c.id = p_client_id
  ) q;
  return res;
end;
$$;


revoke execute on function public.portal_data() from public, anon;
grant execute on function public.portal_data() to authenticated;
revoke execute on function public.portal_data_for(uuid) from public, anon;
grant execute on function public.portal_data_for(uuid) to authenticated;
