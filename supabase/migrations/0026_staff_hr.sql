-- 0026: HR file for each companion, admin only. Free-text meeting notes + uploaded documents
-- (personal interview form, signed work contract, other forms). Safe to run more than once.

create table if not exists public.staff_hr_notes (
  staff_id uuid primary key references public.staff_members (id) on delete cascade,
  meeting_notes text not null default '' check (length(meeting_notes) <= 20000),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_documents (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_members (id) on delete cascade,
  kind text not null check (kind in ('interview', 'contract', 'other')),
  title text not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles (id) on delete set null,
  uploaded_at timestamptz not null default now()
);
create index if not exists staff_documents_staff_idx on public.staff_documents (staff_id);

do $$
declare t text;
begin
  foreach t in array array['staff_hr_notes', 'staff_documents'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Private bucket, admin only. Files are opened through short-lived signed links.
insert into storage.buckets (id, name, public) values ('staff-documents', 'staff-documents', false) on conflict (id) do nothing;
drop policy if exists "staff documents admin" on storage.objects;
create policy "staff documents admin" on storage.objects for all to authenticated
  using (bucket_id = 'staff-documents' and public.is_admin())
  with check (bucket_id = 'staff-documents' and public.is_admin());
