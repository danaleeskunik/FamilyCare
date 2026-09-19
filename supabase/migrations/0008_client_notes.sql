-- 0008: notes and highlights for whoever accompanies the client.
-- kind 'highlight' = a point the companion must not miss (shown first); 'note' = general remark.

create table public.client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  kind text not null default 'highlight' check (kind in ('highlight', 'note')),
  body text not null check (length(btrim(body)) > 0),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.client_notes (client_id, kind);

create trigger client_notes_updated before update on public.client_notes
  for each row execute function public.set_updated_at();

alter table public.client_notes enable row level security;
revoke all on public.client_notes from anon;

create policy "admin all" on public.client_notes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
-- A companion reads the notes of clients they work with (regular companion or assigned task).
create policy "companion notes" on public.client_notes for select to authenticated
  using (public.companion_sees_client(client_id));
