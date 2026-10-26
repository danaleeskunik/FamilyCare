-- 0015: (1) only the owner may delete clients, (2) a history of impressions per vendor.
-- Safe to run more than once.

-- ---------- 1. Owner ----------
alter table public.profiles add column if not exists is_owner boolean not null default false;

-- Alon Kunik is the owner.
update public.profiles p set is_owner = true
from auth.users u
where u.id = p.id and lower(u.email) = 'alonkunik@gmail.com';

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select p.is_owner and p.role = 'admin' from public.profiles p where p.id = (select auth.uid())), false);
$$;
revoke execute on function public.is_owner() from public, anon;
grant execute on function public.is_owner() to authenticated;

-- Clients: admins read, add and edit; only the owner deletes.
drop policy if exists "admin all" on public.clients;
drop policy if exists "admin read" on public.clients;
drop policy if exists "admin insert" on public.clients;
drop policy if exists "admin update" on public.clients;
drop policy if exists "owner delete" on public.clients;
create policy "admin read" on public.clients for select to authenticated using (public.is_admin());
create policy "admin insert" on public.clients for insert to authenticated with check (public.is_admin());
create policy "admin update" on public.clients for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "owner delete" on public.clients for delete to authenticated using (public.is_owner());

-- ---------- 2. Vendor impressions ----------
create table if not exists public.vendor_notes (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,       -- the job it is about, if any
  rating smallint check (rating between 1 and 5),
  note text not null check (length(btrim(note)) > 0),
  author_id uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists vendor_notes_vendor_idx on public.vendor_notes (vendor_id, created_at desc);

alter table public.vendor_notes enable row level security;
revoke all on public.vendor_notes from anon;
drop policy if exists "admin all" on public.vendor_notes;
create policy "admin all" on public.vendor_notes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
