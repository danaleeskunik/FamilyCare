-- 0012: the office planning board. Things the office must arrange well before a visit
-- (transport, tickets, a contractor, a doctor ...), with a status and who is handling it.

create table public.coordination_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,       -- the visit it is for, if any
  vendor_id uuid references public.vendors (id) on delete set null,   -- the contractor / taxi company used
  kind text not null check (kind in ('transport', 'tickets', 'contractor', 'doctor', 'other')),
  title text not null check (length(btrim(title)) > 0),
  event_date date not null,                                           -- when it happens
  due_date date,                                                      -- office must finish arranging by then
  assignee_id uuid references public.profiles (id) on delete set null, -- office person handling it
  status text not null default 'new' check (status in ('new', 'in_progress', 'ordered', 'done', 'cancelled')),
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  check (due_date is null or due_date <= event_date)
);
create index on public.coordination_items (event_date);
create index on public.coordination_items (client_id);
create index on public.coordination_items (assignee_id);
create index on public.coordination_items (status);

create trigger coordination_items_updated before update on public.coordination_items
  for each row execute function public.set_updated_at();

alter table public.coordination_items enable row level security;
revoke all on public.coordination_items from anon;
create policy "admin all" on public.coordination_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
