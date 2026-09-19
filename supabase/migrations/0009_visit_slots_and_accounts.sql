-- 0009: recurring visit slots (what each client asked for), auto-generated tasks,
--       companion account linking, and moving billing fields out of `clients`.
-- Comments are ASCII on purpose (safe to paste anywhere).

-- ---------- Billing fields leave `clients` so companions (who may read clients) never see them ----------
create table public.client_billing (
  client_id uuid primary key references public.clients (id) on delete cascade,
  card_last4 text check (card_last4 ~ '^[0-9]{4}$'),
  monthly_budget_cap numeric(10,2) check (monthly_budget_cap >= 0)
);
insert into public.client_billing (client_id, card_last4, monthly_budget_cap)
select id, card_last4, monthly_budget_cap from public.clients
where card_last4 is not null or monthly_budget_cap is not null;
alter table public.clients drop column card_last4, drop column monthly_budget_cap;

-- ---------- Recurring slots ----------
create table public.client_visit_slots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),          -- 0 = Sunday (same as Postgres dow / JS getDay)
  start_time time not null,
  end_time time,
  purpose text not null default '',
  staff_id uuid references public.staff_members (id) on delete set null,
  valid_from date not null default current_date,
  valid_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time is null or end_time > start_time),
  check (valid_to is null or valid_to >= valid_from)
);
create index on public.client_visit_slots (client_id);
create index on public.client_visit_slots (staff_id);
create trigger client_visit_slots_updated before update on public.client_visit_slots
  for each row execute function public.set_updated_at();

-- Dates an admin deleted on purpose, so generation does not bring them back.
create table public.slot_skips (
  slot_id uuid not null references public.client_visit_slots (id) on delete cascade,
  day date not null,
  primary key (slot_id, day)
);

alter table public.tasks add column slot_id uuid references public.client_visit_slots (id) on delete set null;
create unique index tasks_slot_day_unique on public.tasks (slot_id, scheduled_date) where slot_id is not null;

-- ---------- Generation (idempotent) ----------
create function public.generate_tasks_from_slots(p_from date default current_date, p_to date default current_date + 30)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare n int;
begin
  -- auth.uid() is null for the scheduled job (postgres); signed-in callers must be admins.
  if (select auth.uid()) is not null and not public.is_admin() then
    raise exception 'Not allowed' using errcode = 'insufficient_privilege';
  end if;
  if p_to < p_from or p_to > p_from + 62 then
    raise exception 'Invalid range' using errcode = 'invalid_parameter_value';
  end if;

  with ins as (
    insert into public.tasks (client_id, scheduled_date, start_time, end_time, title, region_id, staff_id, status, slot_id)
    select s.client_id, d.day, s.start_time, s.end_time,
           coalesce(nullif(btrim(s.purpose), ''), 'ביקור'), c.region_id, s.staff_id, 'planned', s.id
    from public.client_visit_slots s
    join public.clients c on c.id = s.client_id and c.status = 'active'
    cross join lateral (select (p_from + g.i) as day from generate_series(0, p_to - p_from) as g(i)) d
    where s.is_active
      and extract(dow from d.day) = s.weekday
      and d.day >= s.valid_from
      and (s.valid_to is null or d.day <= s.valid_to)
      and not exists (select 1 from public.slot_skips k where k.slot_id = s.id and k.day = d.day)
    on conflict (slot_id, scheduled_date) where slot_id is not null do nothing
    returning 1
  )
  select count(*) into n from ins;
  return n;
end;
$$;

-- Deleting a generated future task remembers the date (unless the slot itself is being changed).
create function public.tasks_remember_skip() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.slot_id is not null and old.scheduled_date >= current_date
     and coalesce(current_setting('app.slot_sync', true), '') <> '1' then
    insert into public.slot_skips (slot_id, day) values (old.slot_id, old.scheduled_date) on conflict do nothing;
  end if;
  return old;
end;
$$;
create trigger tasks_remember_skip before delete on public.tasks
  for each row execute function public.tasks_remember_skip();

-- Editing a slot updates its future planned tasks, but only the fields nobody changed by hand.
create function public.slots_propagate() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare old_title text := coalesce(nullif(btrim(old.purpose), ''), 'ביקור');
        new_title text := coalesce(nullif(btrim(new.purpose), ''), 'ביקור');
