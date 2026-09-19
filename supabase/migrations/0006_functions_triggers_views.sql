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
