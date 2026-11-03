-- 0022: "משימות לטיפול": a shared to-do list for the owner and managers. Admin only. Safe to run more than once.

create table if not exists public.admin_todos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  details text,
  due_on date,
  done boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists admin_todos_open on public.admin_todos (done, due_on);

alter table public.admin_todos enable row level security;
revoke all on public.admin_todos from anon;
drop policy if exists "admin all" on public.admin_todos;
create policy "admin all" on public.admin_todos for all to authenticated using (public.is_admin()) with check (public.is_admin());
