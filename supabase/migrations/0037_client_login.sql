-- 0037: a client's own login (is_self contact), smiley feedback from the family, and one-step visit report from the companion.
-- Safe to run more than once.

alter table public.family_contacts add column if not exists is_self boolean not null default false;

-- Family members (and the client) rate a visit; one row per person per visit is enforced by the app.
alter table public.task_feedback enable row level security;
drop policy if exists "family feedback insert" on public.task_feedback;
create policy "family feedback insert" on public.task_feedback for insert to authenticated
  with check (exists (select 1 from public.family_contacts f join public.tasks t on t.client_id = f.client_id
                      where t.id = task_id and f.id = given_by and f.profile_id = (select auth.uid())));
drop policy if exists "family feedback read" on public.task_feedback;
create policy "family feedback read" on public.task_feedback for select to authenticated
  using (exists (select 1 from public.family_contacts f where f.id = given_by and f.profile_id = (select auth.uid())));

-- The companion's end-of-visit report goes straight to the family and the office (no approval step).
create or replace function public.submit_visit_report(p_task uuid, p_body text, p_details jsonb) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare me uuid := public.my_staff_id();
begin
  if me is null or not exists (select 1 from public.tasks t where t.id = p_task and t.staff_id = me) then return false; end if;
  if length(btrim(coalesce(p_body, ''))) = 0 then return false; end if;
  insert into public.visit_summaries (task_id, author_id, body, details, status, approved_at, sent_at)
  values (p_task, me, p_body, coalesce(p_details, '{}'::jsonb), 'sent', now(), now())
  on conflict (task_id) do update set body = excluded.body, details = excluded.details, status = 'sent',
    approved_at = now(), sent_at = now(), updated_at = now()
  where public.visit_summaries.author_id = me;
  return true;
end;
$$;
revoke execute on function public.submit_visit_report(uuid, text, jsonb) from public, anon;
grant execute on function public.submit_visit_report(uuid, text, jsonb) to authenticated;

create or replace function public.portal_data() returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare uid uuid := (select auth.uid()); res jsonb;
begin
  if uid is null then return '[]'::jsonb; end if;
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
      'can_request', fc.permission = 'full',
      'is_self', fc.is_self,
      'companion', case when s.id is null then null
                        else jsonb_build_object('name', s.full_name, 'phone', s.phone, 'photo', s.photo_path, 'role', s.job_title) end,
      'contacts', (select coalesce(jsonb_agg(jsonb_build_object(
                     'id', f.id, 'name', f.full_name, 'relation', f.relation, 'phone', f.phone,
                     'type', f.contact_type, 'orderer', f.is_orderer) order by f.is_orderer desc, f.full_name), '[]'::jsonb)
                   from public.family_contacts f where f.client_id = c.id),
      'visits', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', t.id, 'date', t.scheduled_date, 'start', t.start_time, 'end', t.end_time,
                   'title', t.title, 'status', t.status, 'who', st.full_name, 'summary', vs.body, 'location', t.location, 'in_at', t.checked_in_at, 'out_at', t.checked_out_at,
                   'rating', (select tf.rating from public.task_feedback tf where tf.task_id = t.id and tf.given_by = fc.id limit 1))
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
                   from public.invoices i where i.client_id = c.id and i.billed_to = fc.id and i.status <> 'draft'),
      'quotes', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', qt.id, 'title', qt.title, 'vendor', qt.vendor_name, 'amount', qt.amount, 'note', qt.note,
                   'status', qt.status, 'created_at', qt.created_at, 'decided_at', qt.decided_at) order by qt.created_at desc), '[]'::jsonb)
                 from public.quotes qt where qt.client_id = c.id),
      'hints', (select coalesce(jsonb_agg(jsonb_build_object(
                  'id', h.id, 'body', h.body, 'task_id', h.task_id, 'created_at', h.created_at) order by h.created_at desc), '[]'::jsonb)
                from (select * from public.family_hints where client_id = c.id order by created_at desc limit 50) h)
    ) as x
    from public.family_contacts fc
    join public.clients c on c.id = fc.client_id
    left join public.membership_plans mp on mp.id = c.plan_id
    left join public.staff_members s on s.id = c.regular_companion_id
    where fc.profile_id = uid and fc.contact_type = 'family'
  ) q;
  return res;
end;
$$;

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
      'is_self', false,
      'companion', case when s.id is null then null
                        else jsonb_build_object('name', s.full_name, 'phone', s.phone, 'photo', s.photo_path, 'role', s.job_title) end,
      'contacts', (select coalesce(jsonb_agg(jsonb_build_object(
                     'id', f.id, 'name', f.full_name, 'relation', f.relation, 'phone', f.phone,
                     'type', f.contact_type, 'orderer', f.is_orderer) order by f.is_orderer desc, f.full_name), '[]'::jsonb)
                   from public.family_contacts f where f.client_id = c.id),
      'visits', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', t.id, 'date', t.scheduled_date, 'start', t.start_time, 'end', t.end_time,
                   'title', t.title, 'status', t.status, 'who', st.full_name, 'summary', vs.body, 'location', t.location, 'in_at', t.checked_in_at, 'out_at', t.checked_out_at,
                   'rating', (select tf.rating from public.task_feedback tf where tf.task_id = t.id and tf.given_by = fc.id limit 1))
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
                   from public.invoices i where i.client_id = c.id and i.billed_to = fc.id and i.status <> 'draft'),
      'quotes', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', qt.id, 'title', qt.title, 'vendor', qt.vendor_name, 'amount', qt.amount, 'note', qt.note,
                   'status', qt.status, 'created_at', qt.created_at, 'decided_at', qt.decided_at) order by qt.created_at desc), '[]'::jsonb)
                 from public.quotes qt where qt.client_id = c.id),
      'hints', (select coalesce(jsonb_agg(jsonb_build_object(
                  'id', h.id, 'body', h.body, 'task_id', h.task_id, 'created_at', h.created_at) order by h.created_at desc), '[]'::jsonb)
                from (select * from public.family_hints where client_id = c.id order by created_at desc limit 50) h)
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



revoke execute on function public.portal_data() from public, anon;
grant execute on function public.portal_data() to authenticated;
revoke execute on function public.portal_data_for(uuid) from public, anon;
grant execute on function public.portal_data_for(uuid) to authenticated;
