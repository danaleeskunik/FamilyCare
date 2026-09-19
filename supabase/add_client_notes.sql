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

-- ---- Notes and highlights (needs migration 0008) ----
insert into public.client_notes (id, client_id, kind, body) values
  (md5('note:1')::uuid, md5('client:sara')::uuid, 'highlight', 'לא לתאם ביקורים אחרי 19:00. להזכיר תורים יום מראש בשיחה, לא רק בהודעה.'),
  (md5('note:2')::uuid, md5('client:sara')::uuid, 'highlight', 'אלרגיה לפניצילין. במדרגות ללוות ולתת יד, במיוחד אחרי כאב הברך שדווח ב-15.9.'),
  (md5('note:3')::uuid, md5('client:sara')::uuid, 'note',      'אוהבת לספר על הנכדים. כדאי להקדיש כמה דקות לשיחה בתחילת הביקור.')
on conflict (id) do nothing;
