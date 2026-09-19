-- 0010: extra expenses a companion reports (e.g. bought food for themselves during a visit).
-- Companions add their own and see them; an admin approves or rejects. Approved ones count in payroll.

create table public.staff_expenses (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_members (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  expense_date date not null default current_date,
  amount numeric(10,2) not null check (amount > 0),
  description text not null check (length(btrim(description)) > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.staff_expenses (staff_id, expense_date);

alter table public.staff_expenses enable row level security;
revoke all on public.staff_expenses from anon;

create policy "admin all" on public.staff_expenses for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "companion own expenses read" on public.staff_expenses for select to authenticated
  using (staff_id = public.my_staff_id());
create policy "companion own expenses insert" on public.staff_expenses for insert to authenticated
  with check (staff_id = public.my_staff_id() and status = 'pending' and reviewed_by is null and reviewed_at is null);
-- A companion may withdraw an expense only while it is still pending.
create policy "companion own expenses delete" on public.staff_expenses for delete to authenticated
  using (staff_id = public.my_staff_id() and status = 'pending');
