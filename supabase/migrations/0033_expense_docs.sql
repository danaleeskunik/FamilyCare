-- 0033: invoices / receipts collected for tax refunds. One row per scanned or uploaded document, file in a private bucket.
-- Admin only. captured_at (when it was scanned) drives the monthly grouping. Safe to run more than once.

create table if not exists public.expense_docs (
  id uuid primary key default gen_random_uuid(),
  captured_at timestamptz not null default now(),
  doc_date date,
  category text not null default 'לא מסווג',
  vendor text not null default '',
  amount numeric(12, 2),
  vat numeric(12, 2),
  note text not null default '' check (length(note) <= 2000),
  storage_path text not null,
  mime text,
  uploaded_by uuid default auth.uid() references public.profiles (id) on delete set null
);
create index if not exists expense_docs_captured_idx on public.expense_docs (captured_at desc);

alter table public.expense_docs enable row level security;
revoke all on public.expense_docs from anon;
drop policy if exists "admin all" on public.expense_docs;
create policy "admin all" on public.expense_docs for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public) values ('expense-docs', 'expense-docs', false) on conflict (id) do nothing;
drop policy if exists "expense docs admin" on storage.objects;
create policy "expense docs admin" on storage.objects for all to authenticated
  using (bucket_id = 'expense-docs' and public.is_admin())
  with check (bucket_id = 'expense-docs' and public.is_admin());
