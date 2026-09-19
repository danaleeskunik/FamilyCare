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
