-- 0001: reference data and people.
-- Conventions: uuid primary keys (gen_random_uuid), text + CHECK instead of enums (easy to evolve),
-- timestamptz for moments, FKs indexed, every table gets RLS in 0007.

create table public.regions (
  id smallint generated always as identity primary key,
  name text not null unique
);

create table public.membership_plans (
  id text primary key,                     -- 'basic' | 'platinum' | 'top_platinum'
  name text not null,                      -- display name (Hebrew)
  monthly_price numeric(10,2) not null check (monthly_price >= 0),
  monthly_sessions int not null check (monthly_sessions > 0),
  hours_per_session numeric(3,1),
  sort_order int not null default 0
);

-- Single-row table holding the pricing rules from the business plan.
create table public.pricing_settings (
  id boolean primary key default true check (id),
  companion_hourly_wage numeric(8,2) not null default 70,      -- twice minimum wage
  social_cost_factor numeric(4,2) not null default 1.3,        -- social benefits + national insurance
  travel_per_workday numeric(8,2) not null default 30,
  availability_surcharge_pct numeric(5,2) not null default 10, -- on contractor work
  management_fee_pct numeric(5,2) not null default 10,          -- on contractor work
  rep_first_hour numeric(8,2) not null default 300,             -- representative escort at contractor visits
  rep_additional_hour numeric(8,2) not null default 250
);

-- One row per login. Created by an admin; role decides what RLS lets the user see.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'companion', 'family')),
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now()
);

create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  full_name text not null,
  job_title text not null check (job_title in ('personal_companion', 'social_worker', 'student')),
  gender text check (gender in ('f', 'm')),               -- used for client gender preference matching
  phone text,
  languages text[] not null default '{}',
  hourly_wage numeric(8,2),                               -- null = use pricing_settings default
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_regions (
  staff_id uuid not null references public.staff_members (id) on delete cascade,
  region_id smallint not null references public.regions (id) on delete cascade,
  primary key (staff_id, region_id)
);
create index on public.staff_regions (region_id);

create table public.staff_availability (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_members (id) on delete cascade,
  day date not null,
  from_time time,
  to_time time,
  note text,
  check (to_time is null or from_time is null or to_time > from_time)
);
create index on public.staff_availability (staff_id, day);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_date date,
  gender text check (gender in ('f', 'm')),
  region_id smallint references public.regions (id),
  address text,
  phone text,
  building_code text,
  plan_id text references public.membership_plans (id),
  member_since date,
  trial_ends_on date,                                     -- non-null and in the future = "תקופת היכרות"
  status text not null default 'active' check (status in ('active', 'paused', 'ended')),
  case_manager_id uuid references public.profiles (id) on delete set null,
  regular_companion_id uuid references public.staff_members (id) on delete set null,
  dependency_level text check (dependency_level in ('independent', 'light', 'moderate', 'high')),
  mobility_notes text,
  cognitive_notes text,
  monthly_budget_cap numeric(10,2),                       -- family-set ceiling for extras beyond the membership fee
  card_last4 text check (card_last4 ~ '^[0-9]{4}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.clients (region_id);
create index on public.clients (plan_id);
create index on public.clients (regular_companion_id);

-- People around the client: family (with or without a login) and the treating physician.
create table public.family_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,   -- set when the person has a login
  contact_type text not null default 'family' check (contact_type in ('family', 'physician')),
  full_name text not null,
  relation text,                                          -- בת / בן / רופא מטפל …
  phone text,
  permission text not null default 'view_only' check (permission in ('full', 'view_only')),
  is_orderer boolean not null default false,              -- מזמין/ת השירות: orders services, receives invoices
  note text,
  created_at timestamptz not null default now()
);
create index on public.family_contacts (client_id);
create index on public.family_contacts (profile_id);
-- At most one orderer per client.
create unique index family_contacts_one_orderer on public.family_contacts (client_id) where is_orderer;
