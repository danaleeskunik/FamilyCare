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