begin
  perform set_config('app.slot_sync', '1', true);

  if not new.is_active or new.weekday <> old.weekday then
    -- gone or moved to another weekday: drop future planned visits; regeneration re-creates the moved ones
    delete from public.tasks
     where slot_id = new.id and status = 'planned' and checked_in_at is null and scheduled_date >= current_date;
  elsif new.valid_to is not null and new.valid_to is distinct from old.valid_to then
    delete from public.tasks
     where slot_id = new.id and status = 'planned' and checked_in_at is null and scheduled_date > new.valid_to;
  end if;

  update public.tasks t set
    start_time = case when t.start_time = old.start_time then new.start_time else t.start_time end,
    end_time   = case when t.end_time is not distinct from old.end_time then new.end_time else t.end_time end,
    title      = case when t.title = old_title then new_title else t.title end,
    staff_id   = case when t.staff_id is not distinct from old.staff_id then new.staff_id else t.staff_id end
   where t.slot_id = new.id and t.status = 'planned' and t.scheduled_date >= current_date;

  perform set_config('app.slot_sync', '', true);
  return new;
end;
$$;
create trigger client_visit_slots_propagate after update on public.client_visit_slots
  for each row execute function public.slots_propagate();

-- Deleting a slot removes its future planned visits (past and in-progress ones stay as history).
create function public.slots_before_delete() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform set_config('app.slot_sync', '1', true);
  delete from public.tasks
   where slot_id = old.id and status = 'planned' and checked_in_at is null and scheduled_date >= current_date;
  perform set_config('app.slot_sync', '', true);
  return old;
end;
$$;
create trigger client_visit_slots_before_delete before delete on public.client_visit_slots
  for each row execute function public.slots_before_delete();

-- ---------- Companion accounts ----------
alter table public.profiles add column if not exists email text;

create function public.link_staff_account(p_staff uuid, p_email text) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare u uuid; nm text; existing text;
begin
  if not public.is_admin() then
    raise exception 'Not allowed' using errcode = 'insufficient_privilege';
  end if;
  select id into u from auth.users where lower(email) = lower(btrim(p_email));
  if u is null then
    raise exception 'No user with that email' using errcode = 'no_data_found';
  end if;
  select role into existing from public.profiles where id = u;
  if existing = 'admin' then
    raise exception 'That account is an admin account' using errcode = 'invalid_parameter_value';
  end if;
  if exists (select 1 from public.staff_members where profile_id = u and id <> p_staff) then
    raise exception 'That account is already linked to another companion' using errcode = 'unique_violation';
  end if;
  select full_name into nm from public.staff_members where id = p_staff;
  insert into public.profiles (id, role, full_name, email)
  values (u, 'companion', coalesce(nm, ''), lower(btrim(p_email)))
  on conflict (id) do update set role = 'companion', full_name = excluded.full_name, email = excluded.email;
  update public.staff_members set profile_id = u where id = p_staff;
end;
$$;

create function public.unlink_staff_account(p_staff uuid) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed' using errcode = 'insufficient_privilege';
  end if;
  update public.staff_members set profile_id = null where id = p_staff;
end;
$$;

-- ---------- RLS ----------
alter table public.client_billing enable row level security;
alter table public.client_visit_slots enable row level security;
alter table public.slot_skips enable row level security;
revoke all on public.client_billing, public.client_visit_slots, public.slot_skips from anon;

create policy "admin all" on public.client_billing for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.client_visit_slots for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.slot_skips for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- Companions read the recurring requests of the clients they work with.
create policy "companion slots" on public.client_visit_slots for select to authenticated
  using (public.companion_sees_client(client_id));

revoke execute on function public.generate_tasks_from_slots(date, date), public.link_staff_account(uuid, text),
  public.unlink_staff_account(uuid) from public, anon;
grant execute on function public.generate_tasks_from_slots(date, date), public.link_staff_account(uuid, text),
  public.unlink_staff_account(uuid) to authenticated;

-- ---------- Optional nightly generation (the app also generates whenever an admin opens it) ----------
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('generate-visit-tasks', '0 1 * * *',
    'select public.generate_tasks_from_slots(current_date, current_date + 30)');
exception when others then
  raise notice 'pg_cron not enabled (%); the app generates visits when an admin opens it.', sqlerrm;
end;
$$;
