-- Run once in the Supabase SQL Editor. Safe to run more than once.
create table if not exists public.access_log (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete set null default auth.uid(),
  client_id uuid references public.clients (id) on delete cascade,
  action text not null check (action in ('view', 'export')),
  at timestamptz not null default now()
);
create index if not exists access_log_client_idx on public.access_log (client_id, at desc);

alter table public.access_log enable row level security;
revoke all on public.access_log from anon;
drop policy if exists "admin all" on public.access_log;
create policy "admin all" on public.access_log for all to authenticated using (public.is_admin()) with check (public.is_admin());
