-- 0016: the intake questionnaire ("שאלון קליטה, היכרות ומיפוי צרכים") per client, plus plan names as in the price sheet.
-- Safe to run more than once.

-- Answers that companions assigned to the client may read (life story, daily needs, home systems...).
create table if not exists public.client_intake (
  client_id uuid primary key references public.clients (id) on delete cascade,
  answers jsonb not null default '{}' check (jsonb_typeof(answers) = 'object'),
  updated_by uuid references public.profiles (id) on delete set null default auth.uid(),
  updated_at timestamptz not null default now()
);

-- Sensitive answers (ID number, door and alarm codes, spare key, WiFi password, payment method): admins only.
create table if not exists public.client_intake_private (
  client_id uuid primary key references public.clients (id) on delete cascade,
  answers jsonb not null default '{}' check (jsonb_typeof(answers) = 'object'),
  updated_by uuid references public.profiles (id) on delete set null default auth.uid(),
  updated_at timestamptz not null default now()
);

drop trigger if exists client_intake_updated on public.client_intake;
create trigger client_intake_updated before update on public.client_intake
  for each row execute function public.set_updated_at();
drop trigger if exists client_intake_private_updated on public.client_intake_private;
create trigger client_intake_private_updated before update on public.client_intake_private
  for each row execute function public.set_updated_at();

alter table public.client_intake enable row level security;
alter table public.client_intake_private enable row level security;
revoke all on public.client_intake, public.client_intake_private from anon;

drop policy if exists "admin all" on public.client_intake;
create policy "admin all" on public.client_intake for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "companion intake" on public.client_intake;
create policy "companion intake" on public.client_intake for select to authenticated
  using (public.companion_sees_client(client_id));

drop policy if exists "admin all" on public.client_intake_private;
create policy "admin all" on public.client_intake_private for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Plan names and meeting length as in the price sheet (prices are left as they are).
update public.membership_plans set name = 'Business', hours_per_session = 2 where id = 'basic';
update public.membership_plans set name = 'Platinum', hours_per_session = 3 where id = 'platinum';
update public.membership_plans set name = 'Top Platinum', hours_per_session = 4 where id = 'top_platinum';
