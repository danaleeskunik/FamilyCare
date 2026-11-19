-- 0043: an admin can start, finish and report a visit on behalf of the companion who is assigned to it
-- (the "view as companion" screen). A companion still can only act on their own visits. Safe to run more than once.

create or replace function public.check_in(p_task uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.tasks
     set checked_in_at = coalesce(checked_in_at, now()), status = 'in_progress'
   where id = p_task and (staff_id = public.my_staff_id() or public.is_admin()) and status in ('planned', 'confirmed', 'in_progress');
  if not found then
    raise exception 'Task not found or not assigned to you' using errcode = 'insufficient_privilege';
  end if;
end;
$$;

create or replace function public.check_out(p_task uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.tasks
     set checked_out_at = now(), status = 'completed'
   where id = p_task and (staff_id = public.my_staff_id() or public.is_admin()) and checked_in_at is not null and checked_out_at is null;
  if not found then
    raise exception 'Task not found, not assigned to you, or not checked in' using errcode = 'insufficient_privilege';
  end if;
end;
$$;

create or replace function public.submit_visit_report(p_task uuid, p_body text, p_details jsonb, p_start text, p_end text) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare me uuid := public.my_staff_id(); t public.tasks; s timestamptz; e timestamptz;
begin
  select * into t from public.tasks where id = p_task;
  if not found then return false; end if;
  if me is null and public.is_admin() then me := t.staff_id; end if;   -- an admin reports as the assigned companion
  if me is null or t.staff_id is distinct from me then return false; end if;
  if length(btrim(coalesce(p_body, ''))) = 0 then return false; end if;
  s := (t.scheduled_date + p_start::time) at time zone 'Asia/Jerusalem';
  e := (t.scheduled_date + p_end::time) at time zone 'Asia/Jerusalem';
  if e <= s then return false; end if;
  update public.tasks set checked_in_at = s, checked_out_at = e, status = 'completed' where id = p_task;
  insert into public.visit_summaries (task_id, author_id, body, details, status, approved_at, sent_at)
  values (p_task, me, p_body, coalesce(p_details, '{}'::jsonb), 'sent', now(), now())
  on conflict (task_id) do update set body = excluded.body, details = excluded.details, status = 'sent',
    approved_at = now(), sent_at = now(), updated_at = now()
  where public.visit_summaries.author_id = me;
  perform public.notify_hours(me, t.client_id, t.scheduled_date, p_start, p_end, p_body, 'visit');
  return true;
end;
$$;
