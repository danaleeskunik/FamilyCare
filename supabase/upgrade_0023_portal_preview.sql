-- 0023: "תצוגה כלקוח": an admin sees exactly what a client's family sees, read only. Every preview is logged. Safe to run more than once.

create table if not exists public.portal_preview_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles (id) on delete set null,
  client_id uuid references public.clients (id) on delete cascade,
  viewed_at timestamptz not null default now()
);
alter table public.portal_preview_log enable row level security;
revoke all on public.portal_preview_log from anon;
drop policy if exists "admin read" on public.portal_preview_log;
create policy "admin read" on public.portal_preview_log for select to authenticated using (public.is_admin());

create or replace function public.portal_data_for(p_client_id uuid) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare uid uuid := (select auth.uid()); res jsonb;
begin
  if not public.is_admin() then
    raise exception 'Not allowed' using errcode = 'insufficient_privilege';
  end if;
  insert into public.portal_preview_log (admin_id, client_id) values (uid, p_client_id);
  select coalesce(jsonb_agg(q.x order by q.x ->> 'name'), '[]'::jsonb) into res
  from (
    select jsonb_build_object(
      'id', c.id,
      'name', c.full_name,
      'plan_id', c.plan_id,
      'plan_name', mp.name,
      'plan_fee', mp.monthly_price,
      'plan_sessions', mp.monthly_sessions,
      'plan_hours', mp.hours_per_session,
      'trial_ends_on', c.trial_ends_on,
      'my_contact_id', fc.id,
      'my_name', fc.full_name,
      'can_request', false,
      'companion', case when s.id is null then null
                        else jsonb_build_object('name', s.full_name, 'phone', s.phone, 'photo', s.photo_path) end,
      'contacts', (select coalesce(jsonb_agg(jsonb_build_object(
                     'id', f.id, 'name', f.full_name, 'relation', f.relation, 'phone', f.phone,
                     'type', f.contact_type, 'orderer', f.is_orderer) order by f.is_orderer desc, f.full_name), '[]'::jsonb)
                   from public.family_contacts f where f.client_id = c.id),
      'visits', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', t.id, 'date', t.scheduled_date, 'start', t.start_time, 'end', t.end_time,
                   'title', t.title, 'status', t.status, 'who', st.full_name, 'summary', vs.body)
                   order by t.scheduled_date desc, t.start_time desc), '[]'::jsonb)
                 from public.tasks t
                 left join public.staff_members st on st.id = t.staff_id
                 left join public.visit_summaries vs on vs.task_id = t.id and vs.status in ('approved', 'sent')
                 where t.client_id = c.id and t.status <> 'cancelled' and t.scheduled_date >= current_date - 365),
      'requests', (select coalesce(jsonb_agg(jsonb_build_object(
                     'id', r.id, 'description', r.description, 'category', r.category, 'status', r.status,
                     'preferred_date', r.preferred_date, 'created_at', r.created_at) order by r.created_at desc), '[]'::jsonb)
                   from (select * from public.service_requests where client_id = c.id order by created_at desc limit 100) r),
      'invoices', (select coalesce(jsonb_agg(jsonb_build_object(
                     'id', i.id, 'month', i.period_month, 'status', i.status,
                     'total', (select coalesce(sum(l.amount), 0) from public.invoice_lines l where l.invoice_id = i.id)
                   ) order by i.period_month desc), '[]'::jsonb)
                   from public.invoices i where i.client_id = c.id and i.billed_to = fc.id and i.status <> 'draft')
    ) as x
    from public.clients c
    join lateral (select f.* from public.family_contacts f where f.client_id = c.id and f.contact_type = 'family' order by f.is_orderer desc, f.created_at limit 1) fc on true
    left join public.membership_plans mp on mp.id = c.plan_id
    left join public.staff_members s on s.id = c.regular_companion_id
    where c.id = p_client_id
  ) q;
  return res;
end;
$$;

revoke execute on function public.portal_data_for(uuid) from public, anon;
grant execute on function public.portal_data_for(uuid) to authenticated;
