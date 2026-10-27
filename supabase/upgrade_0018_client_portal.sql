-- 0018: the client (family) portal. A family member signs in and sees only their own parent's data.
-- Safe to run more than once.

-- Companion photo, shown to the family. Files live in the public bucket "staff-photos"; only admins can write.
alter table public.staff_members add column if not exists photo_path text;
insert into storage.buckets (id, name, public) values ('staff-photos', 'staff-photos', true) on conflict (id) do nothing;
drop policy if exists "staff photos admin write" on storage.objects;
create policy "staff photos admin write" on storage.objects for all to authenticated
  using (bucket_id = 'staff-photos' and public.is_admin())
  with check (bucket_id = 'staff-photos' and public.is_admin());

-- Families read their visits only through portal_data(), which leaves out internal notes. Drop the broad direct policy from 0007.
drop policy if exists "family tasks" on public.tasks;

-- A request can carry a category and a preferred date.
alter table public.service_requests add column if not exists category text;
alter table public.service_requests add column if not exists preferred_date date;

-- Conversation between the company and a client's family. One thread per client.
create table if not exists public.client_messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  from_family boolean not null,
  sender_id uuid references public.profiles (id) on delete set null default auth.uid(),
  sender_name text,
  body text not null check (length(btrim(body)) > 0 and length(body) <= 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists client_messages_client_idx on public.client_messages (client_id, created_at);
alter table public.client_messages enable row level security;
drop policy if exists "admin all" on public.client_messages;
create policy "admin all" on public.client_messages for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "family read thread" on public.client_messages;
create policy "family read thread" on public.client_messages for select to authenticated using (public.is_family_of(client_id));
drop policy if exists "family write thread" on public.client_messages;
create policy "family write thread" on public.client_messages for insert to authenticated
  with check (public.is_family_of(client_id) and from_family and sender_id = (select auth.uid()));

-- Admin: give a family contact a login (create the user in Supabase Authentication first), or take it away.
create or replace function public.set_family_access(p_email text, p_name text, p_contact_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare u uuid; existing text; contact_name text;
begin
  if not public.is_admin() then
    raise exception 'Not allowed' using errcode = 'insufficient_privilege';
  end if;
  select full_name into contact_name from public.family_contacts where id = p_contact_id and contact_type = 'family';
  if contact_name is null then
    raise exception 'Unknown contact' using errcode = 'no_data_found';
  end if;
  select id into u from auth.users where lower(email) = lower(btrim(p_email));
  if u is null then
    raise exception 'No user with that email' using errcode = 'no_data_found';
  end if;
  select role into existing from public.profiles where id = u;
  if existing is not null and existing <> 'family' then
    raise exception 'That account already has another role' using errcode = 'invalid_parameter_value';
  end if;
  insert into public.profiles (id, role, full_name, email)
  values (u, 'family', coalesce(nullif(btrim(p_name), ''), contact_name), lower(btrim(p_email)))
  on conflict (id) do update set email = excluded.email;
  update public.family_contacts set profile_id = u where id = p_contact_id;
end;
$$;

create or replace function public.remove_family_access(p_contact_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare u uuid;
begin
  if not public.is_admin() then
    raise exception 'Not allowed' using errcode = 'insufficient_privilege';
  end if;
  select profile_id into u from public.family_contacts where id = p_contact_id;
  update public.family_contacts set profile_id = null where id = p_contact_id;
  if u is not null and not exists (select 1 from public.family_contacts where profile_id = u)
     and exists (select 1 from public.profiles where id = u and role = 'family') then
    delete from public.profiles where id = u;
  end if;
end;
$$;

-- Everything the portal shows, in one call, limited to the caller's own clients and to fields a family may see
-- (no internal notes, no pay rates, no check-in times).
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
                        else jsonb_build_object('name', s.full_name, 'phone', s.phone, 'photo', s.photo_path) end,
      'contacts', (select coalesce(jsonb_agg(jsonb_build_object(
                     'id', f.id, 'name', f.full_name, 'relation', f.relation, 'phone', f.phone,
                     'type', f.contact_type, 'orderer', f.is_orderer) order by f.is_orderer desc, f.full_name), '[]'::jsonb)
                   from public.family_contacts f where f.client_id = c.id),
      'visits', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', t.id, 'date', t.scheduled_date, 'start', t.start_time, 'end', t.end_time,
                   'title', t.title, 'status', t.status, 'who', st.full_name, 'summary', vs.body)
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
                   from public.invoices i where i.client_id = c.id and i.billed_to = fc.id and i.status <> 'draft')
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

revoke execute on function public.set_family_access(text, text, uuid), public.remove_family_access(uuid), public.portal_data() from public, anon;
grant execute on function public.set_family_access(text, text, uuid), public.remove_family_access(uuid), public.portal_data() to authenticated;
