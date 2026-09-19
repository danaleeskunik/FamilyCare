-- 0002: what we know about each client (medical, preferences, legal documents).

create table public.client_medications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  dose text,
  schedule text,                                          -- בוקר וערב / פעם בשבוע …
  notes text,
  created_at timestamptz not null default now()
);
create index on public.client_medications (client_id);

create table public.client_allergies (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  allergen text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  unique (client_id, allergen)
);

create table public.client_preferences (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  category text not null check (category in ('food', 'culture', 'routine', 'companion')),
  title text not null,
  details text,
  created_at timestamptz not null default now()
);
create index on public.client_preferences (client_id, category);

-- Files live in Storage bucket 'client-documents'; this row is the index.
create table public.client_documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  kind text not null check (kind in ('power_of_attorney', 'medical_power_of_attorney', 'advance_directive', 'other')),
  title text not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles (id) on delete set null,
  uploaded_at timestamptz not null default now()
);
create index on public.client_documents (client_id);
