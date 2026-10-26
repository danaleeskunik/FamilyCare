-- Leads: people / families the office is talking to before they join the club.
-- Private to admins (RLS). Landing-page capture can be added later through a security-definer function.

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  phone text,
  email text,
  source text not null default 'manual' check (source in ('manual', 'landing', 'whatsapp', 'referral', 'other')),
  status text not null default 'new' check (status in ('new', 'talked', 'meeting', 'joined', 'not_relevant')),
  notes text not null default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.leads (status);
create index on public.leads (created_at desc);

create trigger leads_updated before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.leads enable row level security;
revoke all on public.leads from anon;
create policy "admin all" on public.leads for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
