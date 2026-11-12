-- 0029: candidate interviews for companions. One row per interview; answers (incl. 1-5 ratings) are JSON.
-- Admin only. A candidate is not a staff member yet, so there is no foreign key. Safe to run more than once.

create table if not exists public.staff_interviews (
  id uuid primary key default gen_random_uuid(),
  candidate_name text not null default '',
  interviewed_on date,
  decision text not null default '',
  answers jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.staff_interviews enable row level security;
revoke all on public.staff_interviews from anon;
drop policy if exists "admin all" on public.staff_interviews;
create policy "admin all" on public.staff_interviews for all to authenticated using (public.is_admin()) with check (public.is_admin());
