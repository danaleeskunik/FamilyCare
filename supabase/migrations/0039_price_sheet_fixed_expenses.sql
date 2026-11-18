-- 0039: one editable price sheet (plan fee, meetings, hours, extra-hour rate, evening/night %) that feeds the public site,
-- the client portal and the admin screens; plus travel per visit; plus monthly fixed expenses. Safe to run more than once.

create table if not exists public.price_sheet (
  id boolean primary key default true check (id),
  plans jsonb not null,
  evening_pct numeric(6, 1) not null default 130 check (evening_pct >= 100),
  night_pct numeric(6, 1) not null default 180 check (night_pct >= 100),
  updated_at timestamptz not null default now()
);
insert into public.price_sheet (id, plans) values (true, '[
  {"id":"basic","name":"Business","fee":2950,"meetings":4,"hours":2,"rate":368},
  {"id":"platinum","name":"Platinum","fee":8350,"meetings":8,"hours":3,"rate":347},
  {"id":"top_platinum","name":"Top Platinum","fee":15950,"meetings":12,"hours":4,"rate":332}
]'::jsonb) on conflict (id) do nothing;
alter table public.price_sheet enable row level security;
revoke all on public.price_sheet from anon;
drop policy if exists "admin all" on public.price_sheet;
create policy "admin all" on public.price_sheet for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- The public site and the portals read prices through this function only (no table access for anon).
create or replace function public.public_prices() returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object('plans', plans, 'evening_pct', evening_pct, 'night_pct', night_pct) from public.price_sheet where id
$$;
revoke execute on function public.public_prices() from public;
grant execute on function public.public_prices() to anon, authenticated;

-- Admin saves the whole sheet in one step. Keeps membership_plans and the pay settings in sync.
create or replace function public.save_price_sheet(p_plans jsonb, p_evening numeric, p_night numeric, p_wage numeric, p_travel numeric) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare r jsonb;
begin
  if not public.is_admin() then return false; end if;
  if jsonb_typeof(p_plans) <> 'array' or jsonb_array_length(p_plans) <> 3 then return false; end if;
  if p_evening < 100 or p_night < 100 or p_wage < 0 or p_travel < 0 then return false; end if;
  for r in select * from jsonb_array_elements(p_plans) loop
    if (r->>'fee')::numeric < 0 or (r->>'meetings')::numeric <= 0 or (r->>'hours')::numeric <= 0 or (r->>'rate')::numeric < 0 then return false; end if;
  end loop;
  update public.price_sheet set plans = p_plans, evening_pct = p_evening, night_pct = p_night, updated_at = now() where id;
  for r in select * from jsonb_array_elements(p_plans) loop
    update public.membership_plans set monthly_price = (r->>'fee')::numeric, monthly_sessions = (r->>'meetings')::int,
      hours_per_session = (r->>'hours')::numeric where id = r->>'id';
  end loop;
  update public.pricing_settings set companion_hourly_wage = p_wage, travel_per_workday = p_travel;
  return true;
end;
$$;
revoke execute on function public.save_price_sheet(jsonb, numeric, numeric, numeric, numeric) from public, anon;
grant execute on function public.save_price_sheet(jsonb, numeric, numeric, numeric, numeric) to authenticated;

-- Travel is now paid per visit: the starting value is 30 per visit.
update public.pricing_settings set travel_per_workday = 30 where travel_per_workday is null;

-- Monthly fixed expenses (refreshments, car, office, equipment, property tax, electricity, water, and free-text items).
create table if not exists public.fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(name) between 1 and 120),
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  created_at timestamptz not null default now()
);
alter table public.fixed_expenses enable row level security;
revoke all on public.fixed_expenses from anon;
drop policy if exists "admin all" on public.fixed_expenses;
create policy "admin all" on public.fixed_expenses for all to authenticated using (public.is_admin()) with check (public.is_admin());
