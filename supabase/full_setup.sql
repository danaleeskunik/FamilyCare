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
-- 0003: vetted contractors (ספקים ובעלי מקצוע).

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trade text not null,                                    -- אינסטלציה / מיזוג אוויר / הסעות …
  contact_name text,
  phone text,
  license_expires_on date,
  insurance_expires_on date,
  is_active boolean not null default true,                -- manual off switch, separate from auto-freeze
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendor_regions (
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  region_id smallint not null references public.regions (id) on delete cascade,
  primary key (vendor_id, region_id)
);
create index on public.vendor_regions (region_id);

-- מחירון מוסכם: one row per agreed price ("ביקור 350", "שעה 280", "המתנה 111" …).
create table public.vendor_price_items (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  label text not null,
  amount numeric(10,2) not null check (amount >= 0),
  sort_order int not null default 0
);
create index on public.vendor_price_items (vendor_id);
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
-- 0005: billing. One invoice per client per month, made of typed lines.

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  billed_to uuid references public.family_contacts (id) on delete set null,   -- the orderer
  period_month date not null check (extract(day from period_month) = 1),      -- first day of the billed month
  status text not null default 'draft' check (status in ('draft', 'pending', 'paid', 'card_declined')),
  issued_at timestamptz,
  paid_at timestamptz,
  external_ref text,                                                          -- iCount document number
  created_at timestamptz not null default now(),
  unique (client_id, period_month)
);
create index on public.invoices (period_month);
create index on public.invoices (billed_to);

create table public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  kind text not null check (kind in (
    'membership', 'companion_overage', 'vendor_cost', 'availability_surcharge',
    'management_fee', 'representative_escort', 'transport', 'other')),
  description text not null,
  task_id uuid references public.tasks (id) on delete set null,
  amount numeric(10,2) not null,                                              -- negative allowed (credits)
  created_at timestamptz not null default now()
);
create index on public.invoice_lines (invoice_id);
create index on public.invoice_lines (task_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  status text not null check (status in ('pending', 'succeeded', 'failed')),
  method text not null default 'card',
  provider_ref text,
  attempted_at timestamptz not null default now()
);
create index on public.payments (invoice_id);
-- 0006: business rules in the database, helpers, and read-only views.

-- Keep updated_at fresh.
create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger staff_members_updated before update on public.staff_members for each row execute function public.set_updated_at();
create trigger clients_updated before update on public.clients for each row execute function public.set_updated_at();
create trigger vendors_updated before update on public.vendors for each row execute function public.set_updated_at();
create trigger tasks_updated before update on public.tasks for each row execute function public.set_updated_at();
create trigger visit_summaries_updated before update on public.visit_summaries for each row execute function public.set_updated_at();

-- A vendor is frozen when its licence or insurance has expired (or it is switched off).
create function public.vendor_is_frozen(v public.vendors) returns boolean
language sql
stable
set search_path = ''
as $$
  select not v.is_active
      or coalesce(v.license_expires_on < current_date, false)
      or coalesce(v.insurance_expires_on < current_date, false);
$$;

-- Rule: frozen vendors cannot be assigned to a task.
create function public.tasks_block_frozen_vendor() returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v public.vendors;
begin
  if new.vendor_id is not null and (tg_op = 'INSERT' or new.vendor_id is distinct from old.vendor_id) then
    select * into v from public.vendors where id = new.vendor_id;
    if found and public.vendor_is_frozen(v) then
      raise exception 'Vendor "%" is frozen (expired licence or insurance) and cannot be assigned', v.name
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;
create trigger tasks_block_frozen_vendor before insert or update of vendor_id on public.tasks
  for each row execute function public.tasks_block_frozen_vendor();

-- Rule: an approved summary needs an approver; stamp approval time automatically.
create function public.visit_summaries_stamp() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status in ('approved', 'sent') and new.approved_at is null then
    new.approved_at = now();
  end if;
  if new.status = 'sent' and new.sent_at is null then
    new.sent_at = now();
  end if;
  return new;
end;
$$;
create trigger visit_summaries_stamp before insert or update on public.visit_summaries
  for each row execute function public.visit_summaries_stamp();

-- Identity helpers for RLS. SECURITY DEFINER so they can read the tables their own policies protect.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

create function public.my_staff_id() returns uuid
language sql stable security definer set search_path = ''
as $$
  select id from public.staff_members where profile_id = (select auth.uid()) limit 1;
$$;

