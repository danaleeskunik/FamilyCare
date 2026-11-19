-- 0041: work a companion did that was not planned as a scheduled visit (an extra escort, an errand with a client, etc.).
-- The companion reports it (pending); an admin approves or rejects. Approved hours count in the month's hours and pay.
-- Safe to run more than once.

create table if not exists public.staff_activities (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_members (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  work_date date not null,
  start_time time not null,
  end_time time not null,
  description text not null check (length(btrim(description)) > 0),
  travel boolean not null default false,                    -- a trip to the client is paid like a visit
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);
create index if not exists staff_activities_staff_date on public.staff_activities (staff_id, work_date);

alter table public.staff_activities enable row level security;
revoke all on public.staff_activities from anon;

drop policy if exists "admin all" on public.staff_activities;
create policy "admin all" on public.staff_activities for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "companion own activities read" on public.staff_activities;
create policy "companion own activities read" on public.staff_activities for select to authenticated using (staff_id = public.my_staff_id());
drop policy if exists "companion own activities insert" on public.staff_activities;
create policy "companion own activities insert" on public.staff_activities for insert to authenticated
  with check (staff_id = public.my_staff_id() and status = 'pending' and reviewed_by is null and reviewed_at is null
              and (client_id is null or public.companion_sees_client(client_id)));
-- A companion may withdraw a report only while it is still pending.
drop policy if exists "companion own activities delete" on public.staff_activities;
create policy "companion own activities delete" on public.staff_activities for delete to authenticated
  using (staff_id = public.my_staff_id() and status = 'pending');
