-- 0038: the companion enters the real start and end time of the visit together with the summary.
-- The times feed the monthly hours and pay. Safe to run more than once.

drop function if exists public.submit_visit_report(uuid, text, jsonb);
create or replace function public.submit_visit_report(p_task uuid, p_body text, p_details jsonb, p_start text, p_end text) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare me uuid := public.my_staff_id(); t public.tasks; s timestamptz; e timestamptz;
begin
  select * into t from public.tasks where id = p_task and staff_id = me;
  if me is null or not found then return false; end if;
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
  return true;
end;
$$;
revoke execute on function public.submit_visit_report(uuid, text, jsonb, text, text) from public, anon;
grant execute on function public.submit_visit_report(uuid, text, jsonb, text, text) to authenticated;