-- Companion may see a client if they are the regular companion or have a task with them.
create function public.companion_sees_client(c uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.my_staff_id() is not null and (
    exists (select 1 from public.clients where id = c and regular_companion_id = public.my_staff_id())
    or exists (select 1 from public.tasks where client_id = c and staff_id = public.my_staff_id())
  );
$$;

create function public.is_family_of(c uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.family_contacts
    where client_id = c and profile_id = (select auth.uid()) and contact_type = 'family'
  );
$$;

create function public.family_can_request(c uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.family_contacts
    where client_id = c and profile_id = (select auth.uid()) and permission = 'full'
  );
$$;

create function public.task_client(t uuid) returns uuid
language sql stable security definer set search_path = ''
as $$
  select client_id from public.tasks where id = t;
$$;

-- Companion check-in / check-out. Companions cannot update tasks directly; these are their only write path.
create function public.check_in(p_task uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.tasks
     set checked_in_at = coalesce(checked_in_at, now()), status = 'in_progress'
   where id = p_task and staff_id = public.my_staff_id() and status in ('planned', 'confirmed', 'in_progress');
  if not found then
    raise exception 'Task not found or not assigned to you' using errcode = 'insufficient_privilege';
  end if;
end;
$$;

create function public.check_out(p_task uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.tasks
     set checked_out_at = now(), status = 'completed'
   where id = p_task and staff_id = public.my_staff_id() and checked_in_at is not null and checked_out_at is null;
  if not found then
    raise exception 'Task not found, not assigned to you, or not checked in' using errcode = 'insufficient_privilege';
  end if;
end;
$$;

-- Views run with the caller's RLS (security_invoker), so they never widen access.
create view public.vendors_overview with (security_invoker = true) as
select v.*,
       public.vendor_is_frozen(v) as is_frozen,
       (select round(avg(r.rating), 1) from public.vendor_reviews r where r.vendor_id = v.id) as avg_rating,
       (select count(*) from public.vendor_reviews r where r.vendor_id = v.id) as review_count
from public.vendors v;

create view public.invoice_totals with (security_invoker = true) as
select i.id as invoice_id, i.client_id, i.period_month, i.status,
       coalesce(sum(l.amount), 0)::numeric(10,2) as total,
       coalesce(sum(l.amount) filter (where l.kind = 'membership'), 0)::numeric(10,2) as membership_total
from public.invoices i
left join public.invoice_lines l on l.invoice_id = i.id
group by i.id;

-- Sessions used per client per month vs the plan quota ("מפגשים 5 / 8").
create view public.client_month_usage with (security_invoker = true) as
select c.id as client_id,
       date_trunc('month', t.scheduled_date)::date as month,
       count(*) filter (where t.status = 'completed' and t.staff_id is not null) as sessions_used,
       p.monthly_sessions as sessions_quota
from public.clients c
join public.tasks t on t.client_id = c.id
left join public.membership_plans p on p.id = c.plan_id
group by c.id, date_trunc('month', t.scheduled_date), p.monthly_sessions;

-- Companion hours per month ("שעות החודש") from check-in/out.
create view public.staff_month_hours with (security_invoker = true) as
select t.staff_id,
       date_trunc('month', t.scheduled_date)::date as month,
       round(sum(extract(epoch from (t.checked_out_at - t.checked_in_at)) / 3600)::numeric, 2) as hours
from public.tasks t
where t.staff_id is not null and t.checked_in_at is not null and t.checked_out_at is not null
group by t.staff_id, date_trunc('month', t.scheduled_date);
-- 0007: row level security. Default deny; anonymous users get nothing.
--   admin      : everything
--   companion  : only their assigned tasks / clients, their own summaries, receipts and incident reports
--   family     : only their own client's data, approved summaries, and (with full permission) new requests

do $$
declare t text;
begin
  foreach t in array array[
    'regions', 'membership_plans', 'pricing_settings', 'profiles', 'staff_members', 'staff_regions', 'staff_availability',
    'clients', 'family_contacts', 'client_medications', 'client_allergies', 'client_preferences', 'client_documents',
    'vendors', 'vendor_regions', 'vendor_price_items',
    'tasks', 'task_briefing_items', 'service_requests', 'visit_summaries', 'visit_summary_photos', 'receipts',
    'task_feedback', 'vendor_reviews', 'incidents', 'invoices', 'invoice_lines', 'payments'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Views: no access for anon.
revoke all on public.vendors_overview, public.invoice_totals, public.client_month_usage, public.staff_month_hours from anon;

-- Reference data is readable by any signed-in user.
create policy "read regions" on public.regions for select to authenticated using (true);
create policy "read plans" on public.membership_plans for select to authenticated using (true);

-- Everyone can read their own profile.
create policy "read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));

-- ---------- Companion ----------
create policy "companion own staff row" on public.staff_members for select to authenticated using (profile_id = (select auth.uid()));
create policy "companion own regions" on public.staff_regions for select to authenticated using (staff_id = public.my_staff_id());

create policy "companion clients" on public.clients for select to authenticated using (public.companion_sees_client(id));
create policy "companion client contacts" on public.family_contacts for select to authenticated using (public.companion_sees_client(client_id));
create policy "companion medications" on public.client_medications for select to authenticated using (public.companion_sees_client(client_id));
create policy "companion allergies" on public.client_allergies for select to authenticated using (public.companion_sees_client(client_id));
create policy "companion preferences" on public.client_preferences for select to authenticated using (public.companion_sees_client(client_id));

create policy "companion tasks" on public.tasks for select to authenticated using (staff_id = public.my_staff_id());
create policy "companion vendors on own tasks" on public.vendors for select to authenticated
  using (exists (select 1 from public.tasks t where t.vendor_id = vendors.id and t.staff_id = public.my_staff_id()));

create policy "companion briefing read" on public.task_briefing_items for select to authenticated
  using (exists (select 1 from public.tasks t where t.id = task_id and t.staff_id = public.my_staff_id()));
create policy "companion briefing tick" on public.task_briefing_items for update to authenticated
  using (exists (select 1 from public.tasks t where t.id = task_id and t.staff_id = public.my_staff_id()))
  with check (exists (select 1 from public.tasks t where t.id = task_id and t.staff_id = public.my_staff_id()));

-- Summaries: write only while draft / pending; approval is an admin action.
create policy "companion summaries read" on public.visit_summaries for select to authenticated using (author_id = public.my_staff_id());
create policy "companion summaries insert" on public.visit_summaries for insert to authenticated
  with check (author_id = public.my_staff_id() and status in ('draft', 'pending_approval')
              and exists (select 1 from public.tasks t where t.id = task_id and t.staff_id = public.my_staff_id()));
create policy "companion summaries update" on public.visit_summaries for update to authenticated
  using (author_id = public.my_staff_id() and status in ('draft', 'pending_approval'))
  with check (author_id = public.my_staff_id() and status in ('draft', 'pending_approval'));
create policy "companion summary photos" on public.visit_summary_photos for all to authenticated
  using (exists (select 1 from public.visit_summaries s where s.id = summary_id and s.author_id = public.my_staff_id() and s.status in ('draft', 'pending_approval')))
  with check (exists (select 1 from public.visit_summaries s where s.id = summary_id and s.author_id = public.my_staff_id() and s.status in ('draft', 'pending_approval')));

create policy "companion receipts read" on public.receipts for select to authenticated using (uploaded_by = public.my_staff_id());
create policy "companion receipts insert" on public.receipts for insert to authenticated with check (uploaded_by = public.my_staff_id());
create policy "companion incidents read" on public.incidents for select to authenticated using (reported_by = public.my_staff_id());
create policy "companion incidents insert" on public.incidents for insert to authenticated with check (reported_by = public.my_staff_id());

-- ---------- Family ----------
create policy "family client" on public.clients for select to authenticated using (public.is_family_of(id));
create policy "family contacts" on public.family_contacts for select to authenticated using (public.is_family_of(client_id));
create policy "family tasks" on public.tasks for select to authenticated using (public.is_family_of(client_id));
create policy "family summaries" on public.visit_summaries for select to authenticated
  using (status in ('approved', 'sent') and public.is_family_of(public.task_client(task_id)));
create policy "family summary photos" on public.visit_summary_photos for select to authenticated
  using (exists (select 1 from public.visit_summaries s
                 where s.id = summary_id and s.status in ('approved', 'sent') and public.is_family_of(public.task_client(s.task_id))));
create policy "family requests read" on public.service_requests for select to authenticated using (public.is_family_of(client_id));
create policy "family requests insert" on public.service_requests for insert to authenticated
  with check (public.family_can_request(client_id) and status = 'new' and task_id is null);
create policy "family invoices" on public.invoices for select to authenticated
  using (exists (select 1 from public.family_contacts f where f.id = billed_to and f.profile_id = (select auth.uid())));
create policy "family invoice lines" on public.invoice_lines for select to authenticated
  using (exists (select 1 from public.invoices i join public.family_contacts f on f.id = i.billed_to
                 where i.id = invoice_id and f.profile_id = (select auth.uid())));

-- Check-in/out RPCs are for signed-in users only.
revoke execute on function public.check_in(uuid), public.check_out(uuid) from public, anon;
grant execute on function public.check_in(uuid), public.check_out(uuid) to authenticated;
revoke execute on function public.is_admin(), public.my_staff_id(), public.companion_sees_client(uuid),
  public.is_family_of(uuid), public.family_can_request(uuid), public.task_client(uuid) from public, anon;
grant execute on function public.is_admin(), public.my_staff_id(), public.companion_sees_client(uuid),
  public.is_family_of(uuid), public.family_can_request(uuid), public.task_client(uuid) to authenticated;

-- ---------- Storage: private buckets, admin-only for now ----------
insert into storage.buckets (id, name, public) values
  ('client-documents', 'client-documents', false),
  ('visit-photos', 'visit-photos', false),
  ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "admin storage" on storage.objects for all to authenticated
  using (bucket_id in ('client-documents', 'visit-photos', 'receipts') and public.is_admin())
  with check (bucket_id in ('client-documents', 'visit-photos', 'receipts') and public.is_admin());
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

-- ---- reference data ----
-- Required reference data (regions, plans, pricing rules). Safe to re-run.
insert into public.regions (name) values
  ('רמת השרון'), ('הרצליה'), ('צפון ת"א'), ('רעננה')
on conflict (name) do nothing;

insert into public.membership_plans (id, name, monthly_price, monthly_sessions, hours_per_session, sort_order) values
  ('basic', 'בסיסי', 1600, 4, null, 1),
  ('platinum', 'פלטינום', 3500, 8, 3, 2),
  ('top_platinum', 'טופ פלטינום', 10000, 12, null, 3)
on conflict (id) do nothing;

insert into public.pricing_settings (id) values (true) on conflict (id) do nothing;
