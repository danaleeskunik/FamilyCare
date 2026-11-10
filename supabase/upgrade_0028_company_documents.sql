-- Run once in the Supabase SQL Editor. Safe to run more than once.
create table if not exists public.company_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles (id) on delete set null default auth.uid(),
  uploaded_at timestamptz not null default now()
);

alter table public.company_documents enable row level security;
revoke all on public.company_documents from anon;
drop policy if exists "admin all" on public.company_documents;
create policy "admin all" on public.company_documents for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public) values ('company-documents', 'company-documents', false) on conflict (id) do nothing;
drop policy if exists "company documents admin" on storage.objects;
create policy "company documents admin" on storage.objects for all to authenticated
  using (bucket_id = 'company-documents' and public.is_admin())
  with check (bucket_id = 'company-documents' and public.is_admin());
