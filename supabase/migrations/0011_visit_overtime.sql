-- 0011: planned vs actual visit time. Extra time beyond the plan (after a grace period) can be
-- billed to the client (an invoice line) or waived by an admin. The companion is always paid for
-- actual hours (payroll uses check-in/out), so no separate pay record is needed here.

alter table public.pricing_settings
  add column if not exists overtime_grace_minutes int not null default 15 check (overtime_grace_minutes >= 0),
  add column if not exists overtime_first_hour numeric(8,2) not null default 300,       -- same rates as the invoice "1 + 2" example
  add column if not exists overtime_additional_hour numeric(8,2) not null default 250;

create table public.visit_overtime (
  task_id uuid primary key references public.tasks (id) on delete cascade,
  decision text not null check (decision in ('billed', 'waived')),
  overtime_minutes int not null check (overtime_minutes > 0),
  client_charge numeric(10,2) not null default 0 check (client_charge >= 0),
  invoice_line_id uuid references public.invoice_lines (id) on delete set null,
  decided_by uuid references public.profiles (id) on delete set null,
  decided_at timestamptz not null default now()
);

alter table public.visit_overtime enable row level security;
revoke all on public.visit_overtime from anon;
create policy "admin all" on public.visit_overtime for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Decide on a visit's overtime: p_bill = true bills the client (creates the month's draft invoice if needed).
create function public.decide_visit_overtime(p_task uuid, p_bill boolean) returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  t public.tasks;
  s public.pricing_settings;
  planned_min numeric;
  actual_min numeric;
  over_min numeric;
  charge numeric := 0;
  month_start date;
  inv public.invoices;
  line_id uuid;
  orderer uuid;
begin
  if not public.is_admin() then
    raise exception 'Not allowed' using errcode = 'insufficient_privilege';
  end if;
  select * into t from public.tasks where id = p_task;
  if not found then raise exception 'Task not found' using errcode = 'no_data_found'; end if;
  if t.end_time is null or t.checked_in_at is null or t.checked_out_at is null then
    raise exception 'Visit has no planned end or no actual times' using errcode = 'invalid_parameter_value';
  end if;
  if exists (select 1 from public.visit_overtime where task_id = p_task) then
    raise exception 'Already decided' using errcode = 'unique_violation';
  end if;
  select * into s from public.pricing_settings where id;

  planned_min := extract(epoch from (t.end_time - t.start_time)) / 60;
  actual_min := extract(epoch from (t.checked_out_at - t.checked_in_at)) / 60;
  over_min := round(actual_min - planned_min);
  if over_min < s.overtime_grace_minutes or over_min <= 0 then
    raise exception 'No billable overtime' using errcode = 'invalid_parameter_value';
  end if;

  if p_bill then
    charge := round(least(over_min, 60) / 60 * s.overtime_first_hour
                    + greatest(over_min - 60, 0) / 60 * s.overtime_additional_hour, 2);
    month_start := date_trunc('month', t.scheduled_date)::date;
    select * into inv from public.invoices where client_id = t.client_id and period_month = month_start;
    if not found then
      select id into orderer from public.family_contacts where client_id = t.client_id and is_orderer limit 1;
      insert into public.invoices (client_id, billed_to, period_month, status)
      values (t.client_id, orderer, month_start, 'draft') returning * into inv;
    elsif inv.status = 'paid' then
      raise exception 'Invoice already paid' using errcode = 'check_violation';
    end if;
    insert into public.invoice_lines (invoice_id, kind, description, task_id, amount)
    values (inv.id, 'companion_overage',
            'תוספת זמן ביקור ' || to_char(t.scheduled_date, 'DD.MM') || ' — ' || over_min::int || ' דק׳',
            t.id, charge)
    returning id into line_id;
  end if;

  insert into public.visit_overtime (task_id, decision, overtime_minutes, client_charge, invoice_line_id, decided_by)
  values (p_task, case when p_bill then 'billed' else 'waived' end, over_min::int, charge, line_id, (select auth.uid()));
  return charge;
end;
$$;

-- Undo a decision (removes the invoice line it created, unless the invoice was already paid).
create function public.revert_visit_overtime(p_task uuid) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare d public.visit_overtime; st text;
begin
  if not public.is_admin() then
    raise exception 'Not allowed' using errcode = 'insufficient_privilege';
  end if;
  select * into d from public.visit_overtime where task_id = p_task;
  if not found then return; end if;
  if d.invoice_line_id is not null then
    select i.status into st from public.invoice_lines l join public.invoices i on i.id = l.invoice_id where l.id = d.invoice_line_id;
    if st = 'paid' then
      raise exception 'Invoice already paid' using errcode = 'check_violation';
    end if;
    delete from public.invoice_lines where id = d.invoice_line_id;
  end if;
  delete from public.visit_overtime where task_id = p_task;
end;
$$;

revoke execute on function public.decide_visit_overtime(uuid, boolean), public.revert_visit_overtime(uuid) from public, anon;
grant execute on function public.decide_visit_overtime(uuid, boolean), public.revert_visit_overtime(uuid) to authenticated;
