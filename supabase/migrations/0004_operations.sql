-- 0004: day-to-day operations: tasks, requests, visit summaries, receipts, feedback, incidents.

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  scheduled_date date not null,
  start_time time not null,
  end_time time,
  title text not null,
  region_id smallint references public.regions (id),
  staff_id uuid references public.staff_members (id) on delete set null,   -- companion
  vendor_id uuid references public.vendors (id) on delete set null,        -- contractor / taxi
  -- both null = "ללא שיבוץ"
  status text not null default 'planned'
    check (status in ('planned', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time is null or end_time > start_time),
  check (checked_out_at is null or checked_in_at is null or checked_out_at >= checked_in_at)
);
create index on public.tasks (scheduled_date);
create index on public.tasks (client_id, scheduled_date);
create index on public.tasks (staff_id, scheduled_date);
create index on public.tasks (vendor_id);
create index on public.tasks (region_id);

-- The checklist in the companion's visit briefing.
create table public.task_briefing_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  label text not null,
  is_done boolean not null default false,
  sort_order int not null default 0
);
create index on public.task_briefing_items (task_id);

-- "בקשות חדשות מהמשפחות": a family asks, an admin turns it into a task.
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  requested_by uuid references public.family_contacts (id) on delete set null,
  description text not null,
  status text not null default 'new' check (status in ('new', 'converted', 'declined')),
  task_id uuid references public.tasks (id) on delete set null,
  created_at timestamptz not null default now()
);
create index on public.service_requests (client_id);
create index on public.service_requests (status);

-- Every service closes with a written summary; an admin approves before the family sees it.
create table public.visit_summaries (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null unique references public.tasks (id) on delete cascade,
  author_id uuid references public.staff_members (id) on delete set null,
  body text not null default '',
  status text not null default 'draft' check (status in ('draft', 'pending_approval', 'approved', 'sent')),
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('draft', 'pending_approval') or approved_at is not null)
);
create index on public.visit_summaries (status);

-- Photos live in Storage bucket 'visit-photos'.
create table public.visit_summary_photos (
  id uuid primary key default gen_random_uuid(),
  summary_id uuid not null references public.visit_summaries (id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);
create index on public.visit_summary_photos (summary_id);

-- Scanned receipts (ארנק דיגיטלי). No task and no client yet = "ממתינות לשיוך".
create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  uploaded_by uuid references public.staff_members (id) on delete set null,
  amount numeric(10,2) not null check (amount >= 0),
  receipt_date date not null default current_date,
  storage_path text,                                      -- Storage bucket 'receipts'
  created_at timestamptz not null default now()
);
create index on public.receipts (client_id);
create index on public.receipts (task_id);

-- Family ratings of a visit ("דירוג איכות ממוצע").
create table public.task_feedback (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  given_by uuid references public.family_contacts (id) on delete set null,
  rating numeric(2,1) not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
create index on public.task_feedback (task_id);

-- Companion or family rating of a contractor job ("משובי איכות").
create table public.vendor_reviews (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  reviewer_type text not null check (reviewer_type in ('companion', 'family')),
  rating numeric(2,1) not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
create index on public.vendor_reviews (vendor_id);

-- "חריגות": a change in condition or a problem reported from the field.
create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  reported_by uuid references public.staff_members (id) on delete set null,
  description text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'investigating', 'closed')),
  family_notified boolean not null default false,
  reported_at timestamptz not null default now(),
  closed_at timestamptz
);
create index on public.incidents (client_id);
create index on public.incidents (status);
