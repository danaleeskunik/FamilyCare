-- FamilyCare schema. Run once in Supabase Dashboard -> SQL Editor.
-- Security model: RLS on everything, no anonymous access, only users whose profile role is 'admin' can read/write.
-- Companion and client policies will be added when those screens get real data.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'companion', 'client')),
  full_name text not null default ''
);

create table if not exists public.clients (
  id text primary key,
  name text not null,
  age int not null,
  area text not null,
  plan_tone text not null,
  plan_name text not null,
  used text not null,
  companion text,
  orderer text not null,
  next_visit text not null default '—',
  created_at timestamptz not null default now()
);

create table if not exists public.staff (
  id text primary key,
  name text not null,
  role text not null,
  areas text not null,
  langs text not null,
  regulars text not null default '—',
  hours text not null default '0:00',
  avail_tone text not null,
  avail_label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id text primary key,
  name text not null,
  field text not null,
  area text not null,
  price text not null,
  lic text not null,
  lic_bad boolean not null default false,
  rating text not null default '—',
  status_tone text not null,
  status_label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key,
  date date not null,
  time text not null,
  client text not null,
  task text not null,
  who text,
  status_tone text,
  status_label text,
  region text not null,
  created_at timestamptz not null default now()
);
create index if not exists tasks_date_idx on public.tasks (date);

-- Admin check. SECURITY DEFINER so it can read profiles without recursing into profiles' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'
  );
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.staff enable row level security;
alter table public.vendors enable row level security;
alter table public.tasks enable row level security;

-- No policy for anon anywhere, and no table grants either (defence in depth).
revoke all on public.profiles, public.clients, public.staff, public.vendors, public.tasks from anon;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

drop policy if exists "admin all" on public.clients;
create policy "admin all" on public.clients for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all" on public.staff;
create policy "admin all" on public.staff for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all" on public.vendors;
create policy "admin all" on public.vendors for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all" on public.tasks;
create policy "admin all" on public.tasks for all to authenticated using (public.is_admin()) with check (public.is_admin());
